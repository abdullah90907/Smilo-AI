import { Outlet } from "react-router-dom";
import DoctorSidebar from "@/components/ui/DoctorSidebar";

export default function DoctorDashboard() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Fixed Left Sidebar */}
      <DoctorSidebar />

      {/* Main Content Area */}
      <main className="flex-1 ml-64">
        <Outlet />
      </main>
    </div>
  );
}
