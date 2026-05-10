/*
OWNER: Shared
MODULE: Report API Types
*/

export type HazardSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export interface HazardReport {
  id: string;
  latitude: number;
  longitude: number;
  hazard: string;
  severity: HazardSeverity;
  confidence: number;
  timestamp: string;
}
