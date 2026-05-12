import api from './api';

export interface AnalyticsStats {
  totalReports: number;
  totalReportsChange: string;
  highSeverityHazards: number;
  highSeverityChange: string;
  safeRoutesGenerated: number;
  safeRoutesChange: string;
  averageStressScore: number;
  averageStressChange: string;
}

export interface AnalyticsData {
  stats: AnalyticsStats;
  reportsOverTime: { name: string; reports: number }[];
  hazardDistribution: { name: string; value: number }[];
  severityDistribution: { name: string; value: number }[];
}

export const analyticsService = {
  getDashboardAnalytics: async (): Promise<AnalyticsData> => {
    try {
      const response = await api.get<AnalyticsData>('/analytics');
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      throw error;
    }
  },
};
