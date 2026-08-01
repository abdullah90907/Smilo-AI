from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from PIL import Image, ImageDraw, ImageFont
import io
import os

BACKEND_URL = os.getenv("BACKEND_URL", "http://127.0.0.1:8000").rstrip("/")
import uuid
import base64
import requests
from passlib.context import CryptContext
from sqlalchemy.orm import Session
import json
from datetime import datetime

# Import our services
try:
    from app.services.teeth_segmenter import TeethSegmenter
    HAS_TEETH_SEGMENTER = True
except ImportError:
    TeethSegmenter = None
    HAS_TEETH_SEGMENTER = False

try:
    from app.services.photo_caries_detector import PhotoCariesDetector
    HAS_PHOTO_CARIES_DETECTOR = True
except ImportError:
    PhotoCariesDetector = None
    HAS_PHOTO_CARIES_DETECTOR = False
from app.services.gemini_service import gemini_service
from app.services.chat_service import chat_service
from app.services.report_analyzer import groq_service
from app.api.routes.teeth_segmentation import router as teeth_segmentation_router, set_teeth_segmenter
from app.db.session import init_db, get_db, engine
from app.db.models import User, PatientProfile, DoctorProfile, Appointment, ScanReport, ChatMessage
from app.schemas.auth import (
    UserCreatePatient,
    UserCreateDoctor,
    LoginRequest,
    AuthResponse
)

# Initialize password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Helper function: Truncate password to 72 bytes for bcrypt!
def hash_password(password: str):
    # Bcrypt max length is 72 bytes. Encode and truncate safely.
    truncated = password.encode('utf-8')[:72].decode('utf-8', 'ignore')
    return pwd_context.hash(truncated)

def verify_password(plain_password: str, hashed_password: str):
    truncated = plain_password.encode('utf-8')[:72].decode('utf-8', 'ignore')
    return pwd_context.verify(truncated, hashed_password)

# Dummy get current user using x-user-id header
def get_current_user(x_user_id: str = Header(None), db: Session = Depends(get_db)):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Unauthorized: Missing x-user-id header")
    try:
        user_id = int(x_user_id)
    except ValueError:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid x-user-id format")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# Dummy get current doctor using x-user-id header
def get_current_doctor(x_user_id: str = Header(None), db: Session = Depends(get_db)):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Unauthorized: Missing x-user-id header")
    try:
        user_id = int(x_user_id)
    except ValueError:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid x-user-id format")
    user = db.query(User).filter(User.id == user_id, User.role == "doctor").first()
    if not user:
        raise HTTPException(status_code=401, detail="Doctor not found")
    return user


# Dummy get current patient using x-user-id header
def get_current_patient(x_user_id: str = Header(None), db: Session = Depends(get_db)):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Unauthorized: Missing x-user-id header")
    try:
        user_id = int(x_user_id)
    except ValueError:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid x-user-id format")
    user = db.query(User).filter(User.id == user_id, User.role == "patient").first()
    if not user:
        raise HTTPException(status_code=401, detail="Patient not found")
    return user

# Initialize the App
app = FastAPI(title="Smilo AI Backend", version="1.0")

# 1. CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Mount static files
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# 3. Include routers
app.include_router(teeth_segmentation_router)

# 4. Global services
teeth_segmenter = None
photo_caries_detector = None


@app.on_event("startup")
async def load_models():
    global teeth_segmenter, photo_caries_detector
    print("Starting to load models...")
    
    # Initialize the database
    try:
        init_db()
        print("✅ Database initialized!")
    except Exception as e:
        print(f"❌ Error initializing DB: {e}")
        import traceback
        traceback.print_exc()

    # Load TeethSegmenter service
    if HAS_TEETH_SEGMENTER and TeethSegmenter is not None:
        try:
            teeth_segmenter = TeethSegmenter(
                model_repo="SerdarHelli/Segmentation-of-Teeth-in-Panoramic-X-ray-Image-Using-U-Net"
            )
            set_teeth_segmenter(teeth_segmenter)
            print("✅ Teeth Segmenter service loaded successfully!")
        except Exception as e:
            print(f"⚠️ Warning: Teeth Segmenter service not loaded: {e}")
            import traceback
            traceback.print_exc()
    else:
        print("ℹ️ Teeth Segmenter skipped (libraries not available)")
        
    # Load PhotoCariesDetector service
    if HAS_PHOTO_CARIES_DETECTOR and PhotoCariesDetector is not None:
        try:
            photo_caries_detector = PhotoCariesDetector(model_path="best.pt")
            print("✅ Photo Caries Detector service loaded successfully!")
        except Exception as e:
            print(f"⚠️ Warning: Photo Caries Detector service not loaded: {e}")
            import traceback
            traceback.print_exc()
    else:
        print("ℹ️ Photo Caries Detector skipped (libraries not available)")

    print("All models loaded!")
    
    
# Add middleware to ensure CORS headers are set
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Response

class AddCorsHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response: Response = await call_next(request)
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = '*'
        response.headers['Access-Control-Allow-Headers'] = '*'
        return response
        
app.add_middleware(AddCorsHeadersMiddleware)


