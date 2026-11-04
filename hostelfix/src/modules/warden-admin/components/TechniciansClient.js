"use client";

import { useState } from "react";
import { MAINTENANCE_CATEGORIES } from "@/lib/constants";

export default function TechniciansClient({ initialTechnicians = [] }) {
    const [selectedSpec, setSelectedSpec] = useState("All");
    const [search, setSearch] = useState("");

    const filtered = initialTechnicians.filter((t) => {
        const matchesSpec = selectedSpec === "All" || t.specialization === selectedSpec;
        const matchesSearch = !search.trim() ||
            t.name.toLowerCase().includes(search.toLowerCase()) ||
            t.email.toLowerCase().includes(search.toLowerCase()) ||
            (t.specialization && t.specialization.toLowerCase().includes(search.toLowerCase()));
        return matchesSpec && matchesSearch;
    });

    const availabilityStyles = {
        Available: "bg-emerald-100 text-emerald-800 border-emerald-200",
        Moderate: "bg-blue-100 text-blue-800 border-blue-200",
        Busy: "bg-rose-100 text-rose-800 border-rose-200",
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                        Technicians & Workload
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Monitor active ticket loads and assignments across hostel maintenance staff.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                        Total Staff: {initialTechnicians.length}
                    </span>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 rounded-3xl border-2 border-slate-200/90 bg-white p-5 shadow-md shadow-slate-900/5">
                <div className="flex-1">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search technician by name, specialization, email..."
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>

                <div className="sm:w-60">
                    <select
                        value={selectedSpec}
                        onChange={(e) => setSelectedSpec(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs outline-none bg-white focus:border-blue-500"
                    >
                        <option value="All">All Specializations</option>
                        {MAINTENANCE_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Technicians Grid */}
            {filtered.length === 0 ? (
                <div className="rounded-3xl border-2 border-slate-200/90 bg-white py-16 text-center shadow-md shadow-slate-900/5">
                    <span className="text-3xl">👷</span>
                    <h3 className="mt-2 text-base font-bold text-slate-800">No technicians found</h3>
                    <p className="mt-1 text-xs text-slate-500">No technician matches the current search or filter criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((tech) => (
                        <div
                            key={tech._id}
                            className="rounded-3xl border-2 border-slate-200/90 bg-white p-5 shadow-md shadow-slate-900/5 transition hover:shadow-xl hover:-translate-y-0.5"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-bold text-base text-slate-900">{tech.name}</h3>
                                    <span className="inline-block mt-0.5 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                                        {tech.specialization}
                                    </span>
                                </div>

                                <span
                                    className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                                        availabilityStyles[tech.availability] || "bg-slate-100 text-slate-700"
                                    }`}
                                >
                                    {tech.availability}
                                </span>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                                <p className="flex items-center gap-2">
                                    <span>📧</span>
                                    <span className="truncate">{tech.email}</span>
                                </p>
                                <p className="flex items-center gap-2">
                                    <span>📱</span>
                                    <span>{tech.mobile || "N/A"}</span>
                                </p>
                                <p className="flex items-center gap-2">
                                    <span>🆔</span>
                                    <span>Emp ID: {tech.employeeId || "N/A"}</span>
                                </p>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-xs text-slate-500 font-medium">Active Complaints:</span>
                                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-900">
                                    {tech.activeWorkload} tasks
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
