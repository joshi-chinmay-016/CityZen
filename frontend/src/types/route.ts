/*
OWNER: Shared
MODULE: Route API Types
*/

export type RouteCoordinate = [number, number];
export type RouteRiskLevel = "safe" | "moderate" | "risky";

export interface NearbyHazard {
  id?: string | null;
  latitude: number;
  longitude: number;
  hazard: string;
  severity: string;
  closest_distance_meters?: number;
}

export interface SafeRouteResponse {
  id?: string;
  type?: RouteRiskLevel;
  stress_score: number;
  safe: boolean;
  route: RouteCoordinate[];
  distance_meters?: number;
  duration_seconds?: number;
  hazards?: number;
  nearby_hazards?: NearbyHazard[];
  routes?: SafeRouteResponse[];
}

export function classifyRouteRisk(route: Pick<SafeRouteResponse, "type" | "stress_score" | "safe">): RouteRiskLevel {
  if (route.type) {
    return route.type;
  }

  if (route.stress_score <= 25) {
    return "safe";
  }

  if (route.stress_score <= 60) {
    return "moderate";
  }

  return route.safe ? "safe" : "risky";
}
