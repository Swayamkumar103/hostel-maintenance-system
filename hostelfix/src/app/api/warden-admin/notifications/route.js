import { NextResponse } from "next/server";
import { requireRoles } from "@/lib/roleAuth";
import connectDB from "@/lib/mongodb";
import Notification from "@/module/Notification";

export async function GET(request) {
    try {
        const auth = await requireRoles(["admin", "warden", "technician", "student"], request);
        if (!auth.authorized) {
            return NextResponse.json(
                { success: false, message: auth.message },
                { status: auth.status }
            );
        }

        await connectDB();
        const { searchParams } = new URL(request.url);
        const unreadOnly = searchParams.get("unreadOnly") === "true";
        const limit = parseInt(searchParams.get("limit"), 10) || 20;

        const filter = { recipientId: auth.user._id };
        if (unreadOnly) {
            filter.read = false;
        }

        const [notifications, unreadCount] = await Promise.all([
            Notification.find(filter)
                .sort({ createdAt: -1 })
                .limit(limit)
                .lean(),
            Notification.countDocuments({ recipientId: auth.user._id, read: false }),
        ]);

        return NextResponse.json({
            success: true,
            notifications: notifications.map((n) => ({
                ...n,
                _id: n._id.toString(),
                id: n._id.toString(),
                complaintId: n.complaintId?.toString(),
                createdAt: n.createdAt ? new Date(n.createdAt).toISOString() : null,
            })),
            unreadCount,
        });
    } catch (error) {
        if (error?.digest?.startsWith("NEXT_")) {
            throw error;
        }
        console.error("Notifications GET error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to load notifications." },
            { status: 500 }
        );
    }
}

export async function PATCH(request) {
    try {
        const auth = await requireRoles(["admin", "warden", "technician", "student"], request);
        if (!auth.authorized) {
            return NextResponse.json(
                { success: false, message: auth.message },
                { status: auth.status }
            );
        }

        await connectDB();
        const body = await request.json().catch(() => ({}));
        const { notificationId, markAllRead } = body;

        if (markAllRead) {
            await Notification.updateMany(
                { recipientId: auth.user._id, read: false },
                { $set: { read: true } }
            );
            return NextResponse.json({ success: true, message: "All notifications marked as read." });
        }

        if (notificationId) {
            await Notification.updateOne(
                { _id: notificationId, recipientId: auth.user._id },
                { $set: { read: true } }
            );
            return NextResponse.json({ success: true, message: "Notification marked as read." });
        }

        return NextResponse.json({ success: false, message: "Missing notificationId or markAllRead flag." }, { status: 400 });
    } catch (error) {
        console.error("Notifications PATCH error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to update notification." },
            { status: 500 }
        );
    }
}
