/*
OWNER: Sushanth
MODULE: Current User Location
*/

"use client";

import { useEffect } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import useLocation from "@/hooks/useLocation";

export default function CurrentLocation() {
  const map = useMap();
  const { location, loading, error } = useLocation();

  // Fly to user location when it becomes available
  useEffect(() => {
    if (location && map) {
      map.flyTo([location.lat, location.lng], 15, {
        duration: 2,
      });
    }
  }, [location, map]);

  // Render nothing if location is unavailable
  if (loading || error || !location) {
    return null;
  }

  return (
    <Marker position={[location.lat, location.lng]}>
      <Popup>You are here</Popup>
    </Marker>
  );
}
