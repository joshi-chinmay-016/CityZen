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

"""
YOLO Model Service
Handles model loading and inference for hazard detection.
"""

import os
from pathlib import Path
from ultralytics import YOLO

# Get the model path relative to this file
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "model" / "best.pt"

# Global model instance (loaded once)
_model = None


def get_model():
    """
    Load YOLO model once and return it.
    Uses global singleton pattern to avoid reloading model on every prediction.
    """
    global _model
    if _model is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")
        _model = YOLO(str(MODEL_PATH))
    return _model


def predict_image(image_path: str) -> dict | None:
    """
    Run YOLO inference on an image and extract hazard information.

    Args:
        image_path (str): Path to the image file

    Returns:
        dict: {"label": str, "confidence": float} or None if no detection
    """
    try:
        if not os.path.exists(image_path):
            return None

        model = get_model()
        results = model(image_path)

        # Check if results exist and have detections
        if not results or len(results) == 0:
            return None

        result = results[0]

        # Handle classification task (as in original app.py)
        if hasattr(result, "probs") and result.probs is not None:
            label = result.names[int(result.probs.top1)]
            confidence = float(result.probs.top1conf)
            return {"label": label, "confidence": confidence}

        # Handle detection task (alternative)
        if hasattr(result, "boxes") and len(result.boxes) > 0:
            # Get first detection
            box = result.boxes[0]
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])
            label = result.names[class_id]
            return {"label": label, "confidence": confidence}

        return None

    except Exception as e:
        print(f"Error during prediction: {str(e)}")
        return None
