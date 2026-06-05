import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { XrayAnalysisResult, UserStats } from "@/types/xray";

interface XrayDataContextType {
  reports: XrayAnalysisResult[];
  addReport: (report: XrayAnalysisResult) => void;
  getReport: (id: string) => XrayAnalysisResult | undefined;
  deleteReport: (id: string) => void;
  stats: UserStats;
}

const XrayDataContext = createContext<XrayDataContextType | undefined>(undefined);

export const XrayDataProvider = ({ children }: { children: ReactNode }) => {
  // Clear old localStorage data to fix 431 error
  useEffect(() => {
    const stored = localStorage.getItem("smilo_xray_reports");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Clean existing reports by removing large image fields
          const cleaned = parsed.map((r: any) => {
            const { original_image, segmented_image, imageUrl, ...rest } = r;
            return rest;
          });
          localStorage.setItem("smilo_xray_reports", JSON.stringify(cleaned));
        }
      } catch (e) {
        localStorage.removeItem("smilo_xray_reports");
      }
    }
  }, []);

  const [reports, setReports] = useState<XrayAnalysisResult[]>(() => {
    // Load from localStorage on init
    const stored = localStorage.getItem("smilo_xray_reports");
    return stored ? JSON.parse(stored) : [];
  });

  // Save to localStorage whenever reports change (without large image fields)
  useEffect(() => {
    const cleanedReports = reports.map(report => {
      const { original_image, segmented_image, imageUrl, ...rest } = report;
      return rest;
    });
    localStorage.setItem("smilo_xray_reports", JSON.stringify(cleanedReports));
  }, [reports]);

  const addReport = (report: XrayAnalysisResult) => {
    setReports((prev) => [report, ...prev]);
  };

  const getReport = (id: string) => {
    return reports.find((r) => r.id === id);
  };

  const deleteReport = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  // Calculate stats from reports
  const stats: UserStats = {
    totalXrays: reports.length,
    healthScore: reports.length > 0 
      ? Math.round(
          (reports.filter((r) => r.severity_level === "Healthy").length / reports.length) * 100
        )
      : 100,
    reportsReady: reports.filter((r) => r.status === "success").length,
  };

  return (
    <XrayDataContext.Provider value={{ reports, addReport, getReport, deleteReport, stats }}>
      {children}
    </XrayDataContext.Provider>
  );
};

export const useXrayData = () => {
  const context = useContext(XrayDataContext);
  if (!context) {
    throw new Error("useXrayData must be used within XrayDataProvider");
  }
  return context;
};
