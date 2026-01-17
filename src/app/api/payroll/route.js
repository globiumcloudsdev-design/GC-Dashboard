import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Attendance from "@/Models/Attendance";
import Agent from "@/Models/Agent";
import Payroll from "@/Models/Payroll";
import Notification from "@/Models/Notification";
import Holiday from "@/Models/Holiday";
import WeeklyOff from "@/Models/WeeklyOff";
import { verifyToken, getUserIdFromToken } from "@/lib/jwt";

// Helper: Normalize status
function normalizeStatus(s) {
  if (!s) return "absent";
  const str = String(s).toLowerCase();
  if (["present", "late", "half_day", "half-day", "early_checkout", "overtime"].some(x => str.includes(x))) return "present";
  if (['approved_leave', 'leave'].includes(str)) return "leave";
  if (['holiday', 'weekly_off'].includes(str)) return "off";
  return "absent";
}

function getLateMinutes(attendance) {
  return attendance.lateMinutes || 0;
}

// -------------------------------------------------------------------------
// CALCULATION LOGIC
// -------------------------------------------------------------------------
async function calculatePayrollLogic(agentId, month, year, informedOverrides = {}, salesCount = 0) {
  const agent = await Agent.findById(agentId).populate('shift');
  if (!agent) throw new Error("Agent not found");

  // Date Range
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));
  const totalDaysInMonth = new Date(year, month, 0).getDate();

  // Fetch Attendance
  const attendanceRecords = await Attendance.find({
    agent: agentId,
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: 1 });

  // Fetch Holidays & Weekly Offs
  const holidays = await Holiday.find({ date: { $gte: startDate, $lte: endDate } });
  const weeklyOffs = await WeeklyOff.find({}); // Assuming simple schema with days

  // --- GAP FILLING LOGIC ---
  // We need to ensure we have a record for EVERY day in the month.
  // If not in DB -> Check Holiday -> Check WeeklyOff -> Else Absent.
  
  const fullMonthRecords = [];
  const attendanceMap = new Map();
  attendanceRecords.forEach(r => {
      // Key by date ONLY (YYYY-MM-DD to avoid time mismatch)
      const d = new Date(r.date).toISOString().split('T')[0];
      attendanceMap.set(d, r);
  });

  const holidayList = holidays.map(h => new Date(h.date).toISOString().split('T')[0]);
  const weeklyDays = new Set();
  weeklyOffs.forEach(wo => {
     if(wo.day) weeklyDays.add(wo.day.toLowerCase()); // mon, tue...
     if(wo.days) wo.days.forEach(d => weeklyDays.add(d.toLowerCase()));
  });

  for (let day = 1; day <= totalDaysInMonth; day++) {
      const currentDate = new Date(Date.UTC(year, month - 1, day));
      const dateStr = currentDate.toISOString().split('T')[0];
      
      if (attendanceMap.has(dateStr)) {
          fullMonthRecords.push(attendanceMap.get(dateStr));
      } else {
          // Missing Record logic
          let status = 'absent';
          const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase(); // mon, tue
          
          if (holidayList.includes(dateStr)) {
              status = 'holiday';
          } else if (weeklyDays.has(dayName)) {
              status = 'weekly_off';
          }

          // Create "Virtual" record (not saved to DB, just for calculation)
          fullMonthRecords.push({
              _id: `virtual-${dateStr}`, // Fake ID for key
              date: currentDate,
              status,
              agent: agentId,
              checkInTime: null,
              checkOutTime: null,
              lateMinutes: 0,
              isInformed: false, // Default false for virtual absent
              isVirtual: true // Flag for UI
          });
      }
  }

  // Map overrides (from UI checkbox) to records & Calculate dynamic late minutes
  // informedOverrides is a map: { "attendanceId": true/false } or { "virtual-DATE": true/false }
  const processedRecords = fullMonthRecords.map(record => {
    // If it's a mongoose doc, convert to object
    const recObj = record.toObject ? record.toObject() : { ...record };
    
    // Use override if provided
    if (informedOverrides[recObj._id] !== undefined) {
        recObj.isInformed = informedOverrides[recObj._id];
    }
    
    // Dynamic Late Calculation (if missing in DB)
    if ((!recObj.lateMinutes || recObj.lateMinutes === 0) && recObj.checkInTime && agent.shift) {
        // We need to compare CheckIn time vs Shift Start time in "Asia/Karachi" (PKT)
        // because shift times (e.g. "09:00") are stored in local time.
        
        const checkInDate = new Date(recObj.checkInTime);
        
        // Convert CheckIn to PKT String to extract hours correctly
        // "en-PK" might not be available on all nodes, but "en-US" with timeZone works reliably.
        const checkInPKTString = checkInDate.toLocaleString("en-US", { timeZone: "Asia/Karachi", hour12: false });
        // Result format example for 9:30 PM: "1/11/2026, 21:30:00"
        
        const timePart = checkInPKTString.split(', ')[1]; // "21:30:00"
        const [cHour, cMin] = timePart.split(':').map(Number);
        
        const [sHour, sMin] = agent.shift.startTime.split(':').map(Number);
        
        // Convert both to rough "minutes from midnight" for comparison
        const checkInMinutes = cHour * 60 + cMin;
        const shiftStartMinutes = sHour * 60 + sMin;
        
        // Late if CheckIn > ShiftStart + Grace? (No grace logic mentioned here, strict math for now)
        if (checkInMinutes > shiftStartMinutes) {
             const diffMins = checkInMinutes - shiftStartMinutes;
             
             // Update if calculation found a late
             if (diffMins > 0) {
                 recObj.lateMinutes = diffMins;
                 // Override Status if it was present merely because they showed up
                 if (recObj.status === 'present' || recObj.status === 'Present') {
                     recObj.status = 'late';
                 }
             }
        }
    }
    
    return recObj;
  });

  // Financials
  const basicSalary = agent.basicSalary || 0;
  const attendanceAllowance = agent.attendanceAllowance || 0;
  // Per day salary (Standard is usually / 30, but let's use actual days in month for accuracy or 30 as standard)
  // Industry standard often 30. Let's use totalDaysInMonth for now.
  const perDaySalary = basicSalary / totalDaysInMonth; 

  // Stats Counters
  let uninformedLates = 0;
  let informedLates = 0;
  let informedAbsents = 0; // "Absent" status but marked informed
  let uninformedAbsents = 0; // "Absent" status and NOT informed
  let latePenaltyCount = 0; // Lates > 20 mins
  let presentDays = 0; // Count of days present/late/half-day
  
  // We need to count assumed absents if no record exists? 
  // For 'Generate', we usually assume missing records are absent.
  // BUT the frontend modal only shows existing records.
  // Ideally, 'Absent' records should be generated daily or by the 'gap filling' logic.
  // Here we will assume the caller has ensured attendance records exist (e.g. via Auto Attendance) 
  // OR we count missing days as keys.
  // For simplicity MVP: We only calculate based on *existing* records where status='absent'
  // or logic handles missing days. The previous "Enriched" API helps view, but here we query DB.
  // *Critical*: The admin should run "Auto Attendance" before generating payroll to fill gaps.

  processedRecords.forEach(record => {
    const status = String(record.status).toLowerCase();
    const isInformed = record.isInformed;

    // Count Present Days
    if (["present", "late", "half_day", "half-day", "early_checkout", "overtime"].includes(status)) {
        presentDays++;
    }

    if (status === 'late') {
       if (isInformed) {
         informedLates++;
       } else {
         uninformedLates++;
       }

       // Late > 20 mins rule
       if (record.lateMinutes > 20) {
           latePenaltyCount++;
       }
    } else if (status === 'absent') {
        if (isInformed) {
            informedAbsents++;
        } else {
            uninformedAbsents++;
        }
    }
  });

  // --- Rule 1: Absent Deduction ---
  // 3 Uninformed Lates = 1 Absent
  const convertedAbsents = Math.floor(uninformedLates / 3);
  const totalDeductableAbsentDays = uninformedAbsents + informedAbsents + convertedAbsents;
  
  const absentDeductionAmount = totalDeductableAbsentDays * perDaySalary;

  // --- Rule 2: Late Penalty (> 20 mins) ---
  // Interpretation Update:
  // Late > 20 mins is a SEVERITY penalty and applies immediately regardless of the count.
  // The "3 Lates = 1 Absent" rule handles the frequency/habitual lateness.
  
  const totalLates = informedLates + uninformedLates; // Define totalLates for use in stats
  let lateDeductionAmount = 0;
  
  processedRecords.forEach(record => {
      if (record.status === 'late') {
          // Rule: If late > 20 mins, deduct 1.16% of basic salary
          if (record.lateMinutes > 20) {
              lateDeductionAmount += (basicSalary * 0.0116);
          }
      }
  });

  // --- Rule 3: Allowance Cut ---
  // 5 times inform late = Allowance Cut
  // 3 times inform absent = Allowance Cut
  // "Attendance allowance cut" usually means it becomes 0.
  
  let isAllowanceCut = false;
  let allowanceCutReason = "";

  if (informedLates >= 5) {
      isAllowanceCut = true;
      allowanceCutReason = "5+ Informed Lates";
  }
  if (informedAbsents >= 3) {
      isAllowanceCut = true;
      allowanceCutReason = isAllowanceCut ? allowanceCutReason + " & 3+ Informed Absents" : "3+ Informed Absents";
  }

  const finalAllowance = isAllowanceCut ? 0 : attendanceAllowance;
  
  // --- Incentive ---
  const earnedIncentive = salesCount > 0 ? (salesCount * (agent.perSaleIncentive || 0)) : 0;

  // --- Final Calculation ---
  const grossSalary = basicSalary + finalAllowance + earnedIncentive;
  const totalDeduction = absentDeductionAmount + lateDeductionAmount;
  const netSalary = grossSalary - totalDeduction;

  return {
    agent,
    stats: {
        totalDaysInMonth,
        workingDays: totalDaysInMonth, // Simplified for now (assuming all days working unless marked off)
        presentDays,
        totalLates,
        uninformedLates,
        informedLates,
        latePenaltyCount, // Raw count > 20
        uninformedAbsents,
        informedAbsents,
        convertedAbsents,
        totalDeductableAbsentDays
    },
    financials: {
        basicSalary,
        perDaySalary,
        attendanceAllowance,
        lateDeductionAmount: Math.round(lateDeductionAmount),
        absentDeductionAmount: Math.round(absentDeductionAmount),
        earnedAllowance: finalAllowance,
        earnedIncentive,
        grossSalary,
        totalDeduction: Math.round(totalDeduction),
        netSalary: Math.round(netSalary),
        allowanceCutReason
    },
    processedRecords // Return these so UI can see what logic occurred
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

        const query = {};
        if (month && month !== 'all') {
            const m = parseInt(month, 10);
            if (!isNaN(m)) query.month = m;
        }
        if (year) {
            const y = parseInt(year, 10);
            if (!isNaN(y)) query.year = y;
        }
        if (agent) query.agent = agent;
        if (status && status !== 'all') query.status = status;

        const payrolls = await Payroll.find(query).populate('agent').sort({ year: -1, month: -1 });

        return NextResponse.json({ success: true, data: payrolls });
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
    // Assuming middleware handles auth or we implement verifyToken here

    const { action, agentId, month, year, informedOverrides, salesCount } = await request.json();

    if (!agentId || !month || !year) {
        return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    // 1. CALCULATE (Preview)
    if (action === 'calculate') {
        const calculation = await calculatePayrollLogic(agentId, month, year, informedOverrides, salesCount);
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
         const calc = await calculatePayrollLogic(agentId, month, year, informedOverrides, salesCount);
         const { stats, financials, processedRecords, agent } = calc;

         // A. Update Attendance "isInformed" status permanently
         // We only update records where override was true (to minimize DB writes)
         // Actually, better to update all matching records based on the override map for consistency.
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

         // B. Create Payroll Record
         const newPayroll = await Payroll.create({
             agent: agentId,
             month,
             year,
             basicSalary: financials.basicSalary,
             attendanceAllowance: financials.attendanceAllowance,
             perSaleIncentive: agent.perSaleIncentive || 0, // Fix: Save actual per sale rate
             totalDaysInMonth: stats.totalDaysInMonth,
             workingDays: stats.workingDays,
             presentDays: stats.presentDays,
             totalLates: stats.totalLates,
             
             // Save detailed stats
             uninformedLates: stats.uninformedLates,
             informedLates: stats.informedLates,
             uninformedAbsents: stats.uninformedAbsents,
             informedAbsents: stats.informedAbsents,
             convertedAbsents: stats.convertedAbsents,
             absentDays: stats.uninformedAbsents + stats.informedAbsents,
             latePenaltyCount: stats.latePenaltyCount,

             perDaySalary: financials.perDaySalary,
             lateDeductionAmount: financials.lateDeductionAmount,
             absentDeductionAmount: financials.absentDeductionAmount,
             
             earnedAllowance: financials.earnedAllowance,
             earnedIncentive: financials.earnedIncentive,
             grossSalary: financials.grossSalary,
             totalDeduction: financials.totalDeduction,
             netSalary: financials.netSalary,
             
             status: 'generated',
             generatedBy: null // TODO: Get from token
         });

         // C. Send Notification
         await Notification.create({
            title: `Salary Generated for ${month}/${year}`,
            message: `Your salary for ${month}/${year} has been generated. Net Salary: ${financials.netSalary}`,
            type: "success",
            targetType: "specific",
            targetModel: "Agent",
            targetUsers: [agentId]
         });

         return NextResponse.json({ success: true, message: "Payroll generated successfully", data: newPayroll });
    }

    return NextResponse.json({ success: false, message: "Invalid action" });

  } catch (error) {
    console.error("Payroll Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}