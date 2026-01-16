// // src/components/attendance/ResponsiveTable.jsx
// "use client";
// import React, { useState, useEffect } from "react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Loader2, Edit, Eye, Trash2 } from "lucide-react";
// import { formatToPakistaniDate, formatToPakistaniTime } from "@/utils/TimeFuntions";

// export default function ResponsiveTable({
//   data,
//   columns,
//   loading,
//   emptyMessage = "No data found",
//   className = "",
//   activeTab = "attendance",
//   canEditAttendance = false,
//   canEditAttendanceRecord,
//   handleEditAttendance,
//   handleViewAttendance,
//   getStatusBadge,
// }) {
//   const [isMobile, setIsMobile] = useState(false);

//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 768);
//     };

//     checkMobile();
//     window.addEventListener("resize", checkMobile);

//     return () => window.removeEventListener("resize", checkMobile);
//   }, []);

//   const renderMobileCard = (item) => {
//     switch (activeTab) {
//       case "attendance":
//         return (
//           <div className="space-y-3">
//             <div className="flex items-center justify-between">
//               <div>
//                 <div className="font-medium">
//                   {item.user
//                     ? `${item.user?.firstName || ""} ${item.user?.lastName || ""}`
//                     : item.agent?.agentName || "—"}
//                 </div>
//                 <div className="text-xs text-muted-foreground">
//                   {item.shift?.name || "No shift"} •{" "}
//                   {formatToPakistaniDate(item.date || item.createdAt)}
//                 </div>
//               </div>
//               {getStatusBadge && getStatusBadge(item.status)}
//             </div>

//             <div className="grid grid-cols-2 gap-2 text-sm">
//               <div>
//                 <span className="text-muted-foreground">Check In:</span>
//                 <div className="font-medium">
//                   {item.checkInTime
//                     ? formatToPakistaniTime(item.checkInTime)
//                     : "—"}
//                 </div>
//               </div>
//               <div>
//                 <span className="text-muted-foreground">Check Out:</span>
//                 <div className="font-medium">
//                   {item.checkOutTime
//                     ? formatToPakistaniTime(item.checkOutTime)
//                     : "—"}
//                 </div>
//               </div>
//             </div>

//             {(canEditAttendance || handleViewAttendance) && (
//               <div className="flex justify-end gap-2 pt-2">
//                 {handleViewAttendance && (
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={() => handleViewAttendance(item)}
//                     className="text-xs"
//                   >
//                     <Eye className="h-3 w-3 mr-1" />
//                     View
//                   </Button>
//                 )}
//                 {canEditAttendance && handleEditAttendance && (
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={() => handleEditAttendance(item)}
//                     disabled={
//                       canEditAttendanceRecord && !canEditAttendanceRecord(item)
//                     }
//                     className="text-xs"
//                   >
//                     <Edit className="h-3 w-3 mr-1" />
//                     Edit
//                   </Button>
//                 )}
//               </div>
//             )}
//           </div>
//         );

//       case "leave":
//         return (
//           <div className="space-y-3">
//             <div className="flex items-center justify-between">
//               <div>
//                 <div className="font-medium">
//                   {item.user
//                     ? `${item.user?.firstName || ""} ${item.user?.lastName || ""}`
//                     : item.agent?.agentName || "—"}
//                 </div>
//                 <div className="text-xs text-muted-foreground">
//                   {item.leaveType}
//                 </div>
//               </div>
//               <Badge variant={item.status === 'approved' ? 'default' : item.status === 'rejected' ? 'destructive' : 'secondary'}>
//                 {item.status}
//               </Badge>
//             </div>
            
//             <div className="text-sm">
//               <span className="text-muted-foreground">Duration:</span>{" "}
//               {formatToPakistaniDate(item.startDate)} - {formatToPakistaniDate(item.endDate)}
//             </div>
            
//             <div className="text-sm text-muted-foreground truncate">
//               "{item.reason}"
//             </div>

