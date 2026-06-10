import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { analyzePhoto, analyzePhotoGemini, getDoctors, bookAppointment } from "../../lib/api";
import { useState, useRef, useEffect } from "react";
import { useXrayData } from "@/hooks/useXrayData";
import { triggerRefreshReportsCount } from "@/components/ui/UserSidebar";
import {
  Upload,
  ArrowRight,
  Loader2,
  FileImage,
  MessageSquare,
  Sparkles,
  Scan,
  Stethoscope,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { getSpecialistRecommendation } from "@/lib/utils";

type Finding = {
  box: [number, number, number, number];
  confidence: number;
  class: string;
};

type DentalFinding = {
  issue: string;
  detected: boolean;
  confidence?: number;
  severity: string;
  description?: string;
  prevention?: string[];
  suggested_care?: string[];
};

export default function PhotoAnalysis() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const yoloCanvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTab, setActiveTab] = useState("gemini");
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await getDoctors();
        setDoctors(data.doctors);
      } catch (e) {
        console.error("Error fetching doctors:", e);
      }
    };
    fetchDoctors();
  }, []);

  const handleForwardToDoctor = async (doctorId: number) => {
    setIsBooking(true);
    try {
      await bookAppointment(doctorId);
      toast.success("Report forwarded and appointment request sent successfully!");
      setIsModalOpen(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to forward report");
    } finally {
      setIsBooking(false);
    }
  };

  // YOLO-specific state
  const [imageYolo, setImageYolo] = useState<string | null>(null);
  const [resultsYolo, setResultsYolo] = useState<any>(null);
  const [loadingYolo, setLoadingYolo] = useState(false);

  // Gemini-specific state
  const [imageGemini, setImageGemini] = useState<string | null>(null);
  const [resultsGemini, setResultsGemini] = useState<any>(null);
  const [loadingGemini, setLoadingGemini] = useState(false);

  const { addReport } = useXrayData();

  // Helper to draw on YOLO canvas
  useEffect(() => {
    if (!yoloCanvasRef.current || !imageYolo) return;

    const canvas = yoloCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = imageYolo;
    img.onload = () => {
      // Set canvas dimensions to match image display
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = (rect.width * img.naturalHeight) / img.naturalWidth;

      // Clear and draw background image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw bounding boxes if we have results
      if (resultsYolo && resultsYolo.findings) {
        resultsYolo.findings.forEach((finding: Finding, index: number) => {
          const [x1, y1, x2, y2] = finding.box;
          const scaleX = canvas.width / img.naturalWidth;
          const scaleY = canvas.height / img.naturalHeight;

          const sx1 = x1 * scaleX;
          const sy1 = y1 * scaleY;
          const sx2 = x2 * scaleX;
          const sy2 = y2 * scaleY;

          // Draw red border
          ctx.strokeStyle = "#ef4444";
          ctx.lineWidth = 4;
          ctx.strokeRect(sx1, sy1, sx2 - sx1, sy2 - sy1);

          // Get label text
          const className = finding.class || "Finding";
          const confidencePercent = Math.round((finding.confidence || 0) * 100);
          const labelText = `${className} ${confidencePercent}%`;
          
          // Calculate label width
          ctx.font = "16px Arial";
          const labelWidth = ctx.measureText(labelText).width + 20;

          // Draw label background
          ctx.fillStyle = "#ef4444";
          ctx.fillRect(sx1, sy1 - 30, labelWidth, 30);
          ctx.fillStyle = "white";
          ctx.font = "16px Arial";
          ctx.fillText(labelText, sx1 + 10, sy1 - 8);
        });
      }
    };

    // Also redraw on window resize
    const handleResize = () => img.onload?.({} as Event);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [imageYolo, resultsYolo]);

  // Helper functions
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    const imageUrl = await new Promise<string>((resolve) => {
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    if (activeTab === "yolo") {
      setImageYolo(imageUrl);
      setLoadingYolo(true);
      try {
        const result = await analyzePhoto(file);
        setResultsYolo(result);
        const report: any = {
          ...result,
          id: `photo-report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          imageUrl,
          original_image: result.original_image_url,
          segmented_image: result.detection_url,
          models_used: { segmentation: false, caries_detection: true },
        };
        addReport(report);
        triggerRefreshReportsCount();
      } catch (error) {
        console.error("YOLO analysis error:", error);
        alert("❌ Error: Could not connect to Smilo Backend. Is the backend running on port 8000?");
      } finally {
        setLoadingYolo(false);
      }
    } else {
      setImageGemini(imageUrl);
      setLoadingGemini(true);
      try {
        const result = await analyzePhotoGemini(file);
        triggerRefreshReportsCount();
        navigate(`/dashboard/reports/${result.report_id}`);
      } catch (error) {
        console.error("Gemini analysis error:", error);
        alert("❌ Error: Could not connect to Smilo Backend. Is the backend running on port 8000?");
      } finally {
        setLoadingGemini(false);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "excellent":
      case "good":
        return "bg-green-500";
      case "fair":
      case "mild":
        return "bg-yellow-500";
      case "moderate":
        return "bg-orange-500";
      case "severe":
      case "poor":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleForwardToChat = (from: "GEMINI_SCAN" | "YOLO_SCAN", data: any) => {
    navigate("/dashboard/assistant", { state: { contextSource: from, data } });
  };

  return (
    <div className="min-h-screen p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Oral Photo Scanner</h1>
        <Button variant="ghost" onClick={() => navigate("/dashboard")}>
          <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
          Back to Dashboard
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 p-1 bg-gray-100 dark:bg-gray-800">
          <TabsTrigger
            value="gemini"
            className={`flex items-center gap-2 data-[state=active]:bg-teal-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-semibold`}
          >
            <Sparkles className="w-4 h-4" />
            AI Model Prediction Support
          </TabsTrigger>
          <TabsTrigger
            value="yolo"
            className={`flex items-center gap-2 data-[state=active]:bg-teal-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-semibold`}
          >
            <Scan className="w-4 h-4" />
            Local Vision Scan
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: AI Model Prediction Support */}
        <TabsContent value="gemini" className="space-y-6 mt-6">
          {!imageGemini && !loadingGemini ? (
            <Card>
              <CardContent className="p-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <FileImage className="w-20 h-20 text-muted-foreground mb-6" />
                  <h3 className="text-2xl font-semibold mb-2">Upload a Photo of Your Teeth</h3>
                  <p className="text-muted-foreground mb-8 max-w-md">
                    Snap a photo of your teeth from a close angle. Ensure good lighting for best results!
                  </p>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleUpload}
                      disabled={loadingGemini || loadingYolo}
                      className="hidden"
                    />
                    <Button
                      size="lg"
                      className="bg-teal-500 hover:bg-teal-500/90"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={loadingGemini || loadingYolo}
                    >
                      {loadingGemini ? (
                        <>
                          <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 w-5 h-5" />
                          Upload Photo
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  {imageGemini && (
                    <div className="relative max-w-full mx-auto overflow-hidden rounded-lg flex flex-col items-center justify-center">
                      <img
                        src={imageGemini}
                        alt="Teeth photo"
                        className="w-full h-auto max-h-[450px] object-contain rounded-xl shadow-sm border border-gray-100 bg-gray-50"
                      />
                      {loadingGemini && (
                        <div className="absolute inset-0 bg-white/80 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center">
                          <div className="flex flex-col items-center gap-4">
                            <Loader2 className="w-12 h-12 animate-spin text-teal-500" />
                            <p className="text-lg font-medium text-muted-foreground">Analyzing your photo...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Local Vision Scan */}
        <TabsContent value="yolo" className="space-y-6 mt-6">
          {!imageYolo && !loadingYolo ? (
            <Card>
              <CardContent className="p-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <FileImage className="w-20 h-20 text-muted-foreground mb-6" />
                  <h3 className="text-2xl font-semibold mb-2">Upload a Photo of Your Teeth</h3>
                  <p className="text-muted-foreground mb-8 max-w-md">
                    Snap a photo of your teeth from a close angle. Ensure good lighting for best results!
                  </p>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleUpload}
                      disabled={loadingGemini || loadingYolo}
                      className="hidden"
                    />
                    <Button
                      size="lg"
                      className="bg-teal-500 hover:bg-teal-500/90"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={loadingGemini || loadingYolo}
                    >
                      {loadingYolo ? (
                        <>
                          <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 w-5 h-5" />
                          Upload Photo
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              <Card>
                <CardHeader>
                    <CardTitle>Interactive Viewport</CardTitle>
                    <CardDescription>Detected conditions, restorations, and anomalies highlighted</CardDescription>
                  </CardHeader>
                <CardContent className="p-4">
                  {imageYolo && (
                    <div className="relative max-w-full mx-auto overflow-hidden rounded-lg flex flex-col items-center justify-center">
                      <canvas
                        ref={yoloCanvasRef}
                        className="w-full"
                      />
                      {loadingYolo && (
                        <div className="absolute inset-0 bg-white/80 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center">
                          <div className="flex flex-col items-center gap-4">
                            <Loader2 className="w-12 h-12 animate-spin text-teal-500" />
                            <p className="text-lg font-medium text-muted-foreground">Analyzing your photo...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {resultsYolo && !loadingYolo && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Analysis Results</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-muted/50">
                          <p className="text-sm text-muted-foreground mb-1">Total Issues</p>
                          <p className="text-3xl font-bold">{resultsYolo.total_issues || 0}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50">
                          <p className="text-sm text-muted-foreground mb-1">Severity Level</p>
                          <Badge className={`${getSeverityColor(resultsYolo.severity_level)} text-white`}>
                            {resultsYolo.severity_level || "Healthy"}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50 border">
                        <p className="font-semibold mb-1">Recommendation</p>
                        <p className="text-muted-foreground">{getSpecialistRecommendation(resultsYolo.findings || [])}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-teal-500/20">
                    <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4">
                      <Sparkles className="w-12 h-12 text-teal-500" />
                      <h3 className="text-xl font-semibold">AI Guidance Integration</h3>
                      <p className="text-muted-foreground max-w-md">
                        Initiate conversational guidance about these detection findings or forward to a dentist.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            className="bg-teal-500 hover:bg-teal-500/90"
                            onClick={() => handleForwardToChat("YOLO_SCAN", resultsYolo)}
                          >
                            <MessageSquare className="mr-2 w-4 h-4" />
                            Initiate Conversational Guidance
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            variant="outline"
                            onClick={() => setIsModalOpen(true)}
                          >
                            <Stethoscope className="mr-2 w-4 h-4" />
                            Forward to Doctor
                          </Button>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Forward to Doctor Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select a Doctor to Forward Report</DialogTitle>
            <DialogDescription>
              Choose a doctor to send your AI analysis report to. This will also create an appointment request.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            {doctors.map((doctor) => (
              <Card key={doctor.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-lg">{doctor.full_name}</h4>
                      <p className="text-sm text-muted-foreground mb-1">
                        {doctor.specialization || "General Dentistry"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {doctor.clinic_name || "Unknown Clinic"} • {doctor.city || "Unknown City"}
                      </p>
                      {doctor.experience_years && (
                        <Badge variant="secondary" className="mt-2">
                          {doctor.experience_years} years experience
                        </Badge>
                      )}
                    </div>
                    <Button
                      onClick={() => handleForwardToDoctor(doctor.id)}
                      disabled={isBooking}
                      className="bg-[#21b2c0] hover:bg-[#1a95a0]"
                    >
                      {isBooking ? "Sending..." : "Forward Report"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {doctors.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No doctors available at the moment.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
