import connectDB from "@/lib/mongodb";
import ComplaintHistory from "@/module/ComplaintHistory";

/**
 * Record a historical event for a complaint.
 */
export async function recordHistory({
    complaintId,
    action,
    oldValue = null,
    newValue = null,
    remarks = "",
    performedBy,
    performedByName = "System",
    performedByRole = "system",
    isStudentVisible = true,
}) {
    if (!complaintId || !action) return null;

    try {
        await connectDB();
        const entry = await ComplaintHistory.create({
            complaintId,
            action,
            oldValue,
            newValue,
            remarks,
            performedBy,
            performedByName,
            performedByRole,
            isStudentVisible,
        });
        return entry;
    } catch (error) {
        console.error("Failed to record complaint history:", error.message);
        return null;
    }
}

/**
 * Fetch full chronological history for a complaint.
 */
export async function getComplaintTimeline(complaintId, isStudent = false) {
    if (!complaintId) return [];

    try {
        await connectDB();
        const filter = { complaintId };
        if (isStudent) {
            filter.isStudentVisible = true;
        }

        const timeline = await ComplaintHistory.find(filter)
            .sort({ createdAt: 1 })
            .lean();

        return timeline.map((item) => ({
            ...item,
            _id: item._id.toString(),
            complaintId: item.complaintId.toString(),
            performedBy: item.performedBy?.toString(),
            createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : null,
        }));
    } catch (error) {
        console.error("Failed to fetch complaint timeline:", error.message);
        return [];
    }
}
