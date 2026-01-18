import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useXrayData } from "@/hooks/useXrayData";
import {
  FileImage,
  Calendar,
  TrendingUp,
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function UserReports() {
  const navigate = useNavigate();
  const { reports, deleteReport } = useXrayData();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");

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

  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterSeverity === "all" || report.severity_level === filterSeverity;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this report?")) {
      deleteReport(id);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">My Reports</h1>
              <p className="text-sm text-muted-foreground">
                View and manage all your X-ray analysis reports
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Reports</p>
                  <p className="text-3xl font-bold">{reports.length}</p>
                </div>
                <FileImage className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Healthy Scans</p>
                  <p className="text-3xl font-bold">
                    {reports.filter((r) => r.severity_level === "Healthy").length}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Needs Attention</p>
                  <p className="text-3xl font-bold">
                    {reports.filter((r) => r.severity_level !== "Healthy").length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search reports..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterSeverity === "all" ? "default" : "outline"}
                  onClick={() => setFilterSeverity("all")}
                >
                  All
                </Button>
                <Button
                  variant={filterSeverity === "Healthy" ? "default" : "outline"}
                  onClick={() => setFilterSeverity("Healthy")}
                >
                  Healthy
                </Button>
                <Button
                  variant={filterSeverity === "Mild" ? "default" : "outline"}
                  onClick={() => setFilterSeverity("Mild")}
                >
                  Mild
                </Button>
                <Button
                  variant={filterSeverity === "Severe" ? "default" : "outline"}
                  onClick={() => setFilterSeverity("Severe")}
                >
                  Severe
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports List */}
        {filteredReports.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileImage className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No reports found</h3>
              <p className="text-sm text-muted-foreground mb-6">
                {searchQuery || filterSeverity !== "all"
                  ? "Try adjusting your filters"
                  : "Upload your first X-ray to get started"}
              </p>
              <Button onClick={() => navigate("/dashboard")}>
                Upload X-ray
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredReports.map((report) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ x: 4 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                      {/* Image Preview */}
                      <div className="w-32 h-32 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                        {report.imageUrl ? (
                          <img
                            src={report.imageUrl}
                            alt={report.filename}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileImage className="w-12 h-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Report Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg mb-1">{report.filename}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {new Date(report.timestamp).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          <Badge className={getSeverityColor(report.severity_level)}>
                            {report.severity_level}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Issues Found</p>
                            <p className="text-xl font-semibold">{report.total_issues}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Detections</p>
                            <p className="text-xl font-semibold">{report.findings.length}</p>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-4">
                          {report.recommendation}
                        </p>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => navigate(`/dashboard/reports/${report.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(report.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
