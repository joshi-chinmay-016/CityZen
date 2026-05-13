"use client";

import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Search,
  Locate,
  Loader2,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { GeocodingResult } from "@/services/geocodingService";

interface RouteFiltersProps {
  sourceText: string;
  destText: string;
  sourceSuggestions: GeocodingResult[];
  destSuggestions: GeocodingResult[];
  isLoadingGeocoding: boolean;
  isRouteLoading: boolean;
  activeError: string | null;
  sourceCoords: [number, number] | null;
  destinationCoords: [number, number] | null;
  selectingField: 'none' | 'source' | 'dest';
  onSourceChange: (value: string) => void;
  onDestChange: (value: string) => void;
  onSelectLocation: (result: GeocodingResult, type: "source" | "dest") => void;
  onUseCurrentLocation: () => void;
  onSelectSourceOnMap: () => void;
  onSelectDestOnMap: () => void;
  onFetchRoute: (e: React.FormEvent) => void;
  onSearchLocations: (query: string, type: "source" | "dest") => void;
}

export default function RouteFilters({
  sourceText,
  destText,
  sourceSuggestions,
  destSuggestions,
  isLoadingGeocoding,
  isRouteLoading,
  activeError,
  sourceCoords,
  destinationCoords,
  selectingField,
  onSourceChange,
  onDestChange,
  onSelectLocation,
  onUseCurrentLocation,
  onSelectSourceOnMap,
  onSelectDestOnMap,
  onFetchRoute,
  onSearchLocations,
}: RouteFiltersProps) {
  return (
    <div className="p-5 overflow-y-auto custom-scrollbar">
      <form onSubmit={onFetchRoute} className="space-y-4">
        {/* Source Input */}
        <div className="relative group">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-400" /> Start Location
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onUseCurrentLocation}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                {isLoadingGeocoding ? (
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                ) : (
                  <Locate className="w-2.5 h-2.5" />
                )}
                Current
              </button>

              <button
                type="button"
                onClick={onSelectSourceOnMap}
                className={`text-[10px] text-slate-300/90 hover:text-white flex items-center gap-1 transition-colors px-2 py-1 rounded-lg border border-slate-700/40 ${
                  selectingField === "source" ? "bg-slate-800/40" : ""
                }`}
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
                onSourceChange(e.target.value);
                onSearchLocations(e.target.value, "source");
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
                    onClick={() => onSelectLocation(res, "source")}
                    className="w-full text-left p-3 hover:bg-slate-700/50 transition-colors border-b border-slate-700/30 last:border-0"
                  >
                    <p className="text-xs text-slate-200 line-clamp-1">
                      {res.display_name}
                    </p>
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
                onClick={onSelectDestOnMap}
                className={`text-[10px] text-slate-300/90 hover:text-white flex items-center gap-1 transition-colors px-2 py-1 rounded-lg border border-slate-700/40 ${
                  selectingField === "dest" ? "bg-slate-800/40" : ""
                }`}
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
                onDestChange(e.target.value);
                onSearchLocations(e.target.value, "dest");
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
                    onClick={() => onSelectLocation(res, "dest")}
                    className="w-full text-left p-3 hover:bg-slate-700/50 transition-colors border-b border-slate-700/30 last:border-0"
                  >
                    <p className="text-xs text-slate-200 line-clamp-1">
                      {res.display_name}
                    </p>
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
              Plan Safe Routes <ChevronRight className="w-4 h-4" />
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
  );
}
