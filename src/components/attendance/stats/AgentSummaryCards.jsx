// src/components/attendance/stats/AgentSummaryCards.jsx
"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { UserCheck } from "lucide-react";

export default function AgentSummaryCards({ searchQuery, attendance, agentSummaryStats }) {
  // Only show if searching and we have data or backend summary
  if (!searchQuery || (!attendance.length && !agentSummaryStats)) return null;

  // Use name from first record if available (for header)
  const agentName = attendance[0]?.user
    ? `${attendance[0].user.firstName} ${attendance[0].user.lastName}`
    : attendance[0]?.agent?.agentName || "Agent";

  // Use Backend Stats if available (More accurate for full month/history), otherwise fallback to frontend calc
  const stats = agentSummaryStats
    ? {
        total: agentSummaryStats.total,
        present: agentSummaryStats.present,
        late: agentSummaryStats.late,
        halfDay: agentSummaryStats.half_day,
        absent: agentSummaryStats.absent,
        earlyCheckout: agentSummaryStats.early_checkout,
        overtime: agentSummaryStats.overtime,
        leave: agentSummaryStats.leave,
        approvedLeave: agentSummaryStats.approved_leave,
        pendingLeave: agentSummaryStats.pending_leave,
        holiday: agentSummaryStats.holiday,
        weeklyOff: agentSummaryStats.weekly_off,
      }
    : {
        // Fallback to frontend calculation
        total: attendance.length,
        present: attendance.filter((a) => a.status === "present").length,
        late: attendance.filter((a) => a.status === "late").length,
        halfDay: attendance.filter((a) => a.status === "half_day").length,
        absent: attendance.filter((a) => a.status === "absent").length,
        earlyCheckout: attendance.filter((a) => a.status === "early_checkout").length,
        overtime: attendance.filter((a) => a.status === "overtime").length,
        leave: attendance.filter((a) => a.status === "leave").length,
        approvedLeave: attendance.filter((a) => a.status === "approved_leave").length,
        pendingLeave: attendance.filter((a) => a.status === "pending_leave").length,
        holiday: attendance.filter((a) => a.status === "holiday").length,
        weeklyOff: attendance.filter((a) => a.status === "weekly_off").length,
      };

  // Calculate derived stats
  const allPresent =
    stats.present + stats.late + stats.halfDay + stats.earlyCheckout + stats.overtime;
  const totalWorkingDays = stats.total - stats.holiday - stats.weeklyOff;

  return (
    <div className="mb-6 space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
        <UserCheck className="h-5 w-5 text-blue-600" />
        Summary for {agentName}
      </h3>

      {/* Main Summary Cards - Highlighted */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* All Present */}
        <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-sm font-semibold text-white/90 uppercase tracking-wide mb-2">
              All Present Days
            </div>
            <div className="text-4xl font-bold text-white">{allPresent}</div>
            <div className="text-xs text-white/80 mt-1">
              Present, Late, Half Day, Early Out, Overtime
            </div>
          </CardContent>
        </Card>

        {/* Total Working Days */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-sm font-semibold text-white/90 uppercase tracking-wide mb-2">
              Total Working Days
            </div>
            <div className="text-4xl font-bold text-white">{totalWorkingDays}</div>
            <div className="text-xs text-white/80 mt-1">
              Excluding Holidays & Weekly Offs
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* Present */}
        <Card className="bg-green-50 border-green-200 shadow-sm">
          <CardContent className="p-3 text-center">
            <div className="text-xs font-medium text-green-800 uppercase tracking-wide mb-1">
              Present
            </div>
            <div className="text-xl font-bold text-green-700">{stats.present}</div>
          </CardContent>
        </Card>

        {/* Late */}
        <Card className="bg-orange-50 border-orange-200 shadow-sm">
          <CardContent className="p-3 text-center">
            <div className="text-xs font-medium text-orange-800 uppercase tracking-wide mb-1">
              Late
            </div>
            <div className="text-xl font-bold text-orange-700">{stats.late}</div>
          </CardContent>
        </Card>

        {/* Half Day */}
        <Card className="bg-yellow-50 border-yellow-200 shadow-sm">
          <CardContent className="p-3 text-center">
            <div className="text-xs font-medium text-yellow-800 uppercase tracking-wide mb-1">
              Half Day
            </div>
            <div className="text-xl font-bold text-yellow-700">{stats.halfDay}</div>
          </CardContent>
        </Card>

        {/* Absent */}
        <Card className="bg-red-50 border-red-200 shadow-sm">
          <CardContent className="p-3 text-center">
            <div className="text-xs font-medium text-red-800 uppercase tracking-wide mb-1">
              Absent
            </div>
            <div className="text-xl font-bold text-red-700">{stats.absent}</div>
          </CardContent>
        </Card>

        {/* Early Checkout */}
        <Card className="bg-pink-50 border-pink-200 shadow-sm">
          <CardContent className="p-3 text-center">
            <div className="text-xs font-medium text-pink-800 uppercase tracking-wide mb-1">
              Early Out
            </div>
            <div className="text-xl font-bold text-pink-700">{stats.earlyCheckout}</div>
          </CardContent>
        </Card>

        {/* Overtime */}
        <Card className="bg-indigo-50 border-indigo-200 shadow-sm">
          <CardContent className="p-3 text-center">
            <div className="text-xs font-medium text-indigo-800 uppercase tracking-wide mb-1">
              Overtime
            </div>
            <div className="text-xl font-bold text-indigo-700">{stats.overtime}</div>
          </CardContent>
        </Card>

        {/* Leave */}
        <Card className="bg-amber-50 border-amber-200 shadow-sm">
          <CardContent className="p-3 text-center">
            <div className="text-xs font-medium text-amber-800 uppercase tracking-wide mb-1">
              Leave
            </div>
            <div className="text-xl font-bold text-amber-700">{stats.leave}</div>
          </CardContent>
        </Card>

        {/* Approved Leave */}
        <Card className="bg-blue-50 border-blue-200 shadow-sm">
          <CardContent className="p-3 text-center">
            <div className="text-xs font-medium text-blue-800 uppercase tracking-wide mb-1">
              Approved
            </div>
            <div className="text-xl font-bold text-blue-700">{stats.approvedLeave}</div>
          </CardContent>
        </Card>

        {/* Pending Leave */}
        <Card className="bg-slate-50 border-slate-200 shadow-sm">
          <CardContent className="p-3 text-center">
            <div className="text-xs font-medium text-slate-800 uppercase tracking-wide mb-1">
              Pending
            </div>
            <div className="text-xl font-bold text-slate-700">{stats.pendingLeave}</div>
          </CardContent>
        </Card>

        {/* Holiday */}
        <Card className="bg-purple-50 border-purple-200 shadow-sm">
          <CardContent className="p-3 text-center">
            <div className="text-xs font-medium text-purple-800 uppercase tracking-wide mb-1">
              Holiday
            </div>
            <div className="text-xl font-bold text-purple-700">{stats.holiday}</div>
          </CardContent>
        </Card>

        {/* Weekly Off */}
        <Card className="bg-gray-50 border-gray-200 shadow-sm">
          <CardContent className="p-3 text-center">
            <div className="text-xs font-medium text-gray-800 uppercase tracking-wide mb-1">
              Weekly Off
            </div>
            <div className="text-xl font-bold text-gray-700">{stats.weeklyOff}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
