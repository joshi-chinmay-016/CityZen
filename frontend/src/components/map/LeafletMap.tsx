"use client";

/*
OWNER: Sushanth
MODULE: Leaflet Client Map
*/

import { MapContainer, TileLayer } from "react-leaflet";

const bangaloreCenter: [number, number] = [12.9716, 77.5946];

export default function LeafletMap() {
  return (
    <div className="h-screen w-full" style={{ height: "100vh", width: "100vw" }}>
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
      </MapContainer>
    </div>
  );
}
