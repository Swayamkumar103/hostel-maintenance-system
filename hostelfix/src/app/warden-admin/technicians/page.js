import { getAuthUser } from "@/lib/roleAuth";
import { listTechniciansWithWorkload } from "@/modules/warden-admin/services/technicianService";
import TechniciansClient from "@/modules/warden-admin/components/TechniciansClient";
import { redirect } from "next/navigation";

export default async function TechniciansPage() {
    const user = await getAuthUser();
    if (!user || (user.role !== "admin" && user.role !== "warden")) {
        redirect("/login");
    }

    const technicians = await listTechniciansWithWorkload();

    return <TechniciansClient initialTechnicians={technicians} />;
}
