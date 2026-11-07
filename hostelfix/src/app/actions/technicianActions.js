"use server";

import connectDB from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import complain from "@/module/complain";
import Technician from "@/module/Technician";
import { Types } from "mongoose";

async function authenticateTechnician() {
  const technician = await getCurrentUser();

  if (!technician || technician.role !== "technician") {
    return null;
  }

  const technicianId = technician._id ?? technician.userId;

  if (!technicianId || !Types.ObjectId.isValid(technicianId.toString())) {
    return null;
  }

  return new Types.ObjectId(technicianId.toString());
}

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
      technicianProfile,
      complaints,
      totalTasks,
      inProgress,
      completed,
      pending,
      onHold,
    ] = await Promise.all([
      Technician.findById(technicianId)
        .select("name")
        .lean(),

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

      complain.countDocuments({
        ...filter,
        status: "On Hold",
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
      technicianName: technicianProfile?.name ?? "",

      stats: {
        totalTasks,
        inProgress,
        completed,
        pending,
        onHold,
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
    const allowedStatuses = ["In Progress", "On Hold", "Completed"];

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
      !["Assigned", "On Hold"].includes(existingComplaint.status)
    ) {
      return {
        success: false,
        message:
          "Only assigned or on-hold complaints can be started.",
      };
    }

    if (
      newStatus === "On Hold" &&
      existingComplaint.status !== "In Progress"
    ) {
      return {
        success: false,
        message:
          "Only complaints in progress can be put on hold.",
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

// ============================================
// GET COMPLAINT DETAILS
// ============================================

export async function getComplaintDetails(complaintId) {
    try {
        // Step 1: Authenticate technician
        const technicianId = await authenticateTechnician();

        if (!technicianId) {
            return {
                success: false,
                message: "Unauthorized access."
            };
        }

        // Step 2: Validate complaint ID
        if (
            !complaintId ||
            !Types.ObjectId.isValid(complaintId)
        ) {
            return {
                success: false,
                message: "Invalid complaint ID."
            };
        }

        // Step 3: Connect to database
        await connectDB();

        // Step 4: Find complaint assigned to this technician
        const complaint = await complain.findOne({
            _id: complaintId,
            assignedTechnician: technicianId
        })
        .populate("studentId", "name email")
        .lean();

        // Step 5: Check complaint
        if (!complaint) {
            return {
                success: false,
                message: "Complaint not found or not assigned to you."
            };
        }

        // Step 6: Return complaint details
        return {
            success: true,
            complaint: JSON.parse(JSON.stringify(complaint))
        };

    } catch (error) {
        console.error("Get complaint details error:", error);

        return {
            success: false,
            message: error.message || "Failed to fetch complaint details."
        };
    }
}

// ============================================
// UPDATE COMPLAINT WORK NOTES
// ============================================

export async function updateComplaintWorkNotes(complaintId, workNotes) {
    try {
        // Step 1: Authenticate technician
        const technicianId = await authenticateTechnician();

        if (!technicianId) {
            return {
                success: false,
                message: "Unauthorized access."
            };
        }

        // Step 2: Validate complaint ID
        if (
            !complaintId ||
            !Types.ObjectId.isValid(complaintId)
        ) {
            return {
                success: false,
                message: "Invalid complaint ID."
            };
        }

        // Step 3: Validate work notes
        if (
            typeof workNotes !== "string" ||
            workNotes.trim().length === 0
        ) {
            return {
                success: false,
                message: "Work notes cannot be empty."
            };
        }

        if (workNotes.trim().length > 2000) {
            return {
                success: false,
                message: "Work notes cannot exceed 2000 characters."
            };
        }

        // Step 4: Connect to database
        await connectDB();

        // Step 5: Update complaint
        const updatedComplaint = await complain.findOneAndUpdate(
            {
                _id: complaintId,
                assignedTechnician: technicianId,
                status: {
                    $in: ["Assigned", "In Progress", "On Hold"]
                }
            },
            {
                $set: {
                    workNotes: workNotes.trim()
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

        // Step 6: Check update result
        if (!updatedComplaint) {
            return {
                success: false,
                message: "Complaint not found or cannot be updated."
            };
        }

        return {
            success: true,
            message: "Work notes updated successfully."
        };

    } catch (error) {
        console.error("Update work notes error:", error);

        return {
            success: false,
            message: error.message || "Failed to update work notes."
        };
    }
}