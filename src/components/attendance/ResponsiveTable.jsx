// src/components/attendance/ResponsiveTable.jsx
"use client";
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Edit, Eye } from "lucide-react";
import { formatToPakistaniDate, formatToPakistaniTime } from "@/utils/TimeFuntions";

export default function ResponsiveTable({
  data,
  columns,
  loading,
  emptyMessage = "No data found",
  className = "",
  activeTab = "attendance",
  canEditAttendance = false,
  canEditAttendanceRecord,
  handleEditAttendance,
  handleViewAttendance,
  getStatusBadge,
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Mobile Card View for Attendance
  if (isMobile && activeTab === "attendance") {
    return (
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
            <p className="mt-2 text-muted-foreground">Loading data...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          data.map((item) => (
            <Card key={item._id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {item.user
                          ? `${item.user?.firstName || ""} ${item.user?.lastName || ""}`
                          : item.agent?.agentName || "—"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.shift?.name || "No shift"} •{" "}
                        {formatToPakistaniDate(item.date || item.createdAt)}
                      </div>
                    </div>
                    {getStatusBadge && getStatusBadge(item.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Check In:</span>
                      <div className="font-medium">
                        {item.checkIn || item.checkInTime
                          ? formatToPakistaniTime(item.checkIn || item.checkInTime)
                          : "—"}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Check Out:</span>
                      <div className="font-medium">
                        {item.checkOut || item.checkOutTime
                          ? formatToPakistaniTime(item.checkOut || item.checkOutTime)
                          : "—"}
                      </div>
                    </div>
                  </div>

                  {(canEditAttendance || handleViewAttendance) && (
                    <div className="flex justify-end gap-2 pt-2">
                      {handleViewAttendance && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewAttendance(item)}
                          className="text-xs"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      )}
                      {canEditAttendance && handleEditAttendance && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAttendance(item)}
                          disabled={
                            canEditAttendanceRecord && !canEditAttendanceRecord(item)
                          }
                          className="text-xs"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    );
  }

  // Desktop Table View
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <div className="min-w-[800px] md:min-w-0 inline-block align-middle">
        <div className="overflow-hidden border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead
                    key={index}
                    style={column.minWidth ? { minWidth: column.minWidth } : {}}
                    className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                    <p className="mt-2 text-muted-foreground">Loading data...</p>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-8">
                    <div className="text-muted-foreground">{emptyMessage}</div>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item, index) => (
                  <TableRow key={item._id || index} className="hover:bg-gray-50/50">
                    {columns.map((column, colIndex) => (
                      <TableCell
                        key={colIndex}
                        className={`px-4 py-3 text-sm ${column.cellClassName || ""}`}
                        style={column.minWidth ? { minWidth: column.minWidth } : {}}
                      >
                        {column.render ? column.render(item) : item[column.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
