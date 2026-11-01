import { SLA_HOURS } from "./constants";

/**
 * Calculate SLA metrics for a complaint.
 */
export function getComplaintSLAMetrics(complaint) {
    if (!complaint) return null;

    const priority = complaint.priority || "Medium";
    const slaHours = SLA_HOURS[priority] || SLA_HOURS.Medium;
    const createdAt = new Date(complaint.createdAt || Date.now());
    const now = new Date();

    const terminalStatuses = ["Resolved", "Completed", "Closed"];
    const isCompleted = terminalStatuses.includes(complaint.status);

    const effectiveEndDate = isCompleted && complaint.completedAt
        ? new Date(complaint.completedAt)
        : now;

    const elapsedMs = effectiveEndDate.getTime() - createdAt.getTime();
    const elapsedHours = elapsedMs / (1000 * 60 * 60);

    const isOverdue = !isCompleted && elapsedHours > slaHours;
    const remainingHours = Math.max(0, slaHours - elapsedHours);
    const percentElapsed = Math.min(100, Math.round((elapsedHours / slaHours) * 100));

    return {
        priority,
        slaHours,
        elapsedHours: Math.round(elapsedHours * 10) / 10,
        remainingHours: Math.round(remainingHours * 10) / 10,
        percentElapsed,
        isOverdue,
        isCompleted,
    };
}

/**
 * Filter condition to match overdue complaints in MongoDB queries.
 */
export function getOverdueMongoFilter() {
    const now = new Date();
    const terminalStatuses = ["Resolved", "Completed", "Closed"];

    const conditions = Object.entries(SLA_HOURS).map(([priority, hours]) => {
        const thresholdDate = new Date(now.getTime() - hours * 60 * 60 * 1000);
        return {
            priority,
            createdAt: { $lt: thresholdDate },
            status: { $nin: terminalStatuses },
        };
    });

    return { $or: conditions };
}
