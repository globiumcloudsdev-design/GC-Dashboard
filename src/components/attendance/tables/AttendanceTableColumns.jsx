// src/components/attendance/tables/AttendanceTableColumns.jsx
"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2 } from "lucide-react";
import { formatToPakistaniDate, formatToPakistaniTime } from "@/utils/TimeFuntions";

export const getAttendanceColumns = ({
  canEditAttendance,
  canDeleteAttendance,
  handleEditAttendance,
  handleDeleteAttendance,
  handleViewAttendance,
}) => {
  const getStatusBadge = (status) => {
    const variants = {
      present: "bg-green-100 text-green-800",
      absent: "bg-red-100 text-red-800",
      leave: "bg-blue-100 text-blue-800",
      "half-day": "bg-yellow-100 text-yellow-800",
      holiday: "bg-purple-100 text-purple-800",
      "weekly-off": "bg-gray-100 text-gray-800",
    };

    return (
      <Badge className={variants[status] || ""}>
        {status?.replace('-', ' ').toUpperCase()}
      </Badge>
    );
  };

  return [
    {
      label: "Agent",
      minWidth: "200px",
      render: (a) => (
        <div>
          <div className="font-medium">
            {a.user
              ? `${a.user?.firstName || ""} ${a.user?.lastName || ""}`
              : a.agent?.agentName || "—"}
          </div>
          <div className="text-xs text-muted-foreground">
            {a.user ? a.user.email : a.agent?.email}
          </div>
        </div>
      ),
    },
    {
      label: "Date",
      minWidth: "120px",
      render: (a) => formatToPakistaniDate(a.date),
    },
    {
      label: "Status",
      minWidth: "100px",
      render: (a) => getStatusBadge(a.status),
    },
    {
      label: "Check-In",
      minWidth: "100px",
      render: (a) =>
        a.checkIn ? formatToPakistaniTime(a.checkIn) : "—",
    },
    {
      label: "Check-Out",
      minWidth: "100px",
      render: (a) =>
        a.checkOut ? formatToPakistaniTime(a.checkOut) : "—",
    },
    {
      label: "Work Hours",
      minWidth: "100px",
      render: (a) => {
        if (!a.checkIn || !a.checkOut) return "—";
        const checkInTime = new Date(a.checkIn);
        const checkOutTime = new Date(a.checkOut);
        const diff = checkOutTime - checkInTime;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
      },
    },
    ...(canEditAttendance || canDeleteAttendance
      ? [
          {
            label: "Actions",
            minWidth: "200px",
            render: (a) => (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewAttendance(a)}
                  title="View attendance details"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {canEditAttendance && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditAttendance(a)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {canDeleteAttendance && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteAttendance(a._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ),
          },
        ]
      : [
          {
            label: "Actions",
            minWidth: "100px",
            render: (a) => (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewAttendance(a)}
                title="View attendance details"
              >
                <Eye className="h-4 w-4" />
              </Button>
            ),
          },
        ]),
  ];
};
