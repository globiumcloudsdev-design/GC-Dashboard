// app/api/attendance/agent/[id]/first-date/route.js
import { NextResponse } from 'next/server';
import connectDB from "@/lib/mongodb";
import Attendance from "@/Models/Attendance";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    
    // Find first attendance date for this agent
    const firstAttendance = await Attendance.findOne({ agentId: id })
      .sort({ date: 1 })
      .select('date')
      .lean();
    
    return NextResponse.json({
      success: true,
      firstDate: firstAttendance?.date || null
    });
  } catch (error) {
    console.error('Error fetching first attendance date:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch first attendance date' },
      { status: 500 }
    );
  }
}