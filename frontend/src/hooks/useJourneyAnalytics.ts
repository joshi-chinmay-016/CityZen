"use client";

import { useState, useEffect, useCallback } from 'react';
import { analyticsService, JourneyAnalytics } from '@/services/analyticsService';

interface UseJourneyAnalyticsResult {
  analytics: JourneyAnalytics | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useJourneyAnalytics(pollingIntervalMs: number = 30000): UseJourneyAnalyticsResult {
  const [analytics, setAnalytics] = useState<JourneyAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async (isBackground: boolean = false) => {
    if (!isBackground) setIsLoading(true);
    try {
      const data = await analyticsService.getJourneyAnalytics();
      if (data) {
        setAnalytics(data);
        setError(null);
      } else {
        throw new Error('Failed to fetch journey analytics');
      }
    } catch (err: any) {
      console.error('[useJourneyAnalytics Hook Error]:', err);
      if (!isBackground) {
        setError(err.message || 'Failed to fetch analytics data.');
      }
    } finally {
      if (!isBackground) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchAnalytics();

    // Set up polling
    if (pollingIntervalMs > 0) {
      const intervalId = setInterval(() => {
        fetchAnalytics(true);
      }, pollingIntervalMs);

      return () => clearInterval(intervalId);
    }
  }, [fetchAnalytics, pollingIntervalMs]);

  return { analytics, isLoading, error, refetch: () => fetchAnalytics() };
}
