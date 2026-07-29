import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Upload,
  History,
  User,
  Settings,
  LogOut,
  FileImage,
  Activity,
  Calendar,
  Bell,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const navigate = useNavigate();

  const stats = [
    { label: "Total Scans", value: "12", icon: FileImage, trend: "+3 this month" },
    { label: "Health Score", value: "85%", icon: Activity, trend: "Good" },
    { label: "Next Checkup", value: "Jan 25", icon: Calendar, trend: "8 days" },
    { label: "Notifications", value: "3", icon: Bell, trend: "Unread" },
  ];

  const recentScans = [
    { date: "Jan 10, 2026", type: "Panoramic X-ray", result: "No Issues", status: "healthy" },
    { date: "Dec 15, 2025", type: "Bitewing X-ray", result: "Minor Cavity", status: "warning" },
    { date: "Nov 20, 2025", type: "Panoramic X-ray", result: "Healthy", status: "healthy" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border"
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <img src="/smiloai.png" alt="Smilo Logo" className="h-16 md:h-20 w-auto object-contain" />
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, Patient! 👋
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your dental health status
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
            >
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-primary" />
                    </div>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                  <div className="text-xs text-primary mt-1">{stat.trend}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Action Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card className="gradient-primary overflow-hidden">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center md:text-left">
                    <h2 className="text-2xl font-bold text-primary-foreground mb-2">
                      Upload New X-ray
                    </h2>
                    <p className="text-primary-foreground/80 max-w-md">
                      Get instant AI-powered analysis of your dental X-rays.
                      Our advanced deep learning model detects potential issues
                      with high accuracy.
                    </p>
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      size="lg"
                      className="bg-background text-primary hover:bg-background/90 px-8 py-6 text-lg"
                    >
                      <Upload className="mr-2 w-5 h-5" />
                      Upload X-ray
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 h-full">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { icon: History, label: "View History", desc: "Past scans" },
                  { icon: User, label: "My Profile", desc: "Account settings" },
                  { icon: Calendar, label: "Book Appointment", desc: "Schedule visit" },
                ].map((action) => (
                  <motion.button
                    key={action.label}
                    whileHover={{ x: 4 }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <action.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-foreground">{action.label}</div>
                        <div className="text-xs text-muted-foreground">{action.desc}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </motion.button>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Scans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Recent Scans</CardTitle>
                <Button variant="ghost" size="sm" className="text-primary">
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentScans.map((scan, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <FileImage className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{scan.type}</div>
                        <div className="text-sm text-muted-foreground">{scan.date}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-sm font-medium ${scan.status === "healthy" ? "text-green-500" : "text-yellow-500"
                          }`}
                      >
                        {scan.result}
                      </div>
                      <Button variant="ghost" size="sm" className="text-primary p-0 h-auto">
                        View Details
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
