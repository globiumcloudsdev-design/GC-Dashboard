// src/app/api/payroll/my/generate/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Attendance from "@/Models/Attendance";
import Agent from "@/Models/Agent";
import Payroll from "@/Models/Payroll";
import Holiday from "@/Models/Holiday";
import WeeklyOff from "@/Models/WeeklyOff";
import { verifyToken, getUserIdFromToken } from "@/lib/jwt";
import { calculatePayrollLogic } from "@/lib/payrollUtils";


export async function POST(request) {
  try {
    await connectDB();
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

    const agentId = getUserIdFromToken(decoded);
    const { month, year, manualSalesOverride } = await request.json();

    if (!month || !year) {
        return NextResponse.json({ success: false, message: "Month and Year required" }, { status: 400 });
    }

    // Check if exists
    const existing = await Payroll.findOne({ agent: agentId, month, year });
    
    // Calculate using centralized utility
    const result = await calculatePayrollLogic(agentId, month, year, {}, manualSalesOverride);

    // Prepare payroll data
    const payrollData = {
      agent: agentId,
      month,
      year,
      basicSalary: result.basicSalary,
      attendanceAllowance: result.attendanceAllowance,
      perSaleIncentive: result.agent.perSaleIncentive || 0,
      
      totalDaysInMonth: result.totalDaysInMonth,
      workingDays: result.workingDays,
      presentDays: result.presentDays,
      totalLates: result.totalLates,
      
      uninformedLates: result.uninformedLates,
      informedLates: result.informedLates,
      uninformedAbsents: result.uninformedAbsents,
      informedAbsents: result.informedAbsents,
      convertedAbsents: result.convertedAbsents,
      absentDays: result.uninformedAbsents + result.informedAbsents,
      latePenaltyCount: result.latePenaltyCount,
      
      // Sales stats
      targetType: result.targetType || 'none',
      salesCount: result.salesCount || 0,
      revenue: result.revenue || 0,
      completedBookingsCount: result.completedBookings?.length || 0,
      completedProjectsCount: result.completedProjects?.length || 0,
      
      perDaySalary: result.perDaySalary,
      lateDeductionAmount: Math.round(result.lateDeductionAmount),
      absentDeductionAmount: Math.round(result.absentDeductionAmount),
      
      earnedAllowance: result.earnedAllowance,
      earnedIncentive: result.earnedIncentive,
      grossSalary: result.grossSalary,
      totalDeduction: Math.round(result.totalDeduction),
      netSalary: Math.round(result.netSalary),
      
      status: "generated",
      notes: result.allowanceCutReason ? `Allowance Cut: ${result.allowanceCutReason}` : "",
      generatedBy: agentId,
      generatedAt: new Date()
    };

    let savedPayroll;
    if (existing) {
        // Update existing (Regenerate)
        if (existing.status === 'paid') {
             return NextResponse.json({ success: false, message: "Payroll is already PAID. Cannot regenerate." }, { status: 400 });
        }
        Object.assign(existing, payrollData);
        savedPayroll = await existing.save();
    } else {
        savedPayroll = await Payroll.create(payrollData);
    }

    return NextResponse.json({ success: true, data: savedPayroll });

  } catch (error) {
    console.error("Generate My Payroll Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
