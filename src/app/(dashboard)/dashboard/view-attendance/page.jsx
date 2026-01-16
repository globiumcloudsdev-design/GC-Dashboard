//src/app/(dashboard)/dashboard/view-attendance/page.jsx
"use client";
import React, { useCallback, useEffect, useState } from "react";
import { adminService } from "@/services/adminService";
import { shiftService } from "@/services/shiftService";
import { attendanceService } from "@/services/attendanceService";
import { weeklyOffService } from "@/services/weeklyOffService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2, Calendar, Users, CheckCircle, XCircle, Clock, Plus, Trash2,
  PlayCircle, ToggleLeft, ToggleRight, Edit, ChevronLeft, ChevronRight,
  Download, X, RefreshCw, ChevronDown, UserPlus, FileText, PartyPopper,
  CalendarDays, Search, Menu, Filter, MoreVertical, Eye,
  UserCheck, Calculator, Printer,
  CalculatorIcon
} from "lucide-react";
import { toast } from "sonner";
import CustomModal from "@/components/ui/customModal";
import ViewAttendanceModal from "@/components/ViewAttendanceModal";
// Modals
import ManualAttendanceModal from "@/components/attendance/modals/ManualAttendanceModal";
import LeaveRequestModal from "@/components/attendance/modals/LeaveModal";
import ViewLeaveModal from "@/components/attendance/modals/ViewLeaveModal";
import HolidayModal from "@/components/attendance/modals/HolidayModal";
import WeeklyOffModal from "@/components/attendance/modals/WeeklyOffModal";
import AutoAttendanceModal from "@/components/attendance/modals/AutoAttendanceModal";
import ShiftAutoAttendanceModal from "@/components/attendance/modals/ShiftAutoAttendanceModal";
import EditAttendanceModal from "@/components/attendance/modals/EditAttendanceModal";
import PayrollPreviewModal from "@/components/attendance/modals/PayrollPreviewModal";
import { useAuth } from "@/context/AuthContext";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatToPakistaniDate, formatToPakistaniTime } from "@/utils/TimeFuntions";

