import { NextResponse } from "next/server";
import { requireRoles } from "@/lib/roleAuth";
import connectDB from "@/lib/mongodb";
import Complaint from "@/module/complain";
import { recordHistory, getComplaintTimeline } from "@/modules/warden-admin/services/auditService";
import { notifyWardenAndAdmins } from "@/lib/notifications";
import { getComplaintSLAMetrics } from "@/lib/sla";

export async function POST(request) {
    try {
        const auth = await requireRoles(["student"], request);
        if (!auth.authorized) {
            return NextResponse.json(
                { success: false, message: auth.message },
                { status: auth.status }
            );
        }

        const body = await request.json().catch(() => ({}));
        const { title, description, hostel, roomNumber, category, priority = "Medium" } = body;

        if (!title || !description || !hostel || !roomNumber || !category) {
            return NextResponse.json(
                { success: false, message: "All fields (title, description, hostel, roomNumber, category) are required." },
                { status: 400 }
            );
        }

        await connectDB();
        const complaint = await Complaint.create({
            title: title.trim(),
            description: description.trim(),
            hostel: hostel.trim(),
            roomNumber: roomNumber.trim(),
            category: category.trim(),
            priority: ["Low", "Medium", "High", "Urgent"].includes(priority) ? priority : "Medium",
            status: "Submitted",
            studentId: auth.user._id,
        });

        // Record creation in audit log
        await recordHistory({
            complaintId: complaint._id,
            action: "created",
            oldValue: null,
            newValue: "Submitted",
            remarks: "Complaint submitted by student",
            performedBy: auth.user._id,
            performedByName: auth.user.name,
            performedByRole: "student",
            isStudentVisible: true,
        });

        // Notify wardens and admins of the hostel
        await notifyWardenAndAdmins({
            hostel: complaint.hostel,
            complaintId: complaint._id,
            title: `New Maintenance Request: ${complaint.title}`,
            message: `Student ${auth.user.name} submitted a ${complaint.category} complaint in ${complaint.hostel}, room ${complaint.roomNumber}.`,
            type: "new_complaint",
            eventKeyPrefix: `created_${complaint._id}`,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Complaint submitted successfully.",
                complaint: {
                    ...complaint.toObject(),
                    _id: complaint._id.toString(),
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Student complaint creation error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to submit complaint." },
            { status: 500 }
        );
    }
}

export async function GET(request) {
    try {
        const auth = await requireRoles(["student"], request);
        if (!auth.authorized) {
            return NextResponse.json(
                { success: false, message: auth.message },
                { status: auth.status }
            );
        }

        await connectDB();
        const complaints = await Complaint.find({ studentId: auth.user._id })
            .populate("assignedTechnician", "name mobile specialization")
            .sort({ createdAt: -1 })
            .lean();

        const formatted = await Promise.all(
            complaints.map(async (c) => {
                const timeline = await getComplaintTimeline(c._id, true);
                const sla = getComplaintSLAMetrics(c);
                return {
                    ...c,
                    _id: c._id.toString(),
                    id: c._id.toString(),
                    assignedTechnician: c.assignedTechnician
                        ? {
                            name: c.assignedTechnician.name,
                            mobile: c.assignedTechnician.mobile,
                            specialization: c.assignedTechnician.specialization,
                        }
                        : null,
                    timeline,
                    sla,
                    createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : null,
                    completedAt: c.completedAt ? new Date(c.completedAt).toISOString() : null,
                    closedAt: c.closedAt ? new Date(c.closedAt).toISOString() : null,
                };
            })
        );

        return NextResponse.json({
            success: true,
            complaints: formatted,
        });
    } catch (error) {
        if (error?.digest?.startsWith("NEXT_")) {
            throw error;
        }
        console.error("Student complaints GET error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to load complaints." },
            { status: 500 }
        );
    }
}
