"use server";

import connectDB from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import complain from "@/module/complain";
import { Types } from "mongoose";

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

    // 4. Filter complaints assigned to this technician
    const filter = {
      assignedTechnician: new Types.ObjectId(
        technicianId.toString()
      ),
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
        status: "In Progress",
      }),

      complain.countDocuments({
        ...filter,
        status: "Completed",
      }),

      complain.countDocuments({
        ...filter,
        status: {
          $in: ["Pending", "Assigned"],
        },
      }),
    ]);

    // 6. Format complaints
    const formattedComplaints = complaints.map((c) => ({
      ...c,

      _id: c._id.toString(),

      assignedTechnician:
        c.assignedTechnician?.toString() ?? null,

      studentId:
        c.studentId?.toString() ?? null,

      createdAt:
        c.createdAt?.toISOString() ?? null,

      updatedAt:
        c.updatedAt?.toISOString() ?? null,

      scheduledDate:
        c.scheduledDate?.toISOString() ?? null,

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

    // 4. Fetch assigned complaints
    const complaints = await complain
      .find({
        assignedTechnician: new Types.ObjectId(
          technicianId.toString()
        ),
      })
      .sort({ createdAt: -1 })
      .lean();

    // 5. Format complaints
    const formattedComplaints = complaints.map((c) => ({
      ...c,

      _id: c._id.toString(),

      assignedTechnician:
        c.assignedTechnician?.toString() ?? null,

      studentId:
        c.studentId?.toString() ?? null,

      createdAt:
        c.createdAt?.toISOString() ?? null,

      updatedAt:
        c.updatedAt?.toISOString() ?? null,

      scheduledDate:
        c.scheduledDate?.toISOString() ?? null,

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

    // 6. Find the complaint assigned to this technician
    const filter = {
      _id: new Types.ObjectId(complaintId),
      assignedTechnician: new Types.ObjectId(
        technicianId.toString()
      ),
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
    if (
      newStatus === "In Progress" &&
      existingComplaint.status !== "Assigned"
    ) {
      return {
        success: false,
        message:
          "Only assigned complaints can be started.",
      };
    }

    if (
      newStatus === "Completed" &&
      existingComplaint.status !== "In Progress"
    ) {
      return {
        success: false,
        message:
          "Only complaints in progress can be completed.",
      };
    }

    // 8. Update complaint status
    existingComplaint.status = newStatus;

    if (newStatus === "Completed") {
      existingComplaint.completedAt = new Date();
    }

    await existingComplaint.save();

    // 9. Return success
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