export default function AdminAttendancePage() {
  const { hasPermission } = useAuth();

  // State variables
  const [attendance, setAttendance] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [weeklyOffs, setWeeklyOffs] = useState([]);
  const [agents, setAgents] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState({
    attendance: false,
    leave: false,
    manual: false,
    assign: false,
    holidays: false,
    weeklyOff: false,
    auto: false,
    edit: false,
    shiftAuto: false
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [agentSummaryStats, setAgentSummaryStats] = useState(null); // Store summary stats from backend
  const [filters, setFilters] = useState({
    userType: "all",
    status: "all",
    date: "",
    month: "",
    fromDate: "",
    toDate: ""
  });
  const [activeTab, setActiveTab] = useState("attendance");
  const [showFilters, setShowFilters] = useState(false);

  // Permission checks
  const canViewAttendance = hasPermission('attendance', 'view');
  const canCreateAttendance = hasPermission('attendance', 'create');
  const canEditAttendance = hasPermission('attendance', 'edit');
  const canDeleteAttendance = hasPermission('attendance', 'delete');
  const canViewLeave = hasPermission('leaveRequest', 'view');
  const canCreateLeave = hasPermission('leaveRequest', 'create');
  const canApproveLeave = hasPermission('leaveRequest', 'approve');
  const canViewHolidays = hasPermission('holiday', 'view');
  const canCreateHolidays = hasPermission('holiday', 'create');
  const canEditHolidays = hasPermission('holiday', 'edit');
  const canDeleteHolidays = hasPermission('holiday', 'delete');
  const canViewWeeklyOff = hasPermission('weeklyOff', 'view');
  const canCreateWeeklyOff = hasPermission('weeklyOff', 'create');
  const canEditWeeklyOff = hasPermission('weeklyOff', 'edit');
  const canDeleteWeeklyOff = hasPermission('weeklyOff', 'delete');

  // Modal states
  const [showManualModal, setShowManualModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [showWeeklyOffModal, setShowWeeklyOffModal] = useState(false);
  const [showAutoModal, setShowAutoModal] = useState(false);
  const [showShiftAutoModal, setShowShiftAutoModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showViewLeaveModal, setShowViewLeaveModal] = useState(false);
  const [payrollModalData, setPayrollModalData] = useState(null);
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [informedOverrides, setInformedOverrides] = useState({});
  const [salesCount, setSalesCount] = useState(0);
  const [editingAttendance, setEditingAttendance] = useState(null);
  const [viewingAttendance, setViewingAttendance] = useState(null);
  const [viewingLeave, setViewingLeave] = useState(null);

  const [manualForm, setManualForm] = useState({
    userType: "agent",
    userId: "",
    agentId: "",
    shiftId: "",
    date: new Date().toISOString().split('T')[0],
    status: "present",
    checkInTime: "",
    checkOutTime: "",
    notes: ""
  });

  const [leaveForm, setLeaveForm] = useState({
    userType: "agent",
    userId: "",
    agentId: "",
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    leaveType: "casual",
    reason: ""
  });

  const [holidayForm, setHolidayForm] = useState({
    name: "",
    date: new Date().toISOString().split('T')[0],
    description: "",
    isRecurring: false
  });

  const [weeklyOffForm, setWeeklyOffForm] = useState({
    day: "sunday",
    name: "Sunday",
    description: "Weekly off day"
  });

  const [autoForm, setAutoForm] = useState({
    date: new Date().toISOString().split('T')[0]
  });

  const [shiftAutoForm, setShiftAutoForm] = useState({
    date: new Date().toISOString().split('T')[0],
    userType: "agent"
  });

  // Fetch functions
  const fetchInitialData = async () => {
    try {
      const usersResponse = await adminService.getUsersAndAgents("all");
      if (usersResponse.success) {
        setAgents(usersResponse.data.agents || []);
      }
      const shiftsResponse = await shiftService.getShiftsForDropdown();
      setShifts(shiftsResponse);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      toast.error("Error loading data");
    }
  };

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, attendance: true }));
      const params = {
        page,
        limit,
        ...filters,
        search: searchQuery
      };
      if (filters.fromDate && filters.toDate) {
        params.startDate = filters.fromDate;
        params.endDate = filters.toDate;
        params.date = "";
        params.month = "";
      } else if (filters.month) {
        const [year, month] = filters.month.split('-');
        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(month), 0);
        params.startDate = startDate.toISOString().split('T')[0];
        params.endDate = endDate.toISOString().split('T')[0];
        params.date = "";
      } else if (filters.date) {
        params.date = filters.date;
      }
      if (filters.status === "all") {
        delete params.status;
      }
      const response = await adminService.getAllAttendance(params);
      if (response.success) {
        setAttendance(response.data || []);
        setTotal(response.meta?.total || response.data?.length || 0);
        // Store backend summary if available
        if (response.summary) {
          setAgentSummaryStats(response.summary);
        } else {
          setAgentSummaryStats(null);
        }
      } else {
        toast.error("Failed to load attendance");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error while fetching data");
    } finally {
      setLoading(prev => ({ ...prev, attendance: false }));
    }
  }, [page, limit, filters, searchQuery]);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(prev => ({ ...prev, leave: true }));
      const response = await attendanceService.getAllLeaveRequests("all");
      if (response.success) {
        setLeaveRequests(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      toast.error("Error loading leave requests");
    } finally {
      setLoading(prev => ({ ...prev, leave: false }));
    }
  };

  const fetchHolidays = async () => {
    try {
      setLoading(prev => ({ ...prev, holidays: true }));
      const response = await attendanceService.getHolidays();
      if (response.success) {
        setHolidays(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching holidays:", error);
      toast.error("Error loading holidays");
    } finally {
      setLoading(prev => ({ ...prev, holidays: false }));
    }
  };

  const fetchWeeklyOffs = async () => {
    try {
      setLoading(prev => ({ ...prev, weeklyOff: true }));
      const response = await weeklyOffService.getAll();
      if (response.success) {
        setWeeklyOffs(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching weekly offs:", error);
      toast.error("Error loading weekly offs");
    } finally {
      setLoading(prev => ({ ...prev, weeklyOff: false }));
    }
  };

  // Effects
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Auto-set fromDate and toDate when month is selected
  useEffect(() => {
    if (filters.month) {
      const [year, month] = filters.month.split('-');
      const yearNum = parseInt(year);
      const monthNum = parseInt(month);
      const startDateStr = `${yearNum}-${monthNum.toString().padStart(2, '0')}-01`;
      const lastDay = new Date(yearNum, monthNum, 0).getDate();
      const endDateStr = `${yearNum}-${monthNum.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
      setFilters(prev => ({
        ...prev,
        fromDate: startDateStr,
        toDate: endDateStr
      }));
    }
  }, [filters.month]);

  // Reset page to 1 when filters or search changes
  useEffect(() => {
    setPage(1);
  }, [filters.status, filters.userType, filters.date, filters.month, filters.fromDate, filters.toDate, searchQuery]);

  useEffect(() => {
    if (activeTab === "attendance") {
      fetchAttendance();
    } else if (activeTab === "holidays") {
      fetchHolidays();
    } else if (activeTab === "leave") {
      fetchLeaveRequests();
    } else if (activeTab === "weekly-off") {
      fetchWeeklyOffs();
    }
  }, [activeTab, page, limit, filters, searchQuery, fetchAttendance]);

  // Handler functions
  const handleManualAttendance = async (e) => {
    e.preventDefault();
    try {
      setLoading(prev => ({ ...prev, manual: true }));
      const submitData = { ...manualForm, shiftId: manualForm.shiftId || null };
      const response = await adminService.manualAttendance(submitData);
      if (response.success) {
        toast.success("Attendance updated successfully");
        setShowManualModal(false);
        setManualForm({
          userType: "agent",
          userId: "",
          agentId: "",
          shiftId: "",
          date: new Date().toISOString().split('T')[0],
          status: "present",
          checkInTime: "",
          checkOutTime: "",
          notes: ""
        });
        fetchAttendance();
      } else {
        toast.error(response.message || "Error updating attendance");
      }
    } catch (error) {
      console.error("Error submitting manual attendance:", error);
      toast.error("Error updating attendance");
    } finally {
      setLoading(prev => ({ ...prev, manual: false }));
    }
  };

  const handleAssignLeave = async (e) => {
    e.preventDefault();
    try {
      setLoading(prev => ({ ...prev, assign: true }));
      const response = await adminService.assignLeave(leaveForm);
      if (response.success) {
        toast.success("Leave assigned successfully");
        setShowLeaveModal(false);
        fetchAttendance();
      } else {
        toast.error(response.message || "Error assigning leave");
      }
    } catch (error) {
      console.error("Error assigning leave:", error);
      toast.error("Error assigning leave");
    } finally {
      setLoading(prev => ({ ...prev, assign: false }));
    }
  };

  const handleCreateHoliday = async (e) => {
    e.preventDefault();
    try {
      setLoading(prev => ({ ...prev, holidays: true }));
      const response = await attendanceService.createHoliday(holidayForm);
      if (response.success) {
        toast.success("Holiday created successfully");
        setShowHolidayModal(false);
        fetchHolidays();
        fetchAttendance();
      } else {
        toast.error(response.message || "Error creating holiday");
      }
    } catch (error) {
      console.error("Error creating holiday:", error);
      toast.error("Error creating holiday");
    } finally {
      setLoading(prev => ({ ...prev, holidays: false }));
    }
  };

  const handleCreateWeeklyOff = async (e) => {
    e.preventDefault();
    try {
      setLoading(prev => ({ ...prev, weeklyOff: true }));
      const response = await weeklyOffService.create(weeklyOffForm);
      if (response.success) {
        toast.success("Weekly off day added successfully");
        setShowWeeklyOffModal(false);
        fetchWeeklyOffs();
      } else {
        toast.error(response.message || "Error adding weekly off day");
      }
    } catch (error) {
      console.error("Error creating weekly off:", error);
      toast.error("Error creating weekly off");
    } finally {
      setLoading(prev => ({ ...prev, weeklyOff: false }));
    }
  };

  const handleToggleWeeklyOff = async (id, isActive) => {
    try {
      const response = await weeklyOffService.updateStatus(id, isActive);
      if (response.success) {
        toast.success(`Weekly off ${isActive ? 'activated' : 'deactivated'}`);
        fetchWeeklyOffs();
      } else {
        toast.error(response.message || "Error updating weekly off");
      }
    } catch (error) {
      console.error("Error updating weekly off:", error);
      toast.error("Error updating weekly off");
    }
  };

  const handleDeleteWeeklyOff = async (id) => {
    if (!confirm("Are you sure you want to delete this weekly off day?")) return;
    try {
      const response = await weeklyOffService.delete(id);
      if (response.success) {
        toast.success("Weekly off day deleted successfully");
        fetchWeeklyOffs();
      } else {
        toast.error(response.message || "Error deleting weekly off");
      }
    } catch (error) {
      console.error("Error deleting weekly off:", error);
      toast.error("Error deleting weekly off");
    }
  };

  const handleAutoAttendance = async (e) => {
    e.preventDefault();
    try {
      setLoading(prev => ({ ...prev, auto: true }));
      const response = await attendanceService.processAutoAttendance({ date: autoForm.date, userType: 'agent' });
      if (response.success) {
        toast.success(response.message || "Auto attendance processed successfully");
        setShowAutoModal(false);
        fetchAttendance();
      } else {
        toast.error(response.message || "Error processing auto attendance");
      }
    } catch (error) {
      console.error("Error processing auto attendance:", error);
      toast.error("Error processing auto attendance");
    } finally {
      setLoading(prev => ({ ...prev, auto: false }));
    }
  };

  const handleDeleteHoliday = async (holidayId) => {
    if (!confirm("Are you sure you want to delete this holiday?")) return;
    try {
      const response = await attendanceService.deleteHoliday(holidayId);
      if (response.success) {
        toast.success("Holiday deleted successfully");
        fetchHolidays();
        fetchAttendance();
      } else {
        toast.error(response.message || "Error deleting holiday");
      }
    } catch (error) {
      console.error("Error deleting holiday:", error);
      toast.error("Error deleting holiday");
    }
  };

  const handleLeaveAction = async (requestId, status, comments = "") => {
    try {
      const response = await attendanceService.updateLeaveRequest(requestId, { status, comments });
      if (response.success) {
        toast.success(`Leave request ${status}`);
        fetchLeaveRequests();
        fetchAttendance();
      } else {
        toast.error(response.message || "Error processing request");
      }
    } catch (error) {
      console.error("Error updating leave request:", error);
      toast.error("Error processing request");
    }
  };

  const handleViewAttendance = (attendance) => {
    setViewingAttendance(attendance);
    setShowViewModal(true);
  };

  const handleEditAttendance = (attendance) => {
    const formatDateOnly = (val) => {
      if (!val) return '';
      try {
        // Convert to Pakistani date
        const date = new Date(val);
        return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' }); // YYYY-MM-DD format
      } catch {
        return '';
      }
    };

    const formatTimeOnly = (val) => {
      if (!val) return '';
      try {
        const date = new Date(val);
        // Get time in Pakistani timezone
        const options = {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: 'Asia/Karachi'
        };

        // Convert to Pakistani time and format as HH:mm
        const timeString = date.toLocaleTimeString('en-GB', options);
        return timeString;
      } catch (error) {
        console.error("Error formatting time:", error, val);
        return '';
      }
    };

    setEditingAttendance(attendance);

    // Get date - prioritize attendance.date, then checkInTime
    let attendanceDate = '';
    if (attendance.date) {
      attendanceDate = formatDateOnly(attendance.date);
    } else if (attendance.checkInTime) {
      attendanceDate = formatDateOnly(attendance.checkInTime);
    } else {
      // Fallback to current date in Pakistani timezone
      const now = new Date();
      attendanceDate = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' });
    }

    setManualForm({
      userType: attendance.user ? "user" : "agent",
      userId: attendance.user?._id || "",
      agentId: attendance.agent?._id || "",
      shiftId: attendance.shift?._id || "",
      date: attendanceDate,
      status: attendance.status,
      checkInTime: formatTimeOnly(attendance.checkInTime),
      checkOutTime: formatTimeOnly(attendance.checkOutTime),
      notes: attendance.notes || ""
    });
    setShowEditModal(true);
  };

  const handleUpdateAttendance = async (e) => {
    e.preventDefault();
    try {
      setLoading(prev => ({ ...prev, edit: true }));

      // Detect if admin is manually setting status
      const originalStatus = editingAttendance?.status;
      const isManuallySettingStatus = manualForm.status !== originalStatus;

      // Prepare update data
      const updateData = {
        attendanceId: editingAttendance._id,
        // Only send status if admin manually changed it
        status: isManuallySettingStatus ? manualForm.status : null,
        checkInTime: manualForm.checkInTime || null,
        checkOutTime: manualForm.checkOutTime || null,
        shiftId: manualForm.shiftId || null,
        notes: manualForm.notes || ""
      };

      console.log("Sending update data:", updateData);
      console.log("Original status:", originalStatus);
      console.log("Manual status:", manualForm.status);
      console.log("Is manually setting status:", isManuallySettingStatus);

      const response = await adminService.updateAttendance(updateData);
      if (response.success) {
        toast.success("Attendance updated successfully");
        setShowEditModal(false);
        fetchAttendance();
      } else {
        toast.error(response.message || "Error updating attendance");
      }
    } catch (error) {
      console.error("Error updating attendance:", error);
      toast.error("Error updating attendance");
    } finally {
      setLoading(prev => ({ ...prev, edit: false }));
    }
  };

  const handleShiftAutoAttendance = async (e) => {
    e.preventDefault();
    try {
      setLoading(prev => ({ ...prev, shiftAuto: true }));
      const response = await attendanceService.processShiftAutoAttendance(shiftAutoForm.date, "agent");
      if (response.success) {
        toast.success(response.message || "Shift-based auto attendance processed successfully");
        setShowShiftAutoModal(false);
        fetchAttendance();
      } else {
        toast.error(response.message || "Error processing shift auto attendance");
      }
    } catch (error) {
      console.error("Error processing shift auto attendance:", error);
      toast.error("Error processing shift auto attendance");
    } finally {
      setLoading(prev => ({ ...prev, shiftAuto: false }));
    }
  };

  const handleDownloadAttendance = () => {
    const csvHeaders = ['Agent', 'Shift', 'Check In', 'Check Out', 'Status', 'Date'];
    const csvData = attendance.map(a => [
      a.user ? `${a.user.firstName} ${a.user.lastName}` : a.agent?.agentName || '—',
      a.shift?.name || '—',
      a.checkInTime ? formatToPakistaniTime(a.checkInTime) : '—',
      a.checkOutTime ? formatToPakistaniTime(a.checkOutTime) : '—',
      a.status,
      formatToPakistaniDate(a.createdAt)
    ]);
    const csvContent = [csvHeaders, ...csvData].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `attendance_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const canEditAttendanceRecord = (attendance) => {
    return !["holiday", "weekly_off"].includes(attendance.status) && !attendance.generated;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      present: "bg-green-100 text-green-700 border-green-200",
      late: "bg-orange-100 text-orange-700 border-orange-200",
      half_day: "bg-yellow-100 text-yellow-700 border-yellow-200",
      absent: "bg-red-100 text-red-700 border-red-200",
      early_checkout: "bg-pink-100 text-pink-700 border-pink-200",
      overtime: "bg-indigo-100 text-indigo-700 border-indigo-200",
      leave: "bg-amber-100 text-amber-700 border-amber-200",
      approved_leave: "bg-blue-100 text-blue-700 border-blue-200",
      pending_leave: "bg-slate-100 text-slate-700 border-slate-200",
      holiday: "bg-purple-100 text-purple-700 border-purple-200",
      weekly_off: "bg-gray-100 text-gray-700 border-gray-200"
    };
    return (
      <Badge variant="outline" className={`${statusConfig[status] || "bg-gray-100 text-gray-700 border-gray-200"} text-xs px-2 py-1`}>
        {status?.replace(/_/g, ' ')}
      </Badge>
    );
  };

  const getLeaveStatusBadge = (status) => {
    const statusConfig = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      approved: "bg-green-100 text-green-700 border-green-200",
      rejected: "bg-red-100 text-red-700 border-red-200"
    };
    return (
      <Badge variant="outline" className={`${statusConfig[status] || "bg-gray-100 text-gray-700 border-gray-200"} text-xs px-2 py-1`}>
        {status}
      </Badge>
    );
  };

  // ✅ Custom Responsive Table Component
  const ResponsiveTable = ({
    data,
    columns,
    loading,
    emptyMessage = "No data found",
    className = ""
  }) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };

      checkMobile();
      window.addEventListener('resize', checkMobile);

      return () => window.removeEventListener('resize', checkMobile);
    }, []);

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
                          {item.shift?.name || "No shift"} • {formatToPakistaniDate(item.createdAt)}
                        </div>
                      </div>
                      {getStatusBadge(item.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Check In:</span>
                        <div className="font-medium">
                          {item.checkInTime ? formatToPakistaniTime(item.checkInTime) : "—"}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Check Out:</span>
                        <div className="font-medium">
                          {item.checkOutTime ? formatToPakistaniTime(item.checkOutTime) : "—"}
                        </div>
                      </div>
                    </div>

                    {canEditAttendance && (
                      <div className="flex justify-end pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAttendance(item)}
                          disabled={!canEditAttendanceRecord(item)}
                          className="text-xs"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
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
  };

  // ✅ Stats Cards Component
  const StatsCards = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 640);
      };

      checkMobile();
      window.addEventListener('resize', checkMobile);

      return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (isMobile) {
      return (
        <div className="space-y-3 mb-6">
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="p-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-medium text-blue-800">Total</CardTitle>
                  <Calendar className="h-3 w-3 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="text-lg font-bold text-blue-700">{total}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader className="p-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-medium text-green-800">Present</CardTitle>
                  <CheckCircle className="h-3 w-3 text-green-600" />
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="text-lg font-bold text-green-700">
                  {attendance.filter(a => a.status === 'present').length}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardHeader className="p-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-medium text-red-800">Absent</CardTitle>
                  <XCircle className="h-3 w-3 text-red-600" />
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="text-lg font-bold text-red-700">
                  {attendance.filter(a => a.status === 'absent').length}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <CardHeader className="p-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-medium text-yellow-800">Leave/Off</CardTitle>
                  <Clock className="h-3 w-3 text-yellow-600" />
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="text-lg font-bold text-yellow-700">
                  {attendance.filter(a =>
                    a.status.includes('leave') ||
                    a.status === 'holiday' ||
                    a.status === 'weekly_off'
                  ).length}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-sm font-medium text-blue-800">Total Records</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-blue-700">{total}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-sm font-medium text-green-800">Present Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-green-700">
              {attendance.filter(a => a.status === 'present').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-sm font-medium text-red-800">Absent Today</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-red-700">
              {attendance.filter(a => a.status === 'absent').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-sm font-medium text-yellow-800">On Leave/Off</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-yellow-700">
              {attendance.filter(a =>
                a.status.includes('leave') ||
                a.status === 'holiday' ||
                a.status === 'weekly_off'
              ).length}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // ✅ Agent Summary Cards (Filtered Search Results)
  const AgentSummaryCards = () => {
    // Only show if searching and we have data or backend summary
    if (!searchQuery || (!attendance.length && !agentSummaryStats)) return null;

    // Use name from first record if available (for header)
    const agentName = attendance[0]?.user 
      ? `${attendance[0].user.firstName} ${attendance[0].user.lastName}` 
      : attendance[0]?.agent?.agentName || "Agent";
      
    // Use Backend Stats if available (More accurate for full month/history), otherwise fallback to frontend calc
    const stats = agentSummaryStats ? {
       total: agentSummaryStats.total,
       present: agentSummaryStats.present,
       late: agentSummaryStats.late,
       halfDay: agentSummaryStats.half_day,
       absent: agentSummaryStats.absent,
       earlyCheckout: agentSummaryStats.early_checkout,
       overtime: agentSummaryStats.overtime,
       leave: agentSummaryStats.leave, // generic leave logic might need split
       approvedLeave: agentSummaryStats.approved_leave,
       pendingLeave: agentSummaryStats.pending_leave,
       holiday: agentSummaryStats.holiday,
       weeklyOff: agentSummaryStats.weekly_off,
    } : {
       // Fallback to frontend calculation (only for current page if not paginated fully)
       total: attendance.length,
       present: attendance.filter(a => a.status === 'present').length,
       late: attendance.filter(a => a.status === 'late').length,
       halfDay: attendance.filter(a => a.status === 'half_day').length,
       absent: attendance.filter(a => a.status === 'absent').length,
       earlyCheckout: attendance.filter(a => a.status === 'early_checkout').length,
       overtime: attendance.filter(a => a.status === 'overtime').length,
       leave: attendance.filter(a => a.status === 'leave').length,
       approvedLeave: attendance.filter(a => a.status === 'approved_leave').length,
       pendingLeave: attendance.filter(a => a.status === 'pending_leave').length,
       holiday: attendance.filter(a => a.status === 'holiday').length,
       weeklyOff: attendance.filter(a => a.status === 'weekly_off').length,
    };

    // Calculate derived stats
    // All Present = present + late + half_day + early_checkout + overtime (excluding absent, leave, approved_leave)
    const allPresent = stats.present + stats.late + stats.halfDay + stats.earlyCheckout + stats.overtime;
    
    // Total Working Days = Total - (holiday + weekly_off)
    const totalWorkingDays = stats.total - stats.holiday - stats.weeklyOff;

    return (
      <div className="mb-6 space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
          <UserCheck className="h-5 w-5 text-blue-600" />
          Summary for {agentName}
        </h3>
        
        {/* Main Summary Cards - Highlighted */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* All Present */}
          <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-sm font-semibold text-white/90 uppercase tracking-wide mb-2">All Present Days</div>
              <div className="text-4xl font-bold text-white">{allPresent}</div>
              <div className="text-xs text-white/80 mt-1">Present, Late, Half Day, Early Out, Overtime</div>
            </CardContent>
          </Card>

          {/* Total Working Days */}
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-sm font-semibold text-white/90 uppercase tracking-wide mb-2">Total Working Days</div>
              <div className="text-4xl font-bold text-white">{totalWorkingDays}</div>
              <div className="text-xs text-white/80 mt-1">Excluding Holidays & Weekly Offs</div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
             {/* Present */}
             <Card className="bg-green-50 border-green-200 shadow-sm">
                <CardContent className="p-3 text-center">
                   <div className="text-xs font-medium text-green-800 uppercase tracking-wide mb-1">Present</div>
                   <div className="text-xl font-bold text-green-700">{stats.present}</div>
                </CardContent>
             </Card>

             {/* Late */}
             <Card className="bg-orange-50 border-orange-200 shadow-sm">
                <CardContent className="p-3 text-center">
                   <div className="text-xs font-medium text-orange-800 uppercase tracking-wide mb-1">Late</div>
                   <div className="text-xl font-bold text-orange-700">{stats.late}</div>
                </CardContent>
             </Card>
             
             {/* Half Day */}
             <Card className="bg-yellow-50 border-yellow-200 shadow-sm">
                <CardContent className="p-3 text-center">
                   <div className="text-xs font-medium text-yellow-800 uppercase tracking-wide mb-1">Half Day</div>
                   <div className="text-xl font-bold text-yellow-700">{stats.halfDay}</div>
                </CardContent>
             </Card>

             {/* Absent */}
             <Card className="bg-red-50 border-red-200 shadow-sm">
                <CardContent className="p-3 text-center">
                   <div className="text-xs font-medium text-red-800 uppercase tracking-wide mb-1">Absent</div>
                   <div className="text-xl font-bold text-red-700">{stats.absent}</div>
                </CardContent>
             </Card>

             {/* Early Checkout */}
             <Card className="bg-pink-50 border-pink-200 shadow-sm">
                <CardContent className="p-3 text-center">
                   <div className="text-xs font-medium text-pink-800 uppercase tracking-wide mb-1">Early Out</div>
                   <div className="text-xl font-bold text-pink-700">{stats.earlyCheckout}</div>
                </CardContent>
             </Card>

             {/* Overtime */}
             <Card className="bg-indigo-50 border-indigo-200 shadow-sm">
                <CardContent className="p-3 text-center">
                   <div className="text-xs font-medium text-indigo-800 uppercase tracking-wide mb-1">Overtime</div>
                   <div className="text-xl font-bold text-indigo-700">{stats.overtime}</div>
                </CardContent>
             </Card>

             {/* Leave */}
             <Card className="bg-amber-50 border-amber-200 shadow-sm">
                <CardContent className="p-3 text-center">
                   <div className="text-xs font-medium text-amber-800 uppercase tracking-wide mb-1">Leave</div>
                   <div className="text-xl font-bold text-amber-700">{stats.leave}</div>
                </CardContent>
             </Card>

             {/* Approved Leave */}
             <Card className="bg-blue-50 border-blue-200 shadow-sm">
                <CardContent className="p-3 text-center">
                   <div className="text-xs font-medium text-blue-800 uppercase tracking-wide mb-1">Approved</div>
                   <div className="text-xl font-bold text-blue-700">{stats.approvedLeave}</div>
                </CardContent>
             </Card>

             {/* Pending Leave */}
             <Card className="bg-slate-50 border-slate-200 shadow-sm">
                <CardContent className="p-3 text-center">
                   <div className="text-xs font-medium text-slate-800 uppercase tracking-wide mb-1">Pending</div>
                   <div className="text-xl font-bold text-slate-700">{stats.pendingLeave}</div>
                </CardContent>
             </Card>

             {/* Holiday */}
             <Card className="bg-purple-50 border-purple-200 shadow-sm">
                <CardContent className="p-3 text-center">
                   <div className="text-xs font-medium text-purple-800 uppercase tracking-wide mb-1">Holiday</div>
                   <div className="text-xl font-bold text-purple-700">{stats.holiday}</div>
                </CardContent>
             </Card>

             {/* Weekly Off */}
             <Card className="bg-gray-50 border-gray-200 shadow-sm">
                <CardContent className="p-3 text-center">
                   <div className="text-xs font-medium text-gray-800 uppercase tracking-wide mb-1">Weekly Off</div>
                   <div className="text-xl font-bold text-gray-700">{stats.weeklyOff}</div>
                </CardContent>
             </Card>
        </div>
      </div>
    );
  };

  const handleLeaveReasonChange = (e) => {
    const value = e.target.value;
    setLeaveForm(prev => ({
      ...prev,
      reason: value
    }));
  };

  // ✅ Attendance Table Columns (Desktop)
  const attendanceColumns = [
    {
      label: "Agent",
      minWidth: "180px",
      render: (a) => (
        <div>
          <div className="font-medium">
            {a.user
              ? `${a.user?.firstName || ""} ${a.user?.lastName || ""}`
              : a.agent?.agentName || "—"}
          </div>
          <div className="text-xs text-muted-foreground">
            {a.user ? "User" : "Agent"} • {a.user ? a.user.agentId : a.agent?.email || ""}
          </div>
        </div>
      ),
    },
    {
      label: "Shift",
      minWidth: "120px",
      render: (a) => a.shift?.name || "—"
    },
    {
      label: "Check In",
      minWidth: "100px",
      render: (a) => (a.checkInTime ? formatToPakistaniTime(a.checkInTime) : "—")
    },
    {
      label: "Check Out",
      minWidth: "100px",
      render: (a) => (a.checkOutTime ? formatToPakistaniTime(a.checkOutTime) : "—")
    },
    {
      label: "Status",
      minWidth: "100px",
      render: (a) => getStatusBadge(a.status)
    },
    {
      label: "Date",
      minWidth: "120px",
      render: (a) => formatToPakistaniDate(a.createdAt)
    },
  ...(canEditAttendance ? [{
      label: "Actions",
      minWidth: "150px",
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditAttendance(a)}
            disabled={!canEditAttendanceRecord(a)}
            title={
              !canEditAttendanceRecord(a)
                ? "Cannot edit holiday/weekly off records"
                : "Edit attendance"
            }
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
    }] : [{
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
    }]),
  ];

  // ✅ Leave Requests Table Columns
  const leaveColumns = [
    {
      label: "Agent",
      minWidth: "200px",
      render: (r) => (
        <div>
          <div className="font-medium">{r.user ? `${r.user?.firstName || ''} ${r.user?.lastName || ''}` : r.agent?.agentName || '—'}</div>
          <div className="text-xs text-muted-foreground">{r.user ? r.user.email : r.agent?.email}</div>
        </div>
      )
    },
    {
      label: "Leave Type",
      minWidth: "100px",
      render: (r) => <span className="capitalize">{r.leaveType}</span>
    },
    {
      label: "Period",
      minWidth: "150px",
      render: (r) => (
        <div>
          <div className="text-sm">{formatToPakistaniDate(r.startDate)}</div>
          <div className="text-xs text-muted-foreground">to</div>
          <div className="text-sm">{formatToPakistaniDate(r.endDate)}</div>
        </div>
      )
    },
    {
      label: "Reason",
      minWidth: "150px",
      render: (r) => (
        <div className="max-w-[200px] truncate" title={r.reason}>
          {r.reason}
        </div>
      )
    },
    {
      label: "Status",
      minWidth: "100px",
      render: (r) => getLeaveStatusBadge(r.status)
    },
    ...(canApproveLeave ? [{
      label: "Actions",
      minWidth: "200px",
      render: (r) => (
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setViewingLeave(r);
              setShowViewLeaveModal(true);
            }}
            title="View leave details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {r.status === 'pending' ? (
            <>
              <Button size="sm" onClick={() => handleLeaveAction(r._id, 'approved')}>
                Approve
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleLeaveAction(r._id, 'rejected')}>
                Reject
              </Button>
            </>
          ) : (
            <span className="text-sm text-muted-foreground italic">
              {r.status === 'approved' ? 'Approved' :
                r.status === 'rejected' ? 'Rejected' : 'Processed'}
            </span>
          )}
        </div>
      )
    }] : [{
      label: "Actions",
      minWidth: "100px",
      render: (r) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setViewingLeave(r);
            setShowViewLeaveModal(true);
          }}
          title="View leave details"
        >
          <Eye className="h-4 w-4" />
        </Button>
      )
    }]),
  ];

  // ✅ Holidays Table Columns
  const holidayColumns = [
    {
      label: "Name",
      minWidth: "150px",
      render: (h) => <div className="font-medium">{h.name}</div>
    },
    {
      label: "Date",
      minWidth: "120px",
      render: (h) => formatToPakistaniDate(h.date)
    },
    {
      label: "Description",
      minWidth: "200px",
      render: (h) => (
        <div className="max-w-[250px] truncate" title={h.description}>
          {h.description || '—'}
        </div>
      )
    },
    {
      label: "Recurring",
      minWidth: "100px",
      render: (h) => (
        <Badge variant={h.isRecurring ? 'default' : 'secondary'}>
          {h.isRecurring ? 'Yes' : 'No'}
        </Badge>
      )
    },
    ...(canDeleteHolidays ? [{
      label: "Actions",
      minWidth: "100px",
      render: (h) => (
        <Button variant="destructive" size="sm" onClick={() => handleDeleteHoliday(h._id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      )
    }] : []),
  ];

  // ✅ Weekly Offs Table Columns
  const weeklyOffColumns = [
    {
      label: "Day",
      minWidth: "120px",
      render: (w) => <div className="font-medium capitalize">{w.day}</div>
    },
    {
      label: "Name",
      minWidth: "150px",
      render: (w) => w.name
    },
    {
      label: "Description",
      minWidth: "200px",
      render: (w) => (
        <div className="max-w-[250px] truncate" title={w.description}>
          {w.description || '—'}
        </div>
      )
    },
    {
      label: "Status",
      minWidth: "100px",
      render: (w) => (
        <Badge variant={w.isActive ? 'default' : 'secondary'}>
          {w.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    ...((canEditWeeklyOff || canDeleteWeeklyOff) ? [{
      label: "Actions",
      minWidth: "150px",
      render: (w) => (
        <div className="flex gap-2">
          {canEditWeeklyOff && (
            <Button
              variant={w.isActive ? "outline" : "default"}
              size="sm"
              onClick={() => handleToggleWeeklyOff(w._id, !w.isActive)}
            >
              {w.isActive ? <ToggleLeft className="h-4 w-4 mr-1" /> : <ToggleRight className="h-4 w-4 mr-1" />}
              {w.isActive ? "Deactivate" : "Activate"}
            </Button>
          )}
          {canDeleteWeeklyOff && (
            <Button variant="destructive" size="sm" onClick={() => handleDeleteWeeklyOff(w._id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )
    }] : []),
  ];

  // ✅ Pagination Component
  const CustomPagination = () => {
    const totalPages = Math.ceil(total / limit);

    if (totalPages <= 1) return null;

    return (
      <Pagination className="mt-6">
        <PaginationContent className="flex-wrap">
          <PaginationItem>
            <PaginationPrevious
              onClick={() => page > 1 && setPage(page - 1)}
              className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (page <= 3) {
              pageNum = i + 1;
            } else if (page >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = page - 2 + i;
            }
            return (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  onClick={() => setPage(pageNum)}
                  isActive={page === pageNum}
                  className="cursor-pointer"
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          <PaginationItem>
            <PaginationNext
              onClick={() => page < totalPages && setPage(page + 1)}
              className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>

          <PaginationItem className="ml-2 sm:ml-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">Rows:</span>
              <Select value={limit.toString()} onValueChange={(value) => { setLimit(Number(value)); setPage(1); }}>
                <SelectTrigger className="h-8 w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </PaginationItem>

          <PaginationItem className="ml-2 sm:ml-4">
            <div className="text-sm text-muted-foreground hidden md:inline">
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total}
            </div>
            <div className="text-sm text-muted-foreground md:hidden">
              {page}/{totalPages}
            </div>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  // Mobile Header Actions Dropdown
  const MobileHeaderActions = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="md:hidden">
          <Menu className="h-4 w-4" />
          <span className="ml-2">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {canCreateLeave && (
          <DropdownMenuItem onClick={() => setShowLeaveModal(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Assign Leave
          </DropdownMenuItem>
        )}
        {canCreateAttendance && (
          <DropdownMenuItem onClick={() => setShowManualModal(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Manual Entry
          </DropdownMenuItem>
        )}
        {canCreateAttendance && (
          <DropdownMenuItem onClick={() => setShowAutoModal(true)}>
            <PlayCircle className="h-4 w-4 mr-2" />
            Auto Attendance
          </DropdownMenuItem>
        )}
        {canCreateAttendance && (
          <DropdownMenuItem onClick={() => setShowShiftAutoModal(true)}>
            <Clock className="h-4 w-4 mr-2" />
            Shift Wise
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => fetchAttendance()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Logic to Calculate
  const handleCalculatePayroll = async (overrideValue, overrideId) => {
      // If triggered by checkbox, update local state map first (optimistic) purely for display? 
      // Actually we need to pass the *new* state to API.
      // Since setState is async, we construct the new object here.
      let currentOverrides = { ...informedOverrides };
      if (overrideId) {
          currentOverrides[overrideId] = overrideValue;
      }

      if (!filters.month || !attendance.length) {
          toast.error("Please filter by Month and ensure data exists.");
          return;
      }
      
      // We need agent Id. Find first record with agent details.
      const agentRecord = attendance.find(a => a?.agent?._id || a?.agent?.id);
      const agentId = agentRecord?.agent?._id || agentRecord?.agent?.id;

      if (!agentId) {
          // Check if user is trying to calculate for a 'User' type (not supported by API yet)
          const isUser = attendance.some(a => a?.user);
          if (isUser) {
             toast.error("Payroll calculation is currently only supported for Agents.");
             return;
          }

          toast.error("Please search for a specific agent first.");
          return;
      }

      const [year, month] = filters.month.split("-");

      try {
          setLoading(prev => ({ ...prev, payroll: true })); // Reuse or new loader
          const res = await fetch('/api/payroll', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  action: 'calculate',
                  agentId,
                  month: parseInt(month),
                  year: parseInt(year),
                  informedOverrides: currentOverrides,
                  salesCount: salesCount // Include Sales Count
              })
          });
          const data = await res.json();
          if (data.success) {
              setPayrollModalData(data.data);
              setShowPayrollModal(true);
          } else {
              toast.error(data.message);
          }
      } catch (error) {
          console.error(error);
          toast.error("Calculation failed");
      } finally {
          setLoading(prev => ({ ...prev, payroll: false }));
      }
  };

  const handleGeneratePayroll = async () => {
      const agentId = attendance[0]?.agent?._id || attendance[0]?.agent?.id;
      const [year, month] = filters.month.split("-");

      try {
          setLoading(prev => ({ ...prev, payroll: true }));
          const res = await fetch('/api/payroll', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  action: 'generate',
                  agentId,
                  month: parseInt(month),
                  year: parseInt(year),
                  informedOverrides, // Use state
                  salesCount: salesCount // Include Sales Count
              })
          });
          const data = await res.json();
          if (data.success) {
              toast.success("Payroll Generated Successfully!");
              setShowPayrollModal(false);
          } else {
              toast.error(data.message);
          }
      } catch (error) {
           toast.error("Generation failed");
      } finally {
          setLoading(prev => ({ ...prev, payroll: false }));
      }
  };

  // Main Render
  return (
    <div className="min-h-screen bg-gray-50/30 overflow-x-hidden">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6">
        {/* All Modals */}
        <ManualAttendanceModal 
          isOpen={showManualModal}
          onClose={() => setShowManualModal(false)}
          manualForm={manualForm}
          setManualForm={setManualForm}
          agents={agents}
          shifts={shifts}
          loading={loading.manual}
          onSubmit={handleManualAttendance}
        />
        <LeaveRequestModal 
          isOpen={showLeaveModal}
          onClose={() => setShowLeaveModal(false)}
          leaveForm={leaveForm}
          setLeaveForm={setLeaveForm}
          agents={agents}
          loading={loading.assign}
          onSubmit={handleAssignLeave}
        />
        <ViewLeaveModal
          isOpen={showViewLeaveModal}
          onClose={() => setShowViewLeaveModal(false)}
          viewingLeave={viewingLeave}
          canApproveLeave={true}
          onApprove={() => viewingLeave && handleLeaveAction(viewingLeave._id, 'approved')}
          onReject={() => viewingLeave && handleLeaveAction(viewingLeave._id, 'rejected')}
        />
        <HolidayModal
          isOpen={showHolidayModal}
          onClose={() => setShowHolidayModal(false)}
          holidayForm={holidayForm}
          setHolidayForm={setHolidayForm}
          loading={loading.holidays}
          onSubmit={handleCreateHoliday}
        />
        <WeeklyOffModal
          isOpen={showWeeklyOffModal}
          onClose={() => setShowWeeklyOffModal(false)}
          weeklyOffForm={weeklyOffForm}
          setWeeklyOffForm={setWeeklyOffForm}
          agents={agents}
          loading={loading.weeklyOff}
          onSubmit={handleCreateWeeklyOff}
        />
        <AutoAttendanceModal 
          isOpen={showAutoModal}
          onClose={() => setShowAutoModal(false)}
          autoForm={autoForm}
          setAutoForm={setAutoForm}
          loading={loading.auto}
          onSubmit={handleAutoAttendance}
        />
        <ShiftAutoAttendanceModal 
          isOpen={showShiftAutoModal}
          onClose={() => setShowShiftAutoModal(false)}
          shiftAutoForm={shiftAutoForm}
          setShiftAutoForm={setShiftAutoForm}
          loading={loading.shiftAuto}
          onSubmit={handleShiftAutoAttendance}
        />
        <EditAttendanceModal 
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          editForm={manualForm}
          setEditForm={setManualForm}
          shifts={shifts}
          loading={loading.edit}
          onSubmit={handleUpdateAttendance}
        />
        <PayrollPreviewModal 
          isOpen={showPayrollModal}
          onClose={() => setShowPayrollModal(false)}
          data={payrollModalData}
          month={filters.month}
          salesCount={salesCount}
          onSalesCountChange={setSalesCount}
          onApplySalesCount={() => handleCalculatePayroll()}
          informedOverrides={informedOverrides}
          onInformedOverrideChange={(id, val) => {
             setInformedOverrides(prev => ({ ...prev, [id]: val }));
             handleCalculatePayroll(val, id);
          }}
          loading={loading.payroll}
          onGenerate={handleGeneratePayroll}
        />
        <ViewAttendanceModal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          attendance={viewingAttendance}
          getStatusBadge={getStatusBadge}
        />

        {/* Header - Fully Responsive */}
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
                Admin Attendance
              </h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
                Manage attendance records, leave requests, and holidays
              </p>
            </div>

            {/* Mobile Actions Dropdown */}
            <div className="block md:hidden self-center">
              <MobileHeaderActions />
            </div>

            {/* Desktop Actions Buttons */}
            <div className="hidden md:flex flex-wrap items-center justify-end gap-2 sm:gap-3">
              {canCreateLeave && (
                <Button
                  onClick={() => setShowLeaveModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white text-sm"
                  size="sm"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign Leave
                </Button>
              )}
              {canCreateAttendance && (
                <Button
                  onClick={() => setShowManualModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                  size="sm"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Manual Entry
                </Button>
              )}
              {/* {canCreateAttendance && (
                <Button
                  onClick={() => setShowAutoModal(true)}
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50 text-sm"
                  size="sm"
                >
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Auto
                </Button>
              )} */}
              {canCreateAttendance && (
                <Button
                  onClick={() => setShowShiftAutoModal(true)}
                  variant="outline"
                  className="border-purple-600 text-purple-600 hover:bg-purple-50 text-sm"
                  size="sm"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Shift Wise
                </Button>
              )}
              <Button
                onClick={() => handleDownloadAttendance()}
                variant="outline"
                size="sm"
                className="text-sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Download CSV
              </Button>
              <Button
                onClick={() => fetchAttendance()}
                variant="outline"
                size="sm"
                className="text-sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <StatsCards />

          {/* Individual Agent Summary Cards - Only visible when searching */}
          <AgentSummaryCards />
        </div>

        {/* Tabs - Responsive */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-muted/50 rounded-md w-full">
            {canViewAttendance && (
              <TabsTrigger
                value="attendance"
                className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm"
              >
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Attendance</span>
              </TabsTrigger>
            )}
            {canViewLeave && (
              <TabsTrigger
                value="leave"
                className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm relative"
              >
                <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Leave</span>
                {leaveRequests.filter(r => r.status === "pending").length > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 p-0 text-[10px] sm:text-xs flex items-center justify-center"
                  >
                    {leaveRequests.filter(r => r.status === "pending").length}
                  </Badge>
                )}
              </TabsTrigger>
            )}
            {canViewHolidays && (
              <TabsTrigger
                value="holidays"
                className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm"
              >
                <PartyPopper className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Holidays</span>
              </TabsTrigger>
            )}
            {canViewWeeklyOff && (
              <TabsTrigger
                value="weekly-off"
                className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm"
              >
                <CalendarDays className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Weekly Off</span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* Attendance Tab */}
          {canViewAttendance && (
            <TabsContent value="attendance" className="space-y-4">
              <Card className="shadow-sm overflow-hidden">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg sm:text-xl">Attendance Records</CardTitle>
                        <CardDescription className="text-sm sm:text-base">
                          View and manage all attendance records
                        </CardDescription>
                      </div>

                      {/* Mobile Filter Toggle */}
                      <div className="block sm:hidden">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowFilters(!showFilters)}
                          className="w-full"
                        >
                          <Filter className="h-4 w-4 mr-2" />
                          {showFilters ? 'Hide Filters' : 'Show Filters'}
                        </Button>
                      </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-full"
                      />
                    </div>

                    {/* Filters - Responsive */}
                    <div className={`${showFilters ? 'block' : 'hidden'} sm:block`}>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="grid grid-cols-2 sm:flex gap-2 w-full">
                          <Select
                            value={filters.userType}
                            onValueChange={(value) => setFilters(prev => ({ ...prev, userType: value }))}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="User Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Users</SelectItem>
                              <SelectItem value="agent">Agents</SelectItem>
                              <SelectItem value="user">Users</SelectItem>
                            </SelectContent>
                          </Select>

                          <Select
                            value={filters.status}
                            onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Status</SelectItem>
                              <SelectItem value="present">Present</SelectItem>
                              <SelectItem value="late">Late</SelectItem>
                              <SelectItem value="half_day">Half Day</SelectItem>
                              <SelectItem value="absent">Absent</SelectItem>
                              <SelectItem value="early_checkout">Early Checkout</SelectItem>
                              <SelectItem value="overtime">Overtime</SelectItem>
                              <SelectItem value="leave">Leave</SelectItem>
                              <SelectItem value="approved_leave">Approved Leave</SelectItem>
                              <SelectItem value="pending_leave">Pending Leave</SelectItem>
                              <SelectItem value="holiday">Holiday</SelectItem>
                              <SelectItem value="weekly_off">Weekly Off</SelectItem>
                            </SelectContent>
                          </Select>

                          <Select
                            value={filters.month}
                            onValueChange={(value) => setFilters(prev => ({ ...prev, month: value }))}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Month" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 12 }, (_, i) => {
                                const date = new Date();
                                date.setMonth(date.getMonth() - i);
                                const value = date.toISOString().slice(0, 7); // YYYY-MM
                                const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
                                return <SelectItem key={value} value={value}>{label}</SelectItem>;
                              })}
                            </SelectContent>
                          </Select>

                          <div className="grid grid-cols-1 gap-2 sm:flex sm:gap-2">
                            <div className="flex flex-col gap-1">
                              <label className="text-xs text-muted-foreground">From Date</label>
                              <Input
                                type="date"
                                value={filters.fromDate || ''}
                                onChange={(e) => setFilters(prev => ({ ...prev, fromDate: e.target.value }))}
                                className="border rounded px-3 py-2 text-sm w-full"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-xs text-muted-foreground">To Date</label>
                              <Input
                                type="date"
                                value={filters.toDate || ''}
                                onChange={(e) => setFilters(prev => ({ ...prev, toDate: e.target.value }))}
                                className="border rounded px-3 py-2 text-sm w-full"
                              />
                            </div>
                          </div>
                        </div>

                        {filters.month && searchQuery && attendance.length > 0 && attendance[0]?.agent && (
                          <Button
                            onClick={() => handleCalculatePayroll()}
                            size="sm"
                            className="h-10 w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white"
                          >
                            <CalculatorIcon className="h-4 w-4 mr-2" />
                            Calculate Salary
                          </Button>
                        )}

                        {(filters.status !== 'all' || filters.date || filters.month || filters.fromDate || filters.toDate || searchQuery) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setFilters({ userType: "all", status: "all", date: "", month: "", fromDate: "", toDate: "" });
                              setSearchQuery("");
                              setShowFilters(false);
                            }}
                            className="h-10 w-full sm:w-auto"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Clear Filters
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="rounded-md overflow-hidden">
                    <ResponsiveTable
                      data={attendance}
                      columns={attendanceColumns}
                      loading={loading.attendance}
                      emptyMessage="No attendance records found"
                    />
                  </div>
                  <CustomPagination />
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Leave Tab */}
          {canViewLeave && (
            <TabsContent value="leave">
              <Card className="shadow-sm overflow-hidden">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg sm:text-xl">Leave Requests</CardTitle>
                      <CardDescription className="text-sm sm:text-base">
                        Review and manage all leave requests
                      </CardDescription>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Pending: {leaveRequests.filter(r => r.status === "pending").length}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="rounded-md border overflow-hidden">
                    <ResponsiveTable
                      data={leaveRequests}
                      columns={leaveColumns}
                      loading={loading.leave}
                      emptyMessage="No leave requests found"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Holidays Tab */}
          {canViewHolidays && (
            <TabsContent value="holidays">
              <Card className="shadow-sm overflow-hidden">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6">
                  <div>
                    <CardTitle className="text-lg sm:text-xl">Holidays Management</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      Manage system holidays
                    </CardDescription>
                  </div>
                  {canCreateHolidays && (
                    <Button onClick={() => setShowHolidayModal(true)} className="w-full sm:w-auto">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Holiday
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  {loading.holidays ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                      <span className="ml-2">Loading holidays...</span>
                    </div>
                  ) : holidays.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <PartyPopper className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No holidays found</h3>
                      <p className="text-gray-500">Add your first holiday to get started</p>
                    </div>
                  ) : (
                    <div className="rounded-md border overflow-hidden">
                      <ResponsiveTable
                        data={holidays}
                        columns={holidayColumns}
                        loading={false}
                        emptyMessage="No holidays found"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Weekly Off Tab */}
          {canViewWeeklyOff && (
            <TabsContent value="weekly-off">
              <Card className="shadow-sm overflow-hidden">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6">
                  <div>
                    <CardTitle className="text-lg sm:text-xl">Weekly Off Days</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      Manage weekly off days
                    </CardDescription>
                  </div>
                  {canCreateWeeklyOff && (
                    <Button onClick={() => setShowWeeklyOffModal(true)} className="w-full sm:w-auto">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Weekly Off
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  {loading.weeklyOff ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                      <span className="ml-2">Loading weekly off days...</span>
                    </div>
                  ) : weeklyOffs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No weekly off days configured</h3>
                      <p className="text-gray-500">Add Sunday, Friday, or other weekly off days</p>
                    </div>
                  ) : (
                    <div className="rounded-md border overflow-hidden">
                      <ResponsiveTable
                        data={weeklyOffs}
                        columns={weeklyOffColumns}
                        loading={false}
                        emptyMessage="No weekly off days found"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}