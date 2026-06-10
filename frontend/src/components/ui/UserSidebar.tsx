import { motion } from "framer-motion";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Scan,
  FileImage,
  MessageSquare,
  TrendingUp,
  FileText,
  Calendar,
  User,
  Settings,
  LogOut,
  Home,
  HelpCircle,
  Sparkles,
  Stethoscope,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getPatientReports } from "@/lib/api";

interface MenuItem {
  icon: any;
  label: string;
  path: string;
  badge?: number;
}

export default function UserSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [reportsCount, setReportsCount] = useState(0);
  const [user, setUser] = useState<any>({});
  const [profile, setProfile] = useState<any>(null);

  const fetchReports = async () => {
    try {
      const data = await getPatientReports();
      setReportsCount(data.reports?.length || 0);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/patient/profile", {
        headers: {
          "x-user-id": localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!).user_id || JSON.parse(localStorage.getItem("user")!).id : "",
        },
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
      }
    } catch (e) {
      console.error("Error fetching profile:", e);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchProfile();

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const handleDashboardUpdate = () => {
      fetchReports();
      fetchProfile();
    };
    window.addEventListener('dashboard-update', handleDashboardUpdate);
    return () => {
      window.removeEventListener('dashboard-update', handleDashboardUpdate);
    };
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const menuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: "Dashboard Overview", path: "/dashboard" },
    { icon: Scan, label: "Clinical X-Ray Scan", path: "/dashboard/xray" },
    { icon: FileImage, label: "Oral Photo Scanner", path: "/dashboard/photo-analysis" },
    { icon: FileSpreadsheet, label: "Advanced Report Analytics", path: "/dashboard/report-analysis" },
    { icon: MessageSquare, label: "AI Assistant Chat", path: "/dashboard/assistant" },
    { icon: TrendingUp, label: "Saved Analytics", path: "/dashboard/reports", badge: reportsCount > 0 ? reportsCount : undefined },
    { icon: Stethoscope, label: "Find Doctors", path: "/dashboard/doctors" },
    { icon: Calendar, label: "Appointments", path: "/dashboard/appointments" },
    { icon: User, label: "My Profile", path: "/dashboard/profile" },
  ];

  const isActivePath = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <motion.aside
      initial={{ x: -250, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col z-50"
    >
      <ScrollArea className="flex-1">
        {/* Logo & User Info */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Smilo</span>
            <Badge variant="secondary" className="ml-auto text-xs">Patient</Badge>
          </div>

          <Separator />

          {/* User Profile Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={profile?.profile_image_url} />
                <AvatarFallback className="bg-[#21b2c0] text-white">
                  {getInitials(profile?.full_name || user.full_name || 'Patient')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{user.full_name || 'Patient'}</p>
                <p className="text-xs text-muted-foreground">Patient ID: #{user.user_id || user.id || 'N/A'}</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-500" title="Active" />
            </div>
          </div>
        </div>

        <Separator />

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={() =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActivePath(item.path)
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1 text-sm">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <Badge variant="destructive" className="h-5 min-w-[20px] px-1.5 text-xs">
                  {item.badge}
                </Badge>
              )}
            </NavLink>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="p-3 space-y-2 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/")}
        >
          <Home className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
        >
          <HelpCircle className="w-4 h-4 mr-2" />
          Help & Support
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => (window.location.href = "/")}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </motion.aside>
  );
}

export function triggerRefreshReportsCount() {
  window.dispatchEvent(new CustomEvent('refreshReportsCount'));
}
