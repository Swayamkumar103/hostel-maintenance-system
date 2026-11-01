import { getAuthUser } from "@/lib/roleAuth";
import { redirect } from "next/navigation";
import connectDB from "@/lib/mongodb";
import Complaint from "@/module/complain";
import { getComplaintTimeline } from "@/modules/warden-admin/services/auditService";
import StatusBadge from "@/modules/warden-admin/components/StatusBadge";
import PriorityBadge from "@/modules/warden-admin/components/PriorityBadge";
import Timeline from "@/modules/warden-admin/components/Timeline";
import Link from "next/link";
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

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            {/* Top Navigation */}
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
                    <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-lg text-white font-bold">
                            🔧
                        </span>
                        <div>
                            <span className="text-base font-extrabold text-slate-900">
                                Hostel<span className="text-blue-600">Fix</span>
                            </span>
                            <span className="ml-2 rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 uppercase">
                                Student Portal
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-slate-700 hidden sm:inline">{user.name}</span>
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
                                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                            >
                                Logout
                            </button>
                        </form>
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                            My Maintenance Complaints
                        </h1>
                        <p className="mt-1 text-xs text-slate-500">
                            Track the progress, assigned technicians, and resolution details of your maintenance requests.
                        </p>
                    </div>

                    <Link
                        href="/student/complaints/new"
                        className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition"
                    >
                        + Submit New Complaint
                    </Link>
                </div>

                {/* Complaints List */}
                {complaintsWithTimeline.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
                        <span className="text-4xl">📭</span>
                        <h3 className="mt-3 text-base font-bold text-slate-800">No complaints logged yet</h3>
                        <p className="mt-1 text-xs text-slate-500">
                            Have an issue with electrical, plumbing, or room furniture?
                        </p>
                        <Link
                            href="/student/complaints/new"
                            className="mt-4 inline-block rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
                        >
                            Log a complaint
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {complaintsWithTimeline.map((c) => (
                            <div
                                key={c._id}
                                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <StatusBadge status={c.status} />
                                            <PriorityBadge priority={c.priority} />
                                            <span className="text-xs text-slate-400 font-mono">#{c._id.slice(-6)}</span>
                                        </div>
                                        <h2 className="text-lg font-bold text-slate-900">{c.title}</h2>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Hostel {c.hostel}, Room {c.roomNumber} • Category: {c.category} • Logged on {new Date(c.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>

                                    {/* Assigned Technician Card */}
                                    <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-xs sm:text-right">
                                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                                            Assigned Technician
                                        </span>
                                        {c.assignedTechnician ? (
                                            <div className="mt-1">
                                                <p className="font-bold text-slate-900">{c.assignedTechnician.name}</p>
                                                <p className="text-slate-500">{c.assignedTechnician.specialization || "General"}</p>
                                                {c.assignedTechnician.mobile && (
                                                    <p className="text-blue-600 font-medium">📱 {c.assignedTechnician.mobile}</p>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 italic">Pending Assignment</span>
                                        )}
                                    </div>
                                </div>

                                <p className="text-xs text-slate-700 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 whitespace-pre-line leading-relaxed">
                                    {c.description}
                                </p>

                                {/* Resolution notes if resolved */}
                                {c.resolutionNotes && (
                                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-900">
                                        <span className="font-bold block mb-1">✅ Resolution Details:</span>
                                        {c.resolutionNotes}
                                    </div>
                                )}

                                {/* Timeline */}
                                <div className="pt-3 border-t border-slate-100">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                                        Status Updates & Timeline
                                    </h4>
                                    <Timeline history={c.timeline} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
