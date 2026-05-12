/*
OWNER: Sushanth
MODULE: Hazard Report Marker Layer
*/

import { Marker, Popup } from "react-leaflet";
import { useReports } from "@/hooks/useReports";
import HazardPopup from "./HazardPopup";
import type { Report } from "@/services/reportService";

const hasValidCoordinates = (report: Report): boolean => {
  return Number.isFinite(report.latitude) && Number.isFinite(report.longitude);
};

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

  const validReports = reports.filter(hasValidCoordinates);

  if (validReports.length === 0) {
    return null;
  }

  return (
    <>
      {validReports.map((report) => (
        <Marker key={report.id} position={[report.latitude, report.longitude]}>
          <Popup>
            <HazardPopup report={report} />
          </Popup>
        </Marker>
      ))}
    </>
  );
}
