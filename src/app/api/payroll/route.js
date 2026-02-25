// //src/app/api/payroll/route.js
// import { NextResponse } from "next/server";
// import connectDB from "@/lib/mongodb";
// import Attendance from "@/Models/Attendance";
// import Agent from "@/Models/Agent";
// import Payroll from "@/Models/Payroll";
// import Notification from "@/Models/Notification";
// import Holiday from "@/Models/Holiday";
// import WeeklyOff from "@/Models/WeeklyOff";
// import { verifyToken, getUserIdFromToken } from "@/lib/jwt";
// import { calculatePayrollLogic } from "@/lib/payrollUtils";
// import Shift from "@/Models/Shift";

// // -------------------------------------------------------------------------
// // CALCULATION LOGIC - Now imported from utils
// // -------------------------------------------------------------------------
// // Keeping a wrapper for backward compatibility
// async function calculatePayrollLogicWrapper(agentId, month, year, informedOverrides = {}, manualSalesOverride = null) {
//   // Call the centralized utility function
//   const result = await calculatePayrollLogic(agentId, month, year, informedOverrides, manualSalesOverride);
  
//   // Transform result to match expected format
//   return {
//     agent: result.agent,
//     stats: {
//       totalDaysInMonth: result.totalDaysInMonth,
//       workingDays: result.workingDays,
//       presentDays: result.presentDays,
//       totalLates: result.totalLates,
//       uninformedLates: result.uninformedLates,
//       informedLates: result.informedLates,
//       latePenaltyCount: result.latePenaltyCount,
//       uninformedAbsents: result.uninformedAbsents,
//       informedAbsents: result.informedAbsents,
//       convertedAbsents: result.convertedAbsents,
//       totalDeductableAbsentDays: result.uninformedAbsents + result.informedAbsents + result.convertedAbsents,
//       salesCount: result.salesCount,
//       revenue: result.revenue
//     },
//     financials: {
//       basicSalary: result.basicSalary,
//       perDaySalary: result.perDaySalary,
//       attendanceAllowance: result.attendanceAllowance,
//       lateDeductionAmount: Math.round(result.lateDeductionAmount),
//       absentDeductionAmount: Math.round(result.absentDeductionAmount),
//       earnedAllowance: result.earnedAllowance,
//       earnedIncentive: result.earnedIncentive,
//       grossSalary: result.grossSalary,
//       totalDeduction: Math.round(result.totalDeduction),
//       netSalary: Math.round(result.netSalary),
//       allowanceCutReason: result.allowanceCutReason || ""
//     },
//     processedRecords: result.processedRecords
//   };
// }

// // -------------------------------------------------------------------------
// // API ROUTES
// // -------------------------------------------------------------------------

// export async function GET(request) {
//     try {
//         await connectDB();
//         const url = new URL(request.url);
//         const params = url.searchParams;

//         const month = params.get('month');
//         const year = params.get('year');
//         const agent = params.get('agent');
//         const status = params.get('status');
//         const page = parseInt(params.get('page') || '1', 10);
//         const limit = parseInt(params.get('limit') || '10', 10);
//         const skip = (page - 1) * limit;

//         const query = {};
//         if (month && month !== 'all') {
//             const m = parseInt(month, 10);
//             if (!isNaN(m)) query.month = m;
//         }
//         if (year) {
//             const y = parseInt(year, 10);
//             if (!isNaN(y)) query.year = y;
//         }
        
//         // Handle agent search - can be by name or ID
//         if (agent && agent.trim()) {
//             const searchTerm = agent.trim();
//             // First, try to find agents matching the search term
//             const matchingAgents = await Agent.find({
//                 $or: [
//                     { agentName: { $regex: searchTerm, $options: 'i' } },
//                     { agentId: { $regex: searchTerm, $options: 'i' } },
//                     { firstName: { $regex: searchTerm, $options: 'i' } },
//                     { lastName: { $regex: searchTerm, $options: 'i' } },
//                     { email: { $regex: searchTerm, $options: 'i' } }
//                 ]
//             }).select('_id');
            
//             if (matchingAgents.length > 0) {
//                 query.agent = { $in: matchingAgents.map(a => a._id) };
//             } else {
//                 // If no agents found, return empty result
//                 query.agent = { $in: [] };
//             }
//         }
        
//         if (status && status !== 'all') query.status = status;

//         const [payrolls, total] = await Promise.all([
//             Payroll.find(query).populate('agent').sort({ year: -1, month: -1 }).skip(skip).limit(limit),
//             Payroll.countDocuments(query)
//         ]);

