import { getAuthUser } from "@/lib/roleAuth";
import { getDashboardStats } from "@/modules/warden-admin/services/adminDashboardService";
import AdminDashboardClient from "@/modules/warden-admin/components/AdminDashboardClient";
import { redirect } from "next/navigation";


export default async function WardenAdminDashboardPage() {
    const user = await getAuthUser();
    if (!user || (user.role !== "admin" && user.role !== "warden")) {
        redirect("/login");
    }

    const stats = await getDashboardStats(user);

    return <AdminDashboardClient stats={stats} userRole={user.role} />;
}
