import { useState, useEffect, useCallback } from 'react';
import { reportService, Report } from '@/services/reportService';

interface UseReportsResult {
  reports: Report[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useReports(pollingIntervalMs: number = 5000): UseReportsResult {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async (isBackground: boolean = false) => {
    if (!isBackground) setIsLoading(true);
    try {
      const data = await reportService.getReports();
      // Ensure data is an array to prevent UI crashes
      setReports(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err: any) {
      console.error('[useReports Hook Error]:', err);
      // Graceful error handling: preserve previous reports if background refresh fails
      if (!isBackground) {
        setError(err.message || 'Failed to fetch reports. Please try again.');
        setReports([]); // Reset on manual/initial fetch failure
      }
    } finally {
      if (!isBackground) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchReports();

    // Set up polling
    if (pollingIntervalMs > 0) {
      const intervalId = setInterval(() => {
        fetchReports(true);
      }, pollingIntervalMs);

      // Cleanup on unmount
      return () => clearInterval(intervalId);
    }
  }, [fetchReports, pollingIntervalMs]);

  return { reports, isLoading, error, refetch: () => fetchReports(false) };
}