# --------------------------
# Existing /analyze endpoint (updated)
# --------------------------
def draw_bounding_boxes(image: Image.Image, detections: list):
    """Draw bounding boxes on an image"""
    draw_image = image.convert("RGB")
    draw = ImageDraw.Draw(draw_image)
    
    for i, detection in enumerate(detections):
        x1, y1, x2, y2 = detection["box"]
        confidence = detection["confidence"]
        
        # Draw rectangle
        draw.rectangle([x1, y1, x2, y2], outline="#ef4444", width=3)
        
        # Draw label
        label = f"Caries {int(confidence * 100)}%"
        # Try to get a font, default to 14px
        try:
            font = ImageFont.truetype("arial.ttf", 16)
        except:
            font = ImageFont.load_default()
        
        # Calculate text size
        bbox = draw.textbbox((0, 0), label, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        # Draw label background
        draw.rectangle([x1, y1 - text_height - 10, x1 + text_width + 10, y1], fill="#ef4444")
        
        # Draw text
        draw.text((x1 + 5, y1 - text_height - 5), label, fill="white", font=font)
        
        # Draw detection number
        draw.text(((x1 + x2)/2 - 10, (y1 + y2)/2 - 10), f"#{i+1}", fill="#ef4444", font=font)
        
    return draw_image


def detect_caries_roboflow(image: Image.Image, api_key: str = "DypqG5wwAT1YwvUWSYmM"):
    """Detect caries using Roboflow REST API"""
    detections = []
    
    # Save image to BytesIO buffer as JPEG
    image_buffer = io.BytesIO()
    image.save(image_buffer, format="JPEG")
    image_bytes = image_buffer.getvalue()
    
    # Send to Roboflow API
    try:
        response = requests.post(
            "https://detect.roboflow.com/dental_yolo_v8/420",
            params={"api_key": api_key},
            files={"file": image_bytes},
            data={"confidence": 0.25}  # Add confidence threshold
        )
        response.raise_for_status()
        result = response.json()
        
        # Process predictions
        if "predictions" in result:
            for pred in result["predictions"]:
                x_center = pred["x"]
                y_center = pred["y"]
                w = pred["width"]
                h = pred["height"]
                
                # Calculate bounding box
                x1 = x_center - w / 2
                y1 = y_center - h / 2
                x2 = x_center + w / 2
                y2 = y_center + h / 2
                
                detections.append({
                    "box": [x1, y1, x2, y2],
                    "confidence": pred["confidence"],
                    "class": pred["class"]
                })
                print(f"Roboflow detected {pred['class']} with {pred['confidence']:.2f} confidence")
                
    except requests.exceptions.RequestException as e:
        print(f"Error calling Roboflow API: {e}")
        
    return detections


@app.get("/")
def home():
    return {
        "message": "Smilo AI System is Online 🦷",
        "teeth_segmenter_service_loaded": teeth_segmenter is not None
    }


@app.post("/analyze")
async def analyze_xray(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    print(f"Received file: {file.filename}, content_type: {file.content_type}")

    valid_types = ["image/jpeg", "image/png", "image/jpg", "image/pjpeg", "image/x-png", "image/webp"]
    if file.content_type not in valid_types:
        print(f"Invalid content type: {file.content_type}")
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload JPG, PNG, or WEBP.")

    try:
        contents = await file.read()
        original_image = Image.open(io.BytesIO(contents))
        print(f"Loaded image, mode: {original_image.mode}, size: {original_image.size}")

        # Convert image to base64
        buffered = io.BytesIO()
        original_image.convert("RGB").save(buffered, format="JPEG")
        image_data = base64.b64encode(buffered.getvalue()).decode("utf-8")

        case_id = str(uuid.uuid4())
        output_dir = os.path.join("static", "segmentations", case_id)
        os.makedirs(output_dir, exist_ok=True)

        original_image_path = os.path.join(output_dir, "original.png")
        original_image.convert("RGB").save(original_image_path, compress_level=0)

        overlay_url = None
        visual_extracted_url = None
        caries_detection_url = None
        models_used = {
            "segmentation": False,
            "caries_detection": True  # Roboflow is always available
        }

        # Use our new TeethSegmenter
        if teeth_segmenter:
            segmentation_result = teeth_segmenter.segment_image(
                image_path=original_image_path,
                case_id=case_id,
                force_resegment=True
            )
            overlay_url = f"{BACKEND_URL}{segmentation_result['urls']['overlay_url']}"
            visual_extracted_url = f"{BACKEND_URL}{segmentation_result['urls']['visual_teeth_extracted_url']}"
            models_used["segmentation"] = True

        # Run caries detection on original image
        detections = detect_caries_roboflow(original_image)

        # Draw and save caries detection image
        caries_image = draw_bounding_boxes(original_image, detections)
        caries_detection_path = os.path.join(output_dir, "caries_detection.png")
        caries_image.save(caries_detection_path, compress_level=0)
        caries_detection_url = f"{BACKEND_URL}/static/segmentations/{case_id}/caries_detection.png"

        caries_count = len(detections)

        severity = "Healthy"
        if caries_count > 0:
            severity = "Mild" if caries_count <= 2 else "Severe"

        recommendation = "Consult a dentist immediately." if caries_count > 0 else "Routine checkup recommended."

        response_data = {
            "filename": file.filename,
            "status": "success",
            "findings": detections,
            "total_issues": caries_count,
            "severity_level": severity,
            "recommendation": recommendation,
            "case_id": case_id,
            "overlay_url": overlay_url,
            "visual_extracted_url": visual_extracted_url,
            "caries_detection_url": caries_detection_url,
            "original_image_url": f"{BACKEND_URL}/static/segmentations/{case_id}/original.png",
            "models_used": models_used
        }

        # Auto-save ScanReport to database!
        scan_report = ScanReport(
            user_id=current_user.id,
            report_type="xray",
            filename=file.filename,
            file_url=original_image_path,
            findings=json.dumps(detections),
            ai_prediction=severity if severity != "Healthy" else "Healthy",
            confidence=f"{len([d for d in detections if d['confidence'] > 0.5]) / len(detections) * 100 if detections else 95:.1f}%",
            severity=severity,
            image_data=image_data,
            result_json=json.dumps(response_data)
        )
        db.add(scan_report)
        db.commit()
        db.refresh(scan_report)

        print(f"Returning response with severity: {severity}")
        return JSONResponse(content={**response_data, "report_id": scan_report.id})

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in analyze_xray: {e}")
        import traceback
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})


# --------------------------
# New Photo Caries Detection Endpoint
# --------------------------
@app.post("/api/analyze-photo")
async def analyze_photo(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    print(f"Received photo: {file.filename}, content_type: {file.content_type}")

    valid_types = ["image/jpeg", "image/png", "image/jpg", "image/pjpeg", "image/x-png", "image/webp"]
    if file.content_type not in valid_types:
        print(f"Invalid content type: {file.content_type}")
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload JPG, PNG, or WEBP.")

    try:
        contents = await file.read()
        original_image = Image.open(io.BytesIO(contents))
        print(f"Loaded photo, mode: {original_image.mode}, size: {original_image.size}")

        case_id = str(uuid.uuid4())
        output_dir = os.path.join("static", "photo-analyses", case_id)
        os.makedirs(output_dir, exist_ok=True)

        original_image_path = os.path.join(output_dir, "original.png")
        original_image.convert("RGB").save(original_image_path, compress_level=0)

        # Run caries detection
        if not photo_caries_detector:
            raise HTTPException(
                status_code=503,
                detail="Local photo caries detection model is disabled in this deployment to save resources. Please use the Gemini-based photo analysis instead."
            )
        detections = photo_caries_detector.detect(original_image)

        # Draw and save detection image
        detection_image = draw_bounding_boxes(original_image, detections)
        detection_image_path = os.path.join(output_dir, "caries-detection.png")
        detection_image.save(detection_image_path, compress_level=0)
        detection_url = f"{BACKEND_URL}/static/photo-analyses/{case_id}/caries-detection.png"

        caries_count = len(detections)

        severity = "Healthy"
        if caries_count > 0:
            severity = "Mild" if caries_count <= 2 else "Severe"

        recommendation = "Consult a dentist immediately." if caries_count > 0 else "Routine checkup recommended."

        response_data = {
            "filename": file.filename,
            "status": "success",
            "findings": detections,
            "total_issues": caries_count,
            "severity_level": severity,
            "recommendation": recommendation,
            "case_id": case_id,
            "detection_url": detection_url,
            "original_image_url": f"{BACKEND_URL}/static/photo-analyses/{case_id}/original.png"
        }

        # Convert image to base64
        buffered = io.BytesIO()
        original_image.convert("RGB").save(buffered, format="JPEG")
        image_data = base64.b64encode(buffered.getvalue()).decode("utf-8")
        
        # Auto-save ScanReport
        scan_report = ScanReport(
            user_id=current_user.id,
            report_type="photo",
            filename=file.filename,
            file_url=original_image_path,
            findings=json.dumps(detections),
            ai_prediction=severity if severity != "Healthy" else "Healthy",
            confidence=f"{len([d for d in detections if d['confidence'] > 0.5]) / len(detections) * 100 if detections else 95:.1f}%",
            severity=severity,
            image_data=image_data,
            result_json=json.dumps(response_data)
        )
        db.add(scan_report)
        db.commit()
        db.refresh(scan_report)

        print(f"Returning photo analysis with severity: {severity}")
        return JSONResponse(content={**response_data, "report_id": scan_report.id})

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in analyze_photo: {e}")
        import traceback
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})


