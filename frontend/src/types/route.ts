/*
OWNER: Shared
MODULE: Route API Types
*/

export type RouteCoordinate = [number, number];

export interface SafeRouteResponse {
  stress_score: number;
  safe: boolean;
  route: RouteCoordinate[];
}
