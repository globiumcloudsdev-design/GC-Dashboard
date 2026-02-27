// src/components/TodayDetailsCard.jsx
import React from "react";
import { formatTime } from "@/utils/timezone";

const TodayDetailsCard = ({ todayAttendance }) => {
  if (!todayAttendance) return null;

  const statusMap = {
    present: { label: "Present", cls: "bg-green-100  text-green-700" },
    late: { label: "Late", cls: "bg-amber-100  text-amber-700" },
    absent: { label: "Absent", cls: "bg-red-100    text-red-700" },
    half_day: { label: "Half Day", cls: "bg-blue-100   text-blue-700" },
    overtime: { label: "Overtime", cls: "bg-indigo-100 text-indigo-700" },
  };

  const { label: statusLabel, cls: statusCls } = statusMap[
    todayAttendance.status
  ] || {
    label: (todayAttendance.status || "Present").toUpperCase(),
    cls: "bg-gray-100 text-gray-700",
  };

  const rows = [
    {
      label: "Check-in Time",
      value: formatTime(todayAttendance.checkInTime),
      mono: true,
    },
    ...(todayAttendance.checkOutTime
      ? [
          {
            label: "Check-out Time",
            value: formatTime(todayAttendance.checkOutTime),
            mono: true,
          },
        ]
      : []),
    ...(todayAttendance.isLate
      ? [
          {
            label: "Late By",
            value: `${todayAttendance.lateMinutes} minutes`,
            valueClass: "text-orange-600 font-semibold",
          },
        ]
      : []),
    ...(todayAttendance.isOvertime
      ? [
          {
            label: "Overtime",
            value: `${todayAttendance.overtimeMinutes} minutes`,
            valueClass: "text-blue-600 font-semibold",
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-2">
      {/* Status badge */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <span className="text-sm text-gray-500 font-medium">Status</span>
        <span
          className={`text-xs font-bold px-3 py-1 rounded-full ${statusCls}`}
        >
          {statusLabel}
        </span>
      </div>
      {rows.map(({ label, value, mono, valueClass }) => (
        <div
          key={label}
          className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0"
        >
          <span className="text-sm text-gray-500 font-medium">{label}</span>
          <span
            className={`text-sm font-semibold text-gray-800 ${mono ? "font-mono" : ""} ${valueClass || ""}`}
          >
            {value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default TodayDetailsCard;
