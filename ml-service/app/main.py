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
from fastapi.middleware.cors import CORSMiddleware
from app.routes import predict, analytics, heatmap, auth, sensor

app = FastAPI(title="CityZen ML Service")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(predict.router, prefix="/predict", tags=["Prediction"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
app.include_router(heatmap.router, prefix="/heatmap", tags=["Heatmap"])
app.include_router(sensor.router, prefix="/sensor", tags=["Sensor Simulation"])

@app.get("/")
async def root():
    return {"message": "CityZen ML Service is running"}
