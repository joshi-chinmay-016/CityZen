import api from './api';

export interface JourneyFeedbackRequest {
  start: string;
  destination: string;
  rating: number;
  issueType: 'pothole' | 'crack' | 'manhole' | 'traffic' | 'unsafe road';
  severity: 'low' | 'medium' | 'high';
  landmark?: string;
}

export interface JourneyAnalyticsResponse {
  totalJourneyReports: number;
  lowRatings: number;
  unsafeRoadComplaints: number;
  mostCommonIssue: string | null;
  averageRating: number;
  highRiskZones: Array<{
    issueType: string;
    count: number;
  }>;
}

export const journeyService = {
  submitFeedback: async (feedback: JourneyFeedbackRequest) => {
    try {
      const response = await api.post('/journey-feedback', feedback);
      return response.data;
    } catch (error) {
      console.error('Error submitting journey feedback:', error);
      throw error;
    }
  },

  getAnalytics: async (): Promise<JourneyAnalyticsResponse> => {
    try {
      const response = await api.get('/journey-analytics');
      return response.data;
    } catch (error) {
      console.error('Error fetching journey analytics:', error);
      throw error;
    }
  }
};
