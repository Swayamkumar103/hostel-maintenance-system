import mongoose from "mongoose";

const ComplainSchema = new mongoose.Schema(
    {
        title:{
            type : String,
            required : true,
            trim : true,
        },

        description : {
            type : String,
            required : true,
        },
        hostel : {
            type : String,
            required : true,
            index: true,
        },
        roomNumber : {
            type : String,
            required : true,
        },
        category: {
            type : String,
            required : true,
            index: true,
        },
        priority: {
            type : String,
            enum : ["Low", "Medium", "High", "Urgent"],
            default : "Medium",
            index: true,
        },
        status : {
            type : String,
            enum : [
                "Pending",
                "Submitted",
                "Assigned",
                "In progress",
                "In Progress",
                "On Hold",
                "Completed",
                "Resolved",
                "Closed",
                "Escalated",
            ],
            default : "Submitted",
            index: true,
        },

        studentId:{
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
            required : true,
            index: true,
        },

        // Primary technician assignment field
        assignedTechnician : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
            default : null,
            index: true,
        },

        // Backward-compatible alias for existing codebase schema typo
        assignedTechician : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
            default : null,
        },

        scheduledDate : {
            type : Date,
            default : null,
        },

        // Backward-compatible alias for existing codebase schema typo
        schduledDate : {
            type : Date,
            default : null,
        },

        workNotes:{
            type : String,
            default : "",
        },

        resolutionNotes:{
            type : String,
            default : "",
        },

        completionPhoto: {
            type : [String],
            default : [],
        },

        completedAt : {
            type : Date,
            default : null,
        },

        closedAt : {
            type : Date,
            default : null,
        },

        closedBy : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
            default : null,
        },

        isEscalated : {
            type : Boolean,
            default : false,
            index: true,
        },

        escalationReason : {
            type : String,
            default : null,
        },

        escalatedAt : {
            type : Date,
            default : null,
        },

        escalatedBy : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
            default : null,
        },
    },
    {
        timestamps : true,
    }
);

// Synchronize backward-compatible aliases prior to save
ComplainSchema.pre("save", function () {
    if (this.assignedTechnician && !this.assignedTechician) {
        this.assignedTechician = this.assignedTechnician;
    } else if (this.assignedTechician && !this.assignedTechnician) {
        this.assignedTechnician = this.assignedTechician;
    }

    if (this.scheduledDate && !this.schduledDate) {
        this.schduledDate = this.scheduledDate;
    } else if (this.schduledDate && !this.scheduledDate) {
        this.scheduledDate = this.schduledDate;
    }
});

// Compound indexes for optimal queries and dashboard aggregation
ComplainSchema.index({ hostel: 1, status: 1 });
ComplainSchema.index({ assignedTechnician: 1, status: 1 });
ComplainSchema.index({ priority: 1, status: 1 });
ComplainSchema.index({ isEscalated: 1, createdAt: -1 });
ComplainSchema.index({ createdAt: -1 });

export default mongoose.models.Complaint || mongoose.model("Complaint", ComplainSchema);
