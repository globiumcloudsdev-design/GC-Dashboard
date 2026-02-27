// src/services/notificationService.js
// Admin-side notification service (dashboard)
import api from "@/lib/api";

export const notificationService = {
  // ─── FETCH ───────────────────────────────────────────────────────────────

  /** GET /api/notifications?page=&limit=&search=
   *  Admin gets all; non-admin gets filtered view */
  getAllNotifications: async (isAdmin = false, page = 1, limit = 20, search = "") => {
    try {
      const params = new URLSearchParams({ page, limit });
      if (search) params.set("search", search);
      if (isAdmin) params.set("type", "admin");

      const response = await api.get(`/notifications?${params}`);
      return {
        success: true,
        data: response.data.data || response.data,
        pagination: response.data.pagination,
        message: "Notifications fetched successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch notifications",
        error: error.response?.data,
      };
    }
  },

  /** GET /api/notifications/user-notifications
   *  Returns notifications for current user with isRead boolean */
  getUserNotifications: async () => {
    try {
      const response = await api.get("/notifications/user-notifications");
      return {
        success: true,
        data: response.data,
        message: "User notifications fetched successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch user notifications",
        error: error.response?.data,
      };
    }
  },

  // ─── CREATE / UPDATE / DELETE ─────────────────────────────────────────────

  /** POST /api/notifications */
  createNotification: async (notificationData) => {
    try {
      const response = await api.post("/notifications", notificationData);
      return {
        success: true,
        data: response.data,
        message: "Notification created successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to create notification",
        error: error.response?.data,
      };
    }
  },

  /** PUT /api/notifications/[id] */
  updateNotification: async (id, updateData) => {
    try {
      const response = await api.put(`/notifications/${id}`, updateData);
      return {
        success: true,
        data: response.data,
        message: "Notification updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update notification",
        error: error.response?.data,
      };
    }
  },

  /** DELETE /api/notifications/[id]
   *  Admin → permanent hard-delete; Agent → soft-delete */
  deleteNotification: async (id) => {
    try {
      const response = await api.delete(`/notifications/${id}`);
      return {
        success: true,
        data: response.data,
        message: "Notification deleted successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete notification",
        error: error.response?.data,
      };
    }
  },

  // ─── READ STATUS ──────────────────────────────────────────────────────────

  /** PATCH /api/notifications/[id]
   *  Mark a single notification as read by the current user */
  markAsRead: async (id) => {
    try {
      const response = await api.patch(`/notifications/${id}`);
      return {
        success: true,
        data: response.data,
        message: "Notification marked as read",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to mark as read",
        error: error.response?.data,
      };
    }
  },

  /** PATCH /api/notifications/all
   *  Mark all notifications as read for the current user */
  markAllAsRead: async () => {
    try {
      const response = await api.patch("/notifications/all");
      return {
        success: true,
        data: response.data,
        message: "All notifications marked as read",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to mark all as read",
        error: error.response?.data,
      };
    }
  },

  // ─── TRACKER (Admin-only) ────────────────────────────────────────────────

  /** GET /api/notifications/[id]/read-status
   *  Admin-only: returns reader list for the Read Tracker modal */
  getReadStatus: async (notificationId) => {
    try {
      const response = await api.get(`/notifications/${notificationId}/read-status`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch read status",
        error: error.response?.data,
      };
    }
  },

  // ─── PUSH TOKENS ─────────────────────────────────────────────────────────

  /** POST /api/notifications/push-token */
  registerPushToken: async (token) => {
    try {
      const response = await api.post("/notifications/push-token", { token });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to register push token",
      };
    }
  },

  /** DELETE /api/notifications/push-token */
  removePushToken: async (token) => {
    try {
      const response = await api.delete("/notifications/push-token", { data: { token } });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to remove push token",
      };
    }
  },
};