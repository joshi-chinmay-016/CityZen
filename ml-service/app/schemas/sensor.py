from pydantic import BaseModel, Field
from typing import Optional

class SensorDataInput(BaseModel):
    accel_x: float = Field(..., description="Accelerometer X-axis value")
    accel_y: float = Field(..., description="Accelerometer Y-axis value")
    accel_z: float = Field(..., description="Accelerometer Z-axis value")
    gyro_x: float = Field(..., description="Gyroscope X-axis value")
    gyro_y: float = Field(..., description="Gyroscope Y-axis value")
    gyro_z: float = Field(..., description="Gyroscope Z-axis value")
    latitude: float = Field(..., description="GPS Latitude")
    longitude: float = Field(..., description="GPS Longitude")
    speed: float = Field(..., description="Vehicle speed in km/h")
    vibration_intensity: float = Field(..., description="Vibration intensity (0.0 to 1.0)")

class SensorAnalysisResult(BaseModel):
    roughness_score: float
    anomaly_confidence: str
    stress_level: str
    heatmap_intensity: float
    recommended: bool
