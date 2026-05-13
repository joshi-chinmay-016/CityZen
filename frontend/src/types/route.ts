/*
OWNER: Shared
MODULE: Route API Types
*/

export type RouteCoordinate = [number, number];

export type RouteType = 'safe' | 'moderate' | 'risky';
export type RouteSeverity = 'low' | 'medium' | 'high';

export interface Hazard {
  id: string;
  latitude: number;
  longitude: number;
  type: string;
  severity: RouteSeverity;
}

export interface SingleRoute {
  type: RouteType;
  stress_score: number;
  safe: boolean;
  distance: number;
  duration: number;
  route: RouteCoordinate[];
  nearby_hazards: Hazard[];
}

export interface SafeRouteResponse {
  routes: SingleRoute[];
}

// Legacy support for single route
export interface LegacySafeRouteResponse {
  stress_score: number;
  safe: boolean;
  route: RouteCoordinate[];
}
