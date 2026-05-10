import { useState, useEffect, useCallback } from 'react';
import { analyticsService, AnalyticsData } from '@/services/analyticsService';

interface UseAnalyticsResult {
  analytics: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAnalytics(pollingIntervalMs: number = 5000): UseAnalyticsResult {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async (isBackground: boolean = false) => {
    if (!isBackground) setIsLoading(true);
    try {
      const data = await analyticsService.getDashboardAnalytics();
      if (data && data.stats) {
        setAnalytics(data);
        setError(null);
      } else {
        throw new Error('Incomplete analytics data received.');
      }
    } catch (err: any) {
      console.error('[useAnalytics Hook Error]:', err);
      if (!isBackground) {
        setError(err.message || 'Failed to fetch analytics data. Please try again.');
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

      // Cleanup on unmount
      return () => clearInterval(intervalId);
    }
  }, [fetchAnalytics, pollingIntervalMs]);

  return { analytics, isLoading, error, refetch: () => fetchAnalytics(false) };
}
