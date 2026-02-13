// // app/api/attendance/checkin/route.js
// import { NextResponse } from "next/server";
// import connectDB from "@/lib/mongodb";
// import Attendance from "@/Models/Attendance";
// import Shift from "@/Models/Shift";
// import Agent from "@/Models/Agent";
// import { verifyToken, getUserIdFromToken } from "@/lib/jwt";

// /**
//  * Helper: create a Date object on the baseDate day with hh:mm
//  */
// function parseShiftDateTime(baseDate, timeStr) {
//   if (!timeStr) return null;
//   const [hh, mm] = (timeStr || "00:00").split(":").map(Number);
//   const dt = new Date(baseDate);
//   dt.setHours(hh, mm, 0, 0);
//   return dt;
// }

// /**
//  * Calculate status based on check-in time and shift
//  */
// function calculateCheckInStatus(now, shift) {
//   const GRACE_MINUTES = 15;
//   let status = "present";
//   let isLate = false;
//   let lateMinutes = 0;
  
//   if (!shift || !shift.startTime || !shift.endTime) {
//     // No shift info - simple logic
//     return { status, isLate, lateMinutes };
//   }
  
//   // Get today's date at 00:00
//   const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
//   // Parse shift times
//   let shiftStart = parseShiftDateTime(todayStart, shift.startTime);
//   let shiftEnd = parseShiftDateTime(todayStart, shift.endTime);
  
//   // Handle night shifts
//   if (shiftEnd <= shiftStart) {
//     shiftEnd = new Date(shiftEnd.getTime() + 24 * 60 * 60 * 1000);
//   }
  
//   // Calculate full shift and half shift
//   const fullShiftMinutes = Math.floor((shiftEnd - shiftStart) / 60000);
//   const halfShiftMinutes = fullShiftMinutes / 2;
//   const halfShiftTime = new Date(shiftStart.getTime() + halfShiftMinutes * 60000);
  
//   // Grace cutoff time
//   const graceCutoff = new Date(shiftStart.getTime() + GRACE_MINUTES * 60000);
  
//   // Determine status
//   if (now > shiftEnd) {
//     status = "absent";
//   } else if (now >= halfShiftTime) {
//     status = "half_day";
//   } else if (now > graceCutoff) {
//     status = "late";
//     isLate = true;
//     const diffFromStart = Math.floor((now - shiftStart) / 60000);
//     lateMinutes = Math.max(0, diffFromStart - GRACE_MINUTES);
//   } else {
//     status = "present";
//   }
  
//   return { status, isLate, lateMinutes };
// }

// /**
//  * POST /api/attendance/checkin
//  * Body: { shiftId, location, userType = 'agent' }
//  */
// export async function POST(request) {
//   try {
//     await connectDB();

//     // ---------- Auth ----------
//     const authHeader = request.headers.get("authorization");
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
//     }

//     const token = authHeader.replace("Bearer ", "");
//     const decoded = verifyToken(token);
//     if (!decoded) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

//     const userId = getUserIdFromToken(decoded);

//     // ---------- Input ----------
//     const body = await request.json();
//     const { shiftId, userType = "agent" } = body;

//     const now = new Date();
//     const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//     const todayEnd = new Date(todayStart);
//     todayEnd.setDate(todayEnd.getDate() + 1);

//     // ---------- Already checked in TODAY? (respect userType) ----------
//     const existingFilter = {
//       checkInTime: { $gte: todayStart, $lt: todayEnd },
//       ...(userType === "agent" ? { agent: userId } : { user: userId })
//     };
//     const existing = await Attendance.findOne(existingFilter);
//     if (existing) {
//       return NextResponse.json({ success: false, message: "Already checked in for today" }, { status: 400 });
//     }

//     // ---------- Load shift (optional but recommended) ----------
//     let shift = null;
//     if (shiftId) {
//       shift = await Shift.findById(shiftId);
//       if (!shift) return NextResponse.json({ success: false, message: "Shift not found" }, { status: 404 });
//     }

//     // ---------- Calculate status ----------
//     const { status, isLate, lateMinutes } = calculateCheckInStatus(now, shift);

//     // ---------- Create attendance record ----------
//     const attendanceData = {
//       shift: shiftId || null,
//       date: todayStart,
//       checkInTime: now,
//       status,
//       isLate,
//       lateMinutes: lateMinutes || 0,
//       isOvertime: false,
//       overtimeMinutes: 0,
//       isEarlyCheckout: false,
//       earlyCheckoutMinutes: 0,
//     };

//     if (userType === "agent") attendanceData.agent = userId;
//     else attendanceData.user = userId;

//     const attendance = await Attendance.create(attendanceData);

//     // populate for response
//     const populated = await Attendance.findById(attendance._id)
//       .populate("user", "firstName lastName email")
//       .populate("agent", "agentName agentId email")
//       .populate("shift", "name startTime endTime");

//     const msg = status === "late"
//       ? `Checked in successfully (late by ${lateMinutes} minutes)`
//       : `Checked in successfully as ${status}`;

//     return NextResponse.json({ success: true, message: msg, data: populated });
//   } catch (error) {
//     console.error("Check-in error:", error);
//     return NextResponse.json({ success: false, message: error.message }, { status: 500 });
//   }
// }






