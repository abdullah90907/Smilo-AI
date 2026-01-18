import { Outlet } from "react-router-dom";
import UserSidebar from "@/components/ui/UserSidebar";

export default function UserDashboardLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Fixed Left Sidebar */}
      <UserSidebar />

      {/* Main Content Area */}
      <main className="flex-1 ml-64">
        <Outlet />
      </main>
    </div>
  );
}
