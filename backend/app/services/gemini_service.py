import json
import logging
import asyncio
import io
import traceback
from PIL import Image
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from app.core.config import GEMINI_API_KEY, GEMINI_MODEL, MAX_IMAGE_SIZE_MB
from app.schemas.dental_analysis import DentalAnalysisResponse, Severity, OralHygieneRating

logger = logging.getLogger(__name__)

try:
    from google import genai
    from google.genai import types
    GOOGLE_GENAI_AVAILABLE = True
except ImportError:
    GOOGLE_GENAI_AVAILABLE = False
    logger.warning("google-genai SDK not installed. GeminiService will not be available.")

class GeminiService:
    def __init__(self):
        if not GOOGLE_GENAI_AVAILABLE:
            raise Exception("google-genai SDK is not installed.")
        try:
            self.client = genai.Client(api_key=GEMINI_API_KEY)
            self.model_id = GEMINI_MODEL
            logger.info(f"GeminiService successfully initialized with model: {self.model_id}")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini Client: {str(e)}")
            raise e

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type(Exception),
        reraise=True
    )
    async def _call_gemini_api(self, prompt: str, image: Image.Image) -> str:
        """
        Internal method to call Gemini with retry logic and detailed error reporting.
        """
        try:
            # The SDK handles model name resolution, but we can try different variations if needed
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=[prompt, image]
            )
            
            if not response or not response.text:
                raise Exception("The AI returned an empty response. Please try again.")
            
            return response.text
            
        except Exception as e:
            error_details = str(e)
            logger.error(f"Gemini API Error: {error_details}")
            # If we get a 404, it might be the model name, but we'll let retry handle it
            raise e

    async def analyze_dental_image(self, image_content: bytes) -> DentalAnalysisResponse:
        """
        Analyzes a dental image with a high-precision prompt and structured output.
        """
        if not GOOGLE_GENAI_AVAILABLE:
            return DentalAnalysisResponse(
                success=False,
                is_dental_image=False,
                message="Gemini service not available: google-genai SDK not installed.",
                summary="AI analysis service unavailable.",
                findings=[],
                additional_observations=[],
                overall_oral_hygiene=OralHygieneRating.UNKNOWN,
                recommendations=[]
            )
        try:
            # Validate and open image
            image = Image.open(io.BytesIO(image_content))

            system_prompt = f"""
            You are a world-class dental screening AI assistant. Your task is to perform a meticulous visual analysis of the provided dental image.
            The user is specifically looking for high-accuracy detection of dental flaws, along with prevention and suggested care tips.

            DIAGNOSTIC GUIDELINES:
            1. **IDENTIFICATION**: Confirm if the image contains human teeth, gums, or oral cavity. If not, set `is_dental_image: false`.
            2. **DETECTION**: Analyze for:
               - **CAVITIES**: Look for dark spots, holes, or structural decay (especially large visible cavities).
               - **GUM HEALTH**: Recession, inflammation, redness, or swelling.
               - **HYGIENE**: Plaque, tartar, staining (yellow/brown).
               - **ALIGNMENT**: Crowding, gaps, or rotated teeth.
               - **WEAR**: Chipped teeth, cracked enamel, or bruxism signs.
            3. **PREVENTION & CARE**: For EVERY detected issue, you MUST provide:
               - `prevention`: 2-3 specific, actionable steps to prevent this issue from occurring or worsening.
               - `suggested_care`: 2-3 professional or at-home care tips to address the flaw.
            4. **STRUCTURE**: Return ONLY a valid JSON object. No markdown, no backticks, no preamble.

            REQUIRED JSON FORMAT:
            {{
                "success": true,
                "is_dental_image": true,
                "summary": "Meticulous summary of overall oral health observations",
                "findings": [
                    {{
                        "issue": "Specific Issue Name",
                        "detected": true,
                        "confidence": 95,
                        "severity": "severe",
                        "description": "Visual evidence description",
                        "prevention": ["Prevention step 1", "Prevention step 2"],
                        "suggested_care": ["Care tip 1", "Care tip 2"]
                    }}
                ],
                "additional_observations": [],
                "overall_oral_hygiene": "poor",
                "recommendations": ["Recommendation 1", "Recommendation 2"],
                "medical_disclaimer": "AI analysis is not a diagnosis. Please consult a licensed dentist for professional evaluation."
            }}

            Valid severity values: {", ".join([s.value for s in Severity])}
            Valid oral_hygiene_rating values: {", ".join([r.value for r in OralHygieneRating])}
            """

            # Call the API with retries
            try:
                raw_text = await self._call_gemini_api(system_prompt, image)
            except Exception as e:
                error_msg = str(e)
                friendly_error = "An error occurred during AI analysis."
                
                if "429" in error_msg:
                    friendly_error = "API Quota exceeded. Please wait a moment before trying again."
                elif "404" in error_msg:
                    friendly_error = f"Model '{self.model_id}' is currently unavailable. Please contact support."
                elif "401" in error_msg or "403" in error_msg:
                    friendly_error = "Authentication failed. Please check the API key."
                
                return DentalAnalysisResponse(
                    success=False,
                    is_dental_image=False,
                    message=f"{friendly_error} ({error_msg})",
                    summary="AI analysis error.",
                    findings=[],
                    additional_observations=[],
                    overall_oral_hygiene=OralHygieneRating.UNKNOWN,
                    recommendations=[]
                )

            # Extract and parse JSON
            cleaned_text = raw_text.strip()
            if "```" in cleaned_text:
                parts = cleaned_text.split("```")
                for part in parts:
                    if part.strip().startswith("{") or part.strip().startswith("json"):
                        cleaned_text = part.replace("json", "", 1).strip()
                        break
            
            try:
                analysis_dict = json.loads(cleaned_text)
            except json.JSONDecodeError:
                logger.error(f"Failed to parse AI JSON response: {cleaned_text}")
                raise Exception("The AI provided a malformed response. Please try again.")

            # Check if it's actually a dental image
            if not analysis_dict.get("is_dental_image", False):
                return DentalAnalysisResponse(
                    success=False,
                    is_dental_image=False,
                    message="This image does not appear to be a dental or oral photograph.",
                    summary="Non-dental image detected.",
                    findings=[],
                    additional_observations=[],
                    overall_oral_hygiene=OralHygieneRating.UNKNOWN,
                    recommendations=["Please upload a clear photo of your teeth or gums."]
                )

            # Final validation against Pydantic model
            return DentalAnalysisResponse(**analysis_dict)

        except Exception as e:
            logger.error(f"Critical Service Error: {str(e)}\n{traceback.format_exc()}")
            return DentalAnalysisResponse(
                success=False,
                is_dental_image=False,
                message=f"System error: {str(e)}",
                summary="A critical error occurred in the analysis service.",
                findings=[],
                additional_observations=[],
                overall_oral_hygiene=OralHygieneRating.UNKNOWN,
                recommendations=[]
            )

try:
    gemini_service = GeminiService()
except Exception as e:
    logger.warning(f"Failed to initialize GeminiService: {e}")
    gemini_service = None
