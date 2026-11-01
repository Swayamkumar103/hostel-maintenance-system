"use client";

export default function StatCard({
    title,
    value,
    icon,
    subtitle,
    color = "blue",
    onClick,
    isActive = false,
}) {
    const colorStyles = {
        blue: "border-blue-200 hover:border-blue-400 bg-white text-blue-600",
        amber: "border-amber-200 hover:border-amber-400 bg-white text-amber-600",
        indigo: "border-indigo-200 hover:border-indigo-400 bg-white text-indigo-600",
        emerald: "border-emerald-200 hover:border-emerald-400 bg-white text-emerald-600",
        gray: "border-gray-200 hover:border-gray-400 bg-white text-gray-600",
        rose: "border-rose-300 hover:border-rose-500 bg-rose-50/40 text-rose-600",
        red: "border-red-300 hover:border-red-500 bg-red-50/50 text-red-600",
    };

    const activeRing = isActive ? "ring-2 ring-blue-500 shadow-md" : "shadow-xs";

    return (
        <div
            onClick={onClick}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
            className={`rounded-2xl border p-5 transition duration-200 ${colorStyles[color] || colorStyles.blue} ${activeRing} ${
                onClick ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5" : ""
            }`}
        >
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    {title}
                </span>
                <span className="text-2xl">{icon}</span>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
                    {value ?? 0}
                </span>
            </div>

            {subtitle && (
                <p className="mt-1.5 text-xs text-gray-500">
                    {subtitle}
                </p>
            )}
        </div>
    );
}
