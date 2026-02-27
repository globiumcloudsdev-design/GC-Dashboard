// src/services/agentNotificationService.js
// All notification-related API calls for agents (mobile app + web agent dashboard)
import api from "@/lib/api";

export const agentNotificationService = {
    // ─── FETCH ─────────────────────────────────────────────────────────────────

    /**
     * Fetch notifications visible to the currently logged-in agent.
     * Uses the dedicated user-notifications endpoint which:
     *   • Only returns active, non-deleted notifications
     *   • Adds `isRead` boolean per item
     */
    async fetchMyNotifications() {
        try {
            const response = await api.get("/notifications/user-notifications");
            const data = response.data;
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("❌ fetchMyNotifications Error:", error.response?.data || error.message);
            throw error;
        }
    },

    // ─── READ STATUS ───────────────────────────────────────────────────────────

    /**
     * Mark a single notification as read.
     * PATCH /api/notifications/[id]
     */
    async markAsRead(notificationId) {
        try {
            const response = await api.patch(`/notifications/${notificationId}`);
            return response.data;
        } catch (error) {
            console.error("❌ markAsRead Error:", error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Mark ALL visible notifications as read in one shot.
     * PATCH /api/notifications/all
     */
    async markAllAsRead() {
        try {
            const response = await api.patch("/notifications/all");
            return response.data;
        } catch (error) {
            console.error("❌ markAllAsRead Error:", error.response?.data || error.message);
            throw error;
        }
    },

    // ─── DELETE ────────────────────────────────────────────────────────────────

    /**
     * Soft-delete (hide) a notification from the agent's view.
     * Admin gets hard-delete; agents get soft-delete.
     * DELETE /api/notifications/[id]
     */
    async deleteNotification(notificationId) {
        try {
            const response = await api.delete(`/notifications/${notificationId}`);
            return response.data;
        } catch (error) {
            console.error("❌ deleteNotification Error:", error.response?.data || error.message);
            throw error;
        }
    },

    // ─── PUSH TOKENS ───────────────────────────────────────────────────────────

    /**
     * Register an Expo or FCM push token for this agent.
     * Called after successful login or when Expo generates a new token.
     * POST /api/notifications/push-token
     */
    async registerPushToken(token) {
        if (!token || typeof token !== "string") {
            console.warn("⚠️ registerPushToken: Invalid token provided");
            return;
        }
        try {
            const response = await api.post("/notifications/push-token", { token });
            console.log("✅ Push token registered:", response.data?.message);
            return response.data;
        } catch (error) {
            console.error("❌ registerPushToken Error:", error.response?.data || error.message);
            // Don't throw — push token failure should never block login
        }
    },

    /**
     * Remove an Expo or FCM push token on logout or device change.
     * DELETE /api/notifications/push-token
     */
    async removePushToken(token) {
        if (!token || typeof token !== "string") return;
        try {
            const response = await api.delete("/notifications/push-token", { data: { token } });
            console.log("🗑️ Push token removed:", response.data?.message);
            return response.data;
        } catch (error) {
            console.error("❌ removePushToken Error:", error.response?.data || error.message);
            // Don't throw — cleanup failure should never block logout
        }
    },
};
