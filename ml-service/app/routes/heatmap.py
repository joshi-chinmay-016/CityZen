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

# MODULE: ML Heatmap Routes

from fastapi import APIRouter

from app.services.firestore_service import FirestoreService
from app.utils.response_utils import success_response

router = APIRouter()
firestore_service = FirestoreService()


@router.get("/")
async def get_heatmap():
    return success_response(firestore_service.get_heatmap_data())
