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
 *
 * This is the main query function used in the complaints list page.
 * It builds a MongoDB filter step-by-step based on the user's role and chosen filters.
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

    // --- Step 1: Start with the user's scope (restricts warden to their hostel(s)) ---
    const filter = { ...getHostelFilterForUser(user) };

    // --- Step 2: Hostel dropdown filter ---
    if (hostel && hostel !== "All") {
        if (user.role === "warden") {
            // Wardens can only filter within their own assigned hostels
            const allowedHostels = Array.isArray(user.assignedHostels) && user.assignedHostels.length > 0
                ? user.assignedHostels
                : user.hostel
                    ? [user.hostel]
                    : [];

            if (allowedHostels.includes(hostel)) {
                filter.hostel = hostel;
            }
        } else {
            filter.hostel = hostel; // admin can filter by any hostel
        }
    }

    // --- Step 3: Category filter ---
    if (category && category !== "All") {
        filter.category = category;
    }

    // --- Step 4: Priority filter ---
    if (priority && priority !== "All") {
        filter.priority = priority;
    }

    // --- Step 5: Status filter ---
    // Some statuses have variants in the database (old data), so we match multiple values.
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

    // --- Step 6: Technician filter ---
    // Note: "assignedTechician" (one 'n') is a legacy typo field kept for backward compatibility with old DB records.
    if (technicianId && technicianId !== "All") {
        if (Types.ObjectId.isValid(technicianId)) {
            const techObjId = new Types.ObjectId(technicianId);
            filter.$or = [
                { assignedTechnician: techObjId }, // current field (correct spelling)
                { assignedTechician: techObjId },   // legacy typo field (backward compat)
            ];
        }
    }

    // --- Step 7: Escalated filter ---
    if (escalated === true || escalated === "true") {
        filter.$or = [{ isEscalated: true }, { status: "Escalated" }];
    }

    // --- Step 8: Overdue filter ---
    // Overdue filter uses $or internally. If the main filter already has $or (from step 6 or 7),
    // we must combine them using $and to avoid overwriting one of the $or conditions.
    if (overdue === true || overdue === "true") {
        const overdueConditions = getOverdueMongoFilter(); // returns { $or: [...] }

        if (filter.$or) {
            // Both filters use $or — wrap them in $and so both conditions are enforced
            filter.$and = [{ $or: filter.$or }, overdueConditions];
            delete filter.$or;
        } else {
            // No existing $or conflict — just merge the overdue conditions directly
            Object.assign(filter, overdueConditions);
        }
    }

    // --- Step 9: Search filter ---
    // Search looks at complaint title, description, room number, category, and student name/email.
    if (search && search.trim()) {
        const term = search.trim();

        if (Types.ObjectId.isValid(term)) {
            // If the search looks like a MongoDB ObjectId, search by complaint ID directly
            filter._id = new Types.ObjectId(term);
        } else {
            // Find students whose name or email matches the search term
            const matchedStudents = await User.find({
                role: "student",
                $or: [
                    { name: { $regex: term, $options: "i" } },
                    { email: { $regex: term, $options: "i" } },
                ],
            }).select("_id").lean();

            const studentIds = matchedStudents.map((s) => s._id);

            // Build search conditions for complaint fields
            const searchConditions = [
                { title: { $regex: term, $options: "i" } },
                { description: { $regex: term, $options: "i" } },
                { roomNumber: { $regex: term, $options: "i" } },
                { category: { $regex: term, $options: "i" } },
            ];

            // Also search by student if any matched
            if (studentIds.length > 0) {
                searchConditions.push({ studentId: { $in: studentIds } });
            }

            // Again, check if $or already exists and combine using $and if needed
            if (filter.$or) {
                filter.$and = [{ $or: filter.$or }, { $or: searchConditions }];
                delete filter.$or;
            } else {
                filter.$or = searchConditions;
            }
        }
    }

    // --- Step 10: Sorting ---
    const sort = {};
    sort[sortBy || "createdAt"] = sortOrder === "asc" ? 1 : -1;

    // --- Step 11: Pagination ---
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    // --- Step 12: Run count + data queries in parallel ---
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

    // --- Step 13: Format the results for the frontend ---
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
 * Get the full details of a single complaint, including its audit history timeline.
 */
