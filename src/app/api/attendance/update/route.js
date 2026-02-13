// //src/app/api/attendance/update/route.js
// import { NextResponse } from "next/server";
// import connectDB from "@/lib/mongodb";
// import Attendance from "@/Models/Attendance";
// import Holiday from "@/Models/Holiday";
// import WeeklyOff from "@/Models/WeeklyOff";
// import Shift from "@/Models/Shift";
// import { verifyToken } from "@/lib/jwt";

// // Function to check if date is weekly off
// async function isWeeklyOff(date) {
//   const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
//   const weeklyOff = await WeeklyOff.findOne({ 
//     day: dayName, 
//     isActive: true 
//   });
//   return weeklyOff;
// }

// // Function to check if date is holiday
// async function isHoliday(date) {
//   const dateStart = new Date(date);
//   dateStart.setHours(0, 0, 0, 0);
//   const dateEnd = new Date(dateStart);
//   dateEnd.setDate(dateEnd.getDate() + 1);

//   const holiday = await Holiday.findOne({
//     $or: [
//       { date: { $gte: dateStart, $lt: dateEnd } },
//       { 
//         isRecurring: true,
//         $expr: {
//           $and: [
//             { $eq: [{ $month: "$date" }, date.getMonth() + 1] },
//             { $eq: [{ $dayOfMonth: "$date" }, date.getDate()] }
//           ]
//         }
//       }
//     ]
//   });
//   return holiday;
// }

// // Function to calculate status based on shift times
// function calculateStatusBasedOnShift(checkInTime, checkOutTime, shift, existingStatus) {
//   const GRACE_MINUTES = 15;
//   let status = existingStatus;
//   let isLate = false;
//   let lateMinutes = 0;
//   let isEarlyCheckout = false;
//   let earlyCheckoutMinutes = 0;
//   let isOvertime = false;
//   let overtimeMinutes = 0;
  
//   // If no shift, return existing status
//   if (!shift || !shift.startTime || !shift.endTime) {
//     return { status, isLate, lateMinutes, isEarlyCheckout, earlyCheckoutMinutes, isOvertime, overtimeMinutes };
//   }
  
//   // Parse times
//   const checkInDate = checkInTime ? new Date(checkInTime) : null;
//   const checkOutDate = checkOutTime ? new Date(checkOutTime) : null;
  
//   // Get base date from check-in time
//   const baseDate = checkInDate || new Date();
//   const dateString = baseDate.toISOString().split('T')[0];
  
//   // Create shift start and end times for that day
//   const shiftStart = new Date(`${dateString}T${shift.startTime}`);
//   const shiftEnd = new Date(`${dateString}T${shift.endTime}`);
  
//   // Handle night shifts (end time next day)
//   if (shiftEnd <= shiftStart) {
//     shiftEnd.setDate(shiftEnd.getDate() + 1);
//   }
  
//   // Calculate full shift duration
//   const fullShiftMinutes = Math.floor((shiftEnd - shiftStart) / (1000 * 60));
//   const halfShiftThreshold = fullShiftMinutes / 2;
//   const halfShiftTime = new Date(shiftStart.getTime() + halfShiftThreshold * 60 * 1000);
  
//   // Grace period cutoff
//   const graceCutoff = new Date(shiftStart.getTime() + GRACE_MINUTES * 60 * 1000);
  
//   // 1. Check check-in status
//   if (checkInDate) {
//     // If check-in after shift end => absent
//     if (checkInDate > shiftEnd) {
//       status = "absent";
//     }
//     // If check-in after half shift => half_day
//     else if (checkInDate >= halfShiftTime) {
//       status = "half_day";
//     }
//     // If check-in after grace period => late
//     else if (checkInDate > graceCutoff) {
//       status = "late";
//       isLate = true;
//       const minutesLate = Math.floor((checkInDate - shiftStart) / (1000 * 60));
//       lateMinutes = Math.max(0, minutesLate - GRACE_MINUTES);
//     }
//     // Otherwise present
//     else {
//       status = "present";
//     }
//   }
  