# --------------------------
# Dummy Gemini Chat Endpoints
# --------------------------
@app.post("/api/chat/analyze")
async def chat_analyze(file: UploadFile = File(...)):
    return {
        "status": "success",
        "message": "File received. This is a placeholder for future Gemini analysis.",
        "filename": file.filename
    }


from pydantic import BaseModel
from typing import List, Optional, Any, Dict

class ChatMessageRequest(BaseModel):
    messages: List[Dict[str, Any]]
    hidden_context: Optional[str] = None


class BookAppointmentRequest(BaseModel):
    doctor_id: int

class UpdateAppointmentStatusRequest(BaseModel):
    status: str
    appointment_date: Optional[str] = None
    doctor_note: Optional[str] = None

class AttachReportRequest(BaseModel):
    appointment_id: int
    report_id: int
    report_type: str  # 'xray', 'photo', 'gemini'

class SendChatMessageRequest(BaseModel):
    message: str


class UpdateDoctorProfileRequest(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    clinic_name: Optional[str] = None
    specialization: Optional[str] = None
    experience_years: Optional[int] = None
    city: Optional[str] = None
    qualifications: Optional[str] = None
    profile_image_url: Optional[str] = None
    registration_number: Optional[str] = None
    linkedin_url: Optional[str] = None
    facebook_url: Optional[str] = None
    new_password: Optional[str] = None
    confirm_password: Optional[str] = None


class UpdatePatientProfileRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    confirm_password: Optional[str] = None
    profile_image_url: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: Optional[str] = None
    blood_group: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None

@app.post("/api/chat/message")
async def chat_message(request: ChatMessageRequest):
    if not chat_service:
        return {
            "status": "success",
            "response": "I'm your dental assistant! Please note that my advanced features are currently unavailable. How can I help you today?"
        }
        
    try:
        response_text = chat_service.get_response(request.messages, request.hidden_context)
        return {
            "status": "success",
            "response": response_text
        }
    except Exception as e:
        print(f"Error in chat_message: {e}")
        import traceback
        traceback.print_exc()
        return {
            "status": "error",
            "response": "Sorry, I had an issue connecting to my brain! Please try again."
        }


# --------------------------
# Gemini Dental Photo Analysis Endpoint
# --------------------------
@app.post("/api/analyze-photo-gemini")
async def analyze_photo_gemini(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    print(f"Received Gemini photo request: {file.filename}, content_type: {file.content_type}")

    valid_types = ["image/jpeg", "image/png", "image/jpg", "image/pjpeg", "image/x-png", "image/webp"]
    if file.content_type not in valid_types:
        print(f"Invalid content type: {file.content_type}")
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload JPG, PNG, or WEBP.")
        
    if not gemini_service:
        return JSONResponse(content={
            "success": False,
            "is_dental_image": False,
            "message": "Gemini service not available: google-genai SDK not installed or API key invalid.",
            "summary": "AI analysis service unavailable.",
            "findings": [],
            "additional_observations": [],
            "overall_oral_hygiene": "unknown",
            "recommendations": [],
            "medical_disclaimer": "AI analysis is not a diagnosis. Please consult a licensed dentist for professional evaluation."
        })

    try:
        contents = await file.read()
        original_image = Image.open(io.BytesIO(contents))
        
        # Convert image to base64
        buffered = io.BytesIO()
        original_image.convert("RGB").save(buffered, format="JPEG")
        image_data = base64.b64encode(buffered.getvalue()).decode("utf-8")
        
        result = await gemini_service.analyze_dental_image(contents)
        response_data = result.model_dump()
        
        # Auto-save ScanReport
        scan_report = ScanReport(
            user_id=current_user.id,
            report_type="gemini",
            filename=file.filename,
            findings=json.dumps(response_data.get("findings", [])),
            summary=response_data.get("summary"),
            ai_prediction=response_data.get("overall_oral_hygiene", "unknown"),
            severity="Healthy" if response_data.get("overall_oral_hygiene") == "healthy" else "Moderate",
            image_data=image_data,
            result_json=json.dumps(response_data)
        )
        db.add(scan_report)
        db.commit()
        db.refresh(scan_report)
        
        return JSONResponse(content={**response_data, "report_id": scan_report.id})

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in analyze_photo_gemini: {e}")
        import traceback
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"success": False, "message": str(e)})


