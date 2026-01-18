import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Brain,
  AlertCircle,
  Clock,
  Search,
  Filter,
  ChevronRight,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PatientReports() {
  const navigate = useNavigate();

  const reports = [
    {
      id: "12567",
      patientId: "#12567",
      uploadDate: "Jan 18, 2026 10:30 AM",
      aiPrediction: "Dental Caries",
      confidence: "87.3%",
      severity: "Moderate",
      status: "Pending Review",
    },
    {
      id: "12568",
      patientId: "#12568",
      uploadDate: "Jan 18, 2026 09:15 AM",
      aiPrediction: "Healthy",
      confidence: "92.1%",
      severity: "None",
      status: "Pending Review",
    },
    {
      id: "12569",
      patientId: "#12569",
      uploadDate: "Jan 17, 2026 04:45 PM",
      aiPrediction: "Dental Caries",
      confidence: "78.5%",
      severity: "Mild",
      status: "Under Review",
    },
    {
      id: "12570",
      patientId: "#12570",
      uploadDate: "Jan 17, 2026 02:20 PM",
      aiPrediction: "Dental Caries",
      confidence: "94.2%",
      severity: "Severe",
      status: "Pending Review",
    },
    {
      id: "12571",
      patientId: "#12571",
      uploadDate: "Jan 17, 2026 11:10 AM",
      aiPrediction: "Healthy",
      confidence: "89.7%",
      severity: "None",
      status: "Pending Review",
    },
  ];

  const reviewedReports = [
    {
      id: "12400",
      patientId: "#12400",
      uploadDate: "Jan 16, 2026",
      aiPrediction: "Dental Caries",
      doctorDiagnosis: "Confirmed - Caries",
      reviewDate: "Jan 17, 2026",
      status: "Completed",
    },
    {
      id: "12401",
      patientId: "#12401",
      uploadDate: "Jan 15, 2026",
      aiPrediction: "Healthy",
      doctorDiagnosis: "Confirmed - Healthy",
      reviewDate: "Jan 16, 2026",
      status: "Completed",
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Severe":
        return "destructive";
      case "Moderate":
        return "default";
      case "Mild":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending Review":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "Under Review":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "Completed":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Patient Reports</h1>
              <p className="text-sm text-muted-foreground">
                Review and validate AI-analyzed X-ray reports
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search by Patient ID..." className="pl-9 w-64" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="mild">Mild</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-8">
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="pending" className="relative">
              Pending Review
              <Badge className="ml-2 h-5 min-w-[20px]" variant="destructive">
                5
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
            <TabsTrigger value="all">All Cases</TabsTrigger>
          </TabsList>

          {/* Pending Reports Tab */}
          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Reports ({reports.length})</CardTitle>
                <CardDescription>
                  These reports require your professional review and validation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient ID</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead>AI Prediction</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow
                        key={report.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() =>
                          navigate(`/doctor-dashboard/reports/${report.id}`)
                        }
                      >
                        <TableCell className="font-medium">{report.patientId}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {report.uploadDate}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Brain className="w-4 h-4 text-purple-500" />
                            <span>{report.aiPrediction}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-primary">
                            {report.confidence}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getSeverityColor(report.severity)}>
                            {report.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(report.status)} variant="outline">
                            {report.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviewed Reports Tab */}
          <TabsContent value="reviewed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reviewed Reports ({reviewedReports.length})</CardTitle>
                <CardDescription>
                  Previously reviewed and completed cases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient ID</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead>AI Prediction</TableHead>
                      <TableHead>Your Diagnosis</TableHead>
                      <TableHead>Review Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviewedReports.map((report) => (
                      <TableRow
                        key={report.id}
                        className="cursor-pointer hover:bg-muted/50"
                      >
                        <TableCell className="font-medium">{report.patientId}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {report.uploadDate}
                        </TableCell>
                        <TableCell>{report.aiPrediction}</TableCell>
                        <TableCell>{report.doctorDiagnosis}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {report.reviewDate}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(report.status)} variant="outline">
                            {report.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Cases Tab */}
          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Cases</CardTitle>
                <CardDescription>Complete history of all patient reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Combined view of all cases will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
