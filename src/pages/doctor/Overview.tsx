import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Calendar,
  FileText,
  CheckCircle,
  TrendingUp,
  AlertCircle,
  Clock,
  Activity,
  Brain,
  ArrowRight,
  Bell,
  Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default function Overview() {
  const navigate = useNavigate();

  const stats = [
    {
      label: "Pending Reports",
      value: "5",
      icon: FileText,
      trend: "+2 today",
      trendUp: true,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      label: "Consultations Today",
      value: "3",
      icon: Calendar,
      trend: "2 completed",
      trendUp: true,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Total Patients",
      value: "127",
      icon: Users,
      trend: "+8 this month",
      trendUp: true,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "AI Accuracy Rate",
      value: "94.2%",
      icon: Brain,
      trend: "+2.3%",
      trendUp: true,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  const recentActivity = [
    {
      type: "New Report",
      message: "New report assigned - Patient ID #12345",
      time: "2 hours ago",
      icon: FileText,
      color: "text-blue-500",
    },
    {
      type: "Consultation",
      message: "Consultation completed with Patient #12289",
      time: "4 hours ago",
      icon: CheckCircle,
      color: "text-green-500",
    },
    {
      type: "AI Validation",
      message: "AI prediction validated for Case #445",
      time: "5 hours ago",
      icon: Brain,
      color: "text-purple-500",
    },
    {
      type: "Appointment",
      message: "New appointment request from Patient #12401",
      time: "6 hours ago",
      icon: Calendar,
      color: "text-orange-500",
    },
  ];

  const upcomingAppointments = [
    {
      patientId: "#12345",
      time: "10:00 AM",
      type: "Video Consultation",
      status: "upcoming",
    },
    {
      patientId: "#12401",
      time: "02:30 PM",
      type: "In-Clinic",
      status: "upcoming",
    },
    {
      patientId: "#12289",
      time: "04:00 PM",
      type: "Follow-up",
      status: "confirmed",
    },
  ];

  const pendingReports = [
    {
      patientId: "#12567",
      uploadDate: "Jan 18, 2026",
      aiPrediction: "Dental Caries",
      confidence: "87.3%",
      severity: "Moderate",
    },
    {
      patientId: "#12568",
      uploadDate: "Jan 18, 2026",
      aiPrediction: "Healthy",
      confidence: "92.1%",
      severity: "None",
    },
    {
      patientId: "#12569",
      uploadDate: "Jan 17, 2026",
      aiPrediction: "Dental Caries",
      confidence: "78.5%",
      severity: "Mild",
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Dashboard Overview</h1>
              <p className="text-sm text-muted-foreground">
                {getGreeting()}, Dr. Ahmed Khan
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients..."
                  className="pl-9 w-64"
                />
              </div>
              <Button variant="outline" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    {stat.trendUp && (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mb-1">{stat.label}</div>
                  <div className="text-xs text-primary">{stat.trend}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="gradient-primary">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-primary-foreground mb-2">
                  Quick Actions
                </h3>
                <p className="text-primary-foreground/80">
                  Access frequently used features quickly
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  className="bg-background text-primary hover:bg-background/90"
                  onClick={() => navigate("/doctor-dashboard/reports")}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Pending Reports
                </Button>
                <Button
                  className="bg-background text-primary hover:bg-background/90"
                  onClick={() => navigate("/doctor-dashboard/appointments")}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Check Schedule
                </Button>
                <Button
                  className="bg-background text-primary hover:bg-background/90"
                  onClick={() => navigate("/doctor-dashboard/profile")}
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Update Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Pending Reports */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pending Reports</CardTitle>
                  <CardDescription>Review AI-analyzed X-rays</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/doctor-dashboard/reports")}
                >
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingReports.map((report) => (
                  <motion.div
                    key={report.patientId}
                    whileHover={{ x: 4 }}
                    className="p-4 rounded-lg border border-border hover:border-primary/50 transition-all cursor-pointer"
                    onClick={() => navigate(`/doctor-dashboard/reports/${report.patientId}`)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">Patient {report.patientId}</p>
                          <p className="text-xs text-muted-foreground">{report.uploadDate}</p>
                        </div>
                      </div>
                      <Badge
                        variant={report.severity === "None" ? "secondary" : "destructive"}
                      >
                        {report.severity}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">AI Prediction:</span>
                      <span className="font-medium">{report.aiPrediction}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Confidence:</span>
                      <span className="font-medium text-primary">{report.confidence}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Appointments & Recent Activity */}
          <div className="space-y-6">
            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {upcomingAppointments.map((appointment, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-semibold text-sm">
                            Patient {appointment.patientId}
                          </p>
                          <Badge
                            variant={
                              appointment.status === "confirmed" ? "secondary" : "default"
                            }
                            className="text-xs"
                          >
                            {appointment.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {appointment.time}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {appointment.type}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0`}>
                          <activity.icon className={`w-4 h-4 ${activity.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{activity.message}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
