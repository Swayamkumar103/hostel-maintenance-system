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

  function handleUpdate() {
    setMessage("");

    const newStatus =
      status === "Assigned"
        ? "In Progress"
        : status === "In Progress"
          ? "Completed"
          : null;

    if (!newStatus) return;

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

        onStatusUpdated?.(complaintId, newStatus);

        setMessage(result.message);
      } catch (error) {
        console.error("Complaint update error:", error);

        setMessage("Something went wrong. Please try again.");
      }
    });
  }

  if (status === "Completed") {
    return (
      <div className="rounded-lg bg-green-50 px-4 py-3 text-center text-sm font-semibold text-green-700">
        ✓ Work completed
      </div>
    );
  }

  if (status === "Pending") {
    return (
      <div className="rounded-lg bg-yellow-50 px-4 py-3 text-center text-sm text-yellow-800">
        Waiting for assignment
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleUpdate}
        disabled={isPending}
        className={`w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
          status === "Assigned"
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {isPending
          ? "Updating..."
          : status === "Assigned"
            ? "Start Work"
            : "Mark as Completed"}
      </button>

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