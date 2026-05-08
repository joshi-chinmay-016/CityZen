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
Heatmap Route
Returns optimized hazard data for frontend heatmap visualization.
"""

from fastapi import APIRouter
from services.firestore_service import get_all_hazards

router = APIRouter()


@router.get("/heatmap")
async def heatmap():
    """
    Get all hazard reports formatted for heatmap visualization.

    Returns:
        list: Array of [lat, lng, severity_score] tuples
              Example: [[12.97, 77.59, 5], [12.98, 77.60, 2]]
    """
    try:
        hazards = get_all_hazards()

        # Convert to heatmap format: [lat, lng, severity_score]
        heatmap_data = []
        for hazard in hazards:
            lat = hazard.get("lat")
            lng = hazard.get("lng")
            severity_score = hazard.get("severity_score", 0)
            report_count = hazard.get("report_count", 1)

            # Weight the score by number of reports (duplicates increase intensity)
            weighted_score = severity_score * report_count

            if lat is not None and lng is not None:
                heatmap_data.append([lat, lng, weighted_score])

        return heatmap_data

    except Exception as e:
        print(f"Error in heatmap endpoint: {str(e)}")
        return []
