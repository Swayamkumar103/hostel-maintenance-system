"use client"
import {useRef, useState} from "react";
import { useRouter } from "next/navigation";
export default function Login(){
    const formRef = useRef(null);
    const router = useRouter();
    const[error, setError] = useState("");
    const [loading,setLoading] = useState(false);
    async function handleSubmit(e){
        e.preventDefault();
        setError("");
        setLoading(true);
        const formData = new FormData(formRef.current);
        const data = Object.fromEntries(formData.entries());
        // API and Dashboard mapping
        const roleConfig = {
            user:{
                api:"/api/user/login",
                redirect:"/user/dashboard"
            },
            technician:{
                api:"/api/auth/technician/login",
                redirect:"/technician/dashboard"
            },
            admin:{
                api:"/api/admin/login",
                redirect:"/admin/dashboard"
            },
        };
        const selectedRole = data.role;
        const config = roleConfig[selectedRole];
        if(!config){
            setError("Please select a valid role");
            setLoading(false);
            return;
        }
        const {role , ...credentials} = data;
        try{
            const responce = await fetch(config.api,{
                method: "POST",
                headers:{
                    "Content-type":"application/json"
                },
                body:JSON.stringify(credentials)
            });
            const result = await responce.json();
            if(!responce.ok){
                setError(result.message||"Login failed");
                return;
            }
            router.push(config.redirect)
        } catch(error){
            setError("Something went wrong. Please try again.");
        }finally{
            setLoading(false);
        }
    }
    return(
        <div>
            <h1>HostelFix login</h1>
            <form ref = {formRef} onSubmit={handleSubmit}>
                {/* Select Role  */}
                <div>
                    <label>Select User Type</label>
                    <select name="role" defaultValue="" required>
                        <option value=""disabled>
                            Select your role
                        </option>
                        <option value="user">Student</option>

                        <option value="technician">Technician</option>

                        <option value="admin">Admin</option>
                    </select>
                </div>
                {/* Email  */}
                <div>
                    Email 
                    <input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        required
                    />
                </div>
                <div>
                    Password 
                    <input
                        type="password"
                        name="password"
                        placeholder="Enter your password"
                        required
                    />
                </div>
                {error && <p>{error}</p>}
                <button type="submit" disabled={loading}>
                    {loading? "loggin in...":"Login"}
                </button>
            </form>
        </div>
    )
}