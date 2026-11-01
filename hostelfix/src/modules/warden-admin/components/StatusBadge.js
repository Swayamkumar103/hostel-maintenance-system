"use client";

export default function StatusBadge({ status, className = "" }) {
    const statusMap = {
        Submitted: "bg-amber-100 text-amber-800 border-amber-200",
        Pending: "bg-amber-100 text-amber-800 border-amber-200",
        Assigned: "bg-blue-100 text-blue-800 border-blue-200",
        "In Progress": "bg-indigo-100 text-indigo-800 border-indigo-200",
        "In progress": "bg-indigo-100 text-indigo-800 border-indigo-200",
        "On Hold": "bg-orange-100 text-orange-800 border-orange-200",
        Resolved: "bg-emerald-100 text-emerald-800 border-emerald-200",
        Completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
        Closed: "bg-gray-200 text-gray-800 border-gray-300",
        Escalated: "bg-rose-100 text-rose-800 border-rose-200 animate-pulse font-bold",
    };

    const style = statusMap[status] || "bg-gray-100 text-gray-700 border-gray-200";

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide ${style} ${className}`}
        >
            {status === "Escalated" && <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />}
            {status || "Unknown"}
        </span>
    );
}
