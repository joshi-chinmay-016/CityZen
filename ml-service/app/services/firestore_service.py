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

class FirestoreService:
    _predictions = []

    def __init__(self):
        pass

    def save_prediction(self, data: dict):
        self.__class__._predictions.append(data)
        return data

    def get_heatmap_data(self):
        return list(self.__class__._predictions)
