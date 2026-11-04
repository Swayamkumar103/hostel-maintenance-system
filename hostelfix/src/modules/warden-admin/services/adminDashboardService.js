import connectDB from "@/lib/mongodb";
import Complaint from "@/module/complain";
import { getHostelFilterForUser } from "@/lib/roleAuth";
import { getComplaintSLAMetrics, getOverdueMongoFilter } from "@/lib/sla";
import { notifyWardenAndAdmins } from "@/lib/notifications";

/**
 * Fetch all statistics needed for the Admin/Warden dashboard.
 *
 * Returns:
 *  - cards           : count of complaints by status (total, submitted, assigned, etc.)
 *  - hostelStats     : per-hostel breakdown of total vs resolved complaints
 *  - priorityOverview: count per priority level (Urgent, High, Medium, Low)
 *  - statusDistribution: same as cards but keyed differently (used by charts)
 *  - recentComplaints: 5 latest complaints with SLA info
 */
export async function getDashboardStats(user) {
    await connectDB();

    // Scope the queries to only the hostels this user is allowed to see.
    // Admin gets all complaints; warden gets only their assigned hostel(s).
    const scopeFilter = getHostelFilterForUser(user);

    // --- Part 1: Count complaints by status ---
    // We run all 7 count queries in parallel (at the same time) for speed.
    // Each query adds the scope filter to ensure the user only sees their data.

    const [
        total,          // all complaints in scope
        submittedCount, // complaints that are "Submitted" or "Pending" (old name)
        assignedCount,  // complaints assigned to a technician
        inProgressCount, // complaints being worked on (or on hold)
        resolvedCount,  // complaints that are fixed
        closedCount,    // complaints confirmed closed
        escalatedCount, // complaints marked as escalated/urgent
    ] = await Promise.all([
        Complaint.countDocuments(scopeFilter),

        Complaint.countDocuments({
            ...scopeFilter,
            status: { $in: ["Submitted", "Pending"] }, // "Pending" is an old status name
        }),

        Complaint.countDocuments({
            ...scopeFilter,
            status: "Assigned",
        }),

        Complaint.countDocuments({
            ...scopeFilter,
            status: { $in: ["In Progress", "In progress", "On Hold"] }, // multiple spellings from old data
        }),

        Complaint.countDocuments({
            ...scopeFilter,
            status: { $in: ["Resolved", "Completed"] }, // "Completed" is an old status name
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

    // --- Part 2: Count overdue complaints ---
    // Overdue = complaint is still open but has exceeded its SLA time limit.
    const overdueFilter = {
        ...scopeFilter,
        ...getOverdueMongoFilter(), // e.g., Urgent complaints older than 24h that aren't resolved
    };
    const overdueCount = await Complaint.countDocuments(overdueFilter);

    // --- Part 3: Hostel-wise breakdown ---
    // For each hostel, count total complaints and how many are resolved vs pending.
    // $group groups documents by hostel; $cond is a conditional (like an if/else in MongoDB).
    const hostelAgg = await Complaint.aggregate([
        { $match: scopeFilter }, // only look at this user's scope
        {
            $group: {
                _id: "$hostel", // group by hostel name
                total: { $sum: 1 },
                resolved: {
                    $sum: {
                        // $cond is MongoDB's if/else: if status is in terminal list, count 1, else 0
                        $cond: [
                            { $in: ["$status", ["Resolved", "Completed", "Closed"]] },
                            1, // resolved
                            0, // not resolved
                        ],
                    },
                },
                pending: {
                    $sum: {
                        $cond: [
                            { $in: ["$status", ["Resolved", "Completed", "Closed"]] },
                            0, // resolved (not pending)
                            1, // still pending
                        ],
                    },
                },
            },
        },
        { $sort: { total: -1 } }, // show busiest hostel first
    ]);

    // Format the aggregation result into a plain array
    const hostelStats = hostelAgg.map((h) => ({
        hostel: h._id || "Unknown",
        total: h.total,
        resolved: h.resolved,
        pending: h.pending,
    }));

    // --- Part 4: Priority distribution ---
    // Count how many complaints are Urgent, High, Medium, Low.
    // $ifNull replaces null/undefined priority with "Medium" (default).
    const priorityAgg = await Complaint.aggregate([
        { $match: scopeFilter },
        {
            $group: {
                _id: { $ifNull: ["$priority", "Medium"] }, // default to "Medium" if priority is missing
                count: { $sum: 1 },
            },
        },
    ]);

    // Start with all priorities at 0, then fill in from the aggregation result
    const priorityOverview = { Urgent: 0, High: 0, Medium: 0, Low: 0 };
    for (const p of priorityAgg) {
        if (priorityOverview[p._id] !== undefined) {
            priorityOverview[p._id] = p.count;
        }
    }

    // --- Part 5: Status distribution (used by the pie chart) ---
    const statusDistribution = {
        Submitted: submittedCount,
        Assigned: assignedCount,
        "In Progress": inProgressCount,
        Resolved: resolvedCount,
        Closed: closedCount,
        Escalated: escalatedCount,
    };

    // --- Part 6: Recent complaints (5 latest) ---
    const recentDocs = await Complaint.find(scopeFilter)
        .populate("studentId", "name email mobile")
        .populate("assignedTechnician", "name specialization")
        .sort({ createdAt: -1 }) // newest first
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

    // --- Part 7: Fire-and-forget overdue notifications ---
    // If there are overdue complaints, send alerts to wardens/admins.
    // We do NOT await this — we kick it off in the background so the
    // dashboard response is not delayed. Errors are silently ignored.
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
            .catch(() => {}); // ignore errors — notifications are non-critical
    }

    // Return everything the dashboard needs
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
