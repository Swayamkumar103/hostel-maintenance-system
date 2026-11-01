"use server";

import connectDB from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import complain from "@/module/complain";
import { Types } from "mongoose";
import { recordHistory } from "@/modules/warden-admin/services/auditService";
import { notifyStudent } from "@/lib/notifications";

// ========================================
// GET TECHNICIAN DASHBOARD
// ========================================

export async function getTechinianDashboard() {
  try {
    // 1. Get the logged-in user
    const technician = await getCurrentUser();

    if (!technician) {
      return {
        success: false,
        message: "Unauthorized access.",
      };
    }

    // 2. Verify technician role
    if (technician.role !== "technician") {
      return {
        success: false,
        message: "Only technicians can access this dashboard.",
      };
    }

    // 3. Get technician ID
    const technicianId = technician._id ?? technician.userId;

    if (
      !technicianId ||
      !Types.ObjectId.isValid(technicianId)
    ) {
      return {
        success: false,
        message: "Invalid technician ID.",
      };
    }

    await connectDB();

    const techObjId = new Types.ObjectId(technicianId.toString());

    // 4. Filter complaints assigned to this technician (supporting both spellings)
    const filter = {
      $or: [
        { assignedTechnician: techObjId },
        { assignedTechician: techObjId },
      ],
    };

    // 5. Fetch complaints and statistics
    const [
      complaints,
      totalTasks,
      inProgress,
      completed,
      pending,
    ] = await Promise.all([
      complain
        .find(filter)
        .select(
          "title description hostel roomNumber category status scheduledDate createdAt updatedAt completedAt"
        )
        .sort({ createdAt: -1 })
        .lean(),

      complain.countDocuments(filter),

      complain.countDocuments({
        ...filter,
        status: { $in: ["In Progress", "In progress"] },
      }),

      complain.countDocuments({
        ...filter,
        status: { $in: ["Completed", "Resolved"] },
      }),

      complain.countDocuments({
        ...filter,
        status: {
          $in: ["Pending", "Assigned", "Submitted"],
        },
      }),
    ]);

    // 6. Format complaints
    const formattedComplaints = complaints.map((c) => ({
      ...c,

      _id: c._id.toString(),

      assignedTechnician:
        (c.assignedTechnician || c.assignedTechician)?.toString() ?? null,

      studentId:
        c.studentId?.toString() ?? null,

      createdAt:
        c.createdAt?.toISOString() ?? null,

      updatedAt:
        c.updatedAt?.toISOString() ?? null,

      scheduledDate:
        (c.scheduledDate || c.schduledDate)?.toISOString() ?? null,

      completedAt:
        c.completedAt?.toISOString() ?? null,
    }));

    // 7. Return dashboard data
    return {
      success: true,

      stats: {
        totalTasks,
        inProgress,
        completed,
        pending,
      },

      complaints: formattedComplaints,
    };
  } catch (error) {
    console.error(
      "Technician dashboard error:",
      error
    );

    return {
      success: false,
      message: "Failed to load technician dashboard.",
    };
  }
}

// ========================================
// GET ASSIGNED COMPLAINTS
// ========================================

export async function getAssignedComplaints() {
  try {
    // 1. Get the logged-in user
    const technician = await getCurrentUser();

    if (!technician) {
      return {
        success: false,
        message: "Unauthorized access.",
        complaints: [],
      };
    }

    // 2. Verify technician role
    if (technician.role !== "technician") {
      return {
        success: false,
        message: "Only technicians can access these complaints.",
        complaints: [],
      };
    }

    // 3. Get technician ID
    const technicianId = technician._id ?? technician.userId;

    if (
      !technicianId ||
      !Types.ObjectId.isValid(technicianId)
    ) {
      return {
        success: false,
        message: "Invalid technician ID.",
        complaints: [],
      };
    }

    await connectDB();

    const techObjId = new Types.ObjectId(technicianId.toString());

    // 4. Fetch assigned complaints
    const complaints = await complain
      .find({
        $or: [
          { assignedTechnician: techObjId },
          { assignedTechician: techObjId },
        ],
      })
      .sort({ createdAt: -1 })
      .lean();

    // 5. Format complaints
    const formattedComplaints = complaints.map((c) => ({
      ...c,

      _id: c._id.toString(),

      assignedTechnician:
        (c.assignedTechnician || c.assignedTechician)?.toString() ?? null,

      studentId:
        c.studentId?.toString() ?? null,

      createdAt:
        c.createdAt?.toISOString() ?? null,

      updatedAt:
        c.updatedAt?.toISOString() ?? null,

      scheduledDate:
        (c.scheduledDate || c.schduledDate)?.toISOString() ?? null,

      completedAt:
        c.completedAt?.toISOString() ?? null,
    }));

    return {
      success: true,
      message: "Complaints fetched successfully.",
      complaints: formattedComplaints,
    };
  } catch (error) {
    console.error(
      "getAssignedComplaints error:",
      error
    );

    return {
      success: false,
      message: "Failed to fetch assigned complaints.",
      complaints: [],
    };
  }
}

