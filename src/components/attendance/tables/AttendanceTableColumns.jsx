// // // src/components/attendance/tables/AttendanceTableColumns.jsx
// // "use client";
// // import React from "react";
// // import { Button } from "@/components/ui/button";
// // import { Badge } from "@/components/ui/badge";
// // import { Eye, Edit, Trash2 } from "lucide-react";
// // import { formatToPakistaniDate, formatToPakistaniTime } from "@/utils/TimeFuntions";

// // export const getAttendanceColumns = ({
// //   canEditAttendance,
// //   canDeleteAttendance,
// //   handleEditAttendance,
// //   handleDeleteAttendance,
// //   handleViewAttendance,
// // }) => {
// //   const getStatusBadge = (status) => {
// //     const variants = {
// //       present: "bg-green-100 text-green-800",
// //       absent: "bg-red-100 text-red-800",
// //       leave: "bg-blue-100 text-blue-800",
// //       "half-day": "bg-yellow-100 text-yellow-800",
// //       holiday: "bg-purple-100 text-purple-800",
// //       "weekly-off": "bg-gray-100 text-gray-800",
// //     };

// //     return (
// //       <Badge className={variants[status] || ""}>
// //         {status?.replace('-', ' ').toUpperCase()}
// //       </Badge>
// //     );
// //   };

// //   return [
// //     {
// //       label: "Agent",
// //       minWidth: "200px",
// //       render: (a) => (
// //         <div>
// //           <div className="font-medium">
// //             {a.user
// //               ? `${a.user?.firstName || ""} ${a.user?.lastName || ""}`
// //               : a.agent?.agentName || "—"}
// //           </div>
// //           <div className="text-xs text-muted-foreground">
// //             {a.user ? a.user.email : a.agent?.agentId}
// //           </div>
// //         </div>
// //       ),
// //     },
// //     {
// //       label: "Date",
// //       minWidth: "120px",
// //       render: (a) => formatToPakistaniDate(a.date || a.createdAt),
// //     },
// //     {
// //       label: "Status",
// //       minWidth: "100px",
// //       render: (a) => getStatusBadge(a.status),
// //     },
// //     {
// //       label: "Check-In",
// //       minWidth: "100px",
// //       render: (a) =>
// //         a.checkInTime ? formatToPakistaniTime(a.checkInTime) : "—",
// //     },
// //     {
// //       label: "Check-Out",
// //       minWidth: "100px",
// //       render: (a) =>
// //         a.checkOutTime ? formatToPakistaniTime(a.checkOutTime) : "—",
// //     },
// //     {
// //       label: "Work Hours",
// //       minWidth: "100px",
// //       render: (a) => {
// //         if (!a.checkInTime || !a.checkOutTime) return "—";
// //         const checkInTime = new Date(a.checkInTime);
// //         const checkOutTime = new Date(a.checkOutTime);
        
// //         // Handle invalid dates
// //         if (isNaN(checkInTime.getTime()) || isNaN(checkOutTime.getTime())) return "—";

// //         const diff = checkOutTime - checkInTime;
// //         if (diff < 0) return "—"; // Handle error cases

// //         const hours = Math.floor(diff / (1000 * 60 * 60));
// //         const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
// //         return `${hours}h ${minutes}m`;
// //       },
// //     },
// //     ...(canEditAttendance || canDeleteAttendance
// //       ? [
// //           {
// //             label: "Actions",
// //             minWidth: "200px",
// //             render: (a) => (
// //               <div className="flex gap-2">
// //                 <Button
// //                   variant="outline"
// //                   size="sm"
// //                   onClick={() => handleViewAttendance(a)}
// //                   title="View attendance details"
// //                 >
// //                   <Eye className="h-4 w-4" />
// //                 </Button>
// //                 {canEditAttendance && (
// //                   <Button
// //                     variant="outline"
// //                     size="sm"
// //                     onClick={() => handleEditAttendance(a)}
// //                   >
// //                     <Edit className="h-4 w-4" />
// //                   </Button>
// //                 )}
// //                 {canDeleteAttendance && (
// //                   <Button
// //                     variant="destructive"
// //                     size="sm"
// //                     onClick={() => handleDeleteAttendance(a._id)}
// //                   >
// //                     <Trash2 className="h-4 w-4" />
// //                   </Button>
// //                 )}
// //               </div>
// //             ),
// //           },
// //         ]
// //       : [
// //           {
// //             label: "Actions",
// //             minWidth: "100px",
// //             render: (a) => (
// //               <Button
// //                 variant="outline"
// //                 size="sm"
// //                 onClick={() => handleViewAttendance(a)}
// //                 title="View attendance details"
// //               >
// //                 <Eye className="h-4 w-4" />
// //               </Button>
// //             ),
// //           },
// //         ]),
// //   ];
// // };





