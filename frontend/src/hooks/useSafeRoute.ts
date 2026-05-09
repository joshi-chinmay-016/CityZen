/*
OWNER: Sushanth
MODULE: Safe Route Hook
*/

import { useCallback, useState } from "react";

import { api } from "../services/api";

import type {
  RouteCoordinate,
  SafeRouteResponse,
} from "../types/route";

const DEFAULT_ERROR_MESSAGE = "Failed to fetch safe route";

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return DEFAULT_ERROR_MESSAGE;
};

export const useSafeRoute = () => {
  const [routeData, setRouteData] =
    useState<SafeRouteResponse | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const fetchSafeRoute = useCallback(
    async (
      source: RouteCoordinate,
      destination: RouteCoordinate
    ) => {
      try {
        setLoading(true);
        setError(null);

        const payload = {
          source,
          destination,
        };

        const response = await api.post<SafeRouteResponse>(
          "/routes/safe-route",
          payload
        );

        setRouteData(response.data ?? null);

        return response.data;
      } catch (err) {
        console.error("useSafeRoute: failed to fetch", err);

        const message = getErrorMessage(err);

        setError(message);

        setRouteData(null);

        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    routeData,
    loading,
    error,
    fetchSafeRoute,
  } as const;
};

export default useSafeRoute;