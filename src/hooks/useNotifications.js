"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const isFetchingRef = useRef(false);

  // Get auth token from localStorage
  const getAuthToken = useCallback(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("agentToken") || localStorage.getItem("token") || localStorage.getItem("accessToken");
    }
    return null;
  }, []);

  // Get user/agent ID from context or localStorage
  const getAgentId = useCallback(() => {
    if (typeof window !== "undefined") {
      const agentData = localStorage.getItem("agentData") || localStorage.getItem("userData");
      if (agentData) {
        try {
          const parsed = JSON.parse(agentData);
          return parsed._id || parsed.id;
        } catch (e) {
          console.error("Error parsing user/agent data:", e);
        }
      }
    }
    return null;
  }, []);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current) return;

    isFetchingRef.current = true;

    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();

      if (!token) {
        setError("Not authenticated");
        setLoading(false);
        isFetchingRef.current = false;
        return;
      }

      const response = await fetch("/api/notifications/user-notifications", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.statusText}`);
      }

      const data = await response.json();
      setNotifications(Array.isArray(data) ? data : []);

      // Calculate unread count - check if current agent is in readBy array
      const agentId = getAgentId();
      const unreadNotifications = data.filter(
        n => agentId && (!n.readBy || !n.readBy.includes(agentId))
      );
      setUnreadCount(unreadNotifications.length);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(err.message);
      setNotifications([]);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [getAuthToken, getAgentId]);

  // Mark notification as read
  const markAsRead = useCallback(
    async (notificationId) => {
      console.log('📝 [Frontend] Mark as Read Request:', { notificationId });
      try {
        const token = getAuthToken();
        if (!token) {
          console.error('❌ [Frontend] No token found');
          return;
        }

        const agentId = getAgentId();
        if (!agentId) {
          console.error('❌ [Frontend] No agent ID found');
          return;
        }

        console.log('🔑 [Frontend] Agent ID:', agentId);

        const response = await fetch(`/api/notifications/${notificationId}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log('📥 [Frontend] Mark as Read Response:', {
          ok: response.ok,
          status: response.status
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ [Frontend] Mark as Read Success:', data);

          // Update local state - add agent to readBy array
          setNotifications((prev) =>
            prev.map((n) =>
              n._id === notificationId
                ? {
                  ...n,
                  readBy: n.readBy ? [...n.readBy, agentId] : [agentId],
                }
                : n
            )
          );
          // Update unread count
          setUnreadCount((prev) => Math.max(0, prev - 1));
        } else {
          const error = await response.json();
          console.error('❌ [Frontend] Mark as Read Failed:', error);
        }
      } catch (err) {
        console.error("❌ [Frontend] Error marking notification as read:", err);
      }
    },
    [getAuthToken, getAgentId]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const agentId = getAgentId();
      if (!agentId) return;

      const response = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Update local state - add agent to readBy for all notifications
        setNotifications((prev) =>
          prev.map((n) => ({
            ...n,
            readBy: n.readBy ? [...new Set([...n.readBy, agentId])] : [agentId],
          }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  }, [getAuthToken, getAgentId]);

  // Delete/Dismiss notification (soft delete - adds to deletedBy array)
  const dismissNotification = useCallback(
    async (notificationId) => {
      console.log('🗑️ [Frontend] Delete Request:', { notificationId });
      try {
        const token = getAuthToken();
        if (!token) {
          console.error('❌ [Frontend] No token found');
          return;
        }

        const agentId = getAgentId();
        console.log('🔑 [Frontend] Agent ID:', agentId);

        // Check if notification was unread before deletion
        const notificationToDelete = notifications.find((n) => n._id === notificationId);
        const wasUnread =
          notificationToDelete &&
          agentId &&
          (!notificationToDelete.readBy ||
            !notificationToDelete.readBy.includes(agentId));

        console.log('📊 [Frontend] Notification State:', {
          found: !!notificationToDelete,
          wasUnread: wasUnread
        });

        // Remove from local state first (optimistic update)
        setNotifications((prev) =>
          prev.filter((n) => n._id !== notificationId)
        );
        console.log('✅ [Frontend] Optimistic update - removed from UI');

        if (wasUnread) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }

        // Update server
        const response = await fetch(`/api/notifications/${notificationId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log('📥 [Frontend] Delete Response:', {
          ok: response.ok,
          status: response.status
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('❌ [Frontend] Delete Failed:', error);
          throw new Error("Failed to delete notification");
        }

        const data = await response.json();
        console.log('✅ [Frontend] Delete Success:', data);
      } catch (err) {
        console.error("❌ [Frontend] Error dismissing notification:", err);
        // Refetch on error to restore state
        fetchNotifications();
      }
    },
    [getAuthToken, fetchNotifications, notifications, getAgentId]
  );

  // Check if notification is read by current agent
  const isNotificationRead = useCallback(
    (notification) => {
      const agentId = getAgentId();
      return agentId && notification.readBy && notification.readBy.includes(agentId);
    },
    [getAgentId]
  );

  // Set up initial fetch and auto-refresh
  useEffect(() => {
    fetchNotifications();

    // Auto-refresh notifications every 2 minutes (reduced from 30 seconds)
    const interval = setInterval(fetchNotifications, 120000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Refetch when returning from background
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchNotifications();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [fetchNotifications]);

  return {
    notifications,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    isNotificationRead,
    getAgentId,
  };
};
