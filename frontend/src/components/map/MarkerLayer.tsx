/*
OWNER: Sushanth
MODULE: Hazard Report Marker Layer
*/

import { Marker, Popup } from "react-leaflet";
import { useReports } from "@/hooks/useReports";
import HazardPopup from "./HazardPopup";
import { getHazardIcon } from '@/lib/markerIcons';

export default function MarkerLayer() {
  const { reports, isLoading, error } = useReports();

  // Handle loading state
  if (isLoading) {
    return null;
  }

  // Handle error state
  if (error) {
    console.warn("MarkerLayer error:", error);
    return null;
  }

  // Render nothing if no reports
  if (!reports || reports.length === 0) {
    return null;
  }

  // Filter out any malformed reports without valid numeric coordinates
  const validReports = reports.filter(r => {
    if (!r) return false;
    const lat = Number((r as any).latitude);
    const lng = Number((r as any).longitude);
    return Number.isFinite(lat) && Number.isFinite(lng);
  });

  return (
    <>
      {validReports.map((report) => {
        const lat = Number((report as any).latitude);
        const lng = Number((report as any).longitude);
        const hazardType = (report as any).hazard as string | undefined;
        const icon = getHazardIcon(hazardType);

        return (
          <Marker key={report.id} position={[lat, lng]} icon={icon}>
            <Popup>
              <HazardPopup report={report} />
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}
