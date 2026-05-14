import math
import logging
from app.schemas.sensor import SensorDataInput, SensorAnalysisResult

logger = logging.getLogger(__name__)

class SensorAnalysisService:
    @staticmethod
    def analyze(data: SensorDataInput) -> SensorAnalysisResult:
        """
        Analyzes road conditions based on simulated accelerometer, gyroscope, and vibration data.
        """
        # 1. Calculate Road Roughness Score (0.0 to 1.0)
        # Based on vibration intensity, acceleration spikes, and gyro instability
        
        # Calculate vertical acceleration deviation (Z-axis is gravity usually around 9.8)
        accel_deviation = abs(data.accel_z - 9.81)
        
        # Calculate gyro instability (sum of absolute changes)
        gyro_instability = abs(data.gyro_x) + abs(data.gyro_y) + abs(data.gyro_z)
        
        # Weighted combination
        # Higher vibration = rougher road
        # Higher acceleration spikes = more potholes/bumps
        # Higher gyro instability = uneven surface
        roughness_score = (
            (data.vibration_intensity * 0.5) +
            (min(accel_deviation / 5.0, 1.0) * 0.3) +
            (min(gyro_instability / 2.0, 1.0) * 0.2)
        )
        roughness_score = min(max(roughness_score, 0.0), 1.0)
        
        # 2. Determine Anomaly Confidence (low, medium, high)
        if roughness_score > 0.7:
            anomaly_confidence = "high"
        elif roughness_score > 0.4:
            anomaly_confidence = "medium"
        else:
            anomaly_confidence = "low"
            
        # 3. Determine Stress Level (smooth, moderate, rough)
        if roughness_score > 0.75:
            stress_level = "rough"
            heatmap_intensity = 0.9 + (roughness_score * 0.1)
            recommended = False
        elif roughness_score > 0.35:
            stress_level = "moderate"
            heatmap_intensity = 0.5 + (roughness_score * 0.3)
            recommended = True
        else:
            stress_level = "smooth"
            heatmap_intensity = roughness_score * 0.4
            recommended = True
            
        # Normalize heatmap intensity for system compatibility
        heatmap_intensity = min(max(heatmap_intensity, 0.1), 1.0)
        
        logger.info(
            "Sensor analysis complete: roughness=%.2f confidence=%s stress=%s",
            roughness_score, anomaly_confidence, stress_level
        )
        
        return SensorAnalysisResult(
            roughness_score=round(roughness_score, 2),
            anomaly_confidence=anomaly_confidence,
            stress_level=stress_level,
            heatmap_intensity=round(heatmap_intensity, 2),
            recommended=recommended
        )
