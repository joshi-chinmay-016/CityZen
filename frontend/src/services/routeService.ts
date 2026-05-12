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
  id?: string;
  stress_score: number;
  safe: boolean;
  route: RouteCoordinate[];
  distance_meters?: number;
  duration_seconds?: number;
  hazards?: number;
  routes?: Array<{
    id: string;
    stress_score: number;
    safe: boolean;
    route: RouteCoordinate[];
    distance_meters: number;
    duration_seconds: number;
    hazards: number;
  }>;
}

export const routeService = {
  getSafeRoute: async (params: RouteRequest): Promise<SafeRouteResponse> => {
    try {
      const response = await api.post<SafeRouteResponse>('/routes/safe-route', {
        source: [params.startLat, params.startLng],
        destination: [params.endLat, params.endLng],
        preferences: params.preferences,
      });
      return response.data;
    } catch (error) {
      console.error('Error calculating safe route:', error);
      throw error;
    }
  },
};
