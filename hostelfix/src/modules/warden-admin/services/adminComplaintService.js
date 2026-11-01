import connectDB from "@/lib/mongodb";
import Complaint from "@/module/complain";
import User from "@/module/User";
import { Types } from "mongoose";
import { getHostelFilterForUser, canUserAccessComplaint } from "@/lib/roleAuth";
import { getComplaintSLAMetrics, getOverdueMongoFilter } from "@/lib/sla";
import { VALID_STATUS_TRANSITIONS, STATUS_CANONICAL_MAP, PRIORITIES } from "@/lib/constants";
import { recordHistory, getComplaintTimeline } from "./auditService";
import { notifyStudent, notifyTechnician, notifyWardenAndAdmins } from "@/lib/notifications";

/**
 * List complaints with filters, search, sorting and pagination.
 */
export async function listComplaints({
    user,
    page = 1,
    limit = 10,
    hostel = null,
    category = null,
    priority = null,
    status = null,
    technicianId = null,
    escalated = null,
    overdue = null,
    search = "",
    sortBy = "createdAt",
    sortOrder = "desc",
}) {
    await connectDB();

    const baseScope = getHostelFilterForUser(user);
    const filter = { ...baseScope };

    // Hostel filter (must be within warden's allowed scope)
    if (hostel && hostel !== "All") {
        if (user.role === "warden") {
            const allowed = Array.isArray(user.assignedHostels) && user.assignedHostels.length > 0
                ? user.assignedHostels
                : user.hostel
                    ? [user.hostel]
                    : [];
            if (allowed.includes(hostel)) {
                filter.hostel = hostel;
            }
        } else {
            filter.hostel = hostel;
        }
    }

    if (category && category !== "All") {
        filter.category = category;
    }

    if (priority && priority !== "All") {
        filter.priority = priority;
    }

    if (status && status !== "All") {
        if (status === "Submitted") {
            filter.status = { $in: ["Submitted", "Pending"] };
        } else if (status === "In Progress") {
            filter.status = { $in: ["In Progress", "In progress", "On Hold"] };
        } else if (status === "Resolved") {
            filter.status = { $in: ["Resolved", "Completed"] };
        } else {
            filter.status = status;
        }
    }

    if (technicianId && technicianId !== "All") {
        if (Types.ObjectId.isValid(technicianId)) {
            const techObjId = new Types.ObjectId(technicianId);
            filter.$or = [
                { assignedTechnician: techObjId },
                { assignedTechician: techObjId },
            ];
        }
    }

    if (escalated === true || escalated === "true") {
        filter.$or = [{ isEscalated: true }, { status: "Escalated" }];
    }

    if (overdue === true || overdue === "true") {
        const overdueFilter = getOverdueMongoFilter();
        if (filter.$or) {
            filter.$and = [{ $or: filter.$or }, overdueFilter];
            delete filter.$or;
        } else {
            Object.assign(filter, overdueFilter);
        }
    }

    // Search by student name or complaint title/room
    let studentIdsToMatch = [];
    if (search && search.trim()) {
        const term = search.trim();
        // If search looks like an ObjectId, search by _id
        if (Types.ObjectId.isValid(term)) {
            filter._id = new Types.ObjectId(term);
        } else {
            // Find students matching name or email
            const matchedStudents = await User.find({
                role: "student",
                $or: [
                    { name: { $regex: term, $options: "i" } },
                    { email: { $regex: term, $options: "i" } },
                ],
            }).select("_id").lean();

            studentIdsToMatch = matchedStudents.map((s) => s._id);

            const searchConditions = [
                { title: { $regex: term, $options: "i" } },
                { description: { $regex: term, $options: "i" } },
                { roomNumber: { $regex: term, $options: "i" } },
                { category: { $regex: term, $options: "i" } },
            ];

            if (studentIdsToMatch.length > 0) {
                searchConditions.push({ studentId: { $in: studentIdsToMatch } });
            }

            if (filter.$or) {
                filter.$and = [{ $or: filter.$or }, { $or: searchConditions }];
                delete filter.$or;
            } else {
                filter.$or = searchConditions;
            }
        }
    }

    // Sorting
    const sort = {};
    if (sortBy === "priority") {
        // Custom priority sorting handled or mapped
        sort.priority = sortOrder === "asc" ? 1 : -1;
    } else {
        sort[sortBy || "createdAt"] = sortOrder === "asc" ? 1 : -1;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [total, docs] = await Promise.all([
        Complaint.countDocuments(filter),
        Complaint.find(filter)
            .populate("studentId", "name email mobile")
            .populate("assignedTechnician", "name email mobile specialization")
            .sort(sort)
            .skip(skip)
            .limit(limitNum)
            .lean(),
    ]);

    const complaints = docs.map((c) => {
        const sla = getComplaintSLAMetrics(c);
        return {
            _id: c._id.toString(),
            id: c._id.toString(),
            title: c.title,
            description: c.description,
            hostel: c.hostel,
            roomNumber: c.roomNumber,
            category: c.category,
            priority: c.priority || "Medium",
            status: c.status,
            student: {
                id: c.studentId?._id?.toString() || null,
                name: c.studentId?.name || "Unknown",
                email: c.studentId?.email || "",
                mobile: c.studentId?.mobile || "",
            },
            assignedTechnician: c.assignedTechnician
                ? {
                    id: c.assignedTechnician._id?.toString(),
                    name: c.assignedTechnician.name,
                    specialization: c.assignedTechnician.specialization || "General",
                    mobile: c.assignedTechnician.mobile,
                }
                : null,
            scheduledDate: c.scheduledDate ? new Date(c.scheduledDate).toISOString() : null,
            completedAt: c.completedAt ? new Date(c.completedAt).toISOString() : null,
            isEscalated: c.isEscalated || c.status === "Escalated",
            escalationReason: c.escalationReason || null,
            workNotes: c.workNotes || "",
            resolutionNotes: c.resolutionNotes || "",
            sla,
            createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : null,
            updatedAt: c.updatedAt ? new Date(c.updatedAt).toISOString() : null,
        };
    });

    return {
        complaints,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        limit: limitNum,
    };
}

/**
 * Get detailed complaint with full audit timeline.
 */
export async function getComplaintDetail({ user, complaintId }) {
    if (!complaintId || !Types.ObjectId.isValid(complaintId)) {
        return { success: false, status: 400, message: "Invalid complaint ID." };
    }

    await connectDB();
    const complaint = await Complaint.findById(complaintId)
        .populate("studentId", "name email mobile hostel")
        .populate("assignedTechnician", "name email mobile specialization emplyeedId")
        .populate("escalatedBy", "name role")
        .populate("closedBy", "name role")
        .lean();

    if (!complaint) {
        return { success: false, status: 404, message: "Complaint not found." };
    }

    // Role-based scoping / IDOR protection
    if (!canUserAccessComplaint(user, complaint)) {
        return {
            success: false,
            status: 403,
            message: "Access denied. You do not have permission to view complaints for this hostel.",
        };
    }

    const isStudent = user.role === "student";
    const timeline = await getComplaintTimeline(complaint._id, isStudent);
    const sla = getComplaintSLAMetrics(complaint);

    return {
        success: true,
        status: 200,
        complaint: {
            ...complaint,
            _id: complaint._id.toString(),
            id: complaint._id.toString(),
            studentId: complaint.studentId
                ? {
                    id: complaint.studentId._id.toString(),
                    name: complaint.studentId.name,
                    email: complaint.studentId.email,
                    mobile: complaint.studentId.mobile,
                }
                : null,
            assignedTechnician: complaint.assignedTechnician
                ? {
                    id: complaint.assignedTechnician._id.toString(),
                    name: complaint.assignedTechnician.name,
                    email: complaint.assignedTechnician.email,
                    mobile: complaint.assignedTechnician.mobile,
                    specialization: complaint.assignedTechnician.specialization || "General",
                    employeeId: complaint.assignedTechnician.emplyeedId || "N/A",
                }
                : null,
            escalatedBy: complaint.escalatedBy
                ? { name: complaint.escalatedBy.name, role: complaint.escalatedBy.role }
                : null,
            closedBy: complaint.closedBy
                ? { name: complaint.closedBy.name, role: complaint.closedBy.role }
                : null,
            timeline,
            sla,
            createdAt: complaint.createdAt ? new Date(complaint.createdAt).toISOString() : null,
            updatedAt: complaint.updatedAt ? new Date(complaint.updatedAt).toISOString() : null,
            completedAt: complaint.completedAt ? new Date(complaint.completedAt).toISOString() : null,
            closedAt: complaint.closedAt ? new Date(complaint.closedAt).toISOString() : null,
        },
    };
}

/**
 * Update complaint priority.
 */
export async function updatePriority({ user, complaintId, priority, reason = "" }) {
    if (!complaintId || !Types.ObjectId.isValid(complaintId)) {
        return { success: false, status: 400, message: "Invalid complaint ID." };
    }

    if (!PRIORITIES.includes(priority)) {
        return {
            success: false,
            status: 400,
            message: `Invalid priority. Must be one of: ${PRIORITIES.join(", ")}.`,
        };
    }

    await connectDB();
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
        return { success: false, status: 404, message: "Complaint not found." };
    }

    if (!canUserAccessComplaint(user, complaint)) {
        return {
            success: false,
            status: 403,
            message: "Access denied. Cannot update complaints outside your assigned hostel.",
        };
    }

    const oldPriority = complaint.priority || "Medium";
    if (oldPriority === priority) {
        return { success: true, message: "Priority is already set to this value.", complaint };
    }

    complaint.priority = priority;
    await complaint.save();

    await recordHistory({
        complaintId: complaint._id,
        action: "priority_changed",
        oldValue: oldPriority,
        newValue: priority,
        remarks: reason || `Priority changed from ${oldPriority} to ${priority}`,
        performedBy: user._id,
        performedByName: user.name || "Warden/Admin",
        performedByRole: user.role,
        isStudentVisible: true,
    });

    return {
        success: true,
        status: 200,
        message: `Priority successfully updated to ${priority}.`,
        complaint,
    };
}

