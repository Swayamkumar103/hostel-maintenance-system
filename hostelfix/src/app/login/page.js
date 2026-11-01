"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

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

    function quickFill(demoEmail, demoPassword) {
        setEmail(demoEmail);
        setPassword(demoPassword);
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white shadow-md">
                    🔧
                </span>
                <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
                    Hostel<span className="text-blue-600">Fix</span>
                </h1>
                <p className="mt-1 text-xs text-slate-500">
                    Hostel Maintenance & Complaint Management System
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
                <div className="bg-white py-8 px-6 shadow-md rounded-2xl border border-slate-200 sm:px-8 space-y-6">
                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@hostelfix.edu"
                                className="w-full rounded-xl border border-slate-300 p-3 text-xs outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full rounded-xl border border-slate-300 p-3 text-xs outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            {isLoading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    {/* Quick Demo Logins for easy testing */}
                    <div className="pt-4 border-t border-slate-100">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
                            Quick-Fill Seed Test Accounts
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <button
                                type="button"
                                onClick={() => quickFill("admin@hostelfix.com", "Admin@123")}
                                className="rounded-lg border border-slate-200 p-2 text-left hover:bg-slate-50 transition"
                            >
                                <span className="font-bold text-slate-900 block">👑 Admin</span>
                                <span className="text-slate-400 text-[10px]">admin@hostelfix.com</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => quickFill("warden.bh1@hostelfix.com", "Warden@123")}
                                className="rounded-lg border border-slate-200 p-2 text-left hover:bg-slate-50 transition"
                            >
                                <span className="font-bold text-slate-900 block">🛡️ Warden (BH-1)</span>
                                <span className="text-slate-400 text-[10px]">warden.bh1@hostelfix.com</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => quickFill("technician.john@hostelfix.com", "Tech@123")}
                                className="rounded-lg border border-slate-200 p-2 text-left hover:bg-slate-50 transition"
                            >
                                <span className="font-bold text-slate-900 block">🔧 Technician</span>
                                <span className="text-slate-400 text-[10px]">technician.john@...</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => quickFill("student.alex@hostelfix.com", "Student@123")}
                                className="rounded-lg border border-slate-200 p-2 text-left hover:bg-slate-50 transition"
                            >
                                <span className="font-bold text-slate-900 block">🎓 Student</span>
                                <span className="text-slate-400 text-[10px]">student.alex@...</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
