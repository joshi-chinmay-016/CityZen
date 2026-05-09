/*
OWNER: Sushanth
MODULE: Heatmap Visualization Layer
*/

"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L, { type Layer } from "leaflet";
import "leaflet.heat";

import { useHeatmap } from "@/hooks/useHeatmap";

type HeatLayerOptions = {
	radius: number;
	blur: number;
	maxZoom: number;
};

type LeafletHeatMap = typeof L & {
	heatLayer: (
		latlngs: Array<[number, number, number]>,
		options: HeatLayerOptions
	) => Layer;
};

const HEATMAP_OPTIONS: HeatLayerOptions = {
	radius: 25,
	blur: 15,
	maxZoom: 17,
};

export default function HeatmapLayer() {
	const map = useMap();
	const { heatmapData, loading, error } = useHeatmap();

	useEffect(() => {
		if (loading || error || heatmapData.length === 0) {
			return;
		}

		const heatMap = (L as LeafletHeatMap).heatLayer(
			heatmapData,
			HEATMAP_OPTIONS
		);

		heatMap.addTo(map);

		return () => {
			heatMap.remove();
		};
	}, [map, heatmapData, loading, error]);

	if (loading || error || heatmapData.length === 0) {
		return null;
	}

	return null;
}
