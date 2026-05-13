"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Navigation, 
  Route as RouteIcon,
  X,
} from "lucide-react";
import { useSafeRoute } from "@/hooks/useSafeRoute";
import { geocodingService, GeocodingResult } from "@/services/geocodingService";
import RouteCard from "./RouteCard";
import RouteCardSkeleton from "./RouteCardSkeleton";
import RouteFilters from "./RouteFilters";
import RouteStats from "./RouteStats";
import JourneyFeedbackModal from "./JourneyFeedbackModal";

export default function SafeRoutePanel() {
  const [sourceText, setSourceText] = useState("");
  const [destText, setDestText] = useState("");
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  
  const { 
    routes,
    selectedRouteIndex,
    isLoading: isRouteLoading, 
    error, 
    fetchSafeRoutes,
    selectRoute,
    resetRoute,
    sourceCoords,
    destinationCoords,
    setSourceCoords,
    setDestinationCoords,
    selectingField,
    setSelectingField
  } = useSafeRoute();

  const [sourceSuggestions, setSourceSuggestions] = useState<GeocodingResult[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<GeocodingResult[]>([]);
  const sourceDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const destDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const [isLoadingGeocoding, setIsLoadingGeocoding] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // When coords change, reverse-geocode to update display text
  useEffect(() => {
    const applyReverse = async () => {
      if (sourceCoords) {
        try {
          const addr = await geocodingService.reverseGeocode(sourceCoords[0], sourceCoords[1]);
          setSourceText(addr);
        } catch (err) {
          setSourceText(`${sourceCoords[0].toFixed(4)}, ${sourceCoords[1].toFixed(4)}`);
        }
      }
    };
    applyReverse();
  }, [sourceCoords]);

  useEffect(() => {
    const applyReverse = async () => {
      if (destinationCoords) {
        try {
          const addr = await geocodingService.reverseGeocode(destinationCoords[0], destinationCoords[1]);
          setDestText(addr);
        } catch (err) {
          setDestText(`${destinationCoords[0].toFixed(4)}, ${destinationCoords[1].toFixed(4)}`);
        }
      }
    };
    applyReverse();
  }, [destinationCoords]);

  useEffect(() => {
    return () => {
      if (sourceDebounceRef.current) clearTimeout(sourceDebounceRef.current);
      if (destDebounceRef.current) clearTimeout(destDebounceRef.current);
    };
  }, []);

  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocalError("Geolocation is not supported by your browser.");
      return;
    }

    setIsLoadingGeocoding(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setSourceCoords([latitude, longitude]);
        
        try {
          const address = await geocodingService.reverseGeocode(latitude, longitude);
          setSourceText(address);
        } catch (err) {
          setSourceText(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } finally {
          setIsLoadingGeocoding(false);
        }
      },
      (err) => {
        setLocalError("Could not detect your location. Please enter it manually.");
        setIsLoadingGeocoding(false);
      }
    );
  }, [setSourceCoords]);

  const searchLocations = async (query: string, type: 'source' | 'dest') => {
    const debounceRef = type === 'source' ? sourceDebounceRef : destDebounceRef;
    const setSuggestions = type === 'source' ? setSourceSuggestions : setDestSuggestions;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const results = await geocodingService.geocodeLocation(query);
        setSuggestions(results);
      } catch (err) {
        console.error(err);
      }
    }, 350);
  };

  const handleSelectLocation = (result: GeocodingResult, type: 'source' | 'dest') => {
    if (type === 'source') {
      setSourceText(result.display_name);
      setSourceCoords([result.latitude, result.longitude]);
      setSourceSuggestions([]);
    } else {
      setDestText(result.display_name);
      setDestinationCoords([result.latitude, result.longitude]);
      setDestSuggestions([]);
    }
  };

  const handleFetchRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!sourceCoords || !destinationCoords) {
      setLocalError("Please select both start and destination locations from the suggestions.");
      return;
    }

    await fetchSafeRoutes({
      startLat: sourceCoords[0],
      startLng: sourceCoords[1],
      endLat: destinationCoords[0],
      endLng: destinationCoords[1],
      preferences: { avoidHighStress: true, prioritizeSafety: true }
    });
  };

  const activeError = localError || error;
  const selectedRoute = routes[selectedRouteIndex];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        className="absolute top-6 left-6 z-[1000] w-[380px] bg-slate-900/90 backdrop-blur-xl border border-slate-700/60 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800/80 to-slate-800/40 p-4 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-cyan-400" />
              Safe Route Intelligence
            </h2>
            {(routes.length > 0 || sourceCoords || destinationCoords) && (
               <button 
                onClick={() => {
                  resetRoute();
                  setSourceText("");
                  setDestText("");
                  setSourceCoords(null);
                  setDestinationCoords(null);
                  setLocalError(null);
                }} 
                className="text-[10px] text-slate-500 hover:text-slate-300 underline flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Reset
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">AI-powered low-stress navigation</p>
        </div>

        {/* Input Form */}
        <RouteFilters
          sourceText={sourceText}
          destText={destText}
          sourceSuggestions={sourceSuggestions}
          destSuggestions={destSuggestions}
          isLoadingGeocoding={isLoadingGeocoding}
          isRouteLoading={isRouteLoading}
          activeError={activeError}
          sourceCoords={sourceCoords}
          destinationCoords={destinationCoords}
          selectingField={selectingField}
          onSourceChange={setSourceText}
          onDestChange={setDestText}
          onSelectLocation={handleSelectLocation}
          onUseCurrentLocation={handleUseCurrentLocation}
          onSelectSourceOnMap={() => {
            setSelectingField("source");
            setLocalError(null);
          }}
          onSelectDestOnMap={() => {
            setSelectingField("dest");
            setLocalError(null);
          }}
          onFetchRoute={handleFetchRoute}
          onSearchLocations={searchLocations}
        />

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {(routes.length > 0 || isRouteLoading) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="p-5 border-t border-slate-700/50 bg-slate-800/30 overflow-y-auto custom-scrollbar flex-1"
            >
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <RouteIcon className="w-3.5 h-3.5" /> 
                {isRouteLoading ? 'Finding safest routes...' : 'Available Routes'}
              </h3>

              {/* Routes Grid or Skeleton */}
              <div className="space-y-3 mb-4">
                {isRouteLoading ? (
                  <RouteCardSkeleton count={3} />
                ) : (
                  routes.map((route, idx) => (
                    <div key={idx} onClick={() => selectRoute(idx)} className="cursor-pointer">
                      <RouteCard
                        route={route}
                        isSelected={idx === selectedRouteIndex}
                        isSafest={idx === 0}
                        index={idx}
                        onClick={() => selectRoute(idx)}
                      />
                    </div>
                  ))
                )}
              </div>

              {/* Selected Route Details */}
              {!isRouteLoading && selectedRoute && (
                <RouteStats
                  route={selectedRoute}
                  onCompleteJourney={() => setShowFeedbackPopup(true)}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #334155;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #475569;
          }
        `}</style>
      </motion.div>

      {/* Feedback Modal */}
      <JourneyFeedbackModal
        isOpen={showFeedbackPopup}
        onClose={() => setShowFeedbackPopup(false)}
        startLocation={sourceText}
        endLocation={destText}
        onSuccess={() => {
          // Reset for next journey
          setTimeout(() => {
            resetRoute();
            setSourceText("");
            setDestText("");
            setSourceCoords(null);
            setDestinationCoords(null);
          }, 500);
        }}
      />
    </>
  );
}
