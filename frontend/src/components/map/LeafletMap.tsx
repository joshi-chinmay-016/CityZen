"use client";

/*
OWNER: Sushanth
MODULE: Leaflet Client Map
*/

import "@/lib/leaflet";
import SeverityLegend from "./SeverityLegend";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet";
import HeatmapLayer from "./HeatmapLayer";
import CurrentLocation from "./CurrentLocation";
import MarkerLayer from "./MarkerLayer";
import RouteLayer from "./RouteLayer";
import { useSafeRoute } from "@/hooks/useSafeRoute";
import L from 'leaflet';
import { useEffect } from 'react';
import { useMapEvents } from 'react-leaflet';
import { geocodingService } from '@/services/geocodingService';

// Custom icons
const sourceIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const destIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const bangaloreCenter: [number, number] = [12.9716, 77.5946];


import MapSidebar from "./MapSidebar";

export default function LeafletMap() {
  const {
  routeResult,
  fetchSafeRoute,
  sourceCoords,
  destinationCoords
  ,
  selectingField,
  setSelectingField,
  setSourceCoords,
  setDestinationCoords
} = useSafeRoute();

  console.log("LeafletMap routeData", routeResult);

  return (
    <div
      className="h-screen w-full relative"
      style={{ height: "100vh", width: "100vw" }}
    >
      <MapContainer
        center={bangaloreCenter}
        zoom={13}
        scrollWheelZoom={true}
        zoomControl={false}
        className="h-full w-full"
        style={{ height: "100%", width: "100%" }}
      >
        <ZoomControl position="bottomright" />
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
        
        {/* Source Marker */}
        {sourceCoords && (
          <Marker position={sourceCoords} icon={sourceIcon}>
            <Popup>Start Location</Popup>
          </Marker>
        )}

        {/* Destination Marker */}
        {destinationCoords && (
          <Marker position={destinationCoords} icon={destIcon}>
            <Popup>Destination</Popup>
          </Marker>
        )}

        {/* Safe Route Layer */}
       <RouteLayer
        route={routeResult?.route ?? []}
        safe={routeResult?.safe ?? true}
        />
        {/* Map click handler: listens for clicks when user is selecting source/dest */}
        <MapClickHandler />
      </MapContainer>
      <SeverityLegend />
    </div>
  );
}

function MapClickHandler() {
  const {
    selectingField,
    setSelectingField,
    setSourceCoords,
    setDestinationCoords
  } = useSafeRoute();

  useMapEvents({
    click: async (e) => {
      if (!selectingField || selectingField === 'none') return;

      const { lat, lng } = e.latlng;

      if (selectingField === 'source') {
        setSourceCoords([lat, lng]);
      } else if (selectingField === 'dest') {
        setDestinationCoords([lat, lng]);
      }

      // attempt a reverse geocode in background (UI component will pick up coords)
      try {
        await geocodingService.reverseGeocode(lat, lng);
      } catch (err) {
        // ignore - SafeRoutePanel will fallback to lat/lng display
      }

      // turn off selecting mode
      setSelectingField('none');
    }
  });

  return null;
}
