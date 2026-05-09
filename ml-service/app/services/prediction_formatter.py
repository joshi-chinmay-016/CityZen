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

from datetime import datetime, timezone
import logging
import uuid

from app.constants import ALLOWED_HAZARDS
from app.constants import CLASS_NAME_TO_HAZARD
from app.services.severity_service import SeverityService


logger = logging.getLogger(__name__)

class PredictionFormatter:
    def __init__(self):
        self.severity_service = SeverityService()

    def format(self, predictions, latitude, longitude):
        formatted_predictions = []

        if not isinstance(predictions, list):
            logger.warning("Prediction formatter received unsupported predictions type: %s", type(predictions).__name__)
            return formatted_predictions

        for prediction in predictions:
            if not isinstance(prediction, dict):
                logger.warning("Prediction formatter skipped malformed prediction: %s", prediction)
                continue

            label = prediction.get("label", "unknown")
            confidence = prediction.get("confidence", 0)

            # Validation
            if not self._validate_input(label, confidence, latitude, longitude):
                logger.warning(
                    "Prediction formatter rejected prediction: label=%s confidence=%s latitude=%s longitude=%s",
                    label,
                    confidence,
                    latitude,
                    longitude,
                )
                continue
            
            hazard = self._normalize_hazard(label)
            rounded_confidence = round(float(confidence), 4)
            severity = self.severity_service.map_severity(hazard, rounded_confidence)

            logger.info(
                "Formatting prediction: source_label=%s hazard=%s confidence=%s severity=%s",
                label,
                hazard,
                rounded_confidence,
                severity,
            )
            
            report = self._build_report(hazard, severity, rounded_confidence, latitude, longitude)
            formatted_predictions.append(report)

        return formatted_predictions

    def format_fallback(self, latitude, longitude):
        hazard = "pothole"
        confidence = 0.78
        severity = "high"

        logger.info(
            "Formatting fallback prediction: hazard=%s confidence=%s severity=%s latitude=%s longitude=%s",
            hazard,
            confidence,
            severity,
            latitude,
            longitude,
        )

        return [self._build_report(hazard, severity, confidence, latitude, longitude)]

    def empty_response(self, message="No hazards detected"):
        return {
            "message": message,
            "predictions": [],
        }

    def wrap_response(self, predictions, message=None):
        response = {
            "predictions": predictions if isinstance(predictions, list) else [],
        }
        if message is not None:
            response["message"] = message
        return response

    def _validate_input(self, label, confidence, lat, lng):
        if not label or label == "unknown":
            return False
        if not isinstance(confidence, (int, float)):
            return False
        if not (0 <= float(confidence) <= 1):
            return False
        if not (-90 <= lat <= 90):
            return False
        if not (-180 <= lng <= 180):
            return False
        if self._normalize_hazard(label) not in ALLOWED_HAZARDS:
            return False
        return True

    def _normalize_hazard(self, label):
        normalized_label = str(label).strip().lower()
        return CLASS_NAME_TO_HAZARD.get(normalized_label, normalized_label)

    def _build_report(self, hazard, severity, confidence, latitude, longitude):
        return {
            "id": str(uuid.uuid4()),
            "latitude": latitude,
            "longitude": longitude,
            "hazard": hazard,
            "severity": severity,
            "confidence": round(float(confidence), 4),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
