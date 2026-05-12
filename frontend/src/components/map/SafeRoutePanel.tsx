"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Bike,
  Clock3,
  Flag,
  Info,
  Leaf,
  Loader2,
  LocateFixed,
  MapPinned,
  Route,
  Search,
  UserRound,
  Waves,
  X,
} from "lucide-react";
import { useSafeRoute } from "@/hooks/useSafeRoute";
import { geocodingService, GeocodingResult } from "@/services/geocodingService";

type SearchField = "source" | "dest" | null;
type RouteMode = "calmest" | "fastest" | "walking" | "cycling";

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

type SafeRoutePanelProps = {
  onClose?: () => void;
};

const routeModes: Array<{
  id: RouteMode;
  label: string;
  icon: typeof Leaf;
}> = [
  { id: "calmest", label: "Calmest", icon: Leaf },
  { id: "fastest", label: "Fastest", icon: Clock3 },
  { id: "walking", label: "Walking", icon: Waves },
  { id: "cycling", label: "Cycling", icon: Bike },
];

function splitLocationLabel(displayName: string) {
  const parts = displayName.split(",").map((part) => part.trim()).filter(Boolean);
  return {
    title: parts.slice(0, 2).join(", "),
    subtitle: parts.slice(2).join(", "),
  };
}

export default function SafeRoutePanel({ onClose }: SafeRoutePanelProps) {
  const [sourceText, setSourceText] = useState("");
  const [destText, setDestText] = useState("");
  const [activeField, setActiveField] = useState<SearchField>(null);
  const [routeMode, setRouteMode] = useState<RouteMode>("calmest");
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
          setSourceText("My location");
        } finally {
          setIsLoadingGeocoding(false);
        }
      },
      () => {
        setSourceText("My location");
        setLocalError("Could not detect your exact location. You can still search manually.");
        setIsLoadingGeocoding(false);
      }
    );
  }, [setSourceCoords]);

  useEffect(() => {
    handleUseCurrentLocation();
  }, [handleUseCurrentLocation]);

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
      setLocalError("Please select both your origin and destination from the suggestions.");
      return;
    }

    setActiveField(null);
    await fetchSafeRoute({
      startLat: sourceCoords[0],
      startLng: sourceCoords[1],
      endLat: destinationCoords[0],
      endLng: destinationCoords[1],
      preferences: {
        avoidHighStress: routeMode !== "fastest",
        prioritizeSafety: routeMode === "calmest" || routeMode === "walking" || routeMode === "cycling",
      },
    });
  };

  const renderSuggestionList = (type: "source" | "dest") => {
    const suggestions = type === "source" ? sourceSuggestions : destSuggestions;
    const loading = searchState.loading[type];
    const highlighted = searchState.highlighted[type];

    if (loading) {
      return (
        <div className="flex items-center gap-3 px-3 py-3 text-sm text-[#666]">
          <Loader2 className="h-4 w-4 animate-spin text-[#4caf80]" />
          Searching nearby places...
        </div>
      );
    }

    if (!suggestions.length) {
      return (
        <div className="px-3 py-3 text-sm text-[#666]">
          Try a more specific landmark, road, or neighborhood.
        </div>
      );
    }

    return suggestions.map((result, index) => {
      const location = splitLocationLabel(result.display_name);
      const isActive = highlighted === index;

      return (
        <button
          key={`${result.latitude}-${result.longitude}-${index}`}
          type="button"
          onClick={() => handleSelectLocation(result, type)}
          className={`flex w-full items-start gap-3 border-t border-[#1e1f22] px-3 py-3 text-left ${
            isActive ? "bg-[#141e18]" : "bg-transparent"
          }`}
        >
          <div
            className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full border ${
              type === "source"
                ? "border-[#2a6e4a] bg-[#1a2420] text-[#4caf80]"
                : "border-[#6e2a2a] bg-[#221a1a] text-[#e07070]"
            }`}
          >
            {type === "source" ? <MapPinned className="h-3.5 w-3.5" /> : <Flag className="h-3.5 w-3.5" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm text-[#f0f0f0]">{location.title}</div>
            <div className="mt-1 line-clamp-2 text-xs leading-5 text-[#666]">
              {location.subtitle || result.display_name}
            </div>
          </div>
        </button>
      );
    });
  };

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.28 }}
      className="absolute left-0 top-0 z-[100] w-full max-w-[340px] overflow-hidden rounded-[20px] border border-[rgba(42,43,46,0.8)] bg-[#111214] md:w-[340px]"
    >
      <div className="border-b border-[#1e1f22] px-[18px] py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-[#1a6e3c] text-[#7eeaa6]">
            <Route className="h-[18px] w-[18px]" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[15px] font-medium text-[#f0f0f0]">Safe Route</div>
                <div className="mt-0.5 text-xs text-[#666]">Map-native routing</div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden items-center gap-2 whitespace-nowrap text-[11px] text-[#4caf80] sm:flex">
                  <span className="h-2 w-2 rounded-full bg-[#4caf80]" />
                  <span>2,853 sensors live</span>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#1a1b1e] text-[#f0f0f0] hover:text-white"
                  aria-label="Close safe route panel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-2 flex items-center gap-2 text-[11px] text-[#4caf80] sm:hidden">
              <span className="h-2 w-2 rounded-full bg-[#4caf80]" />
              <span>2,853 sensors live</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-[18px] py-4">
        <form onSubmit={handleFetchRoute}>
          <div className="relative pl-12">
            <div className="absolute left-[23px] top-[46px] h-[88px] w-px bg-[repeating-linear-gradient(to_bottom,#4caf80_0_4px,transparent_4px_8px)]" />

            <div className="relative">
              <div className="absolute left-[-48px] top-[18px] flex h-[34px] w-[34px] items-center justify-center rounded-full border border-[#2a6e4a] bg-[#1a2420] text-[#4caf80]">
                <LocateFixed className="h-4 w-4" />
              </div>
              <label className="mb-2 block text-[10px] tracking-[0.08em] text-[#555]">From</label>
              <div className="rounded-[10px] border border-[#2a2b2e] bg-[#18191c] px-3 py-[10px]">
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    className="truncate text-left text-[14px] text-[#f0f0f0]"
                  >
                    {sourceText || "My location"}
                  </button>
                  <span className="rounded-full border border-[#2a6e4a] bg-[#141e18] px-2.5 py-1 text-[11px] text-[#4caf80]">
                    {isLoadingGeocoding ? "Locating..." : "Current"}
                  </span>
                </div>
              </div>
            </div>

            <div className="relative mt-4">
              <div className="absolute left-[-48px] top-[18px] flex h-[34px] w-[34px] items-center justify-center rounded-full border border-[#6e2a2a] bg-[#221a1a] text-[#e07070]">
                <Flag className="h-4 w-4" />
              </div>
              <label className="mb-2 block text-[10px] tracking-[0.08em] text-[#555]">To</label>
              <div
                className={`rounded-[10px] border bg-[#18191c] px-3 py-[10px] ${
                  activeField === "dest" ? "border-[#2a6e4a]" : "border-[#2a2b2e]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-[#555]" />
                  <input
                    type="text"
                    placeholder="Search destination..."
                    value={destText}
                    onFocus={() => setActiveField("dest")}
                    onChange={(event) => handleInputChange(event.target.value, "dest")}
                    onKeyDown={(event) => handleSuggestionKeyDown(event, "dest")}
                    className="w-full bg-transparent text-[14px] text-[#f0f0f0] outline-none placeholder:text-[#555]"
                  />
                </div>
              </div>

              <AnimatePresence>
                {activeField === "dest" && (destText.trim().length >= 3 || destSuggestions.length > 0 || recentSearches.length > 0) ? (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="mt-2 overflow-hidden rounded-[10px] border border-[#2a2b2e] bg-[#18191c]"
                  >
                    {recentSearches.length ? (
                      <button
                        type="button"
                        onClick={() =>
                          handleSelectLocation(
                            {
                              latitude: recentSearches[recentSearches.length - 1].coords[0],
                              longitude: recentSearches[recentSearches.length - 1].coords[1],
                              display_name: recentSearches[recentSearches.length - 1].label,
                            },
                            "dest"
                          )
                        }
                        className="flex w-full items-center gap-3 px-3 py-3 text-left text-sm text-[#f0f0f0]"
                      >
                        <UserRound className="h-4 w-4 text-[#666]" />
                        Recent destination
                      </button>
                    ) : null}
                    {renderSuggestionList("dest")}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-4 gap-2">
            {routeModes.map((mode) => {
              const Icon = mode.icon;
              const isSelected = routeMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setRouteMode(mode.id)}
                  className={`flex min-h-[70px] flex-col items-center justify-center rounded-[10px] border px-2 py-[9px] text-center ${
                    isSelected
                      ? "border-[#2a6e4a] bg-[#141e18] text-[#4caf80]"
                      : "border-[#2a2b2e] bg-[#18191c] text-[#555]"
                  }`}
                >
                  <Icon className="h-[15px] w-[15px]" />
                  <span className="mt-2 text-[11px]">{mode.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex items-center justify-between rounded-[12px] border border-[#2a5e3a] bg-[#141e18] px-[14px] py-3">
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-medium text-[#4caf80]">Area calmness right now</div>
              <div className="mt-3 h-1 w-full rounded-full bg-[#1e2e24]">
                <div className="h-1 rounded-full bg-[#4caf80]" style={{ width: "78%" }} />
              </div>
            </div>
            <div className="ml-4 text-right">
              <div className="text-[22px] font-medium leading-none text-[#4caf80]">78</div>
              <div className="mt-1 text-[11px] text-[#2a6e4a]">/100</div>
            </div>
          </div>

          <div className="mt-5 px-[18px]">
            <button
              type="submit"
              disabled={isRouteLoading || !sourceCoords || !destinationCoords}
              className="flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#1a6e3c] px-4 py-[13px] text-[14px] font-medium text-[#d0f0e0] disabled:opacity-50"
            >
              {isRouteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Route className="h-4 w-4" />}
              <span>Find calm route</span>
            </button>
          </div>
        </form>

        <AnimatePresence>
          {activeError ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mx-[18px] mt-4 rounded-[10px] border border-[#6e2a2a] bg-[#221a1a] px-3 py-2 text-sm text-[#e07070]"
            >
              {activeError}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-[#1e1f22] px-[18px] py-3 text-[11px]">
        <div className="flex items-center gap-2 text-[#444]">
          <Info className="h-3.5 w-3.5" />
          <span>Avoids flagged zones automatically</span>
        </div>
        <div className="flex items-center gap-2 text-[#2a6e4a]">
          <Activity className="h-3.5 w-3.5" />
          <span>Sensors rebalancing</span>
        </div>
      </div>
    </motion.div>
  );
}
