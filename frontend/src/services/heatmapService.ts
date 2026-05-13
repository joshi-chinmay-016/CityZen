import api from './api';

export type HeatmapDataPoint = [number, number, number]; // [lat, lng, intensity]

export const heatmapService = {
  getHeatmapData: async (): Promise<HeatmapDataPoint[]> => {
    try {
      const response = await api.get<HeatmapDataPoint[]>('/heatmap');
      return response.data;
    } catch (error: any) {
      // If backend doesn't expose heatmap yet (404), return empty data instead of throwing
      if (error?.response?.status === 404) {
        console.warn('Heatmap endpoint not found (404). Returning empty heatmap data.');
        return [];
      }
      console.error('Error fetching heatmap data:', error);
      throw error;
    }
  },
};
