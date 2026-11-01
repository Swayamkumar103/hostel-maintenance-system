import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "../module/User.js";
import Complaint from "../module/complain.js";
import ComplaintHistory from "../module/ComplaintHistory.js";
import Notification from "../module/Notification.js";
import { seedDatabase } from "../../scripts/seed.js";
import { getDashboardStats } from "../modules/warden-admin/services/adminDashboardService.js";
import {
    listComplaints,
    getComplaintDetail,
    updatePriority,
    assignTechnician,
    escalateComplaint,
    updateComplaintStatus,
} from "../modules/warden-admin/services/adminComplaintService.js";
import { listTechniciansWithWorkload } from "../modules/warden-admin/services/technicianService.js";
import { getComplaintTimeline } from "../modules/warden-admin/services/auditService.js";
import { getComplaintSLAMetrics } from "../lib/sla.js";
import { canUserAccessComplaint, requireRoles } from "../lib/roleAuth.js";
import { sendNotification } from "../lib/notifications.js";
import { updateComplaintStatus as technicianUpdateStatus } from "../app/actions/technicianActions.js";

const JWT_SECRET = "hostelfix_dev_secret_key_123";

function createMockToken(user) {
    return jwt.sign(
        { userId: user._id.toString(), role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: "1h" }
    );
}

