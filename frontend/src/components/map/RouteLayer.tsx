/*
OWNER: Sushanth
MODULE: Multi-Route Visualization Layer
*/

"use client";

import React, { useMemo } from "react";
import type { LatLngTuple } from "leaflet";
import { Polyline, Popup } from "react-leaflet";
import { useRouteContext } from "@/context/RouteContext";
import type { RouteCoordinate, SingleRoute } from "@/types/route";

export default function RouteLayer(): React.ReactElement | null {
  const { routes, selectedRouteIndex } = useRouteContext();

  if (!routes || routes.length === 0) {
    return null;
  }

  return (
    <>
      {routes.map((route: SingleRoute, idx: number) => (
        <RoutePolyline
          key={idx}
          route={route}
          index={idx}
          isSelected={idx === selectedRouteIndex}
          isSafest={idx === 0}
        />
      ))}
    </>
  );
}

interface RoutePolylineProps {
  route: SingleRoute;
  index: number;
  isSelected: boolean;
  isSafest: boolean;
}

function RoutePolyline({
  route,
  index,
  isSelected,
  isSafest,
}: RoutePolylineProps): React.ReactElement | null {
  const positions = useMemo<LatLngTuple[]>(() => {
    if (!Array.isArray(route.route)) {
      return [];
    }

    return route.route
      .filter((coordinate): coordinate is RouteCoordinate => {
        return (
          Array.isArray(coordinate) &&
          coordinate.length === 2 &&
          typeof coordinate[0] === "number" &&
          typeof coordinate[1] === "number" &&
          Number.isFinite(coordinate[0]) &&
          Number.isFinite(coordinate[1])
        );
      })
      .map((coord) => [coord[0], coord[1]] as LatLngTuple); // Ensure [lat, lng] format
  }, [route.route]);

  if (positions.length < 2) {
    return null;
  }

  // Determine color based on route type
  const getRouteColor = (type: string) => {
    switch (type) {
      case "safe":
        return "#16a34a"; // green
      case "moderate":
        return "#ea8c1f"; // orange
      case "risky":
        return "#ef4444"; // red
      default:
        return "#6b7280"; // gray
    }
  };

  const color = getRouteColor(route.type);

  // Safest route is more prominent
  const weight = isSafest ? 6 : isSelected ? 5 : 3;
  const opacity = isSafest ? 0.9 : isSelected ? 0.8 : 0.5;
  const dashArray = isSafest ? undefined : isSelected ? "5, 5" : "10, 5";

  const polylineOptions = {
    color,
    weight,
    opacity,
    lineJoin: "round" as const,
    lineCap: "round" as const,
    dashArray,
  };

  const routeLabel = `Route ${index + 1} - ${route.type.toUpperCase()} (Stress: ${route.stress_score})`;

  return (
    <Polyline positions={positions} pathOptions={polylineOptions}>
      {isSelected && (
        <Popup>
          <div className="text-sm">
            <p className="font-semibold">{routeLabel}</p>
            <p className="text-xs text-gray-600">
              Distance: {(route.distance / 1000).toFixed(1)} km
            </p>
            <p className="text-xs text-gray-600">
              Duration: {Math.round(route.duration / 60)} min
            </p>
            <p className="text-xs text-gray-600">
              Hazards: {route.nearby_hazards?.length || 0}
            </p>
          </div>
        </Popup>
      )}
    </Polyline>
  );
}

