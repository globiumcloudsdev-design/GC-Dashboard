// src/components/LocationStatusCard.jsx
import React from "react";
import {
  MapPin,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
} from "lucide-react";

const LocationStatusCard = ({ distance, checkRadius, loading }) => {
  const isWithinRange =
    distance !== null && distance !== undefined && distance <= checkRadius;

  const config = loading
    ? {
        icon: <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />,
        label: "Checking location…",
        sub: null,
        bg: "bg-gray-50 border-gray-200",
        text: "text-gray-500",
      }
    : distance === null || distance === undefined
      ? {
          icon: <XCircle className="h-5 w-5 text-red-500" />,
          label: "Location unavailable",
          sub: "Enable location access",
          bg: "bg-red-50 border-red-200",
          text: "text-red-600",
        }
      : isWithinRange
        ? {
            icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
            label: "Within office range",
            sub: `${distance.toFixed(0)} m from office`,
            bg: "bg-green-50 border-green-200",
            text: "text-green-600",
          }
        : {
            icon: <AlertTriangle className="h-5 w-5 text-orange-500" />,
            label: "Outside office range",
            sub: `${distance.toFixed(0)} m — allowed: ${checkRadius}m`,
            bg: "bg-orange-50 border-orange-200",
            text: "text-orange-600",
          };

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border p-4 ${config.bg}`}
    >
      <div
        className={`p-2.5 rounded-xl ${loading ? "bg-gray-100" : isWithinRange ? "bg-green-100" : distance === null ? "bg-red-100" : "bg-orange-100"}`}
      >
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${config.text}`}>{config.label}</p>
        {config.sub && (
          <p className="text-xs text-gray-500 mt-0.5">{config.sub}</p>
        )}
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-xs text-gray-400">Range</p>
        <p className="text-sm font-bold text-gray-700">{checkRadius}m</p>
      </div>
    </div>
  );
};

export default LocationStatusCard;
