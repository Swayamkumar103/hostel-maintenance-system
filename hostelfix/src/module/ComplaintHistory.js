import mongoose from "mongoose";

const ComplaintHistorySchema = new mongoose.Schema(
    {
        complaintId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Complaint",
            required: true,
            index: true,
        },
        action: {
            type: String,
            enum: [
                "created",
                "assigned",
                "reassigned",
                "priority_changed",
                "status_changed",
                "escalated",
                "resolved",
                "closed",
                "reopened",
            ],
            required: true,
        },
        oldValue: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
        newValue: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
        remarks: {
            type: String,
            default: "",
            trim: true,
        },
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        performedByName: {
            type: String,
            default: "",
        },
        performedByRole: {
            type: String,
            enum: ["student", "technician", "warden", "admin", "system"],
            required: true,
        },
        isStudentVisible: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

ComplaintHistorySchema.index({ complaintId: 1, createdAt: 1 });

export default mongoose.models.ComplaintHistory ||
    mongoose.model("ComplaintHistory", ComplaintHistorySchema);
