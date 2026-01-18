// Types for X-ray analysis data

export interface XrayDetection {
  box: [number, number, number, number]; // [x1, y1, x2, y2]
  confidence: number;
  class: string;
}

export interface XrayAnalysisResult {
  id: string;
  filename: string;
  status: string;
  findings: XrayDetection[];
  total_issues: number;
  severity_level: "Healthy" | "Mild" | "Severe";
  recommendation: string;
  timestamp: string;
  imageUrl: string; // Base64 or URL to image
}

export interface UserStats {
  totalXrays: number;
  healthScore: number;
  reportsReady: number;
  nextCheckup?: string;
}
