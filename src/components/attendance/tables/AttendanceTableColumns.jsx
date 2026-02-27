
// src/components/attendance/tables/AttendanceTableColumns.jsx
"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  Edit, 
  Trash2, 
  MoreVertical, 
  FileText, 
  Download, 
  CheckCircle, 
  XCircle,
  Info,
  Bell,
  BellOff
} from "lucide-react";
import {
  formatToPakistaniDate,
  formatToPakistaniTime,
} from "@/utils/TimeFuntions";
import { formatDate } from "@/utils/timezone";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export const getAttendanceColumns = ({
  canEditAttendance,
  canDeleteAttendance,
  handleEditAttendance,
  handleDeleteAttendance,
  handleViewAttendance,
}) => {
  const getStatusBadge = (status) => {
    const variants = {
      present: "bg-green-100 text-green-800 border-green-200",
      absent: "bg-red-100 text-red-800 border-red-200",
      leave: "bg-blue-100 text-blue-800 border-blue-200",
      "half-day": "bg-yellow-100 text-yellow-800 border-yellow-200",
      holiday: "bg-purple-100 text-purple-800 border-purple-200",
      "weekly-off": "bg-gray-100 text-gray-800 border-gray-200",
      weekly_off: "bg-gray-100 text-gray-800 border-gray-200",
      late: "bg-orange-100 text-orange-800 border-orange-200",
      early_checkout: "bg-pink-100 text-pink-800 border-pink-200",
      overtime: "bg-indigo-100 text-indigo-800 border-indigo-200",
    };

    return (
      <Badge variant="outline" className={`${variants[status] || "bg-gray-100 text-gray-800"} px-2 py-1 text-xs`}>
        {status?.replace(/_/g, ' ').replace(/-/g, ' ').toUpperCase()}
        {isInformed && (
          <span className="ml-1 text-xs font-normal">
            (Informed)
          </span>
        )}
      </Badge>
    );
  };

  return [
    {
      label: "Employee",
      minWidth: "200px",
      render: (a) => (
        <div className="min-w-[200px]">
          <div className="font-medium text-sm">
            {a.user
              ? `${a.user?.firstName || ""} ${a.user?.lastName || ""}`
              : a.agent?.agentName || "—"}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {a.user ? a.user.email : a.agent?.agentId || "—"}
          </div>
          {a.shift?.name && (
            <div className="text-xs text-blue-600 mt-0.5">{a.shift.name}</div>
          )}
        </div>
      ),
    },
    {
      label: "Date",
      minWidth: "120px",
      render: (a) => {
        const date = new Date(a.date || a.createdAt);
        const dayName = date.toLocaleDateString("en-US", {
          weekday: "short",
          timeZone: "Asia/Karachi",
        });
        const formattedDate = formatToPakistaniDate(a.date || a.createdAt);
        return (
          <div className="text-sm">
            <div className="font-medium">{dayName}</div>
            <div className="text-muted-foreground text-xs">{formattedDate}</div>
          </div>
        );
      },
    },
    {
      label: "Status",
      minWidth: "120px",
      render: (a) => getStatusBadge(a.status),
    },
    {
      label: "Check-In",
      minWidth: "100px",
      render: (a) => (
        <div className="text-sm">
          {a.checkInTime ? formatToPakistaniTime(a.checkInTime) : "—"}
        </div>
      ),
    },
    {
      label: "Check-Out",
      minWidth: "100px",
      render: (a) => (
        <div className="text-sm">
          {a.checkOutTime ? formatToPakistaniTime(a.checkOutTime) : "—"}
        </div>
      ),
    },
    {
      label: "Work Hours",
      minWidth: "100px",
      render: (a) => {
        if (!a.checkInTime || !a.checkOutTime)
          return <div className="text-sm text-muted-foreground">—</div>;
        const checkInTime = new Date(a.checkInTime);
        const checkOutTime = new Date(a.checkOutTime);

        if (isNaN(checkInTime.getTime()) || isNaN(checkOutTime.getTime()))
          return <div className="text-sm text-muted-foreground">—</div>;

        const diff = checkOutTime - checkInTime;
        if (diff < 0)
          return <div className="text-sm text-muted-foreground">—</div>;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        let className = "text-sm";
        if (hours < 4) className += " text-red-600 font-semibold";
        else if (hours < 8) className += " text-orange-600";
        else className += " text-green-600";

        return (
          <div className={className}>
            {hours}h {minutes}m
          </div>
        );
      },
    },
    {
      label: "Actions",
      minWidth: "80px",
      render: (a) => (
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="Actions"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {/* View Details */}
              <DropdownMenuItem
                onClick={() => handleViewAttendance(a)}
                className="cursor-pointer"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              
              {/* Informed Actions - Only for Late/Absent */}
              {(a.status === 'late' || a.status === 'absent') && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => {
                      if (handleMarkInformed) {
                        handleMarkInformed(a._id, !a.isInformed);
                      } else {
                        toast.info("Mark informed feature coming soon!");
                      }
                    }}
                    className={`cursor-pointer ${a.isInformed ? 'text-orange-600' : 'text-green-600'}`}
                  >
                    {a.isInformed ? (
                      <>
                        <BellOff className="h-4 w-4 mr-2" />
                        Mark as Uninformed
                      </>
                    ) : (
                      <>
                        <Bell className="h-4 w-4 mr-2" />
                        Mark as Informed
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => {
                      toast.info(`This ${a.status} is ${a.isInformed ? 'informed' : 'uninformed'}`);
                    }}
                    className="cursor-pointer text-blue-600"
                  >
                    <Info className="h-4 w-4 mr-2" />
                    {a.isInformed 
                      ? "Informed - No penalty" 
                      : "Uninformed - Penalty applies"}
                  </DropdownMenuItem>
                </>
              )}
              
              {/* Edit/Delete Actions */}

              {/* Download as PDF */}
              <DropdownMenuItem
                onClick={() => {
                  // PDF download functionality
                  toast.info("PDF download feature coming soon!");
                }}
                className="cursor-pointer"
              >
                <Download className="h-4 w-4 mr-2" />
                Download as PDF
              </DropdownMenuItem>

              {/* Generate Report */}
              <DropdownMenuItem
                onClick={() => {
                  // Report generation functionality
                  toast.info("Report generation feature coming soon!");
                }}
                className="cursor-pointer"
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </DropdownMenuItem>

              {/* Separator for edit/delete actions */}
              {(canEditAttendance || canDeleteAttendance) && (
                <>
                  <DropdownMenuSeparator />

                  {/* Edit Attendance */}
                  {canEditAttendance && (
                    <DropdownMenuItem
                      onClick={() => handleEditAttendance(a)}
                      className="cursor-pointer text-blue-600"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Attendance
                    </DropdownMenuItem>
                  )}

                  {/* Delete Attendance */}
                  {/* {canDeleteAttendance && (
                    <DropdownMenuItem 
                      onClick={() => handleDeleteAttendance(a._id)}
                      className="cursor-pointer text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Attendance
                    </DropdownMenuItem>
                  )} */}
                </>
              )}
              
              {/* Quick Actions */}
              <DropdownMenuSeparator />
              
              {/* Mark as Present */}
              <DropdownMenuItem 
                onClick={() => {
                  // Mark as present/absent quick actions
                  toast.info("Quick action feature coming soon!");
                }}
                className="cursor-pointer text-green-600"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Present
              </DropdownMenuItem>
              
              {/* Mark as Absent */}
              <DropdownMenuItem 
                onClick={() => {
                  toast.info("Quick action feature coming soon!");
                }}
                className="cursor-pointer text-red-600"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Mark as Absent
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
};
 