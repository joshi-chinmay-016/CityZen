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
import uuid
from datetime import datetime

class PredictionFormatter:
    def __init__(self):
        self.severity_service = SeverityService()

    def format(self, predictions, latitude, longitude):
        formatted_predictions = []

        for prediction in predictions or []:
            label = prediction.get("label", "unknown")
            confidence = prediction.get("confidence", 0)
            
            # Validation
            if not self._validate_input(label, confidence, latitude, longitude):
                continue
            
            hazard = self._normalize_hazard(label)
            severity = self.severity_service.map_severity(hazard)
            
            report = {
                "id": str(uuid.uuid4()),
                "latitude": latitude,
                "longitude": longitude,
                "hazard": hazard,
                "severity": severity,
                "confidence": confidence,
                "timestamp": datetime.utcnow().isoformat()
            }
            formatted_predictions.append(report)

        return formatted_predictions

    def _validate_input(self, label, confidence, lat, lng):
        if not label or label == "unknown":
            return False
        if not (0 <= confidence <= 1):
            return False
        if not (-90 <= lat <= 90):
            return False
        if not (-180 <= lng <= 180):
            return False
        return True

    def _normalize_hazard(self, label):
        # Normalize to standard hazards
        mapping = {
            "pothole": "pothole",
            "crack": "crack",
            "debris": "debris",
            "flood": "flood",
            "manhole": "open_manhole",
            "open manhole": "open_manhole"
        }
        return mapping.get(label.lower(), "pothole")  # default to pothole
