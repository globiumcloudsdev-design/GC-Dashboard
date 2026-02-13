// // src/lib/payrollUtils.js
// import Agent from '@/Models/Agent';
// import Attendance from '@/Models/Attendance';
// import Holiday from '@/Models/Holiday';
// import WeeklyOff from '@/Models/WeeklyOff';
// import Booking from '@/Models/Booking';
// import PromoCode from '@/Models/PromoCode';
// import Project from '@/Models/Project';

// /**
//  * Normalize attendance status to standardized values
//  */
// function normalizeStatus(s) {
//   if (!s) return "absent";
//   const str = String(s).toLowerCase();
//   if (["present", "late", "half_day", "half-day", "early_checkout", "overtime"].some(x => str.includes(x))) return "present";
//   if (['approved_leave', 'leave'].includes(str)) return "leave";
//   if (['holiday', 'weekly_off'].includes(str)) return "holiday";
//   return "absent";
// }

// /**
//  * Get late minutes from attendance record
//  */
// function getLateMinutes(attendance) {
//   return attendance.lateMinutes || 0;
// }

// /**
//  * Calculate sales count and revenue based on agent's target type
//  * @param {String} agentId - Agent's MongoDB ID
//  * @param {Number} month - Month (1-12)
//  * @param {Number} year - Year
//  * @param {String} targetType - 'digit', 'amount', 'both', or 'none'
//  * @returns {Object} { salesCount, revenue, completedBookings, completedProjects }
//  */
// async function calculateAgentSales(agentId, month, year, targetType) {
//   const startDate = new Date(Date.UTC(year, month - 1, 1));
//   const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));

//   let salesCount = 0;
//   let revenue = 0;
//   let completedBookings = [];
//   let completedProjects = [];

//   // For Digit Target: Count Bookings via Promo Codes
//   if (targetType === 'digit' || targetType === 'both') {
//     // Get all promo codes for this agent
//     const agentPromoCodes = await PromoCode.find({ agentId }).select('_id');
//     const promoCodeIds = agentPromoCodes.map(pc => pc._id);

//     // Find bookings that were completed in this month with agent's promo codes
//     completedBookings = await Booking.find({
//       promoCodeId: { $in: promoCodeIds },
//       status: 'completed', // Only completed bookings count
//       // Check if completed date falls in this month
//       $or: [
//         { completedAt: { $gte: startDate, $lte: endDate } },
//         // Fallback to updatedAt if completedAt not set
//         { 
//           completedAt: { $exists: false },
//           updatedAt: { $gte: startDate, $lte: endDate },
//           status: 'completed'
//         }
//       ]
//     }).populate('promoCodeId');

//     salesCount = completedBookings.length;
//   }

//   // For Revenue Target: Count Projects
//   if (targetType === 'amount' || targetType === 'both') {
//     // Find projects assigned to this agent that were completed in this month
//     completedProjects = await Project.find({
//       assignedAgent: agentId,
//       status: 'completed',
//       completedAt: { $gte: startDate, $lte: endDate }
//     });

//     // Sum up project prices for revenue
//     revenue = completedProjects.reduce((sum, project) => sum + (project.price || 0), 0);
//   }

//   return {
//     salesCount,
//     revenue,
//     completedBookings,
//     completedProjects
//   };
// }

// /**
//  * Main Payroll Calculation Logic
//  * @param {String} agentId - Agent's MongoDB ID
//  * @param {Number} month - Month (1-12)
//  * @param {Number} year - Year
//  * @param {Object} informedOverrides - Map of attendanceId or date to informed status
//  * @param {Number} manualSalesOverride - Manual sales count override (for zero sales agents)
//  * @returns {Object} Complete payroll calculation details
//  */
// export async function calculatePayrollLogic(agentId, month, year, informedOverrides = {}, manualSalesOverride = null) {
//   // Fetch agent with shift details
//   const agent = await Agent.findById(agentId).populate('shift');
//   if (!agent) throw new Error('Agent not found');

//   // Date Range
//   const startDate = new Date(Date.UTC(year, month - 1, 1));
//   const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));
//   const totalDaysInMonth = new Date(year, month, 0).getDate();

