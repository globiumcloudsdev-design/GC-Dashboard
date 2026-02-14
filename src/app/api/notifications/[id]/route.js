// // app/api/notifications/[id]/route.js
// import { NextResponse } from "next/server";
// import connectDB from "@/lib/mongodb";
// import Notification from "@/Models/Notification";
// import { verifyToken } from "@/lib/jwt";

// // GET single notification
// export async function GET(req, { params }) {
//   await connectDB();

//   try {
//     const authData = await verifyToken(req);
    
//     if (authData.error) {
//       return NextResponse.json(
//         { message: authData.error },
//         { status: authData.status }
//       );
//     }

//     const { id } = params;
//     const notification = await Notification.findById(id).populate("createdBy", "name email");

//     if (!notification) {
//       return NextResponse.json(
//         { message: "Notification not found" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json(notification, { status: 200 });

//   } catch (error) {
//     return NextResponse.json(
//       { message: "Server error", error: error.message },
//       { status: 500 }
//     );
//   }
// }

// // UPDATE notification
// export async function PUT(req, { params }) {
//   await connectDB();

//   try {
//     const authData = await verifyToken(req);
    
//     if (authData.error) {
//       return NextResponse.json(
//         { message: authData.error },
//         { status: authData.status }
//       );
//     }

//     // Check admin permissions
//     const allowedRoles = ["admin", "super_admin"];
//     if (!allowedRoles.includes(authData.user?.role)) {
//       return NextResponse.json(
//         { message: "Unauthorized: Admin access required" },
//         { status: 403 }
//       );
//     }

//     const { id } = params;
//     const updateData = await req.json();

//     const notification = await Notification.findByIdAndUpdate(
//       id,
//       updateData,
//       { new: true, runValidators: true }
//     ).populate("createdBy", "name email");

//     if (!notification) {
//       return NextResponse.json(
//         { message: "Notification not found" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json(
//       { 
//         message: "Notification updated successfully",
//         notification 
//       },
//       { status: 200 }
//     );

//   } catch (error) {
//     return NextResponse.json(
//       { message: "Server error", error: error.message },
//       { status: 500 }
//     );
//   }
// }

// // DELETE notification
// export async function DELETE(req, { params }) {
//   await connectDB();

//   try {
//     const authData = await verifyToken(req);
    
//     if (authData.error) {
//       return NextResponse.json(
//         { message: authData.error },
//         { status: authData.status }
//       );
//     }

//     const { id } = await params;
//     const notification = await Notification.findByIdAndDelete(id);

//     if (!notification) {
//       return NextResponse.json(
//         { message: "Notification not found" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json(
//       { message: "Notification deleted successfully" },
//       { status: 200 }
//     );

//   } catch (error) {
//     return NextResponse.json(
//       { message: "Server error", error: error.message },
//       { status: 500 }
//     );
//   }
// }






// app/api/notifications/[id]/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notification from "@/Models/Notification";
import { verifyToken } from "@/lib/jwt";

// 1. PATCH - Individual Notification ko "Read" mark karne ke liye
export async function PATCH(req, { params }) {
  await connectDB();
  try {
    const authData = await verifyToken(req);
    if (authData.error) return NextResponse.json({ message: authData.error }, { status: authData.status });

    const { id } = params;
    const userId = authData.user?._id || authData.userId;

    // $addToSet ensures ke ek hi user ki ID baar baar add na ho
    await Notification.findByIdAndUpdate(id, {
      $addToSet: { readBy: userId }
    });

    return NextResponse.json({ message: "Marked as read" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error", error: error.message }, { status: 500 });
  }
}

// 2. DELETE - User ke liye hide, Admin ke liye permanent delete
export async function DELETE(req, { params }) {
  await connectDB();
  try {
    const authData = await verifyToken(req);
    if (authData.error) return NextResponse.json({ message: authData.error }, { status: authData.status });

    const { id } = params;
    const userId = authData.user?._id || authData.userId;
    const userRole = authData.user?.role;

    // AGAR SUPER ADMIN HAI TO PERMANENT DELETE
    if (userRole === "super_admin") {
      const deleted = await Notification.findByIdAndDelete(id);
      if (!deleted) return NextResponse.json({ message: "Not found" }, { status: 404 });
      return NextResponse.json({ message: "Notification deleted permanently from DB" });
    } 
    
    // AGAR NORMAL USER HAI TO SIRF USKE LIYE HIDE (Soft Delete)
    else {
      await Notification.findByIdAndUpdate(id, {
        $addToSet: { deletedBy: userId }
      });
      return NextResponse.json({ message: "Notification removed from your view" });
    }
  } catch (error) {
    return NextResponse.json({ message: "Error", error: error.message }, { status: 500 });
  }
} 