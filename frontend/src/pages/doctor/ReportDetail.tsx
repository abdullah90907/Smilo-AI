import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDoctorAppointments, updateAppointmentStatus } from "@/lib/api";
import { getSpecialistRecommendation } from "@/lib/utils";

// Function to format confidence safely
const formatConfidence = (confidence: string | number | null) => {
  if (!confidence) return "N/A";
  
  let numConfidence: number;
  if (typeof confidence === 'string') {
    const cleaned = confidence.replace('%', '').trim();
    numConfidence = parseFloat(cleaned);
  } else {
    numConfidence = confidence;
  }
  
  if (isNaN(numConfidence)) return "N/A";
  
  if (numConfidence > 1) {
    return `${numConfidence.toFixed(1)}%`;
  }
  return `${(numConfidence * 100).toFixed(1)}%`;
};

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
};

export default function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctorNote, setDoctorNote] = useState("");
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("xray");
  const [scheduledDate, setScheduledDate] = useState("");

  useEffect(() => {
    if (appointment) {
      if (appointment.xray_report) setActiveTab("xray");
      else if (appointment.photo_report) setActiveTab("photo");
      else if (appointment.gemini_report) setActiveTab("gemini");
    }
  }, [appointment]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const data = await getDoctorAppointments();
        const found = data.appointments.find((a: any) => a.id === parseInt(id));
        if (found) {
          setAppointment(found);
          if (found.doctor_note) {
            setDoctorNote(found.doctor_note);
          }
        }
      } catch (e) {
        console.error("Error fetching appointment:", e);
        toast.error("Failed to load appointment");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleApprove = async () => {
    if (!id) return;
    setUpdating(true);
    try {
      const appointmentDate = scheduledDate ? new Date(scheduledDate).toISOString() : null;
      await updateAppointmentStatus(parseInt(id), 'approved', appointmentDate, doctorNote || null);
      window.dispatchEvent(new Event('dashboard-update'));
      toast.success("Appointment approved successfully");
      navigate('/doctor-dashboard/reports');
    } catch (e) {
      console.error("Error approving appointment:", e);
      toast.error("Failed to approve appointment");
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async () => {
    if (!id) return;
    setUpdating(true);
    try {
      await updateAppointmentStatus(parseInt(id), 'rejected', null, doctorNote || null);
      window.dispatchEvent(new Event('dashboard-update'));
      toast.success("Appointment rejected");
      navigate('/doctor-dashboard/reports');
    } catch (e) {
      console.error("Error rejecting appointment:", e);
      toast.error("Failed to reject appointment");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Appointment not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/doctor-dashboard/reports")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Patient Case Review</h1>
                <p className="text-sm text-muted-foreground">
                  {appointment.patient_name} • {appointment.patient_age}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-8 space-y-6">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            {appointment.xray_report && <TabsTrigger value="xray">Clinical X-Ray</TabsTrigger>}
            {appointment.photo_report && <TabsTrigger value="photo">Oral Photo</TabsTrigger>}
            {appointment.gemini_report && <TabsTrigger value="gemini">AI Model Vision</TabsTrigger>}
          </TabsList>

          {appointment.xray_report && (
            <TabsContent value="xray" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">X-ray Analysis</CardTitle>
                  <CardDescription>Primary diagnostic image</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {appointment.xray_report.image_data && (
                    <>
                      <div className="relative rounded-xl overflow-hidden bg-muted mx-auto max-w-3xl">
                        <img
                          src={`data:image/jpeg;base64,${appointment.xray_report.image_data}`}
                          alt="X-ray"
                          className="w-full h-auto max-h-[500px] object-contain rounded-xl shadow-sm border border-gray-100 bg-gray-50"
                        />
                      </div>
                      {(() => {
                        const parsedData = appointment.xray_report.result_json ? JSON.parse(appointment.xray_report.result_json) : {};
                        if (parsedData.caries_detection_url || parsedData.overlay_url) {
                          return (
                            <div className="relative rounded-xl overflow-hidden bg-muted mx-auto max-w-3xl">
                              <div className="text-sm text-muted-foreground mb-2">AI Detection Overlay</div>
                              <img
                                src={parsedData.caries_detection_url || parsedData.overlay_url}
                                alt="AI Detection"
                                className="w-full h-auto max-h-[500px] object-contain rounded-xl shadow-sm border border-gray-100 bg-gray-50"
                              />
                            </div>
                          );
                        }
                        return null;
                      })()}
                      {(() => {
                        const parsedData = appointment.xray_report.result_json ? JSON.parse(appointment.xray_report.result_json) : {};
                        if (parsedData.findings) {
                          return (
                            <div className="mt-4 p-4 rounded-lg bg-muted/50 border">
                              <p className="font-semibold mb-1">Recommendation</p>
                              <p className="text-muted-foreground">{getSpecialistRecommendation(parsedData.findings || [])}</p>
                            </div>
                          )
                        }
                        return null;
                      })()}
                    </>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground mb-1">AI Prediction</p>
                      <p className="font-semibold text-lg">{appointment.xray_report.ai_prediction}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground mb-1">Confidence</p>
                      <p className="font-semibold text-lg">{formatConfidence(appointment.xray_report.confidence)}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground mb-1">Severity</p>
                      <Badge className="mt-1">{appointment.xray_report.severity}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {appointment.photo_report && (
            <TabsContent value="photo" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Oral Photo Analysis</CardTitle>
                  <CardDescription>Secondary visual data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {appointment.photo_report.image_data && (
                    <>
                      <div className="relative rounded-xl overflow-hidden bg-muted mx-auto max-w-3xl">
                        <img
                          src={`data:image/jpeg;base64,${appointment.photo_report.image_data}`}
                          alt="Oral Photo"
                          className="w-full h-auto max-h-[500px] object-contain rounded-xl shadow-sm border border-gray-100 bg-gray-50"
                        />
                      </div>
                      {(() => {
                        const parsedData = appointment.photo_report.result_json ? JSON.parse(appointment.photo_report.result_json) : {};
                        if (parsedData.detection_url) {
                          return (
                            <div className="relative rounded-xl overflow-hidden bg-muted mx-auto max-w-3xl">
                              <div className="text-sm text-muted-foreground mb-2">YOLO Detection Output</div>
                              <img
                                src={parsedData.detection_url}
                                alt="YOLO Detection"
                                className="w-full h-auto max-h-[500px] object-contain rounded-xl shadow-sm border border-gray-100 bg-gray-50"
                              />
                            </div>
                          );
                        }
                        return null;
                      })()}
                      {(() => {
                        const parsedData = appointment.photo_report.result_json ? JSON.parse(appointment.photo_report.result_json) : {};
                        if (parsedData.findings && Array.isArray(parsedData.findings)) {
                          return (
                            <div className="space-y-3">
                              <div className="text-sm font-medium text-muted-foreground">Findings</div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {parsedData.findings.map((finding: any, idx: number) => (
                                  <Card key={idx} className="p-4">
                                    <div className="font-semibold">{finding.class || "Finding"}</div>
                                    {finding.confidence !== undefined && (
                                      <div className="text-sm text-muted-foreground">
                                        Confidence: {typeof finding.confidence === 'number' ? `${(finding.confidence * 100).toFixed(1)}%` : finding.confidence}
                                      </div>
                                    )}
                                  </Card>
                                ))}
                              </div>
                              <div className="mt-4 p-4 rounded-lg bg-muted/50 border">
                                <p className="font-semibold mb-1">Recommendation</p>
                                <p className="text-muted-foreground">{getSpecialistRecommendation(parsedData.findings || [])}</p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground mb-1">AI Prediction</p>
                      <p className="font-semibold text-lg">{appointment.photo_report.ai_prediction}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground mb-1">Confidence</p>
                      <p className="font-semibold text-lg">{formatConfidence(appointment.photo_report.confidence)}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground mb-1">Severity</p>
                      <Badge className="mt-1">{appointment.photo_report.severity}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {appointment.gemini_report && (
            <TabsContent value="gemini" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">AI Hygiene Assessment</CardTitle>
                  <CardDescription>Gemini analysis data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {appointment.gemini_report.image_data && (
                    <div className="relative rounded-xl overflow-hidden bg-muted mx-auto max-w-md">
                      <img
                        src={`data:image/jpeg;base64,${appointment.gemini_report.image_data}`}
                        alt="Original Photo"
                        className="w-full h-auto max-h-[500px] object-contain rounded-xl shadow-sm border border-gray-100 bg-gray-50"
                      />
                    </div>
                  )}
                  {(() => {
                    const parsedData = appointment.gemini_report.result_json ? JSON.parse(appointment.gemini_report.result_json) : {};
                    return (
                      <>
                        {parsedData.summary && (
                          <div className="p-4 rounded-lg bg-[#21b2c0]/10 border border-[#21b2c0]/20">
                            <p className="font-semibold text-[#21b2c0] mb-2">Summary</p>
                            <p className="text-muted-foreground">{parsedData.summary}</p>
                          </div>
                        )}
                        {parsedData.recommendations && (
                          <div className="p-4 rounded-lg bg-muted/50">
                            <p className="font-semibold mb-2">Recommendations</p>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                              {Array.isArray(parsedData.recommendations) ? (
                                parsedData.recommendations.map((rec: string, idx: number) => (
                                  <li key={idx}>{rec}</li>
                                ))
                              ) : (
                                <li>{parsedData.recommendations}</li>
                              )}
                            </ul>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Doctor's Review Section - always visible at bottom */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Your Professional Review</CardTitle>
            <CardDescription>Add your diagnosis and notes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Doctor Note */}
            <div className="space-y-3">
              <Label>Doctor Note (for patient)</Label>
              <Textarea
                placeholder="Enter your note for the patient about this case..."
                className="min-h-32"
                value={doctorNote}
                onChange={(e) => setDoctorNote(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label>Schedule Consultation (Optional)</Label>
              <input
                type="datetime-local"
                className="w-full border border-gray-300 rounded-md p-2"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex flex-wrap gap-3 justify-end">
              <Button variant="outline" onClick={handleReject} disabled={updating}>
                {updating ? "Rejecting..." : "Reject Case"}
              </Button>
              <Button className="bg-[#21b2c0] hover:bg-[#1a95a0]" onClick={handleApprove} disabled={updating}>
                <Save className="w-4 h-4 mr-2" />
                {updating ? "Approving..." : "Approve Case"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
