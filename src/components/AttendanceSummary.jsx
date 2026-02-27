// src/components/AttendanceSummary.jsx
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const STATUS_CFG = {
  present: {
    label: "Present",
    icon: "✅",
    tile: "bg-emerald-50 border-emerald-200",
    num: "text-emerald-600",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  late: {
    label: "Late",
    icon: "⏰",
    tile: "bg-amber-50   border-amber-200",
    num: "text-amber-600",
    badge: "bg-amber-100   text-amber-700   border-amber-200",
  },
  absent: {
    label: "Absent",
    icon: "❌",
    tile: "bg-rose-50    border-rose-200",
    num: "text-rose-600",
    badge: "bg-rose-100    text-rose-700    border-rose-200",
  },
  holiday: {
    label: "Holiday",
    icon: "🎉",
    tile: "bg-purple-50  border-purple-200",
    num: "text-purple-600",
    badge: "bg-purple-100  text-purple-700  border-purple-200",
  },
  weekly_off: {
    label: "Weekly Off",
    icon: "🏖️",
    tile: "bg-slate-50   border-slate-200",
    num: "text-slate-500",
    badge: "bg-slate-100   text-slate-600   border-slate-200",
  },
  approved_leave: {
    label: "Leave",
    icon: "📝",
    tile: "bg-pink-50    border-pink-200",
    num: "text-pink-600",
    badge: "bg-pink-100    text-pink-700    border-pink-200",
  },
  leave: {
    label: "Leave",
    icon: "📝",
    tile: "bg-pink-50    border-pink-200",
    num: "text-pink-600",
    badge: "bg-pink-100    text-pink-700    border-pink-200",
  },
};
const getCfg = (s) =>
  STATUS_CFG[s] || {
    label: s,
    icon: "📅",
    tile: "bg-gray-50 border-gray-200",
    num: "text-gray-500",
    badge: "bg-gray-100 text-gray-600 border-gray-200",
  };

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-PK", { day: "2-digit", month: "short" });
const fmtDay = (d) => (d || "").slice(0, 3);

export default function AttendanceSummary({ monthlySummary }) {
  const [page, setPage] = useState(1);
  const PER = 8;

  useEffect(() => setPage(1), [monthlySummary]);

  if (!monthlySummary) {
    return (
      <div className="text-center py-10">
        <p className="text-4xl mb-3">📭</p>
        <p className="font-bold text-gray-500 text-sm">No data available</p>
        <p className="text-xs text-gray-400 mt-1">
          Select a month to view records
        </p>
      </div>
    );
  }

  const records = monthlySummary.records || [];
  const count = (fn) => records.filter(fn).length;

  const present = count((r) => r.status === "present");
  const late = count((r) => r.status === "late");
  const absent = count((r) => r.status === "absent");
  const holiday = count((r) => r.status === "holiday");
  const leave = count((r) => ["leave", "approved_leave"].includes(r.status));
  const working = count((r) => !["holiday", "weekly_off"].includes(r.status));
  const rate = working > 0 ? ((present / working) * 100).toFixed(1) : 0;
  const rateNum = parseFloat(rate);
  const rateColor =
    rateNum >= 90
      ? "text-emerald-600"
      : rateNum >= 70
        ? "text-amber-600"
        : "text-rose-600";
  const rateBg =
    rateNum >= 90
      ? "bg-emerald-50 border-emerald-200"
      : rateNum >= 70
        ? "bg-amber-50 border-amber-200"
        : "bg-rose-50 border-rose-200";

  const totalPages = Math.ceil(records.length / PER);
  const slice = records.slice((page - 1) * PER, page * PER);

  return (
    <div className="space-y-5">
      {/* ── Big 3 stat tiles ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            status: "present",
            val: present,
            grad: "from-emerald-500 to-teal-600",
          },
          { status: "late", val: late, grad: "from-amber-400 to-orange-500" },
          { status: "absent", val: absent, grad: "from-rose-500 to-red-600" },
        ].map(({ status, val, grad }) => {
          const c = getCfg(status);
          return (
            <div
              key={status}
              className={`rounded-[24px] bg-gradient-to-br ${grad} p-4 text-center shadow-lg shadow-black/5 relative overflow-hidden group`}
            >
              <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full -mr-4 -mt-4 blur-xl group-hover:scale-150 transition-transform" />
              <p className="text-xl leading-none mb-2">{c.icon}</p>
              <p className="text-2xl font-black text-white leading-none">
                {val}
              </p>
              <p className="text-[9px] font-black text-white/70 uppercase tracking-widest mt-2">
                {c.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Detail grid ── */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className={`rounded-2xl border ${rateBg} px-4 py-3 flex items-center justify-between shadow-sm`}
        >
          <p className="text-[11px] font-bold text-slate-500/80 uppercase tracking-wider">
            Rate
          </p>
          <p className={`text-base font-black ${rateColor}`}>{rate}%</p>
        </div>
        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl px-4 py-3 flex items-center justify-between shadow-sm">
          <p className="text-[11px] font-bold text-slate-500/80 uppercase tracking-wider">
            Working
          </p>
          <p className="text-base font-black text-blue-600">{working}</p>
        </div>
        <div className="bg-purple-50/50 border border-purple-100 rounded-2xl px-4 py-3 flex items-center justify-between shadow-sm">
          <p className="text-[11px] font-bold text-slate-500/80 uppercase tracking-wider">
            Holidays
          </p>
          <p className="text-base font-black text-purple-600">{holiday}</p>
        </div>
        <div className="bg-pink-50/50 border border-pink-100 rounded-2xl px-4 py-3 flex items-center justify-between shadow-sm">
          <p className="text-[11px] font-bold text-slate-500/80 uppercase tracking-wider">
            Leaves
          </p>
          <p className="text-base font-black text-pink-600">{leave}</p>
        </div>
      </div>

      {/* ── Daily records ── */}
      {slice.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Daily Records
            </p>
            <p className="text-[11px] font-semibold text-gray-400">
              {records.length} total
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 overflow-hidden">
            {/* Table head */}
            <div className="grid grid-cols-5 bg-gray-50 border-b border-gray-100 px-3 py-2">
              {["Date", "Day", "In", "Out", "Status"].map((h) => (
                <p
                  key={h}
                  className="text-[10px] font-bold text-gray-400 uppercase text-center"
                >
                  {h}
                </p>
              ))}
            </div>

            {/* Rows */}
            {slice.map((r, i) => {
              const cfg = getCfg(r.status);
              return (
                <div
                  key={i}
                  className={`grid grid-cols-5 px-3 py-2.5 items-center border-b border-gray-50 last:border-0 ${
                    i % 2 === 0 ? "bg-white" : "bg-gray-50/40"
                  }`}
                >
                  <p className="text-[11px] font-semibold text-gray-700 text-center">
                    {fmtDate(r.date)}
                  </p>
                  <p className="text-[11px] text-gray-400 text-center font-medium">
                    {fmtDay(r.day)}
                  </p>
                  <p className="text-[11px] font-mono text-center text-gray-600">
                    {r.checkInTime || "—"}
                  </p>
                  <p className="text-[11px] font-mono text-center text-gray-600">
                    {r.checkOutTime || "—"}
                  </p>
                  <div className="flex justify-center">
                    <span
                      className={`text-[9px] font-bold border px-1.5 py-0.5 rounded-full ${cfg.badge}`}
                    >
                      {cfg.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-3">
              <p className="text-[11px] text-gray-400">
                {(page - 1) * PER + 1}–{Math.min(page * PER, records.length)} of{" "}
                {records.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-7 h-7 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-40 transition flex items-center justify-center"
                >
                  <ChevronLeft className="h-3.5 w-3.5 text-gray-600" />
                </button>

                {Array.from(
                  { length: Math.min(5, totalPages) },
                  (_, i) => i + 1,
                ).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-7 h-7 text-[11px] font-bold rounded-xl transition ${
                      p === page
                        ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-7 h-7 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-40 transition flex items-center justify-center"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
