"use client";

import { useState } from "react";
import Link from "next/link";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import Timeline from "./Timeline";
import ConfirmationModal from "./ConfirmationModal";
import { PRIORITIES, VALID_STATUS_TRANSITIONS, STATUS_CANONICAL_MAP } from "@/lib/constants";

export default function ComplaintDetailClient({ complaint: initialComplaint, technicians = [] }) {
    const [complaint, setComplaint] = useState(initialComplaint);
    const [modalState, setModalState] = useState({ type: null, isOpen: false });
    const [selectedTech, setSelectedTech] = useState(initialComplaint.assignedTechnician?.id || "");
    const [scheduledDate, setScheduledDate] = useState("");
    const [selectedPriority, setSelectedPriority] = useState(initialComplaint.priority || "Medium");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [resolutionNotes, setResolutionNotes] = useState("");
    const [feedbackMsg, setFeedbackMsg] = useState({ text: "", type: "info" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const canonicalStatus = STATUS_CANONICAL_MAP[complaint.status] || complaint.status;
    const allowedTransitions = VALID_STATUS_TRANSITIONS[canonicalStatus] || [];

    // Helper: show toast message
    function showToast(text, type = "success") {
        setFeedbackMsg({ text, type });
        setTimeout(() => setFeedbackMsg({ text: "", type: "info" }), 5000);
    }

    // Action 1: Assign / Reassign Technician
    async function handleAssignSubmit(reason) {
        if (!selectedTech) {
            showToast("Please select a technician.", "error");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/warden-admin/complaints/${complaint._id}/assign`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    technicianId: selectedTech,
                    reason,
                    scheduledDate: scheduledDate || null,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to assign technician");

            showToast(data.message || "Technician assigned successfully.");
            setModalState({ type: null, isOpen: false });
            // Refresh detail
            refreshComplaint();
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setIsSubmitting(false);
        }
    }

    // Action 2: Update Priority
    async function handlePrioritySubmit(reason) {
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/warden-admin/complaints/${complaint._id}/priority`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    priority: selectedPriority,
                    reason,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to update priority");

            showToast(data.message || "Priority updated successfully.");
            setModalState({ type: null, isOpen: false });
            refreshComplaint();
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setIsSubmitting(false);
        }
    }

    // Action 3: Escalate
    async function handleEscalateSubmit(reason) {
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/warden-admin/complaints/${complaint._id}/escalate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to escalate complaint");

            showToast(data.message || "Complaint escalated successfully.");
            setModalState({ type: null, isOpen: false });
            refreshComplaint();
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setIsSubmitting(false);
        }
    }

    // Action 4: Update Status
    async function handleStatusSubmit(remarks) {
        if (!selectedStatus) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/warden-admin/complaints/${complaint._id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: selectedStatus,
                    remarks,
                    resolutionNotes: selectedStatus === "Resolved" ? resolutionNotes : undefined,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to update status");

            showToast(data.message || "Status updated successfully.");
            setModalState({ type: null, isOpen: false });
            refreshComplaint();
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setIsSubmitting(false);
        }
    }

    async function refreshComplaint() {
        try {
            const res = await fetch(`/api/warden-admin/complaints/${complaint._id}`);
            if (res.ok) {
                const data = await res.json();
                setComplaint(data.complaint);
            }
        } catch {
            // silent
        }
    }

    const isAssigned = !!complaint.assignedTechnician;
    const sla = complaint.sla;

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            {/* Breadcrumb & Navigation */}
            <div className="flex items-center justify-between">
                <Link
                    href="/warden-admin/complaints"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                >
                    <span>←</span> Back to Complaints
                </Link>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">
                        ID: {complaint._id}
                    </span>
                </div>
            </div>

            {/* Toast Notification Banner */}
            {feedbackMsg.text && (
                <div
                    className={`rounded-xl p-3.5 text-xs font-semibold flex items-center justify-between border ${
                        feedbackMsg.type === "error"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-emerald-50 text-emerald-800 border-emerald-200"
                    }`}
                >
                    <span>{feedbackMsg.text}</span>
                    <button
                        type="button"
                        onClick={() => setFeedbackMsg({ text: "", type: "info" })}
                        className="text-xs font-bold"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Overdue Alert Banner if SLA breached */}
            {sla?.isOverdue && (
                <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-red-800 flex items-start gap-3 shadow-xs">
                    <span className="text-2xl">⏰</span>
                    <div>
                        <h4 className="font-bold text-sm">SLA Overdue Warning</h4>
                        <p className="mt-0.5 text-xs text-red-700 leading-relaxed">
                            This ticket has been unresolved for <span className="font-bold">{sla.elapsedHours} hours</span>, exceeding the <span className="font-bold">{sla.slaHours}-hour {sla.priority} SLA</span>. Please expedite or escalate to maintain compliance.
                        </p>
                    </div>
                </div>
            )}

            {/* Escalated Alert Banner */}
            {complaint.isEscalated && (
                <div className="rounded-2xl border border-rose-300 bg-rose-50 p-4 text-rose-800 flex items-start gap-3 shadow-xs">
                    <span className="text-2xl">🚨</span>
                    <div>
                        <h4 className="font-bold text-sm">Ticket Escalated</h4>
                        <p className="mt-0.5 text-xs text-rose-700 leading-relaxed">
                            Escalated by <span className="font-semibold">{complaint.escalatedBy?.name || "Warden"}</span>: &ldquo;{complaint.escalationReason || "Urgent priority requested"}&rdquo;.
                        </p>
                    </div>
                </div>
            )}

            {/* Main Header Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <StatusBadge status={complaint.status} />
                            <PriorityBadge priority={complaint.priority} />
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                                {complaint.category}
                            </span>
                        </div>

                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                            {complaint.title}
                        </h1>

                        <p className="mt-1 text-xs text-slate-500">
                            Logged in <span className="font-semibold text-slate-700">{complaint.hostel}</span>, Room <span className="font-semibold text-slate-700">{complaint.roomNumber}</span> on {complaint.createdAt ? new Date(complaint.createdAt).toLocaleString() : "N/A"}
                        </p>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedTech(complaint.assignedTechnician?.id || "");
                                setModalState({ type: "assign", isOpen: true });
                            }}
                            className="rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-blue-700 transition"
                        >
                            {isAssigned ? "Reassign Tech" : "Assign Technician"}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setSelectedPriority(complaint.priority || "Medium");
                                setModalState({ type: "priority", isOpen: true });
                            }}
                            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                        >
                            Update Priority
                        </button>

                        {!complaint.isEscalated && !["Resolved", "Completed", "Closed"].includes(complaint.status) && (
                            <button
                                type="button"
                                onClick={() => setModalState({ type: "escalate", isOpen: true })}
                                className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
                            >
                                Escalate
                            </button>
                        )}

                        {allowedTransitions.length > 0 && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedStatus(allowedTransitions[0]);
                                    setModalState({ type: "status", isOpen: true });
                                }}
                                className="rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition"
                            >
                                Change Status
                            </button>
                        )}
                    </div>
                </div>

                {/* Description Body */}
                <div className="mt-6 pt-5 border-t border-slate-100">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Complaint Description
                    </h3>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                        {complaint.description}
                    </p>
                </div>

                {/* Resolution Notes (if present) */}
                {complaint.resolutionNotes && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">
                            Resolution Notes
                        </h3>
                        <p className="text-xs text-slate-700 bg-emerald-50/50 border border-emerald-100 p-3 rounded-xl">
                            {complaint.resolutionNotes}
                        </p>
                    </div>
                )}
            </div>

            {/* Two-Column Layout: Details + Timeline */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left Column: Metadata Cards */}
                <div className="space-y-5 lg:col-span-1">
                    {/* SLA Metrics Card */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                            SLA Compliance
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500">Target SLA:</span>
                                <span className="font-bold text-slate-800">{sla?.slaHours || 72} hours</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500">Elapsed Time:</span>
                                <span className={`font-bold ${sla?.isOverdue ? "text-red-600" : "text-slate-800"}`}>
                                    {sla?.elapsedHours || 0} hours
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500">Time Remaining:</span>
                                <span className="font-bold text-slate-800">
                                    {sla?.remainingHours || 0} hours
                                </span>
                            </div>

                            {/* Progress bar */}
                            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                                <div
                                    style={{ width: `${Math.min(100, sla?.percentElapsed || 0)}%` }}
                                    className={`h-full ${sla?.isOverdue ? "bg-red-500" : "bg-blue-500"} transition-all`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Student Info Card */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                            Student Details
                        </h3>
                        {complaint.studentId ? (
                            <div className="space-y-2 text-xs">
                                <p className="font-bold text-sm text-slate-900">{complaint.studentId.name}</p>
                                <p className="text-slate-600">📧 {complaint.studentId.email}</p>
                                <p className="text-slate-600">📱 {complaint.studentId.mobile || "No phone provided"}</p>
                                <p className="text-slate-600">🏢 Hostel {complaint.hostel}, Room {complaint.roomNumber}</p>
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400">Student information not available.</p>
                        )}
                    </div>

                    {/* Assigned Technician Card */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Assigned Technician
                            </h3>
                            {isAssigned && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedTech(complaint.assignedTechnician?.id || "");
                                        setModalState({ type: "assign", isOpen: true });
                                    }}
                                    className="text-[11px] font-semibold text-blue-600 hover:underline"
                                >
                                    Reassign
                                </button>
                            )}
                        </div>

                        {complaint.assignedTechnician ? (
                            <div className="space-y-2 text-xs">
                                <p className="font-bold text-sm text-slate-900">{complaint.assignedTechnician.name}</p>
                                <p className="text-slate-600">🔧 {complaint.assignedTechnician.specialization || "General"}</p>
                                <p className="text-slate-600">📱 {complaint.assignedTechnician.mobile || "No phone"}</p>
                                <p className="text-slate-600">📧 {complaint.assignedTechnician.email}</p>
                                {complaint.scheduledDate && (
                                    <div className="mt-2 rounded-lg bg-blue-50 p-2 text-blue-800 text-[11px]">
                                        Scheduled for: {new Date(complaint.scheduledDate).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="py-4 text-center">
                                <p className="text-xs text-slate-400 mb-3">No technician assigned yet.</p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedTech("");
                                        setModalState({ type: "assign", isOpen: true });
                                    }}
                                    className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition"
                                >
                                    Assign Technician Now
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Full Audit History Timeline */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-2">
                    <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">
                                Activity History & Audit Trail
                            </h2>
                            <p className="text-xs text-slate-500">
                                Complete immutable timeline of priority changes, assignments, and status updates.
                            </p>
                        </div>
                    </div>

                    <Timeline history={complaint.timeline || []} />
                </div>
            </div>

            {/* Modal: Assign / Reassign Technician */}
            <ConfirmationModal
                isOpen={modalState.type === "assign"}
                title={isAssigned ? "Reassign Technician" : "Assign Technician"}
                message={
                    isAssigned
                        ? `Currently assigned to ${complaint.assignedTechnician?.name}. Select a new technician and state the reason.`
                        : "Select an available technician to handle this maintenance ticket."
                }
                confirmLabel={isAssigned ? "Reassign Now" : "Assign Now"}
                confirmVariant="blue"
                isLoading={isSubmitting}
                requireInput={isAssigned}
                inputLabel="Reassignment Reason"
                inputRequired={isAssigned}
                inputPlaceholder="e.g. Technician unavailable / Specialized skill required..."
                onCancel={() => setModalState({ type: null, isOpen: false })}
                onConfirm={handleAssignSubmit}
            >
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Select Technician <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedTech}
                            onChange={(e) => setSelectedTech(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 p-2.5 text-xs outline-none bg-white focus:border-blue-500"
                        >
                            <option value="">-- Choose Technician --</option>
                            {technicians.map((t) => (
                                <option key={t._id} value={t._id}>
                                    {t.name} ({t.specialization}) — {t.activeWorkload} active tasks [{t.availability}]
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Scheduled Date (Optional)
                        </label>
                        <input
                            type="date"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 p-2.5 text-xs outline-none bg-white focus:border-blue-500"
                        />
                    </div>
                </div>
            </ConfirmationModal>

            {/* Modal: Update Priority */}
            <ConfirmationModal
                isOpen={modalState.type === "priority"}
                title="Update Ticket Priority"
                message="Adjust the urgency level. This recalculates the SLA and compliance window."
                confirmLabel="Save Priority"
                confirmVariant="blue"
                isLoading={isSubmitting}
                requireInput={true}
                inputLabel="Reason for Change (Optional)"
                inputRequired={false}
                inputPlaceholder="e.g. Student reported water leakage spreading to electrical board..."
                onCancel={() => setModalState({ type: null, isOpen: false })}
                onConfirm={handlePrioritySubmit}
            >
                <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                        New Priority Level
                    </label>
                    <select
                        value={selectedPriority}
                        onChange={(e) => setSelectedPriority(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 p-2.5 text-xs outline-none bg-white focus:border-blue-500"
                    >
                        {PRIORITIES.map((p) => (
                            <option key={p} value={p}>
                                {p} {p === "Urgent" ? "(24h SLA)" : p === "High" ? "(48h SLA)" : p === "Medium" ? "(72h SLA)" : "(120h SLA)"}
                            </option>
                        ))}
                    </select>
                </div>
            </ConfirmationModal>

            {/* Modal: Escalate */}
            <ConfirmationModal
                isOpen={modalState.type === "escalate"}
                title="Escalate Complaint"
                message="Escalating marks this complaint as Urgent and triggers an immediate alert to Admins and the assigned technician."
                confirmLabel="Confirm Escalation"
                confirmVariant="red"
                isLoading={isSubmitting}
                requireInput={true}
                inputLabel="Mandatory Escalation Reason"
                inputRequired={true}
                inputPlaceholder="Specify why this requires immediate escalation (e.g. safety hazard, repeated delay)..."
                onCancel={() => setModalState({ type: null, isOpen: false })}
                onConfirm={handleEscalateSubmit}
            />

            {/* Modal: Update Status */}
            <ConfirmationModal
                isOpen={modalState.type === "status"}
                title="Update Complaint Status"
                message={`Current status is "${complaint.status}". Choose a valid next transition.`}
                confirmLabel="Apply Status Transition"
                confirmVariant="indigo"
                isLoading={isSubmitting}
                requireInput={true}
                inputLabel="Remarks"
                inputRequired={false}
                inputPlaceholder="Notes explaining the status change..."
                onCancel={() => setModalState({ type: null, isOpen: false })}
                onConfirm={handleStatusSubmit}
            >
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Target Status
                        </label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 p-2.5 text-xs outline-none bg-white focus:border-blue-500"
                        >
                            {allowedTransitions.map((st) => (
                                <option key={st} value={st}>
                                    {st}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedStatus === "Resolved" && (
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Resolution Notes for Student
                            </label>
                            <textarea
                                rows={2}
                                value={resolutionNotes}
                                onChange={(e) => setResolutionNotes(e.target.value)}
                                placeholder="Explain how the maintenance issue was fixed..."
                                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs outline-none bg-white focus:border-blue-500"
                            />
                        </div>
                    )}
                </div>
            </ConfirmationModal>
        </div>
    );
}
