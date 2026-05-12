import axios from 'axios';

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  display_name: string;
}

export const geocodingService = {
  /**
   * Geocode a location query string into coordinates
   */
  geocodeLocation: async (query: string): Promise<GeocodingResult[]> => {
    if (!query || query.length < 3) return [];
    
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
          q: query,
          format: 'json',
          limit: 5,
          addressdetails: 1
        },
        headers: {
          'Accept-Language': 'en'
        }
      });

      return response.data.map((item: any) => ({
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        display_name: item.display_name
      }));
    } catch (error) {
      console.error('Geocoding error:', error);
      return [];
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
          format: 'json'
        }
      });

      return response.data.display_name || 'Current Location';
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return 'Current Location';
    }
  }
};
