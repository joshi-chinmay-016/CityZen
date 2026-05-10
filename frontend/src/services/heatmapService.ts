import api from './api';

export type HeatmapDataPoint = [number, number, number]; // [lat, lng, intensity]

export const heatmapService = {
  getHeatmapData: async (): Promise<HeatmapDataPoint[]> => {
    try {
      const response = await api.get<HeatmapDataPoint[]>('/heatmap');
      return response.data;
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
      throw error;
    }
  },
};
