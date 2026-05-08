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

class SeverityService:
    def __init__(self):
        self.severity_map = {
            "pothole": "medium",
            "crack": "low",
            "debris": "high",
            "flood": "critical"
        }

    def map_severity(self, label: str) -> str:
        return self.severity_map.get(label.lower(), "low")
