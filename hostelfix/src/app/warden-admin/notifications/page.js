import { getAuthUser } from "@/lib/roleAuth";
import NotificationsCenterClient from "@/modules/warden-admin/components/NotificationsCenterClient";
import { redirect } from "next/navigation";

export default async function NotificationsPage() {
    const user = await getAuthUser();
    if (!user) {
        redirect("/login");
    }

    return <NotificationsCenterClient />;
}
