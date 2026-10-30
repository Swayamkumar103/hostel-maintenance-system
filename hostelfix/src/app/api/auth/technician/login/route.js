import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import User from "@/module/User";

export async function POST(request){
    try{
        await connectDB();
        const {email,password} = await request.json();

        if(!email||!password){
            return NextResponse.json(
                {
                    sucess:false,
                    message : "Email and password are required."
                },
                {status:400},
            )
        }
        const user = await User.findOne({
            email : email.trim().toLowerCase()
        })
        if(!user){
            return NextResponse.json(
                {
                    sucess:false,
                    message : "Invalid email or password"
                },
                {status:401}
            );
        }
        if(user.role!=="technician"){
            return NextResponse.json(
                {sucess : false,
                message : "Acces denied. Technician account required.",},
                {status:403}
            );
        }
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );
        if(!isPasswordValid){
            return NextResponse.json(
                {
                    sucess : false,
                    message : "Invalid email or password"
                },
                {status : 401},
            )
        }
        if(!process.env.JWT_SECRET){
            throw new Error("jwt_secret is not configured.");
        }
        const token = jwt.sign(
            {
                userId : user._id.toString(),
                role : user.role
            },
            process.env.JWT_SECRET,
            {expiresIn:"1d"}
        )
        const responce = NextResponse.json(
            {
                sucess:true,
                message:"Technician login sucessful",
                user:{
                    id:user._id.toString(),
                    name : user.name,
                    email : user.email,
                    role : user.role,
                }
            },
            {status:200}
        )
        responce.cookies.set("token",token,{
                httpOnly : true,
                secure : process.env.NODE_ENV === "production",
                sameSite : "lax",
                path:"/",
                maxAge : 60*60*24
            });
            return responce
    } catch(error){
        console.error("Technician login error: ",error);
        return NextResponse.json(
            {
                sucess : false,
                message : "An internal server error occurred."
            },
            {status:500}
        )
    }
}