//   // 2. Check check-out status (only if check-out exists)
//   if (checkOutDate) {
//     // If check-out before shift end => early checkout
//     if (checkOutDate < shiftEnd) {
//       isEarlyCheckout = true;
//       const minutesEarly = Math.floor((shiftEnd - checkOutDate) / (1000 * 60));
//       earlyCheckoutMinutes = minutesEarly;
//     }
//     // If check-out after shift end => overtime
//     else if (checkOutDate > shiftEnd) {
//       isOvertime = true;
//       const minutesOvertime = Math.floor((checkOutDate - shiftEnd) / (1000 * 60));
//       overtimeMinutes = minutesOvertime;
//     }
//   }
  
//   // 3. If both check-in and check-out exist, determine final status
//   if (checkInDate && checkOutDate) {
//     // Calculate working hours
//     const workingMinutes = Math.floor((checkOutDate - checkInDate) / (1000 * 60));
    
//     // If worked less than half shift => half_day
//     if (workingMinutes < halfShiftThreshold && status !== "absent") {
//       status = "half_day";
//     }
//   }
  
//   return { status, isLate, lateMinutes, isEarlyCheckout, earlyCheckoutMinutes, isOvertime, overtimeMinutes };
// }

// export async function PUT(request) {
//   try {
//     await connectDB();

//     const token = request.cookies.get("token")?.value;
//     if (!token) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });

//     const decoded = verifyToken(token);
//     if (!decoded) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

//     const body = await request.json();
//     const { 
//       attendanceId, 
//       status: providedStatus, 
//       checkInTime: providedCheckInTime, 
//       checkOutTime: providedCheckOutTime, 
//       notes,
//       leaveReason,
//       leaveType 
//     } = body;

//     if (!attendanceId) {
//       return NextResponse.json({ success: false, message: "Attendance ID is required" }, { status: 400 });
//     }

//     // Find existing attendance with populated shift
//     const existingAttendance = await Attendance.findById(attendanceId)
//       .populate("user", "firstName lastName email")
//       .populate("agent", "agentName agentId email")
//       .populate("shift", "name startTime endTime");

//     if (!existingAttendance) {
//       return NextResponse.json({ success: false, message: "Attendance record not found" }, { status: 404 });
//     }

//     // Check if the date is holiday or weekly off - prevent editing
//     const attendanceDate = new Date(existingAttendance.createdAt);
//     const weeklyOff = await isWeeklyOff(attendanceDate);
//     const holiday = await isHoliday(attendanceDate);

//     if (holiday || weeklyOff) {
//       return NextResponse.json({ 
//         success: false, 
//         message: `Cannot edit attendance on ${holiday ? 'holiday' : 'weekly off'} days` 
//       }, { status: 400 });
//     }

//     // Determine if admin wants to manually set status
//     const adminManuallySettingStatus = providedStatus && providedStatus !== existingAttendance.status;
    
//     // Calculate check-in and check-out dates
//     let checkInDate = null;
//     let checkOutDate = null;
//     const baseDate = existingAttendance.date ? 
//       new Date(existingAttendance.date) : 
//       new Date(existingAttendance.createdAt);
//     const dateString = baseDate.toISOString().split('T')[0];
    
//     // Debug: log input times
//     console.log("DEBUG UPDATE: providedCheckInTime =", providedCheckInTime, "type:", typeof providedCheckInTime);
//     console.log("DEBUG UPDATE: providedCheckOutTime =", providedCheckOutTime, "type:", typeof providedCheckOutTime);
//     console.log("DEBUG UPDATE: dateString =", dateString);
    
//     // Helper function to convert Pakistan time (HH:MM) to UTC timestamp
//     const convertPakistaniTimeToUTC = (dateStr, timeStr) => {
//       if (!timeStr || typeof timeStr !== 'string') return null;
      
