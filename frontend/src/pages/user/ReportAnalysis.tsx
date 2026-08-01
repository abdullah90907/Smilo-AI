import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { analyzeReport } from "@/lib/api";
import { useState, useRef } from "react";
import {
  Upload,
  ArrowRight,
  Loader2,
  FileText,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type RiskLevel = "Low" | "Moderate" | "High" | "Unknown";

type PatientInfo = {
  name?: string;
  age?: number;
  gender?: string;
  report_date?: string;
  clinic_name?: string;
  dentist_name?: string;
  report_type?: string;
};

type Diagnosis = {
  condition: string;
  status?: string;
  notes?: string;
};

type ToothFinding = {
  tooth_number?: string;
  finding?: string;
  status?: string;
};

type GumFinding = {
  issue?: string;
  severity?: string;
  details?: string;
};

type XrayFinding = {
  observation?: string;
  location?: string;
  severity?: string;
};

type SimplifiedExplanation = {
  medical_term?: string;
  simple_explanation?: string;
};

type DentalReportResponse = {
  success: boolean;
  document_type: string;
  message?: string;
  patient_info?: PatientInfo;
  diagnoses?: Diagnosis[];
  tooth_findings?: ToothFinding[];
  gum_findings?: GumFinding[];
  xray_findings?: XrayFinding[];
  existing_dental_work?: string[];
  recommended_treatments?: string[];
  risk_assessment?: {
    tooth_decay_risk?: RiskLevel;
    gum_disease_risk?: RiskLevel;
    tooth_loss_risk?: RiskLevel;
  };
  precautions?: string[];
  patient_suggestions?: string[];
  simplified_explanations?: SimplifiedExplanation[];
  patient_summary?: string;
};

export default function ReportAnalysis() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<DentalReportResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const getRiskColor = (risk: RiskLevel | undefined) => {
    switch (risk?.toLowerCase()) {
      case "low":
        return "bg-green-500";
      case "moderate":
        return "bg-yellow-500";
      case "high":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setLoading(true);
    try {
      const result = await analyzeReport(selectedFile);
      setResults(result);
    } catch (error) {
      console.error("Report analysis error:", error);
      alert("❌ Error: Could not connect to Smilo Backend. Is the backend running on port 8000?");
    } finally {
      setLoading(false);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      const event = { target: { files: [droppedFile] } } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleUpload(event);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleForwardToChat = (data: any) => {
    navigate("/dashboard/assistant", { state: { contextSource: "REPORT_ANALYSIS", data } });
  };

  const resetAnalysis = () => {
    setFile(null);
    setResults(null);
    setLoading(false);
  };

  return (
    <div className="min-h-screen p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Advanced Report Analytics</h1>
        <Button variant="ghost" onClick={() => navigate("/dashboard")}>
          <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
          Back to Dashboard
        </Button>
      </div>

      {!file && !loading ? (
        <Card>
          <CardContent className="p-12">
            <div
              className="flex flex-col items-center justify-center text-center border-2 border-dashed border-[#21b2c0]/50 hover:border-[#21b2c0] rounded-xl p-12 cursor-pointer transition-all"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <FileText className="w-20 h-20 text-[#21b2c0] mb-6" />
              <h3 className="text-2xl font-semibold mb-2">Upload Dental Report</h3>
              <p className="text-muted-foreground mb-8 max-w-md">
                Supported formats: PDF, DOCX, JPG, PNG. Drag and drop or click to upload.
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
                  onChange={handleUpload}
                  className="hidden"
                />
                <Button
                  size="lg"
                  className="bg-[#21b2c0] hover:bg-[#1a95a0]"
                >
                  <Upload className="mr-2 w-5 h-5" />
                  Upload Report
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="max-w-5xl mx-auto space-y-6">
          {loading && (
            <Card>
              <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                <Loader2 className="w-16 h-16 animate-spin text-[#21b2c0] mb-4" />
                <p className="text-lg font-medium text-muted-foreground">
                  Extracting clinical data and simplifying medical jargon...
                </p>
              </CardContent>
            </Card>
          )}

          {results && !loading && (
            <>
              {!results.success ? (
                <Card className="border-2 border-red-200">
                  <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4">
                    <p className="text-lg font-semibold text-red-600">{results.message}</p>
                    <Button
                      className="bg-[#21b2c0] hover:bg-[#1a95a0]"
                      onClick={resetAnalysis}
                    >
                      Upload Another Report
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Header Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-xl">Patient Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {results.patient_info?.name && (
                          <p><span className="font-semibold">Name:</span> {results.patient_info.name}</p>
                        )}
                        {results.patient_info?.age && (
                          <p><span className="font-semibold">Age:</span> {results.patient_info.age}</p>
                        )}
                        {results.patient_info?.report_date && (
                          <p><span className="font-semibold">Report Date:</span> {results.patient_info.report_date}</p>
                        )}
                        {results.patient_info?.clinic_name && (
                          <p><span className="font-semibold">Clinic:</span> {results.patient_info.clinic_name}</p>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="bg-[#21b2c0]/10 border-l-4 border-[#21b2c0]">
                      <CardHeader>
                        <CardTitle className="text-xl text-[#21b2c0]">Patient Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{results.patient_summary}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Risk Assessment */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">Risk Assessment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg bg-muted/50">
                          <p className="text-sm text-muted-foreground mb-1">Tooth Decay Risk</p>
                          <Badge className={`${getRiskColor(results.risk_assessment?.tooth_decay_risk)} text-white text-lg`}>
                            {results.risk_assessment?.tooth_decay_risk || "Unknown"}
                          </Badge>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50">
                          <p className="text-sm text-muted-foreground mb-1">Gum Disease Risk</p>
                          <Badge className={`${getRiskColor(results.risk_assessment?.gum_disease_risk)} text-white text-lg`}>
                            {results.risk_assessment?.gum_disease_risk || "Unknown"}
                          </Badge>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50">
                          <p className="text-sm text-muted-foreground mb-1">Tooth Loss Risk</p>
                          <Badge className={`${getRiskColor(results.risk_assessment?.tooth_loss_risk)} text-white text-lg`}>
                            {results.risk_assessment?.tooth_loss_risk || "Unknown"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Simplified Explanations */}
                  {results.simplified_explanations && results.simplified_explanations.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-xl">Simplified Medical Terms</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {results.simplified_explanations.map((exp, idx) => (
                          <div key={idx} className="p-4 rounded-lg bg-muted/50">
                            <p className="font-semibold text-[#21b2c0]">{exp.medical_term}</p>
                            <p className="text-muted-foreground">{exp.simple_explanation}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Detailed Findings Tabs */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">Detailed Findings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="diagnoses" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="diagnoses">Diagnoses</TabsTrigger>
                          <TabsTrigger value="teeth">Teeth Findings</TabsTrigger>
                          <TabsTrigger value="gums">Gum Findings</TabsTrigger>
                          <TabsTrigger value="xrays">X-Ray Findings</TabsTrigger>
                        </TabsList>
                        <TabsContent value="diagnoses" className="space-y-4 mt-4">
                          {results.diagnoses && results.diagnoses.length > 0 ? (
                            results.diagnoses.map((diag, idx) => (
                              <div key={idx} className="p-4 rounded-lg bg-muted/50">
                                <p className="font-semibold">{diag.condition}</p>
                                {diag.status && <Badge variant="secondary">{diag.status}</Badge>}
                                {diag.notes && <p className="text-sm text-muted-foreground mt-2">{diag.notes}</p>}
                              </div>
                            ))
                          ) : (
                            <p className="text-muted-foreground">No diagnoses listed.</p>
                          )}
                        </TabsContent>
                        <TabsContent value="teeth" className="space-y-4 mt-4">
                          {results.tooth_findings && results.tooth_findings.length > 0 ? (
                            results.tooth_findings.map((tooth, idx) => (
                              <div key={idx} className="p-4 rounded-lg bg-muted/50">
                                {tooth.tooth_number && <p className="font-semibold">Tooth {tooth.tooth_number}</p>}
                                {tooth.finding && <p className="text-muted-foreground">{tooth.finding}</p>}
                                {tooth.status && (
                                  <Badge variant="secondary" className="mt-2">
                                    {tooth.status}
                                  </Badge>
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="text-muted-foreground">No tooth findings listed.</p>
                          )}
                        </TabsContent>
                        <TabsContent value="gums" className="space-y-4 mt-4">
                          {results.gum_findings && results.gum_findings.length > 0 ? (
                            results.gum_findings.map((gum, idx) => (
                              <div key={idx} className="p-4 rounded-lg bg-muted/50">
                                {gum.issue && <p className="font-semibold">{gum.issue}</p>}
                                {gum.severity && (
                                  <Badge className={`${getRiskColor(gum.severity as RiskLevel)} text-white mt-2`}>
                                    {gum.severity}
                                  </Badge>
                                )}
                                {gum.details && <p className="text-sm text-muted-foreground mt-2">{gum.details}</p>}
                              </div>
                            ))
                          ) : (
                            <p className="text-muted-foreground">No gum findings listed.</p>
                          )}
                        </TabsContent>
                        <TabsContent value="xrays" className="space-y-4 mt-4">
                          {results.xray_findings && results.xray_findings.length > 0 ? (
                            results.xray_findings.map((xray, idx) => (
                              <div key={idx} className="p-4 rounded-lg bg-muted/50">
                                {xray.observation && <p className="font-semibold">{xray.observation}</p>}
                                {xray.location && <p className="text-muted-foreground">Location: {xray.location}</p>}
                                {xray.severity && (
                                  <Badge className={`${getRiskColor(xray.severity as RiskLevel)} text-white mt-2`}>
                                    {xray.severity}
                                  </Badge>
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="text-muted-foreground">No X-ray findings listed.</p>
                          )}
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>

                  {/* Actionable Steps */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {results.recommended_treatments && results.recommended_treatments.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-xl">Recommended Treatments</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {results.recommended_treatments.map((treatment, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-[#21b2c0]" />
                                <span>{treatment}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                    {results.patient_suggestions && results.patient_suggestions.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-xl">Patient Suggestions</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {results.patient_suggestions.map((suggestion, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-[#21b2c0]" />
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Chatbot Handoff */}
                  <Card className="border-2 border-[#21b2c0]/20">
                    <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4">
                      <MessageSquare className="w-12 h-12 text-[#21b2c0]" />
                      <h3 className="text-xl font-semibold">Discuss Report with AI Assistant</h3>
                      <p className="text-muted-foreground max-w-md">
                        Forward this report to the AI assistant for more personalized recommendations.
                      </p>
                      <div className="flex gap-4">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            className="bg-[#21b2c0] hover:bg-[#1a95a0]"
                            onClick={() => handleForwardToChat(results)}
                          >
                            <MessageSquare className="mr-2 w-4 h-4" />
                            Discuss with Assistant
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                          <Button variant="secondary" onClick={resetAnalysis}>
                            Upload Another Report
                          </Button>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}