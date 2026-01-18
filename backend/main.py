from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from ultralytics import YOLO
from PIL import Image
import io
import json

# Initialize the App
app = FastAPI(title="Smilo AI Backend", version="1.0")

# 1. CORS Setup (Crucial for React connection)
# This allows your frontend (localhost:5173) to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080", "http://localhost:8081"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Load the AI Model
# We load it once when the server starts to save time
try:
    model = YOLO("best.pt")
    print("✅ Smilo AI Brain (best.pt) loaded successfully!")
except Exception as e:
    model = None
    print(f"❌ Error loading model: {e}")
    print("Did you put best.pt in the backend folder?")

@app.get("/")
def home():
    return {"message": "Smilo AI System is Online 🦷"}

@app.post("/analyze")
async def analyze_xray(file: UploadFile = File(...)):
    """
    Receives an X-ray image, detects caries, and returns the results.
    """
    if not model:
        raise HTTPException(status_code=500, detail="AI Model is not loaded")

    # A. Validate File Type
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload JPG or PNG.")

    try:
        # B. Read the Image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))

        # C. Run AI Inference
        # conf=0.25 means we only accept detections with >25% confidence
        results = model(image, conf=0.25) 
        
        # D. Process Results
        detections = []
        caries_count = 0
        
        # YOLO returns a list of results (one per image)
        for result in results:
            for box in result.boxes:
                # Get coordinates (x, y, width, height)
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                confidence = float(box.conf[0])
                
                detections.append({
                    "box": [x1, y1, x2, y2],
                    "confidence": round(confidence, 2),
                    "class": "Caries" # Since we only have one class
                })
                caries_count += 1

        # E. Determine Severity
        severity = "Healthy"
        if caries_count > 0:
            severity = "Mild" if caries_count <= 2 else "Severe"

        return JSONResponse(content={
            "filename": file.filename,
            "status": "success",
            "findings": detections,
            "total_issues": caries_count,
            "severity_level": severity,
            "recommendation": "Consult a dentist immediately." if caries_count > 0 else "Routine checkup recommended."
        })

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})