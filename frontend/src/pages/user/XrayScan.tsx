import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { analyzeXray } from "../../lib/api";
import { useState, useRef } from "react";
import { useXrayData } from "@/hooks/useXrayData";
import { XrayAnalysisResult } from "@/types/xray";
import { triggerRefreshReportsCount } from "@/components/ui/UserSidebar";
import {
  Upload,
  FileText,
  Stethoscope,
  Calendar,
  Activity,
  TrendingUp,
  FileImage,
  Clock,
  CheckCircle,
  ArrowRight,
  Bell,
  Search,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function XrayScan() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { addReport } = useXrayData();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);

    try {
      console.log("📤 Sending X-ray to AI...");
      
      const reader = new FileReader();
      const imageUrl = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      
      const result = await analyzeXray(file);
      
      console.log("✅ X-ray AI Response:", result);
      triggerRefreshReportsCount();
      navigate(`/dashboard/reports/${result.report_id}`);
      
    } catch (error) {
      console.error("X-ray Analysis error:", error);
      alert("❌ Error: Could not connect to Smilo Backend. Is the backend running on port 8000?");
    } finally {
      setIsAnalyzing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clinical OPG X-ray Analysis</h1>
        <Button variant="ghost" onClick={() => navigate("/dashboard")}>
          <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
          Back to Dashboard
        </Button>
      </div>

      <Card className="gradient-primary">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold text-primary-foreground mb-2">
                Upload Panoramic X-ray
              </h2>
              <p className="text-primary-foreground/80 max-w-md">
                Get instant AI-powered analysis of your dental X-rays. Our advanced deep learning model detects caries and segments teeth with high accuracy.
              </p>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*"
                onChange={handleUpload}
                disabled={isAnalyzing}
                className="hidden"
              />
              <Button
                size="lg"
                className="bg-background text-primary hover:bg-background/90 px-8 py-6 text-lg"
                onClick={triggerFileInput}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 w-5 h-5" />
                    Upload X-ray
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
