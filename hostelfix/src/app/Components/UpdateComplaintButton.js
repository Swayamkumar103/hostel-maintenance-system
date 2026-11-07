"use client";

import { useState, useTransition } from "react";

import { updateComplaintStatus } from "@/app/actions/technicianActions";

export default function UpdateComplaintButton({
    complaintId,
    status,
    onStatusUpdated,
}) {

    const [message, setMessage] = useState("");
    const [isPending, startTransition] = useTransition();


    // ============================================
    // HANDLE STATUS UPDATE
    // ============================================

    function handleUpdate(newStatus) {

        setMessage("");

        startTransition(async () => {

            try {

                const result = await updateComplaintStatus(
                    complaintId,
                    newStatus
                );

                if (!result.success) {

                    setMessage(
                        result.message || "Unable to update complaint."
                    );

                    return;
                }

                // Update parent dashboard
                onStatusUpdated?.(complaintId, newStatus);

                setMessage(
                    result.message || "Complaint status updated successfully."
                );

            } catch (error) {

                console.error("Complaint update error:", error);

                setMessage(
                    "Something went wrong. Please try again."
                );

            }

        });

    }


    // ============================================
    // COMPLETED STATUS
    // ============================================

    if (status === "Completed") {

        return (

            <div className="rounded-lg bg-green-50 px-4 py-3 text-center text-sm font-semibold text-green-700">
                ✓ Work Completed
            </div>

        );

    }


    // ============================================
    // PENDING STATUS
    // ============================================

    if (status === "Pending") {

        return (

            <div className="rounded-lg bg-yellow-50 px-4 py-3 text-center text-sm text-yellow-800">
                Waiting for assignment
            </div>

        );

    }


    // ============================================
    // BUTTONS BASED ON COMPLAINT STATUS
    // ============================================

    function renderButtons() {

        switch (status) {

            // Assigned → In Progress
            case "Assigned":

                return (

                    <button
                        type="button"
                        onClick={() => handleUpdate("In Progress")}
                        disabled={isPending}
                        className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isPending ? "Updating..." : "Start Work"}
                    </button>

                );


            // In Progress → On Hold / Completed
            case "In Progress":

                return (

                    <div className="flex flex-wrap gap-2">

                        <button
                            type="button"
                            onClick={() => handleUpdate("On Hold")}
                            disabled={isPending}
                            className="rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isPending ? "Updating..." : "Put On Hold"}
                        </button>


                        <button
                            type="button"
                            onClick={() => handleUpdate("Completed")}
                            disabled={isPending}
                            className="rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isPending ? "Updating..." : "Mark Completed"}
                        </button>

                    </div>

                );


            // On Hold → In Progress
            case "On Hold":

                return (

                    <button
                        type="button"
                        onClick={() => handleUpdate("In Progress")}
                        disabled={isPending}
                        className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isPending ? "Updating..." : "Resume Work"}
                    </button>

                );


            default:

                return (

                    <p className="text-sm text-gray-500">
                        No action available.
                    </p>

                );

        }

    }


    // ============================================
    // COMPONENT UI
    // ============================================

    return (

        <div className="w-full">

            {renderButtons()}

            {message && (

                <p
                    role="status"
                    className="mt-3 text-center text-sm text-gray-600"
                >
                    {message}
                </p>

            )}

        </div>

    );

}