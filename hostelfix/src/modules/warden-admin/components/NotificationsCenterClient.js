"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

export default function NotificationsCenterClient() {
    const [notifications, setNotifications] = useState([]);
    const [unreadOnly, setUnreadOnly] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch(`/api/warden-admin/notifications?unreadOnly=${unreadOnly}&limit=50`);
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
            }
        } catch {
            // silent
        } finally {
            setIsLoading(false);
        }
    }, [unreadOnly]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchNotifications();
    }, [fetchNotifications]);

    async function markAsRead(notificationId) {
        try {
            await fetch("/api/warden-admin/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notificationId }),
            });
            setNotifications((prev) =>
                prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
            );
        } catch (e) {
            console.error("Failed to mark notification read", e);
        }
    }

    async function markAllRead() {
        try {
            await fetch("/api/warden-admin/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ markAllRead: true }),
            });
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        } catch (e) {
            console.error("Failed to mark all read", e);
        }
    }

    const typeIcons = {
        new_complaint: "📝",
        technician_assigned: "👷",
        technician_reassigned: "🔄",
        status_updated: "📊",
        complaint_escalated: "🚨",
        complaint_overdue: "⏰",
        complaint_resolved: "✅",
        complaint_closed: "🔒",
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                        Notifications Center
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Audit alerts, new tickets, technician updates, and SLA reminders.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setUnreadOnly(!unreadOnly)}
                        className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition border ${
                            unreadOnly
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                    >
                        {unreadOnly ? "Showing Unread" : "Filter Unread Only"}
                    </button>

                    <button
                        type="button"
                        onClick={markAllRead}
                        className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                        Mark All Read
                    </button>
                </div>
            </div>

            {/* Notifications List */}
            {isLoading ? (
                <div className="py-20 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-3 border-slate-200 border-t-blue-600" />
                    <p className="mt-3 text-xs font-medium text-slate-500">Loading notifications...</p>
                </div>
            ) : notifications.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center shadow-xs">
                    <span className="text-3xl">🔔</span>
                    <h3 className="mt-2 text-base font-bold text-slate-800">No notifications found</h3>
                    <p className="mt-1 text-xs text-slate-500">You are all caught up!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map((n) => {
                        const icon = typeIcons[n.type] || "📌";
                        return (
                            <div
                                key={n._id}
                                className={`rounded-2xl border p-4.5 transition flex items-start gap-4 ${
                                    n.read
                                        ? "bg-white border-slate-200"
                                        : "bg-blue-50/50 border-blue-200 shadow-2xs"
                                }`}
                            >
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg shadow-2xs">
                                    {icon}
                                </span>

                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-bold text-sm text-slate-900">{n.title}</h4>
                                        <time className="text-[11px] text-slate-400">
                                            {n.createdAt ? new Date(n.createdAt).toLocaleString() : "Just now"}
                                        </time>
                                    </div>

                                    <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>

                                    <div className="pt-2 flex items-center gap-3">
                                        {n.complaintId && (
                                            <Link
                                                href={`/warden-admin/complaints/${n.complaintId}`}
                                                className="text-xs font-semibold text-blue-600 hover:underline"
                                            >
                                                View Complaint Ticket →
                                            </Link>
                                        )}

                                        {!n.read && (
                                            <button
                                                type="button"
                                                onClick={() => markAsRead(n._id)}
                                                className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                                            >
                                                Mark as read
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
