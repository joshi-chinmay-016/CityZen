"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CornerDownLeft,
  Flag,
  Loader2,
  Locate,
  MapPin,
  Navigation,
  Search,
  Shield,
  X,
} from "lucide-react";
import { useSafeRoute } from "@/hooks/useSafeRoute";
import { geocodingService, GeocodingResult } from "@/services/geocodingService";

type SearchField = "source" | "dest" | null;

type SearchState = {
  suggestions: {
    source: GeocodingResult[];
    dest: GeocodingResult[];
  };
  loading: {
    source: boolean;
    dest: boolean;
  };
  highlighted: {
    source: number;
    dest: number;
  };
};

function splitLocationLabel(displayName: string) {
  const parts = displayName.split(",").map((part) => part.trim()).filter(Boolean);
  return {
    title: parts.slice(0, 2).join(", "),
    subtitle: parts.slice(2).join(", "),
  };
}

export default function SafeRoutePanel() {
  const [sourceText, setSourceText] = useState("");
  const [destText, setDestText] = useState("");
  const [activeField, setActiveField] = useState<SearchField>(null);
  const [searchState, setSearchState] = useState<SearchState>({
    suggestions: { source: [], dest: [] },
    loading: { source: false, dest: false },
    highlighted: { source: -1, dest: -1 },
  });
  const [isLoadingGeocoding, setIsLoadingGeocoding] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    isLoading: isRouteLoading,
    error,
    fetchSafeRoute,
    resetRoute,
    sourceCoords,
    destinationCoords,
    setSourceCoords,
    setDestinationCoords,
  } = useSafeRoute();

  const panelRef = useRef<HTMLDivElement | null>(null);
  const sourceRequestIdRef = useRef(0);
  const destRequestIdRef = useRef(0);

  const sourceSuggestions = searchState.suggestions.source;
  const destSuggestions = searchState.suggestions.dest;
  const activeError = localError || error;

  const recentSearches = useMemo(() => {
    return [
      sourceText && sourceCoords ? { label: sourceText, coords: sourceCoords } : null,
      destText && destinationCoords ? { label: destText, coords: destinationCoords } : null,
    ].filter(Boolean) as Array<{ label: string; coords: [number, number] }>;
  }, [destinationCoords, destText, sourceCoords, sourceText]);

  useEffect(() => {
    handleUseCurrentLocation();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) {
        setActiveField(null);
        setSearchState((current) => ({
          ...current,
          suggestions: { source: [], dest: [] },
          highlighted: { source: -1, dest: -1 },
        }));
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
        } catch {
          setSourceText(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } finally {
          setIsLoadingGeocoding(false);
        }
      },
      () => {
        setLocalError("Could not detect your location. Please enter it manually.");
        setIsLoadingGeocoding(false);
      }
    );
  }, [setSourceCoords]);

  useEffect(() => {
    if (sourceText.trim().length < 3 || activeField !== "source") {
      setSearchState((current) => ({
        ...current,
        suggestions: { ...current.suggestions, source: [] },
        loading: { ...current.loading, source: false },
        highlighted: { ...current.highlighted, source: -1 },
      }));
      return;
    }

    const requestId = ++sourceRequestIdRef.current;
    setSearchState((current) => ({
      ...current,
      loading: { ...current.loading, source: true },
    }));

    const timer = window.setTimeout(async () => {
      const results = await geocodingService.geocodeLocation(sourceText.trim());
      if (requestId !== sourceRequestIdRef.current) return;

      setSearchState((current) => ({
        ...current,
        suggestions: { ...current.suggestions, source: results },
        loading: { ...current.loading, source: false },
        highlighted: { ...current.highlighted, source: results.length ? 0 : -1 },
      }));
    }, 220);

    return () => window.clearTimeout(timer);
  }, [activeField, sourceText]);

  useEffect(() => {
    if (destText.trim().length < 3 || activeField !== "dest") {
      setSearchState((current) => ({
        ...current,
        suggestions: { ...current.suggestions, dest: [] },
        loading: { ...current.loading, dest: false },
        highlighted: { ...current.highlighted, dest: -1 },
      }));
      return;
    }

    const requestId = ++destRequestIdRef.current;
    setSearchState((current) => ({
      ...current,
      loading: { ...current.loading, dest: true },
    }));

    const timer = window.setTimeout(async () => {
      const results = await geocodingService.geocodeLocation(destText.trim());
      if (requestId !== destRequestIdRef.current) return;

      setSearchState((current) => ({
        ...current,
        suggestions: { ...current.suggestions, dest: results },
        loading: { ...current.loading, dest: false },
        highlighted: { ...current.highlighted, dest: results.length ? 0 : -1 },
      }));
    }, 220);

    return () => window.clearTimeout(timer);
  }, [activeField, destText]);

  const handleSelectLocation = (result: GeocodingResult, type: "source" | "dest") => {
    if (type === "source") {
      setSourceText(result.display_name);
      setSourceCoords([result.latitude, result.longitude]);
    } else {
      setDestText(result.display_name);
      setDestinationCoords([result.latitude, result.longitude]);
    }

    setSearchState((current) => ({
      ...current,
      suggestions: { ...current.suggestions, [type]: [] },
      highlighted: { ...current.highlighted, [type]: -1 },
    }));
    setActiveField(null);
  };

  const handleInputChange = (value: string, type: "source" | "dest") => {
    if (type === "source") {
      setSourceText(value);
      setSourceCoords(null);
    } else {
      setDestText(value);
      setDestinationCoords(null);
    }

    setLocalError(null);
    setActiveField(type);
  };

  const handleClearField = (type: "source" | "dest") => {
    if (type === "source") {
      setSourceText("");
      setSourceCoords(null);
    } else {
      setDestText("");
      setDestinationCoords(null);
    }

    setSearchState((current) => ({
      ...current,
      suggestions: { ...current.suggestions, [type]: [] },
      highlighted: { ...current.highlighted, [type]: -1 },
    }));
    setActiveField(type);
  };

  const handleSuggestionKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    type: "source" | "dest"
  ) => {
    const suggestions = type === "source" ? sourceSuggestions : destSuggestions;
    const currentIndex = searchState.highlighted[type];

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!suggestions.length) return;
      setSearchState((current) => ({
        ...current,
        highlighted: {
          ...current.highlighted,
          [type]: currentIndex < suggestions.length - 1 ? currentIndex + 1 : 0,
        },
      }));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!suggestions.length) return;
      setSearchState((current) => ({
        ...current,
        highlighted: {
          ...current.highlighted,
          [type]: currentIndex > 0 ? currentIndex - 1 : suggestions.length - 1,
        },
      }));
      return;
    }

    if (event.key === "Enter" && activeField === type && suggestions.length) {
      event.preventDefault();
      const selected = suggestions[currentIndex] ?? suggestions[0];
      if (selected) {
        handleSelectLocation(selected, type);
      }
      return;
    }

    if (event.key === "Escape") {
      setSearchState((current) => ({
        ...current,
        suggestions: { ...current.suggestions, [type]: [] },
        highlighted: { ...current.highlighted, [type]: -1 },
      }));
      setActiveField(null);
    }
  };

  const handleFetchRoute = async (event: React.FormEvent) => {
    event.preventDefault();
    setLocalError(null);

    if (!sourceCoords || !destinationCoords) {
      setLocalError("Please select both start and destination locations from the suggestions.");
      return;
    }

    setActiveField(null);
    await fetchSafeRoute({
      startLat: sourceCoords[0],
      startLng: sourceCoords[1],
      endLat: destinationCoords[0],
      endLng: destinationCoords[1],
      preferences: { avoidHighStress: true, prioritizeSafety: true },
    });
  };

  const renderSuggestionList = (type: "source" | "dest") => {
    const suggestions = type === "source" ? sourceSuggestions : destSuggestions;
    const loading = searchState.loading[type];
    const highlighted = searchState.highlighted[type];

    if (loading) {
      return (
        <div className="flex items-center gap-3 px-4 py-4 text-sm text-[#f0f4ff]/55">
          <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
          Searching places across Bengaluru...
        </div>
      );
    }

    if (suggestions.length) {
      return suggestions.map((result, index) => {
        const location = splitLocationLabel(result.display_name);
        const isActive = highlighted === index;

        return (
          <button
            key={`${result.latitude}-${result.longitude}-${index}`}
            type="button"
            onClick={() => handleSelectLocation(result, type)}
            className={`flex w-full items-start gap-3 border-b border-white/6 px-4 py-3 text-left transition ${
              isActive ? "bg-white/[0.05]" : "hover:bg-white/[0.04]"
            } last:border-b-0`}
          >
            <div className={`mt-0.5 rounded-2xl border p-2 ${type === "source" ? "border-emerald-400/16 bg-emerald-500/10 text-emerald-300" : "border-red-400/16 bg-red-500/10 text-red-300"}`}>
              {type === "source" ? <MapPin className="h-3.5 w-3.5" /> : <Flag className="h-3.5 w-3.5" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm text-[#f0f4ff]">{location.title}</div>
              <div className="mt-1 line-clamp-2 text-xs leading-5 text-[#f0f4ff]/42">
                {location.subtitle || result.display_name}
              </div>
            </div>
          </button>
        );
      });
    }

    return (
      <div className="px-4 py-4 text-sm text-[#f0f4ff]/45">
        Try a more specific landmark, road, or neighborhood.
      </div>
    );
  };

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-map w-[min(400px,calc(100vw-2rem))] overflow-hidden rounded-[28px] shadow-[0_24px_80px_rgba(0,0,0,0.42)]"
    >
      <div className="border-b border-white/[0.06] bg-[linear-gradient(180deg,rgba(13,20,34,0.92),rgba(5,5,5,0.72))] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-emerald-400/16 bg-emerald-500/10 p-2.5 text-emerald-300">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <div className="font-display text-2xl tracking-tight text-[#f0f4ff]">Safe Route Intelligence</div>
                <div className="mt-1 text-sm text-[#f0f4ff]/45">A calmer, map-native way to search and route.</div>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              resetRoute();
              setSourceText("");
              setDestText("");
              setSourceCoords(null);
              setDestinationCoords(null);
              setLocalError(null);
              setActiveField(null);
            }}
            className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-2 text-white/45 transition hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-5 p-6">
        <form onSubmit={handleFetchRoute} className="space-y-5">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#f0f4ff]/36">Start location</label>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="inline-flex items-center gap-1 text-[11px] text-cyan-300 transition hover:text-cyan-200"
              >
                {isLoadingGeocoding ? <Loader2 className="h-3 w-3 animate-spin" /> : <Locate className="h-3 w-3" />}
                Current
              </button>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-2">
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-emerald-300" />
                <input
                  type="text"
                  placeholder="From..."
                  value={sourceText}
                  onFocus={() => setActiveField("source")}
                  onChange={(event) => handleInputChange(event.target.value, "source")}
                  onKeyDown={(event) => handleSuggestionKeyDown(event, "source")}
                  className="w-full rounded-xl border border-transparent bg-transparent py-3 pl-9 pr-14 text-sm text-[#f0f4ff] outline-none transition placeholder:text-[#f0f4ff]/20 focus:border-emerald-400/18 focus:bg-black/10"
                />
                {sourceText ? (
                  <button
                    type="button"
                    onClick={() => handleClearField("source")}
                    className="absolute right-3 top-3 rounded-full p-0.5 text-white/35 transition hover:bg-white/[0.05] hover:text-white/70"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
            </div>
            <AnimatePresence>
              {activeField === "source" && (sourceText.trim().length >= 3 || sourceSuggestions.length > 0) ? (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mt-3 overflow-hidden rounded-2xl border border-white/[0.06] bg-black/35"
                >
                  {renderSuggestionList("source")}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#f0f4ff]/36">Destination</label>
              <span className="text-[11px] text-[#f0f4ff]/28">Use arrow keys and Enter to pick a place</span>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-2">
              <div className="relative">
                <Flag className="absolute left-3 top-3.5 h-4 w-4 text-red-300" />
                <input
                  type="text"
                  placeholder="To..."
                  value={destText}
                  onFocus={() => setActiveField("dest")}
                  onChange={(event) => handleInputChange(event.target.value, "dest")}
                  onKeyDown={(event) => handleSuggestionKeyDown(event, "dest")}
                  className="w-full rounded-xl border border-transparent bg-transparent py-3 pl-9 pr-14 text-sm text-[#f0f4ff] outline-none transition placeholder:text-[#f0f4ff]/20 focus:border-emerald-400/18 focus:bg-black/10"
                />
                {destText ? (
                  <button
                    type="button"
                    onClick={() => handleClearField("dest")}
                    className="absolute right-3 top-3 rounded-full p-0.5 text-white/35 transition hover:bg-white/[0.05] hover:text-white/70"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
            </div>

            <AnimatePresence>
              {activeField === "dest" && (destText.trim().length >= 3 || destSuggestions.length > 0 || recentSearches.length > 0) ? (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mt-3 overflow-hidden rounded-2xl border border-white/[0.06] bg-black/35"
                >
                  {recentSearches.length ? (
                    <>
                      <div className="border-b border-white/6 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.24em] text-[#f0f4ff]/28">
                        Recent picks
                      </div>
                      {recentSearches.slice(0, 2).map((item, index) => {
                        const location = splitLocationLabel(item.label);
                        return (
                          <button
                            key={`${item.label}-${index}`}
                            type="button"
                            onClick={() =>
                              handleSelectLocation(
                                {
                                  latitude: item.coords[0],
                                  longitude: item.coords[1],
                                  display_name: item.label,
                                },
                                "dest"
                              )
                            }
                            className="flex w-full items-start gap-3 border-b border-white/6 px-4 py-3 text-left transition hover:bg-white/[0.04]"
                          >
                            <div className="mt-0.5 rounded-2xl border border-white/8 bg-white/[0.03] p-2 text-white/58">
                              <Navigation className="h-3.5 w-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm text-[#f0f4ff]">{location.title}</div>
                              <div className="mt-1 truncate text-xs text-[#f0f4ff]/40">{location.subtitle || item.label}</div>
                            </div>
                          </button>
                        );
                      })}
                    </>
                  ) : null}
                  {renderSuggestionList("dest")}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[11px] text-[#f0f4ff]/42">
            <div className="flex items-center gap-2">
              <CornerDownLeft className="h-3.5 w-3.5 text-[#f0f4ff]/26" />
              Keyboard pick mode enabled
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-[#f0f4ff]/18" />
          </div>

          <button
            type="submit"
            disabled={isRouteLoading || !sourceCoords || !destinationCoords}
            className="glow-emerald inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-4 font-medium text-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRouteLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Plan Safe Route
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <AnimatePresence>
          {activeError ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-2xl border border-red-400/16 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            >
              {activeError}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
