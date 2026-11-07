import mongoose from "mongoose";

const ComplainSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
        },

        hostel: {
            type: String,
            required: true,
        },

        roomNumber: {
            type: String,
            required: true,
        },

        category: {
            type: String,
            required: true,
        },

        // Complaint status
        status: {
            type: String,
            enum: [
                "Pending",
                "Assigned",
                "In Progress",
                "On Hold",
                "Completed",
                "Verified",
            ],
            default: "Pending",
        },

        // Student who created complaint
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Technician assigned to complaint
        assignedTechnician: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        // Admin who assigned the complaint
        assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        assignedAt: {
            type: Date,
            default: null,
        },

        // Scheduled maintenance date
        scheduledDate: {
            type: Date,
            default: null,
        },

        // Technician work details
        workNotes: {
            type: String,
            default: "",
        },

        // Completion evidence
        completionPhoto: {
            type: [String],
            default: [],
        },

        completedAt: {
            type: Date,
            default: null,
        },

        // Admin verification
        verifiedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.Complaint ||
    mongoose.model("Complaint", ComplainSchema);