//       // Create date in Pakistan timezone: YYYY-MM-DD HH:MM
//       // Pakistan is UTC+5 (or UTC+5:30 during DST, but we'll use UTC+5)
//       const pakistanTzOffset = 5 * 60 * 60 * 1000; // 5 hours in milliseconds
      
//       // First, create as if it's UTC
//       const utcDate = new Date(`${dateStr}T${timeStr}:00Z`);
      
//       // Then subtract the timezone offset to get the correct UTC time
//       // If user entered 10:30 in Pakistan (UTC+5), the actual UTC time is 05:30
//       const correctUTCDate = new Date(utcDate.getTime() - pakistanTzOffset);
      
//       console.log(`DEBUG: Converting Pakistan time ${dateStr} ${timeStr} to UTC:`, correctUTCDate.toISOString());
//       return correctUTCDate;
//     };
    
//     // Handle check-in time
//     if (providedCheckInTime !== undefined && providedCheckInTime !== null) {
//       if (typeof providedCheckInTime === 'string' && providedCheckInTime.trim() !== "") {
//         checkInDate = convertPakistaniTimeToUTC(dateString, providedCheckInTime);
//         console.log("DEBUG UPDATE: Created checkInDate =", checkInDate, "ISO:", checkInDate?.toISOString());
//       } else {
//         checkInDate = null;
//       }
//     } else if (existingAttendance.checkInTime) {
//       checkInDate = new Date(existingAttendance.checkInTime);
//     }
    
//     // Handle check-out time
//     if (providedCheckOutTime !== undefined && providedCheckOutTime !== null) {
//       if (typeof providedCheckOutTime === 'string' && providedCheckOutTime.trim() !== "") {
//         checkOutDate = convertPakistaniTimeToUTC(dateString, providedCheckOutTime);
//         console.log("DEBUG UPDATE: Created checkOutDate =", checkOutDate, "ISO:", checkOutDate?.toISOString());
//       } else {
//         checkOutDate = null;
//       }
//     } else if (existingAttendance.checkOutTime) {
//       checkOutDate = new Date(existingAttendance.checkOutTime);
//     }
    
//     // Calculate status based on shift if admin didn't manually set status
//     let finalStatus = existingAttendance.status;
//     let finalIsLate = existingAttendance.isLate;
//     let finalLateMinutes = existingAttendance.lateMinutes;
//     let finalIsEarlyCheckout = existingAttendance.isEarlyCheckout;
//     let finalEarlyCheckoutMinutes = existingAttendance.earlyCheckoutMinutes;
//     let finalIsOvertime = existingAttendance.isOvertime;
//     let finalOvertimeMinutes = existingAttendance.overtimeMinutes;
    
//     // Only auto-calculate if admin didn't manually set status
//     if (!adminManuallySettingStatus && (providedCheckInTime !== undefined || providedCheckOutTime !== undefined)) {
//       const calculated = calculateStatusBasedOnShift(
//         checkInDate, 
//         checkOutDate, 
//         existingAttendance.shift, 
//         existingAttendance.status
//       );
      
//       finalStatus = calculated.status;
//       finalIsLate = calculated.isLate;
//       finalLateMinutes = calculated.lateMinutes;
//       finalIsEarlyCheckout = calculated.isEarlyCheckout;
//       finalEarlyCheckoutMinutes = calculated.earlyCheckoutMinutes;
//       finalIsOvertime = calculated.isOvertime;
//       finalOvertimeMinutes = calculated.overtimeMinutes;
//     } else if (adminManuallySettingStatus) {
//       // Use admin provided status
//       finalStatus = providedStatus;
      
//       // Reset auto-calculated fields if admin manually sets status
//       finalIsLate = false;
//       finalLateMinutes = 0;
//       finalIsEarlyCheckout = false;
//       finalEarlyCheckoutMinutes = 0;
//       finalIsOvertime = false;
//       finalOvertimeMinutes = 0;
//     }
    
