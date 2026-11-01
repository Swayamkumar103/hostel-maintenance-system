"use client";

import { useState } from "react";

export default function ConfirmationModal({
    isOpen,
    title,
    message,
    confirmLabel = "Confirm",
    confirmVariant = "blue",
    isLoading = false,
    requireInput = false,
    inputLabel = "Reason / Remarks",
    inputPlaceholder = "Provide detailed reason...",
    inputRequired = false,
    onConfirm,
    onCancel,
    children,
}) {
    const [inputValue, setInputValue] = useState("");
    const [inputError, setInputError] = useState("");

    if (!isOpen) return null;

    const variantStyles = {
        blue: "bg-blue-600 hover:bg-blue-700 text-white",
        red: "bg-red-600 hover:bg-red-700 text-white",
        amber: "bg-amber-600 hover:bg-amber-700 text-white",
        emerald: "bg-emerald-600 hover:bg-emerald-700 text-white",
    };

    function handleConfirmClick() {
        if (requireInput && inputRequired && (!inputValue || inputValue.trim().length < 5)) {
            setInputError("Please provide a valid reason (at least 5 characters).");
            return;
        }
        setInputError("");
        onConfirm(inputValue);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-gray-100 transition-all">
                <h3 className="text-lg font-bold text-gray-900">
                    {title}
                </h3>

                {message && (
                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                        {message}
                    </p>
                )}

                {children && <div className="mt-4">{children}</div>}

                {requireInput && (
                    <div className="mt-4">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                            {inputLabel} {inputRequired && <span className="text-red-500">*</span>}
                        </label>
                        <textarea
                            rows={3}
                            value={inputValue}
                            onChange={(e) => {
                                setInputValue(e.target.value);
                                if (inputError) setInputError("");
                            }}
                            placeholder={inputPlaceholder}
                            className="w-full rounded-xl border border-gray-300 p-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                        {inputError && (
                            <p className="mt-1 text-xs text-red-600 font-medium">
                                {inputError}
                            </p>
                        )}
                    </div>
                )}

                <div className="mt-6 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleConfirmClick}
                        disabled={isLoading}
                        className={`rounded-xl px-5 py-2 text-sm font-semibold shadow-xs transition disabled:opacity-50 ${variantStyles[confirmVariant] || variantStyles.blue}`}
                    >
                        {isLoading ? "Processing..." : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
