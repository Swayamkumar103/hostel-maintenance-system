"use client";

import { useState } from "react";

import UpdateComplaintButton from "@/app/Components/UpdateComplaintButton";

import {
    getComplaintDetails,
    updateComplaintWorkNotes
} from "@/app/actions/technicianActions";

export default function TechnicianDashboardClient({
    technicianName,
    initialStats,
    initialComplaints,
}) {

    const [complaints, setComplaints] = useState(
        initialComplaints || []
    );

    const [stats, setStats] = useState(initialStats || {
        totalTasks: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        onHold: 0
    });

    const [activeFilter, setActiveFilter] = useState("All");
    const [search, setSearch] = useState("");

    const [selectedComplaint, setSelectedComplaint] = useState(null);

    const [workNotes, setWorkNotes] = useState("");

    const [loadingDetails, setLoadingDetails] = useState(false);
    const [savingNotes, setSavingNotes] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    // ============================================
    // FILTERS
    // ============================================

    const filters = [
        "All",
        "Assigned",
        "In Progress",
        "On Hold",
        "Completed"
    ];


    // ============================================
    // FILTER AND SEARCH COMPLAINTS
    // ============================================

    const filteredComplaints = complaints.filter((complaint) => {

        const matchesFilter =
            activeFilter === "All" ||
            complaint.status === activeFilter;

        const searchText = search.toLowerCase();

        const matchesSearch = [
            complaint.title,
            complaint.category,
            complaint.hostel,
            complaint.roomNumber,
            complaint.description
        ]
            .filter(Boolean)
            .some((value) =>
                String(value).toLowerCase().includes(searchText)
            );

        return matchesFilter && matchesSearch;
    });


    // ============================================
    // UPDATE DASHBOARD STATISTICS
    // ============================================

    function calculateStats(updatedComplaints) {

        return {
            totalTasks: updatedComplaints.length,

            pending: updatedComplaints.filter(
                (item) =>
                    item.status === "Pending" ||
                    item.status === "Assigned"
            ).length,

            inProgress: updatedComplaints.filter(
                (item) => item.status === "In Progress"
            ).length,

            completed: updatedComplaints.filter(
                (item) => item.status === "Completed"
            ).length,

            onHold: updatedComplaints.filter(
                (item) => item.status === "On Hold"
            ).length
        };
    }


    // ============================================
    // HANDLE STATUS UPDATE
    // ============================================

    function handleStatusUpdated(complaintId, newStatus) {

        setComplaints((previous) => {

            const updatedComplaints = previous.map((complaint) => {

                if (complaint._id !== complaintId) {
                    return complaint;
                }

                return {
                    ...complaint,
                    status: newStatus,

                    completedAt:
                        newStatus === "Completed"
                            ? new Date().toISOString()
                            : complaint.completedAt
                };

            });

            setStats(calculateStats(updatedComplaints));

            return updatedComplaints;
        });

    }


    // ============================================
    // GET INDIVIDUAL COMPLAINT DETAILS
    // ============================================

    async function handleViewDetails(complaintId) {

        try {

            setError("");
            setSuccess("");

            setLoadingDetails(true);

            const result = await getComplaintDetails(complaintId);

            if (!result.success) {
                setError(result.message);
                return;
            }

            setSelectedComplaint(result.complaint);

            setWorkNotes(result.complaint.workNotes || "");

        } catch (error) {

            console.error("Complaint details error:", error);

            setError("Unable to fetch complaint details.");

        } finally {

            setLoadingDetails(false);

        }

    }


    // ============================================
    // UPDATE WORK NOTES
    // ============================================

    async function handleSaveWorkNotes() {

        if (!selectedComplaint) return;

        try {

            setError("");
            setSuccess("");

            setSavingNotes(true);

            const result = await updateComplaintWorkNotes(
                selectedComplaint._id,
                workNotes
            );

            if (!result.success) {
                setError(result.message);
                return;
            }

            // Update local complaint state
            setComplaints((previous) =>
                previous.map((complaint) =>
                    complaint._id === selectedComplaint._id
                        ? {
                            ...complaint,
                            workNotes: workNotes.trim()
                        }
                        : complaint
                )
            );

            setSelectedComplaint((previous) => ({
                ...previous,
                workNotes: workNotes.trim()
            }));

            setSuccess("Work notes updated successfully.");

        } catch (error) {

            console.error("Work notes error:", error);

            setError("Unable to update work notes.");

        } finally {

            setSavingNotes(false);

        }

    }


    // ============================================
    // STATISTICS CARDS
    // ============================================

    const statCards = [
        {
            title: "Total Tasks",
            value: stats.totalTasks ?? stats.total ?? 0,
            icon: "📋",
        },
        {
            title: "Pending",
            value: stats.pending ?? 0,
            icon: "⏳",
        },
        {
            title: "In Progress",
            value: stats.inProgress ?? 0,
            icon: "🔧",
        },
        {
            title: "On Hold",
            value: stats.onHold ?? 0,
            icon: "⏸️",
        },
        {
            title: "Completed",
            value: stats.completed ?? 0,
            icon: "✅",
        },
    ];


    // ============================================
    // DASHBOARD UI
    // ============================================

    return (

        <main className="min-h-screen bg-gray-100 p-4 md:p-8">

            <div className="mx-auto max-w-7xl">

                {/* HEADER */}

                <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                        <p className="text-sm font-medium text-blue-600">
                            HOSTELFIX / TECHNICIAN
                        </p>

                        <h1 className="mt-2 text-3xl font-bold text-gray-900">
                            Technician Dashboard
                        </h1>

                        <p className="mt-2 font-medium text-gray-700">
                            Technician: {technicianName}
                        </p>

                        <p className="mt-2 text-gray-500">
                            Manage your assigned complaints and maintenance work.
                        </p>

                    </div>

                    <div className="rounded-xl bg-white px-5 py-3 shadow-sm">

                        <p className="text-sm text-gray-500">
                            Your assigned tasks
                        </p>

                        <p className="text-2xl font-bold text-gray-900">
                            {stats.totalTasks ?? stats.total ?? 0}
                        </p>

                    </div>

                </header>


                {/* STATISTICS */}

                <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">

                    {statCards.map((card) => (

                        <div
                            key={card.title}
                            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                        >

                            <div className="flex items-center justify-between">

                                <p className="text-sm font-medium text-gray-500">
                                    {card.title}
                                </p>

                                <span className="text-2xl">
                                    {card.icon}
                                </span>

                            </div>

                            <p className="mt-4 text-3xl font-bold text-gray-900">
                                {card.value}
                            </p>

                        </div>

                    ))}

                </section>


                {/* COMPLAINT MANAGEMENT */}

                <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">

                    <div className="mb-6">

                        <h2 className="text-xl font-bold text-gray-900">
                            Assigned Complaints
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            View complaints and update their progress.
                        </p>

                    </div>


                    {/* SEARCH */}

                    <div className="mb-5">

                        <input
                            type="text"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Search by title, category, hostel..."
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />

                    </div>


                    {/* FILTERS */}

                    <div className="mb-6 flex flex-wrap gap-2">

                        {filters.map((filter) => (

                            <button
                                key={filter}
                                type="button"
                                onClick={() => setActiveFilter(filter)}
                                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                                    activeFilter === filter
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            >
                                {filter}
                            </button>

                        ))}

                    </div>


                    {/* COMPLAINT CARDS */}

                    {filteredComplaints.length === 0 ? (

                        <div className="rounded-xl border border-dashed border-gray-300 py-12 text-center">

                            <p className="text-lg font-semibold text-gray-700">
                                No complaints found
                            </p>

                            <p className="mt-2 text-sm text-gray-500">
                                Try another filter or search term.
                            </p>

                        </div>

                    ) : (

                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

                            {filteredComplaints.map((complaint) => (

                                <article
                                    key={complaint._id}
                                    className="rounded-xl border border-gray-200 p-5 transition hover:shadow-md"
                                >

                                    <div className="mb-4 flex items-start justify-between gap-3">

                                        <div>

                                            <h3 className="text-lg font-bold text-gray-900">
                                                {complaint.title}
                                            </h3>

                                            <p className="mt-1 text-sm text-gray-500">
                                                {complaint.category || "General maintenance"}
                                            </p>

                                        </div>

                                        <StatusBadge status={complaint.status} />

                                    </div>


                                    <p className="mb-5 text-sm leading-6 text-gray-600">
                                        {complaint.description ||
                                            "No description provided."}
                                    </p>


                                    {/* COMPLAINT INFORMATION */}

                                    <div className="mb-5 grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">

                                        <InfoItem
                                            label="Hostel"
                                            value={complaint.hostel}
                                        />

                                        <InfoItem
                                            label="Room Number"
                                            value={complaint.roomNumber}
                                        />

                                        <InfoItem
                                            label="Scheduled Date"
                                            value={
                                                complaint.scheduledDate
                                                    ? new Date(
                                                        complaint.scheduledDate
                                                    ).toLocaleDateString()
                                                    : "Not scheduled"
                                            }
                                        />

                                        <InfoItem
                                            label="Created"
                                            value={
                                                complaint.createdAt
                                                    ? new Date(
                                                        complaint.createdAt
                                                    ).toLocaleDateString()
                                                    : "Not available"
                                            }
                                        />

                                    </div>


                                    {/* ACTIONS */}

                                    <div className="flex flex-wrap gap-3">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleViewDetails(complaint._id)
                                            }
                                            disabled={loadingDetails}
                                            className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 disabled:opacity-50"
                                        >
                                            View Details
                                        </button>


                                        <UpdateComplaintButton
                                            complaintId={complaint._id}
                                            status={complaint.status}
                                            onStatusUpdated={handleStatusUpdated}
                                        />

                                    </div>

                                </article>

                            ))}

                        </div>

                    )}

                </section>


                {/* FOOTER */}

                <footer className="mt-8 text-center text-sm text-gray-500">
                    HostelFix Technician Management System
                </footer>

            </div>


            {/* ================================== */}
            {/* COMPLAINT DETAILS MODAL */}
            {/* ================================== */}

            {selectedComplaint && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">

                        <div className="mb-6 flex items-center justify-between">

                            <h2 className="text-xl font-bold text-gray-900">
                                Complaint Details
                            </h2>

                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedComplaint(null);
                                    setError("");
                                    setSuccess("");
                                }}
                                className="text-2xl text-gray-500 hover:text-gray-900"
                            >
                                &times;
                            </button>

                        </div>


                        {/* TITLE */}

                        <h3 className="text-lg font-bold text-gray-900">
                            {selectedComplaint.title}
                        </h3>

                        <div className="mt-3">
                            <StatusBadge status={selectedComplaint.status} />
                        </div>


                        {/* DESCRIPTION */}

                        <div className="mt-5">

                            <h4 className="font-semibold text-gray-800">
                                Description
                            </h4>

                            <p className="mt-2 text-sm leading-6 text-gray-600">
                                {selectedComplaint.description || "No description provided."}
                            </p>

                        </div>


                        {/* STUDENT DETAILS */}

                        <div className="mt-5 rounded-xl bg-gray-50 p-4">

                            <h4 className="mb-3 font-semibold text-gray-800">
                                Student Information
                            </h4>

                            <InfoItem
                                label="Student Name"
                                value={selectedComplaint.studentId?.name}
                            />

                            <InfoItem
                                label="Student Email"
                                value={selectedComplaint.studentId?.email}
                            />

                        </div>


                        {/* WORK NOTES */}

                        <div className="mt-6">

                            <label className="mb-2 block font-semibold text-gray-800">
                                Technician Work Notes
                            </label>

                            <textarea
                                value={workNotes}
                                onChange={(event) =>
                                    setWorkNotes(event.target.value)
                                }
                                rows={5}
                                maxLength={2000}
                                placeholder="Enter maintenance work details..."
                                className="w-full rounded-xl border border-gray-300 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                            <p className="mt-1 text-right text-xs text-gray-400">
                                {workNotes.length}/2000 characters
                            </p>

                        </div>


                        {/* ERROR MESSAGE */}

                        {error && (

                            <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                                {error}
                            </p>

                        )}


                        {/* SUCCESS MESSAGE */}

                        {success && (

                            <p className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-600">
                                {success}
                            </p>

                        )}


                        {/* SAVE BUTTON */}

                        <div className="mt-5 flex justify-end gap-3">

                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedComplaint(null);
                                    setError("");
                                    setSuccess("");
                                }}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                            >
                                Close
                            </button>

                            <button
                                type="button"
                                onClick={handleSaveWorkNotes}
                                disabled={savingNotes}
                                className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {savingNotes ? "Saving..." : "Save Work Notes"}
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </main>

    );

}


// ============================================
// REUSABLE INFORMATION COMPONENT
// ============================================

function InfoItem({ label, value }) {

    return (

        <div className="mb-3">

            <p className="text-xs text-gray-500">
                {label}
            </p>

            <p className="mt-1 break-words font-medium text-gray-800">
                {value || "Not available"}
            </p>

        </div>

    );

}


// ============================================
// STATUS BADGE
// ============================================

function StatusBadge({ status }) {

    const styles = {

        Pending: "bg-yellow-100 text-yellow-800",

        Assigned: "bg-blue-100 text-blue-800",

        "In Progress": "bg-purple-100 text-purple-800",

        "On Hold": "bg-orange-100 text-orange-800",

        Completed: "bg-green-100 text-green-800",

    };

    return (

        <span
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                styles[status] || "bg-gray-100 text-gray-700"
            }`}
        >
            {status || "Unknown"}
        </span>

    );

}