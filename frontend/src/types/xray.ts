// Types for X-ray analysis data

export interface XrayDetection {
  box: [number, number, number, number]; // [x1, y1, x2, y2]
  confidence: number;
  class: string;
}

export interface ModelsUsed {
  segmentation: boolean;
  caries_detection: boolean;
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
  imageUrl?: string; // Base64 original image (backward compatible)
  original_image?: string; // Base64 original image (backward compatible)
  segmented_image?: string; // Base64 segmented image (backward compatible)
  case_id?: string;
  overlay_url?: string;
  visual_extracted_url?: string;
  original_image_url?: string;
  caries_detection_url?: string;
  models_used?: ModelsUsed;
}

export interface UserStats {
  totalXrays: number;
  healthScore: number;
  reportsReady: number;
  nextCheckup?: string;
}
