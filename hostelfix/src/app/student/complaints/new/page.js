"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DEFAULT_HOSTELS, MAINTENANCE_CATEGORIES, PRIORITIES } from "@/lib/constants";

export default function NewComplaintPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        hostel: DEFAULT_HOSTELS[0] || "BH-1",
        roomNumber: "",
        category: MAINTENANCE_CATEGORIES[0] || "Electrical",
        priority: "Medium",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const categoryData = [
        { name: "Electrical", icon: "⚡", desc: "Lights, switches, fans, wiring" },
        { name: "Plumbing", icon: "🚰", desc: "Taps, leaks, drainage, flush" },
        { name: "Carpentry", icon: "🪑", desc: "Doors, locks, cupboards, desk" },
        { name: "Appliance", icon: "❄️", desc: "Water cooler, geyser, AC" },
        { name: "Housekeeping", icon: "🧹", desc: "Cleaning, corridors, washroom" },
        { name: "Civil", icon: "🧱", desc: "Walls, windows, tile repairs" },
    ];

    const priorityData = [
        { name: "Low", label: "Low Priority", sla: "48h Target SLA", color: "border-slate-200 hover:border-emerald-300", active: "border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-200" },
        { name: "Medium", label: "Standard / Medium", sla: "24h Target SLA", color: "border-slate-200 hover:border-blue-300", active: "border-blue-500 bg-blue-50 text-blue-800 ring-2 ring-blue-200" },
        { name: "Urgent", label: "Urgent Emergency", sla: "4h Immediate SLA", color: "border-slate-200 hover:border-rose-300", active: "border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-200" },
    ];

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (!formData.title || !formData.description || !formData.roomNumber) {
            setError("Please fill out all required fields.");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/student/complaints", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || "Failed to submit complaint.");
            }

            router.push("/student/dashboard");
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 font-sans">
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <Link
                        href="/student/dashboard"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 transition"
                    >
                        ← Back to My Complaints
                    </Link>
                    <div className="mt-2 flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-lg shadow-md shadow-emerald-500/20">
                            📝
                        </span>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                                Submit Maintenance Request
                            </h1>
                            <p className="text-xs text-slate-500">
                                Log your hostel room issue for automated SLA tracking and technician dispatch.
                            </p>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 flex items-center gap-2">
                        <span>⚠️</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
                    {/* Select Category Visual Tiles */}
                    <div>
                        <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                            1. Select Issue Category <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            {categoryData.map((cat) => {
                                const isSelected = formData.category === cat.name;
                                return (
                                    <button
                                        type="button"
                                        key={cat.name}
                                        onClick={() => setFormData({ ...formData, category: cat.name })}
                                        className={`rounded-2xl border p-3 text-left transition cursor-pointer ${
                                            isSelected
                                                ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200 shadow-xs"
                                                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                                        }`}
                                    >
                                        <span className="text-xl block mb-1">{cat.icon}</span>
                                        <span className={`text-xs font-bold block ${isSelected ? "text-emerald-950" : "text-slate-800"}`}>
                                            {cat.name}
                                        </span>
                                        <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">
                                            {cat.desc}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Complaint Title */}
                    <div>
                        <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                            2. Complaint Summary / Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Ceiling fan regulator not working in room 304"
                            className="w-full rounded-2xl border border-slate-300 bg-slate-50/50 p-3.5 text-xs text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                        />
                    </div>

                    {/* Hostel & Room Number */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                                3. Hostel Block <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.hostel}
                                onChange={(e) => setFormData({ ...formData, hostel: e.target.value })}
                                className="w-full rounded-2xl border border-slate-300 bg-slate-50/50 p-3.5 text-xs text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white"
                            >
                                {DEFAULT_HOSTELS.map((h) => (
                                    <option key={h} value={h}>
                                        {h}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                                4. Room Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.roomNumber}
                                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                                placeholder="e.g. 304 or B-12"
                                className="w-full rounded-2xl border border-slate-300 bg-slate-50/50 p-3.5 text-xs text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                            />
                        </div>
                    </div>

                    {/* Urgency / Priority */}
                    <div>
                        <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                            5. Priority Level & Expected SLA
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            {priorityData.map((p) => {
                                const isSelected = formData.priority === p.name;
                                return (
                                    <button
                                        type="button"
                                        key={p.name}
                                        onClick={() => setFormData({ ...formData, priority: p.name })}
                                        className={`rounded-2xl border p-3 text-left transition cursor-pointer ${
                                            isSelected ? p.active : p.color
                                        }`}
                                    >
                                        <div className="text-xs font-bold block">{p.label}</div>
                                        <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                                            {p.sla}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                            6. Detailed Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            required
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Provide specific details (e.g. happened since yesterday, sparks seen, water dripping continuously)..."
                            className="w-full rounded-2xl border border-slate-300 bg-slate-50/50 p-3.5 text-xs text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                        />
                    </div>

                    {/* Submission Button */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 text-xs font-bold text-white shadow-md shadow-emerald-500/25 hover:from-emerald-700 hover:to-teal-700 transition disabled:opacity-50 cursor-pointer"
                        >
                            {isSubmitting ? "Submitting Complaint to SLA Engine..." : "Submit Complaint to Warden →"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
