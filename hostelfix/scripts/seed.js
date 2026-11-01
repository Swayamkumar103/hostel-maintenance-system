import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../src/module/User.js";
import Complaint from "../src/module/complain.js";
import ComplaintHistory from "../src/module/ComplaintHistory.js";
import Notification from "../src/module/Notification.js";

export async function seedDatabase(mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27018/hostelfix_test?directConnection=true") {
    console.log("Connecting to Mongo:", mongoUri);
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    }
    console.log("Connected to Mongo!");

    console.log("Seeding test users and data...");

    // Clear existing data in test db
    await Promise.all([
        User.deleteMany({}),
        Complaint.deleteMany({}),
        ComplaintHistory.deleteMany({}),
        Notification.deleteMany({}),
    ]);

    const passwordHash = await bcrypt.hash("Admin@123", 10);
    const techHash = await bcrypt.hash("Tech@123", 10);
    const studentHash = await bcrypt.hash("Student@123", 10);
    const wardenHash = await bcrypt.hash("Warden@123", 10);

    const users = await User.create([
        {
            name: "Chief Admin",
            email: "admin@hostelfix.com",
            password: passwordHash,
            mobile: "9876543210",
            role: "admin",
            accountStatus: "approved",
            assignedHostels: ["BH-1", "BH-2", "BH-3", "GH-1", "GH-2"],
        },
        {
            name: "Warden BH-1",
            email: "warden.bh1@hostelfix.com",
            password: wardenHash,
            mobile: "9876543211",
            role: "warden",
            accountStatus: "approved",
            hostel: "BH-1",
            assignedHostels: ["BH-1"],
        },
        {
            name: "Warden GH-1",
            email: "warden.gh1@hostelfix.com",
            password: wardenHash,
            mobile: "9876543212",
            role: "warden",
            accountStatus: "approved",
            hostel: "GH-1",
            assignedHostels: ["GH-1"],
        },
        {
            name: "John Sparks",
            email: "technician.john@hostelfix.com",
            password: techHash,
            mobile: "9876543213",
            role: "technician",
            accountStatus: "approved",
            specialization: "Electrical",
            emplyeedId: "TECH-E-01",
        },
        {
            name: "Bob Pipes",
            email: "technician.bob@hostelfix.com",
            password: techHash,
            mobile: "9876543214",
            role: "technician",
            accountStatus: "approved",
            specialization: "Plumbing",
            emplyeedId: "TECH-P-01",
        },
        {
            name: "Alex Rivera",
            email: "student.alex@hostelfix.com",
            password: studentHash,
            mobile: "9876543215",
            role: "student",
            accountStatus: "approved",
            hostel: "BH-1",
        },
        {
            name: "Sara Connor",
            email: "student.sara@hostelfix.com",
            password: studentHash,
            mobile: "9876543216",
            role: "student",
            accountStatus: "approved",
            hostel: "GH-1",
        },
    ]);

    console.log(`Seeded ${users.length} users successfully.`);
    return users;
}

if (process.argv[1]?.endsWith("seed.js")) {
    seedDatabase()
        .then(() => {
            console.log("Seeding complete.");
            process.exit(0);
        })
        .catch((err) => {
            console.error("Seeding failed:", err);
            process.exit(1);
        });
}
