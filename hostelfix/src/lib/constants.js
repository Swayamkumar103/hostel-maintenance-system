export const SLA_HOURS = {
    Urgent: 24,
    High: 48,
    Medium: 72,
    Low: 120, // 5 days
};

export const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

export const COMPLAINT_STATUSES = {
    SUBMITTED: "Submitted",
    ASSIGNED: "Assigned",
    IN_PROGRESS: "In Progress",
    RESOLVED: "Resolved",
    CLOSED: "Closed",
    ESCALATED: "Escalated",
};

// Aliases mapped to canonical status values
export const STATUS_CANONICAL_MAP = {
    Pending: "Submitted",
    Submitted: "Submitted",
    Assigned: "Assigned",
    "In progress": "In Progress",
    "In Progress": "In Progress",
    Completed: "Resolved",
    Resolved: "Resolved",
    Closed: "Closed",
    Escalated: "Escalated",
    "On Hold": "In Progress",
};

// Valid status transitions
export const VALID_STATUS_TRANSITIONS = {
    Submitted: ["Assigned", "Escalated"],
    Pending: ["Assigned", "Escalated"],
    Assigned: ["In Progress", "Escalated", "Assigned"], // reassignment
    "In Progress": ["Resolved", "Escalated"],
    "In progress": ["Resolved", "Escalated"],
    Escalated: ["Assigned", "In Progress", "Resolved"],
    Resolved: ["Closed", "In Progress"], // closed by admin/student or reopened
    Completed: ["Closed", "In Progress"],
    Closed: ["In Progress"], // re-opened only with remarks
};

export const DEFAULT_HOSTELS = [
    "BH-1",
    "BH-2",
    "BH-3",
    "GH-1",
    "GH-2",
];

export const MAINTENANCE_CATEGORIES = [
    "Electrical",
    "Plumbing",
    "Carpentry",
    "Masonry",
    "Appliance",
    "Cleaning",
    "General maintenance",
];
