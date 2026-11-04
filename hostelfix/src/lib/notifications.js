import connectDB from "@/lib/mongodb";
import Notification from "@/module/Notification";
import User from "@/module/User";

/**
 * Save a single notification to the database.
 *
 * Uses the `eventKey` field to prevent duplicate notifications.
 * If a notification with the same eventKey already exists (E11000 duplicate key),
 * we silently ignore it — this makes notifications idempotent (safe to call multiple times).
 *
 * @param {Object} params - notification data
 * @returns {Object|null} the saved notification, or null on failure
 */
export async function sendNotification({
    recipientId,
    recipientRole,
    complaintId,
    title,
    message,
    type,
    eventKey = null, // unique key to prevent duplicate notifications for the same event
}) {
    // Skip if required fields are missing
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
        // E11000 = MongoDB duplicate key error.
        // This means we already sent this exact notification (same eventKey).
        // This is expected and safe to ignore.
        if (error.code === 11000) {
            return null;
        }

        console.error("Failed to send notification:", error.message);
        return null;
    }
}

/**
 * Send notifications to all wardens of a specific hostel AND all admins.
 *
 * We use Promise.allSettled() (instead of Promise.all()) so that if one
 * notification fails, the rest still get sent. Promise.all() would stop
 * everything if any one notification throws an error.
 *
 * @param {Object} params - hostel, complaintId, title, message, type, eventKeyPrefix
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

        // Find all admins + wardens who manage this hostel
        const recipients = await User.find({
            $or: [
                { role: "admin" }, // all admins
                {
                    role: "warden",
                    $or: [
                        { assignedHostels: hostel },      // warden assigned to this hostel
                        { hostel: hostel },               // warden with single hostel field
                        { assignedHostels: { $size: 0 } }, // unassigned wardens also receive alerts
                    ],
                },
            ],
            accountStatus: { $ne: "rejected" }, // skip rejected accounts
        }).select("_id role").lean();

        // Send a notification to each recipient.
        // The eventKey is unique per recipient to allow deduplication per person.
        const notificationPromises = recipients.map((recipient) =>
            sendNotification({
                recipientId: recipient._id,
                recipientRole: recipient.role,
                complaintId,
                title,
                message,
                type,
                eventKey: eventKeyPrefix ? `${eventKeyPrefix}_${recipient._id}` : null,
            })
        );

        // Wait for all to finish. allSettled won't throw even if some fail.
        await Promise.allSettled(notificationPromises);
    } catch (error) {
        console.error("notifyWardenAndAdmins error:", error.message);
    }
}

/**
 * Send a notification to a student.
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
 * Send a notification to a technician.
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
