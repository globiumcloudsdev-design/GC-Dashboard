import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notification from "@/Models/Notification";
import { verifyAuth } from "@/lib/auth";
import User from "@/Models/User";
import { sendPushToUsers } from "@/lib/notificationHelper";

// ✅ PATCH: Mark Single OR All as Read
// PATCH /api/notifications/[id]  → mark single as read
// PATCH /api/notifications/all   → mark all as read
export async function PATCH(req, { params }) {
  await connectDB();

  try {
    const auth = await verifyAuth(req);
    if (auth.error) return NextResponse.json({ message: auth.error }, { status: auth.status });

    const { id } = await params;
    const userId = auth.userId;

    // --- CASE 1: Mark ALL as Read ---
    if (id === "all") {
      await Notification.updateMany(
        {
          $or: [{ targetType: "all" }, { targetUsers: userId }],
          readBy: { $ne: userId },
          deletedBy: { $nin: [userId] },
        },
        { $addToSet: { readBy: userId } }
      );
      return NextResponse.json({ message: "All notifications marked as read" }, { status: 200 });
    }

    // --- CASE 2: Mark SINGLE as Read ---
    if (!id || id.length !== 24) {
      return NextResponse.json({ message: "Invalid Notification ID" }, { status: 400 });
    }

    const updated = await Notification.findByIdAndUpdate(
      id,
      { $addToSet: { readBy: userId } },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ message: "Notification not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Marked as read" }, { status: 200 });
  } catch (error) {
    console.error("PATCH Error:", error);
    return NextResponse.json({ message: "Error", error: error.message }, { status: 500 });
  }
}

// ✅ PUT: Admin → Update Notification Content
export async function PUT(req, { params }) {
  await connectDB();

  try {
    const auth = await verifyAuth(req);
    if (auth.error) return NextResponse.json({ message: auth.error }, { status: auth.status });

    // Role check
    let roleName = auth.userRole || "";
    if (!roleName || roleName === "user") {
      const dbUser = await User.findById(auth.userId).populate("role");
      roleName = dbUser?.role?.name || "";
    }
    const normalizedRole = roleName.toLowerCase().trim().replace(/[\s_\-]+/g, "");
    if (normalizedRole !== "admin" && normalizedRole !== "superadmin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { title, message, type, targetType, targetUsers, targetModel } = body;

    const updated = await Notification.findByIdAndUpdate(
      id,
      {
        title,
        message,
        type,
        targetType,
        targetUsers: targetType === "specific" ? targetUsers : [],
        targetModel: targetType === "specific" ? (targetModel || "Agent") : undefined,
        isEdited: true,
        readBy: [], // Reset taake sabko dobara highlight ho
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ message: "Notification not found" }, { status: 404 });
    }

    // Naya Push bhejain taake Agent ko pta chalay update hua hai
    await sendPushToUsers({
      title: `(Updated) ${title}`,
      message: message,
      targetType: updated.targetType,
      targetUsers: updated.targetUsers,
      targetModel: updated.targetModel || "Agent",
      metadata: { notificationId: updated._id, isUpdate: true }
    });

    return NextResponse.json({
      message: "Notification updated successfully",
      notification: updated
    }, { status: 200 });

  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json({ message: "Update error", error: error.message }, { status: 500 });
  }
}

// ✅ DELETE: Admin → Hard Delete (permanent), Agent/User → Soft Delete (hide from view)
export async function DELETE(req, { params }) {
  await connectDB();

  try {
    const auth = await verifyAuth(req);
    if (auth.error) return NextResponse.json({ message: auth.error }, { status: auth.status });

    const { id } = await params;

    // Role detect karna - token first, then DB fallback
    let roleName = auth.userRole || "";

    if (!roleName || roleName === "user" || roleName === "agent") {
      const dbUser = await User.findById(auth.userId).populate("role");
      if (dbUser?.role?.name) {
        roleName = dbUser.role.name;
      }
    }

    // Normalize aggressively: "Super Admin" / "super_admin" / "super-admin" → "superadmin"
    const normalizedRole = roleName.toLowerCase().trim().replace(/[\s_\-]+/g, "");
    const isAdmin = normalizedRole === "admin" || normalizedRole === "superadmin";

    if (isAdmin) {
      // HARD DELETE: Permanently remove from database
      const deleted = await Notification.findByIdAndDelete(id);
      if (!deleted) {
        return NextResponse.json({ message: "Notification not found" }, { status: 404 });
      }
      return NextResponse.json({ message: "Permanently deleted" }, { status: 200 });
    } else {
      // SOFT DELETE: Hide from this user's view only
      const result = await Notification.findByIdAndUpdate(
        id,
        { $addToSet: { deletedBy: auth.userId } },
        { new: true }
      );
      if (!result) {
        return NextResponse.json({ message: "Notification not found" }, { status: 404 });
      }
      return NextResponse.json({ message: "Removed from your view" }, { status: 200 });
    }
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json({ message: "Delete error", error: error.message }, { status: 500 });
  }
}