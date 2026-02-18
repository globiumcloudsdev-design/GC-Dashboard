// // app/api/notifications/route.js
// import { NextResponse } from "next/server";
// import connectDB from "@/lib/mongodb";
// import Notification from "@/Models/Notification";
// import User from "@/Models/User";
// import Agent from "@/Models/Agent";

// // ✅ GET - All notifications or user-specific
// export async function GET(req) {
//   await connectDB();

//   try {
//     const { searchParams } = new URL(req.url);
//     const type = searchParams.get("type"); // 'admin' or 'user'
//     const agentIdParam = searchParams.get("agentId");

//     let notifications;

//     // If agentId query param provided, return notifications relevant to that agent.
//     if (agentIdParam) {
//       // agentIdParam can be either a Mongo _id (24 hex) or an agent code (e.g., SR002)
//       let agentObjectId = agentIdParam;

//       // If not a 24-hex string, try to resolve by Agent.agentId field
//       if (!/^[a-fA-F0-9]{24}$/.test(String(agentIdParam))) {
//         const found = await Agent.findOne({ agentId: String(agentIdParam) });
//         if (!found) {
//           // Return empty array if agent not found
//           return NextResponse.json([], { status: 200 });
//         }
//         agentObjectId = found._id;
//       }

//       // Find notifications targeted specifically to this agent OR global ones
//       notifications = await Notification.find({
//         $or: [
//           { targetType: "specific", targetUsers: agentObjectId },
//           { targetType: "all" },
//           { targetType: "agent" }
//         ],
//         isActive: true,
//       })
//         .sort({ createdAt: -1 })
//         .populate("createdBy", "name email")
//         .populate("targetUsers", "agentName agentId email firstName lastName");

//       return NextResponse.json(notifications, { status: 200 });
//     }

//     // No agentId — fallback to existing behavior
//     if (type === "admin") {
//       // ✅ Get all notifications (no auth restriction)
//       notifications = await Notification.find({})
//         .populate("createdBy", "name email")
//         .populate("targetUsers", "agentName agentId email firstName lastName")
//         .sort({ createdAt: -1 });
//     } else {
//       // ✅ Normal user route (everyone can access)
//       notifications = await Notification.find({
//         isActive: true,
//       })
//         .sort({ createdAt: -1 })
//         .populate("createdBy", "name");
//     }

//     return NextResponse.json(notifications, { status: 200 });
//   } catch (error) {
//     console.log("Notifications GET error:", error);
//     return NextResponse.json(
//       { message: "Server error", error: error.message },
//       { status: 500 }
//     );
//   }
// }

// // ✅ POST - Create new notification (no token required)
// export async function POST(req) {
//   await connectDB();

//   try {
//     const { title, message, type, targetType, targetUsers, createdBy } =
//       await req.json();

//     // Validate required fields
//     if (!title || !message) {
//       return NextResponse.json(
//         { message: "Title and message are required" },
//         { status: 400 }
//       );
//     }

//     // Validate specific target users if needed
//     if (targetType === "specific" && (!targetUsers || targetUsers.length === 0)) {
//       return NextResponse.json(
//         { message: "Specific target requires targetUsers" },
//         { status: 400 }
//       );
//     }

//     const notificationData = {
//       title,
//       message,
//       type: type || "announcement",
//       targetType: targetType || "all",
//       createdBy: createdBy || null, // optional
//     };

//     if (targetType === "specific") {
//       // targetModel is required by the schema when targetType === 'specific'.
//       // If the client didn't send targetModel, assume these are Agents (admin UI).
//       notificationData.targetUsers = targetUsers;
//       notificationData.targetModel = "Agent";
//     }

//     const notification = new Notification(notificationData);
//     await notification.save();
//     await notification.populate("createdBy", "name email");

//     return NextResponse.json(
//       {
//         message: "Notification created successfully",
//         notification,
//       },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.log("Notifications POST error:", error);
//     return NextResponse.json(
//       { message: "Server error", error: error.message },
//       { status: 500 }
//     );
//   }
// }


