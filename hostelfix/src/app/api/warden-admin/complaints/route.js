import { NextResponse } from "next/server";
import { requireRoles } from "@/lib/roleAuth";
import { listComplaints } from "@/modules/warden-admin/services/adminComplaintService";

export async function GET(request) {
    try {
        const auth = await requireRoles(["admin", "warden"], request);
        if (!auth.authorized) {
            return NextResponse.json(
                { success: false, message: auth.message },
                { status: auth.status }
            );
        }

        const { searchParams } = new URL(request.url);
        const page = searchParams.get("page") || 1;
        const limit = searchParams.get("limit") || 10;
        const hostel = searchParams.get("hostel");
        const category = searchParams.get("category");
        const priority = searchParams.get("priority");
        const status = searchParams.get("status");
        const technicianId = searchParams.get("technicianId");
        const escalated = searchParams.get("escalated");
        const overdue = searchParams.get("overdue");
        const search = searchParams.get("search") || "";
        const sortBy = searchParams.get("sortBy") || "createdAt";
        const sortOrder = searchParams.get("sortOrder") || "desc";

        const result = await listComplaints({
            user: auth.user,
            page,
            limit,
            hostel,
            category,
            priority,
            status,
            technicianId,
            escalated,
            overdue,
            search,
            sortBy,
            sortOrder,
        });

        return NextResponse.json({
            success: true,
            ...result,
        });
    } catch (error) {
        if (error?.digest?.startsWith("NEXT_")) {
            throw error;
        }
        console.error("List complaints error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to list complaints." },
            { status: 500 }
        );
    }
}
