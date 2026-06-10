import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FileText,
  Brain,
  AlertCircle,
  Clock,
  Search,
  Filter,
  ChevronRight,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getDoctorAppointments, updateAppointmentStatus } from "@/lib/api";
import { toast } from "sonner";

type AttachedReport = {
  id?: number;
  ai_prediction: string;
  severity: string;
  confidence: string;
  image_data?: string;
  result_json?: any;
  report_type?: string;
};

type Appointment = {
  id: number;
  patient_id: number;
  patient_name: string;
  patient_age: string;
  status: string;
  appointment_date?: string;
  created_at: string;
  xray_report?: AttachedReport;
  photo_report?: AttachedReport;
  gemini_report?: AttachedReport;
  doctor_note?: string;
  has_new_uploads?: boolean;
};

export default function PatientReports() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDoctorAppointments();
        setAppointments(data.appointments);
      } catch (e) {
        console.error("Error fetching appointments:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCloseCase = async (appointmentId: number) => {
    setUpdating(appointmentId);
    try {
      await updateAppointmentStatus(appointmentId, "closed");
      toast.success("Case closed successfully!");
      const data = await getDoctorAppointments();
      setAppointments(data.appointments);
    } catch (e: any) {
      toast.error(e.message || "Failed to close case");
    } finally {
      setUpdating(null);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Severe":
        return "destructive";
      case "Moderate":
        return "default";
      case "Mild":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "approved":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "rejected":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "closed":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "cancelled":
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
      default:
        return "";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const pendingAppointments = appointments.filter(a => a.status === "pending");
  const approvedAppointments = appointments.filter(a => a.status === "approved");
  const closedAppointments = appointments.filter(a => a.status === "closed");

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Patient Reports</h1>
              <p className="text-sm text-muted-foreground">
                Review and validate AI-analyzed reports
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search by Patient ID..." className="pl-9 w-64" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-8">
        <Tabs defaultValue="pending" className="space-y-6">
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide py-2">
            <TabsList className="flex gap-2">
              <TabsTrigger value="pending" className="relative px-4 min-w-max">
                Pending Review
                <Badge className="ml-2 h-5 min-w-[20px]" variant="destructive">
                  {pendingAppointments.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="reviewed" className="px-4 min-w-max">Complete Review</TabsTrigger>
              <TabsTrigger value="all" className="px-4 min-w-max">All Cases</TabsTrigger>
            </TabsList>
          </div>

          {/* Pending Reports Tab */}
          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Reports ({pendingAppointments.length})</CardTitle>
                <CardDescription>
                  These reports require your professional review and validation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient Name</TableHead>
                      <TableHead>Patient ID</TableHead>
                      <TableHead>Request Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingAppointments.map((appointment) => (
                      <TableRow
                        key={appointment.id}
                        className="cursor-pointer hover:bg-muted/50"
                      >
                        <TableCell className="font-medium">
                          {appointment.patient_name}
                          {appointment.has_new_uploads && (
                            <Badge className="ml-2 bg-orange-500 text-white hover:bg-orange-600">
                              New Scans Added
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{appointment.patient_id}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(appointment.created_at)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(appointment.status)} variant="outline">
                            Pending Review
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => navigate(`/doctor-dashboard/reports/${appointment.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Review Case
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Complete Review Tab */}
          <TabsContent value="reviewed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Complete Review ({approvedAppointments.length})</CardTitle>
                <CardDescription>
                  Approved cases ready for closure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient Name</TableHead>
                      <TableHead>Patient ID</TableHead>
                      <TableHead>Request Date</TableHead>
                      <TableHead>Doctor Note</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvedAppointments.map((appointment) => (
                      <TableRow
                        key={appointment.id}
                        className="cursor-pointer hover:bg-muted/50"
                      >
                        <TableCell className="font-medium">
                          {appointment.patient_name}
                          {appointment.has_new_uploads && (
                            <Badge className="ml-2 bg-orange-500 text-white hover:bg-orange-600">
                              New Scans Added
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{appointment.patient_id}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(appointment.created_at)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {appointment.doctor_note ? (
                            <span className="italic text-muted-foreground">{appointment.doctor_note}</span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(appointment.status)} variant="outline">
                            Approved
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right flex gap-2 justify-end">
                          <Button
                            size="sm"
                            onClick={() => navigate(`/doctor-dashboard/reports/${appointment.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={updating === appointment.id}
                            onClick={() => handleCloseCase(appointment.id)}
                          >
                            {updating === appointment.id ? "Closing..." : "Close Case"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Cases Tab */}
          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Cases ({closedAppointments.length})</CardTitle>
                <CardDescription>Closed and completed cases</CardDescription>
              </CardHeader>
              <CardContent>
                {closedAppointments.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No closed cases yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient Name</TableHead>
                        <TableHead>Patient ID</TableHead>
                        <TableHead>Request Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {closedAppointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell className="font-medium">
                          {appointment.patient_name}
                          {appointment.has_new_uploads && (
                            <Badge className="ml-2 bg-orange-500 text-white hover:bg-orange-600">
                              New Scans Added
                            </Badge>
                          )}
                        </TableCell>
                          <TableCell className="text-sm">{appointment.patient_id}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(appointment.created_at)}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(appointment.status)} variant="outline">
                              Closed
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
