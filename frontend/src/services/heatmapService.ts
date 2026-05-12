import api from './api';

export type HeatmapDataPoint = [number, number, number]; // [lat, lng, intensity]

const isHeatmapPoint = (value: unknown): value is HeatmapDataPoint => {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    typeof value[0] === 'number' &&
    typeof value[1] === 'number' &&
    typeof value[2] === 'number' &&
    Number.isFinite(value[0]) &&
    Number.isFinite(value[1]) &&
    Number.isFinite(value[2])
  );
};

export const heatmapService = {
  getHeatmapData: async (): Promise<HeatmapDataPoint[]> => {
    try {
      const response = await api.get<unknown>('/heatmap/heatmap');
      return Array.isArray(response.data) ? response.data.filter(isHeatmapPoint) : [];
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
      throw error;
    }
  },
};
