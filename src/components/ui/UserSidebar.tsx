import { motion } from "framer-motion";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Upload,
  FileText,
  Calendar,
  User,
  Settings,
  LogOut,
  Home,
  HelpCircle,
  Sparkles,
  Stethoscope,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MenuItem {
  icon: any;
  label: string;
  path: string;
  badge?: number;
}

export default function UserSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Upload, label: "Upload X-ray", path: "/dashboard/upload" },
    { icon: FileText, label: "My Reports", path: "/dashboard/reports", badge: 3 },
    { icon: History, label: "History", path: "/dashboard/history" },
    { icon: Stethoscope, label: "Find Doctors", path: "/dashboard/doctors" },
    { icon: Calendar, label: "Appointments", path: "/dashboard/appointments", badge: 1 },
    { icon: User, label: "My Profile", path: "/dashboard/profile" },
    { icon: Settings, label: "Settings", path: "/dashboard/settings" },
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
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/10 text-primary">
                  JD
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">John Doe</p>
                <p className="text-xs text-muted-foreground">Patient ID: #12345</p>
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
