/*
OWNER: Sushanth
MODULE: Safe Route Visualization Layer
*/

"use client";

import React from "react";
import type { LatLngTuple } from "leaflet";
import { Polyline, Popup } from "react-leaflet";
import type { RouteCandidate } from "@/services/routeService";

type Props = {
  routes: RouteCandidate[];
  selectedRouteIndex: number;
  onSelect: (index: number) => void;
};

export default function RouteLayer({ routes, selectedRouteIndex, onSelect }: Props): React.ReactElement | null {
  if (!Array.isArray(routes) || routes.length === 0) {
    return null;
  }

  const getRouteColor = (type: string) => {
    switch (type) {
      case 'safe': return "#10b981"; // emerald-500
      case 'moderate': return "#f59e0b"; // amber-500
      case 'risky': return "#ef4444"; // red-500
      default: return "#64748b"; // slate-500
    }
  };

  return (
    <>
      {routes.map((candidate, index) => {
        const positions = candidate.route.filter((coord): coord is [number, number] => 
          Array.isArray(coord) && coord.length === 2 && Number.isFinite(coord[0]) && Number.isFinite(coord[1])
        );

        if (positions.length < 2) return null;

        const color = getRouteColor(candidate.type);
        const isSelected = selectedRouteIndex === index;

        return (
          <Polyline
            key={`route-${index}`}
            positions={positions}
            eventHandlers={{
              click: () => onSelect(index)
            }}
            pathOptions={{
              color,
              weight: isSelected ? 10 : 4,
              opacity: isSelected ? 1 : 0.4,
              lineJoin: "round",
              lineCap: "round",
              dashArray: isSelected ? undefined : "10, 10"
            }}
          >
            <Popup>
              <div className="p-2 min-w-[120px]">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: color }} />
                  <span className="font-bold capitalize text-slate-900">{candidate.type} Route</span>
                </div>
                {isSelected && (
                  <div className="bg-emerald-500/10 text-emerald-600 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/20 mb-2 text-center uppercase">
                    Currently Selected
                  </div>
                )}
                <div className="text-xs text-slate-600 space-y-0.5">
                  <p><span className="font-semibold text-slate-900">Stress:</span> {candidate.stress_score.toFixed(1)}/100</p>
                  <p><span className="font-semibold text-slate-900">Distance:</span> {(candidate.distance / 1000).toFixed(1)} km</p>
                  <p><span className="font-semibold text-slate-900">Time:</span> {Math.round(candidate.duration / 60)} min</p>
                </div>
              </div>
            </Popup>
          </Polyline>
        );
      })}
    </>
  );
}