/**
 * Assign or reassign a technician.
 */
export async function assignTechnician({
    user,
    complaintId,
    technicianId,
    reason = "",
    scheduledDate = null,
}) {
    if (!complaintId || !Types.ObjectId.isValid(complaintId)) {
        return { success: false, status: 400, message: "Invalid complaint ID." };
    }

    if (!technicianId || !Types.ObjectId.isValid(technicianId)) {
        return { success: false, status: 400, message: "Invalid technician ID." };
    }

    await connectDB();
    const [complaint, technician] = await Promise.all([
        Complaint.findById(complaintId),
        User.findById(technicianId),
    ]);

    if (!complaint) {
        return { success: false, status: 404, message: "Complaint not found." };
    }

    if (!canUserAccessComplaint(user, complaint)) {
        return {
            success: false,
            status: 403,
            message: "Access denied. Cannot manage complaints outside your assigned hostel.",
        };
    }

    if (!technician || technician.role !== "technician") {
        return {
            success: false,
            status: 400,
            message: "Assigned user must be a valid active technician.",
        };
    }

    if (technician.accountStatus === "rejected") {
        return {
            success: false,
            status: 400,
            message: "Cannot assign to an inactive or rejected technician account.",
        };
    }

    const previousTechId = complaint.assignedTechnician || complaint.assignedTechician;
    const isReassignment = previousTechId && previousTechId.toString() !== technician._id.toString();

    let oldTechName = "Unassigned";
    if (previousTechId) {
        const oldTech = await User.findById(previousTechId).select("name").lean();
        if (oldTech) oldTechName = oldTech.name;
    }

    complaint.assignedTechnician = technician._id;
    complaint.assignedTechician = technician._id;

    if (scheduledDate) {
        complaint.scheduledDate = new Date(scheduledDate);
        complaint.schduledDate = new Date(scheduledDate);
    }

    // Advance status to Assigned if currently Submitted / Pending
    const isInitialAssignment = ["Submitted", "Pending"].includes(complaint.status);
    if (isInitialAssignment) {
        complaint.status = "Assigned";
    }

    await complaint.save();

    // Log history
    const action = isReassignment ? "reassigned" : "assigned";
    const historyRemarks = reason
        ? reason
        : isReassignment
            ? `Reassigned from ${oldTechName} to ${technician.name}`
            : `Assigned to technician ${technician.name}`;

    await recordHistory({
        complaintId: complaint._id,
        action,
        oldValue: previousTechId ? oldTechName : null,
        newValue: technician.name,
        remarks: historyRemarks,
        performedBy: user._id,
        performedByName: user.name || "Warden/Admin",
        performedByRole: user.role,
        isStudentVisible: true,
    });

    // Notify assigned technician
    await notifyTechnician({
        technicianId: technician._id,
        complaintId: complaint._id,
        title: `New Maintenance Task: ${complaint.title}`,
        message: `You have been assigned to complaint in ${complaint.hostel}, room ${complaint.roomNumber}.`,
        type: "technician_assigned",
        eventKey: `tech_assigned_${complaint._id}_${technician._id}_${Date.now()}`,
    });

    // Notify student
    await notifyStudent({
        studentId: complaint.studentId,
        complaintId: complaint._id,
        title: isReassignment ? "Technician Reassigned" : "Technician Assigned",
        message: `Technician ${technician.name} (${technician.specialization || "General"}) has been assigned to your complaint.`,
        type: isReassignment ? "technician_reassigned" : "technician_assigned",
        eventKey: `student_assigned_${complaint._id}_${technician._id}`,
    });

    return {
        success: true,
        status: 200,
        message: `Successfully ${action} complaint to ${technician.name}.`,
        complaint,
    };
}

