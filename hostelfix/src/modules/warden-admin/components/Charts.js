"use client";

/**
 * Hostel-wise horizontal bar comparison chart.
 */
export function HostelBarChart({ data = [] }) {
    if (!data || data.length === 0) {
        return (
            <div className="py-8 text-center text-xs text-gray-400">
                No hostel statistics available.
            </div>
        );
    }

    const maxVal = Math.max(...data.map((d) => d.total || 0), 1);

    return (
        <div className="space-y-4">
            {data.map((item) => {
                const totalPct = Math.round(((item.total || 0) / maxVal) * 100);
                const resolvedPct = item.total > 0 ? Math.round(((item.resolved || 0) / item.total) * 100) : 0;

                return (
                    <div key={item.hostel} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                            <span>{item.hostel}</span>
                            <span className="text-gray-500 font-normal">
                                {item.total} total ({item.resolved} resolved, {item.pending} active)
                            </span>
                        </div>

                        {/* Progress Bar Container */}
                        <div className="h-4 w-full rounded-full bg-gray-100 overflow-hidden flex">
                            <div
                                style={{ width: `${Math.min(100, Math.max(5, (item.resolved / maxVal) * 100))}%` }}
                                title={`Resolved: ${item.resolved}`}
                                className="bg-emerald-500 h-full transition-all duration-500"
                            />
                            <div
                                style={{ width: `${Math.min(100, Math.max(5, (item.pending / maxVal) * 100))}%` }}
                                title={`Active: ${item.pending}`}
                                className="bg-blue-500 h-full transition-all duration-500"
                            />
                        </div>
                    </div>
                );
            })}

            <div className="pt-2 flex items-center justify-center gap-6 text-xs text-gray-500 border-t border-gray-100">
                <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-500" />
                    <span>Resolved</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-blue-500" />
                    <span>Active / Pending</span>
                </div>
            </div>
        </div>
    );
}

/**
 * Status / Priority Distribution Donut / Progress Breakdown
 */
export function DistributionChart({ data = {}, colors = {} }) {
    const entries = Object.entries(data);
    const total = entries.reduce((acc, [, val]) => acc + (val || 0), 0);

    if (total === 0) {
        return (
            <div className="py-8 text-center text-xs text-gray-400">
                No complaint distribution data.
            </div>
        );
    }

    const defaultColors = {
        Submitted: "bg-amber-500 text-amber-700",
        Assigned: "bg-blue-500 text-blue-700",
        "In Progress": "bg-indigo-500 text-indigo-700",
        Resolved: "bg-emerald-500 text-emerald-700",
        Closed: "bg-gray-400 text-gray-700",
        Escalated: "bg-rose-500 text-rose-700",
        Urgent: "bg-red-600 text-red-700",
        High: "bg-orange-500 text-orange-700",
        Medium: "bg-blue-500 text-blue-700",
        Low: "bg-slate-400 text-slate-700",
    };

    return (
        <div className="space-y-4">
            {/* Multi-segment stacked bar */}
            <div className="flex h-5 w-full rounded-xl overflow-hidden bg-gray-100 shadow-inner">
                {entries.map(([label, val]) => {
                    if (!val) return null;
                    const pct = (val / total) * 100;
                    const colorClass = (colors[label] || defaultColors[label] || "bg-gray-500").split(" ")[0];
                    return (
                        <div
                            key={label}
                            style={{ width: `${pct}%` }}
                            title={`${label}: ${val} (${Math.round(pct)}%)`}
                            className={`${colorClass} h-full transition-all duration-500 hover:opacity-90`}
                        />
                    );
                })}
            </div>

            {/* Legend Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
                {entries.map(([label, val]) => {
                    const pct = total > 0 ? Math.round((val / total) * 100) : 0;
                    const colorClass = (colors[label] || defaultColors[label] || "bg-gray-500").split(" ")[0];
                    return (
                        <div key={label} className="flex items-center justify-between p-1.5 rounded-lg bg-gray-50">
                            <div className="flex items-center gap-2 truncate">
                                <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${colorClass}`} />
                                <span className="text-gray-700 font-medium truncate">{label}</span>
                            </div>
                            <span className="text-gray-500 font-semibold shrink-0">
                                {val} ({pct}%)
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
