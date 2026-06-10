import { Outlet } from "react-router-dom";
import DoctorSidebar from "@/components/ui/DoctorSidebar";
import { useState, useEffect } from "react";
import { getDoctorStats, getDoctorAppointments } from "@/lib/api";

export default function DoctorDashboard() {
  const [pendingReportsCount, setPendingReportsCount] = useState(0);
  const [pendingAppointmentsCount, setPendingAppointmentsCount] = useState(0);

  const fetchCounts = async () => {
    try {
      const [statsRes, appointmentsRes] = await Promise.all([
        getDoctorStats(),
        getDoctorAppointments()
      ]);
      setPendingReportsCount(statsRes.stats?.pending_reports || 0);
      const pendingAppointments = appointmentsRes.appointments?.filter((a: any) => a.status === "pending") || [];
      setPendingAppointmentsCount(pendingAppointments.length);
    } catch (e) {
      console.error("Error fetching counts:", e);
    }
  };

  useEffect(() => {
    fetchCounts();
    window.addEventListener('dashboard-update', fetchCounts);
    return () => {
      window.removeEventListener('dashboard-update', fetchCounts);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Fixed Left Sidebar */}
      <DoctorSidebar 
        pendingReportsCount={pendingReportsCount}
        pendingAppointmentsCount={pendingAppointmentsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 ml-64">
        <Outlet />
      </main>
    </div>
  );
}
