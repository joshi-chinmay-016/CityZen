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

import cv2
import numpy as np
from typing import Tuple, Optional
import base64

def decode_base64_image(base64_string: str) -> np.ndarray:
    """
    Decode base64 image string to numpy array
    """
    try:
        # Remove data URL prefix if present
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]

        image_bytes = base64.b64decode(base64_string)
        image_array = np.frombuffer(image_bytes, dtype=np.uint8)
        image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        return image
    except Exception as e:
        raise ValueError(f"Failed to decode base64 image: {str(e)}")

def resize_image(image: np.ndarray, max_size: Tuple[int, int] = (640, 640)) -> np.ndarray:
    """
    Resize image maintaining aspect ratio
    """
    h, w = image.shape[:2]
    if w > h:
        new_w = max_size[0]
        new_h = int(h * (max_size[0] / w))
    else:
        new_h = max_size[1]
        new_w = int(w * (max_size[1] / h))

    resized = cv2.resize(image, (new_w, new_h))
    return resized

def validate_image(image: np.ndarray) -> bool:
    """
    Validate image dimensions and format
    """
    if image is None:
        return False

    h, w = image.shape[:2]
    if h < 10 or w < 10:
        return False

    return True