import api from './api';

export interface MLPredictionResponse {
  hazardDetected: boolean;
  hazardType: string;
  confidenceScore: number;
  boundingBox?: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
  stressMultiplier: number;
}

export const mlService = {
  predictHazard: async (imageFile: File): Promise<MLPredictionResponse> => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await api.post<MLPredictionResponse>('/ml/predict-hazard', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error predicting hazard from image:', error);
      throw error;
    }
  },
};
