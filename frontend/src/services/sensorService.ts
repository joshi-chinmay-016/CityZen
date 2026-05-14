import axios from 'axios';

const ML_API_BASE_URL = 'http://localhost:8000';

export interface SensorDataInput {
  accel_x: number;
  accel_y: number;
  accel_z: number;
  gyro_x: number;
  gyro_y: number;
  gyro_z: number;
  latitude: number;
  longitude: number;
  speed: number;
  vibration_intensity: number;
}

export interface SensorAnalysisResult {
  roughness_score: number;
  anomaly_confidence: 'low' | 'medium' | 'high';
  stress_level: 'smooth' | 'moderate' | 'rough';
  heatmap_intensity: number;
  recommended: boolean;
}

export const sensorService = {
  analyzeData: async (data: SensorDataInput): Promise<SensorAnalysisResult> => {
    try {
      const response = await axios.post<SensorAnalysisResult>(`${ML_API_BASE_URL}/sensor/analyze`, data);
      return response.data;
    } catch (error) {
      console.error('Error analyzing sensor data:', error);
      throw error;
    }
  }
};