//   // Fetch Attendance Records
//   const attendanceRecords = await Attendance.find({
//     agent: agentId,
//     date: { $gte: startDate, $lte: endDate }
//   }).sort({ date: 1 });

//   // Fetch Holidays & Weekly Offs
//   const holidays = await Holiday.find({ date: { $gte: startDate, $lte: endDate } });
//   const weeklyOffs = await WeeklyOff.find({});

//   // --- GAP FILLING LOGIC ---
//   const fullMonthRecords = [];
//   const attendanceMap = new Map();
//   attendanceRecords.forEach(r => {
//     const dateStr = new Date(r.date).toISOString().split('T')[0];
//     attendanceMap.set(dateStr, r);
//   });

//   const holidayList = holidays.map(h => new Date(h.date).toISOString().split('T')[0]);
//   const weeklyDays = new Set();
//   weeklyOffs.forEach(wo => {
//     if (wo.day) weeklyDays.add(wo.day.toLowerCase());
//     if (wo.days && Array.isArray(wo.days)) {
//       wo.days.forEach(d => weeklyDays.add(d.toLowerCase()));
//     }
//   });

//   // Fill all days of the month
//   for (let day = 1; day <= totalDaysInMonth; day++) {
//     const currentDate = new Date(Date.UTC(year, month - 1, day));
//     const dateStr = currentDate.toISOString().split('T')[0];
//     const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

//     let record = attendanceMap.get(dateStr);
    
//     if (!record) {
//       // Create virtual record
//       let virtualStatus = 'absent';
      
//       if (holidayList.includes(dateStr)) {
//         virtualStatus = 'holiday';
//       } else if (weeklyDays.has(dayName)) {
//         virtualStatus = 'weekly_off';
//       }

//       record = {
//         _id: `virtual-${dateStr}`,
//         agent: agentId,
//         date: currentDate,
//         status: virtualStatus,
//         lateMinutes: 0,
//         isVirtual: true
//       };
//     }

//     fullMonthRecords.push(record);
//   }

//   // Process records with informed overrides
//   const processedRecords = fullMonthRecords.map(record => {
//     const recordId = record._id.toString();
//     const dateStr = new Date(record.date).toISOString().split('T')[0];
//     const overrideKey = informedOverrides[recordId] !== undefined ? recordId : `virtual-${dateStr}`;
    
//     const isInformed = informedOverrides[overrideKey] === true;
//     const status = normalizeStatus(record.status);
//     const lateMinutes = getLateMinutes(record);

//     return {
//       ...record,
//       normalizedStatus: status,
//       lateMinutes,
//       isInformed,
//       isLatePenalty: lateMinutes > 20
//     };
//   });

//   // Calculate Attendance Stats
//   let uninformedLates = 0;
//   let informedLates = 0;
//   let informedAbsents = 0;
//   let uninformedAbsents = 0;
//   let latePenaltyCount = 0;
//   let presentDays = 0;
//   let totalLates = 0;

//   processedRecords.forEach(rec => {
//     const status = rec.normalizedStatus;

//     if (status === 'present') {
//       presentDays++;
      
//       if (rec.lateMinutes > 0) {
//         totalLates++;
//         if (rec.isInformed) {
//           informedLates++;
//         } else {
//           uninformedLates++;
//         }

//         if (rec.isLatePenalty) {
//           latePenaltyCount++;
//         }
//       }
//     } else if (status === 'absent') {
//       if (rec.isInformed) {
//         informedAbsents++;
//       } else {
//         uninformedAbsents++;
//       }
//     }
//   });

//   // --- CALCULATE SALES & INCENTIVES ---
//   const targetType = agent.monthlyTargetType || 'none';
//   let salesData = { salesCount: 0, revenue: 0, completedBookings: [], completedProjects: [] };

//   // Use manual override if provided, otherwise calculate
//   if (manualSalesOverride !== null && manualSalesOverride !== undefined) {
//     if (targetType === 'digit' || targetType === 'both') {
//       salesData.salesCount = manualSalesOverride;
//     } else if (targetType === 'amount') {
//       salesData.revenue = manualSalesOverride;
//     }
//   } else {
//     salesData = await calculateAgentSales(agentId, month, year, targetType);
//   }

