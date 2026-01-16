// // src/app/(dashboard)/dashboard/bookings/page.jsx
// "use client";

// import { useEffect, useState } from "react";
// import { useAuth } from '@/context/AuthContext';
// import DataTable from "@/components/common/DataTable";
// import GlobalData from "@/components/common/GlobalData";
// import PageHeader from "@/components/common/PageHeader";
// import BookingSearchBar from "@/components/SearchBar";
// import SearchResultCard from "@/components/common/SearchResultCard";
// import BookingDetailsDialog from "@/components/BookingDetailsDialog";
// import CreateBookingDialog from "@/components/CreateBookingDialog";
// import { motion } from "framer-motion";
// import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator";
// import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
// import { fetchBookings, addBooking } from "@/action/bookingActions";
// import { Input } from "@/components/ui/input";
// import * as XLSX from "xlsx";
// import {
//   CalendarDays,
//   CheckCircle,
//   Clock,
//   XCircle,
//   RefreshCcw,
//   CheckSquare,
//   Plus,
//   FileSpreadsheet,
//   Calendar,
//   DollarSign,
//   TrendingUp,
//   Filter,
//   Users,
//   Mail
// } from "lucide-react";
// import { toast } from "sonner";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// // Status configuration lookup map
// const STATUS_CONFIG = {
//   confirmed: { colorClass: "bg-green-100 text-green-700", Icon: CheckCircle },
//   pending: { colorClass: "bg-yellow-100 text-yellow-700", Icon: Clock },
//   cancelled: { colorClass: "bg-red-100 text-red-700", Icon: XCircle },
//   rescheduled: { colorClass: "bg-blue-100 text-blue-700", Icon: RefreshCcw },
//   completed: { colorClass: "bg-purple-100 text-purple-700", Icon: CheckSquare },
//   default: { colorClass: "bg-gray-100 text-gray-700", Icon: null },
// };

// export default function BookingsPage() {
//   const [bookings, setBookings] = useState([]);
//   const [mobileFilter, setMobileFilter] = useState("all");
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [selectedBooking, setSelectedBooking] = useState(null);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
//   // 🟢 Filter & Stats State
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [importing, setImporting] = useState(false);

//   const { hasPermission } = useAuth();
//   const canCreateBooking = hasPermission('booking', 'create');
//   const canViewBooking = hasPermission('booking', 'view');

//   const fadeUp = {
//     hidden: { opacity: 0, y: 20 },
//     visible: (i = 1) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" } }),
//   };

//   // ✅ Excel Import Handler
//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     setImporting(true);
//     const reader = new FileReader();
//     reader.onload = async (evt) => {
//       try {
//         const bstr = evt.target.result;
//         const workbook = XLSX.read(bstr, { type: "binary" });
        
//         let allBookings = [];
        
//         // Loop through all sheets
//         workbook.SheetNames.forEach(sheetName => {
//             const worksheet = workbook.Sheets[sheetName];
//             const jsonData = XLSX.utils.sheet_to_json(worksheet);
//             allBookings = [...allBookings, ...jsonData];
//         });

//         console.log("Parsed Excel Data:", allBookings);

//         if (allBookings.length === 0) {
//             toast.error("No data found in Excel file");
//             setImporting(false);
//             return;
//         }

//         let successCount = 0;
//         let failCount = 0;

//         // Process each row
//         // Columns: "Booking ID", "Booking Type", "First Name", "Last Name", "Email", "Phone", "Total Price", "Booking Date", etc.
//         for (const row of allBookings) {
//              const bookingData = {
//                  bookingId: row["Booking ID"] || `IMP${Date.now()}${Math.random().toString(36).substr(2, 4)}`,
//                  webName: row["Website"] || row["Web Name"] || "N/A",
//                  vendorName: row["Vendor"] || row["Company"] || "Direct Customer",
//                  bookingType: row["Booking Type"] || row["Service Type"] || "other", 
//                  totalPrice: parseFloat(row["Total Price"] || row["Discounted Price"] || row["Price"] || 0),
//                  status: (row["Status"] || "pending").toLowerCase(),
//                  submittedAt: new Date().toISOString(),
//                  formData: {
//                      firstName: row["First Name"] || "Unknown",
//                      lastName: row["Last Name"] || "",
//                      email: row["Email"] || "no-email@import.com",
//                      phone: row["Phone"] || "",
//                      address: row["Address"] || "",
//                      city: row["City"] || "",
//                      state: row["State"] || "",
//                      zip: row["Zip"] || "",
//                      date: row["Booking Date"] || row["Date"] ? new Date(row["Booking Date"] || row["Date"]).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
//                      timeSlot: row["Time Slot"] || row["Time"] || "09:00 AM",
//                      package: row["Package"] || "",
//                      additionalServices: row["Additional Services"] || "",
//                      notes: `Imported from Excel. Service: ${row["Service Type"] || "N/A"}`
//                  }
//              };

//              // Call API to create
//              const res = await addBooking(bookingData);
//              if (res.success) successCount++;
//              else {
//                  console.error("Failed to add booking:", row["Booking ID"], res.message);
//                  failCount++;
//              }
//         }

//         toast.success(`Import Complete: ${successCount} added, ${failCount} failed.`);
//         fetchBookings().then(res => setBookings(res.data || []));
        
