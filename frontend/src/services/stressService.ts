import api from './api';
import { RouteCoordinate, RouteSeverity } from '@/types/route';

export interface RouteStressResponse {
  stressScore: number;
  severity: RouteSeverity;
  recommended: boolean;
}

export interface StressAnalysis {
  stressScore: number;
  severity: RouteSeverity;
  percentile: number; // 0-100, how risky compared to other routes
  hazardCount: number;
  avgHazardDensity: number;
  recommendations: string[];
}

export const stressService = {
  /**
   * Calculate stress score for a route
   */
  calculateStress: async (route: RouteCoordinate[]): Promise<RouteStressResponse> => {
    try {
      const response = await api.post<RouteStressResponse>('/route-stress', { route });
      return response.data;
    } catch (error) {
      console.error('Error calculating route stress:', error);
      throw error;
    }
  },

  /**
   * Analyze stress with detailed metrics
   */
  analyzeStress: async (route: RouteCoordinate[]): Promise<StressAnalysis> => {
    try {
      const response = await api.post<StressAnalysis>('/route-stress-analysis', { route });
      return response.data;
    } catch (error) {
      console.error('Error analyzing route stress:', error);
      throw error;
    }
  },

  /**
   * Get severity badge color
   */
  getSeverityColor: (severity: RouteSeverity): string => {
    const colors: Record<RouteSeverity, string> = {
      low: '#16a34a', // green
      medium: '#ea8c1f', // yellow/orange
      high: '#ef4444', // red
    };
    return colors[severity];
  },

  /**
   * Get severity badge text color
   */
  getSeverityBgClass: (severity: RouteSeverity): string => {
    const classes: Record<RouteSeverity, string> = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    };
    return classes[severity];
  },
};
