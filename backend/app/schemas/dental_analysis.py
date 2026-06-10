from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class Severity(str, Enum):
    NONE = "none"
    MILD = "mild"
    MODERATE = "moderate"
    SEVERE = "severe"
    UNKNOWN = "unknown"


class OralHygieneRating(str, Enum):
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"
    UNKNOWN = "unknown"


class DentalFinding(BaseModel):
    issue: str
    detected: bool
    confidence: Optional[int] = Field(None, ge=0, le=100)
    severity: Severity = Severity.UNKNOWN
    description: Optional[str] = None
    prevention: Optional[List[str]] = None
    suggested_care: Optional[List[str]] = None


class DentalAnalysisResponse(BaseModel):
    success: bool
    is_dental_image: bool
    message: Optional[str] = None
    summary: Optional[str] = None
    findings: List[DentalFinding] = Field(default_factory=list)
    additional_observations: Optional[List[str]] = None
    overall_oral_hygiene: OralHygieneRating = OralHygieneRating.UNKNOWN
    recommendations: List[str] = Field(default_factory=list)
    medical_disclaimer: str = "AI analysis is not a diagnosis. Please consult a licensed dentist for professional evaluation."


# --- Dental Report Analysis Schemas ---

class PatientInfo(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    report_date: Optional[str] = None
    clinic_name: Optional[str] = None
    dentist_name: Optional[str] = None
    report_type: Optional[str] = None


class Diagnosis(BaseModel):
    condition: str
    status: Optional[str] = None
    notes: Optional[str] = None


class ToothFinding(BaseModel):
    tooth_number: Optional[str] = None
    finding: Optional[str] = None
    status: Optional[str] = None


class GumFinding(BaseModel):
    issue: Optional[str] = None
    severity: Optional[str] = None
    details: Optional[str] = None


class XrayFinding(BaseModel):
    observation: Optional[str] = None
    location: Optional[str] = None
    severity: Optional[str] = None


class RiskAssessment(BaseModel):
    tooth_decay_risk: Optional[str] = "Unknown"
    gum_disease_risk: Optional[str] = "Unknown"
    tooth_loss_risk: Optional[str] = "Unknown"


class SimplifiedExplanation(BaseModel):
    medical_term: Optional[str] = None
    simple_explanation: Optional[str] = None


class DentalReportResponse(BaseModel):
    success: bool
    document_type: str
    message: Optional[str] = None
    patient_info: Optional[PatientInfo] = None
    diagnoses: List[Diagnosis] = Field(default_factory=list)
    tooth_findings: List[ToothFinding] = Field(default_factory=list)
    gum_findings: List[GumFinding] = Field(default_factory=list)
    xray_findings: List[XrayFinding] = Field(default_factory=list)
    existing_dental_work: List[str] = Field(default_factory=list)
    recommended_treatments: List[str] = Field(default_factory=list)
    risk_assessment: Optional[RiskAssessment] = None
    precautions: List[str] = Field(default_factory=list)
    patient_suggestions: List[str] = Field(default_factory=list)
    simplified_explanations: List[SimplifiedExplanation] = Field(default_factory=list)
    patient_summary: Optional[str] = None