//   // Calculate Incentive based on target type
//   let earnedIncentive = 0;
//   const perSaleIncentive = agent.perSaleIncentive || 0;

//   if (targetType === 'digit') {
//     // Incentive per completed booking
//     earnedIncentive = salesData.salesCount * perSaleIncentive;
//   } else if (targetType === 'amount') {
//     // Incentive based on revenue (you can implement percentage or fixed per project)
//     // For now: perSaleIncentive per project
//     earnedIncentive = salesData.completedProjects.length * perSaleIncentive;
//   } else if (targetType === 'both') {
//     // Combine both
//     const bookingIncentive = salesData.salesCount * perSaleIncentive;
//     const projectIncentive = salesData.completedProjects.length * perSaleIncentive;
//     earnedIncentive = bookingIncentive + projectIncentive;
//   }

//   // --- FINANCIALS ---
//   const basicSalary = agent.basicSalary || 0;
//   const attendanceAllowance = agent.attendanceAllowance || 0;
//   const perDaySalary = basicSalary / totalDaysInMonth;

//   // Rule 1: Absent Deduction (3 Uninformed Lates = 1 Absent)
//   const convertedAbsents = Math.floor(uninformedLates / 3);
//   const totalDeductableAbsentDays = uninformedAbsents + informedAbsents + convertedAbsents;
//   const absentDeductionAmount = totalDeductableAbsentDays * perDaySalary;

//   // Rule 2: Late Penalty (> 20 mins = 1.16% of basic salary)
//   const lateDeductionAmount = latePenaltyCount * (basicSalary * 0.0116);

//   // Rule 3: Allowance Cut
//   let isAllowanceCut = false;
//   let allowanceCutReason = "";
  
//   if (informedLates >= 5) {
//     isAllowanceCut = true;
//     allowanceCutReason = "5+ Informed Lates";
//   }
//   if (informedAbsents >= 3) {
//     isAllowanceCut = true;
//     allowanceCutReason = allowanceCutReason ? allowanceCutReason + " & 3+ Informed Absents" : "3+ Informed Absents";
//   }

//   const earnedAllowance = isAllowanceCut ? 0 : attendanceAllowance;

//   // Calculate Totals
//   const grossSalary = basicSalary + earnedAllowance + earnedIncentive;
//   const totalDeduction = absentDeductionAmount + lateDeductionAmount;
//   const netSalary = grossSalary - totalDeduction;

//   // Working Days (exclude holidays and weekly offs)
//   const workingDays = processedRecords.filter(r => 
//     r.normalizedStatus !== 'holiday' && r.normalizedStatus !== 'weekly_off'
//   ).length;

//   return {
//     agent,
//     month,
//     year,
//     totalDaysInMonth,
//     workingDays,
//     presentDays,
    
//     // Attendance Stats
//     totalLates,
//     uninformedLates,
//     informedLates,
//     latePenaltyCount,
//     absentDays: uninformedAbsents + informedAbsents,
//     uninformedAbsents,
//     informedAbsents,
//     convertedAbsents,
    
//     // Sales Stats
//     targetType,
//     salesCount: salesData.salesCount,
//     revenue: salesData.revenue,
//     completedBookings: salesData.completedBookings,
//     completedProjects: salesData.completedProjects,
    
//     // Financials
//     basicSalary,
//     attendanceAllowance,
//     perSaleIncentive,
//     perDaySalary,
    
//     // Deductions
//     absentDeductionAmount,
//     lateDeductionAmount,
//     totalDeduction,
    
//     // Allowances
//     earnedAllowance,
//     earnedIncentive,
//     isAllowanceCut,
//     allowanceCutReason,
    
//     // Totals
//     grossSalary,
//     netSalary,
    
//     // Metadata
//     processedRecords
//   };
// }

// /**
//  * Check if agent has zero sales for the month
//  * @param {String} agentId 
//  * @param {Number} month 
//  * @param {Number} year 
//  * @returns {Boolean}
//  */
// export async function checkAgentHasZeroSales(agentId, month, year) {
//   const agent = await Agent.findById(agentId);
//   if (!agent) throw new Error('Agent not found');

