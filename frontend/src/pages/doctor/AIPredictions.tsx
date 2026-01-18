import { motion } from "framer-motion";
import {
  Brain,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export default function AIPredictions() {
  const stats = [
    {
      label: "Total AI Predictions",
      value: "1,247",
      icon: Brain,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Validation Rate",
      value: "92.3%",
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Agreement Rate",
      value: "89.7%",
      icon: CheckCircle,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Disagreement Rate",
      value: "10.3%",
      icon: XCircle,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  const predictions = [
    {
      id: "12567",
      aiPrediction: "Dental Caries",
      doctorDiagnosis: "Dental Caries",
      agreement: "Match",
      confidence: "87.3%",
      reviewDate: "Jan 18, 2026",
    },
    {
      id: "12568",
      aiPrediction: "Healthy",
      doctorDiagnosis: "Healthy",
      agreement: "Match",
      confidence: "92.1%",
      reviewDate: "Jan 18, 2026",
    },
    {
      id: "12400",
      aiPrediction: "Dental Caries",
      doctorDiagnosis: "Healthy",
      agreement: "Mismatch",
      confidence: "68.5%",
      reviewDate: "Jan 17, 2026",
    },
    {
      id: "12401",
      aiPrediction: "Healthy",
      doctorDiagnosis: "Dental Caries",
      agreement: "Mismatch",
      confidence: "71.2%",
      reviewDate: "Jan 16, 2026",
    },
  ];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">AI Predictions Analytics</h1>
              <p className="text-sm text-muted-foreground">
                Monitor AI model performance and accuracy metrics
              </p>
            </div>
            <Select defaultValue="30days">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <div className="p-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Insights */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Model Strengths</CardTitle>
              <CardDescription>Areas where AI performs exceptionally well</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Severe Caries Detection</p>
                  <p className="text-sm text-muted-foreground">
                    96% agreement rate with high confidence scores
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Healthy Teeth Identification</p>
                  <p className="text-sm text-muted-foreground">
                    94% accuracy in confirming healthy dental status
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Areas for Improvement</CardTitle>
              <CardDescription>Challenges identified in AI predictions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Mild Caries Cases</p>
                  <p className="text-sm text-muted-foreground">
                    68% agreement - more training data needed
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Edge Cases</p>
                  <p className="text-sm text-muted-foreground">
                    Lower confidence scores in ambiguous X-rays
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Predictions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Prediction Validation History</CardTitle>
            <CardDescription>
              Comparison between AI predictions and your professional diagnosis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case ID</TableHead>
                  <TableHead>AI Prediction</TableHead>
                  <TableHead>Your Diagnosis</TableHead>
                  <TableHead>Agreement</TableHead>
                  <TableHead>AI Confidence</TableHead>
                  <TableHead>Review Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {predictions.map((pred) => (
                  <TableRow key={pred.id}>
                    <TableCell className="font-medium">#{pred.id}</TableCell>
                    <TableCell>{pred.aiPrediction}</TableCell>
                    <TableCell>{pred.doctorDiagnosis}</TableCell>
                    <TableCell>
                      <Badge
                        variant={pred.agreement === "Match" ? "secondary" : "destructive"}
                        className="flex items-center gap-1 w-fit"
                      >
                        {pred.agreement === "Match" ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {pred.agreement}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-primary">
                      {pred.confidence}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {pred.reviewDate}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