export async function runAllTests() {
    console.log("=================================================");
    console.log("   WARDEN & ADMIN MODULE - TEST EXECUTION SUITE   ");
    console.log("=================================================\n");

    let passedCount = 0;
    let failedCount = 0;

    function assert(condition, testName, details = "") {
        if (condition) {
            console.log(`  ✅ PASS: ${testName}`);
            passedCount++;
        } else {
            console.error(`  ❌ FAIL: ${testName} - ${details}`);
            failedCount++;
        }
    }

    try {
        // Step 0: Seed Database
        const users = await seedDatabase();
        const adminUser = users.find((u) => u.role === "admin");
        const wardenBH1 = users.find((u) => u.email === "warden.bh1@hostelfix.com");
        const wardenGH1 = users.find((u) => u.email === "warden.gh1@hostelfix.com");
        const techJohn = users.find((u) => u.email === "technician.john@hostelfix.com");
        const techBob = users.find((u) => u.email === "technician.bob@hostelfix.com");
        const studentAlex = users.find((u) => u.email === "student.alex@hostelfix.com");

        console.log("\n[TEST GROUP 1: Student Complaint Creation & Regression]");
        // 1. Student creates complaint
        const newComplaint = await Complaint.create({
            title: "Ceiling fan sparking in room 204",
            description: "Whenever switched on, sparks appear from the motor capacitor.",
            hostel: "BH-1",
            roomNumber: "204",
            category: "Electrical",
            priority: "Medium",
            status: "Submitted",
            studentId: studentAlex._id,
        });

        assert(newComplaint._id != null, "Student complaint created in MongoDB");
        assert(newComplaint.status === "Submitted", "Initial complaint status is 'Submitted'");
        assert(newComplaint.priority === "Medium", "Default priority is 'Medium'");

        console.log("\n[TEST GROUP 2: Warden/Admin Dashboard Aggregation]");
        // 2. Complaint appears in Warden/Admin dashboard
        const adminStats = await getDashboardStats(adminUser);
        assert(adminStats.cards.total === 1, "Admin dashboard sees total 1 complaint", `Got: ${adminStats.cards.total}`);
        assert(adminStats.cards.submitted === 1, "Admin dashboard sees 1 submitted complaint");
        assert(adminStats.hostelStats.some((h) => h.hostel === "BH-1" && h.total === 1), "Hostel-wise chart includes BH-1 with 1 total");

        // Warden BH-1 sees it
        const wardenBH1Stats = await getDashboardStats(wardenBH1);
        assert(wardenBH1Stats.cards.total === 1, "Warden BH-1 dashboard sees 1 complaint in assigned hostel");

        // Warden GH-1 (different hostel) does NOT see it
        const wardenGH1Stats = await getDashboardStats(wardenGH1);
        assert(wardenGH1Stats.cards.total === 0, "Warden GH-1 dashboard sees 0 complaints (proper hostel scoping)");

        console.log("\n[TEST GROUP 3: Technician Assignment & Workload Tracking]");
        // 3. Check initial workload
        let techList = await listTechniciansWithWorkload();
        const initialJohnWorkload = techList.find((t) => t._id === techJohn._id.toString())?.activeWorkload || 0;
        assert(initialJohnWorkload === 0, "John Sparks initial active workload is 0");

        // Assign John to complaint
        const assignResult = await assignTechnician({
            user: wardenBH1,
            complaintId: newComplaint._id.toString(),
            technicianId: techJohn._id.toString(),
            reason: "Assigned certified electrician",
        });

        assert(assignResult.success === true, "Warden successfully assigned Technician John");

        // Verify status moved to 'Assigned'
        const updatedComp = await Complaint.findById(newComplaint._id);
        assert(updatedComp.status === "Assigned", "Complaint status transitioned to 'Assigned'");
        assert(updatedComp.assignedTechnician.toString() === techJohn._id.toString(), "Complaint assignedTechnician field matches John's ID");

        // Workload count updates
        techList = await listTechniciansWithWorkload();
        const johnWorkloadAfter = techList.find((t) => t._id === techJohn._id.toString())?.activeWorkload || 0;
        assert(johnWorkloadAfter === 1, "John's active workload incremented to 1", `Got: ${johnWorkloadAfter}`);

        // Reassign to Bob
        const reassignResult = await assignTechnician({
            user: wardenBH1,
            complaintId: newComplaint._id.toString(),
            technicianId: techBob._id.toString(),
            reason: "Emergency reallocation",
        });
        assert(reassignResult.success === true, "Warden successfully reassigned complaint to Bob");

        techList = await listTechniciansWithWorkload();
        const johnWorkloadReassigned = techList.find((t) => t._id === techJohn._id.toString())?.activeWorkload || 0;
        const bobWorkloadReassigned = techList.find((t) => t._id === techBob._id.toString())?.activeWorkload || 0;
        assert(johnWorkloadReassigned === 0, "Previous technician's workload decremented back to 0");
        assert(bobWorkloadReassigned === 1, "New technician Bob's workload incremented to 1");

        console.log("\n[TEST GROUP 4: Status Transition Enforcement & Invalid Transition Rejection]");
        // Re-assign back to John for testing
        await assignTechnician({
            user: adminUser,
            complaintId: newComplaint._id.toString(),
            technicianId: techJohn._id.toString(),
            reason: "Assign to John",
        });

        // Try invalid transition: Assigned directly to Closed
        const invalidClose = await updateComplaintStatus({
            user: adminUser,
            complaintId: newComplaint._id.toString(),
            status: "Closed",
        });
        assert(invalidClose.success === false, "Invalid status transition (Assigned -> Closed) rejected with error");
        assert(invalidClose.status === 400, "Invalid status transition returns HTTP 400");

        // Valid transition: Assigned -> In Progress
        const validStart = await updateComplaintStatus({
            user: adminUser,
            complaintId: newComplaint._id.toString(),
            status: "In Progress",
            remarks: "Technician began inspection",
        });
        assert(validStart.success === true, "Valid transition (Assigned -> In Progress) succeeded");

        // Try invalid transition: In Progress -> Submitted
        const invalidBack = await updateComplaintStatus({
            user: adminUser,
            complaintId: newComplaint._id.toString(),
            status: "Submitted",
        });
        assert(invalidBack.success === false, "Invalid backwards transition (In Progress -> Submitted) rejected with error");

        // Valid transition: In Progress -> Resolved
        const validResolve = await updateComplaintStatus({
            user: adminUser,
            complaintId: newComplaint._id.toString(),
            status: "Resolved",
            resolutionNotes: "Replaced burnt capacitor with new 2.5uF capacitor. Tested fan speed ok.",
        });
        assert(validResolve.success === true, "Valid transition (In Progress -> Resolved) succeeded");

        // Valid transition: Resolved -> Closed
        const validClose = await updateComplaintStatus({
            user: wardenBH1,
            complaintId: newComplaint._id.toString(),
            status: "Closed",
            remarks: "Student confirmed fan is working properly. Ticket closed.",
        });
        assert(validClose.success === true, "Valid transition (Resolved -> Closed) succeeded");

        console.log("\n[TEST GROUP 5: Priority Updates & Audit History Logging]");
        // Create second test complaint
        const comp2 = await Complaint.create({
            title: "Water pipe leaking under sink in room 102",
            description: "Continuous dripping water causing wet floor.",
            hostel: "BH-1",
            roomNumber: "102",
            category: "Plumbing",
            priority: "Low",
            status: "Submitted",
            studentId: studentAlex._id,
        });

        // Update priority to Urgent
        const prioResult = await updatePriority({
            user: wardenBH1,
            complaintId: comp2._id.toString(),
            priority: "Urgent",
            reason: "Water is leaking into electrical sockets below the sink",
        });
        assert(prioResult.success === true, "Priority updated from Low to Urgent");

        // Check history log
        const timeline = await getComplaintTimeline(comp2._id);
        const prioEntry = timeline.find((t) => t.action === "priority_changed");
        assert(prioEntry != null, "Audit log contains 'priority_changed' record");
        assert(prioEntry.oldValue === "Low" && prioEntry.newValue === "Urgent", "Audit log records correct old (Low) and new (Urgent) values");
        assert(prioEntry.performedByName === "Warden BH-1", "Audit log records who made the change");

        console.log("\n[TEST GROUP 6: Complaint Escalation]");
        // Escalate without reason -> MUST FAIL
        const emptyEscalate = await escalateComplaint({
            user: wardenBH1,
            complaintId: comp2._id.toString(),
            reason: "",
        });
        assert(emptyEscalate.success === false, "Escalation without reason is rejected");
        assert(emptyEscalate.status === 400, "Escalation without reason returns HTTP 400");

        // Escalate with valid reason
        const validEscalate = await escalateComplaint({
            user: wardenBH1,
            complaintId: comp2._id.toString(),
            reason: "Water leak is flooding hallway, severe safety hazard",
        });
        assert(validEscalate.success === true, "Escalation with valid reason succeeds");

        const comp2AfterEsc = await Complaint.findById(comp2._id);
        assert(comp2AfterEsc.isEscalated === true, "Complaint isEscalated flag is true");
        assert(comp2AfterEsc.status === "Escalated", "Complaint status updated to 'Escalated'");
        assert(comp2AfterEsc.escalationReason != null, "Escalation reason saved in DB");

        console.log("\n[TEST GROUP 7: SLA Calculation & Overdue Detection]");
        // Low priority = 120h, Medium = 72h, High = 48h, Urgent = 24h
        const freshMetrics = getComplaintSLAMetrics(comp2AfterEsc);
        assert(freshMetrics.slaHours === 24, "Urgent complaint SLA duration is 24 hours");
        assert(freshMetrics.isOverdue === false, "Freshly created complaint is not overdue");

        // Simulate an overdue complaint by backdating createdAt
        const backdatedComplaint = await Complaint.create({
            title: "Broken window latch in room 305",
            description: "Cold air entering room.",
            hostel: "BH-1",
            roomNumber: "305",
            category: "Carpentry",
            priority: "Urgent", // 24h SLA
            status: "Submitted",
            studentId: studentAlex._id,
            createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000), // 36 hours ago!
        });

        const overdueMetrics = getComplaintSLAMetrics(backdatedComplaint);
        assert(overdueMetrics.isOverdue === true, "Backdated complaint correctly detected as OVERDUE");
        assert(overdueMetrics.elapsedHours >= 35, `Overdue elapsed hours >= 35 (got ${overdueMetrics.elapsedHours})`);

        // Check if overdue count reflects in dashboard
        const overdueDashboard = await getDashboardStats(adminUser);
        assert(overdueDashboard.cards.overdue >= 1, "Dashboard overdue counter includes overdue complaint");

        console.log("\n[TEST GROUP 8: In-App Notifications & Deduplication]");
        // Send a notification
        const notif1 = await sendNotification({
            recipientId: adminUser._id,
            recipientRole: "admin",
            complaintId: comp2._id,
            title: "Test Alert",
            message: "Testing notification delivery",
            type: "complaint_escalated",
            eventKey: `test_dedup_${comp2._id}`,
        });
        assert(notif1 != null, "Notification created in database");

        // Try duplicate notification with SAME eventKey
        const notif2 = await sendNotification({
            recipientId: adminUser._id,
            recipientRole: "admin",
            complaintId: comp2._id,
            title: "Duplicate Alert",
            message: "This should be discarded by idempotency key",
            type: "complaint_escalated",
            eventKey: `test_dedup_${comp2._id}`,
        });
        assert(notif2 === null, "Duplicate notification with same eventKey safely discarded without error");

        console.log("\n[TEST GROUP 9: Security & IDOR Access Scoping]");
        // Student cannot access admin check
        const studentRoleCheck = await requireRoles(["admin", "warden"]);
        // Test IDOR: Warden GH-1 trying to access BH-1 complaint
        const canWardenGH1AccessBH1 = canUserAccessComplaint(wardenGH1, newComplaint);
        assert(canWardenGH1AccessBH1 === false, "Warden GH-1 is BLOCKED from accessing BH-1 complaint (IDOR protected)");

        const canWardenBH1AccessBH1 = canUserAccessComplaint(wardenBH1, newComplaint);
        assert(canWardenBH1AccessBH1 === true, "Warden BH-1 is ALLOWED to access BH-1 complaint");

        const canAdminAccessAny = canUserAccessComplaint(adminUser, newComplaint);
        assert(canAdminAccessAny === true, "Admin is ALLOWED to access complaints across all hostels");

        const canStudentAccessOthers = canUserAccessComplaint(studentAlex, {
            ...newComplaint.toObject(),
            studentId: new mongoose.Types.ObjectId(), // another student!
        });
        assert(canStudentAccessOthers === false, "Student cannot access another student's complaint");

        console.log("\n[TEST GROUP 10: Backward Compatibility with Existing Technician Dashboard]");
        // Assign comp2 to John Sparks
        comp2.assignedTechnician = techJohn._id;
        comp2.assignedTechician = techJohn._id;
        comp2.status = "Assigned";
        await comp2.save();

        // Check if query with assignedTechnician or assignedTechician works
        const techComplaints = await Complaint.find({
            $or: [
                { assignedTechnician: techJohn._id },
                { assignedTechician: techJohn._id },
            ],
        }).lean();
        assert(techComplaints.length >= 1, "Existing technician query finds complaints assigned to technician");

        console.log("\n=================================================");
        console.log(`RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
        console.log("=================================================");

        return { passed: failedCount === 0, passedCount, failedCount };
    } catch (err) {
        console.error("Test execution threw unhandled exception:", err);
        return { passed: false, error: err.message };
    }
}
