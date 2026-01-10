//app/api/attendance/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Attendance from "@/Models/Attendance";
import Shift from "@/Models/Shift";
import { verifyToken } from "@/lib/jwt";
import User from "@/Models/User"; 
import Agent from "@/Models/Agent";
import Holiday from "@/Models/Holiday";
import WeeklyOff from "@/Models/WeeklyOff";

// --- Helper Functions for "Gap Filling" Logic ---

// Convert to Pakistan Time (Asia/Karachi)
function toPakistanDate(date) {
  return new Date(
    new Date(date).toLocaleString("en-US", { timeZone: "Asia/Karachi" })
  );
}

// Stable Key in Pakistan Time (YYYY-MM-DD)
function toKeyPKT(date) {
  const d = toPakistanDate(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Get dates between start and end (inclusive)
function getDatesBetween(startDate, endDate) {
  const dates = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  
  // Reset time to 00:00:00
  current.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

// Get day name in lowercase
function getDayName(date) {
  return toPakistanDate(date).toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
}

// Normalize status strings
function normalizeStatus(s) {
  if (!s) return "absent";
  const str = String(s).toLowerCase();
  
  // Present categories
  if (["present"].includes(str)) return "present";
  if (["late"].includes(str)) return "late";
  if (["halfday", "half_day", "half-day", "half day"].includes(str)) return "half_day";
  if (["early_checkout", "early checkout", "earlycheckout", "early-checkout"].includes(str)) return "early_checkout";
  if (["overtime", "over_time", "over-time"].includes(str)) return "overtime";
  
  // Leave categories
  if (["approved_leave", "approved leave", "leave_approved", "leave approved"].includes(str)) return "approved_leave";
  if (["pending_leave", "pending leave", "leave_pending", "leave pending"].includes(str)) return "pending_leave";
  if (["leave"].includes(str)) return "leave";
  
  // Non-working days
  if (["holiday"].includes(str)) return "holiday";
  if (["weekly_off", "weeklyoff", "weekly-off", "weekly off"].includes(str)) return "weekly_off";
  
  // Absent
  if (["absent"].includes(str)) return "absent";
  
  return "present"; // fallback
}

// Check if today's shift has started
function isShiftStartedToday(userShiftStartTime) {
  try {
    const now = toPakistanDate(new Date());
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    
    if (!userShiftStartTime || userShiftStartTime === "00:00") return true;
    
    const [shiftHour, shiftMinute] = userShiftStartTime.split(':').map(Number);
    const shiftStartMinutes = shiftHour * 60 + shiftMinute;
    
    return nowMinutes >= shiftStartMinutes;
  } catch (error) {
    return true;
  }
}

// Get first attendance date from DB
async function getFirstAttendanceDate(userId, userType) {
  const queryField = userType === "agent" ? "agent" : "user";
  
  const firstRecord = await Attendance.findOne({ [queryField]: userId })
    .sort({ date: 1, createdAt: 1, checkInTime: 1 })
    .select('date createdAt checkInTime');
    
  if (firstRecord) {
    const date = firstRecord.date || firstRecord.createdAt || firstRecord.checkInTime;
    return toPakistanDate(date);
  }
  
  // If no attendance record, get user creation date
  if (userType === "agent") {
    const agent = await Agent.findById(userId).select('createdAt');
    return agent?.createdAt ? toPakistanDate(agent.createdAt) : toPakistanDate(new Date());
  } else {
    const user = await User.findById(userId).select('createdAt');
    return user?.createdAt ? toPakistanDate(user.createdAt) : toPakistanDate(new Date());
  }
}

// app/api/attendance/route.js - Updated GET function
export async function GET(request) {
  try {
    await connectDB();

    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const userType = searchParams.get("userType") || "all";
    const status = searchParams.get("status") || "all";
    const date = searchParams.get("date") || "";
    const fromDateParam = searchParams.get("fromDate") || searchParams.get("startDate") || "";
    const toDateParam = searchParams.get("toDate") || searchParams.get("endDate") || "";
    const monthParam = searchParams.get("month") || "";
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // --- Special Logic: Enriched History for Single User ---
    // If search is provided, let's see if it matches a unique Agent or User.
    // If so, we provide the "full calendar" view (like 'my attendance') including absents/holidays.
    
    let targetEntity = null;
    let targetEntityType = null;

    if (search) {
      // Find matches (limit 2 to check uniqueness efficiently)
      const agentMatches = await Agent.find({
        $or: [
          { agentName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { agentId: { $regex: search, $options: 'i' } }
        ]
      }).limit(2).populate('shift');

      const userMatches = await User.find({
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).limit(2).populate('shift');

      const totalMatches = agentMatches.length + userMatches.length;

      if (totalMatches === 1) {
          if (agentMatches.length === 1) {
              targetEntity = agentMatches[0];
              targetEntityType = 'agent';
          } else {
              targetEntity = userMatches[0];
              targetEntityType = 'user';
          }
      }
    }

    // If we found a unique target, AND we have a date range (month or explicit dates), generate full history
    if (targetEntity) {
      console.log(`🎯 Enriched Mode Active for: ${targetEntityType} ${targetEntity._id}`);

      // Determine Date Range
      const todayPK = toPakistanDate(new Date());
      let actualStartDate, actualEndDate;
      
      // Get first attendance date for this user
      const firstAttendanceDatePK = await getFirstAttendanceDate(targetEntity._id, targetEntityType);

      if (fromDateParam && toDateParam) {
        // Explicit date range
        actualStartDate = new Date(fromDateParam);
        actualEndDate = new Date(toDateParam);
        
        // Don't go before first attendance
        if (actualStartDate < firstAttendanceDatePK) {
          actualStartDate = firstAttendanceDatePK;
        }
        
        // Don't go into future
        if (actualEndDate > todayPK) {
          actualEndDate = todayPK;
        }
        
      } else if (monthParam) {
        // Month filter
        const parts = String(monthParam).split('-');
        if (parts.length === 2) {
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10);
          const monthStart = new Date(Date.UTC(year, month - 1, 1));
          const monthEnd = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
          
          // Start from first attendance or month start (whichever is later)
          actualStartDate = firstAttendanceDatePK > monthStart ? firstAttendanceDatePK : monthStart;
          
          // End at today or month end (whichever is earlier)
          actualEndDate = todayPK < monthEnd ? todayPK : monthEnd;
        }
      } else {
        // No date filter: show from first attendance to today
        actualStartDate = firstAttendanceDatePK;
        actualEndDate = todayPK;
      }
      
      const queryField = targetEntityType === "agent" ? "agent" : "user";
      
      // Fetch Actual Attendance
      const attends = await Attendance.find({
        [queryField]: targetEntity._id,
        $or: [
          { date: { $gte: actualStartDate, $lte: actualEndDate } },
          { checkInTime: { $gte: actualStartDate, $lte: actualEndDate } },
        ],
      })
      .populate("shift", "name startTime endTime")
      .sort({ date: 1 });

      const attendanceMap = {};
      attends.forEach(att => {
        const source = att.date || att.checkInTime || att.createdAt;
        if (!source) return;
        const key = toKeyPKT(source);
        if (!attendanceMap[key]) attendanceMap[key] = att;
      });

      // Fetch Holidays & Weekly Offs
      const weeklyOffDocs = await WeeklyOff.find({ isActive: true });
      const weeklyOffSet = new Set(weeklyOffDocs.map(w => w.day.toLowerCase()));

      const holidayQuery = {
        isActive: true,
        $or: [{ isRecurring: true }, { date: { $gte: actualStartDate, $lte: actualEndDate } }]
      };
      const holidayDocs = await Holiday.find(holidayQuery);
      const holidaysSet = new Set();
      holidayDocs.forEach(h => {
        if (h.isRecurring && h.date) {
            const d = new Date(h.date);
            holidaysSet.add(`${d.getMonth() + 1}-${d.getDate()}`);
        } else if (h.date) {
            holidaysSet.add(toKeyPKT(h.date));
        }
      });

      // Generate Full List
      const allDates = getDatesBetween(actualStartDate, actualEndDate);
      const userShiftStartTime = targetEntity.shift?.startTime || "09:00";
      
      // We need to reverse if the page usually shows newest first? 
      // Admin table usually shows newest first (desc).
      allDates.reverse(); 

      const fullHistory = [];
      const todayKey = toKeyPKT(todayPK);
      const isShiftStarted = isShiftStartedToday(userShiftStartTime);

      for (const dateObj of allDates) {
        const key = toKeyPKT(dateObj);
        const record = attendanceMap[key];
        const isToday = key === todayKey;

        // Base object
        let item = {
          _id: record?._id || `gen-${key}`,
          date: dateObj,
          createdAt: dateObj, // for sorting/display
          status: "absent",
          user: targetEntityType === 'user' ? targetEntity : null,
          agent: targetEntityType === 'agent' ? targetEntity : null,
          shift: targetEntity.shift,
          checkInTime: null,
          checkOutTime: null,
          generated: !record
        };

        const isHoliday = holidaysSet.has(key) || holidaysSet.has(`${dateObj.getMonth() + 1}-${dateObj.getDate()}`);
        const isWeeklyOff = weeklyOffSet.has(getDayName(dateObj));

        if (record) {
             // Use actual record
             item = { ...item, ...record.toObject(), generated: false };
             item.status = normalizeStatus(record.status);
        } else {
             // Generate status
             if (isHoliday) item.status = "holiday";
             else if (isWeeklyOff) item.status = "weekly_off";
             else if (isToday && !isShiftStarted) {
                 continue; // Don't show absent for today if shift hasn't started
             }
             else if (key > todayKey) {
                 continue; // Don't show absent for future
             }
             else {
                 item.status = "absent";
             }
        }
        
        // Apply status filter if present
        if (status && status !== 'all') {
            if (normalizeStatus(item.status) !== normalizeStatus(status)) continue;
        }

        fullHistory.push(item);
      }

      // Calculate Summary Stats from fullHistory (before pagination)
      const stats = {
          total: fullHistory.length,
          present: 0, late: 0, half_day: 0, absent: 0,
          early_checkout: 0, overtime: 0,
          leave: 0, approved_leave: 0, pending_leave: 0,
          holiday: 0, weekly_off: 0
      };

      for (const item of fullHistory) {
          const s = normalizeStatus(item.status);
          if (s === 'present') stats.present++;
          else if (s === 'late') stats.late++;
          else if (s === 'half_day') stats.half_day++;
          else if (s === 'absent') stats.absent++;
          else if (s === 'early_checkout') stats.early_checkout++;
          else if (s === 'overtime') stats.overtime++;
          else if (s === 'leave') stats.leave++; // generic leave
          else if (s === 'approved_leave') stats.approved_leave++;
          else if (s === 'pending_leave') stats.pending_leave++;
          else if (s === 'holiday') stats.holiday++;
          else if (s === 'weekly_off') stats.weekly_off++;
      }

      // Pagination on fullHistory
      // We manually paginate the array
      const paginatedData = fullHistory.slice(skip, skip + limit);
      
      return NextResponse.json({
        success: true,
        data: paginatedData,
        summary: stats, // Return summarized stats
        meta: {
            total: fullHistory.length,
            page,
            limit,
            totalPages: Math.ceil(fullHistory.length / limit)
        }
      });
    }

    // --- End Special Logic ---

    // Build filter query
    let filter = {};
    
    if (userType !== 'all') {
      if (userType === 'user') {
        filter.user = { $exists: true, $ne: null };
      } else if (userType === 'agent') {
        filter.agent = { $exists: true, $ne: null };
      }
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    // SIMPLIFIED DATE FILTERING
    if (fromDateParam && toDateParam) {
      const startDate = new Date(fromDateParam);
      const endDate = new Date(toDateParam);
      
      // End date ko pure din ke liye set karo (23:59:59.999)
      endDate.setHours(23, 59, 59, 999);
      
      filter.date = {
        $gte: startDate,
        $lte: endDate
      };
      
      console.log('📅 Date range filter:', {
        fromDateParam,
        toDateParam,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      
    } else if (monthParam) {
      const parts = String(monthParam).split('-');
      if (parts.length === 2) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        if (!Number.isNaN(year) && !Number.isNaN(month)) {
          const startDate = new Date(Date.UTC(year, month - 1, 1));
          const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
          
          filter.date = {
            $gte: startDate,
            $lte: endDate
          };
        }
      }
    } else if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      filter.date = {
        $gte: startDate,
        $lte: endDate
      };
    }

    console.log("🔍 Final Filter:", JSON.stringify(filter, null, 2));

    // If search is provided, use aggregation pipeline for searching in populated fields
    let records, total;
    if (search) {
      const aggregationPipeline = [
        { $match: filter },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $lookup: {
            from: 'agents',
            localField: 'agent',
            foreignField: '_id',
            as: 'agent'
          }
        },
        {
          $lookup: {
            from: 'shifts',
            localField: 'shift',
            foreignField: '_id',
            as: 'shift'
          }
        },
        {
          $addFields: {
            user: { $arrayElemAt: ['$user', 0] },
            agent: { $arrayElemAt: ['$agent', 0] },
            shift: { $arrayElemAt: ['$shift', 0] }
          }
        },
        {
          $match: {
            $or: [
              { 'user.firstName': { $regex: search, $options: 'i' } },
              { 'user.lastName': { $regex: search, $options: 'i' } },
              { 'agent.agentName': { $regex: search, $options: 'i' } },
              { 'agent.agentId': { $regex: search, $options: 'i' } }
            ]
          }
        },
        { $sort: { date: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limit }
      ];

      // Get total count with search
      const countPipeline = [
        { $match: filter },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $lookup: {
            from: 'agents',
            localField: 'agent',
            foreignField: '_id',
            as: 'agent'
          }
        },
        {
          $addFields: {
            user: { $arrayElemAt: ['$user', 0] },
            agent: { $arrayElemAt: ['$agent', 0] }
          }
        },
        {
          $match: {
            $or: [
              { 'user.firstName': { $regex: search, $options: 'i' } },
              { 'user.lastName': { $regex: search, $options: 'i' } },
              { 'agent.agentName': { $regex: search, $options: 'i' } },
              { 'agent.agentId': { $regex: search, $options: 'i' } }
            ]
          }
        },
        { $count: 'total' }
      ];

      const [recordsResult, countResult] = await Promise.all([
        Attendance.aggregate(aggregationPipeline),
        Attendance.aggregate(countPipeline)
      ]);

      records = recordsResult;
      total = countResult[0]?.total || 0;
    } else {
      // DEBUG: Pehle count check karo
      const totalCount = await Attendance.countDocuments(filter);
      console.log(`🔢 Total documents matching filter: ${totalCount}`);

      // DEBUG: Kuch sample documents bhi dekho
      if (totalCount > 0) {
        const sampleDocs = await Attendance.find(filter)
          .select('date user agent status checkInTime checkOutTime')
          .populate("user", "firstName lastName")
          .populate("agent", "agentName agentId")
          // .limit(3)
          .lean();

        console.log("📄 Sample documents:", sampleDocs.map(doc => ({
          date: doc.date,
          user: doc.user ? `${doc.user.firstName} ${doc.user.lastName}` : null,
          agent: doc.agent ? doc.agent.agentName : null,
          status: doc.status,
          checkInTime: doc.checkInTime,
          checkOutTime: doc.checkOutTime
        })));
      }

      // Get records with proper population
      records = await Attendance.find(filter)
        .populate("user", "firstName lastName email")
        .populate("agent", "agentName agentId email")
        .populate("shift", "name startTime endTime")
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit);

      total = await Attendance.countDocuments(filter);
    }
    const totalPages = Math.ceil(total / limit);

    // Final debug info
    console.log("📊 Final Response Info:", {
      totalRecords: total,
      currentPage: page,
      limit: limit,
      recordsReturned: records.length,
      totalPages: totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });

    return NextResponse.json({ 
      success: true, 
      data: records,
      meta: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    console.error("❌ Attendance API Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}