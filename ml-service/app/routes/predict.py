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
Prediction Route
Main endpoint for hazard detection and reporting.
"""

import os
import time
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional

from services.yolov8_service import predict_image
from services.severity_service import get_severity
from services.firestore_service import (
    save_hazard,
    check_duplicate_hazard,
    increment_hazard_count,
)
import requests

router = APIRouter()

# Mapping for backend API compatibility
BACKEND_MAPPING = {"pothole": "pothole", "crack": "pothole", "manhole": "safety"}


@router.post("/predict")
async def predict(
    file: UploadFile = File(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
):
    """
    Predict hazards in uploaded image and save to Firestore + backend API.

    Args:
        file (UploadFile): Image file (jpg, png, etc.)
        latitude (float): GPS latitude
        longitude (float): GPS longitude

    Returns:
        dict: Hazard prediction result or error message
    """
    temp_filename = None
    try:
        # 1. Save image temporarily
        temp_filename = f"temp_{int(time.time() * 1000)}.jpg"
        with open(temp_filename, "wb") as f:
            f.write(await file.read())

        # 2. Run YOLO prediction
        prediction = predict_image(temp_filename)

        if not prediction or not prediction.get("label"):
            return {"error": "No hazard detected"}

        label = prediction["label"]
        confidence = prediction["confidence"]

        # 3. Get severity information
        severity_info = get_severity(label)

        # 4. Create hazard object
        hazard_data = {
            "hazard_type": label,
            "severity": severity_info["severity"],
            "severity_score": severity_info["score"],
            "confidence": round(confidence, 4),
            "lat": latitude,
            "lng": longitude,
            "timestamp": datetime.utcnow().isoformat(),
        }

        # 5. Check for duplicate hazards
        duplicate = check_duplicate_hazard(
            lat=latitude, lng=longitude, label=label, time_window_mins=5
        )

        if duplicate:
            # Increment count on existing hazard instead of creating new one
            doc_id = duplicate.get("id")
            increment_hazard_count(doc_id)
            print(f"Duplicate hazard detected, incremented count for {doc_id}")
            return {
                "hazard_type": label,
                "severity": severity_info["severity"],
                "severity_score": severity_info["score"],
                "confidence": round(confidence, 4),
                "lat": latitude,
                "lng": longitude,
                "timestamp": hazard_data["timestamp"],
                "status": "duplicate_recorded",
            }

        # 6. Save to Firestore
        firestore_doc_id = save_hazard(hazard_data)

        # 7. Send to backend API (maintain backward compatibility)
        try:
            backend_type = BACKEND_MAPPING.get(label, label)
            backend_payload = {
                "lat": latitude,
                "lng": longitude,
                "type": backend_type,
                "timestamp": int(time.time() * 1000),
            }
            # Try to send to backend, but don't fail if it's unavailable
            requests.post("http://localhost:5001/report", json=backend_payload, timeout=2)
        except Exception as e:
            print(f"Warning: Could not reach backend API: {str(e)}")

        # 8. Return success response
        return {
            "hazard_type": label,
            "severity": severity_info["severity"],
            "severity_score": severity_info["score"],
            "confidence": round(confidence, 4),
            "lat": latitude,
            "lng": longitude,
            "timestamp": hazard_data["timestamp"],
            "firestore_id": firestore_doc_id,
        }

    except Exception as e:
        print(f"Error in predict endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

    finally:
        # Clean up temporary file
        if temp_filename and os.path.exists(temp_filename):
            try:
                os.remove(temp_filename)
            except Exception as e:
                print(f"Warning: Could not delete temp file {temp_filename}: {str(e)}")
