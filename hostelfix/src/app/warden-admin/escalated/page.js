import { getAuthUser } from "@/lib/roleAuth";
import EscalatedClient from "@/modules/warden-admin/components/EscalatedClient";
import { redirect } from "next/navigation";

export default async function EscalatedPage() {
    const user = await getAuthUser();
    if (!user || (user.role !== "admin" && user.role !== "warden")) {
        redirect("/login");
    }

    return <EscalatedClient />;
}