//         return NextResponse.json({ 
//             success: true, 
//             data: payrolls,
//             pagination: {
//                 total,
//                 page,
//                 limit,
//                 totalPages: Math.ceil(total / limit)
//             }
//         });
//     } catch (error) {
//         console.error('GET Payrolls Error:', error);
//         return NextResponse.json({ success: false, message: error.message }, { status: 500 });
//     }
// }

// export async function POST(request) {
//   try {
//     await connectDB();
//     const token = request.headers.get("authorization")?.split(" ")[1];
//     // if (!token || !verifyToken(token)) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
//     // Assuming middleware handles auth or we implement verifyToken here

//     const { action, agentId, month, year, informedOverrides, manualSalesOverride } = await request.json();

//     if (!agentId || !month || !year) {
//         return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
//     }

//     // 1. CALCULATE (Preview)
//     if (action === 'calculate') {
//         const calculation = await calculatePayrollLogicWrapper(agentId, month, year, informedOverrides, manualSalesOverride);
//         return NextResponse.json({ success: true, data: calculation });
//     }

//     // 2. GENERATE (Save)
//     if (action === 'generate') {
//          // Check if already exists
//          const exists = await Payroll.findOne({ agent: agentId, month, year });
//          if (exists) {
//              return NextResponse.json({ success: false, message: "Payroll already generated for this month" }, { status: 400 });
//          }

//          // Perform Calculation again to be safe
//          const calc =await calculatePayrollLogicWrapper(agentId, month, year, informedOverrides, manualSalesOverride);
//          const { stats, financials, processedRecords, agent } = calc;

//          // A. Update Attendance "isInformed" status permanently
//          // We only update records where override was true (to minimize DB writes)
//          // Actually, better to update all matching records based on the override map for consistency.
//          const updates = [];
//          if (informedOverrides) {
//              for (const [id, val] of Object.entries(informedOverrides)) {
//                  // Skip virtual IDs (gap filled days)
//                  if (id.startsWith('virtual-')) continue;
                 
//                  updates.push({
//                      updateOne: {
//                          filter: { _id: id },
//                          update: { $set: { isInformed: val } }
//                      }
//                  });
//              }
//          }
//          if (updates.length > 0) {
//              await Attendance.bulkWrite(updates);
//          }

//          // B. Create Payroll Record
//          const newPayroll = await Payroll.create({
//              agent: agentId,
//              month,
//              year,
//              basicSalary: financials.basicSalary,
//              attendanceAllowance: financials.attendanceAllowance,
//              perSaleIncentive: agent.perSaleIncentive || 0, // Fix: Save actual per sale rate
//              totalDaysInMonth: stats.totalDaysInMonth,
//              workingDays: stats.workingDays,
//              presentDays: stats.presentDays,
//              totalLates: stats.totalLates,
             
//              // Save detailed stats
//              uninformedLates: stats.uninformedLates,
//              informedLates: stats.informedLates,
//              uninformedAbsents: stats.uninformedAbsents,
//              informedAbsents: stats.informedAbsents,
//              convertedAbsents: stats.convertedAbsents,
//              absentDays: stats.uninformedAbsents + stats.informedAbsents,
//              latePenaltyCount: stats.latePenaltyCount,
             
//              // Sales stats
//              targetType: stats.targetType || 'none',
//              salesCount: stats.salesCount || 0,
//              revenue: stats.revenue || 0,
//              completedBookingsCount: calc.completedBookings?.length || 0,
//              completedProjectsCount: calc.completedProjects?.length || 0,

//              perDaySalary: financials.perDaySalary,
//              lateDeductionAmount: financials.lateDeductionAmount,
//              absentDeductionAmount: financials.absentDeductionAmount,
             
//              earnedAllowance: financials.earnedAllowance,
//              earnedIncentive: financials.earnedIncentive,
//              grossSalary: financials.grossSalary,
//              totalDeduction: financials.totalDeduction,
//              netSalary: financials.netSalary,
             
//              status: 'generated',
//              generatedBy: null // TODO: Get from token
//          });

//          // C. Send Notification
//          await Notification.create({
//             title: `Salary Generated for ${month}/${year}`,
//             message: `Your salary for ${month}/${year} has been generated. Net Salary: ${financials.netSalary}`,
//             type: "success",
//             targetType: "specific",
//             targetModel: "Agent",
//             targetUsers: [agentId]
//          });

//          return NextResponse.json({ success: true, message: "Payroll generated successfully", data: newPayroll });
//     }

//     return NextResponse.json({ success: false, message: "Invalid action" });

