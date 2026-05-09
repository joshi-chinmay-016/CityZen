"use client";

/*
OWNER: Sushanth
MODULE: Leaflet Client Map
*/

import "@/lib/leaflet";
import SeverityLegend from "./SeverityLegend";
import { MapContainer, TileLayer } from "react-leaflet";
import HeatmapLayer from "./HeatmapLayer";
import CurrentLocation from "./CurrentLocation";
import MarkerLayer from "./MarkerLayer";
import RouteLayer from "./RouteLayer";

const bangaloreCenter: [number, number] = [12.9716, 77.5946];


export default function LeafletMap() {
  return (
    <div
      className="h-screen w-full"
      style={{ height: "100vh", width: "100vw" }}
    >
      <MapContainer
        center={bangaloreCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full"
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />

        {/* Live User Location */}
        <CurrentLocation />

        {/* Hazard Report Markers */}
        <MarkerLayer />

        {/* Heatmap Layer */}
        <HeatmapLayer />
        
        {/* Safe Route Layer */}
       
      </MapContainer>
      <SeverityLegend />
    </div>
  );
}