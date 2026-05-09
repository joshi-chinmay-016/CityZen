/*
OWNER: Sushanth
MODULE: Hazard Marker Popup
*/

import { HazardReport, HazardSeverity } from "@/types/report";

interface HazardPopupProps {
  report: HazardReport;
}

const getSeverityColor = (severity: HazardSeverity): string => {
  switch (severity) {
    case "low":
      return "bg-blue-100 border-blue-300 text-blue-900";
    case "medium":
      return "bg-yellow-100 border-yellow-300 text-yellow-900";
    case "high":
      return "bg-red-100 border-red-300 text-red-900";
    default:
      return "bg-gray-100 border-gray-300 text-gray-900";
  }
};

const getSeverityBadgeColor = (severity: HazardSeverity): string => {
  switch (severity) {
    case "low":
      return "bg-blue-500 text-white";
    case "medium":
      return "bg-yellow-500 text-white";
    case "high":
      return "bg-red-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

const formatTimestamp = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    }
  } catch {
    return new Date(timestamp).toLocaleDateString();
  }
};

const formatHazardType = (hazardType: string): string => {
  return hazardType.charAt(0).toUpperCase() + hazardType.slice(1);
};

export default function HazardPopup({ report }: HazardPopupProps) {
  const severityColors = getSeverityColor(report.severity);
  const badgeColor = getSeverityBadgeColor(report.severity);
  const timeago = formatTimestamp(report.timestamp);

  return (
    <div
      className={`w-64 p-4 rounded-lg border-2 shadow-lg ${severityColors}`}
    >
      {/* Header with Hazard Type and Severity Badge */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold">
          {formatHazardType(report.hazard)}
        </h3>
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${badgeColor}`}
        >
          {report.severity.toUpperCase()}
        </span>
      </div>

      {/* Divider */}
      <div className="h-px bg-current opacity-20 mb-3"></div>

      {/* Confidence Percentage */}
      <div className="mb-3">
        <p className="text-xs font-semibold opacity-75 mb-1">CONFIDENCE</p>
        <div className="w-full bg-black bg-opacity-10 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${badgeColor}`}
            style={{ width: `${report.confidence * 100}%` }}
          ></div>
        </div>
        <p className="text-sm font-semibold mt-1">
          {(report.confidence * 100).toFixed(0)}%
        </p>
      </div>

      {/* Timestamp */}
      <div className="text-xs opacity-70 pt-2 border-t border-current border-opacity-20">
        {timeago}
      </div>
    </div>
  );
}
