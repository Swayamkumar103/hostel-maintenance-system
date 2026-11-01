"use client";

export default function PriorityBadge({ priority, className = "" }) {
    const priorityMap = {
        Urgent: "bg-red-600 text-white shadow-xs font-bold",
        High: "bg-orange-100 text-orange-800 border-orange-200 border",
        Medium: "bg-blue-100 text-blue-800 border-blue-200 border",
        Low: "bg-slate-100 text-slate-700 border-slate-200 border",
    };

    const style = priorityMap[priority] || "bg-gray-100 text-gray-700 border-gray-200 border";

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${style} ${className}`}
        >
            {priority === "Urgent" && <span>🔥</span>}
            {priority || "Medium"}
        </span>
    );
}
