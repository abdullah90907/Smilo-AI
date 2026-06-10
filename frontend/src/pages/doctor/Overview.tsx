import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDoctorStats, getPendingReports, getDoctorAppointments, getReviewedReports } from "@/lib/api";

export default function Overview() {
  const navigate = useNavigate();
  const [pendingReports, setPendingReports] = useState<any[]>([]);
  const [reviewedReports, setReviewedReports] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Compute stats
  const pendingReportsCount = pendingReports.length;
  const approvedAppointments = appointments.filter(a => a.status === "approved");
  const consultationsToday = approvedAppointments.length;
  const uniquePatientIds = new Set(appointments.map(a => a.patient_id));
  const totalPatients = uniquePatientIds.size;
  const aiAccuracyRate = "94.2%";

  const statsArray = [
    {
      label: "Pending Reports",
      value: String(pendingReportsCount),
      icon: FileText,
      trend: "+2 today",
      trendUp: true,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      label: "Consultations Today",
      value: String(consultationsToday),
      icon: Calendar,
      trend: `${approvedAppointments.length} scheduled`,
      trendUp: true,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Total Patients",
      value: String(totalPatients),
      icon: Users,
      trend: "+8 this month",
      trendUp: true,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "AI Accuracy Rate",
      value: aiAccuracyRate,
      icon: Brain,
      trend: "+2.3%",
      trendUp: true,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const fetchData = async () => {
      try {
        const [reportsRes, reviewedRes, appointmentsRes] = await Promise.all([
          getPendingReports(),
          getReviewedReports(),
          getDoctorAppointments()
        ]);
        setPendingReports(reportsRes.reports || []);
        setReviewedReports(reviewedRes.reports || []);
        setAppointments(appointmentsRes.appointments || []);
      } catch (e) {
        console.error("Error fetching data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Add listener for dashboard updates
    const handleUpdate = () => fetchData();
    window.addEventListener('dashboard-update', handleUpdate);
    return () => window.removeEventListener('dashboard-update', handleUpdate);
  }, []);

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
                {getGreeting()}, {user?.full_name || "Doctor"}
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
          {statsArray.map((stat, index) => (
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
          {/* Pending & Complete Reports (using appointments) */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Case Review</CardTitle>
                  <CardDescription>Pending and completed reviews</CardDescription>
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
              <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="pending">Pending ({appointments.filter(a => a.status === "pending").length})</TabsTrigger>
                  <TabsTrigger value="reviewed">Complete ({appointments.filter(a => a.status === "approved" || a.status === "closed").length})</TabsTrigger>
                </TabsList>
                <TabsContent value="pending" className="mt-4">
                  <div className="space-y-3">
                    {appointments.filter(a => a.status === "pending").slice(0, 5).map((appt) => (
                      <motion.div
                        key={appt.id}
                        whileHover={{ x: 4 }}
                        className="p-4 rounded-lg border border-border hover:border-primary/50 transition-all cursor-pointer"
                        onClick={() => navigate(`/doctor-dashboard/reports/${appt.id}`)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold">{appt.patient_name}</p>
                          <Badge variant="destructive">Pending</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          ID: {appt.patient_id} • {formatDate(appt.created_at)}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="reviewed" className="mt-4">
                  <div className="space-y-3">
                    {appointments.filter(a => a.status === "approved" || a.status === "closed").slice(0, 5).map((appt) => (
                      <motion.div
                        key={appt.id}
                        whileHover={{ x: 4 }}
                        className="p-4 rounded-lg border border-border hover:border-primary/50 transition-all cursor-pointer"
                        onClick={() => navigate(`/doctor-dashboard/reports/${appt.id}`)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold">{appt.patient_name}</p>
                          <Badge variant="secondary">{appt.status}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          ID: {appt.patient_id} • {formatDate(appt.created_at)}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {approvedAppointments.map((appt, index) => (
                      <div
                        key={appt.id || index}
                        className="p-3 rounded-lg bg-[#21b2c0]/10 hover:bg-[#21b2c0]/20 transition-colors border border-[#21b2c0]/20"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-semibold text-sm text-[#21b2c0]">
                            {appt.patient_name}
                          </p>
                          <Badge className="bg-[#21b2c0] text-white hover:bg-[#1a95a0]">
                            Approved
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {appt.appointment_date ? formatDate(appt.appointment_date) : "Not scheduled"}
                        </div>
                        {appt.doctor_note && (
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            Note: {appt.doctor_note}
                          </p>
                        )}
                      </div>
                    ))}
                    {approvedAppointments.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No upcoming appointments</p>
                      </div>
                    )}
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
