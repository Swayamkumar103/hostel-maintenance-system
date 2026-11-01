"use client";

export default function Timeline({ history = [] }) {
    if (!history || history.length === 0) {
        return (
            <div className="py-6 text-center text-sm text-gray-500">
                No activity history recorded yet.
            </div>
        );
    }

    const actionIcons = {
        created: { icon: "📝", bg: "bg-blue-100", label: "Created" },
        assigned: { icon: "👷", bg: "bg-indigo-100", label: "Assigned" },
        reassigned: { icon: "🔄", bg: "bg-purple-100", label: "Reassigned" },
        priority_changed: { icon: "⚡", bg: "bg-amber-100", label: "Priority Changed" },
        status_changed: { icon: "📊", bg: "bg-teal-100", label: "Status Updated" },
        escalated: { icon: "🚨", bg: "bg-rose-100", label: "Escalated" },
        resolved: { icon: "✅", bg: "bg-emerald-100", label: "Resolved" },
        closed: { icon: "🔒", bg: "bg-gray-200", label: "Closed" },
        reopened: { icon: "🔓", bg: "bg-yellow-100", label: "Reopened" },
    };

    return (
        <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
            {history.map((item, index) => {
                const conf = actionIcons[item.action] || { icon: "📌", bg: "bg-gray-100", label: item.action };
                const formattedDate = item.createdAt
                    ? new Date(item.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                    })
                    : "Recently";

                return (
                    <div key={item._id || index} className="relative group">
                        {/* Dot / Icon */}
                        <div
                            className={`absolute -left-6 flex h-6 w-6 items-center justify-center rounded-full text-xs shadow-xs ring-4 ring-white ${conf.bg}`}
                        >
                            <span>{conf.icon}</span>
                        </div>

                        {/* Content Card */}
                        <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3.5 transition group-hover:bg-white group-hover:shadow-xs">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                                    {conf.label}
                                </span>
                                <time className="text-[11px] text-gray-400">
                                    {formattedDate}
                                </time>
                            </div>

                            <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-600">
                                <span>by</span>
                                <span className="font-semibold text-gray-900">
                                    {item.performedByName || "User"}
                                </span>
                                <span className="rounded-full bg-gray-200 px-1.5 py-0.2 text-[10px] text-gray-700 capitalize font-medium">
                                    {item.performedByRole}
                                </span>
                            </div>

                            {item.oldValue && item.newValue && (
                                <div className="mt-2 text-xs text-gray-600 bg-white rounded-lg p-2 border border-gray-100">
                                    <span className="text-gray-400 line-through mr-2">
                                        {String(item.oldValue)}
                                    </span>
                                    <span className="text-gray-400">→</span>
                                    <span className="font-semibold text-blue-600 ml-2">
                                        {String(item.newValue)}
                                    </span>
                                </div>
                            )}

                            {item.remarks && (
                                <p className="mt-2 text-xs italic text-gray-600">
                                    &ldquo;{item.remarks}&rdquo;
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
