/*
OWNER: Sushanth
MODULE: Safe Route Visualization Layer
*/

"use client";

import React, { useMemo } from "react";
import type { LatLngTuple } from "leaflet";
import { Polyline } from "react-leaflet";
import { RouteCoordinate, RouteRiskLevel } from "@/types/route";

type Props = {
  route: RouteCoordinate[];
  variant: RouteRiskLevel;
  selected?: boolean;
};

const routeColors: Record<RouteRiskLevel, string> = {
  safe: "#10b981",
  moderate: "#f59e0b",
  risky: "#f43f5e",
};

export default function RouteLayer({ route, variant, selected = false }: Props): React.ReactElement | null {
  const positions = useMemo<LatLngTuple[]>(() => {
    if (!Array.isArray(route)) {
      return [];
    }

    return route.filter((coordinate): coordinate is RouteCoordinate => {
      return (
        Array.isArray(coordinate) &&
        coordinate.length === 2 &&
        typeof coordinate[0] === "number" &&
        typeof coordinate[1] === "number" &&
        Number.isFinite(coordinate[0]) &&
        Number.isFinite(coordinate[1])
      );
    });
  }, [route]);

  if (positions.length < 2) {
    return null;
  }

  return (
    <Polyline
      positions={positions}
      pathOptions={{
        color: routeColors[variant],
        weight: selected ? 7 : 4,
        opacity: selected ? 0.95 : 0.32,
        dashArray: selected ? undefined : "10 12",
        lineJoin: "round",
        lineCap: "round",
      }}
    />
  );
}
