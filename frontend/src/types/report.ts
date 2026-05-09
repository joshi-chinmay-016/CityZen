/*
OWNER: Shared
MODULE: Report API Types
*/

export type HazardSeverity = "low" | "medium" | "high";

export type HazardType = "pothole" | "crack" | "manhole";

export interface HazardReport {
  id: string;
  latitude: number;
  longitude: number;
  hazard: HazardType;
  severity: HazardSeverity;
  confidence: number;
  timestamp: string;
}
