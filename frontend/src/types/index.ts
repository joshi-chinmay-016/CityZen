/*
SHARED MODULE: Type Definitions
*/

export interface Report {
  id: string;
  lat: number;
  lng: number;
  type: 'traffic' | 'pothole' | 'safety';
  timestamp: number;
}

export interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number;
}

export interface RouteData {
  route: unknown;
  stressScore: number;
  hazardsFound: Report[];
}
