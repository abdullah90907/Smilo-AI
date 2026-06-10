import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  FileImage,
  Calendar,
  AlertCircle,
  CheckCircle,
  Download,
  Printer,
  Share2,
  Stethoscope,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getDoctors, bookAppointment, getReportById } from "@/lib/api";
import { getSpecialistRecommendation } from "@/lib/utils";
import { toast } from "sonner";

// Simple component to show image without any detections
function SimpleXrayImage({ imageUrl, alt, maxWidth = "100%" }: { imageUrl: string; alt: string; maxWidth?: string }) {
  return (
    <div className="relative rounded-xl overflow-hidden bg-muted mx-auto" style={{ maxWidth }}>
      <img src={imageUrl} alt={alt} className="w-full h-auto max-h-[450px] object-contain rounded-xl shadow-sm border border-gray-100 bg-gray-50" />
    </div>
  );
}

export default function UserReportDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (!id) return;
    const fetchReport = async () => {
      try {
        const data = await getReportById(parseInt(id));
        setReport(data);
      } catch (e) {
        console.error("Error fetching report:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

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

  const formatConfidenceDetail = (confidence: any) => {
    if (!confidence || confidence === "null" || confidence === "undefined") {
      return "N/A";
    }
    const confStr = String(confidence);
    if (confStr.includes("%")) {
      const num = parseFloat(confStr.replace("%", ""));
      return `${Math.min(num, 100).toFixed(1)}%`;
    }
    const num = parseFloat(confStr);
    if (isNaN(num)) {
      return "N/A";
    }
    let formattedNum = num;
    if (num > 1 && num <= 100) {
      // It's already a percentage (like 95)
      formattedNum = num;
    } else if (num <= 1) {
      // It's a decimal (like 0.95)
      formattedNum = num * 100;
    }
    return `${Math.min(formattedNum, 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading report...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-12 text-center">
            <FileImage className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Report Not Found</h3>
            <p className="text-sm text-muted-foreground mb-6">
              The report you're looking for doesn't exist or has been deleted.
            </p>
            <Button onClick={() => navigate("/dashboard/reports")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  let resultData: any = null;
  if (report.result_json) {
    try {
      resultData = typeof report.result_json === 'string' 
        ? JSON.parse(report.result_json) 
        : report.result_json;
    } catch (e) {
      console.error("Failed to parse result json", e);
    }
  }

  // Calculate average confidence
  let avgConf = 0;
  if (resultData?.findings?.length) {
    avgConf = (resultData.findings.reduce((sum: number, f: any) => {
      const conf = typeof f.confidence === 'number' ? f.confidence : parseFloat(f.confidence || '0');
      const normalizedConf = conf > 1 ? conf / 100 : conf;
      return sum + normalizedConf;
    }, 0) / resultData.findings.length) * 100;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/reports")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Report Details</h1>
                <p className="text-sm text-muted-foreground">{report.filename}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-8 space-y-6">
        {/* Summary Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle>Analysis Summary</CardTitle>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => setIsModalOpen(true)} 
                  className="bg-[#21b2c0] hover:bg-[#1a95a0]"
                >
                  <Stethoscope className="w-4 h-4 mr-2" />
                  Forward to Doctor
                </Button>
                {report.scan_type?.toLowerCase() === "gemini" && resultData?.overall_oral_hygiene && (
                  <Badge className={getSeverityColor(resultData.overall_oral_hygiene)}>
                    {resultData.overall_oral_hygiene}
                  </Badge>
                )}
                {report.scan_type?.toLowerCase() !== "gemini" && (
                  <Badge className={getSeverityColor(report.severity)}>
                    {report.severity}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Date</p>
                <p className="font-semibold">{report.upload_date}</p>
              </div>

              {report.scan_type?.toLowerCase() === "xray" || report.scan_type?.toLowerCase() === "photo" ? (
                <>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Issues Found</p>
                    <p className="font-semibold text-2xl">
                      {resultData?.findings?.length || 0}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Severity</p>
                    <p className="font-semibold text-2xl">{report.ai_prediction}</p>
                  </div>
                </>
              ) : report.scan_type?.toLowerCase() === "gemini" ? (
                <>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Overall Hygiene</p>
                    <p className="font-semibold text-2xl">{resultData?.overall_oral_hygiene || report.ai_prediction}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Findings Count</p>
                    <p className="font-semibold text-2xl">
                      {resultData?.findings?.length || 0}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Diagnosis</p>
                    <p className="font-semibold text-2xl">{report.ai_prediction}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    <p className="font-semibold text-2xl">
                      {resultData?.status || "Completed"}
                    </p>
                  </div>
                </>
              )}

              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Confidence</p>
                <p className="font-semibold text-2xl">{avgConf > 0 ? `${avgConf.toFixed(1)}%` : formatConfidenceDetail(report.confidence)}</p>
              </div>
            </div>

            <Separator />
          </CardContent>
        </Card>

        {/* Content Sections */}
        <div className="grid gap-8">
          {/* 1. X-Ray Layout (2x2 grid) */}
          {report.scan_type?.toLowerCase() === "xray" ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Original X-Ray */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Original X-Ray</CardTitle>
                    <CardDescription>Uploaded {report.filename}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    {report.image_data ? (
                      <div className="relative rounded-xl overflow-hidden bg-muted mx-auto max-w-full">
                        <img
                          src={`data:image/jpeg;base64,${report.image_data}`}
                          alt={report.filename}
                          className="w-full h-auto max-h-[450px] object-contain rounded-xl shadow-sm border border-gray-100 bg-gray-50"
                        />
                      </div>
                    ) : report.file_url ? (
                      <SimpleXrayImage
                        imageUrl={report.file_url}
                        alt={report.filename}
                        maxWidth="100%"
                      />
                    ) : (
                      <div className="aspect-video rounded-xl bg-muted flex items-center justify-center">
                        <FileImage className="w-16 h-16 text-muted-foreground" />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Segmentation Mask */}
                {resultData && (resultData.overlay_url || resultData.segmentation_url) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">Segmentation Mask</CardTitle>
                      <CardDescription>AI-generated tooth segmentation</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4">
                      <img
                        src={resultData.overlay_url || resultData.segmentation_url}
                        alt="Segmentation Mask"
                        className="w-full h-auto object-contain rounded-xl shadow-sm border border-gray-100"
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Extracted Teeth */}
                {resultData && resultData.visual_extracted_url && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">Extracted Teeth</CardTitle>
                      <CardDescription>Isolated tooth visualization</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4">
                      <img
                        src={resultData.visual_extracted_url}
                        alt="Extracted Teeth"
                        className="w-full h-auto object-contain rounded-xl shadow-sm border border-gray-100"
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Caries Detection */}
                {resultData && resultData.caries_detection_url && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">Comprehensive AI Findings</CardTitle>
                      <CardDescription>Detected conditions, restorations, and anomalies highlighted</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4">
                      <img
                        src={resultData.caries_detection_url}
                        alt="Comprehensive AI Findings"
                        className="w-full h-auto object-contain rounded-xl shadow-sm border border-gray-100"
                      />
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Detailed Findings */}
              {resultData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Detailed Findings</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {resultData.findings && Array.isArray(resultData.findings) && resultData.findings.length > 0 ? (
                      <div className="space-y-3">
                        {resultData.findings.map((finding: any, index: number) => (
                          <div key={index} className="p-4 rounded-lg bg-muted/50 border">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-semibold text-[#21b2c0]">
                                Finding #{index + 1}: {typeof finding === 'string' ? finding : finding.class}
                              </p>
                              {finding.confidence && (
                                <Badge variant="secondary">
                                  {formatConfidenceDetail(finding.confidence)} Confidence
                                </Badge>
                              )}
                            </div>
                            {finding.box && (
                              <div className="text-xs text-muted-foreground grid grid-cols-2 gap-2">
                                <div>
                                  <span className="font-medium">Position:</span> X: {Math.round(finding.box[0])}, Y: {Math.round(finding.box[1])}
                                </div>
                                <div>
                                  <span className="font-medium">Size:</span> W: {Math.round(finding.box[2] - finding.box[0])}px, H: {Math.round(finding.box[3] - finding.box[1])}px
                                </div>
                              </div>
                            )}
                            {finding.description && <p className="text-sm text-muted-foreground">{finding.description}</p>}
                          </div>
                        ))}
                      </div>
                    ) : resultData.summary ? (
                      <div className="p-4 rounded-lg bg-[#21b2c0]/10 border border-[#21b2c0]/20">
                        <p className="font-semibold text-[#21b2c0] mb-1">Summary</p>
                        <p className="text-muted-foreground">{resultData.summary}</p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No detailed findings available</p>
                    )}

                    {resultData.recommendations && Array.isArray(resultData.recommendations) && resultData.recommendations.length > 0 && (
                      <div className="mt-4 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200">
                        <p className="font-semibold mb-2 text-yellow-800 dark:text-yellow-200">Recommendations</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {resultData.recommendations.map((rec: string, idx: number) => (
                            <li key={idx}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {resultData.recommendation && typeof resultData.recommendation === 'string' && !resultData.recommendations && (
                      <div className="mt-4 p-4 rounded-lg bg-muted/50 border">
                        <p className="font-semibold mb-1">Recommendation</p>
                        <p className="text-muted-foreground">{getSpecialistRecommendation(resultData.findings || [])}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          ) : report.scan_type?.toLowerCase() === "photo" ? (
            <>
              <div className="space-y-6">
                {/* Original Photo */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Original Photo</CardTitle>
                    <CardDescription>Uploaded {report.filename}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    {report.image_data ? (
                      <div className="relative rounded-xl overflow-hidden bg-muted mx-auto max-w-md">
                        <img
                          src={`data:image/jpeg;base64,${report.image_data}`}
                          alt={report.filename}
                          className="w-full h-auto max-h-[450px] object-contain rounded-xl shadow-sm border border-gray-100 bg-gray-50"
                        />
                      </div>
                    ) : report.file_url ? (
                      <SimpleXrayImage
                        imageUrl={report.file_url}
                        alt={report.filename}
                        maxWidth="100%"
                      />
                    ) : (
                      <div className="aspect-video rounded-xl bg-muted flex items-center justify-center">
                        <FileImage className="w-16 h-16 text-muted-foreground" />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* YOLO Detection */}
                {resultData && resultData.detection_url && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">YOLO Detection</CardTitle>
                      <CardDescription>Detected issues highlighted</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="relative rounded-xl overflow-hidden bg-muted mx-auto max-w-md">
                        <img
                          src={resultData.detection_url}
                          alt="YOLO Detection"
                          className="w-full h-auto max-h-[450px] object-contain rounded-xl shadow-sm border border-gray-100 bg-gray-50"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Detailed Findings */}
              {resultData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Detailed Findings</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {resultData.findings && Array.isArray(resultData.findings) && resultData.findings.length > 0 ? (
                      <div className="space-y-3">
                        {resultData.findings.map((finding: any, index: number) => (
                          <div key={index} className="p-4 rounded-lg bg-muted/50 border">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-semibold text-[#21b2c0]">
                                Finding #{index + 1}: {typeof finding === 'string' ? finding : finding.class}
                              </p>
                              {finding.confidence && (
                                <Badge variant="secondary">
                                  {formatConfidenceDetail(finding.confidence)} Confidence
                                </Badge>
                              )}
                            </div>
                            {finding.box && (
                              <div className="text-xs text-muted-foreground grid grid-cols-2 gap-2">
                                <div>
                                  <span className="font-medium">Position:</span> X: {Math.round(finding.box[0])}, Y: {Math.round(finding.box[1])}
                                </div>
                                <div>
                                  <span className="font-medium">Size:</span> W: {Math.round(finding.box[2] - finding.box[0])}px, H: {Math.round(finding.box[3] - finding.box[1])}px
                                </div>
                              </div>
                            )}
                            {finding.description && <p className="text-sm text-muted-foreground">{finding.description}</p>}
                          </div>
                        ))}
                      </div>
                    ) : resultData.summary ? (
                      <div className="p-4 rounded-lg bg-[#21b2c0]/10 border border-[#21b2c0]/20">
                        <p className="font-semibold text-[#21b2c0] mb-1">Summary</p>
                        <p className="text-muted-foreground">{resultData.summary}</p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No detailed findings available</p>
                    )}

                    {resultData.recommendations && Array.isArray(resultData.recommendations) && resultData.recommendations.length > 0 && (
                      <div className="mt-4 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200">
                        <p className="font-semibold mb-2 text-yellow-800 dark:text-yellow-200">Recommendations</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {resultData.recommendations.map((rec: string, idx: number) => (
                            <li key={idx}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {resultData.recommendation && typeof resultData.recommendation === 'string' && !resultData.recommendations && (
                      <div className="mt-4 p-4 rounded-lg bg-muted/50 border">
                        <p className="font-semibold mb-1">Recommendation</p>
                        <p className="text-muted-foreground">{getSpecialistRecommendation(resultData.findings || [])}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          ) : report.scan_type?.toLowerCase() === "gemini" ? (
            <div className="space-y-6">
              {/* Original Image */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Original Photo</CardTitle>
                  <CardDescription>Uploaded {report.filename}</CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  {report.image_data ? (
                    <div className="relative rounded-xl overflow-hidden bg-muted mx-auto max-w-md">
                      <img
                        src={`data:image/jpeg;base64,${report.image_data}`}
                        alt={report.filename}
                        className="w-full h-auto max-h-[450px] object-contain rounded-xl shadow-sm border border-gray-100 bg-gray-50"
                      />
                    </div>
                  ) : report.file_url ? (
                    <SimpleXrayImage
                      imageUrl={report.file_url}
                      alt={report.filename}
                      maxWidth="100%"
                    />
                  ) : (
                    <div className="aspect-video rounded-xl bg-muted flex items-center justify-center">
                      <FileImage className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Gemini Analysis Results */}
              <div className="space-y-6">
                {/* Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="p-4 rounded-lg bg-[#21b2c0]/10 border border-[#21b2c0]/20">
                      <p className="text-muted-foreground">{resultData?.summary || 'No summary available.'}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Findings */}
                {(resultData?.findings || []).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">Detailed Findings</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      {(resultData?.findings || []).map((finding: any, index: number) => (
                        <div key={index} className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                          <div className="flex items-start justify-between mb-2 gap-4">
                            <h4 className="font-semibold text-lg">{finding?.issue || (typeof finding === 'string' ? finding : finding?.class)}</h4>
                            <div className="flex items-center gap-2">
                              {finding?.confidence && (
                                <Badge variant="secondary">{formatConfidenceDetail(finding.confidence)}</Badge>
                              )}
                              {finding?.severity && (
                                <Badge className={getSeverityColor(finding.severity)}>
                                  {finding.severity}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {finding?.description && <p className="text-muted-foreground mb-2">{finding.description}</p>}
                          {(finding?.prevention || []).length > 0 && (
                            <div className="mb-2">
                              <p className="font-medium text-sm">Prevention</p>
                              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                {(finding.prevention || []).map((item: string, i: number) => (
                                  <li key={i}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {(finding?.suggested_care || []).length > 0 && (
                            <div>
                              <p className="font-medium text-sm">Suggested Care</p>
                              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                {(finding.suggested_care || []).map((item: string, i: number) => (
                                  <li key={i}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Recommendations */}
                {(resultData?.recommendations || []).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200">
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {(resultData?.recommendations || []).map((rec: string, idx: number) => (
                            <li key={idx}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : report.scan_type?.toLowerCase() === "document" ? (
            <div className="space-y-6">
              {/* Summary */}
              {resultData?.summary && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Patient Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="p-4 rounded-lg bg-[#21b2c0]/10 border border-[#21b2c0]/20">
                      <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{resultData.summary}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Patient Information */}
              {resultData?.patient_info && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Patient Information</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-2">
                    {resultData.patient_info.name && (
                      <p><span className="font-semibold">Name:</span> {resultData.patient_info.name}</p>
                    )}
                    {resultData.patient_info.age && (
                      <p><span className="font-semibold">Age:</span> {resultData.patient_info.age}</p>
                    )}
                    {resultData.patient_info.gender && (
                      <p><span className="font-semibold">Gender:</span> {resultData.patient_info.gender}</p>
                    )}
                    {resultData.patient_info.report_date && (
                      <p><span className="font-semibold">Report Date:</span> {resultData.patient_info.report_date}</p>
                    )}
                    {resultData.patient_info.clinic_name && (
                      <p><span className="font-semibold">Clinic:</span> {resultData.patient_info.clinic_name}</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Risk Assessment */}
              {resultData?.risk_assessment && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Risk Assessment</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {resultData.risk_assessment.tooth_decay_risk && (
                        <div className="p-4 rounded-lg bg-muted/50">
                          <p className="text-sm text-muted-foreground mb-1">Tooth Decay Risk</p>
                          <Badge className={getSeverityColor(resultData.risk_assessment.tooth_decay_risk)}>
                            {resultData.risk_assessment.tooth_decay_risk}
                          </Badge>
                        </div>
                      )}
                      {resultData.risk_assessment.gum_disease_risk && (
                        <div className="p-4 rounded-lg bg-muted/50">
                          <p className="text-sm text-muted-foreground mb-1">Gum Disease Risk</p>
                          <Badge className={getSeverityColor(resultData.risk_assessment.gum_disease_risk)}>
                            {resultData.risk_assessment.gum_disease_risk}
                          </Badge>
                        </div>
                      )}
                      {resultData.risk_assessment.tooth_loss_risk && (
                        <div className="p-4 rounded-lg bg-muted/50">
                          <p className="text-sm text-muted-foreground mb-1">Tooth Loss Risk</p>
                          <Badge className={getSeverityColor(resultData.risk_assessment.tooth_loss_risk)}>
                            {resultData.risk_assessment.tooth_loss_risk}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Diagnoses */}
              {resultData?.diagnoses && Array.isArray(resultData.diagnoses) && resultData.diagnoses.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Diagnoses</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {resultData.diagnoses.map((diag: any, index: number) => (
                      <div key={index} className="p-4 rounded-lg bg-muted/50">
                        <p className="font-semibold text-lg text-[#21b2c0]">{diag.condition}</p>
                        {diag.status && <Badge variant="secondary" className="mt-2">{diag.status}</Badge>}
                        {diag.notes && <p className="text-sm text-muted-foreground mt-2">{diag.notes}</p>}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Treatment Plan */}
              {(resultData?.treatment_plan || resultData?.recommended_treatments) ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Recommended Treatments</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200">
                      <ul className="space-y-2">
                        {resultData.treatment_plan ? (
                          Array.isArray(resultData.treatment_plan) ? (
                            resultData.treatment_plan.map((item: string, idx: number) => (
                              <li key={idx} className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-[#21b2c0]" />
                                <span className="text-gray-800 dark:text-gray-200">{item}</span>
                              </li>
                            ))
                          ) : (
                            <li className="text-gray-800 dark:text-gray-200">{resultData.treatment_plan}</li>
                          )
                        ) : resultData.recommended_treatments && Array.isArray(resultData.recommended_treatments) ? (
                          resultData.recommended_treatments.map((item: string, idx: number) => (
                            <li key={idx} className="flex items-center gap-2">
                              <CheckCircle className="w-5 h-5 text-[#21b2c0]" />
                              <span className="text-gray-800 dark:text-gray-200">{item}</span>
                            </li>
                          ))
                        ) : null}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              {/* Detailed Findings */}
              {resultData?.findings && Array.isArray(resultData.findings) && resultData.findings.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Detailed Findings</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {resultData.findings.map((finding: any, index: number) => (
                      <div key={index} className="p-4 rounded-lg bg-muted/50">
                        {typeof finding === "string" ? (
                          <p className="text-gray-800 dark:text-gray-200">{finding}</p>
                        ) : (
                          <>
                            {finding.tooth_number && <p className="font-semibold">Tooth {finding.tooth_number}</p>}
                            {finding.finding && <p className="text-muted-foreground">{finding.finding}</p>}
                            {finding.status && <Badge variant="secondary" className="mt-2">{finding.status}</Badge>}
                            {finding.issue && <p className="font-semibold text-[#21b2c0]">{finding.issue}</p>}
                            {finding.details && <p className="text-sm text-muted-foreground">{finding.details}</p>}
                            {finding.observation && <p className="text-lg font-semibold">{finding.observation}</p>}
                            {finding.location && <p className="text-muted-foreground">Location: {finding.location}</p>}
                          </>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Precautions */}
              {resultData?.precautions && Array.isArray(resultData.precautions) && resultData.precautions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Precautions</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200">
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {resultData.precautions.map((item: string, idx: number) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Original Image</CardTitle>
                  <CardDescription>Uploaded {report.filename}</CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  {report.image_data ? (
                    <div className="relative rounded-xl overflow-hidden bg-muted mx-auto max-w-[800px]">
                      <img
                        src={`data:image/jpeg;base64,${report.image_data}`}
                        alt={report.filename}
                        className="w-full h-auto max-h-[450px] object-contain rounded-xl shadow-sm border border-gray-100 bg-gray-50"
                      />
                    </div>
                  ) : report.file_url ? (
                    <SimpleXrayImage
                      imageUrl={report.file_url}
                      alt={report.filename}
                      maxWidth="800px"
                    />
                  ) : (
                    <div className="aspect-video rounded-xl bg-muted flex items-center justify-center max-w-[800px] mx-auto">
                      <FileImage className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                </CardContent>
              </Card>

              {resultData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Detailed Findings</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {resultData.findings && Array.isArray(resultData.findings) && resultData.findings.length > 0 ? (
                      <div className="space-y-3">
                        {resultData.findings.map((finding: any, index: number) => (
                          <div key={index} className="p-4 rounded-lg bg-muted/50 border">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-semibold text-[#21b2c0]">
                                Finding #{index + 1}: {typeof finding === 'string' ? finding : finding.class}
                              </p>
                              {finding.confidence && (
                                <Badge variant="secondary">
                                  {formatConfidenceDetail(finding.confidence)} Confidence
                                </Badge>
                              )}
                            </div>
                            {finding.description && <p className="text-sm text-muted-foreground">{finding.description}</p>}
                          </div>
                        ))}
                      </div>
                    ) : resultData.summary ? (
                      <div className="p-4 rounded-lg bg-[#21b2c0]/10 border border-[#21b2c0]/20">
                        <p className="font-semibold text-[#21b2c0] mb-1">Summary</p>
                        <p className="text-muted-foreground">{resultData.summary}</p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No detailed findings available</p>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>

      {/* Forward to Doctor Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select a Doctor to Forward Report</DialogTitle>
            <DialogDescription>
              Choose a doctor to send your AI analysis report to. This will also create an appointment request.
            </DialogDescription>
          </DialogHeader>
          {doctors.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">You have no active appointments. Book an appointment first!</p>
              <Button className="mt-4" onClick={() => navigate("/dashboard/doctors")}>
                Book an Appointment
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {doctors.map((doctor) => (
                <Card key={doctor.id} className="hover:shadow-md transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-semibold text-lg">{doctor.full_name}</h4>
                        <p className="text-sm text-muted-foreground">
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
