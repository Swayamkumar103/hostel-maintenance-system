"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);

    async function handleLogin(e) {
        e?.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || "Invalid login credentials");
            }

            const role = data.user?.role;
            if (role === "admin" || role === "warden") {
                router.push("/warden-admin/dashboard");
            } else if (role === "technician") {
                router.push("/technician/dashboard");
            } else if (role === "student") {
                router.push("/student/dashboard");
            } else {
                router.push("/");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    function quickFill(demoEmail, demoPassword, roleName) {
        setEmail(demoEmail);
        setPassword(demoPassword);
        setSelectedRole(roleName);
        setError("");
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center font-sans">
            {/* Background radial glow */}
            <div className="fixed inset-0 bg-radial-glow pointer-events-none"></div>

            <div className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
                {/* Back to Home Button */}
                <div className="mb-6">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition"
                    >
                        <span>← Back to HostelFix Home</span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
                    {/* Left Showcase Banner */}
                    <div className="lg:col-span-5 bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
                        {/* Background subtle art */}
                        <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-cyan-400/20 blur-2xl"></div>
                        <div className="absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-purple-500/20 blur-2xl"></div>

                        <div className="relative space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-2xl backdrop-blur-md border border-white/20">
                                    🔧
                                </div>
                                <div>
                                    <h2 className="text-xl font-black tracking-tight">HostelFix</h2>
                                    <p className="text-[11px] text-blue-200 font-medium">Smart Campus Facility Management</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <span className="inline-block rounded-md bg-white/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-cyan-200 border border-white/10">
                                    Capstone Demo System
                                </span>
                                <h3 className="text-2xl font-extrabold tracking-tight leading-snug">
                                    Automated Facility Triage & SLA Enforcement
                                </h3>
                                <p className="text-xs text-blue-100 leading-relaxed">
                                    Sign in with your campus credentials to access role-tailored dashboards for tickets, technician dispatches, and SLA audit logs.
                                </p>
                            </div>

                            {/* Mini Vector Illustration */}
                            <div className="py-2">
                                <Image
                                    src="/illustrations/student-life.svg"
                                    alt="Student Life Illustration"
                                    width={240}
                                    height={192}
                                    className="w-full max-w-[240px] mx-auto h-auto drop-shadow-lg"
                                />
                            </div>
                        </div>

                        <div className="relative pt-6 border-t border-white/15 text-[11px] text-blue-200 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span> Systems Operational
                            </span>
                            <span>B.Tech Final Year 2026</span>
                        </div>
                    </div>

                    {/* Right Login Form Panel */}
                    <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
                        <div className="max-w-md mx-auto w-full space-y-6">
                            <div>
                                <h3 className="text-2xl font-black tracking-tight text-slate-900">
                                    Welcome to Account Login
                                </h3>
                                <p className="mt-1 text-xs text-slate-500">
                                    Enter your credentials or choose a quick test account below.
                                </p>
                            </div>

                            {error && (
                                <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-700 flex items-center gap-2">
                                    <span>⚠️</span> {error}
                                </div>
                            )}

                            <form onSubmit={handleLogin} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Campus Email Address
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="e.g. admin@hostelfix.com"
                                            className="w-full rounded-xl border border-slate-300 bg-slate-50/50 p-3.5 text-xs text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Account Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full rounded-xl border border-slate-300 bg-slate-50/50 p-3.5 text-xs text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-xs font-bold text-white shadow-md shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 cursor-pointer"
                                >
                                    {isLoading ? "Verifying Credentials..." : "Sign In to System →"}
                                </button>
                            </form>

                            {/* 1-Click Seed Evaluator Test Accounts */}
                            <div className="pt-6 border-t border-slate-200">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                                        ⚡ 1-Click Evaluator Seed Accounts
                                    </span>
                                    {selectedRole && (
                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                                            Filled {selectedRole}
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-2.5">
                                    <button
                                        type="button"
                                        onClick={() => quickFill("admin@hostelfix.com", "Admin@123", "Admin")}
                                        className={`rounded-xl border p-2.5 text-left transition hover:border-purple-300 hover:bg-purple-50/50 ${
                                            selectedRole === "Admin" ? "border-purple-500 bg-purple-50 ring-2 ring-purple-200" : "border-slate-200 bg-slate-50/60"
                                        }`}
                                    >
                                        <span className="font-bold text-xs text-purple-900 block flex items-center gap-1">
                                            👑 Admin
                                        </span>
                                        <span className="text-slate-400 text-[10px] truncate block">admin@hostelfix.com</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => quickFill("warden.bh1@hostelfix.com", "Warden@123", "Warden")}
                                        className={`rounded-xl border p-2.5 text-left transition hover:border-blue-300 hover:bg-blue-50/50 ${
                                            selectedRole === "Warden" ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200" : "border-slate-200 bg-slate-50/60"
                                        }`}
                                    >
                                        <span className="font-bold text-xs text-blue-900 block flex items-center gap-1">
                                            🛡️ Warden (BH-1)
                                        </span>
                                        <span className="text-slate-400 text-[10px] truncate block">warden.bh1@...</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => quickFill("technician.john@hostelfix.com", "Tech@123", "Technician")}
                                        className={`rounded-xl border p-2.5 text-left transition hover:border-amber-300 hover:bg-amber-50/50 ${
                                            selectedRole === "Technician" ? "border-amber-500 bg-amber-50 ring-2 ring-amber-200" : "border-slate-200 bg-slate-50/60"
                                        }`}
                                    >
                                        <span className="font-bold text-xs text-amber-900 block flex items-center gap-1">
                                            🔧 Technician
                                        </span>
                                        <span className="text-slate-400 text-[10px] truncate block">technician.john@...</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => quickFill("student.alex@hostelfix.com", "Student@123", "Student")}
                                        className={`rounded-xl border p-2.5 text-left transition hover:border-emerald-300 hover:bg-emerald-50/50 ${
                                            selectedRole === "Student" ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200" : "border-slate-200 bg-slate-50/60"
                                        }`}
                                    >
                                        <span className="font-bold text-xs text-emerald-900 block flex items-center gap-1">
                                            🎓 Student
                                        </span>
                                        <span className="text-slate-400 text-[10px] truncate block">student.alex@...</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