// // src/components/attendance/tables/AttendanceTableColumns.jsx
// "use client";
// import React from "react";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Eye, Edit, Trash2, MoreVertical, FileText, Download, CheckCircle, XCircle } from "lucide-react";
// import { formatToPakistaniDate, formatToPakistaniTime } from "@/utils/TimeFuntions";
// import { formatDate } from "@/utils/timezone";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { toast } from "sonner";

// export const getAttendanceColumns = ({
//   canEditAttendance,
//   canDeleteAttendance,
//   handleEditAttendance,
//   handleDeleteAttendance,
//   handleViewAttendance,
// }) => {
//   const getStatusBadge = (status) => {
//     const variants = {
//       present: "bg-green-100 text-green-800 border-green-200",
//       absent: "bg-red-100 text-red-800 border-red-200",
//       leave: "bg-blue-100 text-blue-800 border-blue-200",
//       "half-day": "bg-yellow-100 text-yellow-800 border-yellow-200",
//       holiday: "bg-purple-100 text-purple-800 border-purple-200",
//       "weekly-off": "bg-gray-100 text-gray-800 border-gray-200",
//       weekly_off: "bg-gray-100 text-gray-800 border-gray-200",
//       late: "bg-orange-100 text-orange-800 border-orange-200",
//       early_checkout: "bg-pink-100 text-pink-800 border-pink-200",
//       overtime: "bg-indigo-100 text-indigo-800 border-indigo-200",
//     };

//     return (
//       <Badge variant="outline" className={`${variants[status] || "bg-gray-100 text-gray-800"} px-2 py-1 text-xs`}>
//         {status?.replace(/_/g, ' ').replace(/-/g, ' ').toUpperCase()}
//       </Badge>
//     );
//   };

//   return [
//     {
//       label: "Agent",
//       minWidth: "200px",
//       render: (a) => (
//         <div className="min-w-[200px]">
//           <div className="font-medium text-sm">
//             {a.user
//               ? `${a.user?.firstName || ""} ${a.user?.lastName || ""}`
//               : a.agent?.agentName || "—"}
//           </div>
//           <div className="text-xs text-muted-foreground mt-0.5">
//             {a.user ? a.user.email : a.agent?.agentId || "—"}
//           </div>
//           {a.shift?.name && (
//             <div className="text-xs text-blue-600 mt-0.5">
//               {a.shift.name}
//             </div>
//           )}
//         </div>
//       ),
//     },
//     {
//       label: "Date",
//       minWidth: "120px",
//       render: (a) => {
//         const date = new Date(a.date || a.createdAt);
//         const dayName = date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'Asia/Karachi' });
//         const formattedDate = formatToPakistaniDate(a.date || a.createdAt);
//         return (
//           <div className="text-sm">
//             <div className="font-medium">{dayName}</div>
//             <div className="text-muted-foreground text-xs">{formattedDate}</div>
//           </div>
//         );
//       },
//     },
//     {
//       label: "Status",
//       minWidth: "120px",
//       render: (a) => getStatusBadge(a.status),
//     },
//     {
//       label: "Check-In",
//       minWidth: "100px",
//       render: (a) => (
//         <div className="text-sm">
//           {a.checkInTime ? formatToPakistaniTime(a.checkInTime) : "—"}
//         </div>
//       ),
//     },
//     {
//       label: "Check-Out",
//       minWidth: "100px",
//       render: (a) => (
//         <div className="text-sm">
//           {a.checkOutTime ? formatToPakistaniTime(a.checkOutTime) : "—"}
//         </div>
//       ),
//     },
//     {
//       label: "Work Hours",
//       minWidth: "100px",
//       render: (a) => {
//         if (!a.checkInTime || !a.checkOutTime) return (
//           <div className="text-sm text-muted-foreground">—</div>
//         );
//         const checkInTime = new Date(a.checkInTime);
//         const checkOutTime = new Date(a.checkOutTime);
        
