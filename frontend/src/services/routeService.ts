import api from './api';
import { RouteCoordinate, SafeRouteResponse, SingleRoute } from '@/types/route';

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

export interface LegacySafeRouteResponse {
  stress_score: number;
  safe: boolean;
  route: RouteCoordinate[];
}

export const routeService = {
  /**
   * Get multiple safe routes sorted by stress score
   * Returns up to 3 routes: safest, moderate, risky
   */
  getSafeRoutes: async (params: RouteRequest): Promise<SingleRoute[]> => {
    try {
      const response = await api.post<SafeRouteResponse>('/safe-route', {
        start: [params.startLat, params.startLng],
        destination: [params.endLat, params.endLng],
        preferences: params.preferences,
      });
      
      // Ensure routes are sorted by stress_score (lowest first = safest)
      const routes = response.data.routes || [];
      return routes.sort((a, b) => a.stress_score - b.stress_score);
    } catch (error) {
      console.error('Error calculating safe routes:', error);
      throw error;
    }
  },

  /**
   * Legacy: Get single safe route (backward compatible)
   */
  getSafeRoute: async (params: RouteRequest): Promise<LegacySafeRouteResponse> => {
    try {
      const response = await api.post<LegacySafeRouteResponse>('/routes/safe-route', {
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

  /**
   * Calculate stress score for a route
   */
  calculateRouteStress: async (route: RouteCoordinate[]): Promise<{ stressScore: number; severity: 'low' | 'medium' | 'high'; recommended: boolean }> => {
    try {
      const response = await api.post('/route-stress', { route });
      return response.data;
    } catch (error) {
      console.error('Error calculating route stress:', error);
      throw error;
    }
  },
};
