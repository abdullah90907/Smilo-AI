import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  ArrowLeft,
  Download,
  Image as ImageIcon,
  Brain,
  CheckCircle,
  AlertCircle,
  Save,
  Send,
  Flag,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";

export default function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [diagnosis, setDiagnosis] = useState("confirm");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [severity, setSeverity] = useState("moderate");
  const [zoom, setZoom] = useState(100);

  // Mock data - would come from API in real app
  const reportData = {
    patientId: "#12567",
    uploadDate: "Jan 18, 2026 10:30 AM",
    age: "25-35",
    symptoms: ["Tooth pain", "Sensitivity to cold"],
    aiPrediction: "Dental Caries",
    confidence: "87.3%",
    severity: "Moderate",
    affectedRegions: "Upper right molar (tooth #15)",
    modelVersion: "v2.1.3",
    processedAt: "Jan 18, 2026 10:31 AM",
    xrayUrl: "https://placehold.co/800x400/1a1a1a/white?text=Original+X-ray",
    heatmapUrl: "https://placehold.co/800x400/1a1a1a/orange?text=AI+Heatmap+Overlay",
  };

  const treatments = [
    "Filling",
    "Root Canal",
    "Extraction",
    "Crown",
    "Monitoring",
    "Preventive Care",
    "Referral to Specialist",
  ];

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
                <h1 className="text-2xl font-bold">Patient Report Detail</h1>
                <p className="text-sm text-muted-foreground">
                  Patient {reportData.patientId} • {reportData.uploadDate}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" size="sm">
                <Send className="w-4 h-4 mr-2" />
                Share with Patient
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel - X-ray Images */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Patient Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Patient ID</p>
                  <p className="font-semibold">{reportData.patientId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Age Range</p>
                  <p className="font-semibold">{reportData.age}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Upload Date</p>
                  <p className="font-semibold">{reportData.uploadDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reported Symptoms</p>
                  <div className="flex gap-2 flex-wrap mt-1">
                    {reportData.symptoms.map((symptom) => (
                      <Badge key={symptom} variant="secondary">
                        {symptom}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* X-ray Images */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">X-ray Images</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setZoom(Math.max(50, zoom - 10))}>
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-medium w-12 text-center">{zoom}%</span>
                    <Button variant="outline" size="icon" onClick={() => setZoom(Math.min(200, zoom + 10))}>
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="original" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="original">Original X-ray</TabsTrigger>
                    <TabsTrigger value="heatmap">AI Heatmap</TabsTrigger>
                  </TabsList>
                  <TabsContent value="original" className="mt-4">
                    <div className="relative rounded-lg overflow-hidden bg-muted">
                      <img
                        src={reportData.xrayUrl}
                        alt="Original X-ray"
                        className="w-full h-auto transition-transform"
                        style={{ transform: `scale(${zoom / 100})` }}
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="heatmap" className="mt-4">
                    <div className="relative rounded-lg overflow-hidden bg-muted">
                      <img
                        src={reportData.heatmapUrl}
                        alt="AI Heatmap"
                        className="w-full h-auto transition-transform"
                        style={{ transform: `scale(${zoom / 100})` }}
                      />
                    </div>
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground">Heatmap Legend:</strong> Red areas
                        indicate regions with high AI confidence for dental caries. Orange
                        shows moderate concern, and blue indicates healthy regions.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - AI Analysis & Doctor Review */}
          <div className="space-y-6">
            {/* AI Analysis Summary */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-500" />
                  <CardTitle className="text-lg">AI Analysis</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Prediction</p>
                  <p className="text-xl font-bold text-destructive">
                    {reportData.aiPrediction}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Confidence Score</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: reportData.confidence }}
                      />
                    </div>
                    <span className="font-semibold text-primary">
                      {reportData.confidence}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Severity Level</p>
                  <Badge variant="default">{reportData.severity}</Badge>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Affected Regions</p>
                  <p className="text-sm">{reportData.affectedRegions}</p>
                </div>
                <div className="text-xs text-muted-foreground">
                  <p>Model: {reportData.modelVersion}</p>
                  <p>Processed: {reportData.processedAt}</p>
                </div>
              </CardContent>
            </Card>

            {/* Doctor's Review Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Professional Review</CardTitle>
                <CardDescription>Add your diagnosis and clinical notes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Diagnosis */}
                <div className="space-y-3">
                  <Label>Professional Diagnosis</Label>
                  <RadioGroup value={diagnosis} onValueChange={setDiagnosis}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="confirm" id="confirm" />
                      <Label htmlFor="confirm" className="font-normal cursor-pointer">
                        Confirm AI Prediction
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="healthy" id="healthy" />
                      <Label htmlFor="healthy" className="font-normal cursor-pointer">
                        Correct to Healthy
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="caries" id="caries" />
                      <Label htmlFor="caries" className="font-normal cursor-pointer">
                        Correct to Dental Caries
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other" className="font-normal cursor-pointer">
                        Other Condition
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                {/* Severity Assessment */}
                <div className="space-y-3">
                  <Label>Severity Assessment</Label>
                  <Select value={severity} onValueChange={setSeverity}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="mild">Mild</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="severe">Severe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Clinical Notes */}
                <div className="space-y-3">
                  <Label>Clinical Notes</Label>
                  <Textarea
                    placeholder="Enter your detailed findings, diagnosis, and recommendations..."
                    className="min-h-32"
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                  />
                </div>

                {/* Recommended Treatment */}
                <div className="space-y-3">
                  <Label>Recommended Treatment</Label>
                  <div className="space-y-2">
                    {treatments.map((treatment) => (
                      <div key={treatment} className="flex items-center space-x-2">
                        <Checkbox id={treatment} />
                        <label
                          htmlFor={treatment}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {treatment}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Confidence Level */}
                <div className="space-y-3">
                  <Label>Your Confidence Level</Label>
                  <Slider defaultValue={[8]} max={10} step={1} className="w-full" />
                  <p className="text-xs text-muted-foreground">
                    Rate your confidence in this diagnosis (1-10)
                  </p>
                </div>

                <Separator />

                {/* Actions */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="flag" />
                    <label
                      htmlFor="flag"
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      Flag for AI Training (Incorrect AI prediction)
                    </label>
                  </div>
                  <Button className="w-full" size="lg">
                    <Save className="w-4 h-4 mr-2" />
                    Save Review
                  </Button>
                  <Button variant="outline" className="w-full">
                    Request Consultation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