//       } catch (err) {
//         console.error("Excel Import Error:", err);
//         toast.error("Failed to parse Excel file");
//       } finally {
//         setImporting(false);
//         // Reset file input
//         e.target.value = null;
//       }
//     };
//     reader.readAsBinaryString(file);
//   };

//   // ✅ Filter Logic
//   const filteredBookings = bookings.filter((b) => {
//     // 1. Text Search
//     if (search.trim() && !b.formData?.firstName?.toLowerCase().includes(search.toLowerCase())) {
//         return false;
//     }
//     // 2. Date Range Filter
//     if (fromDate || toDate) {
//         const bookingDate = new Date(b.formData?.date || b.createdAt);
//         // Reset times for accurate comparison
//         bookingDate.setHours(0,0,0,0);
        
//         if (fromDate) {
//             const start = new Date(fromDate);
//             start.setHours(0,0,0,0);
//             if (bookingDate < start) return false;
//         }
//         if (toDate) {
//             const end = new Date(toDate);
//             end.setHours(23,59,59,999);
//             if (bookingDate > end) return false;
//         }
//     }
//     return true;
//   });

//   // ✅ Revenue Stats Calculation
//   const stats = filteredBookings.reduce((acc, curr) => {
//       acc.totalCount++;
//       acc.totalRevenue += (curr.totalPrice || 0); // Use totalPrice field
//       return acc;
//   }, { totalCount: 0, totalRevenue: 0 });

//   const isSearching = search.trim().length > 0;

//   // Fetch bookings on mount
//   useEffect(() => {
//     const loadBookings = async () => {
//       setLoading(true);
//       const result = await fetchBookings();
//       if (result.success) {
//         setBookings(result.data || []);
//       }
//       setLoading(false);
//     };
//     loadBookings();
//   }, []);

//   // Handle create booking
//   const handleCreateBooking = async (bookingData) => {
//     const result = await addBooking(bookingData);
//     if (result.success) {
//       toast.success('Booking created successfully');
//       setBookings(prev => [...prev, result.data]);
//       setCreateDialogOpen(false);
//     } else {
//       toast.error(result.message || 'Failed to create booking');
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading bookings...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-8 p-4 md:p-6">
//       {/* Import Loader Overlay */}
//       {importing && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
//           <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4">
//             <div className="flex flex-col items-center space-y-4">
//               <div className="relative">
//                 <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
//                 <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute inset-0"></div>
//               </div>
//               <div className="text-center">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-1">Importing Bookings</h3>
//                 <p className="text-sm text-gray-600">Please wait while we process your Excel file...</p>
//               </div>
//               <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
//                 <div className="bg-blue-600 h-full rounded-full animate-pulse" style={{ width: '70%' }}></div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Header */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
//         <PageHeader
//             title="Bookings Overview"
//             description="Manage, track, and monitor all bookings in one place."
//             icon={CalendarDays}
//             className="mb-0"
//         />
        
//         {/* Actions: Import & Create */}
//         <div className="flex gap-2 w-full md:w-auto">
//             {canCreateBooking && (
//             <>
//                 {/* Excel Import Button */}
//                 <div className="relative">
//                     <input
//                         type="file"
//                         accept=".xlsx, .xls, .csv"
//                         onChange={handleFileUpload}
//                         className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//                         disabled={importing}
//                     />
//                     <Button variant="outline" className="w-full gap-2 border-green-600 text-green-700 hover:bg-green-50" disabled={importing}>
//                         <FileSpreadsheet className="w-4 h-4" />
//                         {importing ? "Importing..." : "Import Excel"}
//                     </Button>
//                 </div>
//                 <Button
//                     onClick={() => setCreateDialogOpen(true)}
//                     className="blue-button flex items-center gap-2 w-full sm:w-auto"
//                 >
//                     <Plus className="w-4 h-4" />
//                     Create
//                 </Button>
//             </>
//             )}
//         </div>
//       </div>

//       {/* 📊 STATS CARDS & FILTERS */}
//       <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
//          {/* Stats */}
//          <div className="col-span-1 md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 border-0 shadow-md text-white">
//                 <CardContent className="p-4 flex items-center justify-between">
//                     <div>
//                         <p className="text-indigo-100 text-sm font-medium mb-1">Total Revenue</p>
//                         <h3 className="text-2xl font-bold flex items-center gap-2">
//                             <DollarSign className="w-5 h-5" /> 
//                             {stats.totalRevenue.toLocaleString()}
//                         </h3>
//                         <p className="text-xs text-indigo-200 mt-1">Based on {fromDate && toDate ? "filtered range" : "all time"}</p>
//                     </div>
//                     <div className="p-3 bg-white/10 rounded-full">
//                         <TrendingUp className="w-6 h-6 text-white" />
//                     </div>
//                 </CardContent>
//             </Card>

//             <Card className="bg-white border shadow-sm">
//                 <CardContent className="p-4 flex items-center justify-between">
//                     <div>
//                         <p className="text-slate-500 text-sm font-medium mb-1">Total Bookings</p>
//                         <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
//                            <Users className="w-5 h-5 text-blue-500" />
//                            {stats.totalCount}
//                         </h3>
//                          <p className="text-xs text-slate-400 mt-1">{filteredBookings.length} filtered</p>
//                     </div>
//                     <div className="p-3 bg-blue-50 rounded-full">
//                         <Calendar className="w-6 h-6 text-blue-500" />
//                     </div>
//                 </CardContent>
//             </Card>
//          </div>

