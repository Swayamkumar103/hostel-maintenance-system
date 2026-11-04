import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
            {/* Top Announcement Banner */}
            <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 px-4 py-2 text-center text-xs font-semibold text-white shadow-xs">
                <div className="mx-auto flex max-w-7xl items-center justify-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>🎓 <strong>Final Year Capstone Project 2026</strong>: Smart Hostel Maintenance & Automated SLA Dispatch System</span>
                    <span className="hidden md:inline rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">v1.0 Production</span>
                </div>
            </div>

            {/* Main Navbar */}
            <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
                    {/* Brand */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-xl font-bold text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                            🔧
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-xl font-black tracking-tight text-slate-900">
                                    Hostel<span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Fix</span>
                                </span>
                                <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[9px] font-extrabold text-blue-700 uppercase tracking-widest border border-blue-200/60">
                                    CSE LAB
                                </span>
                            </div>
                            <p className="text-[10px] font-medium text-slate-500">Smart Campus Maintenance Suite</p>
                        </div>
                    </Link>

                    {/* Navigation Links */}
                    <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-600">
                        <a href="#portals" className="hover:text-blue-600 transition">User Portals</a>
                        <a href="#lifecycle" className="hover:text-blue-600 transition">How It Works</a>
                        <a href="#features" className="hover:text-blue-600 transition">System Features</a>
                        <a href="#architecture" className="hover:text-blue-600 transition">Tech Stack</a>
                        <a href="#demo-accounts" className="hover:text-blue-600 transition">Demo Logins</a>
                    </nav>

                    {/* Right CTA */}
                    <div className="flex items-center gap-3">
                        <Link
                            href="/login"
                            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg transition-all"
                        >
                            Sign In to Portal →
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-12 pb-20 bg-radial-glow bg-grid-pattern border-b border-slate-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        {/* Hero Text */}
                        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3.5 py-1 text-xs font-bold text-blue-700 shadow-2xs">
                                <span>⚡ Automated SLA Breach Alerts</span>
                                <span className="h-1 w-1 rounded-full bg-blue-600"></span>
                                <span className="text-slate-600">Real-time Task Routing</span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.12]">
                                Intelligent Hostel <br className="hidden sm:inline" />
                                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                                    Facility & Ticket
                                </span>{" "}
                                Resolution System
                            </h1>

                            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                                Empowering college hostel management with automated complaint triage, guaranteed SLA tracking, multi-hostel technician dispatch, and full end-to-end audit transparency.
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                                <Link
                                    href="/login"
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-xs font-bold text-white shadow-md shadow-blue-500/30 hover:bg-blue-700 hover:shadow-lg transition-all"
                                >
                                    <span>🚀 Launch Live Demo Portal</span>
                                </Link>

                                <a
                                    href="#demo-accounts"
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
                                >
                                    <span>🔑 View Evaluator Test Credentials</span>
                                </a>
                            </div>

                            {/* Live Stats Ticker */}
                            <div className="pt-6 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                                <div className="rounded-xl bg-white/70 border border-slate-200/80 p-3 shadow-2xs">
                                    <div className="text-xl sm:text-2xl font-black text-blue-600">&lt; 4 Hours</div>
                                    <div className="text-[11px] font-semibold text-slate-500">Urgent SLA Target</div>
                                </div>
                                <div className="rounded-xl bg-white/70 border border-slate-200/80 p-3 shadow-2xs">
                                    <div className="text-xl sm:text-2xl font-black text-emerald-600">99.4%</div>
                                    <div className="text-[11px] font-semibold text-slate-500">On-Time SLA Record</div>
                                </div>
                                <div className="rounded-xl bg-white/70 border border-slate-200/80 p-3 shadow-2xs">
                                    <div className="text-xl sm:text-2xl font-black text-indigo-600">4 Hostels</div>
                                    <div className="text-[11px] font-semibold text-slate-500">Multi-Unit Support</div>
                                </div>
                                <div className="rounded-xl bg-white/70 border border-slate-200/80 p-3 shadow-2xs">
                                    <div className="text-xl sm:text-2xl font-black text-purple-600">100%</div>
                                    <div className="text-[11px] font-semibold text-slate-500">Digital Audit Trail</div>
                                </div>
                            </div>
                        </div>

                        {/* Hero Graphic */}
                        <div className="lg:col-span-5 flex justify-center">
                            <div className="relative w-full max-w-md lg:max-w-none">
                                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 opacity-20 blur-xl"></div>
                                <div className="relative rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-xl backdrop-blur-sm">
                                    {/* Embedded Visual Illustration */}
                                    <Image
                                        src="/illustrations/hostel-hero.svg"
                                        alt="HostelFix Smart Hostel Maintenance System"
                                        width={800}
                                        height={600}
                                        priority
                                        className="w-full h-auto rounded-2xl shadow-inner animate-float"
                                    />
                                    <div className="mt-4 flex items-center justify-between text-[11px] font-bold text-slate-500 px-2">
                                        <span className="flex items-center gap-1.5 text-emerald-600">
                                            <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Live Campus Telemetry Active
                                        </span>
                                        <span>BH-1 • BH-2 • GH-1 • GH-2</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Three Roles Portal Showcase */}
            <section id="portals" className="py-20 bg-white border-b border-slate-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="text-center max-w-3xl mx-auto mb-14">
                        <span className="rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-bold text-indigo-700">
                            Role-Based Workflow
                        </span>
                        <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                            Purpose-Built Interfaces for Every Campus Role
                        </h2>
                        <p className="mt-2 text-xs sm:text-sm text-slate-500">
                            A unified ecosystem engineered with dedicated access privileges for Students, Wardens, Administrators, and Maintenance Technicians.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Student Portal Card */}
                        <div className="group relative rounded-3xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/40 via-white to-white p-7 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-2xl text-white shadow-md shadow-emerald-500/20">
                                🎓
                            </div>
                            <span className="mt-4 inline-block rounded-md bg-emerald-100/70 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">
                                Resident Students
                            </span>
                            <h3 className="mt-2 text-xl font-bold text-slate-900">Student Portal</h3>
                            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                                Seamlessly report room issues, attach category tags, monitor live SLA resolution countdowns, and verify completed maintenance repairs.
                            </p>

                            <ul className="mt-5 space-y-2 text-xs text-slate-600">
                                <li className="flex items-center gap-2">
                                    <span className="text-emerald-500 font-bold">✓</span> One-Click Complaint Filing
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-emerald-500 font-bold">✓</span> Real-Time Audit History
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-emerald-500 font-bold">✓</span> Assigned Technician Details
                                </li>
                            </ul>

                            <div className="mt-6 pt-4 border-t border-slate-100">
                                <Link
                                    href="/login"
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 group-hover:translate-x-1 transition-all"
                                >
                                    Log in as Student <span>→</span>
                                </Link>
                            </div>
                        </div>

                        {/* Warden & Admin Suite Card */}
                        <div className="group relative rounded-3xl border border-blue-200/80 bg-gradient-to-b from-blue-50/40 via-white to-white p-7 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ring-2 ring-blue-500/20">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white shadow-md shadow-blue-500/20">
                                🛡️
                            </div>
                            <span className="mt-4 inline-block rounded-md bg-blue-100/70 px-2 py-0.5 text-[10px] font-extrabold text-blue-800 uppercase tracking-wider">
                                Campus Administrators
                            </span>
                            <h3 className="mt-2 text-xl font-bold text-slate-900">Warden & Admin Tower</h3>
                            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                                Complete supervision across all hostel blocks. Assign specialized staff, configure SLA thresholds, prevent overdue tickets, and track KPIs.
                            </p>

                            <ul className="mt-5 space-y-2 text-xs text-slate-600">
                                <li className="flex items-center gap-2">
                                    <span className="text-blue-500 font-bold">✓</span> Smart Technician Matching
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-blue-500 font-bold">✓</span> Automated Escalation Radar
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-blue-500 font-bold">✓</span> Cross-Hostel Analytics Charts
                                </li>
                            </ul>

                            <div className="mt-6 pt-4 border-t border-slate-100">
                                <Link
                                    href="/login"
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 group-hover:translate-x-1 transition-all"
                                >
                                    Log in as Warden/Admin <span>→</span>
                                </Link>
                            </div>
                        </div>

                        {/* Technician Console Card */}
                        <div className="group relative rounded-3xl border border-amber-200/80 bg-gradient-to-b from-amber-50/40 via-white to-white p-7 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 text-2xl text-white shadow-md shadow-amber-500/20">
                                🔧
                            </div>
                            <span className="mt-4 inline-block rounded-md bg-amber-100/70 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 uppercase tracking-wider">
                                Maintenance Crews
                            </span>
                            <h3 className="mt-2 text-xl font-bold text-slate-900">Technician Console</h3>
                            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                                Tailored mobile-responsive task board for electricians, plumbers, and carpenters. View assigned rooms, start repairs, and mark completion.
                            </p>

                            <ul className="mt-5 space-y-2 text-xs text-slate-600">
                                <li className="flex items-center gap-2">
                                    <span className="text-amber-500 font-bold">✓</span> Filtered Work Queue
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-amber-500 font-bold">✓</span> 1-Click Status Transitions
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-amber-500 font-bold">✓</span> Real-Time In-Progress Tracking
                                </li>
                            </ul>

                            <div className="mt-6 pt-4 border-t border-slate-100">
                                <Link
                                    href="/login"
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 group-hover:translate-x-1 transition-all"
                                >
                                    Log in as Technician <span>→</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Interactive Lifecycle / How It Works */}
            <section id="lifecycle" className="py-20 bg-slate-50 border-b border-slate-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="text-center max-w-3xl mx-auto mb-14">
                        <span className="rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-blue-700">
                            Automated Lifecycle
                        </span>
                        <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                            From Issue to Resolution in 4 Seamless Steps
                        </h2>
                        <p className="mt-2 text-xs sm:text-sm text-slate-500">
                            Eliminating slow manual registers with an automated digital workflow and guaranteed SLA enforcement.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Step 1 */}
                        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs relative">
                            <span className="absolute -top-3.5 left-6 rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-black text-white shadow-sm">
                                01
                            </span>
                            <div className="text-3xl mt-2 mb-3">📱</div>
                            <h4 className="text-base font-bold text-slate-900">Student Logs Ticket</h4>
                            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                                Resident selects category (Electrical, Plumbing, etc.), room number, and urgency level with instant timestamping.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs relative">
                            <span className="absolute -top-3.5 left-6 rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-black text-white shadow-sm">
                                02
                            </span>
                            <div className="text-3xl mt-2 mb-3">⏱️</div>
                            <h4 className="text-base font-bold text-slate-900">SLA Timer & Triage</h4>
                            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                                System activates the SLA countdown (High: 4h, Medium: 24h, Low: 48h) and alerts the responsible block warden.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs relative">
                            <span className="absolute -top-3.5 left-6 rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-black text-white shadow-sm">
                                03
                            </span>
                            <div className="text-3xl mt-2 mb-3">🛠️</div>
                            <h4 className="text-base font-bold text-slate-900">Technician Dispatch</h4>
                            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                                The warden matches the complaint with a specialized technician who receives the job on their console.
                            </p>
                        </div>

                        {/* Step 4 */}
                        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs relative">
                            <span className="absolute -top-3.5 left-6 rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-black text-white shadow-sm">
                                04
                            </span>
                            <div className="text-3xl mt-2 mb-3">✅</div>
                            <h4 className="text-base font-bold text-slate-900">Verification & Archive</h4>
                            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                                Task is marked completed, the resident verifies the work, and the full audit log is permanently preserved.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Key Innovations Bento Grid */}
            <section id="features" className="py-20 bg-white border-b border-slate-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="text-center max-w-3xl mx-auto mb-14">
                        <span className="rounded-full bg-purple-50 border border-purple-200 px-3 py-1 text-xs font-bold text-purple-700">
                            Engineered for Reliability
                        </span>
                        <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                            Core Engineering Highlights & Modules
                        </h2>
                        <p className="mt-2 text-xs sm:text-sm text-slate-500">
                            Built with industry-standard design patterns to meet high-volume university requirements.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 hover:bg-white hover:shadow-md transition">
                            <span className="text-3xl">🚨</span>
                            <h4 className="mt-3 text-sm font-bold text-slate-900">Automated SLA Escalation Engine</h4>
                            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                                Background calculations continuously flag pending complaints that risk exceeding their resolution SLA, moving them to an Urgent Escalation view.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 hover:bg-white hover:shadow-md transition">
                            <span className="text-3xl">🔐</span>
                            <h4 className="mt-3 text-sm font-bold text-slate-900">Role-Based JWT Authentication</h4>
                            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                                Cryptographically secure tokens stored in HttpOnly cookies ensure students cannot tamper with administrative routes or technician actions.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 hover:bg-white hover:shadow-md transition">
                            <span className="text-3xl">📊</span>
                            <h4 className="mt-3 text-sm font-bold text-slate-900">Cross-Hostel KPI Dashboard</h4>
                            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                                Wardens see real-time distribution charts showing issue volume by category (Electrical, Plumbing, Carpentry) and average turnaround times.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 hover:bg-white hover:shadow-md transition">
                            <span className="text-3xl">📜</span>
                            <h4 className="mt-3 text-sm font-bold text-slate-900">Immutable Audit Trail</h4>
                            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                                Every state transition (Assigned, In Progress, Resolved) generates an audit event with exact actor metadata, timestamps, and technician notes.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 hover:bg-white hover:shadow-md transition">
                            <span className="text-3xl">🏢</span>
                            <h4 className="mt-3 text-sm font-bold text-slate-900">Hostel & Block Isolation</h4>
                            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                                Multi-hostel support allows scoping tickets to specific blocks (BH-1, BH-2, GH-1), preventing cross-hostel data leakage.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 hover:bg-white hover:shadow-md transition">
                            <span className="text-3xl">📱</span>
                            <h4 className="mt-3 text-sm font-bold text-slate-900">Mobile Responsive Design</h4>
                            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                                Fully responsive UI tailored with Tailwind CSS v4, allowing technicians to update tickets directly on mobile devices while standing in hostel rooms.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Demo Test Accounts for Evaluators */}
            <section id="demo-accounts" className="py-20 bg-slate-50 border-b border-slate-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="text-center max-w-3xl mx-auto mb-14">
                        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                            1-Click Evaluator Testing
                        </span>
                        <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                            Seed Test Credentials
                        </h2>
                        <p className="mt-2 text-xs sm:text-sm text-slate-500">
                            Designed for final year project demonstrations. Click below to sign in directly with test accounts populated with complaints and technicians.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Admin Card */}
                        <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-xs hover:shadow-md transition">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-white font-bold text-sm">
                                    👑
                                </span>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-900">Super Administrator</h4>
                                    <span className="text-[10px] text-purple-700 font-semibold">All Hostels Scope</span>
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-2.5 font-mono text-[11px] text-slate-700 space-y-1">
                                <div><span className="text-slate-400">User:</span> admin@hostelfix.com</div>
                                <div><span className="text-slate-400">Pass:</span> Admin@123</div>
                            </div>
                            <Link
                                href="/login"
                                className="mt-4 block text-center rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 py-2 text-xs font-bold transition"
                            >
                                Test Admin View →
                            </Link>
                        </div>

                        {/* Warden Card */}
                        <div className="rounded-2xl border border-blue-200 bg-white p-5 shadow-xs hover:shadow-md transition">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm">
                                    🛡️
                                </span>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-900">Hostel Warden</h4>
                                    <span className="text-[10px] text-blue-700 font-semibold">Boys Hostel (BH-1)</span>
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-2.5 font-mono text-[11px] text-slate-700 space-y-1">
                                <div><span className="text-slate-400">User:</span> warden.bh1@hostelfix.com</div>
                                <div><span className="text-slate-400">Pass:</span> Warden@123</div>
                            </div>
                            <Link
                                href="/login"
                                className="mt-4 block text-center rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 text-xs font-bold transition"
                            >
                                Test Warden View →
                            </Link>
                        </div>

                        {/* Technician Card */}
                        <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-xs hover:shadow-md transition">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-white font-bold text-sm">
                                    🔧
                                </span>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-900">Lead Technician</h4>
                                    <span className="text-[10px] text-amber-700 font-semibold">Electrical / Plumbing</span>
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-2.5 font-mono text-[11px] text-slate-700 space-y-1">
                                <div><span className="text-slate-400">User:</span> technician.john@hostelfix.com</div>
                                <div><span className="text-slate-400">Pass:</span> Tech@123</div>
                            </div>
                            <Link
                                href="/login"
                                className="mt-4 block text-center rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 py-2 text-xs font-bold transition"
                            >
                                Test Tech View →
                            </Link>
                        </div>

                        {/* Student Card */}
                        <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-xs hover:shadow-md transition">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-sm">
                                    🎓
                                </span>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-900">Resident Student</h4>
                                    <span className="text-[10px] text-emerald-700 font-semibold">BH-1 • Room 304</span>
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-2.5 font-mono text-[11px] text-slate-700 space-y-1">
                                <div><span className="text-slate-400">User:</span> student.alex@hostelfix.com</div>
                                <div><span className="text-slate-400">Pass:</span> Student@123</div>
                            </div>
                            <Link
                                href="/login"
                                className="mt-4 block text-center rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-2 text-xs font-bold transition"
                            >
                                Test Student View →
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Architecture & Tech Stack Showcase */}
            <section id="architecture" className="py-16 bg-white border-b border-slate-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-12 text-white shadow-xl">
                        <div className="space-y-3 max-w-xl">
                            <span className="rounded-md bg-blue-500/20 px-2.5 py-1 text-[11px] font-bold text-blue-300 uppercase tracking-widest border border-blue-400/30">
                                Engineering Specifications
                            </span>
                            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                                Built with Modern Full-Stack Architecture
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                                Next.js 16 App Router, React 19 Server Components, Tailwind CSS v4, MongoDB Atlas with Mongoose ODM, and cryptographically verified stateless JWT sessions.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto text-xs font-bold">
                            <div className="rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-center backdrop-blur-xs">
                                ⚡ Next.js 16 App Router
                            </div>
                            <div className="rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-center backdrop-blur-xs">
                                ⚛️ React 19 Engine
                            </div>
                            <div className="rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-center backdrop-blur-xs">
                                🍃 MongoDB & Mongoose
                            </div>
                            <div className="rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-center backdrop-blur-xs">
                                🎨 Tailwind CSS v4
                            </div>
                            <div className="rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-center backdrop-blur-xs">
                                🔑 JWT HttpOnly Auth
                            </div>
                            <div className="rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-center backdrop-blur-xs">
                                📈 Recharts Analytics
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12 text-xs">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white font-bold">
                            🔧
                        </span>
                        <div>
                            <span className="font-bold text-white text-sm">HostelFix</span>
                            <p className="text-[11px] text-slate-500">Final Year Capstone Project • Batch of 2026</p>
                        </div>
                    </div>

                    <div className="text-center md:text-right text-[11px] text-slate-500 space-y-1">
                        <p>Department of Computer Science & Engineering</p>
                        <p>Hostel Maintenance & Complaint Management System • All Rights Reserved</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
