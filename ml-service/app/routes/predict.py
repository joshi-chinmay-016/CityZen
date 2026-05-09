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

# MODULE: ML Prediction Routes

from fastapi import APIRouter, UploadFile, File, Form
from app.services.yolov8_service import YOLOv8Service
from app.services.prediction_formatter import PredictionFormatter
from app.services.firestore_service import FirestoreService

router = APIRouter()
yolo_service = YOLOv8Service()
formatter = PredictionFormatter()
firestore_service = FirestoreService()

@router.post("/")
async def predict(
    file: UploadFile = File(...),
    latitude: float = Form(...),
    longitude: float = Form(...)
):
    try:
        results = await yolo_service.predict(file)
        formatted_results = formatter.format(results, latitude, longitude)
        # Filter duplicates
        filtered_results = []
        for report in formatted_results:
            if not firestore_service.is_duplicate(
                report['latitude'], report['longitude'], report['hazard'], report['timestamp']
            ):
                filtered_results.append(report)
                firestore_service.save_prediction(report)
        return filtered_results
    except Exception as e:
        return {"error": "Prediction failed", "details": str(e)}
