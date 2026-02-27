// src/components/TodayStatusCard.jsx
import React from "react";
import { Clock, CheckCircle2, XCircle, Timer } from "lucide-react";
import { formatTime } from "@/utils/timezone";

const TodayStatusCard = ({ todayAttendance, agentShift, workingTime }) => {
  const getShiftTiming = () => {
    if (!agentShift) return "No shift assigned";
    const fmt = (t) => {
      if (!t) return "--:--";
      const [h, m] = t.split(":");
      return `${h}:${m}`;
    };
    return `${fmt(agentShift.startTime)} – ${fmt(agentShift.endTime)}`;
  };

  const { status, label, icon } = !todayAttendance
    ? {
        status: "idle",
        label: "Not Checked In",
        icon: <XCircle className="h-4 w-4 text-gray-400" />,
      }
    : todayAttendance.checkOutTime
      ? {
          status: "done",
          label: "Checked Out",
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        }
      : {
          status: "working",
          label: "Checked In — Working",
          icon: (
            <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
          ),
        };

  const rows = [
    { label: "Shift", value: agentShift?.name || "Not Assigned" },
    { label: "Timing", value: getShiftTiming() },
    {
      label: "Status",
      value: label,
      extra: icon,
      valueClass:
        status === "working"
          ? "text-green-600"
          : status === "done"
            ? "text-blue-600"
            : "text-gray-500",
    },
    ...(todayAttendance && !todayAttendance.checkOutTime
      ? [
          {
            label: "Working Time",
            value: workingTime,
            valueClass: "text-blue-600 font-mono font-bold",
            icon: <Timer className="h-3.5 w-3.5 text-blue-400" />,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-2">
      {rows.map(({ label, value, extra, valueClass, icon }) => (
        <div
          key={label}
          className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0"
        >
          <span className="text-sm text-gray-500 font-medium">{label}</span>
          <div className="flex items-center gap-1.5">
            {extra}
            {icon}
            <span
              className={`text-sm font-semibold text-gray-800 ${valueClass || ""}`}
            >
              {value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TodayStatusCard;
