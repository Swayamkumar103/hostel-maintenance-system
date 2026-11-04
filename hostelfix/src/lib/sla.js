import { SLA_HOURS } from "./constants";

/**
 * Calculate SLA (Service Level Agreement) metrics for a complaint.
 *
 * SLA means: "this complaint should be resolved within X hours based on its priority".
 * Example: Urgent = 24 hours, High = 48 hours, Medium = 72 hours, Low = 120 hours.
 *
 * Returns an object with:
 *   - priority       : the complaint's priority
 *   - slaHours       : the allowed hours for resolution
 *   - elapsedHours   : how many hours have passed since the complaint was created
 *   - remainingHours : how many hours are left before SLA is breached (0 if already breached)
 *   - percentElapsed : what % of the allowed time has been used (capped at 100)
 *   - isOverdue      : true if the SLA has been breached and complaint is still open
 *   - isCompleted    : true if the complaint is in a final state (Resolved/Completed/Closed)
 */
export function getComplaintSLAMetrics(complaint) {
    if (!complaint) return null;

    const priority = complaint.priority || "Medium";

    // Look up how many hours are allowed for this priority level
    const slaHours = SLA_HOURS[priority] || SLA_HOURS.Medium;

    const createdAt = new Date(complaint.createdAt || Date.now());
    const now = new Date();

    // These statuses mean the complaint is finished
    const terminalStatuses = ["Resolved", "Completed", "Closed"];
    const isCompleted = terminalStatuses.includes(complaint.status);

    // If completed, measure time up to when it was completed; otherwise measure up to now
    const endDate = isCompleted && complaint.completedAt
        ? new Date(complaint.completedAt)
        : now;

    // Calculate how many hours have passed
    const elapsedMs = endDate.getTime() - createdAt.getTime();
    const elapsedHours = elapsedMs / (1000 * 60 * 60); // convert milliseconds to hours

    // A complaint is overdue if it is still open AND has exceeded the SLA hours
    const isOverdue = !isCompleted && elapsedHours > slaHours;

    // Remaining time (cannot go below 0)
    const remainingHours = Math.max(0, slaHours - elapsedHours);

    // What percentage of allowed time has been used (capped at 100%)
    const percentElapsed = Math.min(100, Math.round((elapsedHours / slaHours) * 100));

    return {
        priority,
        slaHours,
        elapsedHours: Math.round(elapsedHours * 10) / 10,   // rounded to 1 decimal
        remainingHours: Math.round(remainingHours * 10) / 10, // rounded to 1 decimal
        percentElapsed,
        isOverdue,
        isCompleted,
    };
}

/**
 * Build a MongoDB query filter that matches all OVERDUE complaints.
 *
 * A complaint is overdue when:
 *   - It is NOT in a terminal status (not Resolved/Completed/Closed)
 *   - It was created more than SLA_HOURS[priority] hours ago
 *
 * We build one condition per priority level and combine them with $or.
 * Example: { $or: [ { priority: "Urgent", createdAt: { $lt: <24h ago> }, status: { $nin: [...] } }, ... ] }
 */
export function getOverdueMongoFilter() {
    const now = new Date();
    const terminalStatuses = ["Resolved", "Completed", "Closed"];

    // Build one condition for each priority level
    const conditions = Object.entries(SLA_HOURS).map(([priority, hours]) => {
        // Calculate the cutoff time: complaints created before this date are overdue
        const cutoffDate = new Date(now.getTime() - hours * 60 * 60 * 1000);

        return {
            priority,
            createdAt: { $lt: cutoffDate },      // created before the cutoff
            status: { $nin: terminalStatuses },   // not yet resolved/closed
        };
    });

    return { $or: conditions }; // match complaints that are overdue for ANY priority
}
