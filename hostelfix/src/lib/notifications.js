import connectDB from "@/lib/mongodb";
import Notification from "@/module/Notification";
import User from "@/module/User";

/**
 * Dispatch a single notification with deduplication.
 */
export async function sendNotification({
    recipientId,
    recipientRole,
    complaintId,
    title,
    message,
    type,
    eventKey = null,
}) {
    if (!recipientId || !complaintId || !title || !message) {
        return null;
    }

    try {
        await connectDB();
        const notification = await Notification.create({
            recipientId,
            recipientRole,
            complaintId,
            title,
            message,
            type,
            eventKey,
        });
        return notification;
    } catch (error) {
        // E11000 duplicate key error means this notification event was already recorded (idempotent)
        if (error.code === 11000) {
            return null;
        }
        console.error("Failed to send notification:", error.message);
        return null;
    }
}

/**
 * Notify wardens of a hostel + all admins.
 */
export async function notifyWardenAndAdmins({
    hostel,
    complaintId,
    title,
    message,
    type,
    eventKeyPrefix,
}) {
    try {
        await connectDB();
        // Find admins + wardens of this hostel
        const recipients = await User.find({
            $or: [
                { role: "admin" },
                {
                    role: "warden",
                    $or: [
                        { assignedHostels: hostel },
                        { hostel: hostel },
                        { assignedHostels: { $size: 0 } }, // unassigned wardens also see
                    ],
                },
            ],
            accountStatus: { $ne: "rejected" },
        }).select("_id role").lean();

        const promises = recipients.map((r) =>
            sendNotification({
                recipientId: r._id,
                recipientRole: r.role,
                complaintId,
                title,
                message,
                type,
                eventKey: eventKeyPrefix ? `${eventKeyPrefix}_${r._id}` : null,
            })
        );

        await Promise.allSettled(promises);
    } catch (error) {
        console.error("notifyWardenAndAdmins error:", error.message);
    }
}

/**
 * Notify a student.
 */
export async function notifyStudent({
    studentId,
    complaintId,
    title,
    message,
    type,
    eventKey = null,
}) {
    if (!studentId) return;
    return sendNotification({
        recipientId: studentId,
        recipientRole: "student",
        complaintId,
        title,
        message,
        type,
        eventKey,
    });
}

/**
 * Notify a technician.
 */
export async function notifyTechnician({
    technicianId,
    complaintId,
    title,
    message,
    type,
    eventKey = null,
}) {
    if (!technicianId) return;
    return sendNotification({
        recipientId: technicianId,
        recipientRole: "technician",
        complaintId,
        title,
        message,
        type,
        eventKey,
    });
}
