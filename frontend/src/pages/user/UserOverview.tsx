import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Upload,
  FileText,
  Stethoscope,
  Calendar,
  Activity,
  TrendingUp,
  FileImage,
  Clock,
  CheckCircle,
  ArrowRight,
  Bell,
  Search,
  MessageSquare,
  Scan,
  Bot,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getPatientReports, getPatientAppointments } from "@/lib/api";

export default function UserOverview() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchData = async () => {
    try {
      const [reportsRes, appointmentsRes] = await Promise.all([
        getPatientReports(),
        getPatientAppointments(),
      ]);
      setReports(reportsRes.reports || []);
      setAppointments(appointmentsRes.appointments || []);
    } catch (e) {
      console.error("Error fetching data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    const handleDashboardUpdate = () => {
      fetchData();
    };
    
    window.addEventListener('dashboard-update', handleDashboardUpdate);
    return () => {
      window.removeEventListener('dashboard-update', handleDashboardUpdate);
    };
  }, []);
  
  // Get recent scans from actual data - slice top 4 most recent
  const recentScans = reports.slice(0, 4).map((report) => ({
    id: report.id,
    date: report.upload_date,
    type: report.scan_type === "xray" ? "Clinical X-Ray" : 
          report.scan_type === "photo" ? "Oral Photo" : 
          report.scan_type === "gemini" ? "AI Assessment" : 
          "Analyzed Document",
    result: report.ai_prediction,
    status: "completed",
    severity: report.severity,
  }));

  // Find the closest future approved appointment
  const now = new Date();
  const approvedAppointments = appointments.filter(a => a.status === "approved" && a.appointment_date);
  const sortedAppointments = approvedAppointments.sort((a, b) => 
    new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()
  );
  const nextAppointment = sortedAppointments.find(a => new Date(a.appointment_date) > now);
  
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "Not Available";
    }
  };

  const statsData = [
    {
      label: "Total Reports",
      value: reports.length.toString(),
      icon: FileImage,
      trend: reports.length > 0 ? `${reports.length} total` : "Upload first scan",
      trendUp: true,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Healthy Scans",
      value: reports.filter(r => r.severity === "Healthy" || r.severity === "None").length.toString(),
      icon: Activity,
      trend: "Good health",
      trendUp: true,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Reports Ready",
      value: reports.length.toString(),
      icon: FileText,
      trend: "View now",
      trendUp: true,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Next Checkup",
      value: nextAppointment ? formatDate(nextAppointment.appointment_date) : "Not Available",
      icon: Calendar,
      trend: nextAppointment ? "Scheduled" : "Book now",
      trendUp: !!nextAppointment,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  const formatAppointmentDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        time: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      };
    } catch {
      return { date: "", time: "" };
    }
  };

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
              <h1 className="text-2xl font-bold">{getGreeting()}, {user.full_name || 'Patient'}! 👋</h1>
              <p className="text-sm text-muted-foreground">
                Here's an overview of your dental health status
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search reports..." className="pl-9 w-64" />
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
          {statsData.map((stat, index) => (
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
                    {stat.trendUp && <TrendingUp className="w-4 h-4 text-green-500" />}
                  </div>
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mb-1">{stat.label}</div>
                  <div className="text-xs text-primary">{stat.trend}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card A: Clinical OPG X-ray Analysis */}
          <Card className="border-2 border-primary/20 hover:border-primary/50 transition-all">
            <CardContent className="p-8">
              <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Scan className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Clinical OPG X-ray Analysis</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Upload panoramic dental X-rays for structural segmentation and deep internal tissue anomaly detection.
                  </p>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="w-full md:w-auto">
                  <Button
                    size="lg"
                    className="w-full md:w-auto bg-primary hover:bg-primary/90"
                    onClick={() => navigate("/dashboard/xray")}
                  >
                    <>
                      <Upload className="mr-2 w-5 h-5" />
                      Start X-ray Scan
                    </>
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>

          {/* Card B: Real Image Caries Detection */}
          <Card className="border-2 border-teal-500/20 hover:border-teal-500/50 transition-all">
            <CardContent className="p-8">
              <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4">
                <div className="w-16 h-16 rounded-2xl bg-teal-500/10 flex items-center justify-center">
                  <FileImage className="w-8 h-8 text-teal-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Real Image Caries Detection</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Scan standard surface photos of teeth to instantly identify visible cavities, surface decay spots, and enamel wear.
                  </p>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="w-full md:w-auto">
                  <Button
                    size="lg"
                    className="w-full md:w-auto bg-teal-500 hover:bg-teal-500/90"
                    onClick={() => navigate("/dashboard/photo-analysis")}
                  >
                    <>
                      <Scan className="mr-2 w-5 h-5" />
                      Run Photo Diagnostics
                    </>
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>

          {/* Card C: AI Clinical Guidance & Chatbot */}
          <Card className="border-2 border-purple-500/20 hover:border-purple-500/50 transition-all">
            <CardContent className="p-8">
              <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                  <Bot className="w-8 h-8 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">AI Clinical Guidance & Chatbot</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Consult our multimodal assistant regarding symptoms, home precautions, or custom dental guidance panels.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full">
                  <Button
                    variant="outline"
                    className="border-purple-500/30 hover:border-purple-500 text-purple-500"
                    onClick={() => navigate("/dashboard/assistant")}
                  >
                    <Upload className="mr-2 w-4 h-4" />
                    Interactive Screening
                  </Button>
                  <Button
                    variant="outline"
                    className="border-purple-500/30 hover:border-purple-500 text-purple-500"
                    onClick={() => navigate("/dashboard/assistant")}
                  >
                    <MessageSquare className="mr-2 w-4 h-4" />
                    Chat with Assistant
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card D: Advanced Report Analytics */}
          <Card className="border-2 border-orange-500/20 hover:border-orange-500/50 transition-all">
            <CardContent className="p-8">
              <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4">
                <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Advanced Report Analytics</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Dive into detailed reports, track your dental health progress, and view comprehensive analytics.
                  </p>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="w-full md:w-auto">
                  <Button
                    size="lg"
                    className="w-full md:w-auto bg-orange-500 hover:bg-orange-500/90"
                    onClick={() => navigate("/dashboard/reports")}
                  >
                    <FileText className="mr-2 w-5 h-5" />
                    Analyze Saved Reports
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Scans */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Scans</CardTitle>
                  <CardDescription>Your latest X-ray analysis results</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/dashboard/reports")}
                >
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentScans.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileImage className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No scans yet</p>
                  <p className="text-xs mt-1">Upload your first X-ray to get started</p>
                </div>
              ) : (
              <div className="space-y-4">
                {recentScans.map((scan) => (
                  <motion.div
                    key={scan.id}
                    whileHover={{ x: 4 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all cursor-pointer"
                    onClick={() => navigate(`/dashboard/reports/${scan.id}`)}
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
                        className={`text-sm font-medium ${
                          scan.severity === "Healthy" ? "text-green-500" : "text-yellow-500"
                        }`}
                      >
                        {scan.result}
                      </div>
                      <Badge
                        variant={scan.severity === "Healthy" ? "secondary" : "default"}
                        className="mt-1"
                      >
                        {scan.severity}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Appointments & Quick Actions */}
          <div className="space-y-6">
            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                {nextAppointment ? (
                  <div className="space-y-3">
                    <div
                      className="p-4 rounded-lg bg-[#21b2c0]/10 hover:bg-[#21b2c0]/20 transition-colors border border-[#21b2c0]/20"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-[#21b2c0]">{nextAppointment.doctor_name}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {nextAppointment.clinic_name}
                          </p>
                        </div>
                        <Badge className="bg-[#21b2c0] text-white hover:bg-[#1a95a0]">Confirmed</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {formatAppointmentDate(nextAppointment.appointment_date).date}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Clock className="w-4 h-4" />
                        {formatAppointmentDate(nextAppointment.appointment_date).time}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No upcoming appointments</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    icon: FileText,
                    label: "View Reports",
                    desc: "All your reports",
                    path: "/dashboard/reports",
                  },
                  {
                    icon: Stethoscope,
                    label: "Find Doctors",
                    desc: "Verified dentists",
                    path: "/dashboard/doctors",
                  },
                  {
                    icon: Calendar,
                    label: "Book Appointment",
                    desc: "Schedule visit",
                    path: "/dashboard/appointments",
                  },
                ].map((action) => (
                  <motion.button
                    key={action.label}
                    whileHover={{ x: 4 }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-all"
                    onClick={() => navigate(action.path)}
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
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </motion.button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
