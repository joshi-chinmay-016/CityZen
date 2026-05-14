import logging
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException
from app.schemas.sensor import SensorDataInput, SensorAnalysisResult
from app.services.sensor_analysis_service import SensorAnalysisService
from app.services.firestore_service import FirestoreService

logger = logging.getLogger(__name__)

router = APIRouter()
analysis_service = SensorAnalysisService()
firestore_service = FirestoreService()

@router.post("/analyze", response_model=SensorAnalysisResult)
async def analyze_sensor_data(data: SensorDataInput):
    """
    Analyzes simulated sensor data, stores results as a road report,
    and updates heatmaps/route stress intelligence.
    """
    try:
        logger.info(
            "Sensor data received: lat=%.4f lng=%.4f speed=%.1f vibration=%.2f",
            data.latitude, data.longitude, data.speed, data.vibration_intensity
        )
        
        # 1. Analyze the data
        result = analysis_service.analyze(data)
        
        # 2. Format as a hazard report for integration with existing systems
        # Mapping sensor stress to known hazard types for safest-route engine compatibility
        hazard_type = "unsafe road" if result.stress_level == "rough" else "manhole" if result.stress_level == "moderate" else "crack"
        
        severity_mapping = {
            "smooth": "low",
            "moderate": "medium",
            "rough": "high"
        }
        
        report = {
            "id": f"sensor-{uuid.uuid4().hex[:8]}",
            "latitude": data.latitude,
            "longitude": data.longitude,
            "hazard": hazard_type,
            "severity": severity_mapping.get(result.stress_level, "medium"),
            "confidence": 0.85 if result.anomaly_confidence == "high" else 0.65 if result.anomaly_confidence == "medium" else 0.45,
            "timestamp": datetime.now().isoformat(),
            "description": f"Sensor analysis: {result.stress_level} road detected (Speed: {data.speed}km/h)"
        }
        
        # 3. Sync to Backend API / Firestore
        # This automatically updates heatmaps and route stress calculations
        try:
            firestore_service.save_prediction(report)
        except Exception as e:
            logger.warning("Failed to sync sensor report to backend: %s", str(e))
            # Continue even if sync fails so user gets the analysis result
            
        return result
        
    except Exception as e:
        logger.exception("Sensor analysis endpoint failed")
        raise HTTPException(status_code=500, detail=str(e))
