"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function TechnicianRegister() {
    const formRef = useRef(null);
    const router = useRouter();

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();

        setError("");
        setLoading(true);

        const formData = new FormData(formRef.current);
        const data = Object.fromEntries(formData.entries());
        

        // Password confirmation
        if (data.password !== data.confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        // Remove confirmPassword
        const { confirmPassword, ...registerData } = data;
        try {
            const response = await fetch("/api/auth/technician/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(registerData)
            });

            const result = await response.json();

            if (!response.ok) {
                setError(result.message || "Registration failed");
                return;
            }

            alert(result.message);

            router.push("/login");

        } catch (error) {
            console.error("Registration Error:", error);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <h1>Technician Registration</h1>

            <form ref={formRef} onSubmit={handleSubmit}>

                {/* Name */}
                <div>
                    <label>Full Name</label>

                    <input
                        type="text"
                        name="name"
                        placeholder="Enter your full name"
                        required
                    />
                </div>

                {/* Email */}
                <div>
                    <label>Email Address</label>

                    <input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        required
                    />
                </div>

                {/* Mobile */}
                <div>
                    <label>Mobile Number</label>

                    <input
                        type="tel"
                        name="phone"
                        placeholder="Enter your mobile number"
                        required
                    />
                </div>

                {/* Specialization */}
                <div>
                    <label>Specialization</label>

                    <select
                        name="specialization"
                        defaultValue=""
                        required
                    >
                        <option value="" disabled>
                            Select your specialization
                        </option>

                        <option value="Electrician">Electrician</option>
                        <option value="Plumber">Plumber</option>
                        <option value="Carpenter">Carpenter</option>
                        <option value="Painter">Painter</option>
                        <option value="Cleaner">Cleaner</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                {/* Experience */}
                <div>
                    <label>Experience (Years)</label>

                    <input
                        type="number"
                        name="experience"
                        placeholder="Enter your experience"
                        min="0"
                        step="1"
                        required
                    />
                </div>

                {/* Password */}
                <div>
                    <label>Password</label>

                    <input
                        type="password"
                        name="password"
                        placeholder="Create a password"
                        minLength={8}
                        required
                    />
                </div>

                {/* Confirm Password */}
                <div>
                    <label>Confirm Password</label>

                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm your password"
                        minLength={8}
                        required
                    />
                </div>

                {/* Error */}
                {error && (
                    <p style={{ color: "red" }}>
                        {error}
                    </p>
                )}

                {/* Submit */}
                <button type="submit" disabled={loading}>
                    {loading ? "Registering..." : "Create Account"}
                </button>

            </form>

            <p>
                Already have an account?
                <button
                    type="button"
                    onClick={() => router.push("/login")}
                >
                    Login
                </button>
            </p>
        </div>
    );
}