//              <div className="flex justify-end gap-2 pt-2">
//                  {/* Using the render function from columns would be hard here, so we might skip custom actions 
//                      or we need to pass actions as a prop. 
//                      ResponsiveTable doesn't have handleLeaveAction prop.
//                      The 'columns' prop contains the actions in the render function.
//                      For now, let's at least show the data nicely. 
//                  */}
//                   {handleViewAttendance && ( // Reusing handleViewAttendance if passed, but it might not be relevant for leave
//                      <Button variant="outline" size="sm" className="hidden">View</Button>
//                   )} 
//              </div>
//           </div>
//         );
      
//       case "holidays":
//         return (
//           <div className="space-y-3">
//              <div className="flex items-center justify-between">
//                 <div className="font-medium">{item.name}</div>
//                 <div className="text-sm font-semibold">{formatToPakistaniDate(item.date)}</div>
//              </div>
//              <div className="text-sm text-muted-foreground">
//                {item.description || "No description"}
//              </div>
//              <div className="text-xs">
//                Recurring: {item.isRecurring ? "Yes" : "No"}
//              </div>
//           </div>
//         );

//       case "weekly-off":
//         return (
//           <div className="space-y-3">
//             <div className="flex items-center justify-between">
//               <div className="font-medium capitalize">{item.day}</div>
//               <Badge variant={item.isActive ? "default" : "secondary"}>
//                 {item.isActive ? "Active" : "Inactive"}
//               </Badge>
//             </div>
//             <div className="text-sm font-medium">{item.name}</div>
//             <div className="text-sm text-muted-foreground">{item.description}</div>
//           </div>
//         );

//       default:
//         // Fallback to a generic key-value list if unknown tab
//         return (
//            <div className="space-y-2">
//              {Object.keys(item).slice(0, 3).map(key => (
//                <div key={key} className="flex justify-between text-sm">
//                  <span className="font-medium">{key}:</span>
//                  <span>{String(item[key])}</span>
//                </div>
//              ))}
//            </div>
//         );
//     }
//   };

//   if (isMobile) {
//     return (
//       <div className="space-y-3">
//         {loading ? (
//           <div className="text-center py-8">
//             <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
//             <p className="mt-2 text-muted-foreground">Loading data...</p>
//           </div>
//         ) : data.length === 0 ? (
//           <div className="text-center py-8 text-muted-foreground">
//             {emptyMessage}
//           </div>
//         ) : (
//           data.map((item, index) => (
//             <Card key={item._id || index} className="overflow-hidden">
//               <CardContent className="p-4">
//                 {renderMobileCard(item)}
//               </CardContent>
//             </Card>
//           ))
//         )}
//       </div>
//     );
//   }

