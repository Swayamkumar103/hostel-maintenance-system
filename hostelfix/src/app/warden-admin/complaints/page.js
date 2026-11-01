import { getAuthUser } from "@/lib/roleAuth";
import ComplaintsListClient from "@/modules/warden-admin/components/ComplaintsListClient";
import { DEFAULT_HOSTELS } from "@/lib/constants";
import { redirect } from "next/navigation";


export default async function ComplaintsPage() {
    const user = await getAuthUser();
    if (!user || (user.role !== "admin" && user.role !== "warden")) {
        redirect("/login");
    }

    const availableHostels = user.role === "admin"
        ? DEFAULT_HOSTELS
        : user.assignedHostels?.length
            ? user.assignedHostels
            : user.hostel
                ? [user.hostel]
                : DEFAULT_HOSTELS;

    return <ComplaintsListClient initialHostels={availableHostels} />;
}
