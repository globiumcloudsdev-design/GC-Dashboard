// app/api/notifications/[id]/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notification from "@/Models/Notification";
import { verifyToken } from "@/lib/jwt";

// 1. PATCH - Individual Notification ko "Read" mark karne ke liye
export async function PATCH(req, { params }) {
  console.log('🔵 ========== [API] PATCH MARK AS READ START ==========');
  await connectDB();
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      console.log('❌ [Field Error]: No Notification ID provided in URL');
      return NextResponse.json({ message: "Notification ID is required" }, { status: 400 });
    }

    const authData = await verifyToken(req);
    if (authData.error) {
      console.log('❌ [Auth Error]: Verification failed', authData.error);
      return NextResponse.json({ message: authData.error }, { status: authData.status });
    }

    const userId = authData.user?._id || authData.user?.id || authData.userId;
    if (!userId) {
      console.log('❌ [Field Error]: User ID could not be extracted from token');
      return NextResponse.json({ message: "User identity remains ambiguous" }, { status: 401 });
    }

    console.log('📝 [Details]:', { notificationId: id, userId });

    const result = await Notification.findByIdAndUpdate(id, {
      $addToSet: { readBy: userId }
    }, { new: true });

    if (!result) {
      console.log('❌ [DB Error]: Notification not found in database', id);
      return NextResponse.json({ message: "Notification not found" }, { status: 404 });
    }

    console.log('✅ [Success]: Marked as read successfully');
    return NextResponse.json({ message: "Marked as read", notification: result }, { status: 200 });
  } catch (error) {
    console.error('❌ [Critical Error]: PATCH operation failed', error);
    return NextResponse.json({ message: "Error", error: error.message }, { status: 500 });
  } finally {
    console.log('🔵 ========== [API] PATCH MARK AS READ END ==========\n');
  }
}

// 2. PUT - Update notification (Admin only)
export async function PUT(req, { params }) {
  console.log('� ========== [API] PUT UPDATE NOTIFICATION START ==========');
  await connectDB();

  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const authData = await verifyToken(req);
    if (authData.error) {
      console.log('❌ [Auth Error]: Verification failed', authData.error);
      return NextResponse.json({ message: authData.error }, { status: authData.status });
    }

    const userId = authData.user?._id || authData.user?.id || authData.userId;
    if (!userId) {
      return NextResponse.json({ message: "User not identified" }, { status: 401 });
    }

    // Role check logic
    let userRole = null;
    if (authData.user?.type === 'agent') {
      userRole = 'agent';
    } else {
      const User = (await import('@/Models/User')).default;
      const currentUser = await User.findById(userId).populate('role');
      userRole = currentUser?.role?.name;
    }

    const allowedRoles = ["admin", "super_admin"];
    if (!allowedRoles.includes(userRole)) {
      console.log(`🚫 [Access Denied]: Role ${userRole} is not allowed to edit`);
      return NextResponse.json(
        { message: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const updateData = await req.json();
    console.log('📝 [Process]: Updating notification', id, 'with data:', updateData);

    const notification = await Notification.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("createdBy", "name email");

    if (!notification) {
      console.log('❌ [Failure]: Notification not found for update');
      return NextResponse.json({ message: "Notification not found" }, { status: 404 });
    }

    console.log('✅ [Success]: Notification updated successfully');
    return NextResponse.json(
      {
        message: "Notification updated successfully",
        notification
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ [Critical Error]: PUT operation failed', error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  } finally {
    console.log('� ========== [API] PUT UPDATE NOTIFICATION END ==========\n');
  }
}

// 3. DELETE - User ke liye hide (soft delete), Admin ke liye permanent delete (hard delete)
export async function DELETE(req, { params }) {
  console.log('🔴 ========== [API] DELETE NOTIFICATION START ==========');
  await connectDB();
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      console.log('❌ [Field Error]: No Notification ID provided in URL');
      return NextResponse.json({ message: "Notification ID is required" }, { status: 400 });
    }

    const authData = await verifyToken(req);
    if (authData.error) {
      console.log('❌ [Auth Error]: Verification failed', authData.error);
      return NextResponse.json({ message: authData.error }, { status: authData.status });
    }

    const userId = authData.user?.userId || authData.user?.id || authData.user?._id || authData.userId;
    if (!userId) {
      console.log('❌ [Field Error]: User ID not found in token', authData.user);
      return NextResponse.json({ message: "User not identified" }, { status: 401 });
    }

    let userRole = authData.user?.role;
    const userType = authData.user?.type;

    if (userType === 'agent') {
      userRole = 'agent';
      console.log('👤 [Identity]: Detected as AGENT from token');
    } else if (!userRole) {
      console.log('👤 [Identity]: Role not in token, checking DB...');
      const User = (await import('@/Models/User')).default;
      const currentUser = await User.findById(userId).populate('role');
      userRole = currentUser?.role?.name || currentUser?.role;
      console.log('👤 [Identity]: DB Role found ->', userRole || 'none');
    }

    // Normalize role string (handle admin, super_admin, super-admin)
    const normalizedRole = typeof userRole === 'string' ? userRole.toLowerCase().replace('-', '_') : '';
    console.log('🔍 [Identity]: Final Normalized Role ->', normalizedRole);

    if (normalizedRole === "super_admin" || normalizedRole === "admin") {
      console.log(`⚠️ [Process]: Executing HARD DELETE (Role: ${normalizedRole}, ID: ${id})`);
      const deleted = await Notification.findByIdAndDelete(id);
      if (!deleted) {
        console.log('❌ [Failure]: Notification not found for hard delete in DB');
        return NextResponse.json({ message: "Notification not found in database" }, { status: 404 });
      }
      console.log('✅ [Success]: Permanent delete successful from DB');
      return NextResponse.json({ message: "Notification deleted permanently" });
    }
    else {
      console.log(`💾 [Process]: Executing SOFT DELETE (Role: ${normalizedRole || 'user'})`);
      const result = await Notification.findByIdAndUpdate(id, {
        $addToSet: { deletedBy: userId }
      }, { new: true });

      if (!result) {
        console.log('❌ [Failure]: Notification not found for soft delete');
        return NextResponse.json({ message: "Not found" }, { status: 404 });
      }
      console.log('✅ [Success]: Soft delete (hiding) successful');
      return NextResponse.json({ message: "Notification removed from your view" });
    }
  } catch (error) {
    console.error('❌ [Critical Error]: DELETE operation failed', error);
    return NextResponse.json({ message: "Error", error: error.message }, { status: 500 });
  } finally {
    console.log('🔴 ========== [API] DELETE NOTIFICATION END ==========\n');
  }
}