//   } catch (error) {
//     console.error("Payroll Error:", error);
//     return NextResponse.json({ success: false, message: error.message }, { status: 500 });
//   }
// }






import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Attendance from "@/Models/Attendance";
import Agent from "@/Models/Agent";
import Payroll from "@/Models/Payroll";
import Notification from "@/Models/Notification";
import Holiday from "@/Models/Holiday";
import WeeklyOff from "@/Models/WeeklyOff";
import { verifyToken, getUserIdFromToken } from "@/lib/jwt";
import { calculatePayrollLogic } from "@/lib/payrollUtils";
import Shift from "@/Models/Shift";

// -------------------------------------------------------------------------
<<<<<<< HEAD
// CALCULATION LOGIC - Wrapper for backward compatibility
// -------------------------------------------------------------------------
=======
// CALCULATION LOGIC - Now imported from utils
// -------------------------------------------------------------------------
// Keeping a wrapper for backward compatibility
>>>>>>> 9b9a343d88fc6a1e0f58f8ee4b853db9ddf556f7
async function calculatePayrollLogicWrapper(agentId, month, year, informedOverrides = {}, manualSalesOverride = null) {
  // Call the centralized utility function
  const result = await calculatePayrollLogic(agentId, month, year, informedOverrides, manualSalesOverride);
  
  // Transform result to match expected format
  return {
    agent: result.agent,
    stats: {
      totalDaysInMonth: result.totalDaysInMonth,
      workingDays: result.workingDays,
      presentDays: result.presentDays,
      totalLates: result.totalLates,
      uninformedLates: result.uninformedLates,
      informedLates: result.informedLates,
      latePenaltyCount: result.latePenaltyCount,
      uninformedAbsents: result.uninformedAbsents,
      informedAbsents: result.informedAbsents,
      convertedAbsents: result.convertedAbsents,
      totalDeductableAbsentDays: result.uninformedAbsents + result.informedAbsents + result.convertedAbsents,
      salesCount: result.salesCount,
      revenue: result.revenue
    },
    financials: {
      basicSalary: result.basicSalary,
      perDaySalary: result.perDaySalary,
      attendanceAllowance: result.attendanceAllowance,
      lateDeductionAmount: Math.round(result.lateDeductionAmount),
      absentDeductionAmount: Math.round(result.absentDeductionAmount),
      earnedAllowance: result.earnedAllowance,
      earnedIncentive: result.earnedIncentive,
      grossSalary: result.grossSalary,
      totalDeduction: Math.round(result.totalDeduction),
      netSalary: Math.round(result.netSalary),
      allowanceCutReason: result.allowanceCutReason || ""
    },
<<<<<<< HEAD
    processedRecords: result.processedRecords,
    completedBookings: result.completedBookings,
    completedProjects: result.completedProjects,
    description: result.description // ADD THIS
=======
    processedRecords: result.processedRecords
>>>>>>> 9b9a343d88fc6a1e0f58f8ee4b853db9ddf556f7
  };
}

// -------------------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------------------

