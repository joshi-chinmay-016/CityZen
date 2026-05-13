"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  Navigation, 
  ShieldCheck, 
  AlertTriangle, 
  Activity, 
  ChevronRight,
  Route as RouteIcon,
  Search,
  Locate,
  Loader2,
  X
} from "lucide-react";
import { useSafeRoute } from "@/hooks/useSafeRoute";
import { geocodingService, GeocodingResult } from "@/services/geocodingService";

export default function SafeRoutePanel() {
  const [sourceText, setSourceText] = useState("");
  const [destText, setDestText] = useState("");
  
  const { 
    routeResult, 
    isLoading: isRouteLoading, 
    error, 
    fetchSafeRoute, 
    resetRoute,
    sourceCoords,
    destinationCoords,
    setSourceCoords,
    setDestinationCoords
    ,
    selectingField,
    setSelectingField
  } = useSafeRoute();

  const [sourceSuggestions, setSourceSuggestions] = useState<GeocodingResult[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<GeocodingResult[]>([]);
  const sourceDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const destDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const [isLoadingGeocoding, setIsLoadingGeocoding] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Auto-detect location on mount
  // NOTE: do not auto-detect on mount anymore. User must choose current or select on map.

  // When coords change (including via map selection), reverse-geocode to update the display text
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

    await fetchSafeRoute({
      startLat: sourceCoords[0],
      startLng: sourceCoords[1],
      endLat: destinationCoords[0],
      endLng: destinationCoords[1],
      preferences: { avoidHighStress: true, prioritizeSafety: true }
    });
  };

  const getStressLevel = (score: number) => {
    if (score >= 7) return { text: "High Stress", color: "text-rose-400", bg: "bg-rose-500/20", border: "border-rose-500/30", icon: AlertTriangle };
    if (score >= 4) return { text: "Moderate Stress", color: "text-amber-400", bg: "bg-amber-500/20", border: "border-amber-500/30", icon: Activity };
    return { text: "Safe & Low Stress", color: "text-emerald-400", bg: "bg-emerald-500/20", border: "border-emerald-500/30", icon: ShieldCheck };
  };

  const activeError = localError || error;

  return (
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
          {(routeResult || sourceCoords || destinationCoords) && (
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
      <div className="p-5 overflow-y-auto custom-scrollbar">
        <form onSubmit={handleFetchRoute} className="space-y-4">
          {/* Source Input */}
          <div className="relative group">
            <div className="flex items-center justify-between mb-1.5 px-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-400" /> Start Location
              </label>
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                >
                  {isLoadingGeocoding ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Locate className="w-2.5 h-2.5" />}
                  Current
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectingField('source');
                    setLocalError(null);
                  }}
                  className={`text-[10px] text-slate-300/90 hover:text-white flex items-center gap-1 transition-colors px-2 py-1 rounded-lg border border-slate-700/40 ${selectingField === 'source' ? 'bg-slate-800/40' : ''}`}
                >
                  Select on map
                </button>
              </div>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search start location..."
                value={sourceText}
                onChange={(e) => {
                  setSourceText(e.target.value);
                  searchLocations(e.target.value, 'source');
                }}
                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all"
              />
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            </div>
            
            {/* Source Suggestions */}
            <AnimatePresence>
              {sourceSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="relative left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-[1100] max-h-60 overflow-y-auto overflow-x-hidden"
                >
                  {sourceSuggestions.map((res, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectLocation(res, 'source')}
                      className="w-full text-left p-3 hover:bg-slate-700/50 transition-colors border-b border-slate-700/30 last:border-0"
                    >
                      <p className="text-xs text-slate-200 line-clamp-1">{res.display_name}</p>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Destination Input */}
          <div className="relative">
            <div className="flex items-center mb-1.5 px-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3 h-3 text-rose-400" /> Destination
              </label>
              <div className="ml-auto">
                <button
                  type="button"
                  onClick={() => {
                    setSelectingField('dest');
                    setLocalError(null);
                  }}
                  className={`text-[10px] text-slate-300/90 hover:text-white flex items-center gap-1 transition-colors px-2 py-1 rounded-lg border border-slate-700/40 ${selectingField === 'dest' ? 'bg-slate-800/40' : ''}`}
                >
                  Select on map
                </button>
              </div>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search destination..."
                value={destText}
                onChange={(e) => {
                  setDestText(e.target.value);
                  searchLocations(e.target.value, 'dest');
                }}
                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all"
              />
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            </div>

            {/* Destination Suggestions */}
            <AnimatePresence>
              {destSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="relative left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-[1100] max-h-60 overflow-y-auto overflow-x-hidden"
                >
                  {destSuggestions.map((res, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectLocation(res, 'dest')}
                      className="w-full text-left p-3 hover:bg-slate-700/50 transition-colors border-b border-slate-700/30 last:border-0"
                    >
                      <p className="text-xs text-slate-200 line-clamp-1">{res.display_name}</p>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="submit"
            disabled={isRouteLoading || !sourceCoords || !destinationCoords}
            className="w-full mt-2 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed shadow-[0_0_20px_rgba(6,182,212,0.2)] active:scale-[0.98]"
          >
            {isRouteLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Plan Safe Route <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <AnimatePresence>
          {activeError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 flex items-start gap-2"
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{activeError}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results Section */}
      <AnimatePresence mode="wait">
        {routeResult && !isRouteLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="p-5 border-t border-slate-700/50 bg-slate-800/30"
          >
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <RouteIcon className="w-3.5 h-3.5" /> Intelligence Report
            </h3>
            
            {/* Status Badge */}
            {(() => {
              const level = getStressLevel(routeResult.stress_score);
              const LevelIcon = level.icon;
              return (
                <div className={`flex items-center gap-3 p-4 rounded-xl border ${level.bg} ${level.border} mb-4`}>
                  <div className={`p-2 rounded-lg ${level.bg} border ${level.border}`}>
                    <LevelIcon className={`w-5 h-5 ${level.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className={`text-sm font-bold ${level.color}`}>{level.text}</div>
                      {routeResult.safe ? (
                         <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-md border border-emerald-500/30 font-bold">OPTIMIZED</span>
                       ) : (
                         <span className="text-[10px] bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded-md border border-rose-500/30 font-bold">SUB-OPTIMAL</span>
                       )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                       Route Stress Index: <span className="text-slate-200 font-bold">{routeResult.stress_score.toFixed(1)}</span> / 10
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2.5">
                <ShieldCheck className="w-3 h-3 text-cyan-400" /> Path Analysis
              </div>
              <p className="text-xs text-slate-400 leading-relaxed italic">
                "{routeResult.safe 
                  ? "Our AI has identified a significantly safer path that minimizes exposure to reported hazards and high-stress urban zones." 
                  : "Attention: No alternate safe path found within search radius. The current route contains elevated stress segments."}"
              </p>
              <div className="mt-3 flex items-center gap-4 border-t border-slate-700/30 pt-3">
                 <div className="text-center flex-1">
                   <div className="text-[10px] text-slate-500 uppercase mb-0.5">Checkpoints</div>
                   <div className="text-xs font-bold text-slate-200">{routeResult.route.length}</div>
                 </div>
                 <div className="w-px h-6 bg-slate-700/50" />
                 <div className="text-center flex-1">
                   <div className="text-[10px] text-slate-500 uppercase mb-0.5">Safety Rating</div>
                   <div className="text-xs font-bold text-emerald-400">{(100 - (routeResult.stress_score * 10)).toFixed(0)}%</div>
                 </div>
              </div>
            </div>

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
  );
}