// ========================================
// UPDATE COMPLAINT STATUS
// ========================================

export async function updateComplaintStatus(
  complaintId,
  newStatus
) {
  try {
    // 1. Verify the logged-in user
    const technician = await getCurrentUser();

    if (!technician) {
      return {
        success: false,
        message: "Unauthorized access.",
      };
    }

    // 2. Verify technician role
    if (technician.role !== "technician") {
      return {
        success: false,
        message: "Only technicians can update complaints.",
      };
    }

    // 3. Validate complaint ID
    if (
      !complaintId ||
      !Types.ObjectId.isValid(complaintId)
    ) {
      return {
        success: false,
        message: "Invalid complaint ID.",
      };
    }

    // 4. Validate requested status
    const allowedStatuses = [
      "In Progress",
      "Completed",
      "Resolved",
    ];

    if (!allowedStatuses.includes(newStatus)) {
      return {
        success: false,
        message: "Invalid complaint status.",
      };
    }

    // 5. Get technician ID
    const technicianId =
      technician._id ?? technician.userId;

    if (
      !technicianId ||
      !Types.ObjectId.isValid(technicianId.toString())
    ) {
      return {
        success: false,
        message: "Invalid technician ID.",
      };
    }

    await connectDB();

    const techObjId = new Types.ObjectId(technicianId.toString());

    // 6. Find the complaint assigned to this technician
    const filter = {
      _id: new Types.ObjectId(complaintId),
      $or: [
        { assignedTechnician: techObjId },
        { assignedTechician: techObjId },
      ],
    };

    const existingComplaint =
      await complain.findOne(filter);

    if (!existingComplaint) {
      return {
        success: false,
        message:
          "Complaint not found or not assigned to you.",
      };
    }

    // 7. Validate status transition
    const isStarting = newStatus === "In Progress";
    const isFinishing = newStatus === "Completed" || newStatus === "Resolved";

    if (
      isStarting &&
      existingComplaint.status !== "Assigned" &&
      existingComplaint.status !== "Escalated"
    ) {
      return {
        success: false,
        message:
          "Only assigned or escalated complaints can be started.",
      };
    }

    if (
      isFinishing &&
      existingComplaint.status !== "In Progress" &&
      existingComplaint.status !== "In progress"
    ) {
      return {
        success: false,
        message:
          "Only complaints in progress can be completed.",
      };
    }

    const previousStatus = existingComplaint.status;

    // 8. Update complaint status
    existingComplaint.status = newStatus;

    if (isFinishing) {
      existingComplaint.completedAt = new Date();
    }

    await existingComplaint.save();

    // 9. Record to history audit log
    await recordHistory({
      complaintId: existingComplaint._id,
      action: isFinishing ? "resolved" : "status_changed",
      oldValue: previousStatus,
      newValue: newStatus,
      remarks: `Technician updated status to ${newStatus}`,
      performedBy: techObjId,
      performedByName: technician.name || "Technician",
      performedByRole: "technician",
      isStudentVisible: true,
    });

    // 10. Notify student
    await notifyStudent({
      studentId: existingComplaint.studentId,
      complaintId: existingComplaint._id,
      title: isFinishing ? "Complaint Work Completed" : "Technician Started Work",
      message: isFinishing
        ? `Technician has marked complaint "${existingComplaint.title}" as completed.`
        : `Technician has started working on complaint "${existingComplaint.title}".`,
      type: isFinishing ? "complaint_resolved" : "status_updated",
      eventKey: `tech_update_${existingComplaint._id}_${newStatus}_${Date.now()}`,
    });

    // 11. Return success
    return {
      success: true,
      message: `Complaint status updated to ${newStatus}.`,
    };
  } catch (error) {
    console.error(
      "Update complaint status error:",
      error
    );

    return {
      success: false,
      message: "Failed to update complaint status.",
    };
  }
}
