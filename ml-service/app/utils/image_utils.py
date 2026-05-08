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

# MODULE: Image Utilities

from fastapi import UploadFile


async def read_upload_bytes(file: UploadFile) -> bytes:
    return await file.read()
