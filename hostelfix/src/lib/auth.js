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
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET,
        );
        return decoded;
    } catch(error){
        console.log("Invalid token");
        redirect("/login");
    }
}