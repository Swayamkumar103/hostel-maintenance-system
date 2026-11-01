import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";

export async function getCurrentUser(){
    const cookiesStore = await cookies();
    const token = cookiesStore.get("token")?.value;
    if(!token){
        redirect("/login");
    }
    try{
        const secret = process.env.JWT_SECRET || "hostelfix_dev_secret_key_123";
        const decoded = jwt.verify(
            token,
            secret,
        );
        return decoded;
    } catch(error){
        console.log("Invalid token:", error.message);
        redirect("/login");
    }
}