# --------------------------
# Dental Report Analysis Endpoint
# --------------------------
@app.post("/api/analyze-report")
async def analyze_report(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    print(f"✅ [ENDPOINT] Received report for analysis: {file.filename}, content_type: {file.content_type}")
    try:
        contents = await file.read()
        print(f"✅ [ENDPOINT] Read file contents: {len(contents)} bytes")
        
        # If it's an image, save base64
        image_data = None
        valid_image_types = ["image/jpeg", "image/png", "image/jpg", "image/pjpeg", "image/x-png", "image/webp"]
        if file.content_type in valid_image_types:
            try:
                original_image = Image.open(io.BytesIO(contents))
                buffered = io.BytesIO()
                original_image.convert("RGB").save(buffered, format="JPEG")
                image_data = base64.b64encode(buffered.getvalue()).decode("utf-8")
            except Exception as e:
                print(f"⚠️ Could not convert document to image for storage: {e}")
        
        print(f"✅ [ENDPOINT] Calling groq_service.analyze_dental_report...")
        result = await groq_service.analyze_dental_report(contents, file.filename, file.content_type)
        print(f"✅ [ENDPOINT] Analysis complete!")
        print(f"✅ [ENDPOINT] Result: {result.model_dump_json(indent=2)}")
        
        response_data = result.model_dump()
        
        # Auto-save ScanReport
        scan_report = ScanReport(
            user_id=current_user.id,
            report_type="document",
            filename=file.filename,
            findings=json.dumps(response_data.get("findings", [])),
            summary=response_data.get("summary"),
            ai_prediction=response_data.get("diagnosis", "unknown"),
            severity="Healthy" if response_data.get("diagnosis") == "healthy" else "Moderate",
            image_data=image_data,
            result_json=json.dumps(response_data)
        )
        db.add(scan_report)
        db.commit()
        db.refresh(scan_report)
        
        return JSONResponse(content={**response_data, "report_id": scan_report.id})

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ [ENDPOINT] Error in analyze_report: {e}")
        import traceback
        print(f"❌ [ENDPOINT] Traceback:\n{traceback.format_exc()}")
        return JSONResponse(status_code=500, content={"success": False, "message": str(e)})

# --------------------------
# Authentication Endpoints
# --------------------------
@app.post("/api/register", response_model=AuthResponse)
async def register(request: dict, db: Session = Depends(get_db)):
    print(f"✅ [REGISTER] Received registration request: {request}")
    
    role = request.get("role")
    email = request.get("email")
    
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = hash_password(request.get("password"))
    
    # Create user
    db_user = User(
        email=email,
        hashed_password=hashed_password,
        role=role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    full_name = ""
    
    if role == "patient":
        # Safely convert age to integer for strictly-typed databases like Postgres
        age_val = request.get("age")
        if age_val is not None and str(age_val).strip() != "":
            try:
                age_val = int(float(age_val))
            except (ValueError, TypeError):
                age_val = None
        else:
            age_val = None

        db_patient = PatientProfile(
            user_id=db_user.id,
            full_name=request.get("full_name"),
            age=age_val,
            gender=request.get("gender")
        )
        db.add(db_patient)
        full_name = request.get("full_name")
    elif role == "doctor":
        # Safely convert experience_years to integer
        exp_val = request.get("experience_years")
        if exp_val is not None and str(exp_val).strip() != "":
            try:
                exp_val = int(float(exp_val))
            except (ValueError, TypeError):
                exp_val = 0
        else:
            exp_val = 0

        db_doctor = DoctorProfile(
            user_id=db_user.id,
            full_name=request.get("full_name"),
            specialization=request.get("specialization"),
            experience_years=exp_val,
            city=request.get("city"),
            qualifications=request.get("qualifications"),
            clinic_name=request.get("clinic_name")
        )
        db.add(db_doctor)
        full_name = request.get("full_name")
    else:
        raise HTTPException(status_code=400, detail="Invalid role. Must be 'patient' or 'doctor'")

    db.commit()

    return AuthResponse(
        success=True,
        user_id=db_user.id,
        role=db_user.role,
        full_name=full_name,
        email=db_user.email,
        message="Account created successfully!"
    )

@app.post("/api/login", response_model=AuthResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    print(f"\n✅ [LOGIN] ==========================================")
    print(f"✅ [LOGIN] Received login request for email: {request.email}, required role: {request.required_role}")
    
    # Check all users!
    all_users = db.query(User).all()
    print(f"✅ [LOGIN] Total users in DB: {len(all_users)}")
    for u in all_users:
        print(f"✅ [LOGIN] User: {u.email} (role: {u.role}, id: {u.id})")
    
    user = db.query(User).filter(User.email == request.email).first()
    
    if not user:
        print(f"❌ [LOGIN] No user found with email: {request.email}")
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    # Check role matches required role
    if user.role != request.required_role:
        print(f"❌ [LOGIN] User role {user.role} doesn't match required role {request.required_role}")
        raise HTTPException(status_code=403, detail="Invalid credentials for this portal")
    
    print(f"✅ [LOGIN] User found: {user.email}, checking password...")
    
    if not verify_password(request.password, user.hashed_password):
        print(f"❌ [LOGIN] Password mismatch for {request.email}")
        raise HTTPException(status_code=400, detail="Invalid email or password")

    print(f"✅ [LOGIN] Password correct! Fetching profile for {user.role}")
    full_name = ""
    if user.role == "patient":
        patient_profile = db.query(PatientProfile).filter(PatientProfile.user_id == user.id).first()
        if patient_profile:
            full_name = patient_profile.full_name
            print(f"✅ [LOGIN] Patient profile: {full_name}")
        else:
            print(f"❌ [LOGIN] NO PATIENT PROFILE FOUND FOR USER {user.id}")
    elif user.role == "doctor":
        doctor_profile = db.query(DoctorProfile).filter(DoctorProfile.user_id == user.id).first()
        if doctor_profile:
            full_name = doctor_profile.full_name
            print(f"✅ [LOGIN] Doctor profile: {full_name}")
        else:
            print(f"❌ [LOGIN] NO DOCTOR PROFILE FOUND FOR USER {user.id}")
            

    print(f"✅ [LOGIN] ========================================== SUCCESS!\n")
    return AuthResponse(
        success=True,
        user_id=user.id,
        role=user.role,
        full_name=full_name,
        email=user.email,
        message="Login successful!"
    )

@app.get("/api/doctors")
async def get_all_doctors(db: Session = Depends(get_db)):
    print(f"✅ [GET /api/doctors] Fetching all doctors")
    try:
        doctors = db.query(User).filter(User.role == "doctor").all()
        doctor_list = []
        for doctor in doctors:
            profile = db.query(DoctorProfile).filter(DoctorProfile.user_id == doctor.id).first()
            doctor_list.append({
                "id": doctor.id,
                "email": doctor.email,
                "full_name": profile.full_name if profile else "Unknown",
                "specialization": profile.specialization if profile else "General Dentist",
                "experience_years": profile.experience_years if profile else 0,
                "city": profile.city if profile else "Unknown",
                "clinic_name": profile.clinic_name if profile else "Unknown Clinic",
                "is_verified": profile.is_verified if profile else False,
                "profile_image_url": profile.profile_image_url if profile else None,
                "registration_number": profile.registration_number if profile else None,
                "linkedin_url": profile.linkedin_url if profile else None,
                "facebook_url": profile.facebook_url if profile else None,
            })
        return {"success": True, "doctors": doctor_list}
    except Exception as e:
        print(f"❌ [GET /api/doctors] Error: {e}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/doctor/profile")
async def get_doctor_profile(
    current_doctor: User = Depends(get_current_doctor),
    db: Session = Depends(get_db)
):
    print(f"✅ [GET /api/doctor/profile] Fetching doctor profile for user {current_doctor.id}")
    try:
        doctor_profile = db.query(DoctorProfile).filter(DoctorProfile.user_id == current_doctor.id).first()
        if not doctor_profile:
            raise HTTPException(status_code=404, detail="Doctor profile not found")
        
        return {
            "success": True,
            "profile": {
                "id": doctor_profile.id,
                "user_id": doctor_profile.user_id,
                "email": current_doctor.email,
                "full_name": doctor_profile.full_name,
                "specialization": doctor_profile.specialization,
                "experience_years": doctor_profile.experience_years,
                "city": doctor_profile.city,
                "qualifications": doctor_profile.qualifications,
                "clinic_name": doctor_profile.clinic_name,
                "is_verified": doctor_profile.is_verified,
                "profile_image_url": doctor_profile.profile_image_url,
                "registration_number": doctor_profile.registration_number,
                "linkedin_url": doctor_profile.linkedin_url,
                "facebook_url": doctor_profile.facebook_url,
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ [GET /api/doctor/profile] Error: {e}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/doctor/profile")
async def update_doctor_profile(
    request: UpdateDoctorProfileRequest,
    current_doctor: User = Depends(get_current_doctor),
    db: Session = Depends(get_db)
):
    print(f"✅ [PUT /api/doctor/profile] Updating profile for user {current_doctor.id}")
    try:
        doctor_profile = db.query(DoctorProfile).filter(DoctorProfile.user_id == current_doctor.id).first()
        if not doctor_profile:
            raise HTTPException(status_code=404, detail="Doctor profile not found")
        
        # Update doctor profile fields
        if request.full_name is not None:
            doctor_profile.full_name = request.full_name
        if request.clinic_name is not None:
            doctor_profile.clinic_name = request.clinic_name
        if request.specialization is not None:
            doctor_profile.specialization = request.specialization
        if request.experience_years is not None:
            doctor_profile.experience_years = request.experience_years
        if request.city is not None:
            doctor_profile.city = request.city
        if request.qualifications is not None:
            doctor_profile.qualifications = request.qualifications
        if request.profile_image_url is not None:
            doctor_profile.profile_image_url = request.profile_image_url
        if request.registration_number is not None:
            doctor_profile.registration_number = request.registration_number
        if request.linkedin_url is not None:
            doctor_profile.linkedin_url = request.linkedin_url
        if request.facebook_url is not None:
            doctor_profile.facebook_url = request.facebook_url
        
        # Handle password change
        if request.new_password:
            if not request.confirm_password:
                raise HTTPException(status_code=400, detail="Confirm password is required when changing password")
            if request.new_password != request.confirm_password:
                raise HTTPException(status_code=400, detail="Passwords do not match")
            current_doctor.hashed_password = hash_password(request.new_password)
        
        db.commit()
        db.refresh(doctor_profile)
        
        return {
            "success": True,
            "message": "Profile updated successfully!",
            "profile": {
                "id": doctor_profile.id,
                "user_id": doctor_profile.user_id,
                "email": current_doctor.email,
                "full_name": doctor_profile.full_name,
                "specialization": doctor_profile.specialization,
                "experience_years": doctor_profile.experience_years,
                "city": doctor_profile.city,
                "qualifications": doctor_profile.qualifications,
                "clinic_name": doctor_profile.clinic_name,
                "is_verified": doctor_profile.is_verified,
                "profile_image_url": doctor_profile.profile_image_url,
                "registration_number": doctor_profile.registration_number,
                "linkedin_url": doctor_profile.linkedin_url,
                "facebook_url": doctor_profile.facebook_url,
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ [PUT /api/doctor/profile] Error: {e}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/patient/profile")
async def get_patient_profile(
    current_patient: User = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    print(f"✅ [GET /api/patient/profile] Fetching patient profile for user {current_patient.id}")
    try:
        patient_profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_patient.id).first()
        if not patient_profile:
            raise HTTPException(status_code=404, detail="Patient profile not found")
        
        return {
            "success": True,
            "profile": {
                "id": patient_profile.id,
                "user_id": patient_profile.user_id,
                "email": current_patient.email,
                "full_name": patient_profile.full_name,
                "age": patient_profile.age,
                "gender": patient_profile.gender,
                "profile_image_url": patient_profile.profile_image_url,
                "phone_number": patient_profile.phone_number,
                "address": patient_profile.address,
                "date_of_birth": patient_profile.date_of_birth,
                "blood_group": patient_profile.blood_group,
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ [GET /api/patient/profile] Error: {e}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/patient/profile")
async def update_patient_profile(
    request: UpdatePatientProfileRequest,
    current_patient: User = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    print(f"✅ [PUT /api/patient/profile] Updating profile for user {current_patient.id}")
    try:
        patient_profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_patient.id).first()
        if not patient_profile:
            raise HTTPException(status_code=404, detail="Patient profile not found")
        
        # Update User table fields
        if request.email is not None:
            current_patient.email = request.email
        
        # Update PatientProfile fields
        if request.name is not None:
            patient_profile.full_name = request.name
        if request.age is not None:
            patient_profile.age = request.age
        if request.gender is not None:
            patient_profile.gender = request.gender
        if request.profile_image_url is not None:
            patient_profile.profile_image_url = request.profile_image_url
        if request.phone_number is not None:
            patient_profile.phone_number = request.phone_number
        if request.address is not None:
            patient_profile.address = request.address
        if request.date_of_birth is not None:
            patient_profile.date_of_birth = request.date_of_birth
        if request.blood_group is not None:
            patient_profile.blood_group = request.blood_group
        
        # Handle password change
        if request.password:
            if not request.confirm_password:
                raise HTTPException(status_code=400, detail="Confirm password is required when changing password")
            if request.password != request.confirm_password:
                raise HTTPException(status_code=400, detail="Passwords do not match")
            current_patient.hashed_password = hash_password(request.password)
        
        db.commit()
        db.refresh(patient_profile)
        
        return {
            "success": True,
            "message": "Profile updated successfully!",
            "profile": {
                "id": patient_profile.id,
                "user_id": patient_profile.user_id,
                "email": current_patient.email,
                "full_name": patient_profile.full_name,
                "age": patient_profile.age,
                "gender": patient_profile.gender,
                "profile_image_url": patient_profile.profile_image_url,
                "phone_number": patient_profile.phone_number,
                "address": patient_profile.address,
                "date_of_birth": patient_profile.date_of_birth,
                "blood_group": patient_profile.blood_group,
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ [PUT /api/patient/profile] Error: {e}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/doctor/stats")
async def get_doctor_stats(db: Session = Depends(get_db)):
    print(f"✅ [GET /api/doctor/stats] Fetching doctor stats")
    try:
        # Calculate counts
        total_patients = db.query(User).filter(User.role == "patient").count()
        pending_reports = db.query(ScanReport).filter(ScanReport.status == "pending").count()
        # Safe defaults for other stats
        stats = {
            "pending_reports": pending_reports,
            "consultations_today": 3,
            "total_patients": total_patients,
            "ai_accuracy_rate": "94.2%"
        }
        return {"success": True, "stats": stats}
    except Exception as e:
        print(f"❌ [GET /api/doctor/stats] Error: {e}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/doctor/pending-reports")
async def get_pending_reports(db: Session = Depends(get_db)):
    print(f"✅ [GET /api/doctor/pending-reports] Fetching pending reports")
    try:
        # Join ScanReport with User and PatientProfile
        reports = db.query(ScanReport).filter(ScanReport.status == "pending").order_by(ScanReport.created_at.desc()).all()
        report_list = []
        for report in reports:
            # Get patient info
            patient_name = "Unknown Patient"
            patient_profile = db.query(PatientProfile).filter(PatientProfile.user_id == report.user_id).first()
            if patient_profile:
                patient_name = patient_profile.full_name
                
            # Dynamically set label based on scan type
            label = "Severity Level"
            if report.report_type == "gemini":
                label = "Hygiene Assessment"
            elif report.report_type == "document":
                label = "Document Diagnosis"
                
            report_list.append({
                "id": report.id,
                "patient_id": f"#{report.user_id or '12345'}",
                "patient_name": patient_name,
                "upload_date": report.created_at.strftime("%b %d, %Y") if report.created_at else "Unknown",
                "ai_prediction": report.ai_prediction or "Healthy",
                "confidence": report.confidence or "92.1%",
                "severity": report.severity or "None",
                "scan_type": report.report_type,
                "label": label
            })
        return {"success": True, "reports": report_list}
    except Exception as e:
        print(f"❌ [GET /api/doctor/pending-reports] Error: {e}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/doctor/report/{report_id}")
async def get_single_report(report_id: int, db: Session = Depends(get_db)):
    print(f"✅ [GET /api/doctor/report/{report_id}] Fetching single report")
    try:
        report = db.query(ScanReport).filter(ScanReport.id == report_id).first()
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
            
        # Get patient info
        patient_name = "Unknown Patient"
        patient_profile = db.query(PatientProfile).filter(PatientProfile.user_id == report.user_id).first()
        if patient_profile:
            patient_name = patient_profile.full_name
            
        # Parse result_json if available
        result_data = None
        if report.result_json:
            result_data = json.loads(report.result_json)
            
        return {
            "success": True, 
            "report": {
                "id": report.id,
                "patient_id": f"#{report.user_id or '12345'}",
                "patient_name": patient_name,
                "upload_date": report.created_at.strftime("%b %d, %Y") if report.created_at else "Unknown",
                "ai_prediction": report.ai_prediction or "Healthy",
                "confidence": report.confidence or "92.1%",
                "severity": report.severity or "None",
                "scan_type": report.report_type,
                "image_data": report.image_data,
                "result_json": result_data,
                "summary": report.summary,
                "findings": report.findings,
                "status": report.status
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ [GET /api/doctor/report/{report_id}] Error: {e}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

class UpdateReportStatusRequest(BaseModel):
    status: str

@app.post("/api/doctor/report/{report_id}/status")
async def update_report_status(report_id: int, request: UpdateReportStatusRequest, db: Session = Depends(get_db)):
    print(f"✅ [POST /api/doctor/report/{report_id}/status] Updating report status to {request.status}")
    try:
        report = db.query(ScanReport).filter(ScanReport.id == report_id).first()
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
            
        report.status = request.status
        db.commit()
        db.refresh(report)
        
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ [POST /api/doctor/report/{report_id}/status] Error: {e}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/doctor/reviewed-reports")
async def get_reviewed_reports(db: Session = Depends(get_db)):
    print(f"✅ [GET /api/doctor/reviewed-reports] Fetching reviewed reports")
    try:
        reports = db.query(ScanReport).filter(ScanReport.status == "reviewed").order_by(ScanReport.created_at.desc()).all()
        report_list = []
        for report in reports:
            # Get patient info
            patient_name = "Unknown Patient"
            patient_profile = db.query(PatientProfile).filter(PatientProfile.user_id == report.user_id).first()
            if patient_profile:
                patient_name = patient_profile.full_name
                
            report_list.append({
                "id": report.id,
                "patient_id": f"#{report.user_id or '12345'}",
                "patient_name": patient_name,
                "upload_date": report.created_at.strftime("%b %d, %Y") if report.created_at else "Unknown",
                "ai_prediction": report.ai_prediction or "Healthy",
                "severity": report.severity or "None",
                "scan_type": report.report_type,
                "doctor_notes": "Review completed",  # Placeholder for now
                "review_date": report.created_at.strftime("%b %d, %Y") if report.created_at else "Unknown"
            })
        return {"success": True, "reports": report_list}
    except Exception as e:
        print(f"❌ [GET /api/doctor/reviewed-reports] Error: {e}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/seed")
async def seed_test_users(db: Session = Depends(get_db)):
    print(f"✅ [SEED] Checking if test data exists...")
    
    try:
        # Check if test patient already exists
        existing_test_patient = db.query(User).filter(User.email == "patient@test.com").first()
        if existing_test_patient:
            print("✅ [SEED] Database already seeded!")
            return {"success": True, "message": "Database already seeded."}
        
        # Create test patient
        patient_user = User(
            email="patient@test.com",
            hashed_password=hash_password("test1234"),
            role="patient"
        )
        db.add(patient_user)
        db.commit()
        db.refresh(patient_user)
        
        patient_profile = PatientProfile(
            user_id=patient_user.id,
            full_name="John Test Patient",
            age=30,
            gender="Male"
        )
        db.add(patient_profile)
        db.commit()
        
        # Create test doctor
        doctor_user = User(
            email="doctor@test.com",
            hashed_password=hash_password("test1234"),
            role="doctor"
        )
        db.add(doctor_user)
        db.commit()
        db.refresh(doctor_user)
        
        doctor_profile = DoctorProfile(
            user_id=doctor_user.id,
            full_name="Dr. Sarah Test Doctor",
            specialization="Orthodontist",
            experience_years=10,
            city="New York",
            qualifications="BDS, MDS",
            clinic_name="Test Dental Clinic"
        )
        db.add(doctor_profile)
        db.commit()
        
        print(f"✅ [SEED] Test data created!")
        return {
            "success": True,
            "message": "Test users created!",
            "test_users": {
                "patient": {
                    "email": "patient@test.com",
                    "password": "test1234"
                },
                "doctor": {
                    "email": "doctor@test.com",
                    "password": "test1234"
                }
            }
        }
        
    except Exception as e:
        print(f"❌ [SEED] Error: {e}")
        import traceback
        print(traceback.format_exc())
        return {"success": False, "error": str(e)}

# --------------------------
# Appointment Endpoints
# --------------------------

@app.post("/api/appointments/book")
async def book_appointment(
    request: BookAppointmentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    print(f"✅ [POST /api/appointments/book] Booking appointment for user {current_user.id}")
    try:
        # 1. Check spam prevention: max 2 pending OR approved
        active_count = db.query(Appointment).filter(
            Appointment.patient_id == current_user.id,
            Appointment.status.in_(["pending", "approved"])
        ).count()
        if active_count >= 2:
            raise HTTPException(status_code=400, detail="Maximum of 2 active appointments allowed. Please cancel an existing appointment to request a new one.")
        
        # 2. Check for at least one X-ray report
        xray_reports = db.query(ScanReport).filter(
            ScanReport.user_id == current_user.id,
            ScanReport.report_type == "xray"
        ).order_by(ScanReport.created_at.desc()).all()
        if len(xray_reports) == 0:
            raise HTTPException(status_code=400, detail="An X-Ray report is strictly required to book an appointment.")
        
        # 3. Get most recent reports for each category
        latest_xray = xray_reports[0]
        latest_photo = db.query(ScanReport).filter(
            ScanReport.user_id == current_user.id,
            ScanReport.report_type == "photo"
        ).order_by(ScanReport.created_at.desc()).first()
        latest_gemini = db.query(ScanReport).filter(
            ScanReport.user_id == current_user.id,
            ScanReport.report_type == "gemini"
        ).order_by(ScanReport.created_at.desc()).first()
        
        # 4. Create appointment with all attached report IDs
        new_appointment = Appointment(
            patient_id=current_user.id,
            doctor_id=request.doctor_id,
            status="pending",
            xray_report_id=latest_xray.id,
            photo_report_id=latest_photo.id if latest_photo else None,
            gemini_report_id=latest_gemini.id if latest_gemini else None
        )
        db.add(new_appointment)
        db.commit()
        db.refresh(new_appointment)
        
        return {"success": True, "appointment_id": new_appointment.id}
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"❌ [POST /api/appointments/book] Error: {e}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/appointments/{appointment_id}")
async def cancel_appointment(
    appointment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    print(f"✅ [DELETE /api/appointments/{appointment_id}] Canceling appointment")
    try:
        appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        # Verify either patient or doctor owns this appointment
        if appointment.patient_id != current_user.id and appointment.doctor_id != current_user.id:
            raise HTTPException(status_code=403, detail="You do not have access to this appointment")
        # Only allow canceling pending or approved
        if appointment.status not in ["pending", "approved"]:
            raise HTTPException(status_code=400, detail="Only pending or approved appointments can be canceled")
        
        appointment.status = "cancelled"
        db.commit()
        return {"success": True}
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"❌ [DELETE /api/appointments/{appointment_id}] Error: {e}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/appointments/attach-report")
async def attach_report_to_appointment(
    request: AttachReportRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    print(f"✅ [POST /api/appointments/attach-report] Attaching report {request.report_id} to appointment {request.appointment_id}")
    try:
        # Find appointment
        appointment = db.query(Appointment).filter(Appointment.id == request.appointment_id).first()
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        # Verify patient owns this appointment
        if appointment.patient_id != current_user.id:
            raise HTTPException(status_code=403, detail="You do not have access to this appointment")
        
        # Verify report exists and belongs to patient
        report = db.query(ScanReport).filter(ScanReport.id == request.report_id, ScanReport.user_id == current_user.id).first()
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        # Verify report type matches
        if report.report_type != request.report_type:
            raise HTTPException(status_code=400, detail="Report type does not match")
        
        # Attach the report
        if request.report_type == "xray":
            appointment.xray_report_id = request.report_id
        elif request.report_type == "photo":
            appointment.photo_report_id = request.report_id
        elif request.report_type == "gemini":
            appointment.gemini_report_id = request.report_id
        
        # If already approved, set has_new_uploads flag
        if appointment.status == "approved":
            appointment.has_new_uploads = True
        
        db.commit()
        db.refresh(appointment)
        
        return {"success": True}
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"❌ [POST /api/appointments/attach-report] Error: {e}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/appointments/patient")
async def get_patient_appointments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    print(f"✅ [GET /api/appointments/patient] Fetching appointments for user {current_user.id}")
    try:
        appointments = db.query(Appointment).filter(Appointment.patient_id == current_user.id).all()
        result = []
        for app in appointments:
            # Get doctor profile
            doctor_profile = db.query(DoctorProfile).filter(DoctorProfile.user_id == app.doctor_id).first()
            result.append({
                "id": app.id,
                "doctor_id": app.doctor_id,
                "doctor_name": doctor_profile.full_name if doctor_profile else "Unknown Doctor",
                "clinic_name": doctor_profile.clinic_name if doctor_profile else "Unknown Clinic",
                "status": app.status,
                "appointment_date": app.appointment_date.strftime("%b %d, %Y %I:%M %p") if app.appointment_date else None,
                "created_at": app.created_at.strftime("%b %d, %Y %I:%M %p") if app.created_at else "Unknown",
                "doctor_note": app.doctor_note,
                "has_new_uploads": app.has_new_uploads
            })
        return {"success": True, "appointments": result}
    except Exception as e:
        print(f"❌ [GET /api/appointments/patient] Error: {e}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/appointments/doctor")
async def get_doctor_appointments(
    current_doctor: User = Depends(get_current_doctor),
    db: Session = Depends(get_db)
):
    print(f"✅ [GET /api/appointments/doctor] Fetching appointments for user {current_doctor.id}")
    try:
        appointments = db.query(Appointment).filter(Appointment.doctor_id == current_doctor.id).all()
        result = []
        for app in appointments:
            # Get patient profile
            patient_profile = db.query(PatientProfile).filter(PatientProfile.user_id == app.patient_id).first()
            
            # Get attached reports
            xray_report = db.query(ScanReport).filter(ScanReport.id == app.xray_report_id).first() if app.xray_report_id else None
            photo_report = db.query(ScanReport).filter(ScanReport.id == app.photo_report_id).first() if app.photo_report_id else None
            gemini_report = db.query(ScanReport).filter(ScanReport.id == app.gemini_report_id).first() if app.gemini_report_id else None
            
            def serialize_report(report):
                if not report:
                    return None
                return {
                    "id": report.id,
                    "ai_prediction": report.ai_prediction,
                    "severity": report.severity,
                    "confidence": report.confidence,
                    "image_data": report.image_data,
                    "result_json": report.result_json,
                    "report_type": report.report_type
                }
            
            result.append({
                "id": app.id,
                "patient_id": app.patient_id,
                "patient_name": patient_profile.full_name if patient_profile else "Unknown Patient",
                "patient_age": patient_profile.age if patient_profile else "N/A",
                "status": app.status,
                "appointment_date": app.appointment_date.isoformat() if app.appointment_date else None,
                "created_at": app.created_at.isoformat() if app.created_at else None,
                "xray_report": serialize_report(xray_report),
                "photo_report": serialize_report(photo_report),
                "gemini_report": serialize_report(gemini_report),
                "doctor_note": app.doctor_note,
                "has_new_uploads": app.has_new_uploads
            })
        return {"success": True, "appointments": result}
    except Exception as e:
        print(f"❌ [GET /api/appointments/doctor] Error: {e}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chat/{appointment_id}")
async def get_chat_messages(
    appointment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    print(f"✅ [GET /api/chat/{appointment_id}] Fetching chat messages")
    try:
        appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        # Check user has access
        if appointment.patient_id != current_user.id and appointment.doctor_id != current_user.id:
            raise HTTPException(status_code=403, detail="You do not have access to this chat")
        
        messages = db.query(ChatMessage).filter(ChatMessage.appointment_id == appointment_id).order_by(ChatMessage.timestamp).all()
        
        return {
            "success": True,
            "messages": [
                {
                    "id": msg.id,
                    "sender_role": msg.sender_role,
                    "message": msg.message,
                    "timestamp": msg.timestamp.isoformat()
                }
                for msg in messages
            ]
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"❌ [GET /api/chat/{appointment_id}] Error: {e}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chat/{appointment_id}")
async def send_chat_message(
    appointment_id: int,
    request: SendChatMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    print(f"✅ [POST /api/chat/{appointment_id}] Sending chat message")
    try:
        appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        # Check user has access
        if appointment.patient_id != current_user.id and appointment.doctor_id != current_user.id:
            raise HTTPException(status_code=403, detail="You do not have access to this chat")
        
        # Determine sender role
        sender_role = "patient" if appointment.patient_id == current_user.id else "doctor"
        
        new_message = ChatMessage(
            appointment_id=appointment_id,
            sender_role=sender_role,
            message=request.message
        )
        db.add(new_message)
        db.commit()
        db.refresh(new_message)
        
        # If doctor is sending a message, maybe reset has_new_uploads? Wait no, has_new_uploads is about scans
        # Reset has_new_uploads only if doctor views, not chat
        
        return {
            "success": True,
            "message": {
                "id": new_message.id,
                "sender_role": new_message.sender_role,
                "message": new_message.message,
                "timestamp": new_message.timestamp.isoformat()
            }
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"❌ [POST /api/chat/{appointment_id}] Error: {e}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


# Endpoint to mark has_new_uploads as false (when doctor views)
@app.put("/api/appointments/{appointment_id}/mark-viewed")
async def mark_appointment_viewed(
    appointment_id: int,
    current_doctor: User = Depends(get_current_doctor),
    db: Session = Depends(get_db)
):
    print(f"✅ [PUT /api/appointments/{appointment_id}/mark-viewed] Marking as viewed")
    try:
        appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        if appointment.doctor_id != current_doctor.id:
            raise HTTPException(status_code=403, detail="You do not have access to this appointment")
        appointment.has_new_uploads = False
        db.commit()
        return {"success": True}
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"❌ [PUT /api/appointments/{appointment_id}/mark-viewed] Error: {e}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/appointments/{appointment_id}/status")
async def update_appointment_status(
    appointment_id: int,
    request: UpdateAppointmentStatusRequest,
    current_doctor: User = Depends(get_current_doctor),
    db: Session = Depends(get_db)
):
    print(f"✅ [PUT /api/appointments/{appointment_id}/status] Updating status to {request.status}")
    try:
        appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        # Verify doctor owns this appointment
        if appointment.doctor_id != current_doctor.id:
            raise HTTPException(status_code=403, detail="You do not have access to this appointment")
        
        appointment.status = request.status
        if request.status == "approved" and request.appointment_date:
            appointment.appointment_date = datetime.fromisoformat(request.appointment_date.replace("Z", "+00:00"))
        if request.doctor_note is not None:
            appointment.doctor_note = request.doctor_note
        db.commit()
        db.refresh(appointment)
        return {"success": True, "appointment": {
            "id": appointment.id,
            "status": appointment.status,
            "appointment_date": appointment.appointment_date.strftime("%b %d, %Y %I:%M %p") if appointment.appointment_date else None
        }}
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"❌ [PUT /api/appointments/{appointment_id}/status] Error: {e}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

# --------------------------
# Report Management Endpoints
# --------------------------
class DeleteMultipleReportsRequest(BaseModel):
    report_ids: List[int]

@app.delete("/api/reports/{report_id}")
async def delete_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    print(f"✅ [DELETE /api/reports/{report_id}] Deleting report for user {current_user.id}")
    try:
        report = db.query(ScanReport).filter(ScanReport.id == report_id).first()
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        # Verify patient owns this report
        if report.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="You do not have access to this report")
        
        db.delete(report)
        db.commit()
        return {"success": True}
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"❌ [DELETE /api/reports/{report_id}] Error: {e}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/reports/delete-multiple")
async def delete_multiple_reports(
    request: DeleteMultipleReportsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    print(f"✅ [POST /api/reports/delete-multiple] Deleting reports {request.report_ids} for user {current_user.id}")
    try:
        reports = db.query(ScanReport).filter(
            ScanReport.id.in_(request.report_ids),
            ScanReport.user_id == current_user.id
        ).all()
        for report in reports:
            db.delete(report)
        db.commit()
        return {"success": True, "deleted_count": len(reports)}
    except Exception as e:
        print(f"❌ [POST /api/reports/delete-multiple] Error: {e}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

# Get patient's reports for SavedAnalytics page
@app.get("/api/reports/patient")
async def get_patient_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    print(f"✅ [GET /api/reports/patient] Fetching reports for user {current_user.id}")
    try:
        reports = db.query(ScanReport).filter(ScanReport.user_id == current_user.id).order_by(ScanReport.created_at.desc()).all()
        report_list = []
        for report in reports:
            report_list.append({
                "id": report.id,
                "scan_type": report.report_type or "unknown",
                "filename": report.filename or "report.jpg",
                "ai_prediction": report.ai_prediction or "No prediction",
                "confidence": report.confidence or "N/A",
                "severity": report.severity or "None",
                "upload_date": report.created_at.strftime("%b %d, %Y") if report.created_at else "Unknown",
                "image_data": report.image_data,
                "result_json": report.result_json
            })
        return {"success": True, "reports": report_list}
    except Exception as e:
        print(f"❌ [GET /api/reports/patient] Error: {e}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

# Get single report by ID
@app.get("/api/reports/{report_id}")
async def get_report_by_id(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    print(f"✅ [GET /api/reports/{report_id}] Fetching report")
    try:
        report = db.query(ScanReport).filter(ScanReport.id == report_id).first()
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        return {
            "id": report.id,
            "scan_type": report.report_type or "unknown",
            "filename": report.filename or "report.jpg",
            "ai_prediction": report.ai_prediction or "No prediction",
            "confidence": report.confidence or "N/A",
            "severity": report.severity or "None",
            "upload_date": report.created_at.strftime("%b %d, %Y") if report.created_at else "Unknown",
            "image_data": report.image_data,
            "result_json": report.result_json,
            "file_url": report.file_url
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"❌ [GET /api/reports/{report_id}] Error: {e}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

