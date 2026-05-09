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

# MODULE: API Response Schemas

from typing import Optional

from pydantic import BaseModel, Field


class PredictionResponse(BaseModel):
    id: str
    latitude: float
    longitude: float
    hazard: str
    severity: str
    confidence: float
    timestamp: str


class PredictAPIResponse(BaseModel):
    message: Optional[str] = None
    predictions: list[PredictionResponse] = Field(default_factory=list)