export async function getComplaintDetail({ user, complaintId }) {
    if (!complaintId || !Types.ObjectId.isValid(complaintId)) {
        return { success: false, status: 400, message: "Invalid complaint ID." };
    }

    await connectDB();

    // Load the complaint and populate related user documents
    const complaint = await Complaint.findById(complaintId)
        .populate("studentId", "name email mobile hostel")
        .populate("assignedTechnician", "name email mobile specialization emplyeedId")
        .populate("escalatedBy", "name role")
        .populate("closedBy", "name role")
        .lean();

    if (!complaint) {
        return { success: false, status: 404, message: "Complaint not found." };
    }

    // IDOR protection: make sure this user is allowed to see this complaint
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
 * Update the priority level of a complaint (e.g., from Medium → High).
 */
export async function updatePriority({ user, complaintId, priority, reason = "" }) {
    if (!complaintId || !Types.ObjectId.isValid(complaintId)) {
        return { success: false, status: 400, message: "Invalid complaint ID." };
    }

    // Check that the priority value is one of the allowed options
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

    // Skip the update if priority is already the same
    if (oldPriority === priority) {
        return { success: true, message: "Priority is already set to this value.", complaint };
    }

    complaint.priority = priority;
    await complaint.save();

    // Record this change in the audit history
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
 * Assign or reassign a technician to a complaint.
 *
 * Also:
 * - Advances status from "Submitted"/"Pending" → "Assigned"
 * - Saves scheduled visit date if provided
 * - Sends notifications to both the technician and the student
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

    // Fetch both the complaint and the technician at the same time for efficiency
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

    // Check if there was a previously assigned technician (for reassignment detection)
    const previousTechId = complaint.assignedTechnician || complaint.assignedTechician;
    const isReassignment = previousTechId && previousTechId.toString() !== technician._id.toString();

    // Fetch the old technician's name for the audit log
    let oldTechName = "Unassigned";
    if (previousTechId) {
        const oldTech = await User.findById(previousTechId).select("name").lean();
        if (oldTech) oldTechName = oldTech.name;
    }

    // Save the new technician assignment.
    // Note: Both field names are written to support old DB records that use the typo spelling.
    // "assignedTechician" (one 'n') is a legacy typo — kept for backward compatibility.
    complaint.assignedTechnician = technician._id; // current correct field
    complaint.assignedTechician = technician._id;   // legacy typo field (backward compat)

    // Save scheduled date if provided (again, writing both spellings for backward compat)
    if (scheduledDate) {
        complaint.scheduledDate = new Date(scheduledDate); // current field
        complaint.schduledDate = new Date(scheduledDate);  // legacy typo field
    }

    // If the complaint was just submitted, advance its status to "Assigned"
    const isFirstAssignment = ["Submitted", "Pending"].includes(complaint.status);
    if (isFirstAssignment) {
        complaint.status = "Assigned";
    }

    await complaint.save();

    // Build a human-readable remark for the audit history
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

    // Notify the technician about their new task
    await notifyTechnician({
        technicianId: technician._id,
        complaintId: complaint._id,
        title: `New Maintenance Task: ${complaint.title}`,
        message: `You have been assigned to complaint in ${complaint.hostel}, room ${complaint.roomNumber}.`,
        type: "technician_assigned",
        eventKey: `tech_assigned_${complaint._id}_${technician._id}_${Date.now()}`,
    });

    // Notify the student that a technician has been assigned
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
 * Escalate a complaint — marks it as urgent and notifies admins and wardens.
 *
 * Rules:
 * - Requires a reason of at least 5 characters
 * - Cannot escalate an already-resolved or closed complaint
 * - Automatically sets priority to "Urgent"
 */
export async function escalateComplaint({ user, complaintId, reason }) {
    if (!complaintId || !Types.ObjectId.isValid(complaintId)) {
        return { success: false, status: 400, message: "Invalid complaint ID." };
    }

    // Escalation reason is mandatory
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

    // Cannot escalate a complaint that is already finished
    if (["Resolved", "Completed", "Closed"].includes(complaint.status)) {
        return {
            success: false,
            status: 400,
            message: "Cannot escalate a resolved or closed complaint.",
        };
    }

    const previousStatus = complaint.status;

    // Mark the complaint as escalated
    complaint.isEscalated = true;
    complaint.status = "Escalated";
    complaint.escalationReason = reason.trim();
    complaint.escalatedAt = new Date();
    complaint.escalatedBy = user._id;
    complaint.priority = "Urgent"; // always set to Urgent on escalation

    await complaint.save();

    // Record this escalation in the audit history
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

    // Alert all admins and wardens about the escalation
    await notifyWardenAndAdmins({
        hostel: complaint.hostel,
        complaintId: complaint._id,
        title: `ESCALATED: Complaint in ${complaint.hostel} #${complaint._id.toString().slice(-6)}`,
        message: `Escalated by ${user.name}: "${reason.trim()}"`,
        type: "complaint_escalated",
        eventKeyPrefix: `escalated_${complaint._id}_${Date.now()}`,
    });

    // Also notify the assigned technician (if there is one)
    const assignedTechId = complaint.assignedTechnician || complaint.assignedTechician;
    if (assignedTechId) {
        await notifyTechnician({
            technicianId: assignedTechId,
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
 * Update the status of a complaint, following the allowed lifecycle transitions.
 *
 * STATUS_CANONICAL_MAP normalizes status values (e.g. "In progress" → "In Progress").
 * VALID_STATUS_TRANSITIONS defines which status can move to which next status.
 *
 * Example flow: Submitted → Assigned → In Progress → Resolved → Closed
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

    // Normalize the requested status to its canonical (official) form
    // e.g., "in progress" becomes "In Progress" via STATUS_CANONICAL_MAP
    const targetStatus = STATUS_CANONICAL_MAP[requestedStatus];
    if (!targetStatus) {
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

    // Normalize the complaint's current status too (in case old records have variant spellings)
    const currentStatus = STATUS_CANONICAL_MAP[complaint.status] || complaint.status;

    // Check if this transition is allowed
    const allowedNextStatuses = VALID_STATUS_TRANSITIONS[currentStatus] || [];
    const isValidTransition = allowedNextStatuses.includes(targetStatus) || currentStatus === targetStatus;

    if (!isValidTransition) {
        return {
            success: false,
            status: 400,
            message: `Invalid status transition from "${currentStatus}" to "${targetStatus}". Allowed transitions: [${allowedNextStatuses.join(", ")}].`,
        };
    }

    // Only admins, wardens, or the student can close a resolved complaint
    if (targetStatus === "Closed" && user.role !== "admin" && user.role !== "warden" && user.role !== "student") {
        return {
            success: false,
            status: 403,
            message: "Only wardens, admins, or the student can close a resolved complaint.",
        };
    }

    const oldStatus = complaint.status;
    complaint.status = targetStatus;

    // Set extra fields depending on the target status
    if (targetStatus === "Resolved") {
        complaint.completedAt = new Date();
        if (resolutionNotes) {
            complaint.resolutionNotes = resolutionNotes;
            complaint.workNotes = resolutionNotes;
        }
    } else if (targetStatus === "Closed") {
        complaint.closedAt = new Date();
        complaint.closedBy = user._id;
    } else if (targetStatus === "In Progress" && currentStatus === "Closed") {
        // The complaint is being reopened — clear the closed timestamps
        complaint.closedAt = null;
        complaint.closedBy = null;
    }

    await complaint.save();

    // Determine what kind of action this was for the audit log
    let action;
    if (targetStatus === "Resolved") {
        action = "resolved";
    } else if (targetStatus === "Closed") {
        action = "closed";
    } else if (currentStatus === "Closed") {
        action = "reopened";
    } else {
        action = "status_changed";
    }

    await recordHistory({
        complaintId: complaint._id,
        action,
        oldValue: oldStatus,
        newValue: targetStatus,
        remarks: remarks || resolutionNotes || `Status transitioned from ${oldStatus} to ${targetStatus}`,
        performedBy: user._id,
        performedByName: user.name || "User",
        performedByRole: user.role,
        isStudentVisible: true,
    });

    // Choose the notification type based on the new status
    let notificationType = "status_updated";
    if (targetStatus === "Resolved") notificationType = "complaint_resolved";
    if (targetStatus === "Closed") notificationType = "complaint_closed";

    // Notify the student about the status change
    await notifyStudent({
        studentId: complaint.studentId,
        complaintId: complaint._id,
        title: `Complaint Status: ${targetStatus}`,
        message: `Your complaint "${complaint.title}" has been updated to "${targetStatus}".`,
        type: notificationType,
        eventKey: `status_${complaint._id}_${targetStatus}_${Date.now()}`,
    });

    return {
        success: true,
        status: 200,
        message: `Complaint status updated to ${targetStatus}.`,
        complaint,
    };
}
