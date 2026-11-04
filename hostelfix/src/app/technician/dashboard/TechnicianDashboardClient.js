"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import UpdateComplaintButton from "@/app/Components/UpdateComplaintButton";

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

  const categoryIcons = {
    Electrical: "⚡",
    Plumbing: "🚰",
    Carpentry: "🪑",
    Appliance: "❄️",
    Housekeeping: "🧹",
    Civil: "🧱",
  };

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
      title: "Total Work Orders",
      value: stats.totalTasks,
      icon: "📋",
      color: "from-blue-600 to-indigo-600",
      bg: "bg-blue-50/60 border-blue-200/80",
      text: "text-blue-900",
    },
    {
      title: "Pending Action",
      value: stats.pending,
      icon: "⏳",
      color: "from-amber-500 to-orange-500",
      bg: "bg-amber-50/60 border-amber-200/80",
      text: "text-amber-900",
    },
    {
      title: "Currently In Progress",
      value: stats.inProgress,
      icon: "🔧",
      color: "from-cyan-500 to-blue-600",
      bg: "bg-cyan-50/60 border-cyan-200/80",
      text: "text-cyan-900",
    },
    {
      title: "Completed & Verified",
      value: stats.completed,
      icon: "✅",
      color: "from-emerald-500 to-teal-600",
      bg: "bg-emerald-50/60 border-emerald-200/80",
      text: "text-emerald-900",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-lg font-black text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              🔧
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-slate-900">
                  Hostel<span className="text-amber-600">Fix</span>
                </span>
                <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[9px] font-extrabold text-amber-700 uppercase tracking-widest border border-amber-200">
                  Technician Console
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Field Maintenance & Work Orders</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
            >
              Sign Out
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
          <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-amber-500/20 blur-2xl"></div>
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="inline-block rounded-md bg-white/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-300 border border-white/10 mb-2">
                Mobile Field Dispatch
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Technician Work Queue
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-300">
                View your assigned room repairs, change task status to In Progress, and submit resolution notes.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 border border-white/10 px-6 py-4 backdrop-blur-sm text-center">
              <span className="text-[11px] font-medium text-slate-300 block">Active Assigned Tasks</span>
              <span className="text-3xl font-black text-amber-400">{stats.totalTasks}</span>
            </div>
          </div>
        </section>

        {/* Statistics Cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <div
              key={card.title}
              className={`relative overflow-hidden rounded-3xl border p-5 shadow-xs transition-all hover:shadow-md ${card.bg}`}
            >
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color}`}></div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  {card.title}
                </span>
                <span className="text-2xl">{card.icon}</span>
              </div>
              <p className={`mt-3 text-3xl font-black tracking-tight ${card.text}`}>
                {card.value}
              </p>
            </div>
          ))}
        </section>

        {/* Work Queue & Complaint Management */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900">
                Assigned Work Orders
              </h2>
              <p className="text-xs text-slate-500">
                Filter by progress status or search by room, category, or hostel.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                    activeFilter === filter
                      ? "bg-amber-500 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="🔍 Search by room number, student name, category, or keywords..."
              className="w-full rounded-2xl border border-slate-300 bg-slate-50/50 px-4 py-3 text-xs outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-100"
            />
          </div>

          {/* Complaints Grid */}
          {filteredComplaints.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 py-12 text-center space-y-3">
              <Image
                src="/illustrations/empty-tickets.svg"
                alt="Empty Work Queue"
                width={160}
                height={128}
                className="w-40 h-auto mx-auto drop-shadow-xs"
              />
              <p className="text-base font-bold text-slate-700">
                No matching work orders found
              </p>
              <p className="text-xs text-slate-400">
                You have resolved all assigned tasks in this view or try clearing your search filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {filteredComplaints.map((complaint) => {
                const icon = categoryIcons[complaint.category] || "🔧";
                return (
                  <article
                    key={complaint._id}
                    className="rounded-3xl border border-slate-200/90 bg-white p-6 transition-all hover:border-amber-300 hover:shadow-md space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                            <span>{icon}</span> {complaint.category || "General"}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">#{complaint._id?.slice(-6)}</span>
                        </div>
                        <h3 className="text-base font-black text-slate-900">
                          {complaint.title}
                        </h3>
                      </div>

                      <StatusBadge status={complaint.status} />
                    </div>

                    <p className="text-xs text-slate-600 bg-slate-50/70 p-3 rounded-2xl border border-slate-100 leading-relaxed">
                      {complaint.description || "No description provided."}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 rounded-2xl bg-slate-50 p-3 text-[11px] border border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Hostel</span>
                        <span className="font-bold text-slate-800">{complaint.hostel || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Room</span>
                        <span className="font-bold text-slate-800">{complaint.roomNumber || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Priority</span>
                        <span className="font-bold text-slate-800">{complaint.priority || "Medium"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Logged</span>
                        <span className="font-bold text-slate-800">
                          {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <UpdateComplaintButton
                        complaintId={complaint._id}
                        status={complaint.status}
                        onStatusUpdated={handleStatusUpdated}
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <footer className="text-center text-xs text-slate-400 pb-8">
          HostelFix • Maintenance Field Console • Final Year Project 2026
        </footer>
      </main>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Pending: "bg-amber-100 text-amber-800 border-amber-200",
    Assigned: "bg-blue-100 text-blue-800 border-blue-200",
    "In Progress": "bg-cyan-100 text-cyan-800 border-cyan-200",
    Completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  };

  return (
    <span
      className={`whitespace-nowrap rounded-xl border px-3 py-1 text-xs font-bold ${
        styles[status] || "bg-slate-100 text-slate-700 border-slate-200"
      }`}
    >
      {status || "Unknown"}
    </span>
  );
}
