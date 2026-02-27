// src/app/api/payroll/my/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Payroll from "@/Models/Payroll";
import { verifyToken, getUserIdFromToken } from "@/lib/jwt";
import Shift from "@/Models/Shift";
import Agent from "@/Models/Agent";
import Attendance from "@/Models/Attendance";
import Holiday from "@/Models/Holiday";
import WeeklyOff from "@/Models/WeeklyOff";

export async function GET(request) {
  try {
    await connectDB();
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    const agentId = getUserIdFromToken(decoded);
    
    // Query params for filtering
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    
    const query = { agent: agentId };
    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);

    const payrolls = await Payroll.find(query).sort({ year: -1, month: -1 });

    return NextResponse.json({ success: true, data: payrolls });
  } catch (error) {
    console.error("Fetch My Payroll Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
