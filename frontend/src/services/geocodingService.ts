import axios from 'axios';

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  display_name: string;
}

const ALLOWED_COUNTRY_CODES = 'in';
const CACHE_TTL_MS = 10 * 60 * 1000;

const LOCAL_INDIAN_PLACES: GeocodingResult[] = [
  { latitude: 12.9784, longitude: 77.6408, display_name: 'Indiranagar, Bengaluru, Karnataka, India' },
  { latitude: 12.9772, longitude: 77.6413, display_name: 'Indira Nagar, Bengaluru, Karnataka, India' },
  { latitude: 12.9806, longitude: 77.6400, display_name: 'Indiranagar 100 Feet Road, Bengaluru, Karnataka, India' },
  { latitude: 12.9760, longitude: 77.6392, display_name: 'Indiranagar Metro Station, Bengaluru, Karnataka, India' },
  { latitude: 12.9352, longitude: 77.6245, display_name: 'Koramangala, Bengaluru, Karnataka, India' },
  { latitude: 12.9716, longitude: 77.5946, display_name: 'Bengaluru, Karnataka, India' },
  { latitude: 12.9750, longitude: 77.6069, display_name: 'MG Road, Bengaluru, Karnataka, India' },
  { latitude: 12.9250, longitude: 77.5938, display_name: 'Jayanagar, Bengaluru, Karnataka, India' },
  { latitude: 12.9910, longitude: 77.5569, display_name: 'Rajajinagar, Bengaluru, Karnataka, India' },
  { latitude: 13.0033, longitude: 77.5690, display_name: 'Malleshwaram, Bengaluru, Karnataka, India' },
  { latitude: 13.0358, longitude: 77.5960, display_name: 'Hebbal, Bengaluru, Karnataka, India' },
  { latitude: 12.9592, longitude: 77.6974, display_name: 'Marathahalli, Bengaluru, Karnataka, India' },
  { latitude: 12.9116, longitude: 77.6381, display_name: 'HSR Layout, Bengaluru, Karnataka, India' },
  { latitude: 12.9250, longitude: 77.5460, display_name: 'Banashankari, Bengaluru, Karnataka, India' },
  { latitude: 12.8456, longitude: 77.6603, display_name: 'Electronic City, Bengaluru, Karnataka, India' },
  { latitude: 13.0212, longitude: 77.5495, display_name: 'Yeshwanthpur, Bengaluru, Karnataka, India' },
  { latitude: 12.9816, longitude: 77.6285, display_name: 'Ulsoor, Bengaluru, Karnataka, India' },
  { latitude: 12.9415, longitude: 77.5750, display_name: 'Basavanagudi, Bengaluru, Karnataka, India' },
  { latitude: 12.9165, longitude: 77.6101, display_name: 'BTM Layout, Bengaluru, Karnataka, India' },
  { latitude: 12.9315, longitude: 77.6780, display_name: 'Bellandur, Bengaluru, Karnataka, India' },
  { latitude: 12.8615, longitude: 77.7688, display_name: 'Sarjapur, Bengaluru, Karnataka, India' },
  { latitude: 22.7196, longitude: 75.8577, display_name: 'Indore, Madhya Pradesh, India' },
  { latitude: 28.6139, longitude: 77.2090, display_name: 'Indraprastha, New Delhi, Delhi, India' },
];

const geocodeCache = new Map<string, { timestamp: number; results: GeocodingResult[] }>();

function mapGeocodingResult(item: any): GeocodingResult {
  return {
    latitude: parseFloat(item.lat),
    longitude: parseFloat(item.lon),
    display_name: item.display_name,
  };
}

function isAllowedIndianResult(item: any): boolean {
  const countryCode = String(item?.address?.country_code || '').toLowerCase();
  const displayName = String(item?.display_name || '');
  return countryCode === 'in' || displayName.toLowerCase().includes(', india');
}

function rankResultsByQuery(results: GeocodingResult[], query: string): GeocodingResult[] {
  const normalizedQuery = query.trim().toLowerCase();

  return [...results].sort((left, right) => {
    const leftName = left.display_name.toLowerCase();
    const rightName = right.display_name.toLowerCase();

    const leftPrefixMatch = leftName.startsWith(normalizedQuery) ? 0 : 1;
    const rightPrefixMatch = rightName.startsWith(normalizedQuery) ? 0 : 1;

    if (leftPrefixMatch !== rightPrefixMatch) {
      return leftPrefixMatch - rightPrefixMatch;
    }

    const leftContains = leftName.includes(normalizedQuery) ? 0 : 1;
    const rightContains = rightName.includes(normalizedQuery) ? 0 : 1;

    if (leftContains !== rightContains) {
      return leftContains - rightContains;
    }

    return left.display_name.localeCompare(right.display_name);
  });
}

function getLocalMatches(query: string): GeocodingResult[] {
  const normalizedQuery = query.trim().toLowerCase();

  return rankResultsByQuery(
    LOCAL_INDIAN_PLACES.filter((place) => {
      const name = place.display_name.toLowerCase();
      return name.startsWith(normalizedQuery) || name.includes(normalizedQuery);
    }),
    query
  );
}

function dedupeResults(results: GeocodingResult[]): GeocodingResult[] {
  const seen = new Set<string>();
  return results.filter((result) => {
    const key = `${result.latitude.toFixed(6)}|${result.longitude.toFixed(6)}|${result.display_name.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export const geocodingService = {
  /**
   * Geocode a location query string into coordinates
   */
  geocodeLocation: async (query: string): Promise<GeocodingResult[]> => {
    if (!query || query.length < 3) return [];

    const cacheKey = query.trim().toLowerCase();
    const cached = geocodeCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.results;
    }

    const localResults = getLocalMatches(query).slice(0, 5);
    
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
          q: query,
          format: 'json',
          limit: 10,
          addressdetails: 1,
          countrycodes: ALLOWED_COUNTRY_CODES,
        },
        headers: {
          'Accept-Language': 'en'
        }
      });

      const results = (response.data || [])
        .filter(isAllowedIndianResult)
        .map(mapGeocodingResult);

      const merged = dedupeResults([...localResults, ...rankResultsByQuery(results, query)]).slice(0, 5);
      geocodeCache.set(cacheKey, { timestamp: Date.now(), results: merged });
      return merged;
    } catch (error) {
      console.error('Geocoding error:', error);
      geocodeCache.set(cacheKey, { timestamp: Date.now(), results: localResults });
      return localResults;
    }
  },

  /**
   * Reverse geocode coordinates into a readable address
   */
  reverseGeocode: async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
        params: {
          lat,
          lon: lng,
          format: 'json',
          addressdetails: 1,
        },
        headers: {
          'Accept-Language': 'en'
        }
      });

      return response.data.display_name || 'Current Location';
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return 'Current Location';
    }
  }
};
