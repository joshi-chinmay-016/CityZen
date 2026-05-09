/*
OWNER: Sushanth
MODULE: Safe Route Visualization Layer
*/

"use client";

import React, { useMemo } from "react";
import type { LatLngTuple } from "leaflet";
import { Polyline } from "react-leaflet";
import type { RouteCoordinate } from "@/types/route";

type Props = {
  route: RouteCoordinate[];
  safe: boolean;
};

export default function RouteLayer({ route, safe }: Props): React.ReactElement | null {
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

  console.log("RouteLayer routeData", route);
  console.log("RouteLayer polyline positions", positions);

  if (positions.length < 2) {
    return null;
  }

  const color = safe ? "#16a34a" : "#ef4444"; // green : red

  const polylineOptions = {
    color,
    weight: 6,
    opacity: 0.8,
    lineJoin: "round" as const,
    lineCap: "round" as const,
  };

  return <Polyline positions={positions} pathOptions={polylineOptions} />;
}