//   const targetType = agent.monthlyTargetType || 'none';
//   if (targetType === 'none') return false; // No target, no sales to check

//   const salesData = await calculateAgentSales(agentId, month, year, targetType);

//   if (targetType === 'digit' || targetType === 'both') {
//     if (salesData.salesCount === 0) return true;
//   }
  
//   if (targetType === 'amount' || targetType === 'both') {
//     if (salesData.revenue === 0) return true;
//   }

//   return false;
// }

// /**
//  * Get all agents with their sales status for a given month
//  * @param {Number} month 
//  * @param {Number} year 
//  * @returns {Array} Array of agents with their sales status
//  */
// export async function getAllAgentsSalesStatus(month, year) {
//   const agents = await Agent.find({ isActive: true }).select('_id agentName agentId monthlyTargetType monthlyDigitTarget monthlyAmountTarget');
  
//   const results = await Promise.all(agents.map(async (agent) => {
//     const targetType = agent.monthlyTargetType || 'none';
    
//     if (targetType === 'none') {
//       return {
//         agent,
//         hasTarget: false,
//         hasZeroSales: false,
//         salesData: null
//       };
//     }

//     const salesData = await calculateAgentSales(agent._id, month, year, targetType);
    
//     let hasZeroSales = false;
//     if (targetType === 'digit' && salesData.salesCount === 0) hasZeroSales = true;
//     if (targetType === 'amount' && salesData.revenue === 0) hasZeroSales = true;
//     if (targetType === 'both' && salesData.salesCount === 0 && salesData.revenue === 0) hasZeroSales = true;

//     return {
//       agent,
//       hasTarget: true,
//       hasZeroSales,
//       salesData,
//       targetType
//     };
//   }));

//   return results;
// }









import Agent from '@/Models/Agent';
import Attendance from '@/Models/Attendance';
import Holiday from '@/Models/Holiday';
import WeeklyOff from '@/Models/WeeklyOff';
import Booking from '@/Models/Booking';
import PromoCode from '@/Models/PromoCode';
import Project from '@/Models/Project';

/**
 * Normalize attendance status to standardized values
 */
function normalizeStatus(s, isInformed = false) {
  if (!s) return "absent";
  const str = String(s).toLowerCase();
  
  // Present categories (including informed late as present)
  if (["present", "late", "half_day", "half-day", "early_checkout", "overtime"].some(x => str.includes(x))) {
    // If it's late and informed, treat as present for attendance calculation
    if (str.includes("late") && isInformed) {
      return "present";
    }
    // If it's late and uninformed, keep as late for tracking
    if (str.includes("late")) {
      return "late";
    }
    return "present";
  }
  
  // Leave categories
  if (['approved_leave', 'leave'].includes(str)) return "leave";
  
  // Non-working days
  if (['holiday', 'weekly_off'].includes(str)) return "holiday";
  
  // Absent
  return "absent";
}

/**
 * Get late minutes from attendance record
 */
function getLateMinutes(attendance) {
  return attendance.lateMinutes || 0;
}

/**
 * Calculate sales count and revenue based on agent's target type
 */
async function calculateAgentSales(agentId, month, year, targetType) {
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));

  let salesCount = 0;
  let revenue = 0;
  let completedBookings = [];
  let completedProjects = [];

  // For Digit Target: Count Bookings via Promo Codes
  if (targetType === 'digit' || targetType === 'both') {
    const agentPromoCodes = await PromoCode.find({ agentId }).select('_id');
    const promoCodeIds = agentPromoCodes.map(pc => pc._id);

    completedBookings = await Booking.find({
      promoCodeId: { $in: promoCodeIds },
      status: 'completed',
      $or: [
        { completedAt: { $gte: startDate, $lte: endDate } },
        { 
          completedAt: { $exists: false },
          updatedAt: { $gte: startDate, $lte: endDate },
          status: 'completed'
        }
      ]
    }).populate('promoCodeId');

    salesCount = completedBookings.length;
  }

  // For Revenue Target: Count Projects
  if (targetType === 'amount' || targetType === 'both') {
    completedProjects = await Project.find({
      assignedAgent: agentId,
      status: 'completed',
      completedAt: { $gte: startDate, $lte: endDate }
    });

    revenue = completedProjects.reduce((sum, project) => sum + (project.price || 0), 0);
  }

  return {
    salesCount,
    revenue,
    completedBookings,
    completedProjects
  };
}

