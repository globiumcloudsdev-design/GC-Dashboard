"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationDialog from "./NotificationDialog";
import {
  Bell,
  LogOut,
  Settings,
  User,
  Search,
  Menu,
  CheckCircle2,
  MessageCircle,
  Clock,
  Trash2,
  Eye,
  AlertCircle,
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
import { useRouter } from "next/navigation";

export default function Topbar({ collapsed }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const {
    notifications,
    loading,
    unreadCount,
    dismissNotification,
    markAsRead,
    markAllAsRead,
    isNotificationRead,
  } = useNotifications();

  const [showNoti, setShowNoti] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
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
    return notificationTime.toLocaleDateString();
  };

  const handleNotificationClick = (notification) => {
    if (!isNotificationRead(notification)) {
      markAsRead(notification._id);
    }
    setSelectedNotification(notification);
    setShowDialog(true);
  };

  const handleEditNotification = (notification) => {
    // Redirect to notifications management page with editing state if possible,
    // or just open the management page.
    router.push("/dashboard/notifications");
  };

  const isAdmin =
    user?.role === "admin" ||
    user?.role === "super_admin" ||
    (user?.role &&
      (user.role.name === "admin" || user.role.name === "super_admin"));

  return (
    <header
      className={`flex items-center justify-between fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow-md rounded-b-xl px-4 sm:px-6 py-3 transition-all duration-300 ${
        collapsed ? "lg:ml-20" : "lg:ml-60"
      }`}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4 sm:gap-6">
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu size={20} />
        </Button>

        <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
          <span className="font-bold text-[#10B5DB]">GC</span> Dashboard
        </h1>
      </div>

      {/* Center Section */}
      <div className="flex-1 max-w-full sm:max-w-md mx-4 hidden md:flex">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg w-full"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3 sm:gap-4 relative">
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
              <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 border border-white dark:border-gray-900" />
            )}
          </Button>

          <AnimatePresence>
            {showNoti && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-80 sm:w-[400px] rounded-xl border border-gray-200 bg-white shadow-2xl overflow-hidden dark:border-gray-700 dark:bg-gray-800 z-50"
              >
                <div className="bg-gradient-to-r from-[#10B5DB]/5 to-transparent border-b p-4 flex items-center justify-between">
                  <div className="font-bold text-gray-800 dark:text-gray-100">
                    Notifications {unreadCount > 0 && `(${unreadCount})`}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllAsRead()}
                      className="text-xs text-[#10B5DB] hover:underline font-semibold"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-[450px] overflow-y-auto styled-scrollbar">
                  {loading ? (
                    <div className="p-8 text-center">
                      <div className="inline-block w-6 h-6 border-2 border-[#10B5DB] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : notifications.length > 0 ? (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {notifications.map((n) => {
                        const isRead = isNotificationRead(n);
                        return (
                          <div
                            key={n._id}
                            onClick={() => handleNotificationClick(n)}
                            className={`group flex items-start gap-3 px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${
                              !isRead ? "bg-blue-50/30 dark:bg-blue-900/10" : ""
                            }`}
                          >
                            <div className="mt-1">
                              {getNotificationIcon(n.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm font-semibold line-clamp-1 ${!isRead ? "text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400"}`}
                              >
                                {n.title}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
                                {n.message}
                              </p>
                              <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                                <Clock size={10} />
                                {getTimeAgo(n.createdAt)}
                              </div>
                            </div>

                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!isRead && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(n._id);
                                  }}
                                  className="p-1 hover:text-[#10B5DB] transition-colors"
                                  title="Mark as read"
                                >
                                  <Eye size={14} />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  dismissNotification(n._id);
                                }}
                                className="p-1 hover:text-red-500 transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                      <Bell size={32} className="mx-auto mb-3 opacity-20" />
                      <p className="text-sm">No new notifications</p>
                    </div>
                  )}
                </div>

                {isAdmin && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/50 border-t text-center">
                    <button
                      onClick={() => {
                        setShowNoti(false);
                        router.push("/dashboard/notifications");
                      }}
                      className="text-xs font-semibold text-[#10B5DB] hover:underline"
                    >
                      Manage All Notifications
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Separator orientation="vertical" className="h-6 dark:bg-gray-700" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 rounded-lg px-2 py-1"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatars/default.png" alt="User" />
                <AvatarFallback>
                  {user?.firstName?.charAt(0)}
                  {user?.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm font-medium text-gray-900 dark:text-gray-100">
                {user?.firstName} {user?.lastName}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 sm:w-56 rounded-lg">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User size={16} className="mr-2" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings size={16} className="mr-2" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500" onClick={logout}>
              <LogOut size={16} className="mr-2" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <NotificationDialog
        notification={selectedNotification}
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onDelete={dismissNotification}
        onMarkAsRead={markAsRead}
        onEdit={handleEditNotification}
        isAdmin={isAdmin}
        isRead={
          selectedNotification
            ? isNotificationRead(selectedNotification)
            : false
        }
      />
    </header>
  );
}
