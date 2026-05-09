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

router = APIRouter()
firestore_service = FirestoreService()


@router.get("/")
async def get_analytics():
    try:
        predictions = firestore_service._predictions  # access private for analytics
        total_reports = len(predictions)
        high_severity = sum(1 for p in predictions if p['severity'] == 'high')
        potholes = sum(1 for p in predictions if p['hazard'] == 'pothole')
        cracks = sum(1 for p in predictions if p['hazard'] == 'crack')
        open_manholes = sum(1 for p in predictions if p['hazard'] == 'open_manhole')
        
        return {
            "total_reports": total_reports,
            "high_severity": high_severity,
            "potholes": potholes,
            "cracks": cracks,
            "open_manholes": open_manholes
        }
    except Exception as e:
        return {"error": "Failed to get analytics", "details": str(e)}
