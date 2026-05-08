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

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import time
import requests
import os

# Import new routers
from routes.predict import router as predict_router
from routes.heatmap import router as heatmap_router
from routes.analytics import router as analytics_router

app = FastAPI(title="CityZen Hazard Intelligence Service")

# Add CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model (legacy - keep for backward compatibility)
model = YOLO("models/best.pt") if os.path.exists("models/best.pt") else None

# Mapping to backend types
mapping = {
    "pothole": "pothole",
    "crack": "pothole",
    "manhole": "safety"
}

# Register new routers for Hazard Intelligence Service
app.include_router(predict_router, tags=["Hazard Detection"])
app.include_router(heatmap_router, tags=["Analytics"])
app.include_router(analytics_router, tags=["Analytics"])

# Legacy endpoint (kept for backward compatibility)
@app.post("/predict-legacy")
async def predict_legacy(file: UploadFile = File(...)):
    """
    Legacy prediction endpoint. Use POST /predict instead for new hazard intelligence features.
    """
    if not model:
        return {"error": "Model not loaded"}

    # Save image temporarily
    with open("temp.jpg", "wb") as f:
        f.write(await file.read())

    # Run prediction
    results = model("temp.jpg")[0]
    label = results.names[int(results.probs.top1)]
    confidence = float(results.probs.top1conf)

    # Convert to backend format
    payload = {
        "lat": 12.97,   # you can replace later with real GPS
        "lng": 77.59,
        "type": mapping[label],
        "timestamp": int(time.time() * 1000)
    }

    # Send to backend
    try:
        requests.post("http://localhost:5001/report", json=payload, timeout=2)
    except:
        pass

    return {
        "prediction": label,
        "confidence": confidence,
        "sent_to_backend": payload
    }

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok", "service": "CityZen Hazard Intelligence"}