import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notification from "@/Models/Notification";
import User from "@/Models/User";
import Role from "@/Models/Role"; // Isay lazmi import rakhein
import { verifyAuth } from "@/lib/auth";

// ✅ GET: Fetch Notifications (Admin vs Agent Logic)
export async function GET(req) {
  await connectDB();
  const auth = await verifyAuth(req);
  if (auth.error) return NextResponse.json({ message: auth.error }, { status: auth.status });

  try {
    // Role detect karna - token + DB fallback
    let roleName = auth.userRole || "";

    if (!roleName || roleName === "user") {
      const dbUser = await User.findById(auth.userId).populate("role");
      if (dbUser?.role?.name) {
        roleName = dbUser.role.name;
      }
    }

    // Normalize aggressively
    const normalizedRole = roleName.toLowerCase().trim().replace(/[\s_\-]+/g, "");
    const isAdmin = normalizedRole === "admin" || normalizedRole === "superadmin";

    let query = {};
    if (isAdmin) {
      query = {}; // Admin sab dekhay ga
    } else {
      query = {
        $or: [{ targetType: "all" }, { targetUsers: auth.userId }],
        isActive: true,
        deletedBy: { $nin: [auth.userId] } // Soft delete filter
      };
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .populate("createdBy", "firstName lastName")
      .lean();

    return NextResponse.json(notifications, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error", error: error.message }, { status: 500 });
  }
}

// ✅ POST: Create Notification (Sirf Admin/Super Admin)
export async function POST(req) {
  await connectDB();
  const auth = await verifyAuth(req);
  if (auth.error) return NextResponse.json({ message: auth.error }, { status: auth.status });

  try {
    // ——— STEP 1: Role detect karna (Multiple methods se) ———
    let roleName = "";

    // Method 1: Token se role check karo (fastest - no DB call)
    if (auth.userRole) {
      roleName = auth.userRole;
      console.log("📌 [POST Notification] Role from token:", roleName);
    }

    // Method 2: DB se User + Role populate karein (fallback)
    if (!roleName || roleName === "user") {
      const dbUser = await User.findById(auth.userId).populate("role");
      console.log("📌 [POST Notification] DB User found:", !!dbUser);
      console.log("📌 [POST Notification] DB User role object:", dbUser?.role);
      console.log("📌 [POST Notification] DB User role name:", dbUser?.role?.name);

      if (dbUser?.role?.name) {
        roleName = dbUser.role.name;
      }
    }

    // ——— STEP 2: Normalize role name aggressively ———
    // "Super Admin" / "super-admin" / "super_admin" / "SuperAdmin" → sab "superadmin" ban jayega
    const normalizedRole = roleName
      .toLowerCase()
      .trim()
      .replace(/[\s_\-]+/g, ""); // Remove ALL spaces, underscores, hyphens

    console.log("📌 [POST Notification] Final role check:", {
      original: roleName,
      normalized: normalizedRole,
    });

    // ——— STEP 3: Security Check ———
    const allowedRoles = ["admin", "superadmin"]; // normalized forms
    if (!allowedRoles.includes(normalizedRole)) {
      return NextResponse.json(
        { message: "Unauthorized: Admins only", debug: { original: roleName, normalized: normalizedRole } },
        { status: 403 }
      );
    }

    // ——— STEP 4: Create Notification ———
    const { title, message, targetType, targetUsers } = await req.json();

    const newNotification = await Notification.create({
      title,
      message,
      targetType: targetType || "all",
      targetUsers: targetType === "specific" ? targetUsers : [],
      createdBy: auth.userId,
    });

    return NextResponse.json({ message: "Notification sent!", notification: newNotification }, { status: 201 });
  } catch (error) {
    console.error("❌ [POST Notification] Error:", error);
    return NextResponse.json({ message: "Post error", error: error.message }, { status: 500 });
  }
}