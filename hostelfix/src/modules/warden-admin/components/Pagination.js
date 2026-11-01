"use client";

export default function Pagination({ page, totalPages, total, limit, onPageChange }) {
    if (totalPages <= 1 && total <= limit) return null;

    const startIdx = (page - 1) * limit + 1;
    const endIdx = Math.min(total, page * limit);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
                Showing <span className="font-semibold text-gray-700">{total > 0 ? startIdx : 0}</span> to{" "}
                <span className="font-semibold text-gray-700">{endIdx}</span> of{" "}
                <span className="font-semibold text-gray-700">{total}</span> complaints
            </p>

            <div className="flex items-center gap-1.5">
                <button
                    type="button"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Previous
                </button>

                <span className="px-3 py-1.5 text-xs font-semibold text-gray-800">
                    Page {page} of {totalPages || 1}
                </span>

                <button
                    type="button"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
