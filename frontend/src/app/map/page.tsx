"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MapView from "@/components/map/MapView";
import SafeRoutePanel from "@/components/map/SafeRoutePanel";
import { RouteProvider, useRouteContext } from "@/context/RouteContext";

function MapScreen() {
  useRouteContext();
  const [showPlannerPanel, setShowPlannerPanel] = useState(true);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#050505]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 z-0 pt-16"
      >
        <MapView />
      </motion.div>

      <AnimatePresence>
        {showPlannerPanel ? (
          <div className="absolute left-3 top-20 z-[1200] right-3 md:left-6 md:right-auto md:top-24">
            <SafeRoutePanel onClose={() => setShowPlannerPanel(false)} />
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default function MapPage() {
  return (
    <RouteProvider>
      <MapScreen />
    </RouteProvider>
  );
}
