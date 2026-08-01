import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getSpecialistRecommendation(findings: any[]) {
  if (!findings || !Array.isArray(findings) || findings.length === 0) {
    return "Recommendation: Consult a General Dentist for a routine comprehensive examination.";
  }

  // Helper to get class name from finding
  const getClassName = (finding: any): string => {
    if (typeof finding === "string") return finding.toLowerCase();
    if (finding.class) return finding.class.toLowerCase();
    if (finding.issue) return finding.issue.toLowerCase();
    return "";
  };

  for (const finding of findings) {
    const className = getClassName(finding);
    if (className.includes("impacted")) {
      return "Recommendation: Consult an Oral and Maxillofacial Surgeon or Orthodontist to evaluate the impacted tooth.";
    }
  }

  for (const finding of findings) {
    const className = getClassName(finding);
    if (
      className.includes("periapical") ||
      className.includes("root canal") ||
      className.includes("root piece") ||
      className.includes("retained root")
    ) {
      return "Recommendation: Consult an Endodontist to evaluate for potential root canal therapy or extraction.";
    }
  }

  for (const finding of findings) {
    const className = getClassName(finding);
    if (className.includes("missing")) {
      return "Recommendation: Consult a Prosthodontist or General Dentist to discuss tooth replacement options like implants or bridges.";
    }
  }

  for (const finding of findings) {
    const className = getClassName(finding);
    if (
      className.includes("caries") ||
      className.includes("cavity") ||
      className.includes("decay") ||
      className.includes("crown") ||
      className.includes("filling")
    ) {
      return "Recommendation: Consult a General Dentist for treatment and restorative care.";
    }
  }

  return "Recommendation: Consult a General Dentist for a routine comprehensive examination.";
}
