import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { analyzeXray } from "../../lib/api";
import { useState, useRef } from "react";
import { useXrayData } from "@/hooks/useXrayData";
import { XrayAnalysisResult } from "@/types/xray";
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
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function UserOverview() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { addReport, reports, stats } = useXrayData();

  // Handle X-ray upload and analysis
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // 1. Get the file the user selected
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true); // Turn on loading state

    try {
      console.log("📤 Sending image to AI...");
      
      // 2. Convert image to base64 for storage
      const reader = new FileReader();
      const imageUrl = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      
      // 3. Send to Python Backend
      const result = await analyzeXray(file);
      
      // 4. Save the report with image
      const report: XrayAnalysisResult = {
        ...result,
        id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        imageUrl,
        original_image: result.original_image,
        segmented_image: result.segmented_image,
        models_used: result.models_used,
      };
      
      addReport(report);
      
      // 5. Show the result and navigate to detail
      console.log("✅ AI Response:", result);
      alert(`AI Analysis Complete!\n\nSeverity: ${result.severity_level}\nCavities Found: ${result.total_issues}`);
      
      // Navigate to the report detail page
      navigate(`/dashboard/reports/${report.id}`);
      
    } catch (error) {
      console.error("Analysis error:", error);
      alert("❌ Error: Could not connect to Smilo Backend. Is the backend running on port 8000?");
    } finally {
      setIsAnalyzing(false); // Turn off loading state
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  // Get recent scans from actual data
  const recentScans = reports.slice(0, 3).map((report) => ({
    id: report.id,
    date: new Date(report.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    type: "Panoramic X-ray",
    result: report.total_issues === 0 ? "No Issues" : `${report.total_issues} Issue(s) Found`,
    status: "completed",
    severity: report.severity_level,
  }));

  const statsData = [
    {
      label: "Total X-rays",
      value: stats.totalXrays.toString(),
      icon: FileImage,
      trend: reports.length > 0 ? `${reports.length} total` : "Upload first X-ray",
      trendUp: true,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Health Score",
      value: `${stats.healthScore}%`,
      icon: Activity,
      trend: stats.healthScore >= 80 ? "Excellent" : stats.healthScore >= 60 ? "Good" : "Needs Attention",
      trendUp: stats.healthScore >= 60,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Reports Ready",
      value: stats.reportsReady.toString(),
      icon: FileText,
      trend: "View now",
      trendUp: true,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Next Checkup",
      value: "Jan 25",
      icon: Calendar,
      trend: "8 days",
      trendUp: false,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  const upcomingAppointments = [
    {
      doctor: "Dr. Ahmed Khan",
      date: "Jan 25, 2026",
      time: "10:00 AM",
      type: "Follow-up Consultation",
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
              <h1 className="text-2xl font-bold">{getGreeting()}, John! 👋</h1>
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

        {/* Main Action Card */}
        <Card className="gradient-primary">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold text-primary-foreground mb-2">
                  Upload New X-ray for Analysis
                </h2>
                <p className="text-primary-foreground/80 max-w-md">
                  Get instant AI-powered analysis of your dental X-rays. Our advanced deep
                  learning model detects potential issues with high accuracy.
                </p>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*"
                  onChange={handleUpload}
                  disabled={isAnalyzing}
                  className="hidden"
                />
                <Button
                  size="lg"
                  className="bg-background text-primary hover:bg-background/90 px-8 py-6 text-lg"
                  onClick={triggerFileInput}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 w-5 h-5" />
                      Upload X-ray
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>

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
                {upcomingAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingAppointments.map((appointment, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold">{appointment.doctor}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {appointment.type}
                            </p>
                          </div>
                          <Badge variant="secondary">Confirmed</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {appointment.date}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Clock className="w-4 h-4" />
                          {appointment.time}
                        </div>
                      </div>
                    ))}
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
