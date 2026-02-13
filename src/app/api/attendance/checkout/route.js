// // app/api/attendance/checkout/route.js
// import { NextResponse } from "next/server";
// import connectDB from "@/lib/mongodb";
// import Attendance from "@/Models/Attendance";
// import Shift from "@/Models/Shift";
// import { verifyToken, getUserIdFromToken } from "@/lib/jwt";

// function parseShiftDateTime(baseDate, timeStr) {
//   const [hh, mm] = timeStr.split(":").map(Number);
//   const dt = new Date(baseDate);
//   dt.setHours(hh, mm, 0, 0);
//   return dt;
// }

// export async function POST(request) {
//   try {
//     await connectDB();

//     const authHeader = request.headers.get("authorization");
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return NextResponse.json(
//         { success: false, message: "Not authenticated" },
//         { status: 401 }
//       );
//     }    

//     const token = authHeader.replace("Bearer ", "");
//     const decoded = verifyToken(token);

//     if (!decoded) {
//       return NextResponse.json(
//         { success: false, message: "Invalid token" },
//         { status: 401 }
//       );
//     }

//     const userId = getUserIdFromToken(decoded);
//     const body = await request.json();
//     const { attendanceId, userType = "agent" } = body;

//         console.log('Request ', request.body);

//     const now = new Date();
//     const todayStart = new Date(
//       now.getFullYear(),
//       now.getMonth(),
//       now.getDate()
//     );
//     const todayEnd = new Date(todayStart);
//     todayEnd.setDate(todayEnd.getDate() + 1);

//     // Find today's attendance
//     let attendance;
//     if (attendanceId) {
//       attendance = await Attendance.findById(attendanceId).populate("shift");
//     } else {
//       const query = {
//         checkInTime: { $gte: todayStart, $lt: todayEnd },
//       };
//       if (userType === "agent") query.agent = userId;
//       else query.user = userId;

//       attendance = await Attendance.findOne(query).populate("shift");
//     }

//     if (!attendance) {
//       return NextResponse.json(
//         { success: false, message: "No check-in found for today." },
//         { status: 400 }
//       );
//     }

//     if (attendance.checkOutTime) {
//       return NextResponse.json(
//         { success: false, message: "Already checked-out." },
//         { status: 400 }
//       );
//     }

//     const shift = attendance.shift;
//     if (!shift) {
//       return NextResponse.json(
//         { success: false, message: "Shift not found" },
//         { status: 404 }
//       );
//     }

//     // PREP SHIFT TIMES
//     const checkInDate = new Date(attendance.checkInTime);

//     const shiftStart = parseShiftDateTime(checkInDate, shift.startTime);
//     let shiftEnd = parseShiftDateTime(checkInDate, shift.endTime);

//     // handle overnight shift (end < start)
//     if (shiftEnd <= shiftStart) {
//       shiftEnd.setDate(shiftEnd.getDate() + 1);
//     }

//     attendance.checkOutTime = now;

//     // CALCULATE EARLY CHECKOUT / OVERTIME
//     let earlyCheckout = false;
//     let earlyMinutes = 0;
//     let overtime = false;
//     let overtimeMinutes = 0;

//     if (now < shiftEnd) {
//       // EARLY CHECKOUT
//       earlyCheckout = true;
//       earlyMinutes = Math.floor((shiftEnd - now) / (1000 * 60));
//     } else if (now > shiftEnd) {
//       // OVERTIME
//       overtime = true;
//       overtimeMinutes = Math.floor((now - shiftEnd) / (1000 * 60));
//     }

//     // UPDATE FIELDS
//     attendance.isEarlyCheckout = earlyCheckout;
//     attendance.earlyMinutes = earlyMinutes;

//     attendance.isOvertime = overtime;
//     attendance.overtimeMinutes = overtimeMinutes;

//     // STATUS UPDATE RULES:
//     // Present → late checkout = still present
//     // Present → early checkout = "early_checkout"
//     // Halfday / Late → status stays same
//     // Absent → never overwrite

//     if (attendance.status === "present" && earlyCheckout) {
//       attendance.status = "early_checkout";
//     }

//     await attendance.save();

//     const populated = await Attendance.findById(attendance._id)
//       .populate("user", "firstName lastName email")
//       .populate("agent", "agentName agentId email")
//       .populate("shift", "name startTime endTime days");

//     let msg = "Checked-out successfully";

//     if (earlyCheckout) {
//       msg = `Checked-out early (${earlyMinutes} minutes early)`;
//     } else if (overtime) {
//       msg = `Checked-out with overtime (${overtimeMinutes} minutes)`;
//     }

//     return NextResponse.json({
//       success: true,
//       message: msg,
//       data: populated,
//     });
//   } catch (err) {
//     console.error("Checkout error:", err);
//     return NextResponse.json(
//       { success: false, message: err.message },
//       { status: 500 }
//     );
//   }
// }









import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Attendance from "@/Models/Attendance";
import Shift from "@/Models/Shift";
import { verifyToken, getUserIdFromToken } from "@/lib/jwt";

function parseShiftDateTime(baseDate, timeStr) {
  const [hh, mm] = timeStr.split(":").map(Number);
  const dt = new Date(baseDate);
  dt.setHours(hh, mm, 0, 0);
  return dt;
}

export async function POST(request) {
  try {
    await connectDB();

    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }    

    const token = authHeader.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const userId = getUserIdFromToken(decoded);
    const body = await request.json();
    const { attendanceId, userType = "agent" } = body;

    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    // Find today's attendance
    let attendance;
    if (attendanceId) {
      attendance = await Attendance.findById(attendanceId).populate("shift");
    } else {
      const query = {
        checkInTime: { $gte: todayStart, $lt: todayEnd },
      };
      if (userType === "agent") query.agent = userId;
      else query.user = userId;

      attendance = await Attendance.findOne(query).populate("shift");
    }

    if (!attendance) {
      return NextResponse.json(
        { success: false, message: "No check-in found for today." },
        { status: 400 }
      );
    }

    if (attendance.checkOutTime) {
      return NextResponse.json(
        { success: false, message: "Already checked-out." },
        { status: 400 }
      );
    }

    const shift = attendance.shift;
    if (!shift) {
      return NextResponse.json(
        { success: false, message: "Shift not found" },
        { status: 404 }
      );
    }

    // PREP SHIFT TIMES
    const checkInDate = new Date(attendance.checkInTime);

    const shiftStart = parseShiftDateTime(checkInDate, shift.startTime);
    let shiftEnd = parseShiftDateTime(checkInDate, shift.endTime);

    // handle overnight shift (end < start)
    if (shiftEnd <= shiftStart) {
      shiftEnd.setDate(shiftEnd.getDate() + 1);
    }

    attendance.checkOutTime = now;

    // CALCULATE EARLY CHECKOUT / OVERTIME
    let earlyCheckout = false;
    let earlyMinutes = 0;
    let overtime = false;
    let overtimeMinutes = 0;

    if (now < shiftEnd) {
      // EARLY CHECKOUT
      earlyCheckout = true;
      earlyMinutes = Math.floor((shiftEnd - now) / (1000 * 60));
    } else if (now > shiftEnd) {
      // OVERTIME
      overtime = true;
      overtimeMinutes = Math.floor((now - shiftEnd) / (1000 * 60));
    }

    // UPDATE FIELDS
    attendance.isEarlyCheckout = earlyCheckout;
    attendance.earlyMinutes = earlyMinutes;
    attendance.isOvertime = overtime;
    attendance.overtimeMinutes = overtimeMinutes;

    // STATUS UPDATE RULES - IMPROVED VERSION
    // If person was late and checks out early, they're still "late"
    // Don't override "late" status with "early_checkout"
    
    if (attendance.status === "present") {
      if (earlyCheckout) {
        attendance.status = "early_checkout";
      }
      // If overtime, keep as "present" (or could be "overtime" if you want)
    }
    // If status was "late", keep it as "late" regardless of checkout time
    // If status was "half_day", keep it as "half_day"

    await attendance.save();

    const populated = await Attendance.findById(attendance._id)
      .populate("user", "firstName lastName email")
      .populate("agent", "agentName agentId email")
      .populate("shift", "name startTime endTime days");

    let msg = "Checked-out successfully";

    if (earlyCheckout) {
      msg = `Checked-out early (${earlyMinutes} minutes early)`;
    } else if (overtime) {
      msg = `Checked-out with overtime (${overtimeMinutes} minutes)`;
    }

    // Add note about informed status
    if (attendance.isInformed) {
      msg += " (Informed)";
    }

    return NextResponse.json({
      success: true,
      message: msg,
      data: populated,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}