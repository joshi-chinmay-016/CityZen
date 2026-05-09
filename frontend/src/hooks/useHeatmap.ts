/*
OWNER: Sushanth
MODULE: Heatmap Data Hook
*/

import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";
import type { HeatmapResponse } from "../types/heatmap";

const DEFAULT_ERROR_MESSAGE = "Failed to fetch heatmap data";

const getErrorMessage = (error: unknown): string => {
	if (error instanceof Error && error.message) {
		return error.message;
	}

	return DEFAULT_ERROR_MESSAGE;
};

export const useHeatmap = () => {
	const [heatmapData, setHeatmapData] = useState<HeatmapResponse>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchHeatmapData = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			const response = await api.get<HeatmapResponse>("/heatmap");
			setHeatmapData(response.data ?? []);
		} catch (err) {
			console.error("Failed to fetch heatmap data", err);
			setError(getErrorMessage(err));
			setHeatmapData([]);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void fetchHeatmapData();
	}, [fetchHeatmapData]);

	return {
		heatmapData,
		loading,
		error,
		refresh: fetchHeatmapData,
	};
};
