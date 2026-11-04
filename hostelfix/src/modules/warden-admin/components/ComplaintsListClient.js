"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import FilterBar from "./FilterBar";
import Pagination from "./Pagination";

export default function ComplaintsListClient({ initialHostels = [] }) {
    const [complaints, setComplaints] = useState([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const [filters, setFilters] = useState({
        search: "",
        hostel: "All",
        category: "All",
        priority: "All",
        status: "All",
        overdue: "false",
        escalated: "false",
        sortBy: "createdAt",
        sortOrder: "desc",
    });

    const fetchComplaints = useCallback(async () => {
        try {
            const params = new URLSearchParams({
                page: String(page),
                limit: "10",
                search: filters.search,
                hostel: filters.hostel,
                category: filters.category,
                priority: filters.priority,
                status: filters.status,
                overdue: filters.overdue,
                escalated: filters.escalated,
                sortBy: filters.sortBy,
                sortOrder: filters.sortOrder,
            });

            const res = await fetch(`/api/warden-admin/complaints?${params.toString()}`);
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || "Failed to load complaints");
            }

            const data = await res.json();
            setComplaints(data.complaints || []);
            setTotal(data.total || 0);
            setTotalPages(data.totalPages || 1);
            setError("");
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [page, filters]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchComplaints();
    }, [fetchComplaints]);

    function handleFilterChange(key, value) {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setPage(1); // Reset to page 1 on filter change
    }

    function handleReset() {
        setFilters({
            search: "",
            hostel: "All",
            category: "All",
            priority: "All",
            status: "All",
            overdue: "false",
            escalated: "false",
            sortBy: "createdAt",
            sortOrder: "desc",
        });
        setPage(1);
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                        Complaints Directory
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Filter, inspect, reassign, and track hostel maintenance tickets.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                        Total: {total}
                    </span>
                </div>
            </div>

            {/* Filter Bar */}
            <FilterBar
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleReset}
                availableHostels={initialHostels}
            />

            {/* Error Message */}
            {error && (
                <div className="rounded-xl bg-red-50 p-4 border border-red-200 text-xs font-semibold text-red-700">
                    {error}
                </div>
            )}

            {/* Table / List */}
            <div className="rounded-3xl border-2 border-slate-200/90 bg-white p-4 sm:p-6 shadow-md shadow-slate-900/5">
                {isLoading ? (
                    <div className="py-20 text-center">
                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-3 border-slate-200 border-t-blue-600" />
                        <p className="mt-3 text-xs font-medium text-slate-500">Loading complaints...</p>
                    </div>
                ) : complaints.length === 0 ? (
                    <div className="py-16 text-center">
                        <span className="text-3xl">📭</span>
                        <h3 className="mt-2 text-base font-bold text-slate-800">No complaints found</h3>
                        <p className="mt-1 text-xs text-slate-500">Try adjusting your filters or search terms.</p>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="mt-4 rounded-xl bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
                        >
                            Reset all filters
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3">ID / Title</th>
                                    <th className="px-4 py-3">Hostel & Room</th>
                                    <th className="px-4 py-3">Student</th>
                                    <th className="px-4 py-3">Priority</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Technician</th>
                                    <th className="px-4 py-3">Logged</th>
                                    <th className="px-4 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {complaints.map((c) => (
                                    <tr key={c._id} className="hover:bg-slate-50/80 transition">
                                        <td className="px-4 py-3">
                                            <div className="font-bold text-slate-900 line-clamp-1" title={c.title}>
                                                {c.title}
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                                                <span>#{c._id.slice(-6)}</span>
                                                <span>•</span>
                                                <span className="font-medium text-slate-600">{c.category}</span>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-slate-700">
                                            <div className="font-semibold">{c.hostel}</div>
                                            <div className="text-[11px] text-slate-500">Room {c.roomNumber}</div>
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="font-semibold text-slate-800">{c.student?.name || "Student"}</div>
                                            <div className="text-[11px] text-slate-500">{c.student?.mobile || c.student?.email}</div>
                                        </td>

                                        <td className="px-4 py-3">
                                            <PriorityBadge priority={c.priority} />
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex flex-col gap-1 items-start">
                                                <StatusBadge status={c.status} />
                                                {c.sla?.isOverdue && (
                                                    <span className="rounded-sm bg-red-100 px-1.5 py-0.2 text-[10px] font-bold text-red-700">
                                                        ⚠️ OVERDUE
                                                    </span>
                                                )}
                                                {c.isEscalated && (
                                                    <span className="rounded-sm bg-rose-100 px-1.5 py-0.2 text-[10px] font-bold text-rose-700">
                                                        🚨 ESCALATED
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-slate-700">
                                            {c.assignedTechnician ? (
                                                <div>
                                                    <div className="font-medium text-slate-900">{c.assignedTechnician.name}</div>
                                                    <div className="text-[10px] text-slate-500">{c.assignedTechnician.specialization}</div>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic">Unassigned</span>
                                            )}
                                        </td>

                                        <td className="px-4 py-3 text-slate-500 text-[11px]">
                                            {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "N/A"}
                                        </td>

                                        <td className="px-4 py-3 text-right">
                                            <Link
                                                href={`/warden-admin/complaints/${c._id}`}
                                                className="inline-flex rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition shadow-2xs"
                                            >
                                                Manage
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                <Pagination
                    page={page}
                    totalPages={totalPages}
                    total={total}
                    limit={10}
                    onPageChange={(p) => setPage(p)}
                />
            </div>
        </div>
    );
}
