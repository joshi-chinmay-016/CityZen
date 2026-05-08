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

from typing import Dict, Any, List, Optional
from datetime import datetime

def format_prediction_response(predictions: List[Dict[str, Any]], image_path: Optional[str] = None) -> Dict[str, Any]:
    """
    Format YOLO prediction results into API response
    """
    formatted_predictions = []
    for pred in predictions:
        formatted_predictions.append({
            "class": pred.get("class", "unknown"),
            "confidence": float(pred.get("confidence", 0)),
            "bbox": pred.get("bbox", []),
            "severity": pred.get("severity", "low")
        })

    return {
        "predictions": formatted_predictions,
        "count": len(formatted_predictions),
        "timestamp": datetime.now().isoformat(),
        "image_path": image_path
    }

def format_analytics_response(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Format analytics data for API response
    """
    return {
        "analytics": data,
        "generated_at": datetime.now().isoformat()
    }