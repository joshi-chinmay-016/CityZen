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

# MODULE: ML Service Main Entry Point

from fastapi import FastAPI
from app.routes import predict, analytics, heatmap

app = FastAPI(title="CityZen ML Service")

# Include Routers
app.include_router(predict.router, prefix="/predict", tags=["Prediction"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
app.include_router(heatmap.router, prefix="/heatmap", tags=["Heatmap"])

@app.get("/")
async def root():
    return {"message": "CityZen ML Service is running"}
