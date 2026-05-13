"use client";

import { useState, useCallback } from 'react';
import { feedbackService, JourneyFeedback, JourneyRating, IssueType } from '@/services/feedbackService';
import toast from 'react-hot-toast';

interface UseFeedbackResult {
  isSubmitting: boolean;
  error: string | null;
  submitFeedback: (feedback: JourneyFeedback) => Promise<void>;
  resetFeedback: () => void;
}

export function useFeedback(): UseFeedbackResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitFeedback = useCallback(async (feedback: JourneyFeedback) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await feedbackService.submitJourneyFeedback(feedback);
      if (response.success) {
        toast.success(response.message || 'Feedback submitted successfully');
      } else {
        throw new Error(response.message || 'Failed to submit feedback');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to submit feedback';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const resetFeedback = useCallback(() => {
    setIsSubmitting(false);
    setError(null);
  }, []);

  return { isSubmitting, error, submitFeedback, resetFeedback };
}
