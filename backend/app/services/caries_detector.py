from typing import List, Dict, Any
from PIL import Image
import numpy as np

try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except ImportError:
    YOLO_AVAILABLE = False


class CariesDetector:
    def __init__(self, model_path: str = "best.pt"):
        self.model = None
        self.model_path = model_path
        
        if YOLO_AVAILABLE:
            try:
                self.model = YOLO(model_path)
                print(f"✅ Caries detection model loaded from {model_path}")
            except Exception as e:
                print(f"⚠️ Failed to load caries detection model: {e}")
    
    def detect(self, image: Image.Image, conf_threshold: float = 0.25) -> List[Dict[str, Any]]:
        if not self.model:
            print("⚠️ Caries detector model not available")
            return []
        
        detections = []
        
        results = self.model(image, conf=conf_threshold)
        
        for result in results:
            for box in result.boxes:
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                confidence = float(box.conf[0])
                
                detections.append({
                    "box": [x1, y1, x2, y2],
                    "confidence": confidence,
                    "class": "Caries"
                })
        
        print(f"YOLO detected {len(detections)} caries")
        
        return detections

