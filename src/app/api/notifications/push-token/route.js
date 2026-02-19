import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/Models/User";
import Agent from "@/Models/Agent";
import { verifyAuth } from "@/lib/auth";

export async function POST(req) {
    await connectDB();

    try {
        const auth = await verifyAuth(req);
        if (auth.error) {
            return NextResponse.json({ message: auth.error }, { status: auth.status });
        }

        const { token } = await req.json();
        if (!token) {
            return NextResponse.json({ message: "Push token is required" }, { status: 400 });
        }

        // Role ke mutabiq sahi model choose karein
        const role = (auth.userRole || "").toLowerCase();
        const isAgent = role === "agent" || !auth.userRole; // Agar role missing hai to default agent ho sakta hai in some contexts

        const Model = isAgent ? Agent : User;

        await Model.findByIdAndUpdate(auth.userId, {
            $addToSet: { pushTokens: token }
        });

        return NextResponse.json({
            message: `Push token registered successfully for ${isAgent ? 'Agent' : 'User'}`
        }, { status: 200 });

    } catch (error) {
        console.error("Push Token Error:", error);
        return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
    }
}