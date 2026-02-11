// src/app/(dashboard)/dashboard/bookings/page.jsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from '@/context/AuthContext';
import DataTable from "@/components/common/DataTable";
import PageHeader from "@/components/common/PageHeader";
import BookingDetailsDialog from "@/components/BookingDetailsDialog";
import CreateBookingDialog from "@/components/CreateBookingDialog";
import EditBookingDialog from "@/components/EditBookingDialog"; // New Edit Dialog
import { RescheduleBooking } from "@/components/RescheduleBooking"; // Import Reschedule Modal
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
  Loader2,
  Checkbox
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
  const [importPreviewOpen, setImportPreviewOpen] = useState(false);
  const [importedData, setImportedData] = useState([]);
  const [importingMessage, setImportingMessage] = useState("");
  const [allSheetData, setAllSheetData] = useState({}); // Store data from all sheets
  const [selectedSheet, setSelectedSheet] = useState(null); // Track selected sheet
  const [selectedForDelete, setSelectedForDelete] = useState(new Set()); // Bulk delete selection
  const [rescheduleOpen, setRescheduleOpen] = useState(false); // Reschedule modal
  const [bookingToReschedule, setBookingToReschedule] = useState(null); // Booking for reschedule

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
        
        // Process all sheets
        const sheetsData = {};
        let totalBookings = 0;
        
        for (const sheetName of workbook.SheetNames) {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          // Convert to booking format for preview
          const bookingsToImport = jsonData.map(row => ({
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
          }));

          sheetsData[sheetName] = bookingsToImport;
          totalBookings += bookingsToImport.length;
        }

        // Set the data
        setAllSheetData(sheetsData);
        const firstSheet = workbook.SheetNames[0];
        setSelectedSheet(firstSheet);
        setImportedData(sheetsData[firstSheet] || []);
        
        const sheetCount = workbook.SheetNames.length;
        setImportingMessage(
          sheetCount > 1 
            ? `Ready to import from ${sheetCount} sheets - Total ${totalBookings} booking(s)`
            : `Ready to import ${totalBookings} booking(s)`
        );
        setImportPreviewOpen(true);
        
      } catch (err) {
        toast.error("Failed to parse Excel file");
      } finally {
        setImporting(false);
        e.target.value = null;
      }
    };
    
    reader.readAsBinaryString(file);
  };

  // Handle sheet change
  const handleSheetChange = (sheetName) => {
    setSelectedSheet(sheetName);
    setImportedData(allSheetData[sheetName] || []);
  };

  // Delete a row from preview
  const handleDeleteRow = (index) => {
    const updatedData = importedData.filter((_, i) => i !== index);
    setImportedData(updatedData);
    setAllSheetData(prev => ({
      ...prev,
      [selectedSheet]: updatedData
    }));
  };

  // Confirm and save imported bookings
  const handleConfirmImport = async () => {
    setImporting(true);
    try {
      let successCount = 0;
      let failCount = 0;

      // Import from all sheets
      for (const sheetName in allSheetData) {
        for (const bookingData of allSheetData[sheetName]) {
          try {
            const res = await addBooking(bookingData);
            if (res.success) successCount++;
            else failCount++;
          } catch (err) {
            failCount++;
          }
        }
      }

      toast.success(`Import Complete: ${successCount} successful, ${failCount} failed`);
      await loadBookings();
      setImportPreviewOpen(false);
      setImportedData([]);
      setAllSheetData({});
      setSelectedSheet(null);
      
    } catch (err) {
      toast.error("Error importing bookings");
      console.error(err);
    } finally {
      setImporting(false);
    }
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

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      const bookingIds = Array.from(selectedForDelete);
      let successCount = 0;
      let failCount = 0;

      for (const bookingId of bookingIds) {
        try {
          const result = await deleteBooking(bookingId);
          if (result.success) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (err) {
          failCount++;
        }
      }

      setBookings(prev => prev.filter(b => !selectedForDelete.has(b._id)));
      setSelectedForDelete(new Set());
      toast.success(`Deleted ${successCount} booking(s)${failCount > 0 ? `, ${failCount} failed` : ''}`);
      setDeleteDialogOpen(false);
      setBookingToDelete(null);
    } catch (error) {
      toast.error('Error deleting bookings');
    }
  };

  // Toggle booking selection
  const toggleBookingSelection = (bookingId) => {
    const newSelection = new Set(selectedForDelete);
    if (newSelection.has(bookingId)) {
      newSelection.delete(bookingId);
    } else {
      newSelection.add(bookingId);
    }
    setSelectedForDelete(newSelection);
  };

  // Select/Deselect all visible bookings
  const toggleSelectAll = () => {
    if (selectedForDelete.size === paginatedBookings.length) {
      setSelectedForDelete(new Set());
    } else {
      const newSelection = new Set(selectedForDelete);
      paginatedBookings.forEach(b => newSelection.add(b._id));
      setSelectedForDelete(newSelection);
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
          {selectedForDelete.size > 0 && canDeleteBooking && (
            <Button 
              onClick={() => {
                setDeleteDialogOpen(true);
                setBookingToDelete(null);
              }} 
              variant="destructive" 
              className="gap-2 flex-1 sm:flex-initial"
            >
              <Trash2 className="w-4 h-4" />
              Delete ({selectedForDelete.size})
            </Button>
          )}
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
                {/* Show select all checkbox when cards view */}
                {selectedForDelete.size > 0 && canDeleteBooking && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200 mb-4">
                    <input
                      type="checkbox"
                      checked={selectedForDelete.size === paginatedBookings.length && paginatedBookings.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-blue-900">
                      {selectedForDelete.size === paginatedBookings.length && paginatedBookings.length > 0
                        ? 'All visible bookings selected'
                        : `${selectedForDelete.size} booking(s) selected`}
                    </span>
                  </div>
                )}
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
                      onReschedule={() => {
                        setBookingToReschedule(booking);
                        setRescheduleOpen(true);
                      }}
                      onStatusUpdate={handleQuickStatusUpdate}
                      isSelected={selectedForDelete.has(booking._id)}
                      onSelect={() => toggleBookingSelection(booking._id)}
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
                                       <DataTable
                        data={paginatedBookings}
                        columns={[
                          {
                            label: "",
                            minWidth: "50px",
                            align: "center",
                            render: (b) => (
                              canDeleteBooking && (
                                <input
                                  type="checkbox"
                                  checked={selectedForDelete.has(b._id)}
                                  onChange={() => toggleBookingSelection(b._id)}
                                  className="w-4 h-4 cursor-pointer"
                                />
                              )
                            )
                          },
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
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          onClick={() => {
                                            setBookingToReschedule(b);
                                            setRescheduleOpen(true);
                                          }}
                                        >
                                          <RefreshCcw className="w-3 h-3 mr-2 text-blue-600" />
                                          Reschedule Booking
                                        </DropdownMenuItem>
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
                        tableHeight="auto"
                        rowsPerPage={TABLE_ITEMS_PER_PAGE}
                        currentPage={currentPage}
                        totalPages={Math.ceil(filteredBookings.length / TABLE_ITEMS_PER_PAGE)}
                        onPageChange={setCurrentPage}
                      />
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
                          <div className="flex gap-2 pt-3 border-t flex-wrap">
                            {canViewBooking && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setSelectedBooking(b); setDialogOpen(true); }}
                                className="flex-1 min-w-20"
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
                                className="flex-1 min-w-20"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Button>
                            )}
                            {canEditBooking && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setBookingToReschedule(b);
                                  setRescheduleOpen(true);
                                }}
                                className="flex-1 min-w-[100px]"
                              >
                                <RefreshCcw className="w-4 h-4 mr-2" />
                                Reschedule
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

      {/* Reschedule Modal */}
      <RescheduleBooking 
        booking={bookingToReschedule}
        isOpen={rescheduleOpen}
        onClose={() => {
          setRescheduleOpen(false);
          setBookingToReschedule(null);
        }}
        onSuccess={(updatedBooking) => {
          setBookings(prev => prev.map(b => b._id === updatedBooking._id ? updatedBooking : b));
          setRescheduleOpen(false);
          setBookingToReschedule(null);
          toast.success('Booking rescheduled successfully!');
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedForDelete.size > 0 ? 'Delete Bookings' : 'Delete Booking'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedForDelete.size > 0 
                ? `Are you sure you want to delete ${selectedForDelete.size} booking(s)? This action cannot be undone and all booking data will be permanently removed.`
                : `Are you sure you want to delete booking ${bookingToDelete?.bookingId}? This action cannot be undone and all booking data will be permanently removed.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setBookingToDelete(null);
              setDeleteDialogOpen(false);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedForDelete.size > 0) {
                  handleBulkDelete();
                } else {
                  bookingToDelete && handleDeleteBooking(bookingToDelete._id);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              {selectedForDelete.size > 0 ? `Delete ${selectedForDelete.size} Booking(s)` : 'Delete Booking'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import Preview Dialog */}
      <AlertDialog open={importPreviewOpen} onOpenChange={setImportPreviewOpen}>
        <AlertDialogContent className="max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
          <AlertDialogHeader className="border-b pb-4">
            <div className="space-y-4">
              <div>
                <AlertDialogTitle className="text-xl mb-1">Preview & Manage Import Data</AlertDialogTitle>
                <AlertDialogDescription>
                  {importingMessage}
                </AlertDialogDescription>
              </div>
              
              {/* Summary Stats - Small Cards in Header */}
              {Object.keys(allSheetData).length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <p className="text-xs font-semibold text-gray-600 uppercase">Total Sheets</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{Object.keys(allSheetData).length}</p>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                    <p className="text-xs font-semibold text-gray-600 uppercase">Current Month</p>
                    <p className="text-2xl font-bold text-indigo-600 mt-1">{importedData.length}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                    <p className="text-xs font-semibold text-gray-600 uppercase">Deleted</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">
                      {Object.values(allSheetData).reduce((sum, arr) => sum, 0) - 
                       Object.values(allSheetData).reduce((sum, arr) => sum + arr.length, 0) + 
                       importedData.length}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <p className="text-xs font-semibold text-gray-600 uppercase">Total Ready</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {Object.values(allSheetData).reduce((sum, arr) => sum + arr.length, 0)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </AlertDialogHeader>

          {/* Sheet Tabs - Improved UI */}
          {Object.keys(allSheetData).length > 1 && (
            <div className="px-6 py-3 border-b bg-linear-to-r from-blue-50 to-indigo-50">
              <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">Months/Sheets</p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {Object.keys(allSheetData).map((sheetName) => (
                  <button
                    key={sheetName}
                    onClick={() => handleSheetChange(sheetName)}
                    className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                      selectedSheet === sheetName
                        ? 'bg-blue-500 text-white shadow-lg scale-105'
                        : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    <span>{sheetName}</span>
                    <span className={`ml-2 text-xs font-bold ${selectedSheet === sheetName ? 'text-blue-100' : 'text-gray-500'}`}>
                      ({allSheetData[sheetName].length})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Preview Table - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            {importedData.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-linear-to-r from-gray-100 to-gray-50 z-10 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 w-10">#</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Phone</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Time</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Package</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Price</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700 w-12">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {importedData.map((booking, idx) => (
                    <tr key={idx} className="border-b hover:bg-blue-50 transition-colors group">
                      <td className="px-4 py-3 text-gray-600 text-xs font-medium">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {booking.formData?.firstName} {booking.formData?.lastName}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">{booking.formData?.email}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{booking.formData?.phone}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">{booking.formData?.date}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{booking.formData?.timeSlot}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{booking.formData?.package}</td>
                      <td className="px-4 py-3 font-bold text-blue-600 text-right">
                        ${booking.totalPrice?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={`${STATUS_CONFIG[booking.status]?.colorClass || 'bg-gray-100'} text-xs`}>
                          {booking.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleDeleteRow(idx)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white rounded-lg p-2 inline-flex items-center justify-center"
                          title="Delete this row"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-500">
                <AlertCircle className="w-5 h-5 mr-2" />
                No data in this sheet
              </div>
            )}
          </div>

          <AlertDialogFooter className="gap-3 pt-4 border-t">
            <AlertDialogCancel onClick={() => {
              setImportPreviewOpen(false);
              setImportedData([]);
              setAllSheetData({});
              setSelectedSheet(null);
            }} className="px-6">
              Cancel
            </AlertDialogCancel>
            <Button
              onClick={handleConfirmImport}
              disabled={importing || Object.keys(allSheetData).length === 0 || Object.values(allSheetData).reduce((sum, arr) => sum + arr.length, 0) === 0}
              className="bg-green-600 hover:bg-green-700 px-8"
            >
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Add All ({Object.values(allSheetData).reduce((sum, arr) => sum + arr.length, 0)})
                </>
              )}
            </Button>
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

function BookingCard({ booking, onView, onEdit, onDelete, onReschedule, onStatusUpdate, canEdit, canDelete, canView, updatingStatus, isSelected, onSelect }) {
  const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
  const initials = `${booking.formData?.firstName?.[0] || ''}${booking.formData?.lastName?.[0] || ''}`;
  const bookingDate = booking.formData?.date ? new Date(booking.formData.date) : new Date(booking.createdAt);
  
  return (
    <Card className={`group hover:shadow-lg transition-all duration-200 ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {canDelete && (
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={onSelect}
                  className="w-4 h-4 cursor-pointer"
                />
              )}
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
              {canEdit && (
                <DropdownMenuItem onClick={onReschedule}>
                  <RefreshCcw className="w-4 h-4 mr-2 text-blue-600" />
                  Reschedule
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