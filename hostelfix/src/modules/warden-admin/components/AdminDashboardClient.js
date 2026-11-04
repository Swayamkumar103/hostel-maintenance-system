"use client";

import Link from "next/link";
import StatCard from "@/modules/warden-admin/components/StatCard";
import StatusBadge from "@/modules/warden-admin/components/StatusBadge";
import PriorityBadge from "@/modules/warden-admin/components/PriorityBadge";
import { HostelBarChart, DistributionChart } from "@/modules/warden-admin/components/Charts";

export default function AdminDashboardClient({ stats, userRole }) {
    const {
        cards = {},
        hostelStats = [],
        priorityOverview = {},
        statusDistribution = {},
        recentComplaints = [],
    } = stats;

    return (
        <div className="space-y-8 animate-in fade-in duration-200">
            {/* Top Command Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 p-6 sm:p-8 text-white shadow-xl">
                <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-cyan-400/20 blur-2xl"></div>
                <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                            <span className="rounded-md bg-white/15 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-cyan-200 border border-white/10">
                                Live Maintenance Telemetry
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                            Hostel Facility Control Tower
                        </h1>
                        <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
                            Real-time overview of maintenance tickets, SLA adherence, technician workload, and urgent hostel escalations.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <Link
                            href="/warden-admin/escalated"
                            className="inline-flex items-center gap-2 rounded-2xl bg-rose-500/90 hover:bg-rose-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-md border border-rose-400/30 transition-all"
                        >
                            <span>🚨</span> View Escalated ({cards.escalated || 0})
                        </Link>
                        <Link
                            href="/warden-admin/complaints"
                            className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-extrabold text-blue-900 shadow-md hover:bg-blue-50 transition-all"
                        >
                            <span>📋</span> All Complaints ({cards.total || 0})
                        </Link>
                    </div>
                </div>
            </div>

            {/* KPI StatCards Grid (8 Cards) */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
                <StatCard
                    title="Total"
                    value={cards.total}
                    icon="📋"
                    color="indigo"
                    subtitle="All logged"
                />
                <StatCard
                    title="Submitted"
                    value={cards.submitted}
                    icon="📥"
                    color="amber"
                    subtitle="Awaiting action"
                />
                <StatCard
                    title="Assigned"
                    value={cards.assigned}
                    icon="👷"
                    color="blue"
                    subtitle="With technician"
                />
                <StatCard
                    title="In Progress"
                    value={cards.inProgress}
                    icon="⚙️"
                    color="purple"
                    subtitle="Underway"
                />
                <StatCard
                    title="Resolved"
                    value={cards.resolved}
                    icon="✅"
                    color="emerald"
                    subtitle="Fixed by tech"
                />
                <StatCard
                    title="Closed"
                    value={cards.closed}
                    icon="🔒"
                    color="gray"
                    subtitle="Archived"
                />
                <StatCard
                    title="Escalated"
                    value={cards.escalated}
                    icon="🚨"
                    color="rose"
                    subtitle="Urgent attention"
                />
                <StatCard
                    title="Overdue"
                    value={cards.overdue}
                    icon="⏰"
                    color="red"
                    subtitle="SLA breached"
                />
            </div>

            {/* Visual Analytics Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Hostel-wise comparison chart */}
                <div className="lg:col-span-2 rounded-3xl border-2 border-slate-200/90 bg-white p-6 shadow-lg shadow-slate-900/5">
                    <div className="mb-5 flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-xl text-blue-700 shadow-2xs">
                                🏢
                            </span>
                            <div>
                                <h2 className="text-base font-black text-slate-900 tracking-tight">
                                    Hostel Distribution & Resolution
                                </h2>
                                <p className="text-xs text-slate-500 font-medium">
                                    Comparison of total complaints vs resolved across hostel blocks.
                                </p>
                            </div>
                        </div>
                    </div>
                    <HostelBarChart data={hostelStats} />
                </div>

                {/* Priority & Status Breakdown */}
                <div className="rounded-3xl border-2 border-slate-200/90 bg-white p-6 shadow-lg shadow-slate-900/5 space-y-6">
                    <div>
                        <div className="flex items-center gap-2.5 mb-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-base text-purple-700 shadow-2xs">
                                📈
                            </span>
                            <div>
                                <h2 className="text-sm font-black text-slate-900">
                                    Status Breakdown
                                </h2>
                                <p className="text-[11px] text-slate-500 font-medium">
                                    Current progress of complaints across lifecycle.
                                </p>
                            </div>
                        </div>
                        <DistributionChart data={statusDistribution} />
                    </div>

                    <div className="border-t border-slate-200 pt-5">
                        <div className="flex items-center gap-2.5 mb-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-base text-rose-700 shadow-2xs">
                                🎯
                            </span>
                            <div>
                                <h2 className="text-sm font-black text-slate-900">
                                    Priority Distribution
                                </h2>
                                <p className="text-[11px] text-slate-500 font-medium">
                                    Breakdown by urgency level & SLA risk.
                                </p>
                            </div>
                        </div>
                        <DistributionChart
                            data={priorityOverview}
                            colors={{
                                Urgent: "bg-red-600",
                                High: "bg-orange-500",
                                Medium: "bg-blue-500",
                                Low: "bg-slate-400",
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Recent Complaints Section */}
            <div className="rounded-3xl border-2 border-slate-200/90 bg-white p-6 shadow-lg shadow-slate-900/5">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 text-xl text-indigo-700 shadow-2xs">
                            📋
                        </span>
                        <div>
                            <h2 className="text-base font-black text-slate-900 tracking-tight">
                                Recent Complaint Influx
                            </h2>
                            <p className="text-xs text-slate-500 font-medium">
                                Latest maintenance requests submitted across student rooms.
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/warden-admin/complaints"
                        className="inline-flex items-center gap-1 rounded-xl bg-blue-50 px-3.5 py-1.5 text-xs font-black text-blue-700 hover:bg-blue-100 transition border border-blue-200 shadow-2xs"
                    >
                        View all complaints →
                    </Link>
                </div>

                {recentComplaints.length === 0 ? (
                    <div className="py-10 px-4 flex flex-col items-center justify-center text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/80">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-2xl text-blue-600 shadow-2xs mb-2">
                            📭
                        </span>
                        <h3 className="text-sm font-bold text-slate-800">
                            No Complaints Submitted Yet
                        </h3>
                        <p className="mt-1 text-xs text-slate-500 max-w-md">
                            All facilities are currently reported operational. Live maintenance tickets will show up here as students submit them.
                        </p>
                        <div className="mt-3">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-extrabold text-emerald-800 border border-emerald-200">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                System In Sync • 0 Pending Issues
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-extrabold border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3">Complaint</th>
                                    <th className="px-4 py-3">Location</th>
                                    <th className="px-4 py-3">Student</th>
                                    <th className="px-4 py-3">Priority</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Technician</th>
                                    <th className="px-4 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentComplaints.map((c) => (
                                    <tr key={c._id} className="hover:bg-slate-50/80 transition">
                                        <td className="px-4 py-3 font-bold text-slate-900">
                                            <div className="truncate max-w-[200px]" title={c.title}>
                                                {c.title}
                                            </div>
                                            <span className="text-[11px] text-slate-400 font-normal">
                                                {c.category}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 font-medium">
                                            {c.hostel} • Room {c.roomNumber}
                                        </td>
                                        <td className="px-4 py-3 text-slate-700 font-semibold">
                                            {c.studentName}
                                        </td>
                                        <td className="px-4 py-3">
                                            <PriorityBadge priority={c.priority} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={c.status} />
                                            {c.isOverdue && (
                                                <span className="ml-1 text-[10px] font-black text-red-600">
                                                    ⏰ OVERDUE
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">
                                            {c.assignedTechnicianName || (
                                                <span className="text-slate-400 italic">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link
                                                href={`/warden-admin/complaints/${c._id}`}
                                                className="inline-flex rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
                                            >
                                                Manage →
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