/**
 * Generate auto description for payroll
 */
export function generatePayrollDescription(payrollData) {
  const {
    agent,
    month,
    year,
    totalDaysInMonth,
    presentDays,
    totalLates,
    uninformedLates,
    informedLates,
    uninformedAbsents,
    informedAbsents,
    convertedAbsents,
    latePenaltyCount,
    salesCount,
    revenue,
    basicSalary,
    attendanceAllowance,
    perSaleIncentive,
    perDaySalary,
    lateDeductionAmount,
    absentDeductionAmount,
    earnedAllowance,
    earnedIncentive,
    grossSalary,
    totalDeduction,
    netSalary,
    isAllowanceCut,
    allowanceCutReason,
    targetType
  } = payrollData;

  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
  const agentName = agent?.agentName || 'Agent';
  
  let description = `📊 SALARY DETAILS - ${agentName}\n`;
  description += `📅 ${monthName} ${year}\n`;
  description += `═`.repeat(50) + `\n\n`;
  
  // 1. Basic Info
  description += `📌 ATTENDANCE SUMMARY\n`;
  description += `┌─────────────────────────────────┐\n`;
  description += `│ Total Days in Month  : ${totalDaysInMonth.toString().padEnd(10)} │\n`;
  description += `│ Present Days         : ${presentDays.toString().padEnd(10)} │\n`;
  description += `│ Absent Days          : ${(uninformedAbsents + informedAbsents).toString().padEnd(10)} │\n`;
  description += `└─────────────────────────────────┘\n\n`;
  
  // 2. Late Details
  if (totalLates > 0) {
    description += `⏰ LATE ARRIVALS\n`;
    description += `┌─────────────────────────────────┐\n`;
    description += `│ Total Lates          : ${totalLates.toString().padEnd(10)} │\n`;
    description += `│ Informed Lates       : ${informedLates.toString().padEnd(10)} │\n`;
    description += `│ Uninformed Lates     : ${uninformedLates.toString().padEnd(10)} │\n`;
    if (latePenaltyCount > 0) {
      description += `│ Penalty Lates (>20m) : ${latePenaltyCount.toString().padEnd(10)} │\n`;
    }
    if (convertedAbsents > 0) {
      description += `│ Converted to Absents : ${convertedAbsents.toString().padEnd(10)} │\n`;
      description += `│ (3 uninformed lates = 1 absent)   │\n`;
    }
    description += `└─────────────────────────────────┘\n\n`;
  }
  
  // 3. Sales Performance
  if (targetType !== 'none') {
    description += `📈 SALES PERFORMANCE\n`;
    description += `┌─────────────────────────────────┐\n`;
    if (targetType === 'digit' || targetType === 'both') {
      description += `│ Sales Completed      : ${(salesCount || 0).toString().padEnd(10)} │\n`;
    }
    if (targetType === 'amount' || targetType === 'both') {
      description += `│ Revenue Generated    : PKR ${(revenue?.toLocaleString() || '0').padEnd(10)} │\n`;
    }
    description += `│ Incentive Rate       : PKR ${(perSaleIncentive || 0).toLocaleString().padEnd(10)} │\n`;
    if (earnedIncentive > 0) {
      description += `│ Incentive Earned     : PKR ${earnedIncentive.toLocaleString().padEnd(10)} │\n`;
    }
    description += `└─────────────────────────────────┘\n\n`;
  }
  
  // 4. Salary Breakdown
  description += `💰 SALARY BREAKDOWN\n`;
  description += `┌─────────────────────────────────────┐\n`;
  description += `│ Basic Salary          : PKR ${basicSalary.toLocaleString().padStart(12)} │\n`;
  
  if (attendanceAllowance > 0) {
    if (isAllowanceCut) {
      description += `│ Attendance Allowance  : PKR ${'0'.padStart(12)} (CUT) │\n`;
      description += `│ Cut Reason            : ${(allowanceCutReason || '').padEnd(20)} │\n`;
    } else {
      description += `│ Attendance Allowance  : PKR ${attendanceAllowance.toLocaleString().padStart(12)} │\n`;
    }
  }
  
  if (earnedIncentive > 0) {
    description += `│ Performance Incentive : PKR ${earnedIncentive.toLocaleString().padStart(12)} │\n`;
  }
  
  description += `├─────────────────────────────────────┤\n`;
  description += `│ GROSS SALARY          : PKR ${grossSalary.toLocaleString().padStart(12)} │\n`;
  description += `└─────────────────────────────────────┘\n\n`;
  
  // 5. Deductions
  if (totalDeduction > 0) {
    description += `💸 DEDUCTIONS\n`;
    description += `┌─────────────────────────────────────┐\n`;
    
    if (absentDeductionAmount > 0) {
      const totalAbsentDays = uninformedAbsents + informedAbsents + convertedAbsents;
      description += `│ Absent Deduction      : PKR ${absentDeductionAmount.toLocaleString().padStart(12)} │\n`;
      description += `│ (${totalAbsentDays} days × PKR ${perDaySalary.toFixed(0)}/day)           │\n`;
    }
    
    if (lateDeductionAmount > 0) {
      description += `│ Late Penalty          : PKR ${lateDeductionAmount.toLocaleString().padStart(12)} │\n`;
      description += `│ (${latePenaltyCount} lates >20 mins × 1.16%)          │\n`;
    }
    
    description += `├─────────────────────────────────────┤\n`;
    description += `│ TOTAL DEDUCTIONS      : PKR ${totalDeduction.toLocaleString().padStart(12)} │\n`;
    description += `└─────────────────────────────────────┘\n\n`;
  }
  
  // 6. Final Salary
  description += `✅ NET SALARY\n`;
  description += `┌─────────────────────────────────────┐\n`;
  description += `│                                   │\n`;
  description += `│     PKR ${netSalary.toLocaleString().padStart(20)}      │\n`;
  description += `│                                   │\n`;
  description += `└─────────────────────────────────────┘\n\n`;
  
  // 7. Rules Summary
  description += `📋 RULES APPLIED\n`;
  description += `• Per Day Salary = Basic ÷ Total Days = PKR ${perDaySalary.toFixed(0)}\n`;
  description += `• 3 Uninformed Lates = 1 Absent Day\n`;
  description += `• Late >20 mins (Uninformed) = 1.16% penalty per late\n`;
  description += `• Allowance Cut Conditions:\n`;
  description += `  - 5+ Informed Lates = Allowance Cut\n`;
  description += `  - 3+ Informed Absents = Allowance Cut\n`;
  
  if (isAllowanceCut) {
    description += `  ⚠️ Allowance was CUT due to: ${allowanceCutReason}\n`;
  } else {
    description += `  ✅ Allowance fully earned\n`;
  }
  
  description += `\n🕐 Generated: ${new Date().toLocaleString('en-PK', { 
    timeZone: 'Asia/Karachi',
    dateStyle: 'full',
    timeStyle: 'medium'
  })}`;
  
  return description;
}

