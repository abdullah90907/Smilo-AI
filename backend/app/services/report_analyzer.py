import json
import logging
import io
import re
import os
import base64
import traceback
import pdfplumber
import fitz  # PyMuPDF
from PIL import Image
from docx import Document
from groq import Groq
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from app.core.config import GROQ_API_KEY, GROQ_MODEL, GROQ_VISION_MODEL
from app.schemas.dental_analysis import (
    DentalReportResponse,
    PatientInfo,
    Diagnosis,
    ToothFinding,
    GumFinding,
    XrayFinding,
    RiskAssessment,
    SimplifiedExplanation,
    Severity
)

logger = logging.getLogger(__name__)

class DentalReportService:
    def __init__(self):
        try:
            self.groq_client = Groq(api_key=GROQ_API_KEY)
            self.analysis_model = GROQ_MODEL
            self.vision_model = GROQ_VISION_MODEL
            logger.info(f"DentalReportService initialized with analysis model: {self.analysis_model} and vision model: {self.vision_model}")
        except Exception as e:
            logger.error(f"Failed to initialize Groq client: {str(e)}")
            raise e

    # --- Robust Extraction Logic ---

    def extract_text_from_pdf(self, pdf_bytes: bytes) -> str:
        """Extracts text from PDF using pdfplumber (text-based) or Groq Vision (scanned)."""
        text = ""
        try:
            with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            
            # If text is too short, it might be a scanned PDF
            if len(text.strip()) < 50:
                logger.info("PDF appears to be scanned, falling back to Groq Vision OCR...")
                return self.extract_text_from_pdf_via_vision(pdf_bytes)
            
            return text
        except Exception as e:
            logger.warning(f"pdfplumber failed: {str(e)}. Trying Groq Vision fallback...")
            return self.extract_text_from_pdf_via_vision(pdf_bytes)

    def extract_text_from_pdf_via_vision(self, pdf_bytes: bytes) -> str:
        """Converts PDF pages to images and uses Groq Vision for OCR."""
        full_text = ""
        try:
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            for page_index in range(len(doc)):
                page = doc.load_page(page_index)
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # Increase resolution
                img_bytes = pix.tobytes("png")
                
                page_text = self.extract_text_via_groq_vision(img_bytes)
                if page_text:
                    full_text += f"--- Page {page_index + 1} ---\n{page_text}\n"
            doc.close()
            return full_text
        except Exception as e:
            logger.error(f"PDF Vision OCR failed: {str(e)}")
            return ""

    def extract_text_from_docx(self, docx_bytes: bytes) -> str:
        """Extracts text from DOCX."""
        try:
            doc = Document(io.BytesIO(docx_bytes))
            return "\n".join([para.text for para in doc.paragraphs])
        except Exception as e:
            logger.error(f"DOCX extraction failed: {str(e)}")
            return ""

    def extract_text_via_groq_vision(self, image_bytes: bytes) -> str:
        """Uses Groq Vision model for OCR."""
        try:
            base64_image = base64.b64encode(image_bytes).decode('utf-8')
            
            response = self.groq_client.chat.completions.create(
                model=self.vision_model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": "Extract all text from this dental report image exactly as it appears. Include all patient details, findings, and dates. Do not summarize or add any commentary."},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/png;base64,{base64_image}",
                                },
                            },
                        ],
                    }
                ],
                temperature=0.0,
                max_tokens=2048,
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Groq Vision OCR failed: {str(e)}")
            return ""

    def clean_text(self, text: str) -> str:
        """Cleans noise and normalizes text."""
        if not text: return ""
        text = re.sub(r'\n\s*\n', '\n', text)
        text = "".join(char for char in text if char.isprintable() or char in "\n\r\t")
        text = re.sub(r' +', ' ', text)
        return text.strip()

    # --- Groq Analysis Logic ---

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type(Exception),
        reraise=True
    )
    async def _call_groq_analysis(self, system_prompt: str, user_content: str) -> str:
        """Calls Groq Llama-3.3-70b for medical reasoning."""
        try:
            response = self.groq_client.chat.completions.create(
                model=self.analysis_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content}
                ],
                response_format={"type": "json_object"},
                temperature=0.1
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Groq API Error: {str(e)}")
            raise e

    async def analyze_dental_report(self, file_content: bytes, filename: str, mime_type: str) -> DentalReportResponse:
        """Main entry point for report analysis."""
        try:
            extracted_text = ""
            ext = filename.split('.')[-1].lower()

            # 1. Extraction Strategy
            if ext == 'pdf' or mime_type == 'application/pdf':
                extracted_text = self.extract_text_from_pdf(file_content)
            elif ext in ['docx', 'doc']:
                extracted_text = self.extract_text_from_docx(file_content)
            elif ext in ['jpg', 'jpeg', 'png', 'webp'] or mime_type.startswith('image/'):
                extracted_text = self.extract_text_via_groq_vision(file_content)
            else:
                raise Exception(f"Unsupported format: {ext}")

            # 2. Clean
            cleaned_text = self.clean_text(extracted_text)
            
            if not cleaned_text or len(cleaned_text) < 20:
                return DentalReportResponse(
                    success=False,
                    document_type="unsupported",
                    message="Could not read the document content. Please ensure it is a clear dental report.",
                    patient_summary="Failed to read document."
                )

            # 3. Llama Analysis (Groq)
            system_prompt = """
            You are a senior dental consultant. Analyze the provided text from a document.
            
            CRITICAL RULE: 
            First, determine if the document is related to dentistry, orthodontics, or oral health. 
            If the document is NOT dental-related (e.g., a bank statement, grocery receipt, or general medical report not involving the mouth), you MUST set "document_type" to "unsupported" and provide a brief explanation in "message".
            
            TASK:
            1. Classify the document (dental_report, orthodontic_report, periodontal_report, dental_xray_report, or unsupported).
            2. Extract details into a valid JSON object matching this structure:
            {
                "document_type": "dental_report",
                "patient_info": {"name": "...", "age": 0, "gender": "...", "report_date": "...", "clinic_name": "...", "dentist_name": "...", "report_type": "..."},
                "diagnoses": [{"condition": "...", "status": "...", "notes": "..."}],
                "tooth_findings": [{"tooth_number": "...", "finding": "...", "status": "healthy"}],
                "gum_findings": [{"issue": "...", "severity": "none", "details": "..."}],
                "xray_findings": [{"observation": "...", "location": "...", "severity": "none"}],
                "existing_dental_work": ["filling on tooth 14", "crown on 18"],
                "recommended_treatments": ["scaling", "filling"],
                "risk_assessment": {"tooth_decay_risk": "Low", "gum_disease_risk": "Low", "tooth_loss_risk": "Low"},
                "precautions": ["Avoid very hot/cold drinks", "Brush gently"],
                "patient_suggestions": ["Try to floss once a day", "Consider a soft-bristle toothbrush", "Schedule a follow-up in 6 months"],
                "simplified_explanations": [{"medical_term": "Caries", "simple_explanation": "Tooth decay or a cavity"}],
                "patient_summary": "..."
            }
            
            IMPORTANT:
            - "patient_suggestions": Provide 3-5 easy-to-understand, actionable suggestions for the patient based on the findings.
            - Valid tooth status: ["healthy", "decayed", "filled", "crowned", "missing", "root_canal", "implant", "extraction_recommended", "mobility"]
            - Valid severity: ["none", "mild", "moderate", "severe"]
            - Valid risk values: ["Low", "Moderate", "High", "Unknown"]
            - Return ONLY a valid JSON object.
            - If a field is unknown, use null for strings/numbers and [] for lists. Do not omit required fields.
            """
            
            analysis_json = await self._call_groq_analysis(system_prompt, cleaned_text)
            
            # 4. Parse and Validate
            try:
                # Clean any potential markdown wrapping
                if "```json" in analysis_json:
                    analysis_json = analysis_json.split("```json")[1].split("```")[0].strip()
                elif "```" in analysis_json:
                    analysis_json = analysis_json.split("```")[1].split("```")[0].strip()
                
                analysis_dict = json.loads(analysis_json)
                
                # Pre-processing to handle casing and spaces for Literal/Enum fields
                if analysis_dict.get("tooth_findings"):
                    for finding in analysis_dict["tooth_findings"]:
                        if finding.get("status"):
                            # "Root canal" -> "root_canal", "Decayed" -> "decayed"
                            status = finding["status"].lower().replace(" ", "_")
                            finding["status"] = status

                if analysis_dict.get("gum_findings"):
                    for gum in analysis_dict["gum_findings"]:
                        if gum.get("severity"):
                            gum["severity"] = gum["severity"].lower()

                if analysis_dict.get("xray_findings"):
                    for xray in analysis_dict["xray_findings"]:
                        if xray.get("severity"):
                            xray["severity"] = xray["severity"].lower()

                # Pre-processing to handle nulls that should be defaults
                if not analysis_dict.get("risk_assessment"):
                    analysis_dict["risk_assessment"] = {}
                
                ra = analysis_dict["risk_assessment"]
                for risk in ["tooth_decay_risk", "gum_disease_risk", "tooth_loss_risk"]:
                    if ra.get(risk) is None:
                        ra[risk] = "Unknown"

                if analysis_dict.get("document_type") == "unsupported":
                    return DentalReportResponse(
                        success=False,
                        document_type="unsupported",
                        message=analysis_dict.get("message", "This document does not appear to be a dental report."),
                        patient_summary="Non-dental document detected."
                    )
                
                analysis_dict["success"] = True
                return DentalReportResponse(**analysis_dict)
            except (json.JSONDecodeError, Exception) as e:
                logger.error(f"Parsing error: {str(e)}\nRaw JSON: {analysis_json}")
                # Fallback to a partial response if parsing fails but we have success
                return DentalReportResponse(
                    success=False,
                    document_type="error",
                    message=f"Failed to parse analysis results: {str(e)}",
                    patient_summary="The analysis was performed but the results were in an invalid format."
                )

        except Exception as e:
            logger.error(f"Critical error: {str(e)}\n{traceback.format_exc()}")
            return DentalReportResponse(
                success=False,
                document_type="error",
                message=f"Analysis failed: {str(e)}",
                patient_summary="Error processing document."
            )

groq_service = DentalReportService()
