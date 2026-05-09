/*
OWNER: Sushanth
MODULE: Safe Route Visualization Layer
*/

"use client";

import React from "react";
import { Polyline } from "react-leaflet";
import type { RouteCoordinate } from "@/types/route";

type Props = {
  route: RouteCoordinate[];
  safe: boolean;
};

export default function RouteLayer({ route, safe }: Props): React.ReactElement | null {
  if (!route || route.length === 0) return null;

  const color = safe ? "#16a34a" : "#ef4444"; // green : red

  const polylineOptions = {
    color,
    weight: 6,
    opacity: 0.8,
    lineJoin: "round" as const,
    lineCap: "round" as const,
  };

  return <Polyline positions={route as [number, number][]} pathOptions={polylineOptions} />;
}