/**
 * Main Payroll Calculation Logic
 */
export async function calculatePayrollLogic(agentId, month, year, informedOverrides = {}, manualSalesOverride = null) {
  // Fetch agent with shift details
  const agent = await Agent.findById(agentId).populate('shift');
  if (!agent) throw new Error('Agent not found');

  // Date Range
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));
  const totalDaysInMonth = new Date(year, month, 0).getDate();

  // Fetch Attendance Records with isInformed field
  const attendanceRecords = await Attendance.find({
    agent: agentId,
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: 1 });

  // Fetch Holidays & Weekly Offs
  const holidays = await Holiday.find({ date: { $gte: startDate, $lte: endDate } });
  const weeklyOffs = await WeeklyOff.find({});

  // --- GAP FILLING LOGIC ---
  const fullMonthRecords = [];
  const attendanceMap = new Map();
  attendanceRecords.forEach(r => {
    const dateStr = new Date(r.date).toISOString().split('T')[0];
    attendanceMap.set(dateStr, r);
  });

  const holidayList = holidays.map(h => new Date(h.date).toISOString().split('T')[0]);
  const weeklyDays = new Set();
  weeklyOffs.forEach(wo => {
    if (wo.day) weeklyDays.add(wo.day.toLowerCase());
    if (wo.days && Array.isArray(wo.days)) {
      wo.days.forEach(d => weeklyDays.add(d.toLowerCase()));
    }
  });

  // Fill all days of the month
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const currentDate = new Date(Date.UTC(year, month - 1, day));
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    let record = attendanceMap.get(dateStr);
    
    if (!record) {
      // Create virtual record
      let virtualStatus = 'absent';
      
      if (holidayList.includes(dateStr)) {
        virtualStatus = 'holiday';
      } else if (weeklyDays.has(dayName)) {
        virtualStatus = 'weekly_off';
      }

      record = {
        _id: `virtual-${dateStr}`,
        agent: agentId,
        date: currentDate,
        status: virtualStatus,
        lateMinutes: 0,
        isVirtual: true,
        isInformed: false
      };
    }

    fullMonthRecords.push(record);
  }

  // Process records with informed overrides
  const processedRecords = fullMonthRecords.map(record => {
    const recordId = record._id.toString();
    const dateStr = new Date(record.date).toISOString().split('T')[0];
    const overrideKey = informedOverrides[recordId] !== undefined ? recordId : `virtual-${dateStr}`;
    
    const isInformed = informedOverrides[overrideKey] === true || record.isInformed === true;
    const normalizedStatus = normalizeStatus(record.status, isInformed);
    const lateMinutes = getLateMinutes(record);

    return {
      ...record,
      normalizedStatus,
      lateMinutes,
      isInformed,
      isLatePenalty: lateMinutes > 20 && !isInformed && record.status === 'late'
    };
  });

  // Calculate Attendance Stats
  let uninformedLates = 0;
  let informedLates = 0;
  let informedAbsents = 0;
  let uninformedAbsents = 0;
  let latePenaltyCount = 0;
  let presentDays = 0;
  let totalLates = 0;

  processedRecords.forEach(rec => {
    const status = rec.normalizedStatus;

    if (status === 'present' || status === 'late' || status === 'early_checkout') {
      presentDays++;
      
      if (rec.lateMinutes > 0 && rec.status === 'late') {
        totalLates++;
        if (rec.isInformed) {
          informedLates++;
        } else {
          uninformedLates++;
        }

        if (rec.isLatePenalty) {
          latePenaltyCount++;
        }
      }
    } 
    else if (status === 'absent') {
      if (rec.isInformed) {
        informedAbsents++;
      } else {
        uninformedAbsents++;
      }
    }
  });

  // --- CALCULATE SALES & INCENTIVES ---
  const targetType = agent.monthlyTargetType || 'none';
  let salesData = { salesCount: 0, revenue: 0, completedBookings: [], completedProjects: [] };

  if (manualSalesOverride !== null && manualSalesOverride !== undefined) {
    if (targetType === 'digit' || targetType === 'both') {
      salesData.salesCount = manualSalesOverride;
    } else if (targetType === 'amount') {
      salesData.revenue = manualSalesOverride;
    }
  } else {
    salesData = await calculateAgentSales(agentId, month, year, targetType);
  }

  // Calculate Incentive
  let earnedIncentive = 0;
  const perSaleIncentive = agent.perSaleIncentive || 0;

  if (targetType === 'digit') {
    earnedIncentive = salesData.salesCount * perSaleIncentive;
  } else if (targetType === 'amount') {
    earnedIncentive = salesData.completedProjects.length * perSaleIncentive;
  } else if (targetType === 'both') {
    const bookingIncentive = salesData.salesCount * perSaleIncentive;
    const projectIncentive = salesData.completedProjects.length * perSaleIncentive;
    earnedIncentive = bookingIncentive + projectIncentive;
  }

  // --- FINANCIALS ---
  const basicSalary = agent.basicSalary || 0;
  const attendanceAllowance = agent.attendanceAllowance || 0;
  const perDaySalary = basicSalary / totalDaysInMonth;

  // Rule 1: Absent Deduction
  const convertedAbsents = Math.floor(uninformedLates / 3);
  const totalDeductableAbsentDays = uninformedAbsents + informedAbsents + convertedAbsents;
  const absentDeductionAmount = totalDeductableAbsentDays * perDaySalary;

  // Rule 2: Late Penalty
  const lateDeductionAmount = latePenaltyCount * (basicSalary * 0.0116);

  // Rule 3: Allowance Cut
  let isAllowanceCut = false;
  let allowanceCutReason = "";
  
  if (informedLates >= 5) {
    isAllowanceCut = true;
    allowanceCutReason = "5+ Informed Lates";
  }
  
  if (informedAbsents >= 3) {
    isAllowanceCut = true;
    allowanceCutReason = allowanceCutReason 
      ? allowanceCutReason + " & 3+ Informed Absents" 
      : "3+ Informed Absents";
  }

  const earnedAllowance = isAllowanceCut ? 0 : attendanceAllowance;

  // Calculate Totals
  const grossSalary = basicSalary + earnedAllowance + earnedIncentive;
  const totalDeduction = absentDeductionAmount + lateDeductionAmount;
  const netSalary = grossSalary - totalDeduction;

  // Working Days
  const workingDays = processedRecords.filter(r => 
    r.normalizedStatus !== 'holiday' && r.normalizedStatus !== 'weekly_off'
  ).length;

  // Prepare result object
  const result = {
    agent,
    month,
    year,
    totalDaysInMonth,
    workingDays,
    presentDays,
    
    totalLates,
    uninformedLates,
    informedLates,
    latePenaltyCount,
    absentDays: uninformedAbsents + informedAbsents,
    uninformedAbsents,
    informedAbsents,
    convertedAbsents,
    
    targetType,
    salesCount: salesData.salesCount,
    revenue: salesData.revenue,
    completedBookings: salesData.completedBookings,
    completedProjects: salesData.completedProjects,
    
    basicSalary,
    attendanceAllowance,
    perSaleIncentive,
    perDaySalary,
    
    absentDeductionAmount,
    lateDeductionAmount,
    totalDeduction,
    
    earnedAllowance,
    earnedIncentive,
    isAllowanceCut,
    allowanceCutReason,
    
    grossSalary,
    netSalary,
    
    processedRecords
  };

  // Generate description
  result.description = generatePayrollDescription(result);

  return result;
}

