import api from './api';
import { RouteCoordinate } from '@/types/route';

export interface RouteRequest {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  preferences?: {
    avoidHighStress?: boolean;
    prioritizeSafety?: boolean;
  };
}

export interface SafeRouteResponse {
  stress_score: number;
  safe: boolean;
  route: RouteCoordinate[];
}

export const routeService = {
  getSafeRoute: async (params: RouteRequest): Promise<SafeRouteResponse> => {
    try {
      // Translate frontend-friendly params to backend contract
      const payload = {
        source: [params.startLat, params.startLng],
        destination: [params.endLat, params.endLng],
        preferences: params.preferences || {}
      };

      const response = await api.post<SafeRouteResponse>('/routes/safe-route', payload);
      return response.data;
    } catch (error) {
      console.error('Error calculating safe route:', error);
      throw error;
    }
  },
};
