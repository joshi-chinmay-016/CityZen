"use client";

/*
OWNER: Sushanth
MODULE: Leaflet Client Map
*/

import "@/lib/leaflet";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { motion } from "framer-motion";
import { Layers3, LocateFixed, Minus, Plus } from "lucide-react";
import L from "leaflet";
import SeverityLegend from "./SeverityLegend";
import HeatmapLayer from "./HeatmapLayer";
import CurrentLocation from "./CurrentLocation";
import MarkerLayer from "./MarkerLayer";
import RouteLayer from "./RouteLayer";
import MapSidebar from "./MapSidebar";
import { useSafeRoute } from "@/hooks/useSafeRoute";

const sourceIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const destIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const bangaloreCenter: [number, number] = [12.9716, 77.5946];

function MapBridge({
  sourceCoords,
  destinationCoords,
  onReady,
}: {
  sourceCoords: [number, number] | null;
  destinationCoords: [number, number] | null;
  onReady: (map: L.Map) => void;
}) {
  const map = useMap();

  useEffect(() => {
    onReady(map);
  }, [map, onReady]);

  useEffect(() => {
    if (sourceCoords && destinationCoords) {
      const bounds = L.latLngBounds([sourceCoords, destinationCoords]);
      map.fitBounds(bounds.pad(0.45), { animate: true, duration: 0.7 });
      return;
    }

    if (sourceCoords) {
      map.flyTo(sourceCoords, 14, { duration: 0.7 });
      return;
    }

    if (destinationCoords) {
      map.flyTo(destinationCoords, 14, { duration: 0.7 });
    }
  }, [destinationCoords, map, sourceCoords]);

  return null;
}

export default function LeafletMap() {
  const { routeResult, sourceCoords, destinationCoords } = useSafeRoute();
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  const mapControls = useMemo(
    () => [
      {
        icon: Plus,
        label: "Zoom in",
        onClick: () => mapInstance?.zoomIn(),
      },
      {
        icon: Minus,
        label: "Zoom out",
        onClick: () => mapInstance?.zoomOut(),
      },
      {
        icon: Layers3,
        label: "Toggle heatmap",
        onClick: () => setShowHeatmap((current) => !current),
      },
      {
        icon: LocateFixed,
        label: "Center on current location",
        onClick: () => {
          if (sourceCoords) {
            mapInstance?.flyTo(sourceCoords, 14, { duration: 0.7 });
            return;
          }
          mapInstance?.flyTo(bangaloreCenter, 13, { duration: 0.7 });
        },
      },
    ],
    [mapInstance, sourceCoords]
  );

  return (
    <div className="relative h-screen w-full">
      <MapSidebar />

      <MapContainer
        center={bangaloreCenter}
        zoom={13}
        scrollWheelZoom
        className="h-full w-full"
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />

        <MapBridge sourceCoords={sourceCoords} destinationCoords={destinationCoords} onReady={setMapInstance} />

        <CurrentLocation />
        <MarkerLayer />
        {showHeatmap ? <HeatmapLayer /> : null}

        {sourceCoords ? (
          <Marker position={sourceCoords} icon={sourceIcon}>
            <Popup>Start Location</Popup>
          </Marker>
        ) : null}

        {destinationCoords ? (
          <Marker position={destinationCoords} icon={destIcon}>
            <Popup>Destination</Popup>
          </Marker>
        ) : null}

        <RouteLayer route={routeResult?.route ?? []} safe={routeResult?.safe ?? true} />
      </MapContainer>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="absolute bottom-5 right-5 z-[1000] hidden flex-col gap-3 md:flex"
      >
        {mapControls.map((control, index) => {
          const Icon = control.icon;
          return (
            <motion.button
              key={control.label}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.35 + index * 0.08 }}
              onClick={control.onClick}
              className={`glass-map flex h-10 w-10 items-center justify-center rounded-xl border text-white/55 transition-colors hover:border-white/15 hover:text-emerald-300 ${
                control.label === "Toggle heatmap" && showHeatmap ? "glow-emerald" : ""
              }`}
              aria-label={control.label}
              title={control.label}
            >
              <Icon className="h-4 w-4" />
            </motion.button>
          );
        })}
      </motion.div>

      <SeverityLegend />
    </div>
  );
}
