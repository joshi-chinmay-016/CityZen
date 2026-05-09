"use client";

/*
OWNER: Sushanth
MODULE: Heatmap Visualization Layer
*/

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";

import { useHeatmap } from "@/hooks/useHeatmap";

export default function HeatmapLayer() {
  const map = useMap();

  const { heatmapData } = useHeatmap();

  const heatLayerRef = useRef<any>(null);

  useEffect(() => {
    if (!heatmapData.length) return;

    // Remove old layer safely
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }

    // @ts-ignore
    heatLayerRef.current = L.heatLayer(heatmapData, {
      radius: 40,
      blur: 20,
      maxZoom: 17,
      minOpacity: 0.4,
    });

    heatLayerRef.current.addTo(map);
  }, [map, heatmapData]);

  return null;
}