//         if (isNaN(checkInTime.getTime()) || isNaN(checkOutTime.getTime())) return (
//           <div className="text-sm text-muted-foreground">—</div>
//         );

//         const diff = checkOutTime - checkInTime;
//         if (diff < 0) return (
//           <div className="text-sm text-muted-foreground">—</div>
//         );

//         const hours = Math.floor(diff / (1000 * 60 * 60));
//         const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
//         let className = "text-sm";
//         if (hours < 4) className += " text-red-600 font-semibold";
//         else if (hours < 8) className += " text-orange-600";
//         else className += " text-green-600";
        
//         return (
//           <div className={className}>
//             {hours}h {minutes}m
//           </div>
//         );
//       },
//     },
//     {
//       label: "Actions",
//       minWidth: "80px",
//       render: (a) => (
//         <div className="flex justify-center">
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 className="h-8 w-8 p-0"
//                 title="Actions"
//               >
//                 <MoreVertical className="h-4 w-4" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end" className="w-48">
//               {/* View Details */}
//               <DropdownMenuItem 
//                 onClick={() => handleViewAttendance(a)}
//                 className="cursor-pointer"
//               >
//                 <Eye className="h-4 w-4 mr-2" />
//                 View Details
//               </DropdownMenuItem>
              
//               {/* Download as PDF */}
//               <DropdownMenuItem 
//                 onClick={() => {
//                   // PDF download functionality
//                   toast.info("PDF download feature coming soon!");
//                 }}
//                 className="cursor-pointer"
//               >
//                 <Download className="h-4 w-4 mr-2" />
//                 Download as PDF
//               </DropdownMenuItem>
              
//               {/* Generate Report */}
//               <DropdownMenuItem 
//                 onClick={() => {
//                   // Report generation functionality
//                   toast.info("Report generation feature coming soon!");
//                 }}
//                 className="cursor-pointer"
//               >
//                 <FileText className="h-4 w-4 mr-2" />
//                 Generate Report
//               </DropdownMenuItem>
              
//               {/* Separator for edit/delete actions */}
//               {(canEditAttendance || canDeleteAttendance) && (
//                 <>
//                   <DropdownMenuSeparator />
                  
//                   {/* Edit Attendance */}
//                   {canEditAttendance && (
//                     <DropdownMenuItem 
//                       onClick={() => handleEditAttendance(a)}
//                       className="cursor-pointer text-blue-600"
//                     >
//                       <Edit className="h-4 w-4 mr-2" />
//                       Edit Attendance
//                     </DropdownMenuItem>
//                   )}
                  
//                   {/* Delete Attendance */}
//                   {/* {canDeleteAttendance && (
//                     <DropdownMenuItem 
//                       onClick={() => handleDeleteAttendance(a._id)}
//                       className="cursor-pointer text-red-600"
//                     >
//                       <Trash2 className="h-4 w-4 mr-2" />
//                       Delete Attendance
//                     </DropdownMenuItem>
//                   )} */}
//                 </>
//               )}
              
//               {/* Additional Actions Separator */}
//               <DropdownMenuSeparator />
              
//               {/* Quick Actions */}
//               <DropdownMenuItem 
//                 onClick={() => {
//                   // Mark as present/absent quick actions
//                   toast.info("Quick action feature coming soon!");
//                 }}
//                 className="cursor-pointer text-green-600"
//               >
//                 <CheckCircle className="h-4 w-4 mr-2" />
//                 Mark as Present
//               </DropdownMenuItem>
              