//          {/* Filters */}
//          <Card className="col-span-1 md:col-span-4 border shadow-sm">
//             <CardHeader className="pb-2 pt-4 px-4">
//                 <CardTitle className="text-sm font-semibold flex items-center gap-2">
//                     <Filter className="w-4 h-4" /> Filter by Date Range
//                 </CardTitle>
//             </CardHeader>
//             <CardContent className="px-4 pb-4 space-y-3">
//                 <div className="space-y-1">
//                     <label className="text-xs text-slate-500 font-medium">From Date</label>
//                     <Input 
//                         type="date" 
//                         value={fromDate} 
//                         onChange={(e) => setFromDate(e.target.value)} 
//                         className="h-9"
//                     />
//                 </div>
//                 <div className="space-y-1">
//                     <label className="text-xs text-slate-500 font-medium">To Date</label>
//                     <Input 
//                         type="date" 
//                         value={toDate} 
//                         onChange={(e) => setToDate(e.target.value)} 
//                         className="h-9"
//                     />
//                 </div>
//                 {(fromDate || toDate) && (
//                     <Button 
//                         variant="ghost" 
//                         size="sm" 
//                         onClick={() => { setFromDate(""); setToDate(""); }}
//                         className="w-full text-xs h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
//                     >
//                         Clear Filters
//                     </Button>
//                 )}
//             </CardContent>
//          </Card>
//       </div>

//       <Separator />

//       {/* Search & Filter Section (Optional Search Bar) */}
//       {/* <BookingSearchBar onSearch={handleSearch} /> */}

//       {/* If searching → show search results */}
//       {isSearching && (
//         <motion.div
//           initial="hidden"
//           animate="visible"
//           variants={fadeUp}
//           className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 py-6"
//         >
//           {filteredBookings.length === 0 ? (
//             <p className="text-center text-gray-500 col-span-full">
//               No results found for <strong>{search}</strong>.
//             </p>
//           ) : (
//             filteredBookings.map((booking, index) => (
//               <SearchResultCard
//                 key={booking._id}
//                 item={booking}
//                 index={index}
//                 fadeUp={fadeUp}
//                 type="booking"
//                 onViewDetails={(b) => {
//                   setSelectedBooking(b);
//                   setDialogOpen(true);
//                 }}
//               />
//             ))
//           )}
//         </motion.div>
//       )}

//       {/* Default Data Table view */}
//       {!isSearching && (
//         <Card className="border-none shadow-md mt-6">
//           <CardHeader className="border-b px-6 py-4 bg-muted/20">
//              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//                <div>
//                   <CardTitle>All Bookings</CardTitle>
//                   <CardDescription>
//                      Showing {filteredBookings.length} {filteredBookings.length === 1 ? 'booking' : 'bookings'} 
//                      {fromDate && toDate ? " in selected range" : ""}
//                   </CardDescription>
//                </div>
//              </div>
//           </CardHeader>
//           <CardContent className="p-0">
//              <DataTable
//                 data={filteredBookings}
//                 columns={[
//                     { key: "bookingId", label: "Booking ID" },
//                     { label: "Customer", render: b => `${b.formData?.firstName || ""} ${b.formData?.lastName || ""}` },
//                     { label: "Email", render: b => b.formData?.email || "N/A" },
//                     { label: "Price", render: b => `$${(b.totalPrice || 0).toLocaleString()}` },
//                     { label: "Date", render: b => new Date(b.formData?.date || b.createdAt).toLocaleDateString() },
//                     { label: "Status", render: b => {
//                         const config = STATUS_CONFIG[b.status] || STATUS_CONFIG.default;
//                         const { colorClass, Icon } = config;
//                         return (
//                           <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 w-fit ${colorClass}`}>
//                             {Icon && <Icon className="w-3.5 h-3.5" />}
//                             <span className="capitalize">{b.status}</span>
//                           </span>
//                         );
//                       }
//                     },
//                     { label: "Action", align: "right", render: b => (
//                         canViewBooking ? (
//                           <Button variant="ghost" size="sm" onClick={() => { setSelectedBooking(b); setDialogOpen(true); }}>
//                             View Details
//                           </Button>
//                         ) : null
//                     )}
//                 ]}
//              />
//           </CardContent>
//         </Card>
//       )}

//       {/* Mobile Cards */}
//       <div className="sm:hidden mt-4">
//         <div className="flex items-center justify-between mb-3 px-1">
//             <div className="text-sm font-medium">Bookings List ({filteredBookings.length})</div>
//         </div>

//         <div className="space-y-3">
//             {filteredBookings.map((b, index) => {
//               const config = STATUS_CONFIG[b.status] || STATUS_CONFIG.default;
//               const { colorClass, Icon } = config;
              
//               return (
//                 <Card key={b._id} className="border-l-4 hover:shadow-lg transition-all duration-200" style={{ borderLeftColor: config.Icon ? 'currentColor' : '#gray' }}>
//                   <CardHeader className="pb-2">
//                     <div className="flex items-start justify-between">
//                       <div className="flex-1">
//                         <div className="flex items-center gap-2 mb-1">
//                           <div className="font-semibold text-base text-gray-900">
//                             {b.formData?.firstName} {b.formData?.lastName}
//                           </div>
//                           <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${colorClass} flex items-center gap-1`}>
//                             {Icon && <Icon className="w-3 h-3" />}
//                             <span className="capitalize">{b.status}</span>
//                           </span>
//                         </div>
//                         <div className="text-xs text-muted-foreground">{b.bookingId}</div>
//                       </div>
//                     </div>
//                   </CardHeader>
                  
