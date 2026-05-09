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

# MODULE: ML Firestore Integration Service

from app.services.duplicate_filter import DuplicateFilter

class FirestoreService:
    _predictions = []
    _duplicate_filter = DuplicateFilter()

    def __init__(self):
        pass

    def save_prediction(self, report: dict):
        self.__class__._predictions.append(report)
        return report

    def is_duplicate(self, lat, lng, hazard, timestamp):
        # timestamp is iso string, convert to float
        import time
        from datetime import datetime
        ts = datetime.fromisoformat(timestamp).timestamp()
        return self.__class__._duplicate_filter.is_duplicate(lat, lng, hazard, ts)

    def get_heatmap_data(self):
        # Return [[lat, lng, intensity]]
        heatmap = []
        for report in self.__class__._predictions:
            intensity = self._get_intensity(report['severity'])
            heatmap.append([
                report['latitude'],
                report['longitude'],
                intensity
            ])
        return heatmap

    def _get_intensity(self, severity):
        mapping = {
            "low": 0.3,
            "medium": 0.6,
            "high": 1.0
        }
        return mapping.get(severity, 0.5)
