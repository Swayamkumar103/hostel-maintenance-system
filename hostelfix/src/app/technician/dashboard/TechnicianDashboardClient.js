"use client";

import { useState } from "react";
import UpdateComplaintButton from "@/Components/UpdateComplaintButton";

export default function TechnicianDashboardClient({
  initialStats,
  initialComplaints,
}) {
  const [complaints, setComplaints] = useState(
    initialComplaints
  );

  const [stats, setStats] = useState(initialStats);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filters = [
    "All",
    "Assigned",
    "In Progress",
    "Completed",
  ];

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
      complaint.description,
    ]
      .filter(Boolean)
      .some((value) =>
        String(value).toLowerCase().includes(searchText)
      );

    return matchesFilter && matchesSearch;
  });

  function handleStatusUpdated(complaintId, newStatus) {
    setComplaints((previous) =>
      previous.map((complaint) =>
        complaint._id === complaintId
          ? {
              ...complaint,
              status: newStatus,
              completedAt:
                newStatus === "Completed"
                  ? new Date().toISOString()
                  : complaint.completedAt,
            }
          : complaint
      )
    );

    setStats((previous) => {
      const complaint = complaints.find(
        (item) => item._id === complaintId
      );

      if (!complaint) return previous;

      const next = { ...previous };

      if (
        complaint.status === "Assigned" ||
        complaint.status === "Pending"
      ) {
        next.pending = Math.max(0, next.pending - 1);
      }

      if (complaint.status === "In Progress") {
        next.inProgress = Math.max(0, next.inProgress - 1);
      }

      if (newStatus === "In Progress") {
        next.inProgress += 1;
      }

      if (newStatus === "Completed") {
        next.completed += 1;
      }

      return next;
    });
  }

  const statCards = [
    {
      title: "Total Tasks",
      value: stats.totalTasks,
      icon: "📋",
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: "⏳",
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      icon: "🔧",
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: "✅",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">
              HOSTELFIX / TECHNICIAN
            </p>

            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              Technician Dashboard
            </h1>

            <p className="mt-2 text-gray-500">
              Manage your assigned complaints and maintenance work.
            </p>
          </div>

          <div className="rounded-xl bg-white px-5 py-3 shadow-sm">
            <p className="text-sm text-gray-500">
              Your assigned tasks
            </p>

            <p className="text-2xl font-bold text-gray-900">
              {stats.totalTasks}
            </p>
          </div>
        </header>

        {/* Statistics */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

        {/* Complaint Management */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">

          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Assigned Complaints
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              View complaints and update their progress.
            </p>
          </div>

          {/* Search */}
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

          {/* Filters */}
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

          {/* Complaints */}
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

                  <div className="mb-5 grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
                    <div>
                      <p className="text-xs text-gray-500">
                        Hostel
                      </p>

                      <p className="mt-1 font-medium text-gray-800">
                        {complaint.hostel || "Not specified"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Room Number
                      </p>

                      <p className="mt-1 font-medium text-gray-800">
                        {complaint.roomNumber || "Not specified"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Scheduled Date
                      </p>

                      <p className="mt-1 font-medium text-gray-800">
                        {complaint.scheduledDate
                          ? new Date(
                              complaint.scheduledDate
                            ).toLocaleDateString()
                          : "Not scheduled"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Created
                      </p>

                      <p className="mt-1 font-medium text-gray-800">
                        {complaint.createdAt
                          ? new Date(
                              complaint.createdAt
                            ).toLocaleDateString()
                          : "Not available"}
                      </p>
                    </div>
                  </div>

                  <UpdateComplaintButton
                    complaintId={complaint._id}
                    status={complaint.status}
                    onStatusUpdated={handleStatusUpdated}
                  />
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-8 text-center text-sm text-gray-500">
          HostelFix Technician Management System
        </footer>
      </div>
    </main>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Pending: "bg-yellow-100 text-yellow-800",
    Assigned: "bg-blue-100 text-blue-800",
    "In Progress": "bg-purple-100 text-purple-800",
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