//     // Update attendance data
//     const updateData = {
//       status: finalStatus,
//       isLate: finalIsLate,
//       lateMinutes: finalLateMinutes,
//       isEarlyCheckout: finalIsEarlyCheckout,
//       earlyCheckoutMinutes: finalEarlyCheckoutMinutes,
//       isOvertime: finalIsOvertime,
//       overtimeMinutes: finalOvertimeMinutes,
//       notes: notes !== undefined ? notes : existingAttendance.notes,
//       updatedAt: new Date()
//     };

//     // Handle check-in time
//     if (providedCheckInTime !== undefined) {
//       if (checkInDate && !isNaN(checkInDate.getTime())) {
//         updateData.checkInTime = checkInDate;
//         console.log("DEBUG UPDATE: Setting checkInTime in updateData =", checkInDate.toISOString());
//       } else {
//         updateData.checkInTime = null;
//         console.log("DEBUG UPDATE: Setting checkInTime to null");
//       }
//     }

//     // Handle check-out time
//     if (providedCheckOutTime !== undefined) {
//       if (checkOutDate && !isNaN(checkOutDate.getTime())) {
//         updateData.checkOutTime = checkOutDate;
//         console.log("DEBUG UPDATE: Setting checkOutTime in updateData =", checkOutDate.toISOString());
//       } else {
//         updateData.checkOutTime = null;
//         console.log("DEBUG UPDATE: Setting checkOutTime to null");
//       }
//     }
    
//     console.log("DEBUG UPDATE: Final updateData =", JSON.stringify(updateData, null, 2));

//     // Handle leave data
//     if (leaveReason !== undefined) {
//       updateData.leaveReason = leaveReason;
//     }
//     if (leaveType !== undefined) {
//       updateData.leaveType = leaveType;
//     }

//     // Update the attendance record
//     const updatedAttendance = await Attendance.findByIdAndUpdate(
//       attendanceId,
//       updateData,
//       { new: true, runValidators: true }
//     ).populate("user", "firstName lastName email")
//      .populate("agent", "agentName agentId email")
//      .populate("shift", "name startTime endTime");

//     return NextResponse.json({ 
//       success: true, 
//       message: "Attendance updated successfully", 
//       data: updatedAttendance 
//     });
//   } catch (error) {
//     console.error("PUT /api/attendance/update error:", error);
//     return NextResponse.json({ 
//       success: false, 
//       message: error.message 
//     }, { status: 500 });
//   }
// }


import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Attendance from "@/Models/Attendance";
import Holiday from "@/Models/Holiday";
import WeeklyOff from "@/Models/WeeklyOff";
import Shift from "@/Models/Shift";
import { verifyToken } from "@/lib/jwt";

// Function to check if date is weekly off
async function isWeeklyOff(date) {
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const weeklyOff = await WeeklyOff.findOne({ 
    day: dayName, 
    isActive: true 
  });
  return weeklyOff;
}

// Function to check if date is holiday
async function isHoliday(date) {
  const dateStart = new Date(date);
  dateStart.setHours(0, 0, 0, 0);
  const dateEnd = new Date(dateStart);
  dateEnd.setDate(dateEnd.getDate() + 1);

  const holiday = await Holiday.findOne({
    $or: [
      { date: { $gte: dateStart, $lt: dateEnd } },
      { 
        isRecurring: true,
        $expr: {
          $and: [
            { $eq: [{ $month: "$date" }, date.getMonth() + 1] },
            { $eq: [{ $dayOfMonth: "$date" }, date.getDate()] }
          ]
        }
      }
    ]
  });
  return holiday;
}

