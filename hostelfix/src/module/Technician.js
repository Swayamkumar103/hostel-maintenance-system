import mongoose from "mongoose";

const TechnicianSchema = new mongoose.Schema(
    {
        role:{
            type:String,
            default:"technician",
        },
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        phone: {
            type: String,
            required: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        specialization: {
            type: String,
            required: true,
            enum: [
                "Electrician",
                "Plumber",
                "Carpenter",
                "Painter",
                "Cleaner",
                "Other"
            ]
        },

        experience: {
            type: Number,
            required: true,
            min: 0
        },

        availability: {
            type: Boolean,
            default: true
        },

        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "suspended"],
            default: "pending"
        },

        assignedComplaints: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Complaint"
            }
        ]
    },
    {
        timestamps: true
    }
);

const Technician =
    mongoose.models.Technician ||
    mongoose.model("Technician", TechnicianSchema);

export default Technician;