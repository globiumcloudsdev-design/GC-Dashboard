"use client";

import { useState, useEffect, useCallback } from "react";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Get auth token from localStorage
  const getAuthToken = useCallback(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("agentToken");
    }
    return null;
  }, []);

  // Get agent ID from context or localStorage
  const getAgentId = useCallback(() => {
    if (typeof window !== "undefined") {
      const agentData = localStorage.getItem("agentData");
      if (agentData) {
        try {
          return JSON.parse(agentData)._id;
        } catch (e) {
          console.error("Error parsing agent data:", e);
        }
      }
    }
    return null;
  }, []);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();

      if (!token) {
        setError("Not authenticated");
        setLoading(false);
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
    }
  }, [getAuthToken, getAgentId]);

  // Mark notification as read
  const markAsRead = useCallback(
    async (notificationId) => {
      try {
        const token = getAuthToken();
        if (!token) return;

        const agentId = getAgentId();
        if (!agentId) return;

        const response = await fetch(`/api/notifications/${notificationId}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
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
        }
      } catch (err) {
        console.error("Error marking notification as read:", err);
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
      try {
        const token = getAuthToken();
        if (!token) return;

        // Check if notification was unread before deletion
        const notificationToDelete = notifications.find((n) => n._id === notificationId);
        const agentId = getAgentId();
        const wasUnread =
          notificationToDelete &&
          agentId &&
          (!notificationToDelete.readBy ||
            !notificationToDelete.readBy.includes(agentId));

        // Remove from local state first (optimistic update)
        setNotifications((prev) =>
          prev.filter((n) => n._id !== notificationId)
        );

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

        if (!response.ok) {
          throw new Error("Failed to delete notification");
        }
      } catch (err) {
        console.error("Error dismissing notification:", err);
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

    // Auto-refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

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
