import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FileImage,
  FileText,
  Calendar,
  TrendingUp,
  Search,
  Trash2,
  Eye,
  Stethoscope,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getPatientReports, deleteMultipleReports, getPatientAppointments, attachReportToAppointment } from "@/lib/api";
import { toast } from "sonner";

type Report = {
  id: number;
  scan_type: string;
  filename: string;
  ai_prediction: string;
  confidence: string;
  severity: string;
  upload_date: string;
  image_data?: string;
  result_json?: any;
};

type Appointment = {
  id: number;
  doctor_id: number;
  doctor_name: string;
  clinic_name: string;
  status: string;
  appointment_date?: string;
  created_at: string;
};

export default function UserReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReports, setSelectedReports] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [forwardModalOpen, setForwardModalOpen] = useState(false);
  const [selectedReportToForward, setSelectedReportToForward] = useState<Report | null>(null);

  const fetchReports = async () => {
    try {
      const data = await getPatientReports();
      setReports(data.reports);
    } catch (e) {
      console.error("Error fetching reports:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const data = await getPatientAppointments();
      setAppointments(data.appointments);
    } catch (e) {
      console.error("Error fetching appointments:", e);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const openForwardModal = (report: Report) => {
    setSelectedReportToForward(report);
    setForwardModalOpen(true);
    fetchAppointments();
  };

  const handleForwardReport = async (appointment: Appointment) => {
    if (!selectedReportToForward) return;
    try {
      await attachReportToAppointment(
        appointment.id,
        selectedReportToForward.id,
        selectedReportToForward.scan_type
      );
      toast.success("Report successfully attached to appointment!");
      setForwardModalOpen(false);
      setSelectedReportToForward(null);
    } catch (e: any) {
      toast.error(e.message || "Failed to attach report");
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Healthy":
      case "None":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Mild":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "Moderate":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "Severe":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getPredictionLabel = (scanType: string) => {
    switch (scanType) {
      case "xray":
      case "photo":
        return "Severity Level";
      case "gemini":
        return "Hygiene Assessment";
      case "document":
        return "Document Diagnosis";
      default:
        return "AI Prediction";
    }
  };

  const formatConfidence = (confidence: string, scanType: string) => {
    if (scanType === "gemini") {
      return "AI Assessed";
    }
    if (!confidence || confidence === "null" || confidence === "undefined" || confidence === "N/A" || confidence === "0.0%") {
      return "N/A";
    }
    if (confidence.includes("%")) {
      return confidence;
    }
    const numConfidence = parseFloat(confidence);
    if (isNaN(numConfidence)) {
      return "N/A";
    }
    return `${numConfidence}%`;
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          report.ai_prediction.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "xray") return matchesSearch && report.scan_type === "xray";
    if (activeTab === "photo") return matchesSearch && report.scan_type === "photo";
    if (activeTab === "gemini") return matchesSearch && report.scan_type === "gemini";
    if (activeTab === "document") return matchesSearch && report.scan_type === "document";
    
    return matchesSearch;
  });

  const toggleReportSelection = (reportId: number) => {
    setSelectedReports(prev => 
      prev.includes(reportId) 
        ? prev.filter(id => id !== reportId) 
        : [...prev, reportId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedReports.length === filteredReports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(filteredReports.map(r => r.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedReports.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedReports.length} report(s)?`)) return;
    
    try {
      await deleteMultipleReports(selectedReports);
      toast.success(`Successfully deleted ${selectedReports.length} report(s)`);
      setSelectedReports([]);
      await fetchReports();
    } catch (e) {
      console.error("Error deleting reports:", e);
      toast.error("Failed to delete reports");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">My Reports</h1>
              <p className="text-sm text-muted-foreground">
                View and manage all your analysis reports
              </p>
            </div>
            {selectedReports.length > 0 && (
              <Button 
                variant="destructive"
                onClick={handleDeleteSelected}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected ({selectedReports.length})
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Reports</p>
                  <p className="text-3xl font-bold">{reports.length}</p>
                </div>
                <FileImage className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Healthy Scans</p>
                  <p className="text-3xl font-bold">
                    {reports.filter((r) => r.severity === "Healthy" || r.severity === "None").length}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Needs Attention</p>
                  <p className="text-3xl font-bold">
                    {reports.filter((r) => r.severity !== "Healthy" && r.severity !== "None").length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="relative flex-1 mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide py-2">
            <TabsList className="h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground grid w-full max-w-4xl grid-cols-5">
            <TabsTrigger value="all" className="px-4 min-w-max">All</TabsTrigger>
            <TabsTrigger value="xray" className="px-4 min-w-max">Clinical X-Rays</TabsTrigger>
            <TabsTrigger value="photo" className="px-4 min-w-max">Oral Photos</TabsTrigger>
            <TabsTrigger value="gemini" className="px-4 min-w-max">AI Predictions</TabsTrigger>
            <TabsTrigger value="document" className="px-4 min-w-max">Analyzed Documents</TabsTrigger>
          </TabsList>
          </div>

          {/* Reports List */}
          {filteredReports.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileImage className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No reports found</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {searchQuery 
                    ? "Try adjusting your search"
                    : "Upload your first scan to get started"}
                </p>
                <Button onClick={() => navigate("/dashboard")}>
                  Upload Scan
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center gap-4 mb-4">
                <Checkbox 
                  id="select-all"
                  checked={selectedReports.length === filteredReports.length && filteredReports.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
                <label htmlFor="select-all" className="text-sm font-medium">
                  {selectedReports.length === filteredReports.length 
                    ? "Deselect All" 
                    : "Select All"}
                </label>
              </div>
              
              <div className="grid gap-4">
                {filteredReports.map((report) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ x: 4 }}
                  >
                    <Card className="hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-6">
                          {/* Checkbox */}
                          <div className="pt-2">
                            <Checkbox 
                              checked={selectedReports.includes(report.id)}
                              onCheckedChange={() => toggleReportSelection(report.id)}
                            />
                          </div>
                          
                          {/* Image Preview */}
                          <div className="w-32 h-32 rounded-xl bg-muted overflow-hidden flex-shrink-0 relative">
                            {report.scan_type === "document" ? (
                              <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800/50">
                                <FileText className="w-12 h-12 text-gray-400" />
                              </div>
                            ) : report.image_data ? (
                              <img
                                src={`data:image/jpeg;base64,${report.image_data}`}
                                alt={report.filename}
                                className="w-full h-full object-cover"
                              />
                            ) : (report as Report & { file_url?: string }).file_url ? (
                              <img
                                src={(report as Report & { file_url?: string }).file_url}
                                alt={report.filename}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FileImage className="w-12 h-12 text-muted-foreground" />
                              </div>
                            )}
                          </div>

                          {/* Report Details */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="font-semibold text-lg mb-1">{report.filename}</h3>
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  {report.scan_type === "xray" ? "Clinical X-Ray" : 
                                   report.scan_type === "photo" ? "Oral Photo" : 
                                   report.scan_type === "gemini" ? "AI Prediction" : 
                                   "Analyzed Document"} • {report.upload_date}
                                </p>
                              </div>
                              <Badge className={getSeverityColor(report.severity)}>
                                {report.severity}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <p className="text-sm text-muted-foreground">{getPredictionLabel(report.scan_type)}</p>
                                <p className="text-xl font-semibold">{report.ai_prediction}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Confidence</p>
                                <p className="text-xl font-semibold">{formatConfidence(report.confidence, report.scan_type)}</p>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => navigate(`/dashboard/reports/${report.id}`)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openForwardModal(report)}
                              >
                                <Stethoscope className="w-4 h-4 mr-2" />
                                Forward to Doctor
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </Tabs>
      </div>

      {/* Forward to Doctor Modal */}
      <Dialog open={forwardModalOpen} onOpenChange={setForwardModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select an Appointment to Forward Report</DialogTitle>
            <DialogDescription>
              Choose which appointment to attach this report to
            </DialogDescription>
          </DialogHeader>
          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">You have no active appointments. Book an appointment first!</p>
              <Button className="mt-4" onClick={() => navigate("/dashboard/doctors")}>
                Book an Appointment
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {appointments.map((appointment) => (
                <Card key={appointment.id} className="hover:shadow-md transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h4 className="font-semibold text-lg">{appointment.doctor_name}</h4>
                        <p className="text-sm text-muted-foreground">{appointment.clinic_name}</p>
                        <p className="text-sm text-muted-foreground">{appointment.status}</p>
                        {appointment.appointment_date && (
                          <p className="text-sm text-muted-foreground">{appointment.appointment_date}</p>
                        )}
                      </div>
                      <Button onClick={() => handleForwardReport(appointment)}>
                        Attach Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