//   // Desktop Table View
//   return (
//     <div className={`w-full overflow-x-auto ${className}`}>
//       <div className="min-w-[800px] md:min-w-0 inline-block align-middle">
//         <div className="overflow-hidden border rounded-lg">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 {columns.map((column, index) => (
//                   <TableHead
//                     key={index}
//                     style={column.minWidth ? { minWidth: column.minWidth } : {}}
//                     className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                   >
//                     {column.label}
//                   </TableHead>
//                 ))}
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {loading ? (
//                 <TableRow>
//                   <TableCell colSpan={columns.length} className="text-center py-8">
//                     <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
//                     <p className="mt-2 text-muted-foreground">Loading data...</p>
//                   </TableCell>
//                 </TableRow>
//               ) : data.length === 0 ? (
//                 <TableRow>
//                   <TableCell colSpan={columns.length} className="text-center py-8">
//                     <div className="text-muted-foreground">{emptyMessage}</div>
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 data.map((item, index) => (
//                   <TableRow key={item._id || index} className="hover:bg-gray-50/50">
//                     {columns.map((column, colIndex) => (
//                       <TableCell
//                         key={colIndex}
//                         className={`px-4 py-3 text-sm ${column.cellClassName || ""}`}
//                         style={column.minWidth ? { minWidth: column.minWidth } : {}}
//                       >
//                         {column.render ? column.render(item) : item[column.key]}
//                       </TableCell>
//                     ))}
//                   </TableRow>
//                 ))
//               )}
//             </TableBody>
//           </Table>
//         </div>
//       </div>
//     </div>
//   );
// }









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
import { Loader2, Edit, Eye, Trash2, ChevronDown, ChevronUp, MoreVertical } from "lucide-react";
import { formatToPakistaniDate, formatToPakistaniTime } from "@/utils/TimeFuntions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  onDelete,
  onApprove,
  onReject,
  onToggleStatus,
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleCardExpand = (id) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const renderMobileCard = (item) => {
    const isExpanded = expandedCards[item._id || item.id];
    
    switch (activeTab) {
      case "attendance":
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium text-sm sm:text-base">
                  {item.user
                    ? `${item.user?.firstName || ""} ${item.user?.lastName || ""}`
                    : item.agent?.agentName || "—"}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {item.shift?.name || "No shift"} • {formatToPakistaniDate(item.date || item.createdAt)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge && getStatusBadge(item.status)}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleCardExpand(item._id || item.id)}
                  className="h-6 w-6 p-0"
                >
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Collapsed View */}
            {!isExpanded && (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs">Check In:</span>
                  <div className="font-medium">
                    {item.checkInTime
                      ? formatToPakistaniTime(item.checkInTime)
                      : "—"}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Check Out:</span>
                  <div className="font-medium">
                    {item.checkOutTime
                      ? formatToPakistaniTime(item.checkOutTime)
                      : "—"}
                  </div>
                </div>
              </div>
            )}

            {/* Expanded View */}
            {isExpanded && (
              <div className="space-y-3 pt-2 border-t">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Shift</span>
                    <span className="text-sm">{item.shift?.name || "—"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Date</span>
                    <span className="text-sm">{formatToPakistaniDate(item.date || item.createdAt)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Check In</span>
                    <span className="text-sm">
                      {item.checkInTime ? formatToPakistaniTime(item.checkInTime) : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Check Out</span>
                    <span className="text-sm">
                      {item.checkOutTime ? formatToPakistaniTime(item.checkOutTime) : "—"}
                    </span>
                  </div>
                </div>
                
                {item.notes && (
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Notes</span>
                    <span className="text-sm">{item.notes}</span>
                  </div>
                )}

                {(canEditAttendance || handleViewAttendance || onDelete) && (
                  <div className="flex flex-wrap gap-2 pt-3">
                    {handleViewAttendance && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewAttendance(item)}
                        className="text-xs flex-1 min-w-[80px]"
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
                        className="text-xs flex-1 min-w-[80px]"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(item._id || item.id)}
                        className="text-xs flex-1 min-w-[80px]"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Mobile Actions Dropdown (for collapsed view) */}
            {!isExpanded && (canEditAttendance || handleViewAttendance) && (
              <div className="flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    {handleViewAttendance && (
                      <DropdownMenuItem onClick={() => handleViewAttendance(item)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                    )}
                    {canEditAttendance && handleEditAttendance && (
                      <DropdownMenuItem 
                        onClick={() => handleEditAttendance(item)}
                        disabled={canEditAttendanceRecord && !canEditAttendanceRecord(item)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem onClick={() => onDelete(item._id || item.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        );

      case "leave":
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium text-sm sm:text-base">
                  {item.user
                    ? `${item.user?.firstName || ""} ${item.user?.lastName || ""}`
                    : item.agent?.agentName || "—"}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {item.leaveType} • {formatToPakistaniDate(item.startDate)} - {formatToPakistaniDate(item.endDate)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={item.status === 'approved' ? 'default' : item.status === 'rejected' ? 'destructive' : 'secondary'}>
                  {item.status}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleCardExpand(item._id || item.id)}
                  className="h-6 w-6 p-0"
                >
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {!isExpanded ? (
              <div className="text-sm text-muted-foreground line-clamp-2">
                "{item.reason}"
              </div>
            ) : (
              <div className="space-y-3 pt-2 border-t">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Type</span>
                    <span className="text-sm capitalize">{item.leaveType}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Duration</span>
                    <span className="text-sm">
                      {formatToPakistaniDate(item.startDate)} - {formatToPakistaniDate(item.endDate)}
                    </span>
                  </div>
                </div>
                
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Reason</span>
                  <span className="text-sm">{item.reason}</span>
                </div>

                {item.comments && (
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Admin Comments</span>
                    <span className="text-sm">{item.comments}</span>
                  </div>
                )}

                {(onApprove || onReject || handleViewAttendance) && (
                  <div className="flex flex-wrap gap-2 pt-3">
                    {handleViewAttendance && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewAttendance(item)}
                        className="text-xs flex-1 min-w-[80px]"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    )}
                    {onApprove && item.status === 'pending' && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onApprove(item._id || item.id)}
                        className="text-xs flex-1 min-w-[80px] bg-green-600 hover:bg-green-700"
                      >
                        Approve
                      </Button>
                    )}
                    {onReject && item.status === 'pending' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onReject(item._id || item.id)}
                        className="text-xs flex-1 min-w-[80px]"
                      >
                        Reject
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      
      case "holidays":
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium text-sm sm:text-base">{item.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {formatToPakistaniDate(item.date)}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleCardExpand(item._id || item.id)}
                className="h-6 w-6 p-0"
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>

            {!isExpanded ? (
              <div className="text-sm text-muted-foreground line-clamp-2">
                {item.description || "No description"}
              </div>
            ) : (
              <div className="space-y-3 pt-2 border-t">
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Description</span>
                  <span className="text-sm">{item.description || "No description provided"}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Date</span>
                    <span className="text-sm">{formatToPakistaniDate(item.date)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Recurring</span>
                    <span className="text-sm">{item.isRecurring ? "Yes" : "No"}</span>
                  </div>
                </div>

                {(onDelete || onToggleStatus) && (
                  <div className="flex flex-wrap gap-2 pt-3">
                    {onDelete && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(item._id || item.id)}
                        className="text-xs flex-1 min-w-[80px]"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case "weekly-off":
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium text-sm sm:text-base capitalize">{item.day}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{item.name}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={item.isActive ? "default" : "secondary"}>
                  {item.isActive ? "Active" : "Inactive"}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleCardExpand(item._id || item.id)}
                  className="h-6 w-6 p-0"
                >
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {!isExpanded ? (
              <div className="text-sm text-muted-foreground line-clamp-2">
                {item.description}
              </div>
            ) : (
              <div className="space-y-3 pt-2 border-t">
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Description</span>
                  <span className="text-sm">{item.description}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Day</span>
                    <span className="text-sm capitalize">{item.day}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Status</span>
                    <span className="text-sm">{item.isActive ? "Active" : "Inactive"}</span>
                  </div>
                </div>

                {(onToggleStatus || onDelete) && (
                  <div className="flex flex-wrap gap-2 pt-3">
                    {onToggleStatus && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onToggleStatus(item._id || item.id, !item.isActive)}
                        className="text-xs flex-1 min-w-[80px]"
                      >
                        {item.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(item._id || item.id)}
                        className="text-xs flex-1 min-w-[80px]"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );

      default:
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

  // Desktop Table View - Also responsive
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <div className="min-w-[800px] lg:min-w-full inline-block align-middle">
        <div className="overflow-hidden border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead
                    key={index}
                    style={column.minWidth ? { minWidth: column.minWidth } : {}}
                    className="whitespace-nowrap px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
                        className={`px-3 py-3 text-sm ${column.cellClassName || ""}`}
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