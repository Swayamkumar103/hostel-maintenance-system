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
            {/* Page Header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                        Overview & Metrics
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Live monitoring and priority tracking across maintenance requests.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href="/warden-admin/complaints"
                        className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition"
                    >
                        View All Complaints →
                    </Link>
                </div>
            </div>

            {/* KPI StatCards Grid (8 Cards) */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
                <StatCard
                    title="Total"
                    value={cards.total}
                    icon="📋"
                    color="gray"
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
                    color="indigo"
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
                <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">
                                Hostel Distribution
                            </h2>
                            <p className="text-xs text-slate-500">
                                Comparison of total complaints vs resolved per hostel.
                            </p>
                        </div>
                    </div>
                    <HostelBarChart data={hostelStats} />
                </div>

                {/* Priority & Status Breakdown */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-6">
                    <div>
                        <h2 className="text-base font-bold text-slate-900 mb-1">
                            Status Breakdown
                        </h2>
                        <p className="text-xs text-slate-500 mb-4">
                            Current progress of complaints.
                        </p>
                        <DistributionChart data={statusDistribution} />
                    </div>

                    <div className="border-t border-slate-100 pt-5">
                        <h2 className="text-base font-bold text-slate-900 mb-1">
                            Priority Distribution
                        </h2>
                        <p className="text-xs text-slate-500 mb-4">
                            Breakdown by urgency level.
                        </p>
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
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-bold text-slate-900">
                            Recent Complaints
                        </h2>
                        <p className="text-xs text-slate-500">
                            Latest maintenance requests submitted by students.
                        </p>
                    </div>

                    <Link
                        href="/warden-admin/complaints"
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                    >
                        View all →
                    </Link>
                </div>

                {recentComplaints.length === 0 ? (
                    <div className="py-10 text-center text-sm text-slate-400">
                        No complaints submitted yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
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
                                        <td className="px-4 py-3 font-semibold text-slate-900">
                                            <div className="truncate max-w-[200px]" title={c.title}>
                                                {c.title}
                                            </div>
                                            <span className="text-[11px] text-slate-400 font-normal">
                                                {c.category}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">
                                            {c.hostel} • Room {c.roomNumber}
                                        </td>
                                        <td className="px-4 py-3 text-slate-700">
                                            {c.studentName}
                                        </td>
                                        <td className="px-4 py-3">
                                            <PriorityBadge priority={c.priority} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={c.status} />
                                            {c.isOverdue && (
                                                <span className="ml-1 text-[10px] font-bold text-red-600">
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
                                                className="inline-flex rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
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
            </div>
        </div>
    );
}
