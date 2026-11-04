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
        indigo: {
            card: "border-indigo-300/90 hover:border-indigo-500 bg-white shadow-md shadow-indigo-500/5 hover:shadow-xl",
            iconBg: "bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-sm shadow-indigo-500/30",
            titleColor: "text-indigo-950",
            numColor: "text-indigo-600",
            accent: "from-indigo-500 via-blue-600 to-indigo-700",
            badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
        },
        blue: {
            card: "border-sky-300/90 hover:border-sky-500 bg-white shadow-md shadow-sky-500/5 hover:shadow-xl",
            iconBg: "bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sm shadow-sky-500/30",
            titleColor: "text-sky-950",
            numColor: "text-sky-600",
            accent: "from-sky-400 via-blue-500 to-cyan-500",
            badgeBg: "bg-sky-50 text-sky-700 border-sky-200",
        },
        amber: {
            card: "border-amber-300/90 hover:border-amber-500 bg-white shadow-md shadow-amber-500/5 hover:shadow-xl",
            iconBg: "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm shadow-amber-500/30",
            titleColor: "text-amber-950",
            numColor: "text-amber-600",
            accent: "from-amber-400 via-orange-500 to-amber-600",
            badgeBg: "bg-amber-50 text-amber-800 border-amber-200",
        },
        purple: {
            card: "border-purple-300/90 hover:border-purple-500 bg-white shadow-md shadow-purple-500/5 hover:shadow-xl",
            iconBg: "bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-sm shadow-purple-500/30",
            titleColor: "text-purple-950",
            numColor: "text-purple-600",
            accent: "from-purple-500 via-fuchsia-500 to-indigo-600",
            badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
        },
        emerald: {
            card: "border-emerald-300/90 hover:border-emerald-500 bg-white shadow-md shadow-emerald-500/5 hover:shadow-xl",
            iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/30",
            titleColor: "text-emerald-950",
            numColor: "text-emerald-600",
            accent: "from-emerald-400 via-teal-500 to-emerald-600",
            badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
        },
        gray: {
            card: "border-slate-300/90 hover:border-slate-500 bg-white shadow-md shadow-slate-500/5 hover:shadow-xl",
            iconBg: "bg-gradient-to-br from-slate-600 to-slate-800 text-white shadow-sm shadow-slate-500/30",
            titleColor: "text-slate-900",
            numColor: "text-slate-700",
            accent: "from-slate-400 via-slate-600 to-slate-800",
            badgeBg: "bg-slate-100 text-slate-700 border-slate-200",
        },
        rose: {
            card: "border-rose-300/90 hover:border-rose-500 bg-white shadow-md shadow-rose-500/10 hover:shadow-xl",
            iconBg: "bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-sm shadow-rose-500/30",
            titleColor: "text-rose-950",
            numColor: "text-rose-600",
            accent: "from-rose-400 via-red-500 to-rose-600",
            badgeBg: "bg-rose-50 text-rose-800 border-rose-200",
        },
        red: {
            card: "border-red-300/90 hover:border-red-500 bg-white shadow-md shadow-red-500/10 hover:shadow-xl",
            iconBg: "bg-gradient-to-br from-red-500 to-rose-700 text-white shadow-sm shadow-red-500/30",
            titleColor: "text-red-950",
            numColor: "text-red-600",
            accent: "from-red-500 via-rose-600 to-red-700",
            badgeBg: "bg-red-50 text-red-800 border-red-200",
        },
    };

    const currentStyle = colorStyles[color] || colorStyles.indigo;
    const activeRing = isActive ? "ring-2 ring-blue-500 shadow-xl scale-[1.02]" : "";

    return (
        <div
            onClick={onClick}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
            className={`group relative overflow-hidden rounded-3xl border-2 p-4 sm:p-5 transition-all duration-200 ${currentStyle.card} ${activeRing} ${
                onClick ? "cursor-pointer hover:-translate-y-1" : "hover:-translate-y-0.5"
            }`}
        >
            {/* Top decorative gradient line */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${currentStyle.accent}`}></div>

            <div className="flex items-center justify-between gap-1">
                <span className={`text-[11px] font-black uppercase tracking-wider ${currentStyle.titleColor}`}>
                    {title}
                </span>
                <span className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-2xl text-lg sm:text-xl shrink-0 group-hover:scale-110 transition-transform ${currentStyle.iconBg}`}>
                    {icon}
                </span>
            </div>

            <div className="mt-3 flex items-baseline gap-1.5">
                <span className={`text-3xl sm:text-4xl font-black tracking-tight ${currentStyle.numColor}`}>
                    {value ?? 0}
                </span>
            </div>

            {subtitle && (
                <div className="mt-2 flex items-center">
                    <span className={`inline-block rounded-md px-1.5 py-0.5 text-[10px] font-bold border ${currentStyle.badgeBg}`}>
                        {subtitle}
                    </span>
                </div>
            )}
        </div>
    );
}
