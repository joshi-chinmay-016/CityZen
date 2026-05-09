/*
OWNER: Sushanth
MODULE: User Location Hook
*/

import { useEffect, useState } from "react";

interface Location {
  lat: number;
  lng: number;
}

interface UseLocationReturn {
  location: Location | null;
  loading: boolean;
  error: string | null;
}

export default function useLocation(): UseLocationReturn {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      setLoading(false);
      return;
    }

    const handleSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      setLocation({
        lat: latitude,
        lng: longitude,
      });
      setError(null);
      setLoading(false);
    };

    const handleError = (error: GeolocationPositionError) => {
      let errorMessage = "Unable to get location";

      if (error.code === error.PERMISSION_DENIED) {
        errorMessage = "Permission denied. Please enable location access.";
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        errorMessage = "Position unavailable.";
      } else if (error.code === error.TIMEOUT) {
        errorMessage = "Request timed out.";
      }

      setError(errorMessage);
      setLoading(false);
    };

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
  }, []);

  return { location, loading, error };
}