//                   <CardContent className="space-y-3">
//                     {/* Details Grid */}
//                     <div className="grid grid-cols-2 gap-3 text-sm">
//                       <div className="space-y-1">
//                         <p className="text-xs text-muted-foreground flex items-center gap-1">
//                           <Calendar className="w-3 h-3" />
//                           Date
//                         </p>
//                         <p className="font-medium text-gray-900">{new Date(b.formData?.date || b.createdAt).toLocaleDateString()}</p>
//                       </div>
//                       <div className="space-y-1">
//                         <p className="text-xs text-muted-foreground flex items-center gap-1">
//                           <Clock className="w-3 h-3" />
//                           Time
//                         </p>
//                         <p className="font-medium text-gray-900">{b.formData?.timeSlot || 'N/A'}</p>
//                       </div>
//                       <div className="space-y-1">
//                         <p className="text-xs text-muted-foreground flex items-center gap-1">
//                           <Mail className="w-3 h-3" />
//                           Email
//                         </p>
//                         <p className="font-medium text-gray-900 truncate">{b.formData?.email}</p>
//                       </div>
//                       <div className="space-y-1">
//                         <p className="text-xs text-muted-foreground flex items-center gap-1">
//                           <DollarSign className="w-3 h-3" />
//                           Amount
//                         </p>
//                         <p className="font-bold text-lg text-blue-600">${(b.totalPrice || 0).toLocaleString()}</p>
//                       </div>
//                     </div>
                    
//                     {/* Action Button */}
//                     {canViewBooking && (
//                       <Button 
//                         variant="outline" 
//                         size="sm" 
//                         onClick={() => { setSelectedBooking(b); setDialogOpen(true); }}
//                         className="w-full mt-2 border-blue-200 text-blue-700 hover:bg-blue-50"
//                       >
//                         View Full Details
//                       </Button>
//                     )}
//                   </CardContent>
//                 </Card>
//               );
//             })}
//         </div>
//       </div>
      
//       {/* Detail Dialogs */}
//       <BookingDetailsDialog 
//         booking={selectedBooking} 
//         open={dialogOpen} 
//         onClose={() => setDialogOpen(false)}
//         onStatusChange={(updatedBooking) => {
//           setBookings(prev => prev.map(b => b._id === updatedBooking._id ? updatedBooking : b));
//           setSelectedBooking(updatedBooking);
//         }}
//       />
      
//       <CreateBookingDialog 
//         open={createDialogOpen} 
//         onClose={() => setCreateDialogOpen(false)}
//         onSubmit={handleCreateBooking}
//       />
//     </div>
//   );
// }



