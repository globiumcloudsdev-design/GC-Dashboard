"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAgent } from "../context/AgentContext";
import { useNotifications } from "../hooks/useNotifications";
import NotificationDialog from "./NotificationDialog";
import {
  Bell,
  User,
  LogOut,
  Settings,
  Search,
  Menu,
  CheckCircle2,
  MessageCircle,
  Clock,
  AlertCircle,
  Eye,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AnimatePresence, motion } from "framer-motion";

export default function AgentTopbar({ collapsed, toggleSidebar, isOpen }) {
  const router = useRouter();
  const { agent, logout } = useAgent();
  const {
    notifications,
    loading,
    unreadCount,
    dismissNotification,
    markAsRead,
    markAllAsRead,
  } = useNotifications();
  const [showNoti, setShowNoti] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const notificationRef = useRef(null);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNoti(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <MessageCircle className="w-5 h-5 text-[#10B5DB]" />;
    }
  };

  // Format time difference
  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffMs = now - notificationTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notificationTime.toLocaleDateString();
  };

  // Handle notification click - mark as read and show dialog
  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    setSelectedNotification(notification);
    setShowDialog(true);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/agent/login");
  };

  // Hide topbar on mobile when sidebar is open
  if (isOpen && typeof window !== "undefined" && window.innerWidth < 768) {
    return null;
  }

  return (
    <header
      className={`flex items-center justify-between fixed top-0 left-0 right-0 z-40 h-20 transition-all duration-300 border-b border-gray-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-4 sm:px-8 ${
        collapsed ? "lg:left-[80px]" : "lg:left-[300px]"
      }`}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
        >
          <Menu size={20} />
        </Button>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <span className="text-[#10B5DB] drop-shadow-sm">Agent</span>
          <span className="text-slate-400 font-medium">/</span>
          <span className="text-sm uppercase tracking-[0.2em] font-bold text-slate-500 mt-0.5">
            Portal
          </span>
        </h1>
      </div>

      {/* Center Section (Search Bar) */}
      <div className="flex-1 max-w-md mx-8 hidden lg:flex">
        <div className="relative w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#10B5DB] transition-colors" />
          <Input
            placeholder="Search activities, docs..."
            className="pl-10 h-10 bg-slate-100/50 border-transparent dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-[#10B5DB]/50 rounded-xl w-full transition-all"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3 sm:gap-4 relative">
        {/* 🔔 Notifications */}
        <div className="relative" ref={notificationRef}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowNoti(!showNoti)}
            aria-label="Toggle notifications"
            className="relative hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-2"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold px-1 border-2 border-white dark:border-gray-900 shadow-sm animate-pulse">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Button>

          <AnimatePresence>
            {showNoti && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute right-0 mt-4 w-80 sm:w-[420px] rounded-2xl border border-slate-200 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden dark:border-slate-800 z-[100]"
              >
                {/* Header */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-base">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#10B5DB] text-white">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllAsRead()}
                      className="text-xs text-[#10B5DB] hover:text-[#0a8fb3] font-bold transition-colors duration-150"
                    >
                      ✓ Mark all read
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="max-h-[500px] overflow-y-auto styled-scrollbar">
                  {loading && (
                    <div className="p-8 text-center">
                      <div className="inline-block w-8 h-8 border-4 border-[#10B5DB] border-t-transparent rounded-full animate-spin"></div>
                      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                        Loading notifications...
                      </p>
                    </div>
                  )}
                  {!loading && notifications.length > 0 ? (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {notifications.map((n, index) => (
                        <motion.div
                          key={n._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handleNotificationClick(n)}
                          className={`group flex items-start gap-3 px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 cursor-pointer ${
                            !n.isRead ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                          }`}
                        >
                          {/* Icon */}
                          <div
                            className={`flex-shrink-0 mt-0.5 p-2 rounded-lg ${
                              !n.isRead
                                ? "bg-white dark:bg-gray-800 shadow-sm"
                                : ""
                            }`}
                          >
                            {getNotificationIcon(n.type)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2 flex-1">
                                <p
                                  className={`text-sm font-semibold line-clamp-1 ${
                                    !n.isRead
                                      ? "text-gray-900 dark:text-gray-100"
                                      : "text-gray-700 dark:text-gray-300"
                                  }`}
                                >
                                  {n.title}
                                </p>
                                {!n.isRead && (
                                  <span className="inline-flex h-2 w-2 rounded-full bg-[#10B5DB] shadow-lg shadow-[#10B5DB]/50 animate-pulse" />
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                              {n.message}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                              <Clock size={12} />
                              <span>{getTimeAgo(n.createdAt)}</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            {!n.isRead && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(n._id);
                                }}
                                className="p-1.5 rounded-md text-gray-400 hover:text-[#10B5DB] hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-150"
                                title="Mark as read"
                              >
                                <Eye size={16} />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                dismissNotification(n._id);
                              }}
                              className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-150"
                              title="Delete notification"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    !loading && (
                      <div className="p-12 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                          <Bell size={28} className="text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          No notifications yet
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          You're all caught up! 🎉
                        </p>
                      </div>
                    )
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Separator orientation="vertical" className="h-6 dark:bg-gray-700" />

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 rounded-lg px-2 py-1"
              aria-label="Open profile menu"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatars/default.png" alt="Agent" />
                <AvatarFallback>{agent?.name?.charAt(0) || "A"}</AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm font-medium text-gray-900 dark:text-gray-100">
                {agent?.name || "Agent"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 sm:w-56 rounded-lg"
            style={{ zIndex: 1000 }} // Explicit z-index for dropdown
          >
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/agent/profile")}>
              <User size={16} className="mr-2" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/agent/settings")}>
              <Settings size={16} className="mr-2" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500" onClick={handleLogout}>
              <LogOut size={16} className="mr-2" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Notification Dialog */}
      <NotificationDialog
        notification={selectedNotification}
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onDelete={dismissNotification}
        onMarkAsRead={markAsRead}
        isRead={selectedNotification?.isRead || false}
      />
    </header>
  );
}
