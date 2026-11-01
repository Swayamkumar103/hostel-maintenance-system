import { NextResponse } from "next/server";
import { requireRoles } from "@/lib/roleAuth";
import { assignTechnician } from "@/modules/warden-admin/services/adminComplaintService";

export async function POST(request, { params }) {
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
        const { technicianId, reason, scheduledDate } = body;

        const result = await assignTechnician({
            user: auth.user,
            complaintId,
            technicianId,
            reason,
            scheduledDate,
        });

        return NextResponse.json(result, { status: result.status });
    } catch (error) {
        console.error("Assign technician error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to assign technician." },
            { status: 500 }
        );
    }
}
