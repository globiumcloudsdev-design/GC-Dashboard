// src/app/(dashboard)/dashboard/bookings/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from '@/context/AuthContext';
import DataTable from "@/components/common/DataTable";
import GlobalData from "@/components/common/GlobalData";
import PageHeader from "@/components/common/PageHeader";
import BookingSearchBar from "@/components/SearchBar";
import SearchResultCard from "@/components/common/SearchResultCard";
import BookingDetailsDialog from "@/components/BookingDetailsDialog";
import CreateBookingDialog from "@/components/CreateBookingDialog";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { fetchBookings, addBooking } from "@/action/bookingActions";
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
  Mail
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Status configuration lookup map
const STATUS_CONFIG = {
  confirmed: { colorClass: "bg-green-100 text-green-700", Icon: CheckCircle },
  pending: { colorClass: "bg-yellow-100 text-yellow-700", Icon: Clock },
  cancelled: { colorClass: "bg-red-100 text-red-700", Icon: XCircle },
  rescheduled: { colorClass: "bg-blue-100 text-blue-700", Icon: RefreshCcw },
  completed: { colorClass: "bg-purple-100 text-purple-700", Icon: CheckSquare },
  default: { colorClass: "bg-gray-100 text-gray-700", Icon: null },
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [mobileFilter, setMobileFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  // 🟢 Filter & Stats State
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [importing, setImporting] = useState(false);

  const { hasPermission } = useAuth();
  const canCreateBooking = hasPermission('booking', 'create');
  const canViewBooking = hasPermission('booking', 'view');

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 1) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" } }),
  };

  // ✅ Excel Import Handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const workbook = XLSX.read(bstr, { type: "binary" });
        
        let allBookings = [];
        
        // Loop through all sheets
        workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            allBookings = [...allBookings, ...jsonData];
        });

        console.log("Parsed Excel Data:", allBookings);

        if (allBookings.length === 0) {
            toast.error("No data found in Excel file");
            setImporting(false);
            return;
        }

        let successCount = 0;
        let failCount = 0;

        // Process each row
        // Columns: "Booking ID", "Booking Type", "First Name", "Last Name", "Email", "Phone", "Total Price", "Booking Date", etc.
        for (const row of allBookings) {
             const bookingData = {
                 bookingId: row["Booking ID"] || `IMP${Date.now()}${Math.random().toString(36).substr(2, 4)}`,
                 webName: row["Website"] || row["Web Name"] || "N/A",
                 vendorName: row["Vendor"] || row["Company"] || "Direct Customer",
                 bookingType: row["Booking Type"] || row["Service Type"] || "other", 
                 totalPrice: parseFloat(row["Total Price"] || row["Discounted Price"] || row["Price"] || 0),
                 status: (row["Status"] || "pending").toLowerCase(),
                 submittedAt: new Date().toISOString(),
                 formData: {
                     firstName: row["First Name"] || "Unknown",
                     lastName: row["Last Name"] || "",
                     email: row["Email"] || "no-email@import.com",
                     phone: row["Phone"] || "",
                     address: row["Address"] || "",
                     city: row["City"] || "",
                     state: row["State"] || "",
                     zip: row["Zip"] || "",
                     date: row["Booking Date"] || row["Date"] ? new Date(row["Booking Date"] || row["Date"]).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                     timeSlot: row["Time Slot"] || row["Time"] || "09:00 AM",
                     package: row["Package"] || "",
                     additionalServices: row["Additional Services"] || "",
                     notes: `Imported from Excel. Service: ${row["Service Type"] || "N/A"}`
                 }
             };

             // Call API to create
             const res = await addBooking(bookingData);
             if (res.success) successCount++;
             else {
                 console.error("Failed to add booking:", row["Booking ID"], res.message);
                 failCount++;
             }
        }

        toast.success(`Import Complete: ${successCount} added, ${failCount} failed.`);
        fetchBookings().then(res => setBookings(res.data || []));
        
      } catch (err) {
        console.error("Excel Import Error:", err);
        toast.error("Failed to parse Excel file");
      } finally {
        setImporting(false);
        // Reset file input
        e.target.value = null;
      }
    };
    reader.readAsBinaryString(file);
  };

  // ✅ Filter Logic
  const filteredBookings = bookings.filter((b) => {
    // 1. Text Search
    if (search.trim() && !b.formData?.firstName?.toLowerCase().includes(search.toLowerCase())) {
        return false;
    }
    // 2. Date Range Filter
    if (fromDate || toDate) {
        const bookingDate = new Date(b.formData?.date || b.createdAt);
        // Reset times for accurate comparison
        bookingDate.setHours(0,0,0,0);
        
        if (fromDate) {
            const start = new Date(fromDate);
            start.setHours(0,0,0,0);
            if (bookingDate < start) return false;
        }
        if (toDate) {
            const end = new Date(toDate);
            end.setHours(23,59,59,999);
            if (bookingDate > end) return false;
        }
    }
    return true;
  });

  // ✅ Revenue Stats Calculation
  const stats = filteredBookings.reduce((acc, curr) => {
      acc.totalCount++;
      acc.totalRevenue += (curr.totalPrice || 0); // Use totalPrice field
      return acc;
  }, { totalCount: 0, totalRevenue: 0 });

  const isSearching = search.trim().length > 0;

  // Fetch bookings on mount
  useEffect(() => {
    const loadBookings = async () => {
      setLoading(true);
      const result = await fetchBookings();
      if (result.success) {
        setBookings(result.data || []);
      }
      setLoading(false);
    };
    loadBookings();
  }, []);

  // Handle create booking
  const handleCreateBooking = async (bookingData) => {
    const result = await addBooking(bookingData);
    if (result.success) {
      toast.success('Booking created successfully');
      setBookings(prev => [...prev, result.data]);
      setCreateDialogOpen(false);
    } else {
      toast.error(result.message || 'Failed to create booking');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Import Loader Overlay */}
      {importing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute inset-0"></div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Importing Bookings</h3>
                <p className="text-sm text-gray-600">Please wait while we process your Excel file...</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full animate-pulse" style={{ width: '70%' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <PageHeader
            title="Bookings Overview"
            description="Manage, track, and monitor all bookings in one place."
            icon={CalendarDays}
            className="mb-0"
        />
        
        {/* Actions: Import & Create */}
        <div className="flex gap-2 w-full md:w-auto">
            {canCreateBooking && (
            <>
                {/* Excel Import Button */}
                <div className="relative">
                    <input
                        type="file"
                        accept=".xlsx, .xls, .csv"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={importing}
                    />
                    <Button variant="outline" className="w-full gap-2 border-green-600 text-green-700 hover:bg-green-50" disabled={importing}>
                        <FileSpreadsheet className="w-4 h-4" />
                        {importing ? "Importing..." : "Import Excel"}
                    </Button>
                </div>
                <Button
                    onClick={() => setCreateDialogOpen(true)}
                    className="blue-button flex items-center gap-2 w-full sm:w-auto"
                >
                    <Plus className="w-4 h-4" />
                    Create
                </Button>
            </>
            )}
        </div>
      </div>

      {/* 📊 STATS CARDS & FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
         {/* Stats */}
         <div className="col-span-1 md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 border-0 shadow-md text-white">
                <CardContent className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-indigo-100 text-sm font-medium mb-1">Total Revenue</p>
                        <h3 className="text-2xl font-bold flex items-center gap-2">
                            <DollarSign className="w-5 h-5" /> 
                            {stats.totalRevenue.toLocaleString()}
                        </h3>
                        <p className="text-xs text-indigo-200 mt-1">Based on {fromDate && toDate ? "filtered range" : "all time"}</p>
                    </div>
                    <div className="p-3 bg-white/10 rounded-full">
                        <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white border shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-sm font-medium mb-1">Total Bookings</p>
                        <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                           <Users className="w-5 h-5 text-blue-500" />
                           {stats.totalCount}
                        </h3>
                         <p className="text-xs text-slate-400 mt-1">{filteredBookings.length} filtered</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-full">
                        <Calendar className="w-6 h-6 text-blue-500" />
                    </div>
                </CardContent>
            </Card>
         </div>

         {/* Filters */}
         <Card className="col-span-1 md:col-span-4 border shadow-sm">
            <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Filter className="w-4 h-4" /> Filter by Date Range
                </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
                <div className="space-y-1">
                    <label className="text-xs text-slate-500 font-medium">From Date</label>
                    <Input 
                        type="date" 
                        value={fromDate} 
                        onChange={(e) => setFromDate(e.target.value)} 
                        className="h-9"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-slate-500 font-medium">To Date</label>
                    <Input 
                        type="date" 
                        value={toDate} 
                        onChange={(e) => setToDate(e.target.value)} 
                        className="h-9"
                    />
                </div>
                {(fromDate || toDate) && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => { setFromDate(""); setToDate(""); }}
                        className="w-full text-xs h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        Clear Filters
                    </Button>
                )}
            </CardContent>
         </Card>
      </div>

      <Separator />

      {/* Search & Filter Section (Optional Search Bar) */}
      {/* <BookingSearchBar onSearch={handleSearch} /> */}

      {/* If searching → show search results */}
      {isSearching && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 py-6"
        >
          {filteredBookings.length === 0 ? (
            <p className="text-center text-gray-500 col-span-full">
              No results found for <strong>{search}</strong>.
            </p>
          ) : (
            filteredBookings.map((booking, index) => (
              <SearchResultCard
                key={booking._id}
                item={booking}
                index={index}
                fadeUp={fadeUp}
                type="booking"
                onViewDetails={(b) => {
                  setSelectedBooking(b);
                  setDialogOpen(true);
                }}
              />
            ))
          )}
        </motion.div>
      )}

      {/* Default Data Table view */}
      {!isSearching && (
        <Card className="border-none shadow-md mt-6">
          <CardHeader className="border-b px-6 py-4 bg-muted/20">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
               <div>
                  <CardTitle>All Bookings</CardTitle>
                  <CardDescription>
                     Showing {filteredBookings.length} {filteredBookings.length === 1 ? 'booking' : 'bookings'} 
                     {fromDate && toDate ? " in selected range" : ""}
                  </CardDescription>
               </div>
             </div>
          </CardHeader>
          <CardContent className="p-0">
             <DataTable
                data={filteredBookings}
                columns={[
                    { key: "bookingId", label: "Booking ID" },
                    { label: "Customer", render: b => `${b.formData?.firstName || ""} ${b.formData?.lastName || ""}` },
                    { label: "Email", render: b => b.formData?.email || "N/A" },
                    { label: "Price", render: b => `$${(b.totalPrice || 0).toLocaleString()}` },
                    { label: "Date", render: b => new Date(b.formData?.date || b.createdAt).toLocaleDateString() },
                    { label: "Status", render: b => {
                        const config = STATUS_CONFIG[b.status] || STATUS_CONFIG.default;
                        const { colorClass, Icon } = config;
                        return (
                          <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 w-fit ${colorClass}`}>
                            {Icon && <Icon className="w-3.5 h-3.5" />}
                            <span className="capitalize">{b.status}</span>
                          </span>
                        );
                      }
                    },
                    { label: "Action", align: "right", render: b => (
                        canViewBooking ? (
                          <Button variant="ghost" size="sm" onClick={() => { setSelectedBooking(b); setDialogOpen(true); }}>
                            View Details
                          </Button>
                        ) : null
                    )}
                ]}
             />
          </CardContent>
        </Card>
      )}

      {/* Mobile Cards */}
      <div className="sm:hidden mt-4">
        <div className="flex items-center justify-between mb-3 px-1">
            <div className="text-sm font-medium">Bookings List ({filteredBookings.length})</div>
        </div>

        <div className="space-y-3">
            {filteredBookings.map((b, index) => {
              const config = STATUS_CONFIG[b.status] || STATUS_CONFIG.default;
              const { colorClass, Icon } = config;
              
              return (
                <Card key={b._id} className="border-l-4 hover:shadow-lg transition-all duration-200" style={{ borderLeftColor: config.Icon ? 'currentColor' : '#gray' }}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-semibold text-base text-gray-900">
                            {b.formData?.firstName} {b.formData?.lastName}
                          </div>
                          <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${colorClass} flex items-center gap-1`}>
                            {Icon && <Icon className="w-3 h-3" />}
                            <span className="capitalize">{b.status}</span>
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">{b.bookingId}</div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Date
                        </p>
                        <p className="font-medium text-gray-900">{new Date(b.formData?.date || b.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Time
                        </p>
                        <p className="font-medium text-gray-900">{b.formData?.timeSlot || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          Email
                        </p>
                        <p className="font-medium text-gray-900 truncate">{b.formData?.email}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          Amount
                        </p>
                        <p className="font-bold text-lg text-blue-600">${(b.totalPrice || 0).toLocaleString()}</p>
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    {canViewBooking && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => { setSelectedBooking(b); setDialogOpen(true); }}
                        className="w-full mt-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        View Full Details
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
        </div>
      </div>
      
      {/* Detail Dialogs */}
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
    </div>
  );
}