export async function GET(request) {
    try {
        await connectDB();
        const url = new URL(request.url);
        const params = url.searchParams;

        const month = params.get('month');
        const year = params.get('year');
        const agent = params.get('agent');
        const status = params.get('status');
        const page = parseInt(params.get('page') || '1', 10);
        const limit = parseInt(params.get('limit') || '10', 10);
        const skip = (page - 1) * limit;

        const query = {};
        if (month && month !== 'all') {
            const m = parseInt(month, 10);
            if (!isNaN(m)) query.month = m;
        }
        if (year) {
            const y = parseInt(year, 10);
            if (!isNaN(y)) query.year = y;
        }
        
        // Handle agent search - can be by name or ID
        if (agent && agent.trim()) {
            const searchTerm = agent.trim();
            // First, try to find agents matching the search term
            const matchingAgents = await Agent.find({
                $or: [
                    { agentName: { $regex: searchTerm, $options: 'i' } },
                    { agentId: { $regex: searchTerm, $options: 'i' } },
                    { firstName: { $regex: searchTerm, $options: 'i' } },
                    { lastName: { $regex: searchTerm, $options: 'i' } },
                    { email: { $regex: searchTerm, $options: 'i' } }
                ]
            }).select('_id');
            
            if (matchingAgents.length > 0) {
                query.agent = { $in: matchingAgents.map(a => a._id) };
            } else {
                // If no agents found, return empty result
                query.agent = { $in: [] };
            }
        }
        
        if (status && status !== 'all') query.status = status;

        const [payrolls, total] = await Promise.all([
            Payroll.find(query)
                .populate('agent')
                .sort({ year: -1, month: -1 })
                .skip(skip)
                .limit(limit),
            Payroll.countDocuments(query)
        ]);

        return NextResponse.json({ 
            success: true, 
            data: payrolls,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('GET Payrolls Error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function POST(request) {
  try {
    await connectDB();
    const token = request.headers.get("authorization")?.split(" ")[1];
    // if (!token || !verifyToken(token)) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { action, agentId, month, year, informedOverrides, manualSalesOverride } = await request.json();

    if (!agentId || !month || !year) {
        return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    // 1. CALCULATE (Preview)
    if (action === 'calculate') {
        const calculation = await calculatePayrollLogicWrapper(agentId, month, year, informedOverrides, manualSalesOverride);
        return NextResponse.json({ success: true, data: calculation });
    }

    // 2. GENERATE (Save)
    if (action === 'generate') {
         // Check if already exists
         const exists = await Payroll.findOne({ agent: agentId, month, year });
         if (exists) {
             return NextResponse.json({ success: false, message: "Payroll already generated for this month" }, { status: 400 });
         }

         // Perform Calculation again to be safe
<<<<<<< HEAD
         const calc = await calculatePayrollLogicWrapper(agentId, month, year, informedOverrides, manualSalesOverride);
         const { stats, financials, processedRecords, agent, description } = calc;
=======
         const calc =await calculatePayrollLogicWrapper(agentId, month, year, informedOverrides, manualSalesOverride);
         const { stats, financials, processedRecords, agent } = calc;
>>>>>>> 9b9a343d88fc6a1e0f58f8ee4b853db9ddf556f7

         // A. Update Attendance "isInformed" status permanently
         const updates = [];
         if (informedOverrides) {
             for (const [id, val] of Object.entries(informedOverrides)) {
                 // Skip virtual IDs (gap filled days)
                 if (id.startsWith('virtual-')) continue;
                 
                 updates.push({
                     updateOne: {
                         filter: { _id: id },
                         update: { $set: { isInformed: val } }
                     }
                 });
             }
         }
         if (updates.length > 0) {
             await Attendance.bulkWrite(updates);
         }

         // B. Create Payroll Record with description
         const newPayroll = await Payroll.create({
             agent: agentId,
             month,
             year,
             basicSalary: financials.basicSalary,
             attendanceAllowance: financials.attendanceAllowance,
             perSaleIncentive: agent.perSaleIncentive || 0,
             totalDaysInMonth: stats.totalDaysInMonth,
             workingDays: stats.workingDays,
             presentDays: stats.presentDays,
             totalLates: stats.totalLates,
             
             // Save detailed stats with informed breakdown
             uninformedLates: stats.uninformedLates,
             informedLates: stats.informedLates,
             uninformedAbsents: stats.uninformedAbsents,
             informedAbsents: stats.informedAbsents,
             convertedAbsents: stats.convertedAbsents,
             absentDays: stats.uninformedAbsents + stats.informedAbsents,
             latePenaltyCount: stats.latePenaltyCount,
             
             // Sales stats
             targetType: stats.targetType || 'none',
             salesCount: stats.salesCount || 0,
             revenue: stats.revenue || 0,
             completedBookingsCount: calc.completedBookings?.length || 0,
             completedProjectsCount: calc.completedProjects?.length || 0,

             perDaySalary: financials.perDaySalary,
             lateDeductionAmount: financials.lateDeductionAmount,
             absentDeductionAmount: financials.absentDeductionAmount,
             
             earnedAllowance: financials.earnedAllowance,
             earnedIncentive: financials.earnedIncentive,
             grossSalary: financials.grossSalary,
             totalDeduction: financials.totalDeduction,
             netSalary: financials.netSalary,
             
             status: 'generated',
             notes: financials.allowanceCutReason ? `Allowance Cut: ${financials.allowanceCutReason}` : "",
             description: description || "", // ADD THIS
             generatedBy: null
         });

         // C. Send Notification
         await Notification.create({
            title: `Salary Generated for ${month}/${year}`,
            message: `Your salary for ${month}/${year} has been generated. Net Salary: PKR ${financials.netSalary.toLocaleString()}`,
            type: "success",
            targetType: "specific",
            targetModel: "Agent",
            targetUsers: [agentId]
         });

         return NextResponse.json({ 
             success: true, 
             message: "Payroll generated successfully", 
             data: newPayroll 
         });
    }

    return NextResponse.json({ success: false, message: "Invalid action" });

  } catch (error) {
    console.error("Payroll Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}