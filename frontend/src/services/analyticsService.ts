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

export interface JourneyAnalytics {
  totalJourneyReports: number;
  lowRatings: number;
  unsafeRoadComplaints: number;
  mostCommonIssue: string;
  averageRating: number;
  highRiskZones: Array<{
    location: string;
    riskScore: number;
    incidents: number;
  }>;
  issueBreakdown: Record<string, number>;
  ratingDistribution: Record<number, number>;
  trends: Array<{
    date: string;
    incidents: number;
    averageRating: number;
  }>;
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

  /**
   * Get journey analytics data for crowd intelligence
   */
  getJourneyAnalytics: async (): Promise<JourneyAnalytics> => {
    try {
      const response = await api.get<JourneyAnalytics>('/journey-analytics');
      return response.data;
    } catch (error) {
      console.error('Error fetching journey analytics:', error);
      // Return default empty structure if not available
      return {
        totalJourneyReports: 0,
        lowRatings: 0,
        unsafeRoadComplaints: 0,
        mostCommonIssue: 'N/A',
        averageRating: 0,
        highRiskZones: [],
        issueBreakdown: {},
        ratingDistribution: {},
        trends: [],
      };
    }
  },

  /**
   * Get real-time crowd data
   */
  getCrowdData: async (): Promise<any> => {
    try {
      const response = await api.get('/crowd-data');
      return response.data;
    } catch (error) {
      console.error('Error fetching crowd data:', error);
      return null;
    }
  },
};
