import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDoctorAppointments, updateAppointmentStatus, cancelAppointment } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, FileText, Calendar, Clock, Eye } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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
  patient_name: string;
  patient_age: string;
  status: string;
  appointment_date?: string;
  created_at: string;
  xray_report?: AttachedReport;
  photo_report?: AttachedReport;
  gemini_report?: AttachedReport;
  doctor_note?: string;
};

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [doctorNote, setDoctorNote] = useState<string>("");
  const [showRejectDialog, setShowRejectDialog] = useState<number | null>(null);
  const [rejectNote, setRejectNote] = useState<string>("");
  const [hiddenAppointments, setHiddenAppointments] = useState<Set<number>>(() => {
    const saved = localStorage.getItem('hiddenDoctorAppointments');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const navigate = useNavigate();

  const toggleHideAppointment = (appointmentId: number) => {
    const newHidden = new Set(hiddenAppointments);
    if (newHidden.has(appointmentId)) {
      newHidden.delete(appointmentId);
    } else {
      newHidden.add(appointmentId);
    }
    setHiddenAppointments(newHidden);
    localStorage.setItem('hiddenDoctorAppointments', JSON.stringify(Array.from(newHidden)));
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await getDoctorAppointments();
      console.log("Doctor Appointments Component received:", data);
      setAppointments(data.appointments || []);
    } catch (e) {
      console.error("Error fetching appointments:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    
    const handleDashboardUpdate = () => {
      fetchAppointments();
    };
    
    window.addEventListener('dashboard-update', handleDashboardUpdate);
    return () => {
      window.removeEventListener('dashboard-update', handleDashboardUpdate);
    };
  }, []);

  // Clean up hiddenAppointments: only keep terminal statuses
  useEffect(() => {
    if (appointments.length > 0) {
      const terminalStatuses = ['rejected', 'cancelled', 'completed', 'closed'];
      const cleanedHiddenIds = Array.from(hiddenAppointments).filter(id => {
        const appointment = appointments.find(a => a.id === id);
        return appointment && terminalStatuses.includes(appointment.status);
      });
      const cleanedHiddenSet = new Set(cleanedHiddenIds);
      setHiddenAppointments(cleanedHiddenSet);
      localStorage.setItem('hiddenDoctorAppointments', JSON.stringify(cleanedHiddenIds));
    }
  }, [appointments]);

  const handleUpdateStatus = async (appointmentId: number, status: string, appointmentDate: string | null = null, doctorNote: string | null = null) => {
    setUpdating(appointmentId);
    try {
      await updateAppointmentStatus(appointmentId, status, appointmentDate, doctorNote);
      window.dispatchEvent(new Event('dashboard-update'));
      toast.success(`Appointment ${status} successfully`);
      await fetchAppointments();
      setShowDatePicker(null);
      setShowRejectDialog(null);
      setRejectNote("");
      setDoctorNote("");
    } catch (e: any) {
      toast.error(e.message || "Failed to update appointment status");
    } finally {
      setUpdating(null);
    }
  };

  const handleCancelAppointment = async (appointmentId: number) => {
    setUpdating(appointmentId);
    try {
      await cancelAppointment(appointmentId);
      toast.success("Appointment cancelled successfully");
      await fetchAppointments();
    } catch (e: any) {
      toast.error(e.message || "Failed to cancel appointment");
    } finally {
      setUpdating(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Rejected</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not scheduled";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
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



  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-10 text-center">
          <h1 className="text-3xl font-bold mb-4">Patient Appointments</h1>
          <p className="text-muted-foreground">Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-8 space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Patient Appointments</h1>
            <p className="text-muted-foreground mt-2">Review and manage consultation requests</p>
          </div>
          <div className="p-10 text-center text-gray-500">
            No appointments found.
          </div>
        </div>
      </div>
    );
  }

  const visibleAppointments = appointments.filter(a => !hiddenAppointments.has(a.id));

  return (
    <div className="min-h-screen bg-background">
      <div className="p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Patient Appointments</h1>
          <p className="text-muted-foreground mt-2">Review and manage consultation requests</p>
        </div>
        {visibleAppointments.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No visible appointments found.
          </div>
        ) : (
          <div className="space-y-4">
            {visibleAppointments.map((appointment) => (
              <Card key={appointment.id} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{appointment.patient_name}</CardTitle>
                      <CardDescription>
                        Age: {appointment.patient_age} • Created: {formatDate(appointment.created_at)}
                        {appointment.appointment_date && (
                          <> • Scheduled: {formatDate(appointment.appointment_date)}</>
                        )}
                      </CardDescription>
                    </div>
                    {getStatusBadge(appointment.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-2 bg-muted/50 p-4 rounded-lg">
                    <FileText className="w-5 h-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">Attached AI Reports</p>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate("/doctor-dashboard/reports")}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Attached Reports
                      </Button>
                    </div>
                      <div className="flex flex-wrap gap-2">
                        {appointment.xray_report && (
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">X-ray</Badge>
                        )}
                        {appointment.photo_report && (
                          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Photo</Badge>
                        )}
                        {appointment.gemini_report && (
                          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">Gemini</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {appointment.doctor_note && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm italic text-amber-800">
                        <span className="font-semibold">Note:</span> {appointment.doctor_note}
                      </p>
                    </div>
                  )}
                  {appointment.status === "pending" && (
                    <div className="space-y-4">
                      {showDatePicker === appointment.id ? (
                        <div className="space-y-4 p-4 border border-border rounded-lg">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <Calendar className="w-5 h-5 text-primary" />
                              <input
                                type="datetime-local"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="flex-1 px-3 py-2 border border-border rounded-md bg-background"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Doctor Note (for patient)</Label>
                              <Textarea
                                placeholder="Enter your note for the patient about this case..."
                                className="min-h-32"
                                value={doctorNote}
                                onChange={(e) => setDoctorNote(e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <Button
                              className="bg-[#21b2c0] hover:bg-[#1a95a0]"
                              disabled={!selectedDate || updating === appointment.id}
                              onClick={() => handleUpdateStatus(appointment.id, "approved", selectedDate, doctorNote || null)}
                            >
                              {updating === appointment.id ? "Approving..." : "Confirm & Approve"}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setShowDatePicker(null);
                                setSelectedDate("");
                                setDoctorNote("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-3">
                          <Button
                            className="bg-[#21b2c0] hover:bg-[#1a95a0]"
                            disabled={updating === appointment.id}
                            onClick={() => {
                              setShowDatePicker(appointment.id);
                              const date = new Date();
                              date.setDate(date.getDate() + 1);
                              date.setMinutes(0);
                              const localISOString = new Date(
                                date.getTime() - date.getTimezoneOffset() * 60000
                              ).toISOString().slice(0, 16);
                              setSelectedDate(localISOString);
                              setDoctorNote("");
                            }}
                          >
                            {updating === appointment.id ? "Updating..." : "Approve"}
                          </Button>
                          <Button
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                            disabled={updating === appointment.id}
                            onClick={() => {
                              setShowRejectDialog(appointment.id);
                              setRejectNote("");
                            }}
                          >
                            {updating === appointment.id ? "Updating..." : "Reject"}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                  {appointment.status === "approved" && (
                    <div className="space-y-2">
                      <Button
                        className="w-full bg-[#21b2c0] hover:bg-[#1a95a0]"
                        onClick={() => navigate(`/doctor-dashboard/consultations/${appointment.id}`)}
                      >
                        Enter Consultation
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                        disabled={updating === appointment.id}
                        onClick={() => handleCancelAppointment(appointment.id)}
                      >
                        {updating === appointment.id ? "Canceling..." : "Cancel Appointment"}
                      </Button>
                    </div>
                  )}
                  {(appointment.status === "rejected" || appointment.status === "cancelled" || appointment.status === "closed" || appointment.status === "completed") && (
                    <Button
                      variant="outline"
                      className="w-full text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-700"
                      onClick={() => toggleHideAppointment(appointment.id)}
                    >
                      Remove/Clear
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Reject Note Dialog */}
      <Dialog 
        open={showRejectDialog !== null} 
        onOpenChange={(open) => {
          if (!open) {
            setShowRejectDialog(null);
            setRejectNote("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Appointment</DialogTitle>
            <DialogDescription>
              Please provide a note for the patient explaining why the appointment is being rejected.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter your note here..."
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            className="min-h-[120px]"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(null);
                setRejectNote("");
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              disabled={updating === showRejectDialog}
              onClick={() => {
                if (showRejectDialog !== null) {
                  handleUpdateStatus(showRejectDialog, "rejected", null, rejectNote || null);
                }
              }}
            >
              {updating === showRejectDialog ? "Rejecting..." : "Reject Appointment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
