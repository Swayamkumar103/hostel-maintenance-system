import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Technician from "@/module/Technician";
import bcrypt from "bcryptjs";

export async function POST(request) {
    try {
        await connectDB();

        const {
            name,
            email,
            phone,
            password,
            specialization,
            experience
        } = await request.json();

        // 1. Validate required fields
        if (
            !name ||
            !email ||
            !phone ||
            !password ||
            !specialization ||
            experience === undefined ||
            experience === ""
        ) {
            return NextResponse.json(
                { message: "All fields are required" },
                { status: 400 }
            );
        }

        // 2. Validate password
        if (password.length < 8) {
            return NextResponse.json(
                { message: "Password must contain at least 8 characters" },
                { status: 400 }
            );
        }

        // 3. Validate experience
        const experienceValue = Number(experience);

        if (
            !Number.isInteger(experienceValue) ||
            experienceValue < 0
        ) {
            return NextResponse.json(
                { message: "Experience must be a valid non-negative number" },
                { status: 400 }
            );
        }

        // 4. Normalize email
        const normalizedEmail = email.toLowerCase().trim();

        // 5. Check existing technician
        const existingTechnician = await Technician.findOne({
            email: normalizedEmail
        });

        if (existingTechnician) {
            return NextResponse.json(
                { message: "Email is already registered" },
                { status: 409 }
            );
        }

        // 6. Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // 7. Create technician account
        const newTechnician = await Technician.create({
            name: name.trim(),
            email: normalizedEmail,
            phone: phone.trim(),
            password: hashedPassword,
            specialization,
            experience: experienceValue,
            availability: true,
            role: "technician",
            accountStatus: "pending"
        });

        // 8. Send response
        return NextResponse.json(
            {
                success: true,
                message: "Technician registered successfully. Waiting for admin approval.",
                technicianId: newTechnician._id
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Technician Registration Error:", error);

        if (error.code === 11000) {
            return NextResponse.json(
                { message: "Email is already registered" },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}