// // src/app/api/notifications/user-notifications/route.js
// import { NextResponse } from "next/server";
// import connectDB from "@/lib/mongodb";
// import { verifyAuth } from "@/lib/auth"; // Aap ka auth helper
// import Notification from "@/Models/Notification";

// export async function GET(req) {
//   console.log('🟢 ========== GET USER NOTIFICATIONS START ==========');
//   await connectDB();

//   try {
//     // Step 1: User ko verify karein (koi bhi logged-in user)
//     const authData = await verifyAuth(req);

//     console.log('🔐 Auth Data:', {
//       hasError: !!authData.error,
//       userId: authData.userId,
//       userRole: authData.userRole
//     });

//     // Agar auth failed
//     if (authData.error) {
//       console.log('❌ Auth Error:', authData.error);
//       return NextResponse.json(
//         { message: authData.error },
//         { status: authData.status }
//       );
//     }

//     // Step 2: Asli logged-in user ki ID
//     const userId = authData.userId;
//     console.log('👤 User ID:', userId);

//     // Step 3: Query - Filter out notifications that user has deleted
//     console.log('🔍 Fetching notifications with filter:', {
//       userId: userId,
//       filter: 'deletedBy: { $nin: [userId] }'
//     });

//     const notifications = await Notification.find({
//       $or: [
//         { targetType: "all" },
//         { targetUsers: userId },
//       ],
//       isActive: true,
//       deletedBy: { $nin: [userId] } // Use $nin (not in) for array field
//     })
//       .sort({ createdAt: -1 })
//       .populate("createdBy", "name");

//     console.log('✅ Notifications Fetched:', {
//       totalCount: notifications.length,
//       notificationIds: notifications.map(n => n._id),
//       deletedByArrays: notifications.map(n => ({
//         id: n._id,
//         deletedBy: n.deletedBy,
//         readBy: n.readBy
//       }))
//     });

//     return NextResponse.json(notifications, { status: 200 });
//   } catch (error) {
//     console.error('❌ Fetch Notifications Error:', error);
//     return NextResponse.json(
//       { message: "Server error", error: error.message },
//       { status: 500 }
//     );
//   } finally {
//     console.log('🟢 ========== GET USER NOTIFICATIONS END ==========\n');
//   }
// }



import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notification from "@/Models/Notification";
import { verifyAuth } from "@/lib/auth";

export async function GET(req) {
  await connectDB();

  try {
    // 1. Auth check (Login verify karna)
    const auth = await verifyAuth(req);
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: auth.status });
    }

    const userId = auth.userId;

    // 2. Optimized Query (Fast fetching)
    // - $or: Wo notifications jo 'all' ke liye hain ya specific is user ke liye.
    // - isActive: Sirf active wali.
    // - deletedBy: Agar user ne delete (soft delete) kar di hai to nazar na aaye.
    const notifications = await Notification.find({
      $or: [
        { targetType: "all" },
        { targetUsers: userId },
      ],
      isActive: true,
      deletedBy: { $nin: [userId] } 
    })
    .sort({ createdAt: -1 }) // Sabse nayi pehle
    .select("title message type createdAt readBy") // Sirf zaroori fields fetch karein
    .populate("createdBy", "firstName lastName") // Admin ka naam dikhane ke liye
    .lean(); // Faster performance (Plain JSON return karta hai)

    // 3. Post-Processing (Frontend ka kaam asaan karne ke liye)
    // Hum har notification ke sath 'isRead' ka boolean bhejenge
    const processedNotifications = notifications.map(notif => ({
      ...notif,
      isRead: notif.readBy ? notif.readBy.some(id => id.toString() === userId.toString()) : false,
      readBy: undefined // Array bhej kar response bhari karne ki zaroorat nahi
    }));

    return NextResponse.json(processedNotifications, { status: 200 });

  } catch (error) {
    console.error("User Notifications GET Error:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}