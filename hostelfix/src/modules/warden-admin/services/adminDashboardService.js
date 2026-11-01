import connectDB from "@/lib/mongodb";
import Complaint from "@/module/complain";
import { getHostelFilterForUser } from "@/lib/roleAuth";
import { getComplaintSLAMetrics, getOverdueMongoFilter } from "@/lib/sla";
import { notifyWardenAndAdmins } from "@/lib/notifications";

/**
 * Fetch aggregated dashboard analytics scoped to authorized user.
 */
export async function getDashboardStats(user) {
    await connectDB();

    const scopeFilter = getHostelFilterForUser(user);

    // 1. Core status counts
    const [
        total,
        submittedCount,
        assignedCount,
        inProgressCount,
        resolvedCount,
        closedCount,
        escalatedCount,
    ] = await Promise.all([
        Complaint.countDocuments(scopeFilter),
        Complaint.countDocuments({
            ...scopeFilter,
            status: { $in: ["Submitted", "Pending"] },
        }),
        Complaint.countDocuments({
            ...scopeFilter,
            status: "Assigned",
        }),
        Complaint.countDocuments({
            ...scopeFilter,
            status: { $in: ["In Progress", "In progress", "On Hold"] },
        }),
        Complaint.countDocuments({
            ...scopeFilter,
            status: { $in: ["Resolved", "Completed"] },
        }),
        Complaint.countDocuments({
            ...scopeFilter,
            status: "Closed",
        }),
        Complaint.countDocuments({
            ...scopeFilter,
            $or: [{ status: "Escalated" }, { isEscalated: true }],
        }),
    ]);

    // 2. Overdue count via SLA calculation
    const overdueFilter = {
        ...scopeFilter,
        ...getOverdueMongoFilter(),
    };
    const overdueCount = await Complaint.countDocuments(overdueFilter);

    // 3. Hostel-wise complaint breakdown
    const hostelAgg = await Complaint.aggregate([
        { $match: scopeFilter },
        {
            $group: {
                _id: "$hostel",
                total: { $sum: 1 },
                resolved: {
                    $sum: {
                        $cond: [
                            { $in: ["$status", ["Resolved", "Completed", "Closed"]] },
                            1,
                            0,
                        ],
                    },
                },
                pending: {
                    $sum: {
                        $cond: [
                            { $in: ["$status", ["Resolved", "Completed", "Closed"]] },
                            0,
                            1,
                        ],
                    },
                },
            },
        },
        { $sort: { total: -1 } },
    ]);

    const hostelStats = hostelAgg.map((h) => ({
        hostel: h._id || "Unknown",
        total: h.total,
        resolved: h.resolved,
        pending: h.pending,
    }));

    // 4. Priority breakdown
    const priorityAgg = await Complaint.aggregate([
        { $match: scopeFilter },
        {
            $group: {
                _id: { $ifNull: ["$priority", "Medium"] },
                count: { $sum: 1 },
            },
        },
    ]);

    const priorityOverview = {
        Urgent: 0,
        High: 0,
        Medium: 0,
        Low: 0,
    };
    for (const p of priorityAgg) {
        if (priorityOverview[p._id] !== undefined) {
            priorityOverview[p._id] = p.count;
        }
    }

    // 5. Status distribution
    const statusDistribution = {
        Submitted: submittedCount,
        Assigned: assignedCount,
        "In Progress": inProgressCount,
        Resolved: resolvedCount,
        Closed: closedCount,
        Escalated: escalatedCount,
    };

    // 6. Recent complaints (5 latest)
    const recentDocs = await Complaint.find(scopeFilter)
        .populate("studentId", "name email mobile")
        .populate("assignedTechnician", "name specialization")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

    const recentComplaints = recentDocs.map((c) => {
        const sla = getComplaintSLAMetrics(c);
        return {
            _id: c._id.toString(),
            title: c.title,
            hostel: c.hostel,
            roomNumber: c.roomNumber,
            category: c.category,
            priority: c.priority || "Medium",
            status: c.status,
            studentName: c.studentId?.name || "Student",
            assignedTechnicianName: c.assignedTechnician?.name || null,
            createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : null,
            isOverdue: sla?.isOverdue || false,
            isEscalated: c.isEscalated || c.status === "Escalated",
        };
    });

    // 7. Background trigger: Check and record overdue notifications if any overdue complaints exist
    if (overdueCount > 0) {
        Complaint.find(overdueFilter)
            .limit(10)
            .lean()
            .then((overdues) => {
                for (const oc of overdues) {
                    notifyWardenAndAdmins({
                        hostel: oc.hostel,
                        complaintId: oc._id,
                        title: `SLA Overdue: Complaint in ${oc.hostel} (${oc.priority || "Medium"})`,
                        message: `Complaint "${oc.title}" in room ${oc.roomNumber} has breached its ${oc.priority || "Medium"} SLA.`,
                        type: "complaint_overdue",
                        eventKeyPrefix: `overdue_${oc._id}_${oc.priority || "Medium"}`,
                    });
                }
            })
            .catch(() => {});
    }

    return {
        cards: {
            total,
            submitted: submittedCount,
            assigned: assignedCount,
            inProgress: inProgressCount,
            resolved: resolvedCount,
            closed: closedCount,
            escalated: escalatedCount,
            overdue: overdueCount,
        },
        hostelStats,
        priorityOverview,
        statusDistribution,
        recentComplaints,
    };
}
