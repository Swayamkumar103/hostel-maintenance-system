import { NextResponse } from "next/server";
import { requireRoles } from "@/lib/roleAuth";
import { updateComplaintStatus } from "@/modules/warden-admin/services/adminComplaintService";

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
        const { status, remarks, resolutionNotes } = body;

        const result = await updateComplaintStatus({
            user: auth.user,
            complaintId,
            status,
            remarks,
            resolutionNotes,
        });

        return NextResponse.json(result, { status: result.status });
    } catch (error) {
        console.error("Update status error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to update complaint status." },
            { status: 500 }
        );
    }
}