// Function to calculate status based on shift times
function calculateStatusBasedOnShift(checkInTime, checkOutTime, shift, existingStatus) {
  const GRACE_MINUTES = 15;
  let status = existingStatus;
  let isLate = false;
  let lateMinutes = 0;
  let isEarlyCheckout = false;
  let earlyCheckoutMinutes = 0;
  let isOvertime = false;
  let overtimeMinutes = 0;
  
  // If no shift, return existing status
  if (!shift || !shift.startTime || !shift.endTime) {
    return { status, isLate, lateMinutes, isEarlyCheckout, earlyCheckoutMinutes, isOvertime, overtimeMinutes };
  }
  
  // Parse times
  const checkInDate = checkInTime ? new Date(checkInTime) : null;
  const checkOutDate = checkOutTime ? new Date(checkOutTime) : null;
  
  // Get base date from check-in time
  const baseDate = checkInDate || new Date();
  const dateString = baseDate.toISOString().split('T')[0];
  
  // Create shift start and end times for that day
  const shiftStart = new Date(`${dateString}T${shift.startTime}`);
  const shiftEnd = new Date(`${dateString}T${shift.endTime}`);
  
  // Handle night shifts (end time next day)
  if (shiftEnd <= shiftStart) {
    shiftEnd.setDate(shiftEnd.getDate() + 1);
  }
  
  // Calculate full shift duration
  const fullShiftMinutes = Math.floor((shiftEnd - shiftStart) / (1000 * 60));
  const halfShiftThreshold = fullShiftMinutes / 2;
  const halfShiftTime = new Date(shiftStart.getTime() + halfShiftThreshold * 60 * 1000);
  
  // Grace period cutoff
  const graceCutoff = new Date(shiftStart.getTime() + GRACE_MINUTES * 60 * 1000);
  
  // 1. Check check-in status
  if (checkInDate) {
    // If check-in after shift end => absent
    if (checkInDate > shiftEnd) {
      status = "absent";
    }
    // If check-in after half shift => half_day
    else if (checkInDate >= halfShiftTime) {
      status = "half_day";
    }
    // If check-in after grace period => late
    else if (checkInDate > graceCutoff) {
      status = "late";
      isLate = true;
      const minutesLate = Math.floor((checkInDate - shiftStart) / (1000 * 60));
      lateMinutes = Math.max(0, minutesLate - GRACE_MINUTES);
    }
    // Otherwise present
    else {
      status = "present";
    }
  }
  
  // 2. Check check-out status (only if check-out exists)
  if (checkOutDate) {
    // If check-out before shift end => early checkout
    if (checkOutDate < shiftEnd) {
      isEarlyCheckout = true;
      const minutesEarly = Math.floor((shiftEnd - checkOutDate) / (1000 * 60));
      earlyCheckoutMinutes = minutesEarly;
    }
    // If check-out after shift end => overtime
    else if (checkOutDate > shiftEnd) {
      isOvertime = true;
      const minutesOvertime = Math.floor((checkOutDate - shiftEnd) / (1000 * 60));
      overtimeMinutes = minutesOvertime;
    }
  }
  
  // 3. If both check-in and check-out exist, determine final status
  if (checkInDate && checkOutDate) {
    // Calculate working hours
    const workingMinutes = Math.floor((checkOutDate - checkInDate) / (1000 * 60));
    
    // If worked less than half shift => half_day
    if (workingMinutes < halfShiftThreshold && status !== "absent") {
      status = "half_day";
    }
  }
  
  return { status, isLate, lateMinutes, isEarlyCheckout, earlyCheckoutMinutes, isOvertime, overtimeMinutes };
}