//               <DropdownMenuItem 
//                 onClick={() => {
//                   toast.info("Quick action feature coming soon!");
//                 }}
//                 className="cursor-pointer text-red-600"
//               >
//                 <XCircle className="h-4 w-4 mr-2" />
//                 Mark as Absent
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//       ),
//     },
//   ];
// };

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
import { formatToPakistaniDate, formatToPakistaniTime } from "@/utils/TimeFuntions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const getAttendanceColumns = ({
  canEditAttendance,
  canDeleteAttendance,
  handleEditAttendance,
  handleDeleteAttendance,
  handleViewAttendance,
  handleMarkInformed, // New: Function to mark as informed
}) => {
  const getStatusBadge = (status, isInformed = false) => {
    const variants = {
      present: "bg-green-100 text-green-800 border-green-200",
      absent: isInformed 
        ? "bg-orange-100 text-orange-800 border-orange-200" // Informed absent - orange
        : "bg-red-100 text-red-800 border-red-200", // Uninformed absent - red
      leave: "bg-blue-100 text-blue-800 border-blue-200",
      "half-day": "bg-yellow-100 text-yellow-800 border-yellow-200",
      half_day: "bg-yellow-100 text-yellow-800 border-yellow-200",
      holiday: "bg-purple-100 text-purple-800 border-purple-200",
      "weekly-off": "bg-gray-100 text-gray-800 border-gray-200",
      weekly_off: "bg-gray-100 text-gray-800 border-gray-200",
      late: isInformed 
        ? "bg-teal-100 text-teal-800 border-teal-200" // Informed late - teal
        : "bg-orange-100 text-orange-800 border-orange-200", // Uninformed late - orange
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

  const getInformedBadge = (isInformed, status) => {
    if (status !== 'late' && status !== 'absent') return null;
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`inline-flex items-center ml-1 ${isInformed ? 'text-green-600' : 'text-gray-400'}`}>
              {isInformed ? (
                <Bell className="h-3 w-3" />
              ) : (
                <BellOff className="h-3 w-3" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">
              {isInformed 
                ? `Informed ${status} - No penalty for late, but counts for allowance rules`
                : `Uninformed ${status} - Penalty applies`}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return [
    {
      label: "Agent",
      minWidth: "140px",
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
            <div className="text-xs text-blue-600 mt-0.5">
              {a.shift.name}
            </div>
          )}
        </div>
      ),
    },
    {
      label: "Date",
      minWidth: "100px",
      render: (a) => {
        const date = new Date(a.date || a.createdAt);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'Asia/Karachi' });
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
      render: (a) => (
        <div className="flex items-center">
          {getStatusBadge(a.status, a.isInformed)}
          {getInformedBadge(a.isInformed, a.status)}
        </div>
      ),
    },
    {
      label: "Informed",
      minWidth: "60px",
      render: (a) => {
        if (a.status !== 'late' && a.status !== 'absent') return <span className="text-xs text-muted-foreground">—</span>;
        
        return (
          <div className="flex items-center">
            {a.isInformed ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                Yes
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-xs">
                No
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      label: "Check-In",
      minWidth: "80px",
      render: (a) => (
        <div className="text-sm">
          {a.checkInTime ? formatToPakistaniTime(a.checkInTime) : "—"}
        </div>
      ),
    },
    {
      label: "Check-Out",
      minWidth: "80px",
      render: (a) => (
        <div className="text-sm">
          {a.checkOutTime ? formatToPakistaniTime(a.checkOutTime) : "—"}
        </div>
      ),
    },
    {
      label: "Late Mins",
      minWidth: "80px",
      render: (a) => (
        <div className="text-sm">
          {a.lateMinutes ? (
            <span className={a.lateMinutes > 20 ? 'text-red-600 font-semibold' : 'text-orange-600'}>
              {a.lateMinutes} min
            </span>
          ) : "—"}
        </div>
      ),
    },
    {
      label: "Work Hours",
      minWidth: "100px",
      render: (a) => {
        if (!a.checkInTime || !a.checkOutTime) return (
          <div className="text-sm text-muted-foreground">—</div>
        );
        const checkInTime = new Date(a.checkInTime);
        const checkOutTime = new Date(a.checkOutTime);
        
        if (isNaN(checkInTime.getTime()) || isNaN(checkOutTime.getTime())) return (
          <div className="text-sm text-muted-foreground">—</div>
        );

        const diff = checkOutTime - checkInTime;
        if (diff < 0) return (
          <div className="text-sm text-muted-foreground">—</div>
        );

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
            <DropdownMenuContent align="end" className="w-56">
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
                  
                  {/* Delete Attendance - Commented out as per original */}
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
                  toast.info("Quick action - Edit to change status");
                }}
                className="cursor-pointer text-green-600"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Quick Present
              </DropdownMenuItem>
              
              {/* Mark as Absent */}
              <DropdownMenuItem 
                onClick={() => {
                  toast.info("Quick action - Edit to change status");
                }}
                className="cursor-pointer text-red-600"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Quick Absent
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
};