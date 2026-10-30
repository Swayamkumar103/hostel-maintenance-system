import mongoose from "mongoose";

const UserShchema = new mongoose.Schema(
    {
        name:{
            type : String,
            required : true,
            trim : true,
        },
        email:{
            type:String,
            required:true,
            unique : true,
            lowercase : true,
            trim : true,
        },
        password : {
            type : String,
            required : true,
        },
        mobile:{
            type:String,
            required : true,
        },
        role:{
            type : String,
            enum : ["student", "technician","warden"],
            required : true,
        },
        accountStatus : {
            type : String,
            enum : ["pending","approved","rejected"],
            default:"pending",
        },

        emplyeedId:{
            type:String,
            sparse : true,
        },
        specialization: {
            type : String,
        },
    },
    {timestamps: true}
);

export default mongoose.models.User || mongoose.model("User",UserShchema);
