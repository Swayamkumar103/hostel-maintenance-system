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
        },
        roomNumber : {
            type : String,
            required : true,
        },
        category: {
            type : String,
            required : true,
        },
        status : {
            type : String,
            enum : [
                "Pending",
                "Assigned",
                "In progress",
                "On Hold",
                "Completed",
            ],
            default : "Pending",
        },

        studentId:{
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
            required : true,
        },

        assignedTechician : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
            default : null,
        },
        schduledDate : {
            type : Date,
            default : null,
        },
        workNotes:{
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
    },
    {
        timestamps : true,
    }
);

export default mongoose.models.Complaint||mongoose.model("Complaint",ComplainSchema);