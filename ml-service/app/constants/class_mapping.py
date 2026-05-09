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

# MODULE: YOLO Class Mapping Constants

YOLO_CONFIDENCE_THRESHOLD = 0.2

# Maps model class ids to canonical hazard labels used by the API.
CLASS_ID_TO_HAZARD = {
    0: "crack",
    1: "open_manhole",
    2: "pothole",
}

# Normalizes model-provided or user-facing labels to canonical hazards.
CLASS_NAME_TO_HAZARD = {
    "crack": "crack",
    "manhole": "open_manhole",
    "open manhole": "open_manhole",
    "open_manhole": "open_manhole",
    "pothole": "pothole",
}

ALLOWED_HAZARDS = set(CLASS_NAME_TO_HAZARD.values())
