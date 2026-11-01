import { NextResponse } from "next/server";
import { requireRoles } from "@/lib/roleAuth";
import { updatePriority } from "@/modules/warden-admin/services/adminComplaintService";

export async function PATCH(request, { params }) {
    try {
        const auth = await requireRoles(["admin", "warden"], request);
        if (!auth.authorized) {
            return NextResponse.json(
                { success: false, message: auth.message },
                { status: auth.status }
            );
        }

        const resolvedParams = await params;
        const complaintId = resolvedParams.id;
        const body = await request.json().catch(() => ({}));
        const { priority, reason } = body;

        const result = await updatePriority({
            user: auth.user,
            complaintId,
            priority,
            reason,
        });

        return NextResponse.json(result, { status: result.status });
    } catch (error) {
        console.error("Update priority error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to update priority." },
            { status: 500 }
        );
    }
}
