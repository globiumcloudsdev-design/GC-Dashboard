// src/app/(dashboard)/dashboard/notifications/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { notificationService } from "@/services/notificationService";
import { agentService } from "@/services/agentService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  Bell,
  Search,
  Users,
  User as UserIcon,
  Info,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Megaphone,
  Eye,
  EyeOff,
  UserCheck,
  Clock,
  ShieldCheck,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationsAdminPage() {
  const { user, hasPermission } = useAuth();

  const canView = hasPermission?.("notification", "view");
  const canCreate = hasPermission?.("notification", "create");
  const canEdit = hasPermission?.("notification", "edit");
  const canDelete = hasPermission?.("notification", "delete");

  // States
  const [notifications, setNotifications] = useState([]);
  const [agents, setAgents] = useState([]);
  const [viewAgent, setViewAgent] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);

  // Read Tracker Modal States
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [trackerLoading, setTrackerLoading] = useState(false);
  const [trackerData, setTrackerData] = useState(null);
  const [trackerSearch, setTrackerSearch] = useState("");

  // Form States
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    targetType: "all",
    targetUsers: "",
    type: "announcement",
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    if (canView) {
      fetchNotifications(currentPage, searchTerm);
      fetchAgents();
    }
  }, [canView, currentPage, viewAgent]);

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (canView) {
        setCurrentPage(1);
        fetchNotifications(1, searchTerm);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchNotifications = async (page = 1, search = "") => {
    setLoading(true);
    const result = await notificationService.getAllNotifications(
      true,
      page,
      itemsPerPage,
      search,
    );

    if (result.success) {
      setNotifications(result.data);
      if (result.pagination) {
        setTotalPages(result.pagination.totalPages);
      }
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  const fetchAgents = async () => {
    try {
      const res = await agentService.getAllAgents({ limit: 500 });
      setAgents(res.agents || []);
    } catch (err) {
      console.error("Failed to fetch agents", err);
    }
  };

  // ── Read Tracker ─────────────────────────────────────────────────────────────
  const openTracker = async (notification) => {
    setTrackerData(null);
    setTrackerSearch("");
    setIsTrackerOpen(true);
    setTrackerLoading(true);

    try {
      const result = await notificationService.getReadStatus(notification._id);
      if (result.success) {
        setTrackerData(result.data);
      } else {
        toast.error(result.message || "Failed to load tracker");
        setIsTrackerOpen(false);
      }
    } catch (err) {
      toast.error("Error fetching read status");
      setIsTrackerOpen(false);
    } finally {
      setTrackerLoading(false);
    }
  };
  // ─────────────────────────────────────────────────────────────────────────────

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      message: "",
      targetType: "all",
      targetUsers: "",
      type: "announcement",
    });
    setEditingNotification(null);
  };

  const openModal = (notification = null) => {
    if (notification) {
      setEditingNotification(notification);
      setFormData({
        title: notification.title,
        message: notification.message,
        targetType: notification.targetType,
        targetUsers:
          notification.targetUsers && notification.targetUsers.length > 0
            ? typeof notification.targetUsers[0] === "object"
              ? notification.targetUsers[0]._id
              : String(notification.targetUsers[0])
            : "",
        type: notification.type,
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const submitData = {
        ...formData,
        targetUsers:
          formData.targetType === "specific"
            ? formData.targetUsers
              ? [formData.targetUsers]
              : []
            : [],
      };

      let result;
      if (editingNotification) {
        result = await notificationService.updateNotification(
          editingNotification._id,
          submitData,
        );
      } else {
        result = await notificationService.createNotification(submitData);
      }

      if (result.success) {
        toast.success(
          editingNotification ? "Updated successfully" : "Created successfully",
        );
        setIsModalOpen(false);
        fetchNotifications(currentPage, searchTerm);
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !confirm(
        "Are you sure? This will permanently delete the notification for ALL users.",
      )
    )
      return;

    const result = await notificationService.deleteNotification(id);
    if (result.success) {
      toast.success("Deleted permanently");
      fetchNotifications(currentPage, searchTerm);
    } else {
      toast.error(result.message);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "announcement":
        return <Megaphone className="h-4 w-4 text-purple-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getAgentName = (id) => {
    const agent = agents.find((a) => a._id === id || a.agentId === id);
    return agent
      ? `${agent.agentName} (${agent.agentId || "N/A"})`
      : `ID: ${id.substring(0, 8)}...`;
  };

  // Filtered tracker list
  const filteredReaders = trackerData?.readBy?.filter((r) => {
    const q = trackerSearch.toLowerCase();
    return (
      r.name?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      r.role?.toLowerCase().includes(q)
    );
  });

  if (!canView)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground">
        <Bell className="h-16 w-16 mb-4 opacity-10" />
        <p>Aapke paas notifications dekhne ki permission nahi hai.</p>
      </div>
    );

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-2xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#10B5DB] to-blue-600">
            Notifications Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            System-wide broadcast aur specific updates manage karein.
          </p>
        </div>

        {canCreate && (
          <Button
            onClick={() => openModal()}
            className="bg-[#10B5DB] hover:bg-[#0e9ab9] text-white shadow-lg transition-all hover:scale-105"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Notification
          </Button>
        )}
      </div>

      {/* Filters Card */}
      <Card className="border-none shadow-md overflow-hidden bg-white/50 backdrop-blur-sm">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>

          <div className="md:col-span-4">
            <Select
              value={viewAgent}
              onValueChange={(val) => {
                setViewAgent(val);
                fetchNotifications(val === "all" ? null : val);
              }}
            >
              <SelectTrigger className="bg-white">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground h-4 w-4 flex items-center justify-center">
                    {viewAgent === "all" ? (
                      <Users size={14} />
                    ) : (
                      <UserIcon size={14} />
                    )}
                  </span>
                  <SelectValue placeholder="Target Filter" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Broadcasts</SelectItem>
                <Separator className="my-1" />
                {agents.map((a) => (
                  <SelectItem key={a._id} value={a._id}>
                    {a.agentName} ({a.agentId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Table Card */}
      <Card className="shadow-lg border-none overflow-hidden bg-white/80 dark:bg-gray-800/80">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-20 grayscale opacity-50">
              <Loader2 className="h-10 w-10 animate-spin text-[#10B5DB] mb-2" />
              <p className="text-sm font-medium">Fetching history...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Megaphone className="h-16 w-16 mx-auto mb-4 opacity-5 bg-gray-100 rounded-full p-4" />
              <p className="text-lg font-medium">No results found</p>
              <p className="text-sm">Try changing filters or search terms.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50/50 dark:bg-gray-900/50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[28%]">
                      Notification Content
                    </TableHead>
                    <TableHead>Target Audience</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1.5">
                        <Eye className="h-3.5 w-3.5 text-[#10B5DB]" />
                        Read By
                      </div>
                    </TableHead>
                    <TableHead>Created Date</TableHead>
                    {(canEdit || canDelete) && (
                      <TableHead className="text-right">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="wait">
                    {notifications.map((n, idx) => (
                      <motion.tr
                        key={n._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors"
                      >
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900 dark:text-gray-100">
                                {n.title}
                              </span>
                              {n.isEdited && (
                                <Badge
                                  variant="outline"
                                  className="text-[9px] h-4 px-1 py-0 border-orange-200 text-orange-600 bg-orange-50 font-medium"
                                >
                                  Edited
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {n.message}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge
                              variant={
                                n.targetType === "all" ? "default" : "outline"
                              }
                              className="w-fit text-[10px] uppercase font-bold"
                            >
                              {n.targetType === "all"
                                ? "Global Broadcast"
                                : n.targetType}
                            </Badge>

                            {n.targetType === "specific" &&
                              n.targetUsers &&
                              n.targetUsers.length > 0 && (
                                <div className="flex flex-col gap-1 mt-1">
                                  {n.targetUsers.map((target, tIdx) => (
                                    <span
                                      key={tIdx}
                                      className="text-[11px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full w-fit flex items-center gap-1"
                                    >
                                      <UserIcon size={10} />
                                      {typeof target === "object"
                                        ? (target.agentName ||
                                            target.name ||
                                            `${target.firstName} ${target.lastName}` ||
                                            "Unknown") +
                                          (target.agentId
                                            ? ` (${target.agentId})`
                                            : "")
                                        : getAgentName(target)}
                                    </span>
                                  ))}
                                </div>
                              )}

                            {n.targetType === "agent" && (
                              <span className="text-[10px] text-muted-foreground font-medium italic">
                                Target: All Employees
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(n.type)}
                            <span className="text-xs capitalize font-medium">
                              {n.type}
                            </span>
                          </div>
                        </TableCell>

                        {/* ── Read Tracker Column ── */}
                        <TableCell>
                          <button
                            onClick={() => openTracker(n)}
                            className="flex items-center gap-2 group/tracker"
                            title="View who has read this notification"
                          >
                            <div
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all
                              ${
                                (n.readBy?.length || 0) > 0
                                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                                  : "bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200"
                              }`}
                            >
                              {(n.readBy?.length || 0) > 0 ? (
                                <UserCheck className="h-3 w-3" />
                              ) : (
                                <EyeOff className="h-3 w-3" />
                              )}
                              {n.readBy?.length || 0}
                              <span className="hidden sm:inline">
                                {(n.readBy?.length || 0) === 1
                                  ? "reader"
                                  : "readers"}
                              </span>
                            </div>
                          </button>
                        </TableCell>
                        {/* ─────────────────────── */}

                        <TableCell>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                            <Calendar size={12} />
                            {new Date(n.createdAt).toLocaleDateString(
                              undefined,
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </div>
                        </TableCell>
                        {(canEdit || canDelete) && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {canEdit && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openModal(n)}
                                  className="h-8 w-8 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              {canDelete && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(n._id)}
                                  className="h-8 w-8 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        )}
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        {totalPages > 1 && (
          <div className="p-4 border-t bg-gray-50/30">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  },
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </Card>

      {/* ═══════════════════════════════════════════════════════════════════════
          Read Tracker Modal
      ═══════════════════════════════════════════════════════════════════════ */}
      <Dialog open={isTrackerOpen} onOpenChange={setIsTrackerOpen}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-none shadow-2xl">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-[#0f172a] to-[#1e3a5f] px-6 py-7 text-white overflow-hidden">
            {/* BG decoration */}
            <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/5" />
            <div className="absolute bottom-0 left-1/2 w-24 h-24 rounded-full bg-[#10B5DB]/10" />

            <DialogHeader className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#10B5DB]/20 rounded-xl border border-[#10B5DB]/30">
                  <Eye className="h-5 w-5 text-[#10B5DB]" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-white leading-snug">
                    Notification Read Tracker
                  </DialogTitle>
                  <DialogDescription className="text-blue-200/80 text-xs mt-0.5">
                    {trackerData
                      ? `"${trackerData.title}"`
                      : "Loading details..."}
                  </DialogDescription>
                </div>
              </div>

              {/* Stats row */}
              {trackerData && !trackerLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 mt-3 flex-wrap"
                >
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
                    <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-xs font-bold text-white">
                      {trackerData.totalReadBy}
                    </span>
                    <span className="text-xs text-blue-200/70">Readers</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
                    <Users className="h-3.5 w-3.5 text-blue-300" />
                    <span className="text-xs text-blue-200/70 capitalize">
                      {trackerData.targetType === "all"
                        ? "Global Broadcast"
                        : trackerData.targetType}
                    </span>
                  </div>
                  {trackerData.totalTargets !== null && (
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
                      <span className="text-xs text-blue-200/70">
                        {trackerData.totalReadBy} / {trackerData.totalTargets}{" "}
                        seen
                      </span>
                    </div>
                  )}
                </motion.div>
              )}
            </DialogHeader>
          </div>

          {/* Body */}
          <div className="bg-white dark:bg-gray-900 px-6 py-5 flex flex-col gap-4">
            {trackerLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-[#10B5DB]" />
                <p className="text-sm">Fetching reader list...</p>
              </div>
            ) : trackerData?.totalReadBy === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <EyeOff className="h-10 w-10 opacity-20" />
                </div>
                <p className="font-medium text-sm">No one has read this yet</p>
                <p className="text-xs text-center">
                  This notification has not been viewed by any user or employee.
                </p>
              </div>
            ) : (
              <>
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email or role..."
                    value={trackerSearch}
                    onChange={(e) => setTrackerSearch(e.target.value)}
                    className="pl-9 bg-gray-50 border-gray-200 text-sm"
                  />
                </div>

                {/* Reader list */}
                <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                  <AnimatePresence>
                    {filteredReaders?.length === 0 ? (
                      <div className="text-center py-6 text-sm text-muted-foreground">
                        No matching readers found.
                      </div>
                    ) : (
                      filteredReaders?.map((reader, idx) => (
                        <motion.div
                          key={reader._id?.toString() || idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ delay: idx * 0.03 }}
                          className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-blue-50/40 hover:border-blue-100 transition-all group"
                        >
                          {/* Avatar */}
                          <div
                            className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm
                            ${
                              reader.type === "agent"
                                ? "bg-purple-100 text-purple-700 border-2 border-purple-200"
                                : "bg-blue-100 text-blue-700 border-2 border-blue-200"
                            }`}
                          >
                            {reader.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>

                          {/* Info */}
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-sm font-semibold text-gray-900 truncate">
                              {reader.name}
                            </span>
                            <span className="text-xs text-muted-foreground truncate">
                              {reader.email}
                            </span>
                          </div>

                          {/* Role badge */}
                          <div className="flex-shrink-0">
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-semibold px-2 py-0.5 flex items-center gap-1
                              ${
                                reader.type === "agent"
                                  ? "border-purple-200 text-purple-700 bg-purple-50"
                                  : "border-blue-200 text-blue-700 bg-blue-50"
                              }`}
                            >
                              {reader.type === "agent" ? (
                                <Briefcase className="h-2.5 w-2.5" />
                              ) : (
                                <ShieldCheck className="h-2.5 w-2.5" />
                              )}
                              {reader.role}
                            </Badge>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>

                {/* Footer summary */}
                <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
                  <span>
                    Showing{" "}
                    <span className="font-semibold text-gray-700">
                      {filteredReaders?.length || 0}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-gray-700">
                      {trackerData?.totalReadBy || 0}
                    </span>{" "}
                    readers
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                      Admin/User
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />
                      Employee
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 pb-5 bg-white dark:bg-gray-900">
            <Button
              variant="ghost"
              className="w-full border border-gray-200 hover:bg-gray-50"
              onClick={() => setIsTrackerOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════════════
          Create/Edit Notification Modal
      ═══════════════════════════════════════════════════════════════════════ */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-[#10B5DB] px-6 py-8 text-white relative">
            <Megaphone className="absolute -bottom-4 right-4 h-24 w-24 opacity-10 rotate-12" />
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {editingNotification ? "Edit Notification" : "New Broadcast"}
              </DialogTitle>
              <DialogDescription className="text-blue-50 opacity-90">
                Aapki audience ko update karne ke liye details bharein.
              </DialogDescription>
            </DialogHeader>
          </div>

          <form
            onSubmit={handleSubmit}
            className="px-6 py-6 space-y-5 bg-white dark:bg-gray-900"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Title
                </Label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Urgent: System Update..."
                  required
                  className="bg-gray-50/50"
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Message
                </Label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  placeholder="Enter details here..."
                  required
                  rows={3}
                  className="bg-gray-50/50 resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Alert Type
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => handleInputChange("type", v)}
                >
                  <SelectTrigger className="bg-gray-50/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="info">Information</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Critical Error</SelectItem>
                    <SelectItem value="success">Success Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Target Group
                </Label>
                <Select
                  value={formData.targetType}
                  onValueChange={(v) => handleInputChange("targetType", v)}
                >
                  <SelectTrigger className="bg-gray-50/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Everyone</SelectItem>
                    <SelectItem value="specific">Specific Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.targetType === "specific" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-2 p-4 bg-blue-50/50 rounded-xl border border-blue-100"
              >
                <Label className="text-xs font-bold text-blue-800">
                  Choose Employee
                </Label>
                <Select
                  value={formData.targetUsers}
                  onValueChange={(val) => handleInputChange("targetUsers", val)}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select from list..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {agents.map((a) => (
                      <SelectItem key={a._id} value={a._id}>
                        {a.agentName} ({a.agentId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            )}

            <DialogFooter className="pt-4 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="min-w-[140px] bg-[#10B5DB] hover:bg-[#0e9ab9]"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Megaphone className="h-4 w-4 mr-2" />
                )}
                {editingNotification ? "Update Now" : "Send Broadcast"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
