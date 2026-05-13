import api from './api';

export type IssueType = 'pothole' | 'crack' | 'manhole' | 'traffic' | 'unsafe_road';
export type JourneyRating = 1 | 2 | 3 | 4 | 5;
export type IssueSeverity = 'low' | 'medium' | 'high';

export interface JourneyFeedback {
  start: string;
  destination: string;
  rating: JourneyRating;
  issueType?: IssueType;
  severity?: IssueSeverity;
  landmark?: string;
  comments?: string;
}

export interface JourneyFeedbackResponse {
  success: boolean;
  message: string;
  feedbackId?: string;
}

/**
 * Determine severity based on rating
 * 1 star = high, 2 stars = medium, 3+ = low
 */
export const getRatingSeverity = (rating: JourneyRating): IssueSeverity => {
  if (rating === 1) return 'high';
  if (rating === 2) return 'medium';
  return 'low';
};

export const feedbackService = {
  /**
   * Submit journey feedback with rating and optional issue details
   */
  submitJourneyFeedback: async (feedback: JourneyFeedback): Promise<JourneyFeedbackResponse> => {
    try {
      // Determine severity from rating
      const severity = feedback.severity || getRatingSeverity(feedback.rating);

      const response = await api.post<JourneyFeedbackResponse>('/journey-feedback', {
        start: feedback.start,
        destination: feedback.destination,
        rating: feedback.rating,
        issueType: feedback.issueType,
        severity,
        landmark: feedback.landmark,
        comments: feedback.comments,
      });

      return response.data;
    } catch (error) {
      console.error('Error submitting journey feedback:', error);
      throw error;
    }
  },

  /**
   * Get feedback history for user
   */
  getFeedbackHistory: async (limit: number = 10): Promise<any[]> => {
    try {
      const response = await api.get('/journey-feedback', { params: { limit } });
      return response.data;
    } catch (error) {
      console.error('Error fetching feedback history:', error);
      return [];
    }
  },
};
