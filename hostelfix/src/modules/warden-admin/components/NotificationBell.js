"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function NotificationBell() {
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const dropdownRef = useRef(null);

    async function fetchNotifications() {
        try {
            const res = await fetch("/api/warden-admin/notifications?limit=5");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch {
            // Silently ignore network failures in bell polling
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
        return () => clearInterval(interval);
    }, []);

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
            setUnreadCount((c) => Math.max(0, c - 1));
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
            setUnreadCount(0);
        } catch (e) {
            console.error("Failed to mark all read", e);
        }
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition focus:outline-none"
                aria-label="View notifications"
            >
                <span className="text-xl">🔔</span>
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white shadow-xs">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white p-4 shadow-xl border border-gray-100 z-50 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-gray-900">Notifications</h4>
                            {unreadCount > 0 && (
                                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>

                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={markAllRead}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="mt-3 max-h-72 overflow-y-auto space-y-2">
                        {notifications.length === 0 ? (
                            <div className="py-6 text-center text-xs text-gray-400">
                                No notifications yet.
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <div
                                    key={n._id}
                                    className={`rounded-xl p-3 text-xs transition border ${
                                        n.read
                                            ? "bg-white border-gray-100 text-gray-600"
                                            : "bg-blue-50/60 border-blue-100 text-gray-900 font-medium"
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="font-semibold text-gray-900">{n.title}</p>
                                        {!n.read && (
                                            <button
                                                type="button"
                                                onClick={() => markAsRead(n._id)}
                                                className="text-[10px] text-blue-600 hover:underline shrink-0"
                                            >
                                                Mark read
                                            </button>
                                        )}
                                    </div>
                                    <p className="mt-1 text-gray-600 line-clamp-2">{n.message}</p>
                                    <span className="mt-1.5 block text-[10px] text-gray-400">
                                        {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="mt-3 pt-2 text-center border-t border-gray-100">
                        <Link
                            href="/warden-admin/notifications"
                            onClick={() => setIsOpen(false)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                        >
                            View All Notifications →
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
