// components/sales/MonthSelector.jsx
import React, { useContext } from "react";
import { ChevronLeft, ChevronRight, Calendar, Sparkles } from "lucide-react";
import { ThemeContext } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

const MonthSelector = ({
  currentMonth = "",
  onMonthChange,
  theme,
  minMonth = null,
}) => {
  const { theme: themeContext } = useContext(ThemeContext);
  const activeTheme = theme || themeContext;

  const months = [
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

  const getCurrentMonthInfo = () => {
    if (!currentMonth) {
      const now = new Date();
      return {
        monthName: months[now.getMonth()],
        year: now.getFullYear(),
        monthIndex: now.getMonth(),
      };
    }

    const [monthName, year] = currentMonth.split(" ");
    const monthIndex = months.indexOf(monthName);

    return {
      monthName,
      year: parseInt(year),
      monthIndex: monthIndex !== -1 ? monthIndex : new Date().getMonth(),
    };
  };

  const { monthName, year, monthIndex } = getCurrentMonthInfo();

  const parseMin = (min) => {
    if (!min) return null;
    if (min instanceof Date)
      return { monthIndex: min.getMonth(), year: min.getFullYear() };
    try {
      const d = new Date(min);
      if (!isNaN(d)) return { monthIndex: d.getMonth(), year: d.getFullYear() };
    } catch (e) {}

    const parts = String(min).split(" ");
    if (parts.length === 2) {
      const mIdx = months.indexOf(parts[0]);
      const y = parseInt(parts[1]);
      if (mIdx !== -1 && !isNaN(y)) return { monthIndex: mIdx, year: y };
    }
    return null;
  };

  const min = parseMin(minMonth);

  const isAtMin = (() => {
    if (!min) return false;
    if (year < min.year) return true;
    if (year === min.year && monthIndex <= min.monthIndex) return true;
    return false;
  })();

  const handlePrevMonth = () => {
    let newMonthIndex = monthIndex - 1;
    let newYear = year;

    if (newMonthIndex < 0) {
      newMonthIndex = 11;
      newYear = year - 1;
    }

    if (min) {
      if (
        newYear < min.year ||
        (newYear === min.year && newMonthIndex < min.monthIndex)
      ) {
        onMonthChange(`${months[min.monthIndex]} ${min.year}`);
        return;
      }
    }

    onMonthChange(`${months[newMonthIndex]} ${newYear}`);
  };

  const handleNextMonth = () => {
    let newMonthIndex = monthIndex + 1;
    let newYear = year;

    if (newMonthIndex > 11) {
      newMonthIndex = 0;
      newYear = year + 1;
    }

    onMonthChange(`${months[newMonthIndex]} ${newYear}`);
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    onMonthChange(`${months[now.getMonth()]} ${now.getFullYear()}`);
  };

  return (
    <div className="bg-white rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-100/50 p-6 relative overflow-hidden group h-full flex flex-col justify-between transition-all duration-300">
      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500 opacity-[0.03] rounded-bl-full transition-transform group-hover:scale-110" />

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 tracking-tight leading-none">
                Select Period
              </h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none mt-1.5">
                Monthly Analysis
              </p>
            </div>
          </div>
          <button
            onClick={handleCurrentMonth}
            className="px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] bg-slate-900 text-white rounded-xl hover:bg-black transition-all shadow-lg shadow-slate-200 active:scale-95"
          >
            Today
          </button>
        </div>

        <div className="bg-slate-50/80 border border-slate-100/80 rounded-3xl p-4 flex items-center justify-between shadow-inner">
          <button
            onClick={handlePrevMonth}
            disabled={isAtMin}
            className={cn(
              "p-2.5 rounded-xl border border-slate-200 bg-white shadow-sm transition-all active:scale-90",
              isAtMin
                ? "opacity-30 cursor-not-allowed"
                : "hover:border-indigo-500 hover:text-indigo-600 hover:shadow-md",
            )}
          >
            <ChevronLeft size={18} />
          </button>

          <div className="text-center">
            <h4 className="text-xl font-bold text-slate-800 tracking-tighter leading-none">
              {monthName}
            </h4>
            <span className="text-[9px] font-bold text-indigo-500 tracking-[0.3em] uppercase mt-2 block opacity-60 px-0.5">
              {year}
            </span>
          </div>

          <button
            onClick={handleNextMonth}
            className="p-2.5 rounded-xl border border-slate-200 bg-white shadow-sm transition-all active:scale-90 hover:border-indigo-500 hover:text-indigo-600 hover:shadow-md"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="mt-5 p-3.5 bg-indigo-50/50 border border-indigo-100/40 rounded-2xl flex items-center gap-2.5 justify-center group-hover:bg-indigo-50 transition-colors">
        <Sparkles size={14} className="text-indigo-400 animate-pulse" />
        <p className="text-[10px] font-bold text-indigo-700/70 uppercase tracking-[0.15em]">
          Viewing {monthName} Data
        </p>
      </div>
    </div>
  );
};

export default MonthSelector;
