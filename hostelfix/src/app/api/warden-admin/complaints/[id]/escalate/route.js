import { NextResponse } from "next/server";
import { requireRoles } from "@/lib/roleAuth";
import { escalateComplaint } from "@/modules/warden-admin/services/adminComplaintService";

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
        const { reason } = body;

        const result = await escalateComplaint({
            user: auth.user,
            complaintId,
            reason,
        });

        return NextResponse.json(result, { status: result.status });
    } catch (error) {
        console.error("Escalate complaint error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to escalate complaint." },
            { status: 500 }
        );
    }
}
