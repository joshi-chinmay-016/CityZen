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

"""
Analytics Route
Returns summary statistics and analytics about hazard reports.
"""

from fastapi import APIRouter
from services.firestore_service import get_analytics

router = APIRouter()


@router.get("/analytics")
async def analytics():
    """
    Get analytics summary for all hazard reports.

    Returns:
        dict: {
            "total_reports": int,
            "high": int,
            "medium": int,
            "low": int,
            "by_type": {hazard_type: count}
        }
    """
    try:
        stats = get_analytics()
        return stats

    except Exception as e:
        print(f"Error in analytics endpoint: {str(e)}")
        return {
            "total_reports": 0,
            "high": 0,
            "medium": 0,
            "low": 0,
            "by_type": {},
        }
