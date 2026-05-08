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

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class PredictionRequest(BaseModel):
    image: str = Field(..., description="Base64 encoded image")
    threshold: Optional[float] = Field(0.5, description="Confidence threshold")
    max_detections: Optional[int] = Field(100, description="Maximum number of detections")

class PredictionResponse(BaseModel):
    predictions: List[Dict[str, Any]]
    count: int
    timestamp: str
    image_path: Optional[str]

class HazardReport(BaseModel):
    lat: float
    lng: float
    type: str
    severity: str
    confidence: float
    timestamp: datetime

class AnalyticsRequest(BaseModel):
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    area: Optional[Dict[str, float]]  # bounding box

class HeatmapRequest(BaseModel):
    area: Optional[Dict[str, float]]
    resolution: Optional[int] = 100