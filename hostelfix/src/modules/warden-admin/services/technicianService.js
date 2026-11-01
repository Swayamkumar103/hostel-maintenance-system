import connectDB from "@/lib/mongodb";
import User from "@/module/User";
import Complaint from "@/module/complain";
import { Types } from "mongoose";

/**
 * List all technicians with contact details and live active workload.
 */
export async function listTechniciansWithWorkload({ specialization = null } = {}) {
    await connectDB();

    const techFilter = {
        role: "technician",
        accountStatus: { $ne: "rejected" },
    };

    if (specialization && specialization !== "All") {
        techFilter.specialization = specialization;
    }

    const technicians = await User.find(techFilter)
        .select("_id name email mobile specialization accountStatus emplyeedId createdAt")
        .sort({ name: 1 })
        .lean();

    if (technicians.length === 0) {
        return [];
    }

    const techIds = technicians.map((t) => t._id);

    // Active complaints: Assigned, In Progress, Escalated
    const activeStatuses = ["Assigned", "In Progress", "In progress", "Escalated"];

    const workloadCounts = await Complaint.aggregate([
        {
            $match: {
                $or: [
                    { assignedTechnician: { $in: techIds } },
                    { assignedTechician: { $in: techIds } },
                ],
                status: { $in: activeStatuses },
            },
        },
        {
            $group: {
                _id: {
                    $ifNull: ["$assignedTechnician", "$assignedTechician"],
                },
                activeCount: { $sum: 1 },
            },
        },
    ]);

    const workloadMap = new Map();
    for (const w of workloadCounts) {
        if (w._id) {
            workloadMap.set(w._id.toString(), w.activeCount);
        }
    }

    return technicians.map((t) => {
        const idStr = t._id.toString();
        const activeCount = workloadMap.get(idStr) || 0;
        return {
            _id: idStr,
            id: idStr,
            name: t.name,
            email: t.email,
            mobile: t.mobile,
            specialization: t.specialization || "General",
            employeeId: t.emplyeedId || "N/A",
            accountStatus: t.accountStatus || "approved",
            activeWorkload: activeCount,
            availability: activeCount >= 5 ? "Busy" : activeCount > 0 ? "Moderate" : "Available",
        };
    });
}
