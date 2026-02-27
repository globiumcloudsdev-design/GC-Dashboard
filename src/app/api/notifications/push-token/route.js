// src/app/api/notifications/push-token/route.js
// POST  → Register a push token (FCM or Expo) for the authenticated user/agent
// DELETE → Remove a stale/logged-out push token

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/Models/User";
import Agent from "@/Models/Agent";
import { verifyAuth } from "@/lib/auth";

// ─── Helper: pick the right model ───────────────────────────────────────
function getModel(auth) {
    const role = (auth.userRole || "").toLowerCase().trim();
    return role === "agent" ? Agent : User;
}

// ─── POST: Register push token ───────────────────────────────────────────
export async function POST(req) {
    await connectDB();

    try {
        const auth = await verifyAuth(req);
        if (auth.error) {
            return NextResponse.json({ message: auth.error }, { status: auth.status });
        }

        const body = await req.json();
        const { token } = body;

        if (!token || typeof token !== "string" || token.trim() === "") {
            return NextResponse.json({ message: "Push token is required" }, { status: 400 });
        }

        const cleanToken = token.trim();
        const Model = getModel(auth);
        const isAgent = Model === Agent;

        // $addToSet: avoids duplicate tokens in the array
        const updated = await Model.findByIdAndUpdate(
            auth.userId,
            { $addToSet: { pushTokens: cleanToken } },
            { new: true }
        );

        if (!updated) {
            return NextResponse.json({ message: "User/Agent not found" }, { status: 404 });
        }

        console.log(`✅ Push token registered for ${isAgent ? "Agent" : "User"} [${auth.userId}]`);

        return NextResponse.json(
            {
                success: true,
                message: `Push token registered successfully for ${isAgent ? "Employee" : "User"}`,
                tokenCount: updated.pushTokens?.length || 1,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Push Token POST Error:", error);
        return NextResponse.json(
            { message: "Server error", error: error.message },
            { status: 500 }
        );
    }
}

// ─── DELETE: Remove (deregister) a push token ────────────────────────────
// Called on logout or when Expo returns a DeviceNotRegistered error
export async function DELETE(req) {
    await connectDB();

    try {
        const auth = await verifyAuth(req);
        if (auth.error) {
            return NextResponse.json({ message: auth.error }, { status: auth.status });
        }

        const body = await req.json();
        const { token } = body;

        if (!token || typeof token !== "string" || token.trim() === "") {
            return NextResponse.json({ message: "Push token is required" }, { status: 400 });
        }

        const cleanToken = token.trim();
        const Model = getModel(auth);

        // $pull: removes the token from the array
        await Model.findByIdAndUpdate(
            auth.userId,
            { $pull: { pushTokens: cleanToken } }
        );

        console.log(`🗑️  Push token removed for [${auth.userId}]`);

        return NextResponse.json(
            { success: true, message: "Push token removed successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Push Token DELETE Error:", error);
        return NextResponse.json(
            { message: "Server error", error: error.message },
            { status: 500 }
        );
    }
}