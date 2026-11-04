import { getAuthUser } from "@/lib/roleAuth";
import { redirect } from "next/navigation";
import connectDB from "@/lib/mongodb";
import Complaint from "@/module/complain";
import { getComplaintTimeline } from "@/modules/warden-admin/services/auditService";
import StatusBadge from "@/modules/warden-admin/components/StatusBadge";
import PriorityBadge from "@/modules/warden-admin/components/PriorityBadge";
import Timeline from "@/modules/warden-admin/components/Timeline";
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";


export default async function StudentDashboardPage() {
    const user = await getAuthUser();
    if (!user || user.role !== "student") {
        redirect("/login");
    }

    await connectDB();
    const complaints = await Complaint.find({ studentId: user._id })
        .populate("assignedTechnician", "name mobile specialization")
        .sort({ createdAt: -1 })
        .lean();

    const complaintsWithTimeline = await Promise.all(
        complaints.map(async (c) => ({
            ...c,
            _id: c._id.toString(),
            timeline: await getComplaintTimeline(c._id, true),
        }))
    );

    const totalCount = complaintsWithTimeline.length;
    const resolvedCount = complaintsWithTimeline.filter((c) => c.status === "Completed" || c.status === "Resolved").length;
    const pendingCount = complaintsWithTimeline.filter((c) => c.status === "Pending" || c.status === "Assigned").length;
    const inProgressCount = complaintsWithTimeline.filter((c) => c.status === "In Progress").length;

    const categoryIcons = {
        Electrical: "⚡",
        Plumbing: "🚰",
        Carpentry: "🪑",
        Appliance: "❄️",
        Housekeeping: "🧹",
        Network: "🌐",
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            {/* Top Navigation */}
            <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex items-center gap-2 group">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-lg text-white font-bold shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                                🎓
                            </span>
                            <div>
                                <span className="text-base font-extrabold text-slate-900">
                                    Hostel<span className="text-emerald-600">Fix</span>
                                </span>
                                <span className="ml-2 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase tracking-wider border border-emerald-200">
                                    Student Portal
                                </span>
                            </div>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex flex-col text-right">
                            <span className="text-xs font-bold text-slate-800">{user.name}</span>
                            <span className="text-[11px] text-slate-400 font-medium">Hostel {user.hostel || "Resident"} • Room {user.roomNumber || "Campus"}</span>
                        </div>
                        <form
                            action={async () => {
                                "use server";
                                const c = await cookies();
                                c.delete("token");
                                redirect("/login");
                            }}
                        >
                            <button
                                type="submit"
                                className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
                            >
                                Sign Out
                            </button>
                        </form>
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-6">
                {/* Welcome & Action Banner */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 p-6 sm:p-8 text-white shadow-xl">
                    <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-teal-400/20 blur-2xl"></div>
                    <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="space-y-2">
                            <span className="inline-block rounded-md bg-white/15 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-teal-200 border border-white/10">
                                Resident Dashboard
                            </span>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                                Welcome, {user.name} 👋
                            </h1>
                            <p className="text-xs sm:text-sm text-teal-100 max-w-xl">
                                Track real-time progress on your room maintenance requests, contact assigned technicians, and verify ticket resolutions.
                            </p>
                        </div>

                        <Link
                            href="/student/complaints/new"
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-xs sm:text-sm font-extrabold text-emerald-800 shadow-lg shadow-black/10 hover:bg-emerald-50 hover:scale-102 transition-all cursor-pointer whitespace-nowrap"
                        >
                            <span>⚡ + Submit New Complaint</span>
                        </Link>
                    </div>

                    {/* Quick Metric Chips */}
                    <div className="mt-6 pt-6 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold">
                        <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                            <span className="text-teal-200 block text-[11px] font-medium">Total Complaints</span>
                            <span className="text-2xl font-black">{totalCount}</span>
                        </div>
                        <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                            <span className="text-amber-200 block text-[11px] font-medium">Pending Assignment</span>
                            <span className="text-2xl font-black">{pendingCount}</span>
                        </div>
                        <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                            <span className="text-cyan-200 block text-[11px] font-medium">In Progress</span>
                            <span className="text-2xl font-black">{inProgressCount}</span>
                        </div>
                        <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                            <span className="text-emerald-200 block text-[11px] font-medium">Resolved & Verified</span>
                            <span className="text-2xl font-black">{resolvedCount}</span>
                        </div>
                    </div>
                </div>

                {/* Section Title */}
                <div className="flex items-center justify-between pt-2">
                    <div>
                        <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                            My Complaint History
                        </h2>
                        <p className="text-xs text-slate-500">Live SLA status & complete maintenance timeline</p>
                    </div>
                    <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-lg px-3 py-1">
                        {totalCount} {totalCount === 1 ? "Ticket" : "Tickets"} Logged
                    </span>
                </div>

                {/* Complaints List */}
                {complaintsWithTimeline.length === 0 ? (
                    <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm space-y-4">
                        <Image
                            src="/illustrations/empty-tickets.svg"
                            alt="No complaints"
                            width={192}
                            height={154}
                            className="w-48 h-auto mx-auto drop-shadow-sm"
                        />
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">All Clear! No Active Complaints</h3>
                            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                                Everything in your room is in working order. If you encounter an electrical, plumbing, or furniture issue, log it anytime!
                            </p>
                        </div>
                        <div>
                            <Link
                                href="/student/complaints/new"
                                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:from-emerald-700 hover:to-teal-700 transition"
                            >
                                + Raise a Maintenance Request
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {complaintsWithTimeline.map((c) => {
                            const icon = categoryIcons[c.category] || "🔧";
                            return (
                                <div
                                    key={c._id}
                                    className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs hover:shadow-md transition space-y-5"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <StatusBadge status={c.status} />
                                                <PriorityBadge priority={c.priority} />
                                                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                                                    <span>{icon}</span> {c.category}
                                                </span>
                                                <span className="text-xs text-slate-400 font-mono">#{c._id.slice(-6)}</span>
                                            </div>

                                            <h3 className="text-lg sm:text-xl font-black text-slate-900">{c.title}</h3>

                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                                                <span>🏢 Hostel {c.hostel} • Room {c.roomNumber}</span>
                                                <span>📅 Logged on {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                                            </div>
                                        </div>

                                        {/* Assigned Technician Card */}
                                        <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-200/80 p-3.5 text-xs sm:text-right min-w-[200px]">
                                            <span className="text-[10px] uppercase font-extrabold text-slate-400 block tracking-wider">
                                                Assigned Specialist
                                            </span>
                                            {c.assignedTechnician ? (
                                                <div className="mt-1 space-y-0.5">
                                                    <p className="font-extrabold text-slate-900 flex sm:justify-end items-center gap-1">
                                                        <span>🔧</span> {c.assignedTechnician.name}
                                                    </p>
                                                    <p className="text-slate-500 font-medium">{c.assignedTechnician.specialization || "General Maintenance"}</p>
                                                    {c.assignedTechnician.mobile && (
                                                        <p className="text-blue-600 font-bold">📱 {c.assignedTechnician.mobile}</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="mt-1 flex items-center gap-1 sm:justify-end text-amber-600 font-semibold text-xs">
                                                    <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
                                                    <span>Warden Reviewing</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Issue Description */}
                                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 text-xs text-slate-700 leading-relaxed">
                                        <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider block mb-1">Issue Details:</span>
                                        {c.description}
                                    </div>

                                    {/* Resolution notes if resolved */}
                                    {c.resolutionNotes && (
                                        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-950">
                                            <div className="flex items-center gap-1.5 font-bold mb-1 text-emerald-800">
                                                <span>✅</span> Resolution Notes by Technician:
                                            </div>
                                            <p className="leading-relaxed">{c.resolutionNotes}</p>
                                        </div>
                                    )}

                                    {/* Timeline */}
                                    <div className="pt-4 border-t border-slate-100">
                                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                                            <span>⏱️</span> State Transitions & Audit Trail
                                        </h4>
                                        <Timeline history={c.timeline} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
