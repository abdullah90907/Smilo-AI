import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { useXrayData } from "@/hooks/useXrayData";
import {
  ArrowLeft,
  FileImage,
  Calendar,
  AlertCircle,
  CheckCircle,
  Download,
  Printer,
  Share2,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function UserReportDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getReport } = useXrayData();

  const report = id ? getReport(id) : undefined;

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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Healthy":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Mild":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "Severe":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

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
            <div className="flex items-center justify-between">
              <CardTitle>Analysis Summary</CardTitle>
              <Badge className={getSeverityColor(report.severity_level)}>
                {report.severity_level}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Date</p>
                <p className="font-semibold">
                  {new Date(report.timestamp).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Issues Found</p>
                <p className="font-semibold text-2xl">{report.total_issues}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Detections</p>
                <p className="font-semibold text-2xl">{report.findings.length}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <p className="font-semibold capitalize">{report.status}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30">
              {report.severity_level === "Healthy" ? (
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-semibold mb-1">Recommendation</p>
                <p className="text-sm text-muted-foreground">{report.recommendation}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* X-ray Image */}
          <Card>
            <CardHeader>
              <CardTitle>X-ray Image</CardTitle>
            </CardHeader>
            <CardContent>
              {report.imageUrl ? (
                <div className="rounded-lg overflow-hidden bg-muted">
                  <img
                    src={report.imageUrl}
                    alt={report.filename}
                    className="w-full h-auto"
                  />
                </div>
              ) : (
                <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                  <FileImage className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Findings Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detection Details</CardTitle>
            </CardHeader>
            <CardContent>
              {report.findings.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                  <p className="font-semibold mb-1">No Issues Detected</p>
                  <p className="text-sm text-muted-foreground">
                    Your X-ray scan appears healthy
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {report.findings.map((finding, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-semibold">Detection #{index + 1}</p>
                        <Badge variant="secondary">
                          {Math.round(finding.confidence * 100)}% confident
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Class: <span className="font-medium text-foreground">{finding.class}</span>
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div>
                          <span className="font-medium">Position:</span> x:{Math.round(finding.box[0])}, y:{Math.round(finding.box[1])}
                        </div>
                        <div>
                          <span className="font-medium">Size:</span> {Math.round(finding.box[2] - finding.box[0])} × {Math.round(finding.box[3] - finding.box[1])}px
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Next Steps */}
        {report.total_issues > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recommended Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-semibold text-primary">1</span>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Consult a Dentist</p>
                    <p className="text-sm text-muted-foreground">
                      Schedule an appointment with a qualified dentist for professional evaluation
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-semibold text-primary">2</span>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Share This Report</p>
                    <p className="text-sm text-muted-foreground">
                      Bring this AI analysis report to your dentist appointment
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-semibold text-primary">3</span>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Follow Treatment Plan</p>
                    <p className="text-sm text-muted-foreground">
                      Follow your dentist's recommendations for treatment and follow-up
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <Button onClick={() => navigate("/dashboard/doctors")}>
                  Find Dentists Near You
                </Button>
                <Button variant="outline" onClick={() => navigate("/dashboard/appointments")}>
                  Book Appointment
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
