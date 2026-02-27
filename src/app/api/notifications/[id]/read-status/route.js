// src/app/api/notifications/[id]/read-status/route.js
// GET /api/notifications/[id]/read-status
// Admin-only: Returns the list of users/agents who have read a notification,
// total count, and basic stats for the Read Tracker modal.

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notification from "@/Models/Notification";
import User from "@/Models/User";
import Agent from "@/Models/Agent";
import { verifyAuth } from "@/lib/auth";

export async function GET(req, { params }) {
    await connectDB();

    try {
        // 1. Auth check
        const auth = await verifyAuth(req);
        if (auth.error) {
            return NextResponse.json({ message: auth.error }, { status: auth.status });
        }

        // 2. Admin-only guard
        let roleName = auth.userRole || "";
        if (!roleName || roleName === "user") {
            const dbUser = await User.findById(auth.userId).populate("role");
            roleName = dbUser?.role?.name || "";
        }
        const normalizedRole = roleName.toLowerCase().trim().replace(/[\s_\-]+/g, "");
        const isAdmin = normalizedRole === "admin" || normalizedRole === "superadmin";

        if (!isAdmin) {
            return NextResponse.json(
                { message: "Unauthorized: Admins only" },
                { status: 403 }
            );
        }

        // 3. Resolve notification ID
        const { id } = await params;
        if (!id || id.length !== 24) {
            return NextResponse.json({ message: "Invalid Notification ID" }, { status: 400 });
        }

        // 4. Fetch notification (lean for speed)
        const notification = await Notification.findById(id)
            .select("title message targetType targetUsers readBy createdAt")
            .lean();

        if (!notification) {
            return NextResponse.json({ message: "Notification not found" }, { status: 404 });
        }

        const readByIds = notification.readBy || [];

        // 5. Look up each reader in BOTH User and Agent collections simultaneously
        const [usersWhoRead, agentsWhoRead] = await Promise.all([
            User.find({ _id: { $in: readByIds } })
                .select("firstName lastName email role")
                .populate("role", "name")
                .lean(),
            Agent.find({ _id: { $in: readByIds } })
                .select("agentName agentId email")
                .lean(),
        ]);

        // 6. Shape into a unified reader list
        const readByList = [
            ...usersWhoRead.map((u) => ({
                _id: u._id,
                name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Unknown",
                email: u.email || "",
                role: u.role?.name || "User",
                type: "user",
            })),
            ...agentsWhoRead.map((a) => ({
                _id: a._id,
                name: a.agentName || "Unknown",
                email: a.email || "",
                role: `Employee (${a.agentId || "N/A"})`,
                type: "agent",
            })),
        ];

        // 7. Calculate total targets (for "x / y seen" display in the modal)
        let totalTargets = null;
        if (notification.targetType === "specific" && notification.targetUsers?.length > 0) {
            totalTargets = notification.targetUsers.length;
        }
        // For targetType "all" or "agent" we can't know the total cheaply — return null so UI hides that chip

        return NextResponse.json(
            {
                success: true,
                title: notification.title,
                message: notification.message,
                targetType: notification.targetType,
                totalReadBy: readByList.length,
                totalTargets,
                readBy: readByList,
                createdAt: notification.createdAt,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Read Status GET Error:", error);
        return NextResponse.json(
            { message: "Server error", error: error.message },
            { status: 500 }
        );
    }
}
