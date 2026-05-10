"use client";

import React, { useEffect } from "react";
import MapView from "@/components/map/MapView";
import SafeRoutePanel from "@/components/map/SafeRoutePanel";
import { Toaster, toast } from "react-hot-toast";
import { RouteProvider } from "@/context/RouteContext";

export default function MapPage() {
  return (
    <RouteProvider>
      <div className="relative w-screen h-screen overflow-hidden bg-slate-900">
        <Toaster position="top-right" />
        
        {/* Dynamic Map Component */}
        <div className="absolute inset-0 z-0 pt-16">
          <MapView />
        </div>

        {/* Floating UI Overlay */}
        <div className="absolute top-24 left-6 z-[1000]">
          <SafeRoutePanel />
        </div>
      </div>
    </RouteProvider>
  );
}