/**
 * Check if agent has zero sales for the month
 */
export async function checkAgentHasZeroSales(agentId, month, year) {
  const agent = await Agent.findById(agentId);
  if (!agent) throw new Error('Agent not found');

  const targetType = agent.monthlyTargetType || 'none';
  if (targetType === 'none') return false;

  const salesData = await calculateAgentSales(agentId, month, year, targetType);

  if (targetType === 'digit' || targetType === 'both') {
    if (salesData.salesCount === 0) return true;
  }
  
  if (targetType === 'amount' || targetType === 'both') {
    if (salesData.revenue === 0) return true;
  }

  return false;
}

/**
 * Get all agents with their sales status for a given month
 */
export async function getAllAgentsSalesStatus(month, year) {
  const agents = await Agent.find({ isActive: true }).select('_id agentName agentId monthlyTargetType monthlyDigitTarget monthlyAmountTarget');
  
  const results = await Promise.all(agents.map(async (agent) => {
    const targetType = agent.monthlyTargetType || 'none';
    
    if (targetType === 'none') {
      return {
        agent,
        hasTarget: false,
        hasZeroSales: false,
        salesData: null
      };
    }

    const salesData = await calculateAgentSales(agent._id, month, year, targetType);
    
    let hasZeroSales = false;
    if (targetType === 'digit' && salesData.salesCount === 0) hasZeroSales = true;
    if (targetType === 'amount' && salesData.revenue === 0) hasZeroSales = true;
    if (targetType === 'both' && salesData.salesCount === 0 && salesData.revenue === 0) hasZeroSales = true;

    return {
      agent,
      hasTarget: true,
      hasZeroSales,
      salesData,
      targetType
    };
  }));

  return results;
}