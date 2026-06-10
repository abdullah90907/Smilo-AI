
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDoctors, bookAppointment, getPatientReports } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { User } from "lucide-react";

export default function FindDoctors() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<number | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [pendingDoctorId, setPendingDoctorId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorsData, reportsData] = await Promise.all([getDoctors(), getPatientReports()]);
        setDoctors(doctorsData.doctors);
        setReports(reportsData.reports || []);
      } catch (e) {
        console.error("Error fetching data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const normalizeReportType = (type: string) => {
    if (!type) return '';
    return type.toLowerCase().replace(/[-_\s]/g, '');
  };

  const handleBookAppointment = async (doctorId: number) => {
    // Check for x-ray report first
    const hasXray = reports.some(r => normalizeReportType(r.scan_type || r.report_type) === 'xray');
    if (!hasXray) {
      toast.error("Required: Please complete a Clinical X-Ray Scan before booking.");
      return;
    }
    // Check if we have photo or gemini
    const hasPhoto = reports.some(r => normalizeReportType(r.scan_type || r.report_type) === 'photo');
    const hasGemini = reports.some(r => normalizeReportType(r.scan_type || r.report_type) === 'gemini');
    if (!hasPhoto || !hasGemini) {
      setPendingDoctorId(doctorId);
      setIsWarningModalOpen(true);
      return;
    }
    // Proceed to book
    await proceedToBook(doctorId);
  };

  const proceedToBook = async (doctorId: number) => {
    setBooking(doctorId);
    try {
      await bookAppointment(doctorId);
      toast.success("Consultation requested! Your latest AI scan has been attached.");
      window.dispatchEvent(new Event('dashboard-update'));
      navigate("/dashboard/appointments");
    } catch (e: any) {
      toast.error(e.message || "Failed to book appointment");
    } finally {
      setBooking(null);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Find Doctors</h1>
          <p className="text-muted-foreground mt-2">Discover top dental professionals in your area</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <Card key={doctor.id} className="hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#21b2c0] flex flex-shrink-0 items-center justify-center text-white shadow-sm">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <CardTitle>{doctor.full_name}</CardTitle>
                  <p className="text-sm text-primary">{doctor.specialization}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">Clinic:</span>
                  <span className="text-sm font-medium">{doctor.clinic_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">City:</span>
                  <span className="text-sm font-medium">{doctor.city}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">Experience:</span>
                  <span className="text-sm font-medium">{doctor.experience_years} years</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-[#21b2c0] hover:bg-[#1a95a0]"
                  disabled={booking === doctor.id}
                  onClick={() => handleBookAppointment(doctor.id)}
                >
                  {booking === doctor.id ? "Booking..." : "Book Consultation"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Warning Modal */}
      <Dialog open={isWarningModalOpen} onOpenChange={setIsWarningModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Incomplete Case Profile</DialogTitle>
            <DialogDescription>
              For the most accurate doctor review, we highly recommend adding an Oral Photo scan or AI Prediction. Would you like to add these now?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              className="bg-[#21b2c0] hover:bg-[#1a95a0]"
              onClick={() => {
                setIsWarningModalOpen(false);
                navigate("/dashboard/photo-analysis");
              }}
            >
              Add Oral Photo
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                setIsWarningModalOpen(false);
                if (pendingDoctorId) {
                  await proceedToBook(pendingDoctorId);
                }
              }}
            >
              Skip & Book Anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
