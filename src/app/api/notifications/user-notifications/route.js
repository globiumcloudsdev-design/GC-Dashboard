// src/app/api/notifications/user-notifications/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { verifyAuth } from "@/lib/auth"; // Aap ka auth helper
import Notification from "@/Models/Notification";

export async function GET(req) {
  console.log('🟢 ========== GET USER NOTIFICATIONS START ==========');
  await connectDB();

  try {
    // Step 1: User ko verify karein (koi bhi logged-in user)
    const authData = await verifyAuth(req);

    console.log('🔐 Auth Data:', {
      hasError: !!authData.error,
      userId: authData.userId,
      userRole: authData.userRole
    });

    // Agar auth failed
    if (authData.error) {
      console.log('❌ Auth Error:', authData.error);
      return NextResponse.json(
        { message: authData.error },
        { status: authData.status }
      );
    }

    // Step 2: Asli logged-in user ki ID
    const userId = authData.userId;
    console.log('👤 User ID:', userId);

    // Step 3: Query - Filter out notifications that user has deleted
    console.log('🔍 Fetching notifications with filter:', {
      userId: userId,
      filter: 'deletedBy: { $nin: [userId] }'
    });

    const notifications = await Notification.find({
      $or: [
        { targetType: "all" },
        { targetUsers: userId },
      ],
      isActive: true,
      deletedBy: { $nin: [userId] } // Use $nin (not in) for array field
    })
      .sort({ createdAt: -1 })
      .populate("createdBy", "name");

    console.log('✅ Notifications Fetched:', {
      totalCount: notifications.length,
      notificationIds: notifications.map(n => n._id),
      deletedByArrays: notifications.map(n => ({
        id: n._id,
        deletedBy: n.deletedBy,
        readBy: n.readBy
      }))
    });

    return NextResponse.json(notifications, { status: 200 });
  } catch (error) {
    console.error('❌ Fetch Notifications Error:', error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  } finally {
    console.log('🟢 ========== GET USER NOTIFICATIONS END ==========\n');
  }
}