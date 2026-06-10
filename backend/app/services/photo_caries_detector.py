from typing import List, Dict, Any
from PIL import Image

try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except ImportError:
    YOLO_AVAILABLE = False


class PhotoCariesDetector:
    def __init__(self, model_path: str = "best.pt"):
        self.model = None
        self.model_path = model_path
        
        if YOLO_AVAILABLE:
            try:
                self.model = YOLO(model_path)
                print(f"✅ Photo Caries Detector loaded from {model_path}")
            except Exception as e:
                print(f"⚠️ Failed to load Photo Caries Detector: {e}")
    
    def detect(self, image: Image.Image) -> List[Dict[str, Any]]:
        detections: List[Dict[str, Any]] = []
        
        if not self.model:
            print("⚠️ Photo Caries Detector not available")
            return detections
        
        try:
            results = self.model.predict(image, conf=0.45)
            
            for result in results:
                for box in result.boxes:
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    confidence = float(box.conf[0])
                    class_name = result.names[int(box.cls[0].item())]
                    
                    # Only keep detections that are specifically caries/cavities
                    class_lower = class_name.lower()
                    if 'caries' in class_lower or 'cavity' in class_lower:
                        detections.append({
                            "box": [x1, y1, x2, y2],
                            "confidence": confidence,
                            "class": "Caries"
                        })
                        print(f"Photo Caries Detected: {class_name} (confidence: {confidence:.2f})")
                    else:
                        print(f"Ignoring non-caries detection: {class_name}")
                    
        except Exception as e:
            print(f"Error in Photo Caries Detection: {e}")
            
        return detections
