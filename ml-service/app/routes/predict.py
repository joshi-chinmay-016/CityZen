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

from fastapi import APIRouter, UploadFile, File
from app.services.yolov8_service import YOLOv8Service
from app.services.prediction_formatter import PredictionFormatter
from app.services.firestore_service import FirestoreService

router = APIRouter()
yolo_service = YOLOv8Service()
formatter = PredictionFormatter()
firestore_service = FirestoreService()

@router.post("/")
async def predict(file: UploadFile = File(...)):
    results = await yolo_service.predict(file)
    formatted_results = formatter.format(results)
    firestore_service.save_prediction(formatted_results)
    return formatted_results
