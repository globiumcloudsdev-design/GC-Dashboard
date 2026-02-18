"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isFetchingRef = useRef(false);

  // ——— Derived: Unread Count ———
  // The API returns `isRead: true/false` per notification
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // ——— Auth Token ———
  const getAuthToken = useCallback(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("agentToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken")
      );
    }
    return null;
  }, []);

  // ——————————————————————————————————————————————
  //  FETCH NOTIFICATIONS   GET /api/notifications/user-notifications
  // ——————————————————————————————————————————————
  const fetchNotifications = useCallback(async () => {
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
      // API returns: [{ _id, title, message, type, createdAt, isRead, createdBy, ... }]
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(err.message);
      setNotifications([]);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [getAuthToken]);

  // ——————————————————————————————————————————————
  //  MARK SINGLE AS READ   PATCH /api/notifications/[id]
  // ——————————————————————————————————————————————
  const markAsRead = useCallback(
    async (notificationId) => {
      try {
        const token = getAuthToken();
        if (!token) return;

        // ✅ Optimistic update — set isRead = true in local state
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notificationId ? { ...n, isRead: true } : n
          )
        );

        const response = await fetch(`/api/notifications/${notificationId}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          // Rollback on failure
          setNotifications((prev) =>
            prev.map((n) =>
              n._id === notificationId ? { ...n, isRead: false } : n
            )
          );
          console.error("Mark as read failed:", await response.json());
        }
      } catch (err) {
        console.error("Error marking notification as read:", err);
        // Rollback
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notificationId ? { ...n, isRead: false } : n
          )
        );
      }
    },
    [getAuthToken]
  );

  // ——————————————————————————————————————————————
  //  MARK ALL AS READ   PATCH /api/notifications/all
  // ——————————————————————————————————————————————
  const markAllAsRead = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      // ✅ Optimistic update — set all isRead = true
      const previousNotifications = [...notifications];
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );

      const response = await fetch("/api/notifications/all", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // Rollback on failure
        setNotifications(previousNotifications);
        console.error("Mark all as read failed:", await response.json());
      }
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      // Re-fetch to restore correct state
      fetchNotifications();
    }
  }, [getAuthToken, notifications, fetchNotifications]);

  // ——————————————————————————————————————————————
  //  DELETE (SOFT DELETE)   DELETE /api/notifications/[id]
  // ——————————————————————————————————————————————
  const dismissNotification = useCallback(
    async (notificationId) => {
      try {
        const token = getAuthToken();
        if (!token) return;

        // Store for rollback
        const previousNotifications = [...notifications];

        // ✅ Optimistic update — remove from local state
        setNotifications((prev) =>
          prev.filter((n) => n._id !== notificationId)
        );

        const response = await fetch(`/api/notifications/${notificationId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          // Rollback on failure
          setNotifications(previousNotifications);
          console.error("Delete notification failed:", await response.json());
        }
      } catch (err) {
        console.error("Error dismissing notification:", err);
        // Re-fetch to restore correct state
        fetchNotifications();
      }
    },
    [getAuthToken, notifications, fetchNotifications]
  );

  // ——————————————————————————————————————————————
  //  HELPER: Check if a notification is read
  //  (uses the `isRead` boolean from API)
  // ——————————————————————————————————————————————
  const isNotificationRead = useCallback((notification) => {
    return !!notification?.isRead;
  }, []);

  // ——————————————————————————————————————————————
  //  AUTO FETCH ON MOUNT + POLLING + VISIBILITY
  // ——————————————————————————————————————————————
  useEffect(() => {
    fetchNotifications();

    // Auto-refresh every 2 minutes
    const interval = setInterval(fetchNotifications, 120000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Refetch when tab becomes visible again
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
  };
};
