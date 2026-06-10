import { useState, useEffect, useRef } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Sun,
  Contrast,
  Image as ImageIcon,
  Download,
  Trash2,
  PenTool,
  Save,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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

export default function XrayViewer() {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingMode, setDrawingMode] = useState(true);
  const [doctorNote, setDoctorNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDoctorAppointments();
        const approved = data.appointments.filter(
          (a: Appointment) => a.status === "approved"
        );
        setAppointments(approved);
        if (approved.length > 0) {
          setSelectedAppointment(approved[0]);
        }
      } catch (e) {
        console.error("Error fetching appointments:", e);
        toast.error("Failed to load appointments");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedAppointment) {
      setDoctorNote(selectedAppointment.doctor_note || "");
    }
  }, [selectedAppointment]);

  useEffect(() => {
    if (!selectedAppointment?.xray_report?.image_data) return;
    const img = new Image();
    img.src = `data:image/jpeg;base64,${selectedAppointment.xray_report.image_data}`;
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageRef.current = img;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    };
  }, [selectedAppointment]);

  const handleSaveNote = async () => {
    if (!selectedAppointment) return;
    setSavingNote(true);
    try {
      await updateAppointmentStatus(
        selectedAppointment.id,
        selectedAppointment.status,
        selectedAppointment.appointment_date || null,
        doctorNote
      );
      setAppointments(
        appointments.map((a) =>
          a.id === selectedAppointment.id
            ? { ...a, doctor_note: doctorNote }
            : a
        )
      );
      toast.success("Note saved successfully!");
    } catch (e) {
      console.error("Error saving note:", e);
      toast.error("Failed to save note");
    } finally {
      setSavingNote(false);
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!drawingMode || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    let x: number;
    let y: number;
    if ("touches" in e) {
      e.preventDefault();
      const touch = e.touches[0];
      x = (touch.clientX - rect.left) * scaleX;
      y = (touch.clientY - rect.top) * scaleY;
    } else {
      x = (e.clientX - rect.left) * scaleX;
      y = (e.clientY - rect.top) * scaleY;
    }
    setIsDrawing(true);
    lastPositionRef.current = { x, y };
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawingMode || !canvasRef.current || !lastPositionRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    let x: number;
    let y: number;
    if ("touches" in e) {
      e.preventDefault();
      const touch = e.touches[0];
      x = (touch.clientX - rect.left) * scaleX;
      y = (touch.clientY - rect.top) * scaleY;
    } else {
      x = (e.clientX - rect.left) * scaleX;
      y = (e.clientY - rect.top) * scaleY;
    }
    ctx.beginPath();
    ctx.strokeStyle = "#00ff00"; // Neon green
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.moveTo(lastPositionRef.current.x, lastPositionRef.current.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    lastPositionRef.current = { x, y };
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPositionRef.current = null;
  };

  const clearAnnotations = () => {
    if (!canvasRef.current || !imageRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(imageRef.current, 0, 0);
  };

  const downloadAnnotatedImage = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "annotated-xray.png";
    link.href = dataUrl;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No approved appointments yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">X-ray Viewer</h1>
              <p className="text-sm text-muted-foreground">
                View X-rays for approved consultations
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* X-ray List Sidebar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {appointments.map((appt) => (
                    <div
                      key={appt.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedAppointment?.id === appt.id
                          ? "border-[#21b2c0] bg-[#21b2c0]/5"
                          : "border-border hover:border-[#21b2c0]/50"
                      }`}
                      onClick={() => {
                        setSelectedAppointment(appt);
                      }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{appt.patient_name}</p>
                          <p className="text-xs text-muted-foreground">#{appt.patient_id}</p>
                        </div>
                      </div>
                      {appt.has_new_uploads && (
                        <Badge className="bg-orange-500 text-white hover:bg-orange-600">
                          New Scans Added
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Main Viewer */}
          {selectedAppointment && (
            <div className="lg:col-span-3 space-y-6">
              {/* Controls */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center gap-4">
                    {/* Drawing Tools */}
                    <div className="flex items-center gap-2">
                      <Label className="text-sm whitespace-nowrap">Tools:</Label>
                      <Button
                        variant={drawingMode ? "default" : "outline"}
                        className={`${drawingMode ? "bg-[#21b2c0] hover:bg-[#1a95a0]" : ""}`}
                        size="sm"
                        onClick={() => setDrawingMode(true)}
                      >
                        <PenTool className="w-4 h-4 mr-1" />
                        Draw
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAnnotations}
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Clear Annotations
                      </Button>
                      <Button
                        className="bg-[#21b2c0] hover:bg-[#1a95a0]"
                        size="sm"
                        onClick={downloadAnnotatedImage}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Save / Download Image
                      </Button>
                    </div>

                    {/* Zoom & Rotate */}
                    <div className="flex items-center gap-2">
                      <Label className="text-sm whitespace-nowrap">Zoom:</Label>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setZoom(Math.max(50, zoom - 10))}
                      >
                        <ZoomOut className="w-4 h-4" />
                      </Button>
                      <span className="text-sm font-medium w-12 text-center">{zoom}%</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setZoom(Math.min(200, zoom + 10))}
                      >
                        <ZoomIn className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Label className="text-sm whitespace-nowrap">Rotate:</Label>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setRotation(rotation - 90)}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                      <span className="text-sm font-medium w-12 text-center">
                        {rotation % 360}°
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setRotation(rotation + 90)}
                      >
                        <RotateCw className="w-4 h-4" />
                      </Button>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => {
                        setZoom(100);
                        setRotation(0);
                        setBrightness(100);
                        setContrast(100);
                      }}
                    >
                      Reset All
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm flex items-center gap-2">
                          <Sun className="w-4 h-4" />
                          Brightness
                        </Label>
                        <span className="text-sm font-medium">{brightness}%</span>
                      </div>
                      <Slider
                        value={[brightness]}
                        onValueChange={(val) => setBrightness(val[0])}
                        min={50}
                        max={150}
                        step={5}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm flex items-center gap-2">
                          <Contrast className="w-4 h-4" />
                          Contrast
                        </Label>
                        <span className="text-sm font-medium">{contrast}%</span>
                      </div>
                      <Slider
                        value={[contrast]}
                        onValueChange={(val) => setContrast(val[0])}
                        min={50}
                        max={150}
                        step={5}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* X-ray Display */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div
                    className="relative bg-black rounded-xl overflow-hidden flex items-center justify-center"
                    style={{
                      maxWidth: "100%",
                    }}
                  >
                    {selectedAppointment.xray_report?.image_data ? (
                      <canvas
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="cursor-crosshair"
                        style={{
                          transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                          filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                          maxWidth: "100%",
                          height: "auto",
                        }}
                      />
                    ) : (
                      <div className="text-white text-center p-8">
                        <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No X-ray available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Doctor Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Doctor Notes (Only Visible to You)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Add your notes about this patient's X-ray..."
                    value={doctorNote}
                    onChange={(e) => setDoctorNote(e.target.value)}
                    className="min-h-[150px] resize-none"
                  />
                  <div className="flex justify-end">
                    <Button
                      className="bg-[#21b2c0] hover:bg-[#1a95a0]"
                      onClick={handleSaveNote}
                      disabled={savingNote}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {savingNote ? "Saving..." : "Save Note"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
