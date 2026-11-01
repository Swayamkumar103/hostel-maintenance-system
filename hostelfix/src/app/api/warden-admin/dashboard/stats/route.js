import { NextResponse } from "next/server";
import { requireRoles } from "@/lib/roleAuth";
import { getDashboardStats } from "@/modules/warden-admin/services/adminDashboardService";

export async function GET(request) {
    try {
        const auth = await requireRoles(["admin", "warden"], request);
        if (!auth.authorized) {
            return NextResponse.json(
                { success: false, message: auth.message },
                { status: auth.status }
            );
        }

        const data = await getDashboardStats(auth.user);
        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error) {
        if (error?.digest?.startsWith("NEXT_")) {
            throw error;
        }
        console.error("Dashboard stats error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to load dashboard statistics." },
            { status: 500 }
        );
    }
}
