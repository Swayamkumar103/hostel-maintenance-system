import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
    {
        recipientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        recipientRole: {
            type: String,
            enum: ["student", "technician", "warden", "admin"],
            required: true,
            index: true,
        },
        complaintId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Complaint",
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: [
                "new_complaint",
                "technician_assigned",
                "technician_reassigned",
                "status_updated",
                "complaint_escalated",
                "complaint_overdue",
                "complaint_resolved",
                "complaint_closed",
            ],
            required: true,
        },
        read: {
            type: Boolean,
            default: false,
            index: true,
        },
        // Idempotency key prevents duplicate notifications for the exact same event
        eventKey: {
            type: String,
            unique: true,
            sparse: true,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: true },
    }
);

NotificationSchema.index({ recipientId: 1, read: 1, createdAt: -1 });

export default mongoose.models.Notification ||
    mongoose.model("Notification", NotificationSchema);
