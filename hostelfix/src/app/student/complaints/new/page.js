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
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                    >
                        ← Back to My Complaints
                    </Link>
                    <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                        Submit Maintenance Request
                    </h1>
                    <p className="mt-1 text-xs text-slate-500">
                        Describe the issue clearly so hostel maintenance staff can diagnose and assign the right technician.
                    </p>
                </div>

                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
                    {/* Title */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Complaint Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Ceiling fan making loud buzzing sound..."
                            className="w-full rounded-xl border border-slate-300 p-3 text-xs outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    {/* Hostel & Room Number */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Hostel <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.hostel}
                                onChange={(e) => setFormData({ ...formData, hostel: e.target.value })}
                                className="w-full rounded-xl border border-slate-300 p-3 text-xs outline-none bg-white focus:border-blue-500"
                            >
                                {DEFAULT_HOSTELS.map((h) => (
                                    <option key={h} value={h}>
                                        {h}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Room Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.roomNumber}
                                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                                placeholder="e.g. 204 or B-12"
                                className="w-full rounded-xl border border-slate-300 p-3 text-xs outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                    </div>

                    {/* Category & Priority */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full rounded-xl border border-slate-300 p-3 text-xs outline-none bg-white focus:border-blue-500"
                            >
                                {MAINTENANCE_CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Estimated Priority
                            </label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                className="w-full rounded-xl border border-slate-300 p-3 text-xs outline-none bg-white focus:border-blue-500"
                            >
                                {PRIORITIES.map((p) => (
                                    <option key={p} value={p}>
                                        {p} {p === "Urgent" ? "(Emergency)" : ""}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Detailed Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            rows={4}
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Provide any specific details (e.g. how long it has been broken, convenient time for technician visit)..."
                            className="w-full rounded-xl border border-slate-300 p-3 text-xs outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-3">
                        <Link
                            href="/student/dashboard"
                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            {isSubmitting ? "Submitting..." : "Submit Complaint"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
