import L from 'leaflet';

// Reusable Leaflet icons for hazard markers.
// Uses the popular pointhi/leaflet-color-markers PNGs for crisp, scalable markers.
const SHADOW_URL = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png';

const BASE_OPTIONS = {
  iconSize: [25, 41] as [number, number],
  iconAnchor: [12, 41] as [number, number],
  popupAnchor: [1, -34] as [number, number],
  shadowSize: [41, 41] as [number, number],
  shadowUrl: SHADOW_URL,
};

export type HazardKind = 'pothole' | 'crack' | 'manhole' | 'open_manhole' | string;

const ICON_URLS: Record<string, string> = {
  pothole: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  crack: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  manhole: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  default: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
};

export const potholeIcon = L.icon({
  iconUrl: ICON_URLS.pothole,
  ...BASE_OPTIONS,
});

export const crackIcon = L.icon({
  iconUrl: ICON_URLS.crack,
  ...BASE_OPTIONS,
});

export const manholeIcon = L.icon({
  iconUrl: ICON_URLS.manhole,
  ...BASE_OPTIONS,
});

export const defaultIcon = L.icon({
  iconUrl: ICON_URLS.default,
  ...BASE_OPTIONS,
});

/**
 * Returns the appropriate icon for a given hazard type string.
 * Handles common synonyms and provides a fallback icon.
 */
export function getHazardIcon(hazard?: string): L.Icon {
  if (!hazard) return defaultIcon;
  const h = hazard.toLowerCase().trim();

  if (h.includes('pothole')) return potholeIcon;
  if (h.includes('crack') || h.includes('road-damage') || h.includes('cracked')) return crackIcon;
  if (h.includes('manhole') || h.includes('open_manhole') || h.includes('open manhole')) return manholeIcon;

  // fallback for unknown/other hazards
  return defaultIcon;
}

export default {
  getHazardIcon,
  potholeIcon,
  crackIcon,
  manholeIcon,
  defaultIcon,
};
