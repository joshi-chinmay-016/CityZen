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

# MODULE: ML Analytics Routes

from fastapi import APIRouter

from app.services.firestore_service import FirestoreService
from app.utils.response_utils import success_response

router = APIRouter()
firestore_service = FirestoreService()


@router.get("/")
async def get_analytics():
    data = firestore_service.get_heatmap_data()
    total_predictions = len(data)
    return success_response(
        {
            "total_predictions": total_predictions,
            "heatmap_points": total_predictions,
            "items": data,
        }
    )
