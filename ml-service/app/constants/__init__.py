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

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = str(BASE_DIR / "models" / "best.pt")

from app.constants.class_mapping import ALLOWED_HAZARDS
from app.constants.class_mapping import CLASS_ID_TO_HAZARD
from app.constants.class_mapping import CLASS_NAME_TO_HAZARD
from app.constants.class_mapping import YOLO_CONFIDENCE_THRESHOLD
