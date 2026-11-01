import { NextResponse } from "next/server";
import { requireRoles } from "@/lib/roleAuth";
import { listTechniciansWithWorkload } from "@/modules/warden-admin/services/technicianService";

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
        const specialization = searchParams.get("specialization");

        const technicians = await listTechniciansWithWorkload({ specialization });

        return NextResponse.json({
            success: true,
            technicians,
        });
    } catch (error) {
        if (error?.digest?.startsWith("NEXT_")) {
            throw error;
        }
        console.error("List technicians error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to load technicians." },
            { status: 500 }
        );
    }
}