import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Attendance from "@/Models/Attendance";
import Shift from "@/Models/Shift";
import Agent from "@/Models/Agent";
import { verifyToken, getUserIdFromToken } from "@/lib/jwt";

/**
 * Helper: create a Date object on the baseDate day with hh:mm
 */
function parseShiftDateTime(baseDate, timeStr) {
  if (!timeStr) return null;
  const [hh, mm] = (timeStr || "00:00").split(":").map(Number);
  const dt = new Date(baseDate);
  dt.setHours(hh, mm, 0, 0);
  return dt;
}

/**
 * Check if user has informed late for today
 * You can implement this based on your business logic
 * Maybe from a separate collection or from agent settings
 */
async function checkInformedLate(userId, date, userType = "agent") {
  try {
    // TODO: Implement your logic here
    // For example: Check if agent has submitted informed late request
    // For now, returning false (not informed)
    return false;
  } catch (error) {
    console.error("Error checking informed late:", error);
    return false;
  }
}

/**
 * Calculate status based on check-in time and shift
 * NEW: Added isInformedLate parameter
 */
function calculateCheckInStatus(now, shift, isInformedLate = false) {
  const GRACE_MINUTES = 15;
  let status = "present";
  let isLate = false;
  let lateMinutes = 0;
  
  if (!shift || !shift.startTime || !shift.endTime) {
    // No shift info - simple logic
    return { status, isLate, lateMinutes };
  }
  
  // Get today's date at 00:00
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Parse shift times
  let shiftStart = parseShiftDateTime(todayStart, shift.startTime);
  let shiftEnd = parseShiftDateTime(todayStart, shift.endTime);
  
  // Handle night shifts
  if (shiftEnd <= shiftStart) {
    shiftEnd = new Date(shiftEnd.getTime() + 24 * 60 * 60 * 1000);
  }
  
  // Calculate full shift and half shift
  const fullShiftMinutes = Math.floor((shiftEnd - shiftStart) / 60000);
  const halfShiftMinutes = fullShiftMinutes / 2;
  const halfShiftTime = new Date(shiftStart.getTime() + halfShiftMinutes * 60000);
  
  // Grace cutoff time
  const graceCutoff = new Date(shiftStart.getTime() + GRACE_MINUTES * 60000);
  
  // Determine status
  if (now > shiftEnd) {
    status = "absent";
  } else if (now >= halfShiftTime) {
    status = "half_day";
  } else if (now > graceCutoff) {
    // If informed late, mark as present (no penalty)
    // If not informed, mark as late
    status = isInformedLate ? "present" : "late";
    isLate = !isInformedLate; // Only mark as late if NOT informed
    
    if (!isInformedLate) {
      const diffFromStart = Math.floor((now - shiftStart) / 60000);
      lateMinutes = Math.max(0, diffFromStart - GRACE_MINUTES);
    }
  } else {
    status = "present";
  }
  
  return { status, isLate, lateMinutes };
}

/**
 * POST /api/attendance/checkin
 * Body: { shiftId, location, userType = 'agent' }
 */
export async function POST(request) {
  try {
    await connectDB();

    // ---------- Auth ----------
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

    const userId = getUserIdFromToken(decoded);

    // ---------- Input ----------
    const body = await request.json();
    const { shiftId, userType = "agent" } = body;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    // ---------- Already checked in TODAY? ----------
    const existingFilter = {
      checkInTime: { $gte: todayStart, $lt: todayEnd },
      ...(userType === "agent" ? { agent: userId } : { user: userId })
    };
    const existing = await Attendance.findOne(existingFilter);
    if (existing) {
      return NextResponse.json({ success: false, message: "Already checked in for today" }, { status: 400 });
    }

    // ---------- Load shift ----------
    let shift = null;
    if (shiftId) {
      shift = await Shift.findById(shiftId);
      if (!shift) return NextResponse.json({ success: false, message: "Shift not found" }, { status: 404 });
    }

    // ---------- Check if informed late ----------
    const isInformedLate = await checkInformedLate(userId, now, userType);

    // ---------- Calculate status ----------
    const { status, isLate, lateMinutes } = calculateCheckInStatus(now, shift, isInformedLate);

    // ---------- Create attendance record ----------
    const attendanceData = {
      shift: shiftId || null,
      date: todayStart,
      checkInTime: now,
      status,
      isLate,
      lateMinutes: lateMinutes || 0,
      isInformed: isInformedLate, // IMPORTANT: Set informed flag
      isOvertime: false,
      overtimeMinutes: 0,
      isEarlyCheckout: false,
      earlyCheckoutMinutes: 0,
    };

    if (userType === "agent") attendanceData.agent = userId;
    else attendanceData.user = userId;

    const attendance = await Attendance.create(attendanceData);

    // populate for response
    const populated = await Attendance.findById(attendance._id)
      .populate("user", "firstName lastName email")
      .populate("agent", "agentName agentId email")
      .populate("shift", "name startTime endTime");

    const msg = isInformedLate 
      ? "Checked in successfully (Informed Late - No Penalty)"
      : status === "late"
        ? `Checked in successfully (late by ${lateMinutes} minutes)`
        : `Checked in successfully as ${status}`;

    return NextResponse.json({ success: true, message: msg, data: populated });
  } catch (error) {
    console.error("Check-in error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}