// src/app/(dashboard)/dashboard/bookings/page.jsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from '@/context/AuthContext';
import DataTable from "@/components/common/DataTable";
import PageHeader from "@/components/common/PageHeader";
import BookingDetailsDialog from "@/components/BookingDetailsDialog";
import CreateBookingDialog from "@/components/CreateBookingDialog";
import EditBookingDialog from "@/components/EditBookingDialog"; // New Edit Dialog
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { fetchBookings, addBooking, updateBooking, deleteBooking } from "@/action/bookingActions";
import { Input } from "@/components/ui/input";
import * as XLSX from "xlsx";
import {
  CalendarDays,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCcw,
  CheckSquare,
  Plus,
  FileSpreadsheet,
  Calendar,
  DollarSign,
  TrendingUp,
  Filter,
  Users,
  Mail,
  Phone,
  MapPin,
  Package,
  ChevronRight,
  Download,
  MoreVertical,
  Search,
  BarChart3,
  Eye,
  Edit,
  Trash2,
  User,
  Building,
  Tag,
  AlertCircle,
  ChevronLeft,
  ChevronRight as RightChevron,
  ChevronsLeft,
  ChevronsRight,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Status configuration
const STATUS_CONFIG = {
  confirmed: {
    label: "Confirmed",
    colorClass: "bg-green-50 text-green-700 border-green-200",
    iconClass: "text-green-600",
    Icon: CheckCircle,
    bgColor: "bg-green-500"
  },
  pending: {
    label: "Pending",
    colorClass: "bg-yellow-50 text-yellow-700 border-yellow-200",
    iconClass: "text-yellow-600",
    Icon: Clock,
    bgColor: "bg-yellow-500"
  },
  cancelled: {
    label: "Cancelled",
    colorClass: "bg-red-50 text-red-700 border-red-200",
    iconClass: "text-red-600",
    Icon: XCircle,
    bgColor: "bg-red-500"
  },
  rescheduled: {
    label: "Rescheduled",
    colorClass: "bg-blue-50 text-blue-700 border-blue-200",
    iconClass: "text-blue-600",
    Icon: RefreshCcw,
    bgColor: "bg-blue-500"
  },
  completed: {
    label: "Completed",
    colorClass: "bg-purple-50 text-purple-700 border-purple-200",
    iconClass: "text-purple-600",
    Icon: CheckSquare,
    bgColor: "bg-purple-500"
  },
};

const ITEMS_PER_PAGE = 9; // Cards view
const TABLE_ITEMS_PER_PAGE = 5; // Table view

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [viewMode, setViewMode] = useState("cards"); // 'cards' or 'table'
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState({});

  const { hasPermission } = useAuth();
  const canCreateBooking = hasPermission('booking', 'create');
  const canViewBooking = hasPermission('booking', 'view');
  const canEditBooking = hasPermission('booking', 'edit');
  const canDeleteBooking = hasPermission('booking', 'delete');

  // Fetch bookings
  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const result = await fetchBookings();
      if (result.success) {
        setBookings(result.data || []);
      } else {
        toast.error(result.message || 'Failed to load bookings');
      }
    } catch (error) {
      toast.error('Error loading bookings');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Excel Import
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const workbook = XLSX.read(bstr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        let successCount = 0;
        let failCount = 0;

        for (const row of jsonData) {
          try {
            const bookingData = {
              bookingId: row["Booking ID"] || `IMP-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
              webName: row["Website"] || "Direct",
              vendorName: row["Vendor"] || "N/A",
              bookingType: row["Type"] || "service",
              totalPrice: parseFloat(row["Total Price"] || row["Price"] || 0),
              status: (row["Status"] || "pending").toLowerCase(),
              formData: {
                firstName: row["First Name"] || row["Customer Name"]?.split(' ')[0] || "Customer",
                lastName: row["Last Name"] || row["Customer Name"]?.split(' ')[1] || "",
                email: row["Email"] || "no-email@example.com",
                phone: row["Phone"] || row["Contact"] || "",
                date: row["Date"] ? new Date(row["Date"]).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                timeSlot: row["Time"] || row["Time Slot"] || "09:00 AM",
                package: row["Package"] || row["Service"] || "Standard",
                address: row["Address"] || "",
                city: row["City"] || "",
                state: row["State"] || "",
                notes: row["Notes"] || `Imported: ${row["Service Type"] || "Booking"}`
              }
            };

            const res = await addBooking(bookingData);
            if (res.success) successCount++;
            else failCount++;
          } catch (err) {
            failCount++;
          }
        }

        toast.success(`Import Complete: ${successCount} successful, ${failCount} failed`);
        await loadBookings();
        
      } catch (err) {
        toast.error("Failed to parse Excel file");
      } finally {
        setImporting(false);
        e.target.value = null;
      }
    };
    
    reader.readAsBinaryString(file);
  };

  // Calculate filtered bookings and stats
  const { filteredBookings, stats, statusDistribution } = useMemo(() => {
    let filtered = [...bookings];

    // Search filter
    if (search.trim()) {
      const searchTerm = search.toLowerCase();
      filtered = filtered.filter(b => 
        b.bookingId?.toLowerCase().includes(searchTerm) ||
        b.formData?.firstName?.toLowerCase().includes(searchTerm) ||
        b.formData?.lastName?.toLowerCase().includes(searchTerm) ||
        b.formData?.email?.toLowerCase().includes(searchTerm) ||
        b.formData?.phone?.includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch(dateRange) {
        case 'today':
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(b => {
        const bookingDate = new Date(b.formData?.date || b.createdAt);
        return bookingDate >= cutoffDate;
      });
    }

    // Calculate stats
    const stats = {
      total: filtered.length,
      revenue: filtered.reduce((sum, b) => sum + (b.totalPrice || 0), 0),
      completed: filtered.filter(b => b.status === 'completed').length,
      pending: filtered.filter(b => b.status === 'pending').length,
      confirmed: filtered.filter(b => b.status === 'confirmed').length,
    };

    // Status distribution
    const statusDistribution = {};
    Object.keys(STATUS_CONFIG).forEach(status => {
      statusDistribution[status] = filtered.filter(b => b.status === status).length;
    });

    return { filteredBookings: filtered, stats, statusDistribution };
  }, [bookings, search, statusFilter, dateRange]);

  // Pagination logic
  const itemsPerPage = viewMode === 'cards' ? ITEMS_PER_PAGE : TABLE_ITEMS_PER_PAGE;
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle create booking
  const handleCreateBooking = async (bookingData) => {
    try {
      const result = await addBooking(bookingData);
      if (result.success) {
        toast.success('Booking created successfully');
        setBookings(prev => [result.data, ...prev]);
        setCreateDialogOpen(false);
        setCurrentPage(1); // Reset to first page
      } else {
        toast.error(result.message || 'Failed to create booking');
      }
    } catch (error) {
      toast.error('Error creating booking');
    }
  };

  // Handle edit booking
  const handleEditBooking = async (bookingId, updatedData) => {
    try {
      setUpdatingStatus({ ...updatingStatus, [bookingId]: true });
      const result = await updateBooking(bookingId, updatedData);
      if (result.success) {
        setBookings(prev => prev.map(b => b._id === bookingId ? result.data : b));
        toast.success('Booking updated successfully');
        setEditDialogOpen(false);
        setSelectedBooking(null);
      } else {
        toast.error(result.message || 'Failed to update booking');
      }
    } catch (error) {
      toast.error('Error updating booking');
    } finally {
      setUpdatingStatus({ ...updatingStatus, [bookingId]: false });
    }
  };

  // Handle delete booking
  const handleDeleteBooking = async (bookingId) => {
    try {
      const result = await deleteBooking(bookingId);
      if (result.success) {
        setBookings(prev => prev.filter(b => b._id !== bookingId));
        toast.success('Booking deleted successfully');
        setDeleteDialogOpen(false);
        setBookingToDelete(null);
      } else {
        toast.error(result.message || 'Failed to delete booking');
      }
    } catch (error) {
      toast.error('Error deleting booking');
    }
  };

  // Handle quick status update
  const handleQuickStatusUpdate = async (bookingId, newStatus) => {
    try {
      setUpdatingStatus({ ...updatingStatus, [bookingId]: true });
      const result = await updateBooking(bookingId, { status: newStatus });
      if (result.success) {
        setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: newStatus } : b));
        toast.success(`Status updated to ${newStatus}`);
      } else {
        toast.error(result.message || 'Failed to update status');
      }
    } catch (error) {
      toast.error('Error updating status');
    } finally {
      setUpdatingStatus({ ...updatingStatus, [bookingId]: false });
    }
  };

  // Loading skeleton
  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title="Bookings Management"
          description="Manage all customer bookings, track status, and monitor revenue"
          icon={CalendarDays}
        />
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={importing}
            />
            <Button variant="outline" className="gap-2 w-full" disabled={importing}>
              <FileSpreadsheet className="w-4 h-4" />
              {importing ? "Importing..." : "Import"}
            </Button>
          </div>
          {canCreateBooking && (
            <Button onClick={() => setCreateDialogOpen(true)} className="gap-2 flex-1 sm:flex-initial">
              <Plus className="w-4 h-4" />
              New Booking
            </Button>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`$${stats.revenue.toLocaleString()}`}
          description="All time revenue"
          icon={DollarSign}
          color="blue"
        />
        <StatCard
          title="Total Bookings"
          value={stats.total}
          description={`${filteredBookings.length} showing`}
          icon={Calendar}
          color="green"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          description={`${stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% of total`}
          icon={CheckSquare}
          color="purple"
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          description="Awaiting confirmation"
          icon={Clock}
          color="yellow"
        />
      </div>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Booking Status</CardTitle>
          <CardDescription className="text-sm">Current status distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.entries(STATUS_CONFIG).map(([status, config]) => {
              const count = statusDistribution[status] || 0;
              const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              
              return (
                <StatusCard
                  key={status}
                  status={status}
                  config={config}
                  count={count}
                  percentage={percentage}
                  active={statusFilter === status}
                  onClick={() => {
                    setStatusFilter(status === statusFilter ? 'all' : status);
                    setCurrentPage(1);
                  }}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Controls and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search bookings..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 w-full"
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setCurrentPage(1); }}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">
                        <config.Icon className={`w-3 h-3 ${config.iconClass}`} />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={dateRange} onValueChange={(value) => { setDateRange(value); setCurrentPage(1); }}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>

              {/* View Toggle */}
              <div className="flex border rounded-md overflow-hidden w-full sm:w-auto">
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setViewMode('cards');
                    setCurrentPage(1);
                  }}
                  className="rounded-none px-3 flex-1 sm:flex-initial"
                >
                  Cards
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setViewMode('table');
                    setCurrentPage(1);
                  }}
                  className="rounded-none px-3 flex-1 sm:flex-initial"
                >
                  Table
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="text-base sm:text-lg font-semibold">
            {statusFilter !== 'all' ? `${STATUS_CONFIG[statusFilter]?.label} Bookings` : 'All Bookings'} 
            <span className="text-gray-600 text-sm font-normal ml-2">
              ({filteredBookings.length} total)
            </span>
          </h2>
          
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredBookings.length)} of {filteredBookings.length}
          </div>
        </div>

        {/* Cards View */}
        {viewMode === 'cards' ? (
          <>
            {filteredBookings.length === 0 ? (
              <EmptyState 
                onAdd={() => setCreateDialogOpen(true)}
                canCreate={canCreateBooking}
              />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedBookings.map((booking) => (
                    <BookingCard
                      key={booking._id}
                      booking={booking}
                      onView={() => {
                        setSelectedBooking(booking);
                        setDialogOpen(true);
                      }}
                      onEdit={() => {
                        setSelectedBooking(booking);
                        setEditDialogOpen(true);
                      }}
                      onDelete={() => {
                        setBookingToDelete(booking);
                        setDeleteDialogOpen(true);
                      }}
                      onStatusUpdate={handleQuickStatusUpdate}
                      canEdit={canEditBooking}
                      canDelete={canDeleteBooking}
                      canView={canViewBooking}
                      updatingStatus={updatingStatus[booking._id]}
                    />
                  ))}
                </div>

                {/* Pagination for Cards */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredBookings.length}
                    itemsPerPage={itemsPerPage}
                    startIndex={startIndex}
                    endIndex={endIndex}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </>
        ) : (
          /* Table View */
          <>
            {filteredBookings.length === 0 ? (
              <EmptyState 
                onAdd={() => setCreateDialogOpen(true)}
                canCreate={canCreateBooking}
              />
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block">
                  <Card>
                    <CardContent className="p-0">
                      <DataTable
                        data={paginatedBookings}
                        columns={[
                          { 
                            key: "bookingId", 
                            label: "Booking ID",
                            minWidth: "120px",
                            render: (b) => (
                              <div className="font-medium text-sm">{b.bookingId}</div>
                            )
                          },
                          { 
                            label: "Customer", 
                            minWidth: "200px",
                            render: b => (
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="text-xs">
                                    {`${b.formData?.firstName?.[0] || ''}${b.formData?.lastName?.[0] || ''}`}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{b.formData?.firstName} {b.formData?.lastName}</div>
                                  <div className="text-sm text-gray-500 truncate max-w-[180px]">{b.formData?.email}</div>
                                </div>
                              </div>
                            )
                          },
                          { 
                            label: "Date & Time", 
                            minWidth: "150px",
                            render: b => (
                              <div>
                                <div className="font-medium">
                                  {b.formData?.date ? format(new Date(b.formData.date), 'MMM dd, yyyy') : 'N/A'}
                                </div>
                                <div className="text-sm text-gray-500">{b.formData?.timeSlot || 'N/A'}</div>
                              </div>
                            )
                          },
                          { 
                            label: "Amount", 
                            minWidth: "100px",
                            render: b => (
                              <div className="font-bold text-blue-600">
                                ${(b.totalPrice || 0).toLocaleString()}
                              </div>
                            )
                          },
                          { 
                            label: "Status", 
                            minWidth: "150px",
                            render: b => {
                              const config = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
                              return (
                                <div className="flex items-center gap-2">
                                  <Badge className={`${config.colorClass} gap-1`}>
                                    {(() => {
                                      const StatusIcon = config.Icon;
                                      return <StatusIcon className="w-3 h-3" />;
                                    })()}
                                    {config.label}
                                  </Badge>
                                  {canEditBooking && (
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                          <ChevronRight className="w-3 h-3 rotate-90" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                                          b.status !== status && (
                                            <DropdownMenuItem 
                                              key={status}
                                              onClick={() => handleQuickStatusUpdate(b._id, status)}
                                              disabled={updatingStatus[b._id]}
                                            >
                                              {(() => {
                                                const StatusIcon = config.Icon;
                                                return <StatusIcon className={`w-3 h-3 mr-2 ${config.iconClass}`} />;
                                              })()}
                                              Mark as {config.label}
                                            </DropdownMenuItem>
                                          )
                                        ))}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  )}
                                </div>
                              );
                            }
                          },
                          { 
                            label: "Actions", 
                            align: "right",
                            minWidth: "120px",
                            render: b => (
                              <div className="flex items-center gap-2 justify-end">
                                {canViewBooking && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => { setSelectedBooking(b); setDialogOpen(true); }}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                )}
                                {canEditBooking && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => { setSelectedBooking(b); setEditDialogOpen(true); }}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}
                                {canDeleteBooking && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Booking</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete booking {b.bookingId}? 
                                          This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteBooking(b._id)}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                              </div>
                            )
                          }
                        ]}
                        tableHeight="calc(100vh - 550px)"
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Mobile/Tablet Cards */}
                <div className="lg:hidden">
                  <div className="space-y-3">
                    {paginatedBookings.map((b) => (
                      <Card key={b._id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-sm">{b.formData?.firstName} {b.formData?.lastName}</h3>
                                <Badge className={`${STATUS_CONFIG[b.status]?.colorClass || ''} text-xs`}>
                                  {(() => {
                                    const StatusIcon = STATUS_CONFIG[b.status]?.Icon;
                                    return StatusIcon && <StatusIcon className="w-3 h-3 mr-1" />;
                                  })()}
                                  {STATUS_CONFIG[b.status]?.label || b.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-500">{b.bookingId}</p>
                            </div>
                          </div>

                          {/* Info Grid */}
                          <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                            <div>
                              <p className="text-gray-500 text-xs mb-1">Date</p>
                              <p className="font-medium">
                                {b.formData?.date ? format(new Date(b.formData.date), 'MMM dd, yyyy') : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs mb-1">Time</p>
                              <p className="font-medium">{b.formData?.timeSlot || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs mb-1">Email</p>
                              <p className="font-medium truncate">{b.formData?.email}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs mb-1">Amount</p>
                              <p className="font-bold text-blue-600">${(b.totalPrice || 0).toLocaleString()}</p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-3 border-t">
                            {canViewBooking && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setSelectedBooking(b); setDialogOpen(true); }}
                                className="flex-1"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                            )}
                            {canEditBooking && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => { setSelectedBooking(b); setEditDialogOpen(true); }}
                                className="flex-1"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Button>
                            )}
                            {canDeleteBooking && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Booking</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete booking {b.bookingId}? 
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteBooking(b._id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Pagination for Table */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredBookings.length}
                    itemsPerPage={TABLE_ITEMS_PER_PAGE}
                    startIndex={startIndex}
                    endIndex={endIndex}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Dialogs */}
      <BookingDetailsDialog 
        booking={selectedBooking} 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        onStatusChange={(updatedBooking) => {
          setBookings(prev => prev.map(b => b._id === updatedBooking._id ? updatedBooking : b));
          setSelectedBooking(updatedBooking);
        }}
      />
      
      <CreateBookingDialog 
        open={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateBooking}
      />

      <EditBookingDialog
        booking={selectedBooking}
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedBooking(null);
        }}
        onSubmit={handleEditBooking}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete booking {bookingToDelete?.bookingId}? 
              This action cannot be undone and all booking data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBookingToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => bookingToDelete && handleDeleteBooking(bookingToDelete._id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ============= COMPONENTS =============

function LoadingSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-5 gap-4">
        {[1,2,3,4,5].map(i => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1,2,3,4,5,6].map(i => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function StatCard({ title, value, description, icon: Icon, color }) {
  const colorClasses = {
    blue: { bg: "bg-blue-50", icon: "text-blue-600", border: "border-blue-200" },
    green: { bg: "bg-green-50", icon: "text-green-600", border: "border-green-200" },
    purple: { bg: "bg-purple-50", icon: "text-purple-600", border: "border-purple-200" },
    yellow: { bg: "bg-yellow-50", icon: "text-yellow-600", border: "border-yellow-200" },
  }[color] || { bg: "bg-gray-50", icon: "text-gray-600", border: "border-gray-200" };

  return (
    <Card className={`border-l-4 ${colorClasses.border}`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
          <div className={`p-2 rounded-lg ${colorClasses.bg}`}>
            <Icon className={`w-6 h-6 ${colorClasses.icon}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusCard({ status, config, count, percentage, active, onClick }) {
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${active ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{config.label}</p>
            <h3 className="text-2xl font-bold mt-1">{count}</h3>
          </div>
          <config.Icon className={`w-8 h-8 ${config.iconClass}`} />
        </div>
        <Progress value={percentage} className="mt-3 h-1.5" />
        <p className="text-xs text-gray-600 mt-1">{percentage}% of total</p>
      </CardContent>
    </Card>
  );
}

function BookingCard({ booking, onView, onEdit, onDelete, onStatusUpdate, canEdit, canDelete, canView, updatingStatus }) {
  const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
  const initials = `${booking.formData?.firstName?.[0] || ''}${booking.formData?.lastName?.[0] || ''}`;
  const bookingDate = booking.formData?.date ? new Date(booking.formData.date) : new Date(booking.createdAt);
  
  return (
    <Card className="group hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className={statusConfig.colorClass}>
                <statusConfig.Icon className="w-3 h-3 mr-1" />
                {statusConfig.label}
              </Badge>
              <span className="text-xs text-gray-500 font-mono">
                {booking.bookingId}
              </span>
            </div>
            <CardTitle className="text-lg">
              {booking.formData?.firstName} {booking.formData?.lastName}
            </CardTitle>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              {canView && (
                <DropdownMenuItem onClick={onView}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
              )}
              {canEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Booking
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Change Status</DropdownMenuLabel>
              {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                booking.status !== status && (
                  <DropdownMenuItem 
                    key={status}
                    onClick={() => onStatusUpdate(booking._id, status)}
                    disabled={updatingStatus}
                  >
                    <config.Icon className={`w-3 h-3 mr-2 ${config.iconClass}`} />
                    Mark as {config.label}
                  </DropdownMenuItem>
                )
              ))}
              <DropdownMenuSeparator />
              {canDelete && (
                <DropdownMenuItem 
                  onClick={onDelete}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Booking
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3 space-y-3">
        {/* Customer Info */}
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-blue-100 text-blue-600">
              {initials || <User className="w-4 h-4" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium">{booking.formData?.email}</p>
            <p className="text-sm text-gray-600">{booking.formData?.phone || 'No phone'}</p>
          </div>
        </div>
        
        {/* Booking Details */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-gray-500 mb-1">Date & Time</p>
            <p className="font-medium">
              {format(bookingDate, 'MMM dd, yyyy')}
            </p>
            <p className="text-gray-600">{booking.formData?.timeSlot || 'N/A'}</p>
          </div>
          
          <div>
            <p className="text-xs text-gray-500 mb-1">Service</p>
            <p className="font-medium flex items-center gap-1">
              <Package className="w-3 h-3" />
              {booking.formData?.package || 'Standard'}
            </p>
          </div>
        </div>
        
        {/* Price */}
        <div className="flex justify-between items-center pt-2 border-t">
          <div>
            <p className="text-xs text-gray-500">Total Amount</p>
            <p className="text-xl font-bold text-blue-600">
              ${(booking.totalPrice || 0).toLocaleString()}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onView}
            className="gap-1"
          >
            Details
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ onAdd, canCreate }) {
  return (
    <Card className="border-dashed">
      <CardContent className="p-8 text-center">
        <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
        <p className="text-gray-600 mb-4">
          Try changing your filters or create a new booking
        </p>
        {canCreate && (
          <Button onClick={onAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Create Booking
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function Pagination({ currentPage, totalPages, totalItems, itemsPerPage, startIndex, endIndex, onPageChange }) {
  const maxVisiblePages = 5;
  
  const getPageNumbers = () => {
    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);
    
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }
    
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
      <div className="text-sm text-gray-600">
        Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
        <span className="font-medium">{Math.min(endIndex, totalItems)}</span> of{' '}
        <span className="font-medium">{totalItems}</span> results
      </div>
      
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {getPageNumbers().map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
            className="h-8 w-8 p-0"
          >
            {page}
          </Button>
        ))}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0"
        >
          <RightChevron className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Items per page:</span>
        <span className="font-medium">{itemsPerPage}</span>
      </div>
    </div>
  );
}