/**
 * Escalate an unresolved complaint with a mandatory reason.
 */
export async function escalateComplaint({ user, complaintId, reason }) {
    if (!complaintId || !Types.ObjectId.isValid(complaintId)) {
        return { success: false, status: 400, message: "Invalid complaint ID." };
    }

    if (!reason || typeof reason !== "string" || reason.trim().length < 5) {
        return {
            success: false,
            status: 400,
            message: "A mandatory escalation reason of at least 5 characters is required.",
        };
    }

    await connectDB();
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
        return { success: false, status: 404, message: "Complaint not found." };
    }

    if (!canUserAccessComplaint(user, complaint)) {
        return {
            success: false,
            status: 403,
            message: "Access denied. Cannot escalate complaints outside your assigned hostel.",
        };
    }

    if (["Resolved", "Completed", "Closed"].includes(complaint.status)) {
        return {
            success: false,
            status: 400,
            message: "Cannot escalate a resolved or closed complaint.",
        };
    }

    const previousStatus = complaint.status;
    complaint.isEscalated = true;
    complaint.status = "Escalated";
    complaint.escalationReason = reason.trim();
    complaint.escalatedAt = new Date();
    complaint.escalatedBy = user._id;

    // Escalate priority to Urgent if not already
    complaint.priority = "Urgent";

    await complaint.save();

    await recordHistory({
        complaintId: complaint._id,
        action: "escalated",
        oldValue: previousStatus,
        newValue: "Escalated (Urgent)",
        remarks: reason.trim(),
        performedBy: user._id,
        performedByName: user.name || "Warden/Admin",
        performedByRole: user.role,
        isStudentVisible: true,
    });

    // Notify all admins and wardens
    await notifyWardenAndAdmins({
        hostel: complaint.hostel,
        complaintId: complaint._id,
        title: `ESCALATED: Complaint in ${complaint.hostel} #${complaint._id.toString().slice(-6)}`,
        message: `Escalated by ${user.name}: "${reason.trim()}"`,
        type: "complaint_escalated",
        eventKeyPrefix: `escalated_${complaint._id}_${Date.now()}`,
    });

    // Notify assigned technician if present
    const techId = complaint.assignedTechnician || complaint.assignedTechician;
    if (techId) {
        await notifyTechnician({
            technicianId: techId,
            complaintId: complaint._id,
            title: `Complaint Escalated to Urgent: ${complaint.title}`,
            message: `Reason: ${reason.trim()}`,
            type: "complaint_escalated",
        });
    }

    return {
        success: true,
        status: 200,
        message: "Complaint has been successfully escalated.",
        complaint,
    };
}

