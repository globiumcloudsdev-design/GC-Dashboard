// src/components/ShiftSchedule.jsx
"use client";
import { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
} from "lucide-react";
import { AgentContext } from "../context/AgentContext";
import { useLoaderContext } from "../context/LoaderContext";
import { cn } from "@/lib/utils";

const ShiftSchedule = () => {
  const { agent } = useContext(AgentContext);
  const { showLoader, hideLoader } = useLoaderContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedule, setSchedule] = useState([]);

  // Days mapping
  const daysMap = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
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

  // Parse shift days
  const parseShiftDays = (days) => {
    if (!days || !Array.isArray(days)) return [];

    const workingDays = new Set();

    days.forEach((day) => {
      if (day.includes("-")) {
        const [start, end] = day.split("-");
        const startIndex = daysMap[start];
        const endIndex = daysMap[end];

        if (startIndex !== undefined && endIndex !== undefined) {
          for (let i = startIndex; i <= endIndex; i++) {
            workingDays.add(i);
          }
        }
      } else {
        const dayIndex = daysMap[day];
        if (dayIndex !== undefined) {
          workingDays.add(dayIndex);
        }
      }
    });

    return Array.from(workingDays).sort();
  };

  // Generate weekly schedule based on currentDate
  const generateWeeklySchedule = () => {
    if (!agent?.shift) return;

    const targetDate = new Date(currentDate);
    const targetDay = targetDate.getDay();

    // Calculate start of week (Sunday) for the target date
    const startOfWeek = new Date(targetDate);
    startOfWeek.setDate(targetDate.getDate() - targetDay);

    const scheduleData = [];
    const workingDays = parseShiftDays(agent.shift.days);
    const today = new Date();

    // Generate 7 days of the week
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);

      const dayOfWeek = date.getDay();
      const isWorkingDay = workingDays.includes(dayOfWeek);
      const isToday = date.toDateString() === today.toDateString();

      scheduleData.push({
        date: new Date(date),
        dayName: dayNames[dayOfWeek],
        dateNumber: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear(),
        isWorkingDay,
        shiftTiming: isWorkingDay
          ? `${agent.shift.startTime} - ${agent.shift.endTime}`
          : "Off",
        isToday,
        isCurrentMonth: date.getMonth() === currentDate.getMonth(),
      });
    }

    setSchedule(scheduleData);
  };

  // Navigation functions
  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  useEffect(() => {
    generateWeeklySchedule();
  }, [agent, currentDate]);

  // Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  // Get display month and year
  const getDisplayMonthYear = () => {
    if (schedule.length === 0) {
      const now = new Date();
      return `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
    }

    // Check if all days are in same month
    const firstDayMonth = schedule[0].month;
    const allSameMonth = schedule.every((day) => day.month === firstDayMonth);

    if (allSameMonth) {
      return `${monthNames[firstDayMonth]} ${schedule[0].year}`;
    } else {
      // Show range if week spans multiple months
      const firstDay = schedule[0];
      const lastDay = schedule[6];
      return `${monthNames[firstDay.month].substring(0, 3)} - ${monthNames[lastDay.month].substring(0, 3)} ${firstDay.year}`;
    }
  };

  // Check if current week is the current week
  const isCurrentWeek = () => {
    const today = new Date();
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - today.getDay());

    const displayedWeekStart = new Date(schedule[0]?.date);

    return (
      currentWeekStart.toDateString() === displayedWeekStart.toDateString()
    );
  };

  if (!agent?.shift) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 w-full max-w-md mx-auto">
        <div className="text-center py-8">
          <Calendar className="h-16 w-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            No Shift Assigned
          </h3>
          <p className="text-slate-500">
            Please contact administrator to assign your shift schedule.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className="bg-white rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-100/50 overflow-hidden w-full max-w-sm sm:max-w-md mx-auto group"
    >
      {/* Header */}
      <div className="p-6 sm:p-8 border-b border-slate-50 bg-gradient-to-br from-slate-50/50 to-blue-50/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white shadow-sm rounded-2xl group-hover:rotate-3 transition-transform">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
                Shift Schedule
              </h3>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-[0.2em]">
                Operational Roster
              </p>
            </div>
          </div>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-between bg-white rounded-[24px] p-2 pr-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-1">
            <button
              onClick={goToPreviousWeek}
              className="p-2.5 hover:bg-slate-50 rounded-xl transition-all duration-200 text-slate-400 hover:text-blue-600"
              aria-label="Previous week"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="w-px h-6 bg-slate-100 mx-1" />

            <button
              onClick={goToNextWeek}
              className="p-2.5 hover:bg-slate-50 rounded-xl transition-all duration-200 text-slate-400 hover:text-blue-600"
              aria-label="Next week"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-col items-end flex-1">
            <h2 className="text-sm font-bold text-slate-800 tracking-tight">
              {getDisplayMonthYear()}
            </h2>
            {!isCurrentWeek() && (
              <button
                onClick={goToToday}
                className="text-[9px] font-bold text-blue-600 uppercase tracking-[0.2em] mt-1 hover:underline px-1"
              >
                Jump to Today
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Calendar Grid */}
      <div className="p-6 sm:p-8">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-4 px-1">
          {schedule.map((day, index) => (
            <div key={`header-${index}`} className="text-center">
              <div
                className={cn(
                  "text-[10px] font-bold uppercase tracking-widest",
                  day.isWorkingDay ? "text-slate-600" : "text-slate-300",
                )}
              >
                {day.dayName.substring(0, 3)}
              </div>
            </div>
          ))}
        </div>

        {/* Date Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-8">
          {schedule.map((day, index) => (
            <motion.div
              key={day.date.toString() + currentDate.getTime()}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <div
                className={cn(
                  "relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-300 cursor-default",
                  day.isToday
                    ? "bg-blue-600 text-white shadow-xl shadow-blue-200 scale-110"
                    : day.isWorkingDay
                      ? "bg-slate-900 text-white shadow-md"
                      : "bg-slate-50 text-slate-300 border border-slate-100",
                )}
              >
                {day.dateNumber}

                {!day.isCurrentMonth && (
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 border-2 border-white rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-[7px] text-white font-black">!</span>
                  </div>
                )}
              </div>

              {day.isToday && (
                <div className="w-1 h-1 bg-blue-600 rounded-full mt-2" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Shift Info Card */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 rounded-[32px] p-6 shadow-2xl shadow-blue-900/10 group/info relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl transition-transform group-hover:scale-110" />

          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="p-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl text-blue-300">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-blue-300 uppercase tracking-[0.3em] mb-1 opacity-80">
                Today's Shift
              </p>
              <h3 className="text-xl font-bold text-white tracking-tight leading-none uppercase">
                {agent?.shift?.name || "Standard Shift"}
              </h3>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 text-center bg-white/5 backdrop-blur-md p-4 rounded-[24px] border border-white/10 transition-transform group-hover/info:-translate-y-1">
              <span className="text-base font-bold text-white tracking-tighter block">
                {agent?.shift?.startTime || "--:--"}
              </span>
              <span className="text-[9px] font-bold text-blue-300 uppercase tracking-[0.2em] mt-1.5 block opacity-60">
                Check In
              </span>
            </div>

            <div className="flex flex-col items-center opacity-20">
              <MapPin className="h-4 w-4 text-slate-400" />
              <div className="w-px h-8 bg-slate-300 my-1" />
            </div>

            <div className="flex-1 text-center bg-white/5 backdrop-blur-md p-4 rounded-[24px] border border-white/10 transition-transform group-hover/info:-translate-y-1">
              <span className="text-base font-bold text-white tracking-tighter block">
                {agent?.shift?.endTime || "--:--"}
              </span>
              <span className="text-[9px] font-bold text-blue-300 uppercase tracking-[0.2em] mt-1.5 block opacity-60">
                Check Out
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-6 pt-6 border-t border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-[9px] font-bold text-blue-200 uppercase tracking-[0.2em] opacity-60">
                {schedule.filter((day) => day.isWorkingDay).length} Scheduled
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-white/20 rounded-full" />
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em]">
                {schedule.filter((day) => !day.isWorkingDay).length} Recess
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ShiftSchedule;
