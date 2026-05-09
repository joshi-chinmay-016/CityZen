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

# MODULE: Hazard Severity Mapping Service

import logging


logger = logging.getLogger(__name__)


class SeverityService:
    def __init__(self):
        self.severity_map = {
            "pothole": "medium",
            "crack": "low",
            "manhole": "high",
            "open_manhole": "high"
        }

    def map_severity(self, label: str, confidence: float | None = None) -> str:
        normalized_label = str(label).strip().lower()

        if normalized_label == "pothole" and isinstance(confidence, (int, float)):
            severity = "high" if float(confidence) >= 0.8 else "medium"
        else:
            severity = self.severity_map.get(normalized_label, "low")

        if severity not in {"low", "medium", "high"}:
            logger.warning("Unsupported severity resolved for label=%s confidence=%s", label, confidence)
            return "low"

        logger.info("Severity mapped: label=%s confidence=%s severity=%s", label, confidence, severity)
        return severity
