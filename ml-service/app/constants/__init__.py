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

# Model constants
MODEL_PATH = "models/best.pt"
CONFIDENCE_THRESHOLD = 0.5
MAX_DETECTIONS = 100

# Hazard types mapping
HAZARD_MAPPING = {
    "pothole": "pothole",
    "crack": "pothole",
    "manhole": "safety"
}

# Severity levels
SEVERITY_LEVELS = {
    "low": 0.3,
    "medium": 0.6,
    "high": 0.8
}

# API constants
API_TITLE = "CityZen Hazard Intelligence Service"
API_VERSION = "1.0.0"
API_DESCRIPTION = "AI-powered hazard detection and analytics service"