"use client";

import { DEFAULT_HOSTELS, MAINTENANCE_CATEGORIES, PRIORITIES } from "@/lib/constants";

export default function FilterBar({
    filters,
    onFilterChange,
    onReset,
    availableHostels = DEFAULT_HOSTELS,
    showOverdueToggle = true,
}) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs mb-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                {/* Search */}
                <div className="lg:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Search
                    </label>
                    <input
                        type="text"
                        value={filters.search || ""}
                        onChange={(e) => onFilterChange("search", e.target.value)}
                        placeholder="Search student, title, room..."
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>

                {/* Hostel */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Hostel
                    </label>
                    <select
                        value={filters.hostel || "All"}
                        onChange={(e) => onFilterChange("hostel", e.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                    >
                        <option value="All">All Hostels</option>
                        {availableHostels.map((h) => (
                            <option key={h} value={h}>
                                {h}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Category */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Category
                    </label>
                    <select
                        value={filters.category || "All"}
                        onChange={(e) => onFilterChange("category", e.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                    >
                        <option value="All">All Categories</option>
                        {MAINTENANCE_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Priority */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Priority
                    </label>
                    <select
                        value={filters.priority || "All"}
                        onChange={(e) => onFilterChange("priority", e.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                    >
                        <option value="All">All Priorities</option>
                        {PRIORITIES.map((p) => (
                            <option key={p} value={p}>
                                {p}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Status */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Status
                    </label>
                    <select
                        value={filters.status || "All"}
                        onChange={(e) => onFilterChange("status", e.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Submitted">Submitted</option>
                        <option value="Assigned">Assigned</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                        <option value="Escalated">Escalated</option>
                    </select>
                </div>
            </div>

            {/* Quick Filter Buttons & Reset */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-100">
                <div className="flex flex-wrap items-center gap-2">
                    {showOverdueToggle && (
                        <button
                            type="button"
                            onClick={() => onFilterChange("overdue", filters.overdue === "true" ? "false" : "true")}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                filters.overdue === "true"
                                    ? "bg-red-600 text-white shadow-xs"
                                    : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                            }`}
                        >
                            ⏰ Overdue Only
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => onFilterChange("escalated", filters.escalated === "true" ? "false" : "true")}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                            filters.escalated === "true"
                                ? "bg-rose-600 text-white shadow-xs"
                                : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                        }`}
                    >
                        🚨 Escalated Only
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onReset}
                        className="text-xs font-medium text-gray-500 hover:text-gray-800 transition underline underline-offset-2"
                    >
                        Reset Filters
                    </button>
                </div>
            </div>
        </div>
    );
}
