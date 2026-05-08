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

# MODULE: Prediction Formatter Service

from app.services.severity_service import SeverityService


class PredictionFormatter:
    def __init__(self):
        self.severity_service = SeverityService()

    def format(self, predictions):
        formatted_predictions = []

        for prediction in predictions or []:
            label = prediction.get("label", "unknown")
            formatted_predictions.append(
                {
                    "label": label,
                    "confidence": prediction.get("confidence", 0),
                    "bbox": prediction.get("bbox", []),
                    "severity": self.severity_service.map_severity(label),
                }
            )

        return {
            "count": len(formatted_predictions),
            "predictions": formatted_predictions,
        }
