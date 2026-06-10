
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPatientAppointments, cancelAppointment } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Clock } from "lucide-react";
import { toast } from "sonner";

export default function PatientAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState<number | null>(null);
  const [hiddenAppointments, setHiddenAppointments] = useState<Set<number>>(() => {
    const saved = localStorage.getItem('hiddenPatientAppointments');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const toggleHideAppointment = (appointmentId: number) => {
    const newHidden = new Set(hiddenAppointments);
    if (newHidden.has(appointmentId)) {
      newHidden.delete(appointmentId);
    } else {
      newHidden.add(appointmentId);
    }
    setHiddenAppointments(newHidden);
    localStorage.setItem('hiddenPatientAppointments', JSON.stringify(Array.from(newHidden)));
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await getPatientAppointments();
      console.log("Appointment Component received:", data);
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
      localStorage.setItem('hiddenPatientAppointments', JSON.stringify(cleanedHiddenIds));
    }
  }, [appointments]);

  const handleCancelAppointment = async (appointmentId: number) => {
    setCanceling(appointmentId);
    try {
      await cancelAppointment(appointmentId);
      toast.success("Appointment canceled successfully");
      await fetchAppointments();
    } catch (e: any) {
      toast.error(e.message || "Failed to cancel appointment");
    } finally {
      setCanceling(null);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Declined</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-10 text-center">
          <h1 className="text-3xl font-bold mb-4">My Appointments</h1>
          <p className="text-muted-foreground">Loading your appointments...</p>
        </div>
      </div>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-8 space-y-8">
          <div>
            <h1 className="text-3xl font-bold">My Appointments</h1>
            <p className="text-muted-foreground mt-2">View and manage your consultation requests</p>
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
          <h1 className="text-3xl font-bold">My Appointments</h1>
          <p className="text-muted-foreground mt-2">View and manage your consultation requests</p>
        </div>
        {visibleAppointments.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No visible appointments found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleAppointments.map((appointment, index) => (
              <Card key={appointment.id || index} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-muted-foreground" />
                      <CardTitle className="text-lg">{appointment.doctor_name}</CardTitle>
                    </div>
                    {getStatusBadge(appointment.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{appointment.clinic_name}</span>
                  </div>
                  {appointment.status === "approved" && appointment.appointment_date && (
                    <div className="flex items-center gap-2 bg-[#21b2c0]/10 p-3 rounded-lg border border-[#21b2c0]/20">
                      <Clock className="w-4 h-4 text-[#21b2c0]" />
                      <span className="text-sm font-medium text-[#21b2c0]">
                        📅 Scheduled Consultation: {formatDate(appointment.appointment_date)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Requested: {appointment.created_at}</span>
                  </div>
                  {(appointment.status === "rejected" || appointment.status === "cancelled" || appointment.status === "closed" || appointment.status === "completed") && (
                    <Button
                      variant="outline"
                      className="w-full mt-2 text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-700"
                      onClick={() => toggleHideAppointment(appointment.id)}
                    >
                      Remove/Clear
                    </Button>
                  )}
                  {appointment.doctor_note && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm italic text-amber-800">
                        <span className="font-semibold">Note from doctor:</span> {appointment.doctor_note}
                      </p>
                    </div>
                  )}
                  {appointment.status === "pending" && (
                    <Button
                      variant="outline"
                      className="w-full mt-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      disabled={canceling === appointment.id}
                      onClick={() => handleCancelAppointment(appointment.id)}
                    >
                      {canceling === appointment.id ? "Canceling..." : "Cancel / Remove Request"}
                    </Button>
                  )}
                  {appointment.status === "approved" && (
                    <div className="mt-2 space-y-2">
                      <Button
                        className="w-full bg-[#21b2c0] hover:bg-[#1a95a0]"
                        onClick={() => navigate(`/dashboard/consultation/${appointment.id}`)}
                      >
                        Enter Consultation
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                        disabled={canceling === appointment.id}
                        onClick={() => handleCancelAppointment(appointment.id)}
                      >
                        {canceling === appointment.id ? "Canceling..." : "Cancel Appointment"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
