from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from PIL import Image
import io
import os
import uuid
import base64

# Import our services
from app.services.teeth_segmenter import TeethSegmenter
from app.services.caries_detector import CariesDetector
from app.api.routes.teeth_segmentation import router as teeth_segmentation_router, set_teeth_segmenter

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
teeth_segmenter: TeethSegmenter | None = None
caries_detector: CariesDetector | None = None
yolo_model = None  # Keep for backward compatibility
segmentation_model = None  # Keep for backward compatibility


@app.on_event("startup")
async def load_models():
    global teeth_segmenter, caries_detector, yolo_model, segmentation_model
    print("Starting to load models...")

    # Load YOLO Caries Model (backward compatible)
    try:
        from ultralytics import YOLO
        yolo_model = YOLO("best.pt")
        print("✅ Smilo AI YOLO Caries Model (best.pt) loaded successfully!")
    except Exception as e:
        print(f"⚠️ Warning: YOLO Caries model not loaded: {e}")

    # Load Segmentation Model (backward compatible)
    try:
        from huggingface_hub import from_pretrained_keras
        import tensorflow as tf
        segmentation_model = from_pretrained_keras("SerdarHelli/Segmentation-of-Teeth-in-Panoramic-X-ray-Image-Using-U-Net")
        print("✅ Teeth Segmentation Model (backward compatible) loaded successfully!")
    except Exception as e:
        print(f"⚠️ Warning: Segmentation model (backward compatible) not loaded: {e}")

    # Load TeethSegmenter service
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

    # Load CariesDetector service
    try:
        caries_detector = CariesDetector(model_path="best.pt")
        print("✅ Caries Detector service loaded successfully!")
    except Exception as e:
        print(f"⚠️ Warning: Caries Detector service not loaded: {e}")
        import traceback
        traceback.print_exc()

    print("All models loaded!")


# --------------------------
# Existing /analyze endpoint (updated)
# --------------------------
def image_to_base64(img: Image.Image) -> str:
    """Convert PIL Image to base64 data URL (for backward compatibility)"""
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{img_base64}"


def apply_segmentation(image: Image.Image):
    """Apply segmentation model to image (backward compatibility)"""
    if not segmentation_model:
        return None

    print("Starting segmentation (backward compatible)...")
    import numpy as np
    import cv2

    img_np = np.array(image)
    if len(img_np.shape) == 2:
        img_gray = img_np
    elif img_np.shape[2] == 4:
        img_gray = cv2.cvtColor(img_np, cv2.COLOR_RGBA2GRAY)
    else:
        img_gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)

    img_original_color = img_np
    if len(img_original_color.shape) == 2:
        img_original_color = cv2.cvtColor(img_original_color, cv2.COLOR_GRAY2RGB)
    elif img_original_color.shape[2] == 4:
        img_original_color = cv2.cvtColor(img_original_color, cv2.COLOR_RGBA2RGB)

    img_resized = cv2.resize(img_gray, (512, 512), interpolation=cv2.INTER_LANCZOS4)
    img_normalized = img_resized / 255.0
    img_input = np.expand_dims(img_normalized, axis=(0, -1))

    pred_mask = segmentation_model.predict(img_input, verbose=0)[0]
    pred_mask = (pred_mask > 0.5).astype(np.uint8) * 255

    pred_mask_resized = cv2.resize(pred_mask, (img_original_color.shape[1], img_original_color.shape[0]), interpolation=cv2.INTER_LANCZOS4)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    pred_mask_clean = cv2.morphologyEx(pred_mask_resized, cv2.MORPH_OPEN, kernel)
    pred_mask_clean = cv2.morphologyEx(pred_mask_clean, cv2.MORPH_CLOSE, kernel)
    pred_mask_smooth = cv2.GaussianBlur(pred_mask_clean, (5, 5), 1)
    pred_mask_final = (pred_mask_smooth > 127).astype(np.uint8) * 255

    pred_mask_3channel = cv2.cvtColor(pred_mask_final, cv2.COLOR_GRAY2RGB)
    img_segmented = cv2.bitwise_and(img_original_color, pred_mask_3channel)

    print("Segmentation complete (backward compatible)!")
    return Image.fromarray(img_segmented)


@app.get("/")
def home():
    return {
        "message": "Smilo AI System is Online 🦷",
        "yolo_loaded": yolo_model is not None,
        "segmentation_loaded": segmentation_model is not None,
        "teeth_segmenter_service_loaded": teeth_segmenter is not None,
        "caries_detector_service_loaded": caries_detector is not None
    }


@app.post("/analyze")
async def analyze_xray(file: UploadFile = File(...)):
    print(f"Received file: {file.filename}, content_type: {file.content_type}")

    valid_types = ["image/jpeg", "image/png", "image/jpg", "image/pjpeg", "image/x-png", "image/webp"]
    if file.content_type not in valid_types:
        print(f"Invalid content type: {file.content_type}")
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload JPG, PNG, or WEBP.")

    try:
        contents = await file.read()
        original_image = Image.open(io.BytesIO(contents))
        print(f"Loaded image, mode: {original_image.mode}, size: {original_image.size}")

        case_id = str(uuid.uuid4())
        output_dir = os.path.join("static", "segmentations", case_id)
        os.makedirs(output_dir, exist_ok=True)

        original_image_path = os.path.join(output_dir, "original.png")
        original_image.convert("RGB").save(original_image_path, compress_level=0)

        # Use our new TeethSegmenter if available
        if teeth_segmenter:
            segmentation_result = teeth_segmenter.segment_image(
                image_path=original_image_path,
                case_id=case_id,
                force_resegment=True
            )
            overlay_url = segmentation_result["urls"]["overlay_url"]
            visual_extracted_url = segmentation_result["urls"]["visual_teeth_extracted_url"]
            models_used = {
                "segmentation": True,
                "caries_detection": caries_detector is not None or yolo_model is not None
            }
        else:
            # Fall back to old method
            segmented_image = apply_segmentation(original_image)
            original_image_base64 = image_to_base64(original_image)
            segmented_image_base64 = image_to_base64(segmented_image) if segmented_image else None
            overlay_url = None
            visual_extracted_url = None
            models_used = {
                "segmentation": segmentation_model is not None,
                "caries_detection": yolo_model is not None
            }

        # Run caries detection
        detections = []
        if caries_detector:
            detections = caries_detector.detect(original_image, conf_threshold=0.25)
        elif yolo_model:
            # Fall back to old method
            input_for_yolo = segmented_image if segmented_image else original_image
            results = yolo_model(input_for_yolo, conf=0.25)
            for result in results:
                for box in result.boxes:
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    confidence = float(box.conf[0])
                    detections.append({
                        "box": [x1, y1, x2, y2],
                        "confidence": confidence,
                        "class": "Caries"
                    })
                    print(f"YOLO detected caries")

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
            "original_image_url": f"/static/segmentations/{case_id}/original.png" if teeth_segmenter else None,
            "models_used": models_used
        }

        # For backward compatibility, also include base64 images if old method was used
        if not teeth_segmenter:
            response_data["original_image"] = original_image_base64
            response_data["segmented_image"] = segmented_image_base64
            response_data["imageUrl"] = original_image_base64

        print(f"Returning response with severity: {severity}")
        return JSONResponse(content=response_data)

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in analyze_xray: {e}")
        import traceback
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})

