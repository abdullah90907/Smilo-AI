import { motion } from "framer-motion";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Image,
  Brain,
  FileText,
  MessageSquare,
  Calendar,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  Home,
  HelpCircle,
  Sparkles,
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

export default function DoctorSidebar() {
  const location = useLocation();

  const menuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: "Overview", path: "/doctor-dashboard" },
    { icon: Users, label: "Patient Reports", path: "/doctor-dashboard/reports", badge: 5 },
    { icon: Image, label: "X-ray Viewer", path: "/doctor-dashboard/xrays" },
    { icon: Brain, label: "AI Predictions", path: "/doctor-dashboard/ai-predictions" },
    { icon: FileText, label: "Case History", path: "/doctor-dashboard/cases" },
    { icon: MessageSquare, label: "Feedback to AI", path: "/doctor-dashboard/feedback" },
    { icon: Calendar, label: "Appointments", path: "/doctor-dashboard/appointments", badge: 3 },
    { icon: User, label: "My Profile", path: "/doctor-dashboard/profile" },
    { icon: Settings, label: "Settings", path: "/doctor-dashboard/settings" },
  ];

  const isActivePath = (path: string) => {
    if (path === "/doctor-dashboard") {
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
        {/* Logo & Doctor Info */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Smilo</span>
            <Badge variant="secondary" className="ml-auto text-xs">Doctor</Badge>
          </div>

          <Separator />

          {/* Doctor Profile Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/10 text-primary">
                  DR
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">Dr. Ahmed Khan</p>
                <p className="text-xs text-muted-foreground">General Dentistry</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-500" title="Online" />
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
          onClick={() => window.open("/", "_blank")}
        >
          <Home className="w-4 h-4 mr-2" />
          Back to Main Site
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
        >
          <HelpCircle className="w-4 h-4 mr-2" />
          Help Center
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
