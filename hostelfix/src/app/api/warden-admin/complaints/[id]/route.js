import { NextResponse } from "next/server";
import { requireRoles } from "@/lib/roleAuth";
import { getComplaintDetail } from "@/modules/warden-admin/services/adminComplaintService";

export async function GET(request, { params }) {
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

        const result = await getComplaintDetail({
            user: auth.user,
            complaintId,
        });

        return NextResponse.json(result, { status: result.status });
    } catch (error) {
        console.error("Get complaint detail error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to load complaint details." },
            { status: 500 }
        );
    }
}
