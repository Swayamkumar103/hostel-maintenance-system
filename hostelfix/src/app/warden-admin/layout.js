import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import NotificationBell from "@/modules/warden-admin/components/NotificationBell";
import { getAuthUser } from "@/lib/roleAuth";

export default async function WardenAdminLayout({ children }) {
    const user = await getAuthUser();

    if (!user || (user.role !== "admin" && user.role !== "warden")) {
        redirect("/login");
    }

    const hostelScopeText = user.role === "admin"
        ? "All Hostels Scope"
        : user.assignedHostels?.length
            ? user.assignedHostels.join(", ")
            : user.hostel || "Assigned Hostel";

    return (
        <div className="relative min-h-screen text-slate-900 flex flex-col font-sans bg-slate-100/50">
            {/* Background Image Layer */}
            <div
                className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: "url('/admin-banner.jpg')",
                    backgroundAttachment: "fixed",
                }}
            >
                <div className="absolute inset-0 bg-slate-50/70 backdrop-blur-[1.5px]" />
            </div>

            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
                    {/* Brand */}
                    <div className="flex items-center gap-6">
                        <Link href="/warden-admin/dashboard" className="flex items-center gap-2.5 group">
                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-lg font-black text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                                🛡️
                            </span>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-base font-extrabold tracking-tight text-slate-900">
                                        Hostel<span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Fix</span>
                                    </span>
                                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[9px] font-extrabold text-blue-700 uppercase tracking-widest border border-blue-200">
                                        {user.role}
                                    </span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium">Control Tower & SLA Dispatch</p>
                            </div>
                        </Link>

                        {/* Navigation Links */}
                        <nav className="hidden md:flex items-center gap-1 text-xs font-bold text-slate-600">
                            <Link
                                href="/warden-admin/dashboard"
                                className="rounded-xl px-3 py-2 hover:bg-slate-100 hover:text-slate-900 transition"
                            >
                                📊 Dashboard
                            </Link>
                            <Link
                                href="/warden-admin/complaints"
                                className="rounded-xl px-3 py-2 hover:bg-slate-100 hover:text-slate-900 transition"
                            >
                                📋 Complaints
                            </Link>
                            <Link
                                href="/warden-admin/technicians"
                                className="rounded-xl px-3 py-2 hover:bg-slate-100 hover:text-slate-900 transition"
                            >
                                🔧 Technicians
                            </Link>
                            <Link
                                href="/warden-admin/escalated"
                                className="rounded-xl px-3 py-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition flex items-center gap-1"
                            >
                                <span>🚨</span> Escalated & Overdue
                            </Link>
                        </nav>
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex flex-col text-right">
                            <span className="text-xs font-bold text-slate-800 flex items-center justify-end gap-1">
                                {user.role === "admin" ? "👑" : "🛡️"} {user.name}
                            </span>
                            <span className="text-[11px] text-blue-600 font-semibold">{hostelScopeText}</span>
                        </div>

                        {/* Notification Bell */}
                        <NotificationBell />

                        {/* Sign Out Form */}
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
                                title="Sign Out"
                                className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
                            >
                                Sign Out
                            </button>
                        </form>
                    </div>
                </div>

                {/* Mobile Navigation bar */}
                <div className="flex md:hidden overflow-x-auto px-4 py-2 gap-2 border-t border-slate-100 text-xs font-bold text-slate-600 bg-slate-50">
                    <Link href="/warden-admin/dashboard" className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 shrink-0">
                        📊 Dashboard
                    </Link>
                    <Link href="/warden-admin/complaints" className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 shrink-0">
                        📋 Complaints
                    </Link>
                    <Link href="/warden-admin/technicians" className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 shrink-0">
                        🔧 Technicians
                    </Link>
                    <Link href="/warden-admin/escalated" className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                        🚨 Escalated
                    </Link>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="relative z-10 flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
                {children}
            </main>

            <footer className="relative z-10 mt-auto border-t border-slate-200/90 bg-white/95 backdrop-blur-md py-4 px-4 text-center text-xs font-semibold text-slate-600 shadow-2xs">
                HostelFix • Warden & Admin Management Module • Final Year Capstone Project
            </footer>
        </div>
    );
}
