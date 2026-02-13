import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Attendance from "@/Models/Attendance";
import { verifyToken } from "@/lib/jwt";

/**
 * POST /api/attendance/inform
 * Body: { attendanceId, isInformed, reason }
 * This API allows marking attendance as informed (for late/absent)
 */
export async function POST(request) {
  try {
    await connectDB();
    
    // Authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ 
        success: false, 
        message: "Not authenticated" 
      }, { status: 401 });
    }
    
    const token = authHeader.replace("Bearer ", "");
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid token" 
      }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const { attendanceId, isInformed, reason } = body;

    // Validation
    if (!attendanceId) {
      return NextResponse.json({ 
        success: false, 
        message: "Attendance ID is required" 
      }, { status: 400 });
    }

    if (isInformed === undefined || isInformed === null) {
      return NextResponse.json({ 
        success: false, 
        message: "isInformed field is required" 
      }, { status: 400 });
    }

    // Find attendance record
    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
      return NextResponse.json({ 
        success: false, 
        message: "Attendance record not found" 
      }, { status: 404 });
    }

    // Update informed status
    attendance.isInformed = isInformed;
    
    // Add reason to notes if provided
    if (reason) {
      attendance.notes = attendance.notes 
        ? `${attendance.notes} | Informed: ${reason}`
        : `Informed: ${reason}`;
    }
    
    // If marking as informed and status is "late", optionally change to "present"
    // This depends on your business logic
    if (isInformed && attendance.status === "late") {
      // Option 1: Keep as "late" but mark informed (for tracking)
      // Option 2: Change to "present" (no penalty)
      // I recommend keeping as "late" for tracking but with isInformed=true
      // attendance.status = "present"; // Uncomment if you want to change status
    }
    
    await attendance.save();

    // Populate for response
    const populated = await Attendance.findById(attendance._id)
      .populate("user", "firstName lastName email")
      .populate("agent", "agentName agentId email")
      .populate("shift", "name startTime endTime");

    return NextResponse.json({
      success: true,
      message: `Attendance marked as ${isInformed ? 'informed' : 'uninformed'} successfully`,
      data: populated
    });

  } catch (error) {
    console.error("Inform attendance error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}

/**
 * GET /api/attendance/inform?attendanceId=xxx
 * Get informed status of an attendance record
 */
export async function GET(request) {
  try {
    await connectDB();
    
    // Authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ 
        success: false, 
        message: "Not authenticated" 
      }, { status: 401 });
    }
    
    const token = authHeader.replace("Bearer ", "");
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid token" 
      }, { status: 401 });
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const attendanceId = searchParams.get("attendanceId");
    const date = searchParams.get("date");
    const userId = searchParams.get("userId");
    const userType = searchParams.get("userType") || "agent";

    // Build query
    let query = {};
    
    if (attendanceId) {
      query._id = attendanceId;
    } else if (date && userId) {
      const dateStart = new Date(date);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(dateStart);
      dateEnd.setDate(dateEnd.getDate() + 1);
      
      query = {
        ...(userType === "agent" ? { agent: userId } : { user: userId }),
        $or: [
          { date: { $gte: dateStart, $lt: dateEnd } },
          { checkInTime: { $gte: dateStart, $lt: dateEnd } }
        ]
      };
    } else {
      return NextResponse.json({ 
        success: false, 
        message: "Either attendanceId or (date and userId) is required" 
      }, { status: 400 });
    }

    // Find attendance
    const attendance = await Attendance.findOne(query)
      .populate("user", "firstName lastName email")
      .populate("agent", "agentName agentId email");

    if (!attendance) {
      return NextResponse.json({ 
        success: false, 
        message: "Attendance record not found" 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        attendanceId: attendance._id,
        isInformed: attendance.isInformed,
        status: attendance.status,
        notes: attendance.notes,
        date: attendance.date || attendance.createdAt,
        user: attendance.user || attendance.agent
      }
    });

  } catch (error) {
    console.error("Get informed status error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}