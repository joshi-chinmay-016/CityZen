import { useState, useEffect, useCallback } from 'react';
import { heatmapService, HeatmapDataPoint } from '@/services/heatmapService';

interface UseHeatmapResult {
  heatmapData: HeatmapDataPoint[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useHeatmap(pollingIntervalMs: number = 5000): UseHeatmapResult {
  const [heatmapData, setHeatmapData] = useState<HeatmapDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHeatmapData = useCallback(async (isBackground: boolean = false) => {
    if (!isBackground) setIsLoading(true);
    try {
      const data = await heatmapService.getHeatmapData();
      // Ensure data is an array to prevent UI crashes
      setHeatmapData(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err: any) {
      console.error('[useHeatmap Hook Error]:', err);
      // Graceful error handling: preserve previous data if background refresh fails
      if (!isBackground) {
        setError(err.message || 'Failed to fetch heatmap data. Please try again.');
        setHeatmapData([]); // Reset on manual/initial fetch failure
      }
    } finally {
      if (!isBackground) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchHeatmapData();

    // Set up polling
    if (pollingIntervalMs > 0) {
      const intervalId = setInterval(() => {
        fetchHeatmapData(true);
      }, pollingIntervalMs);

      // Cleanup on unmount
      return () => clearInterval(intervalId);
    }
  }, [fetchHeatmapData, pollingIntervalMs]);

  return { heatmapData, isLoading, error, refetch: () => fetchHeatmapData(false) };
}