/**
 * Update complaint status enforcing lifecycle transitions.
 */
export async function updateComplaintStatus({
    user,
    complaintId,
    status: requestedStatus,
    remarks = "",
    resolutionNotes = "",
}) {
    if (!complaintId || !Types.ObjectId.isValid(complaintId)) {
        return { success: false, status: 400, message: "Invalid complaint ID." };
    }

    const canonicalTarget = STATUS_CANONICAL_MAP[requestedStatus];
    if (!canonicalTarget) {
        return {
            success: false,
            status: 400,
            message: `Invalid status "${requestedStatus}".`,
        };
    }

    await connectDB();
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
        return { success: false, status: 404, message: "Complaint not found." };
    }

    if (!canUserAccessComplaint(user, complaint)) {
        return {
            success: false,
            status: 403,
            message: "Access denied. Cannot update complaints outside your assigned hostel.",
        };
    }

    const canonicalCurrent = STATUS_CANONICAL_MAP[complaint.status] || complaint.status;

    // Check if target status is allowed
    const allowedTargets = VALID_STATUS_TRANSITIONS[canonicalCurrent] || [];
    if (!allowedTargets.includes(canonicalTarget) && canonicalCurrent !== canonicalTarget) {
        return {
            success: false,
            status: 400,
            message: `Invalid status transition from "${canonicalCurrent}" to "${canonicalTarget}". Allowed transitions: [${allowedTargets.join(", ")}].`,
        };
    }

    // Role restrictions for specific transitions
    if (canonicalTarget === "Closed" && user.role !== "admin" && user.role !== "warden" && user.role !== "student") {
        return {
            success: false,
            status: 403,
            message: "Only wardens, admins, or the student can close a resolved complaint.",
        };
    }

    const oldStatus = complaint.status;
    complaint.status = canonicalTarget;

    if (canonicalTarget === "Resolved") {
        complaint.completedAt = new Date();
        if (resolutionNotes) {
            complaint.resolutionNotes = resolutionNotes;
            complaint.workNotes = resolutionNotes;
        }
    } else if (canonicalTarget === "Closed") {
        complaint.closedAt = new Date();
        complaint.closedBy = user._id;
    } else if (canonicalTarget === "In Progress" && canonicalCurrent === "Closed") {
        // Re-opened
        complaint.closedAt = null;
        complaint.closedBy = null;
    }

    await complaint.save();

    const action = canonicalTarget === "Resolved"
        ? "resolved"
        : canonicalTarget === "Closed"
            ? "closed"
            : canonicalCurrent === "Closed"
                ? "reopened"
                : "status_changed";

    await recordHistory({
        complaintId: complaint._id,
        action,
        oldValue: oldStatus,
        newValue: canonicalTarget,
        remarks: remarks || resolutionNotes || `Status transitioned from ${oldStatus} to ${canonicalTarget}`,
        performedBy: user._id,
        performedByName: user.name || "User",
        performedByRole: user.role,
        isStudentVisible: true,
    });

    // Notify student about status change
    await notifyStudent({
        studentId: complaint.studentId,
        complaintId: complaint._id,
        title: `Complaint Status: ${canonicalTarget}`,
        message: `Your complaint "${complaint.title}" has been updated to "${canonicalTarget}".`,
        type: canonicalTarget === "Resolved"
            ? "complaint_resolved"
            : canonicalTarget === "Closed"
                ? "complaint_closed"
                : "status_updated",
        eventKey: `status_${complaint._id}_${canonicalTarget}_${Date.now()}`,
    });

    return {
        success: true,
        status: 200,
        message: `Complaint status updated to ${canonicalTarget}.`,
        complaint,
    };
}
