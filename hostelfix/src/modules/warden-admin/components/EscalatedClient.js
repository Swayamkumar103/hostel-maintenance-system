"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";

export default function EscalatedClient() {
    const [complaints, setComplaints] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [tab, setTab] = useState("all"); // 'all', 'escalated', 'overdue'

    const fetchEscalatedComplaints = useCallback(async () => {
        try {
            // Fetch both escalated and overdue
            const [escRes, ovrRes] = await Promise.all([
                fetch("/api/warden-admin/complaints?escalated=true&limit=50"),
                fetch("/api/warden-admin/complaints?overdue=true&limit=50"),
            ]);

            const escData = escRes.ok ? await escRes.json() : { complaints: [] };
            const ovrData = ovrRes.ok ? await ovrRes.json() : { complaints: [] };

            // Merge unique by _id
            const map = new Map();
            for (const c of escData.complaints || []) {
                map.set(c._id, { ...c, isEscalated: true });
            }
            for (const c of ovrData.complaints || []) {
                const existing = map.get(c._id);
                if (existing) {
                    existing.isOverdue = true;
                } else {
                    map.set(c._id, { ...c, isOverdue: true });
                }
            }

            setComplaints(Array.from(map.values()));
        } catch {
            // Silent
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchEscalatedComplaints();
    }, [fetchEscalatedComplaints]);

    const filtered = complaints.filter((c) => {
        if (tab === "escalated") return c.isEscalated;
        if (tab === "overdue") return c.sla?.isOverdue;
        return true;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                    <span>🚨</span> Escalated & Overdue Tickets
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    High-priority maintenance issues requiring immediate managerial attention or re-assignment.
                </p>
            </div>

            {/* Quick Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                <button
                    type="button"
                    onClick={() => setTab("all")}
                    className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                        tab === "all"
                            ? "bg-slate-900 text-white shadow-xs"
                            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                    }`}
                >
                    All Urgent ({complaints.length})
                </button>
                <button
                    type="button"
                    onClick={() => setTab("escalated")}
                    className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                        tab === "escalated"
                            ? "bg-rose-600 text-white shadow-xs"
                            : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                    }`}
                >
                    Escalated Only ({complaints.filter((c) => c.isEscalated).length})
                </button>
                <button
                    type="button"
                    onClick={() => setTab("overdue")}
                    className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                        tab === "overdue"
                            ? "bg-red-600 text-white shadow-xs"
                            : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                    }`}
                >
                    Overdue Only ({complaints.filter((c) => c.sla?.isOverdue).length})
                </button>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="py-20 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-3 border-slate-200 border-t-red-600" />
                    <p className="mt-3 text-xs font-medium text-slate-500">Scanning urgent tickets...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="rounded-3xl border-2 border-slate-200/90 bg-white py-16 text-center shadow-md shadow-slate-900/5">
                    <span className="text-3xl">🎉</span>
                    <h3 className="mt-2 text-base font-bold text-slate-800">No escalated or overdue tickets</h3>
                    <p className="mt-1 text-xs text-slate-500">All maintenance requests are operating within their SLA guidelines.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((c) => (
                        <div
                            key={c._id}
                            className="rounded-3xl border-2 border-slate-200/90 bg-white p-5 shadow-md shadow-slate-900/5 transition hover:shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                            <div className="space-y-1.5 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <PriorityBadge priority={c.priority} />
                                    <StatusBadge status={c.status} />
                                    {c.sla?.isOverdue && (
                                        <span className="rounded-md bg-red-100 border border-red-200 px-2 py-0.5 text-xs font-bold text-red-700">
                                            ⏰ OVERDUE ({c.sla.elapsedHours}h / {c.sla.slaHours}h SLA)
                                        </span>
                                    )}
                                    {c.isEscalated && (
                                        <span className="rounded-md bg-rose-100 border border-rose-200 px-2 py-0.5 text-xs font-bold text-rose-700">
                                            🚨 ESCALATED
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                                    {c.title}
                                </h3>

                                <p className="text-xs text-slate-600">
                                    Hostel <span className="font-semibold">{c.hostel}</span>, Room <span className="font-semibold">{c.roomNumber}</span> • Student: <span className="font-semibold">{c.student?.name}</span>
                                </p>

                                {c.escalationReason && (
                                    <div className="mt-2 rounded-xl bg-rose-50/70 border border-rose-100 p-2.5 text-xs text-rose-900">
                                        <span className="font-bold">Reason:</span> &ldquo;{c.escalationReason}&rdquo;
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                                <div className="text-right text-xs">
                                    <p className="font-semibold text-slate-700">
                                        {c.assignedTechnician ? c.assignedTechnician.name : "Unassigned"}
                                    </p>
                                    <p className="text-[11px] text-slate-400">
                                        {c.assignedTechnician ? c.assignedTechnician.specialization : "Needs technician"}
                                    </p>
                                </div>

                                <Link
                                    href={`/warden-admin/complaints/${c._id}`}
                                    className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition"
                                >
                                    Take Action →
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
