import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import Link from "next/link";
import NotificationBell from "@/modules/warden-admin/components/NotificationBell";
import connectDB from "@/lib/mongodb";
import User from "@/module/User";

export default async function WardenAdminLayout({ children }) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
        redirect("/login");
    }

    let user = null;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "hostelfix_dev_secret_key_123");
        await connectDB();
        user = await User.findById(decoded.userId).select("-password").lean();
    } catch {
        redirect("/login");
    }

    if (!user || (user.role !== "admin" && user.role !== "warden")) {
        redirect("/login");
    }

    const hostelScopeText = user.role === "admin"
        ? "All Hostels"
        : user.assignedHostels?.length
            ? user.assignedHostels.join(", ")
            : user.hostel || "Assigned Hostel";

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
                    {/* Brand */}
                    <div className="flex items-center gap-6">
                        <Link href="/warden-admin/dashboard" className="flex items-center gap-2 group">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-lg font-black text-white shadow-sm group-hover:bg-blue-700 transition">
                                🔧
                            </span>
                            <div>
                                <span className="text-base font-extrabold tracking-tight text-slate-900">
                                    Hostel<span className="text-blue-600">Fix</span>
                                </span>
                                <span className="ml-2 rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                                    {user.role}
                                </span>
                            </div>
                        </Link>

                        {/* Navigation Links */}
                        <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-slate-600">
                            <Link
                                href="/warden-admin/dashboard"
                                className="rounded-lg px-3 py-1.5 hover:bg-slate-100 hover:text-slate-900 transition"
                            >
                                Dashboard
                            </Link>
                            <Link
                                href="/warden-admin/complaints"
                                className="rounded-lg px-3 py-1.5 hover:bg-slate-100 hover:text-slate-900 transition"
                            >
                                Complaints
                            </Link>
                            <Link
                                href="/warden-admin/technicians"
                                className="rounded-lg px-3 py-1.5 hover:bg-slate-100 hover:text-slate-900 transition"
                            >
                                Technicians
                            </Link>
                            <Link
                                href="/warden-admin/escalated"
                                className="rounded-lg px-3 py-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition flex items-center gap-1"
                            >
                                <span>🚨</span> Escalated & Overdue
                            </Link>
                        </nav>
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex flex-col text-right">
                            <span className="text-xs font-bold text-slate-800">{user.name}</span>
                            <span className="text-[11px] text-slate-500 font-medium">{hostelScopeText}</span>
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
                                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                            >
                                Logout
                            </button>
                        </form>
                    </div>
                </div>

                {/* Mobile Navigation bar */}
                <div className="flex md:hidden overflow-x-auto px-4 py-2 gap-2 border-t border-slate-100 text-xs font-semibold text-slate-600 bg-slate-50">
                    <Link href="/warden-admin/dashboard" className="px-2.5 py-1 rounded-md bg-white border border-slate-200 shrink-0">
                        Dashboard
                    </Link>
                    <Link href="/warden-admin/complaints" className="px-2.5 py-1 rounded-md bg-white border border-slate-200 shrink-0">
                        Complaints
                    </Link>
                    <Link href="/warden-admin/technicians" className="px-2.5 py-1 rounded-md bg-white border border-slate-200 shrink-0">
                        Technicians
                    </Link>
                    <Link href="/warden-admin/escalated" className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                        Escalated & Overdue
                    </Link>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
                {children}
            </main>

            <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
                HostelFix • Warden & Admin Management Module
            </footer>
        </div>
    );
}
