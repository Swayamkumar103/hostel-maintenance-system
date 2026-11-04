"use client";

/**
 * Hostel-wise horizontal bar comparison chart.
 */
export function HostelBarChart({ data = [] }) {
    if (!data || data.length === 0) {
        return (
            <div className="py-8 px-4 flex flex-col items-center justify-center text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/80">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-2xl text-blue-600 shadow-sm mb-3">
                    🏢
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                    No Hostel Statistics Available
                </h3>
                <p className="mt-1 text-xs text-slate-500 max-w-sm">
                    Comparison of total vs resolved tickets per hostel block will automatically render here as complaints are recorded.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {["BH-1", "BH-2", "BH-3", "BH-4", "GH-1"].map((b) => (
                        <span
                            key={b}
                            className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 border border-slate-200 shadow-2xs"
                        >
                            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                            {b}: Optimal
                        </span>
                    ))}
                </div>
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
                    <div key={item.hostel} className="space-y-1.5 p-2 rounded-xl hover:bg-slate-50 transition">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                            <span className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                                {item.hostel}
                            </span>
                            <span className="text-slate-600 font-semibold">
                                {item.total} total <span className="text-emerald-600 font-bold">({item.resolved} resolved)</span> • <span className="text-blue-600 font-bold">{item.pending} active</span>
                            </span>
                        </div>

                        {/* Progress Bar Container */}
                        <div className="h-4 w-full rounded-full bg-slate-200 overflow-hidden flex shadow-inner">
                            <div
                                style={{ width: `${Math.min(100, Math.max(5, (item.resolved / maxVal) * 100))}%` }}
                                title={`Resolved: ${item.resolved}`}
                                className="bg-emerald-500 h-full transition-all duration-500"
                            />
                            <div
                                style={{ width: `${Math.min(100, Math.max(5, (item.pending / maxVal) * 100))}%` }}
                                title={`Active: ${item.pending}`}
                                className="bg-blue-600 h-full transition-all duration-500"
                            />
                        </div>
                    </div>
                );
            })}

            <div className="pt-3 flex items-center justify-center gap-6 text-xs font-bold text-slate-600 border-t border-slate-200">
                <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-500 shadow-sm" />
                    <span>Resolved</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-blue-600 shadow-sm" />
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
            <div className="py-6 px-4 flex flex-col items-center justify-center text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/80">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-xl text-indigo-600 shadow-sm mb-2">
                    📊
                </div>
                <h3 className="text-xs font-bold text-slate-800">
                    No Complaint Distribution Data
                </h3>
                <p className="mt-1 text-[11px] text-slate-500 max-w-xs">
                    Distribution breakdown updates automatically when complaints are logged into the system.
                </p>
                <div className="mt-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700 border border-emerald-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        Zero Load In Queue
                    </span>
                </div>
            </div>
        );
    }

    const defaultColors = {
        Submitted: "bg-amber-500 text-amber-800 border-amber-300",
        Assigned: "bg-blue-600 text-blue-800 border-blue-300",
        "In Progress": "bg-purple-600 text-purple-800 border-purple-300",
        Resolved: "bg-emerald-500 text-emerald-800 border-emerald-300",
        Closed: "bg-slate-500 text-slate-800 border-slate-300",
        Escalated: "bg-rose-600 text-rose-800 border-rose-300",
        Urgent: "bg-red-600 text-red-800 border-red-300",
        High: "bg-orange-500 text-orange-800 border-orange-300",
        Medium: "bg-blue-500 text-blue-800 border-blue-300",
        Low: "bg-slate-400 text-slate-800 border-slate-300",
    };

    return (
        <div className="space-y-4">
            {/* Multi-segment stacked bar */}
            <div className="flex h-6 w-full rounded-2xl overflow-hidden bg-slate-200 shadow-inner p-0.5 gap-0.5">
                {entries.map(([label, val]) => {
                    if (!val) return null;
                    const pct = (val / total) * 100;
                    const colorClass = (colors[label] || defaultColors[label] || "bg-slate-500").split(" ")[0];
                    return (
                        <div
                            key={label}
                            style={{ width: `${pct}%` }}
                            title={`${label}: ${val} (${Math.round(pct)}%)`}
                            className={`${colorClass} h-full rounded-lg transition-all duration-500 hover:opacity-90 shadow-sm`}
                        />
                    );
                })}
            </div>

            {/* Legend Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
                {entries.map(([label, val]) => {
                    const pct = total > 0 ? Math.round((val / total) * 100) : 0;
                    const colorClass = (colors[label] || defaultColors[label] || "bg-slate-500").split(" ")[0];
                    return (
                        <div key={label} className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                            <div className="flex items-center gap-2 truncate">
                                <span className={`h-3 w-3 rounded-md shrink-0 ${colorClass}`} />
                                <span className="text-slate-800 font-bold truncate">{label}</span>
                            </div>
                            <span className="text-slate-900 font-black shrink-0 ml-1">
                                {val} <span className="text-slate-400 font-semibold text-[10px]">({pct}%)</span>
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
