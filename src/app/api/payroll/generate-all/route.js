// src/app/api/payroll/generate-all/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Agent from "@/Models/Agent";
import Payroll from "@/Models/Payroll";
import { calculatePayrollLogic, getAllAgentsSalesStatus } from "@/lib/payrollUtils";
import { createAndSendNotification } from "@/lib/notificationHelper";

/**
 * POST - Bulk Generate Payroll for All Active Agents
 * Body: { month, year, skipZeroSales, manualOverrides: { agentId: salesValue } }
 * skipZeroSales: true = first pass (show preview for zero sales)
 * skipZeroSales: false = second pass (generate for all including zero sales)
 * Returns: { success, data: { generated[], failed[], zeroSales[] } }
 */
export async function POST(request) {
  try {
    await connectDB();

    const { month, year, skipZeroSales = true, manualOverrides = {} } = await request.json();

    if (!month || !year) {
      return NextResponse.json({
        success: false,
        message: "Month and Year are required"
      }, { status: 400 });
    }

    // Get all active agents with their sales status
    const agentsStatus = await getAllAgentsSalesStatus(month, year);

    const results = {
      generated: [],
      failed: [],
      zeroSales: [],
      alreadyGenerated: []
    };

    // Process each agent
    for (const agentStatus of agentsStatus) {
      const { agent, hasTarget, hasZeroSales, salesData, targetType } = agentStatus;

      try {
        // Check if already exists
        const existing = await Payroll.findOne({
          agent: agent._id,
          month,
          year
        });

        if (existing) {
          results.alreadyGenerated.push({
            agentId: agent._id,
            agentName: agent.agentName,
            message: "Payroll already generated"
          });
          continue;
        }

        // If has zero sales - handle based on skipZeroSales flag
        if (hasZeroSales && skipZeroSales) {
          // First pass: Calculate preview and add to zeroSales list (don't generate yet)
          const previewResult = await calculatePayrollLogic(
            agent._id,
            month,
            year,
            {}, // No informed overrides
            0 // Zero sales
          );

          results.zeroSales.push({
            agentId: agent._id,
            agentName: agent.agentName,
            agentCode: agent.agentId,
            targetType,
            monthlyDigitTarget: agent.monthlyDigitTarget,
            monthlyAmountTarget: agent.monthlyAmountTarget,
            targetCurrency: agent.targetCurrency || 'PKR',
            salesData: {
              salesCount: salesData?.salesCount || 0,
              revenue: salesData?.revenue || 0
            },
            // Preview salary calculation
            previewSalary: {
              basicSalary: previewResult.basicSalary,
              attendanceAllowance: previewResult.attendanceAllowance,
              earnedAllowance: previewResult.earnedAllowance,
              presentDays: previewResult.presentDays,
              totalDaysInMonth: previewResult.totalDaysInMonth,
              uninformedLates: previewResult.uninformedLates,
              informedLates: previewResult.informedLates,
              uninformedAbsents: previewResult.uninformedAbsents,
              informedAbsents: previewResult.informedAbsents,
              latePenaltyCount: previewResult.latePenaltyCount,
              absentDeductionAmount: Math.round(previewResult.absentDeductionAmount),
              lateDeductionAmount: Math.round(previewResult.lateDeductionAmount),
              totalDeduction: Math.round(previewResult.totalDeduction),
              grossSalary: previewResult.grossSalary,
              netSalary: Math.round(previewResult.netSalary),
              allowanceCutReason: previewResult.allowanceCutReason || ""
            }
          });
          continue;
        }

        // Second pass (skipZeroSales=false): Generate payroll for all agents
        // Get manual override if provided, otherwise use null (attendance-based salary only)
        // Important: Use explicit undefined check to preserve zero values
        const manualSalesOverride = manualOverrides[agent._id.toString()] !== undefined
          ? manualOverrides[agent._id.toString()]
          : null;

        // Calculate payroll
        const result = await calculatePayrollLogic(
          agent._id,
          month,
          year,
          {}, // No informed overrides for bulk generation
          manualSalesOverride
        );

        // Create payroll record
        const payroll = await Payroll.create({
          agent: agent._id,
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

          status: 'generated',
          notes: result.allowanceCutReason ? `Allowance Cut: ${result.allowanceCutReason}` : ""
        });

        // Send notification to agent (Database + FCM Push)
        await createAndSendNotification({
          title: `Salary Generated for ${month}/${year}`,
          message: `Your salary for ${month}/${year} has been generated. Net Salary: PKR ${Math.round(result.netSalary).toLocaleString()}`,
          type: "info",
          targetType: "specific",
          targetModel: "Agent",
          targetUsers: [agent._id]
        });

        results.generated.push({
          agentId: agent._id,
          agentName: agent.agentName,
          agentCode: agent.agentId,
          netSalary: Math.round(result.netSalary),
          salesCount: result.salesCount,
          revenue: result.revenue
        });

      } catch (error) {
        console.error(`Error generating payroll for agent ${agent.agentName}:`, error);
        results.failed.push({
          agentId: agent._id,
          agentName: agent.agentName,
          agentCode: agent.agentId,
          error: error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Payroll generation completed. Generated: ${results.generated.length}, Failed: ${results.failed.length}, Zero Sales: ${results.zeroSales.length}, Already Generated: ${results.alreadyGenerated.length}`,
      data: results
    });

  } catch (error) {
    console.error("Bulk Generate Payroll Error:", error);
    return NextResponse.json({
      success: false,
      message: error.message
    }, { status: 500 });
  }
}