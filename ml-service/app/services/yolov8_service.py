"""
====================================================
OWNER: Chinmay
MODULE: ML Services & AI Inference

RESPONSIBILITIES:
- YOLOv8 Inference
- Prediction APIs
- Severity Mapping
- Heatmap Data Generation
- ML Processing
====================================================
"""

# MODULE: YOLOv8 Inference Service

from ultralytics import YOLO
from app.constants import MODEL_PATH
from app.utils.image_utils import read_upload_bytes
import io
from PIL import Image

class YOLOv8Service:
    def __init__(self, model_path=MODEL_PATH):
        self.model_path = model_path
        self.model = YOLO(model_path)  # Load model once

    async def predict(self, file):
        image_bytes = await read_upload_bytes(file)
        image = Image.open(io.BytesIO(image_bytes))
        results = self.model(image)
        predictions = []
        for result in results:
            for box in result.boxes:
                predictions.append({
                    "label": result.names[int(box.cls)],
                    "confidence": float(box.conf),
                    "bbox": box.xyxy.tolist()
                })
        return predictions
