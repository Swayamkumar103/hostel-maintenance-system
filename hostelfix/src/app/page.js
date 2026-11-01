import Link from "next/link";

export default function HomePage() {
    return (
        <main className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 text-center font-sans">
            <div className="max-w-xl mx-auto space-y-6">
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-600 text-3xl text-white shadow-lg">
                    🔧
                </span>

                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
                    Hostel<span className="text-blue-600">Fix</span>
                </h1>

                <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                    Smart hostel maintenance management system. Submit complaints, assign technicians, track SLAs, and resolve hostel facility issues seamlessly.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                    <Link
                        href="/login"
                        className="w-full sm:w-auto rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
                    >
                        Sign In to Your Account →
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-8 border-t border-slate-200 text-left">
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                        <span className="text-xl">🎓</span>
                        <h3 className="font-bold text-xs text-slate-900 mt-2">Student Portal</h3>
                        <p className="text-[11px] text-slate-500 mt-1">Submit tickets, view resolution updates and real-time history.</p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                        <span className="text-xl">🛡️</span>
                        <h3 className="font-bold text-xs text-slate-900 mt-2">Warden & Admin</h3>
                        <p className="text-[11px] text-slate-500 mt-1">Assign technicians, monitor SLAs, escalate urgent tickets, and track KPIs.</p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                        <span className="text-xl">🔧</span>
                        <h3 className="font-bold text-xs text-slate-900 mt-2">Technicians</h3>
                        <p className="text-[11px] text-slate-500 mt-1">View assigned maintenance tasks and update task progress.</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
