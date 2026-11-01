import { getAuthUser } from "@/lib/roleAuth";
import { getComplaintDetail } from "@/modules/warden-admin/services/adminComplaintService";
import { listTechniciansWithWorkload } from "@/modules/warden-admin/services/technicianService";
import ComplaintDetailClient from "@/modules/warden-admin/components/ComplaintDetailClient";
import { notFound, redirect } from "next/navigation";

export default async function ComplaintDetailPage({ params }) {
    const user = await getAuthUser();
    if (!user || (user.role !== "admin" && user.role !== "warden")) {
        redirect("/login");
    }

    const resolvedParams = await params;
    const complaintId = resolvedParams.id;

    const [detailRes, technicians] = await Promise.all([
        getComplaintDetail({ user, complaintId }),
        listTechniciansWithWorkload(),
    ]);

    if (!detailRes.success) {
        if (detailRes.status === 404) {
            notFound();
        }
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
                <h2 className="text-base font-bold">Error</h2>
                <p className="mt-1 text-xs">{detailRes.message}</p>
            </div>
        );
    }

    return (
        <ComplaintDetailClient
            complaint={detailRes.complaint}
            technicians={technicians}
        />
    );
}
