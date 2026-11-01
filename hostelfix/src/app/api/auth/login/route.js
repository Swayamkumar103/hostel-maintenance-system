import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import User from "@/module/User";

export async function POST(request) {
    try {
        await connectDB();
        const { email, password } = await request.json().catch(() => ({}));

        if (!email || !password) {
            return NextResponse.json(
                { success: false, message: "Email and password are required." },
                { status: 400 }
            );
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase(),
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Invalid email or password." },
                { status: 401 }
            );
        }

        if (user.accountStatus === "rejected") {
            return NextResponse.json(
                { success: false, message: "Your account has been rejected or disabled." },
                { status: 403 }
            );
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json(
                { success: false, message: "Invalid email or password." },
                { status: 401 }
            );
        }

        const jwtSecret = process.env.JWT_SECRET || "hostelfix_dev_secret_key_123";
        const token = jwt.sign(
            {
                userId: user._id.toString(),
                role: user.role,
                name: user.name,
                email: user.email,
            },
            jwtSecret,
            { expiresIn: "1d" }
        );

        const response = NextResponse.json(
            {
                success: true,
                message: "Login successful.",
                user: {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    mobile: user.mobile,
                    hostel: user.hostel,
                    assignedHostels: user.assignedHostels || [],
                    specialization: user.specialization,
                },
                token,
            },
            { status: 200 }
        );

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24,
        });

        return response;
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { success: false, message: "An internal server error occurred." },
            { status: 500 }
        );
    }
}
