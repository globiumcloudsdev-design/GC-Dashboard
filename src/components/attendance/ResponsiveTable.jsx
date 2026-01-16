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
import { Badge } from "@/components/ui/badge";
import { Loader2, Edit, Eye, Trash2 } from "lucide-react";
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

  const renderMobileCard = (item) => {
    switch (activeTab) {
      case "attendance":
        return (
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
                  {item.checkInTime
                    ? formatToPakistaniTime(item.checkInTime)
                    : "—"}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Check Out:</span>
                <div className="font-medium">
                  {item.checkOutTime
                    ? formatToPakistaniTime(item.checkOutTime)
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
        );

      case "leave":
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">
                  {item.user
                    ? `${item.user?.firstName || ""} ${item.user?.lastName || ""}`
                    : item.agent?.agentName || "—"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {item.leaveType}
                </div>
              </div>
              <Badge variant={item.status === 'approved' ? 'default' : item.status === 'rejected' ? 'destructive' : 'secondary'}>
                {item.status}
              </Badge>
            </div>
            
            <div className="text-sm">
              <span className="text-muted-foreground">Duration:</span>{" "}
              {formatToPakistaniDate(item.startDate)} - {formatToPakistaniDate(item.endDate)}
            </div>
            
            <div className="text-sm text-muted-foreground truncate">
              "{item.reason}"
            </div>

             <div className="flex justify-end gap-2 pt-2">
                 {/* Using the render function from columns would be hard here, so we might skip custom actions 
                     or we need to pass actions as a prop. 
                     ResponsiveTable doesn't have handleLeaveAction prop.
                     The 'columns' prop contains the actions in the render function.
                     For now, let's at least show the data nicely. 
                 */}
                  {handleViewAttendance && ( // Reusing handleViewAttendance if passed, but it might not be relevant for leave
                     <Button variant="outline" size="sm" className="hidden">View</Button>
                  )} 
             </div>
          </div>
        );
      
      case "holidays":
        return (
          <div className="space-y-3">
             <div className="flex items-center justify-between">
                <div className="font-medium">{item.name}</div>
                <div className="text-sm font-semibold">{formatToPakistaniDate(item.date)}</div>
             </div>
             <div className="text-sm text-muted-foreground">
               {item.description || "No description"}
             </div>
             <div className="text-xs">
               Recurring: {item.isRecurring ? "Yes" : "No"}
             </div>
          </div>
        );

      case "weekly-off":
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-medium capitalize">{item.day}</div>
              <Badge variant={item.isActive ? "default" : "secondary"}>
                {item.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="text-sm font-medium">{item.name}</div>
            <div className="text-sm text-muted-foreground">{item.description}</div>
          </div>
        );

      default:
        // Fallback to a generic key-value list if unknown tab
        return (
           <div className="space-y-2">
             {Object.keys(item).slice(0, 3).map(key => (
               <div key={key} className="flex justify-between text-sm">
                 <span className="font-medium">{key}:</span>
                 <span>{String(item[key])}</span>
               </div>
             ))}
           </div>
        );
    }
  };

  if (isMobile) {
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
          data.map((item, index) => (
            <Card key={item._id || index} className="overflow-hidden">
              <CardContent className="p-4">
                {renderMobileCard(item)}
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
