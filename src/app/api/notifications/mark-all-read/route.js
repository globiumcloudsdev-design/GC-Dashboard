// app/api/notifications/mark-all-read/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { verifyToken } from "@/lib/jwt";
import Notification from "@/Models/Notification";

export async function POST(req) {
  await connectDB();
  try {
    const authData = await verifyToken(req);
    if (authData.error) return NextResponse.json({ message: authData.error }, { status: authData.status });

    const userId = authData.user?._id || authData.userId;

    // Saari notifications jo is user ke liye hain unhe read mark kar do
    await Notification.updateMany(
      {
        $or: [{ targetType: "all" }, { targetUsers: userId }],
        readBy: { $ne: userId } // Jo pehle se read na hon
      },
      { $addToSet: { readBy: userId } }
    );

    return NextResponse.json({ message: "All notifications marked as read" });
  } catch (error) {
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}