import { redirect } from "next/navigation"; 
import { getTechinianDashboard } from "@/app/actions/technicianActions";
import TechnicianDashboardClient from "./TechnicianDashboardClient";

export default async function TechnicianDashboardPage(){
    const result = await getTechinianDashboard();
    if(!result.success){
        if(
            result.message === "Unauthorized access." ||
            result.message === "Only technicians can access this dashboard."
        ){
            redirect("/login");
        }
        return(
            <main className = "min-h-screen bg-gray-100 p-6">
                <div className="mx-auto max-w-7xl rounded-xl bg-white p-6 shadow-sm">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Technician Dashboard
                    </h1>
                    <p className="mt-4 text-red-600">
                        {result.message||"Unable to load dashboard"}
                    </p>
                </div>
            </main>
        )
    }
    return(
        <TechnicianDashboardClient 
            initialStats={result.stats}
            initialComplaints={result.complaints}
        />
    );
}