export async function PUT(request) {
  try {
    await connectDB();

    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

    const body = await request.json();
    const { 
      attendanceId, 
      status: providedStatus, 
      checkInTime: providedCheckInTime, 
      checkOutTime: providedCheckOutTime, 
      notes,
      leaveReason,
      leaveType,
      isInformed // NEW: Add informed status
    } = body;

    if (!attendanceId) {
      return NextResponse.json({ success: false, message: "Attendance ID is required" }, { status: 400 });
    }

    // Find existing attendance with populated shift
    const existingAttendance = await Attendance.findById(attendanceId)
      .populate("user", "firstName lastName email")
      .populate("agent", "agentName agentId email")
      .populate("shift", "name startTime endTime");

    if (!existingAttendance) {
      return NextResponse.json({ success: false, message: "Attendance record not found" }, { status: 404 });
    }

    // Check if the date is holiday or weekly off - prevent editing
    const attendanceDate = new Date(existingAttendance.createdAt);
    const weeklyOff = await isWeeklyOff(attendanceDate);
    const holiday = await isHoliday(attendanceDate);

    if (holiday || weeklyOff) {
      return NextResponse.json({ 
        success: false, 
        message: `Cannot edit attendance on ${holiday ? 'holiday' : 'weekly off'} days` 
      }, { status: 400 });
    }

    // Determine if admin wants to manually set status
    const adminManuallySettingStatus = providedStatus && providedStatus !== existingAttendance.status;
    
    // Calculate check-in and check-out dates
    let checkInDate = null;
    let checkOutDate = null;
    const baseDate = existingAttendance.date ? 
      new Date(existingAttendance.date) : 
      new Date(existingAttendance.createdAt);
    const dateString = baseDate.toISOString().split('T')[0];
    
    // Debug: log input times
    console.log("DEBUG UPDATE: providedCheckInTime =", providedCheckInTime, "type:", typeof providedCheckInTime);
    console.log("DEBUG UPDATE: providedCheckOutTime =", providedCheckOutTime, "type:", typeof providedCheckOutTime);
    console.log("DEBUG UPDATE: dateString =", dateString);
    
    // Helper function to convert Pakistan time (HH:MM) to UTC timestamp
    const convertPakistaniTimeToUTC = (dateStr, timeStr) => {
      if (!timeStr || typeof timeStr !== 'string') return null;
      
      // Pakistan is UTC+5
      const pakistanTzOffset = 5 * 60 * 60 * 1000; // 5 hours in milliseconds
      
      // First, create as if it's UTC
      const utcDate = new Date(`${dateStr}T${timeStr}:00Z`);
      
      // Then subtract the timezone offset to get the correct UTC time
      const correctUTCDate = new Date(utcDate.getTime() - pakistanTzOffset);
      
      console.log(`DEBUG: Converting Pakistan time ${dateStr} ${timeStr} to UTC:`, correctUTCDate.toISOString());
      return correctUTCDate;
    };
    
    // Handle check-in time
    if (providedCheckInTime !== undefined && providedCheckInTime !== null) {
      if (typeof providedCheckInTime === 'string' && providedCheckInTime.trim() !== "") {
        checkInDate = convertPakistaniTimeToUTC(dateString, providedCheckInTime);
        console.log("DEBUG UPDATE: Created checkInDate =", checkInDate, "ISO:", checkInDate?.toISOString());
      } else {
        checkInDate = null;
      }
    } else if (existingAttendance.checkInTime) {
      checkInDate = new Date(existingAttendance.checkInTime);
    }
    
    // Handle check-out time
    if (providedCheckOutTime !== undefined && providedCheckOutTime !== null) {
      if (typeof providedCheckOutTime === 'string' && providedCheckOutTime.trim() !== "") {
        checkOutDate = convertPakistaniTimeToUTC(dateString, providedCheckOutTime);
        console.log("DEBUG UPDATE: Created checkOutDate =", checkOutDate, "ISO:", checkOutDate?.toISOString());
      } else {
        checkOutDate = null;
      }
    } else if (existingAttendance.checkOutTime) {
      checkOutDate = new Date(existingAttendance.checkOutTime);
    }
    
    // Calculate status based on shift if admin didn't manually set status
    let finalStatus = existingAttendance.status;
    let finalIsLate = existingAttendance.isLate;
    let finalLateMinutes = existingAttendance.lateMinutes;
    let finalIsEarlyCheckout = existingAttendance.isEarlyCheckout;
    let finalEarlyCheckoutMinutes = existingAttendance.earlyCheckoutMinutes;
    let finalIsOvertime = existingAttendance.isOvertime;
    let finalOvertimeMinutes = existingAttendance.overtimeMinutes;
    
    // Only auto-calculate if admin didn't manually set status
    if (!adminManuallySettingStatus && (providedCheckInTime !== undefined || providedCheckOutTime !== undefined)) {
      const calculated = calculateStatusBasedOnShift(
        checkInDate, 
        checkOutDate, 
        existingAttendance.shift, 
        existingAttendance.status
      );
      
      finalStatus = calculated.status;
      finalIsLate = calculated.isLate;
      finalLateMinutes = calculated.lateMinutes;
      finalIsEarlyCheckout = calculated.isEarlyCheckout;
      finalEarlyCheckoutMinutes = calculated.earlyCheckoutMinutes;
      finalIsOvertime = calculated.isOvertime;
      finalOvertimeMinutes = calculated.overtimeMinutes;
    } else if (adminManuallySettingStatus) {
      // Use admin provided status
      finalStatus = providedStatus;
      
      // Reset auto-calculated fields if admin manually sets status
      finalIsLate = false;
      finalLateMinutes = 0;
      finalIsEarlyCheckout = false;
      finalEarlyCheckoutMinutes = 0;
      finalIsOvertime = false;
      finalOvertimeMinutes = 0;
    }
    
    // Update attendance data
    const updateData = {
      status: finalStatus,
      isLate: finalIsLate,
      lateMinutes: finalLateMinutes,
      isEarlyCheckout: finalIsEarlyCheckout,
      earlyCheckoutMinutes: finalEarlyCheckoutMinutes,
      isOvertime: finalIsOvertime,
      overtimeMinutes: finalOvertimeMinutes,
      notes: notes !== undefined ? notes : existingAttendance.notes,
      updatedAt: new Date()
    };

    // Handle check-in time
    if (providedCheckInTime !== undefined) {
      if (checkInDate && !isNaN(checkInDate.getTime())) {
        updateData.checkInTime = checkInDate;
        console.log("DEBUG UPDATE: Setting checkInTime in updateData =", checkInDate.toISOString());
      } else {
        updateData.checkInTime = null;
        console.log("DEBUG UPDATE: Setting checkInTime to null");
      }
    }

    // Handle check-out time
    if (providedCheckOutTime !== undefined) {
      if (checkOutDate && !isNaN(checkOutDate.getTime())) {
        updateData.checkOutTime = checkOutDate;
        console.log("DEBUG UPDATE: Setting checkOutTime in updateData =", checkOutDate.toISOString());
      } else {
        updateData.checkOutTime = null;
        console.log("DEBUG UPDATE: Setting checkOutTime to null");
      }
    }
    
    // NEW: Handle isInformed field
    if (isInformed !== undefined) {
      updateData.isInformed = isInformed;
    }
    
    console.log("DEBUG UPDATE: Final updateData =", JSON.stringify(updateData, null, 2));

    // Handle leave data
    if (leaveReason !== undefined) {
      updateData.leaveReason = leaveReason;
    }
    if (leaveType !== undefined) {
      updateData.leaveType = leaveType;
    }

    // Update the attendance record
    const updatedAttendance = await Attendance.findByIdAndUpdate(
      attendanceId,
      updateData,
      { new: true, runValidators: true }
    ).populate("user", "firstName lastName email")
     .populate("agent", "agentName agentId email")
     .populate("shift", "name startTime endTime");

    return NextResponse.json({ 
      success: true, 
      message: "Attendance updated successfully", 
      data: updatedAttendance 
    });
  } catch (error) {
    console.error("PUT /api/attendance/update error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}