// src/app/(agent)/agent/attendance/page.jsx
"use client";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Home,
  LogOut,
  LogIn,
  MapPin,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  TrendingUp,
  Timer,
  Sun,
  Moon,
  Sunset,
  CalendarDays,
  Zap,
  Navigation,
  BarChart3,
} from "lucide-react";

import { useAgent } from "@/context/AgentContext";
import { useOfficeLocation } from "@/context/LocationContext";
import { ThemeContext } from "@/context/ThemeContext";
import { agentLeaveService } from "@/services/agentLeaveService";
import {
  setupNotifications,
  stopBackgroundLocation,
} from "@/utils/backgroundLocation";
import { getCurrentLocation, getDistance } from "@/utils/locationUtils";
import { agentAttendanceService } from "@/services/agentAttendenceService";

import AttendanceFilter from "@/components/AttendanceFilter";
import AttendanceSummary from "@/components/AttendanceSummary";
import GlobalModal from "@/components/GlobalModal";
import LeaveRequestModal from "@/components/LeaveRequestModal";
import LeaveRequestsList from "@/components/LeaveRequestsList";

const formatTime = (dateStr) => {
  if (!dateStr) return "--:--";
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const getMonthName = (n) =>
  [
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
  ][n - 1] || "";

export default function AttendanceScreen() {
  const router = useRouter();
  const {
    agent,
    refreshAgentData,
    isLoggedIn,
    token,
    logout,
    checkTokenValidity,
    login,
  } = useAgent();
  const { theme } = useContext(ThemeContext);
  const { officeLocation, checkRadius } = useOfficeLocation();

  const [todayAttendance, setTodayAttendance] = useState(null);
  const [todayLeave, setTodayLeave] = useState(null);
  const [distance, setDistance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [agentShift, setAgentShift] = useState(null);
  const [workingTime, setWorkingTime] = useState("00:00");
  const [filteredSummary, setFilteredSummary] = useState(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [filterModal, setFilterModal] = useState(false);
  const [showLeaveList, setShowLeaveList] = useState(false);
  const [activeLeaveModal, setActiveLeaveModal] = useState(false);
  const [activeLeaveInfo, setActiveLeaveInfo] = useState(null);
  const [currentFilter, setCurrentFilter] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });

  /* ── Auth & Init ── */
  useEffect(() => {
    if (!isLoggedIn) return;
    (async () => {
      try {
        const tk = token || localStorage.getItem("agentToken");
        if (!tk) {
          await logout();
          router.replace("/agent/login");
          return;
        }
        let valid = false;
        try {
          valid = checkTokenValidity();
        } catch {}
        if (!valid) {
          const raw = localStorage.getItem("agentCredentials");
          if (raw) {
            try {
              const { agentId, password } = JSON.parse(raw);
              const r = await login(agentId, password, true);
              if (r.success) {
                await boot();
                setupNotifications();
                return;
              }
            } catch {}
          }
          await logout();
          router.replace("/agent/login");
          return;
        }
        await boot();
        setupNotifications();
      } catch {
        try {
          await boot();
        } catch {}
      }
    })();
  }, [isLoggedIn, token]);

  useEffect(() => {
    if (!todayAttendance || todayAttendance.checkOutTime) return;
    const id = setInterval(updateWorkingTime, 60000);
    return () => clearInterval(id);
  }, [todayAttendance]);

  /* ── Data Loaders ── */
  const boot = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadShift(),
        loadToday(),
        loadLocation(),
        loadSummary(),
        loadLeave(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadShift = async () => {
    try {
      if (agent?.shift) setAgentShift(agent.shift);
      else {
        const fa = await refreshAgentData();
        setAgentShift(fa.shift);
      }
    } catch {}
  };

  const loadToday = async () => {
    try {
      const today = new Date();
      const dayStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      );
      const local =
        await agentAttendanceService.getFromLocal("todaysAttendance");
      if (local && new Date(local.checkInTime) < dayStart)
        await agentAttendanceService.removeFromLocal("todaysAttendance");
      let s = await agentAttendanceService.getTodayStatus();
      if (s?.checkInTime && new Date(s.checkInTime) < dayStart) {
        s = null;
        await agentAttendanceService.removeFromLocal("todaysAttendance");
      }
      setTodayAttendance(s);
      if (s && !s.checkOutTime) updateWorkingTime();
    } catch {
      await agentAttendanceService.removeFromLocal("todaysAttendance");
      setTodayAttendance(null);
    }
  };

  const loadSummary = async (y = null, m = null) => {
    try {
      const s = await agentAttendanceService.getMonthlySummary(
        m || currentFilter.month,
        y || currentFilter.year,
      );
      setFilteredSummary(s);
    } catch {}
  };

  const loadLeave = async () => {
    try {
      const all = await agentLeaveService.getMyLeaves("agent");
      const today = new Date();
      const s0 = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      );
      const s1 = new Date(s0);
      s1.setDate(s1.getDate() + 1);
      setTodayLeave(
        all.find(
          (l) =>
            l.status === "approved" &&
            new Date(l.startDate) <= s1 &&
            new Date(l.endDate) >= s0,
        ) || null,
      );
    } catch {
      setTodayLeave(null);
    }
  };

  const loadLocation = async () => {
    try {
      const loc = agent?.location?.latitude
        ? {
            latitude: agent.location.latitude,
            longitude: agent.location.longitude,
          }
        : await getCurrentLocation();
      setDistance(
        getDistance(
          loc.latitude,
          loc.longitude,
          officeLocation.latitude,
          officeLocation.longitude,
        ),
      );
    } catch {
      setDistance(null);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await agentAttendanceService.removeFromLocal("todaysAttendance");
      await Promise.all([
        refreshAgentData().then((fa) => setAgentShift(fa.shift)),
        loadToday(),
        loadLocation(),
        loadSummary(),
        loadLeave(),
      ]);
      toast.success("Data refreshed!");
    } catch {
      toast.error("Refresh failed");
    } finally {
      setRefreshing(false);
    }
  };

  const updateWorkingTime = () => {
    if (!todayAttendance?.checkInTime) return;
    const ms = Date.now() - new Date(todayAttendance.checkInTime).getTime();
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    setWorkingTime(
      `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
    );
  };

  /* ── Actions ── */
  const handleCheckIn = async () => {
    if (!agentShift) return toast.error("No shift assigned.");
    if (todayLeave) return toast.info("You have an approved leave today.");
    setChecking(true);
    try {
      const r = await agentAttendanceService.checkIn({
        shiftId: agentShift._id,
        userType: "agent",
      });
      if (r.success) {
        toast.success("Checked in! 🎉");
        await loadToday();
        await loadSummary();
      } else toast.error(r.message || "Unable to check in");
    } catch (e) {
      toast.error(e.message || "Check-in failed");
    } finally {
      setChecking(false);
    }
  };

  const handleCheckOut = async () => {
    if (!todayAttendance) return toast.error("No check-in found.");
    if (todayLeave) return toast.info("You have an approved leave today.");
    setChecking(true);
    try {
      const r = await agentAttendanceService.checkOut({
        attendanceId: todayAttendance._id,
        userType: "agent",
      });
      if (r.success) {
        toast.success("Checked out!");
        await loadToday();
        await loadSummary();
        await stopBackgroundLocation();
      } else toast.error(r.message || "Unable to check out");
    } catch (e) {
      toast.error(e.message || "Check-out failed");
    } finally {
      setChecking(false);
    }
  };

  const handleLeaveClick = async () => {
    try {
      const all = await agentLeaveService.getMyLeaves("agent");
      const today = new Date();
      const active = all.find(
        (l) => l.status === "approved" && new Date(l.endDate) >= today,
      );
      if (active) {
        setActiveLeaveInfo(active);
        setActiveLeaveModal(true);
      } else setShowLeaveModal(true);
    } catch {
      setShowLeaveModal(true);
    }
  };

  const handleLeaveSubmit = async (form) => {
    try {
      const r = await agentLeaveService.requestLeave({
        ...form,
        userType: "agent",
      });
      if (r.success) {
        toast.success("Leave requested! ✅");
        setShowLeaveModal(false);
        await loadLeave();
      } else toast.error(r.message || "Something went wrong.");
    } catch (e) {
      toast.error(e.message || "Failed to submit");
    }
  };

  /* ── Derived State ── */
  const canIn = !todayAttendance && !todayLeave && !!agentShift && !checking;
  const canOut =
    !!todayAttendance &&
    !todayAttendance.checkOutTime &&
    !todayLeave &&
    !checking;
  const inRange =
    distance !== null && distance !== undefined && distance <= checkRadius;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const GreetIcon = hour < 12 ? Sun : hour < 17 ? Sun : Moon;

  /* ── Loading Screen ── */
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-950 via-indigo-900 to-blue-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-3xl bg-white/10 backdrop-blur flex items-center justify-center mx-auto mb-4 animate-pulse">
            <ClipboardList className="h-8 w-8 text-white" />
          </div>
          <p className="text-white/70 text-sm font-medium">
            Loading attendance…
          </p>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#f0f4ff]">
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HERO HEADER
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-700 via-indigo-600 to-blue-600">
        {/* decorative blobs */}
        <div className="absolute -top-12 -right-12 w-52 h-52 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute top-8 -left-8  w-36 h-36 rounded-full bg-violet-400/20 blur-xl" />
        <div className="absolute bottom-0 right-1/3  w-28 h-28 rounded-full bg-blue-400/15 blur-xl" />

        <div className="relative px-5 pt-12 pb-7">
          {/* Top row */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <GreetIcon className="h-4 w-4 text-violet-200" />
                <span className="text-violet-200 text-xs font-semibold tracking-wide uppercase">
                  {greeting}
                </span>
              </div>
              <h1 className="text-[26px] font-extrabold text-white leading-tight tracking-tight">
                My Attendance
              </h1>
              <p className="text-violet-200/80 text-xs mt-1">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Icon buttons */}
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => router.push("/agent/dashboard")}
                className="w-9 h-9 rounded-2xl bg-white/10 backdrop-blur hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center"
              >
                <Home className="h-4 w-4 text-white" />
              </button>
              <button
                onClick={onRefresh}
                disabled={refreshing}
                className="w-9 h-9 rounded-2xl bg-white/10 backdrop-blur hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 text-white ${refreshing ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* Info chips */}
          <div className="flex flex-wrap gap-2">
            {/* Shift chip */}
            {agentShift ? (
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-3 py-1.5">
                <Clock className="h-3 w-3 text-violet-200" />
                <span className="text-white text-[11px] font-semibold">
                  {agentShift.name}
                </span>
                <span className="text-violet-300 text-[11px]">·</span>
                <span className="text-violet-200 text-[11px]">
                  {agentShift.startTime} – {agentShift.endTime}
                </span>
              </div>
            ) : (
              !loading && (
                <div className="flex items-center gap-1.5 bg-orange-400/20 border border-orange-300/30 rounded-full px-3 py-1.5">
                  <AlertCircle className="h-3 w-3 text-orange-200" />
                  <span className="text-orange-100 text-[11px] font-semibold">
                    No shift assigned
                  </span>
                </div>
              )
            )}

            {/* Location chip */}
            <div
              className={`flex items-center gap-1.5 border rounded-full px-3 py-1.5 backdrop-blur-sm ${
                loading
                  ? "bg-white/8 border-white/10"
                  : distance === null
                    ? "bg-red-500/20 border-red-300/30"
                    : inRange
                      ? "bg-emerald-400/20 border-emerald-300/30"
                      : "bg-orange-400/20 border-orange-300/30"
              }`}
            >
              <Navigation
                className={`h-3 w-3 ${
                  loading
                    ? "text-white/50"
                    : inRange
                      ? "text-emerald-200"
                      : distance === null
                        ? "text-red-200"
                        : "text-orange-200"
                }`}
              />
              <span
                className={`text-[11px] font-semibold ${
                  loading
                    ? "text-white/60"
                    : inRange
                      ? "text-emerald-100"
                      : distance === null
                        ? "text-red-100"
                        : "text-orange-100"
                }`}
              >
                {loading
                  ? "Checking…"
                  : distance === null
                    ? "Location off"
                    : inRange
                      ? `In range · ${distance.toFixed(0)}m`
                      : `Out of range · ${distance.toFixed(0)}m`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          MAIN CONTENT
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="px-4 pt-4 pb-10 space-y-4">
        {/* Modals (invisible) */}
        <LeaveRequestModal
          visible={showLeaveModal}
          onClose={() => setShowLeaveModal(false)}
          onSubmit={handleLeaveSubmit}
        />

        {/* ── Leave Banner ── */}
        <AnimatePresence>
          {todayLeave && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl px-4 py-3.5 flex items-center gap-3 shadow-sm"
            >
              <div className="w-9 h-9 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <CalendarDays className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-800">
                  On Approved Leave Today
                </p>
                <p className="text-xs text-amber-600 capitalize mt-0.5">
                  {todayLeave.leaveType} ·{" "}
                  {new Date(todayLeave.startDate).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                  })}
                  {todayLeave.startDate !== todayLeave.endDate &&
                    ` – ${new Date(todayLeave.endDate).toLocaleDateString("en-US", { day: "numeric", month: "short" })}`}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            CHECK IN / OUT CARD
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="px-5 py-8 flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
              </div>
              <p className="text-sm text-gray-400 font-medium">
                Fetching your attendance…
              </p>
            </div>
          ) : !todayAttendance ? (
            /* ── Not checked in ── */
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-md shadow-green-200">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-base leading-tight">
                    Ready to start?
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Mark your attendance for today
                  </p>
                </div>
              </div>

              <button
                onClick={handleCheckIn}
                disabled={!canIn}
                className={`w-full py-4 rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2.5 transition-all duration-200 ${
                  canIn
                    ? "bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white shadow-lg shadow-green-300/50 hover:shadow-green-400/60 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {checking ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Checking In…
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5" /> Check In Now
                  </>
                )}
              </button>

              {!agentShift && (
                <p className="text-center text-xs text-orange-500 font-medium">
                  ⚠️ No shift assigned — contact your admin
                </p>
              )}
            </div>
          ) : !todayAttendance.checkOutTime ? (
            /* ── Checked in, working ── */
            <div className="p-5 space-y-4">
              {/* Live timer banner */}
              <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
                        <Timer className="h-5 w-5 text-white" />
                      </div>
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />
                    </div>
                    <div>
                      <p className="text-indigo-200 text-[11px] font-semibold uppercase tracking-wide">
                        Live · Working
                      </p>
                      <p className="text-white text-2xl font-extrabold font-mono tracking-widest leading-tight">
                        {workingTime}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-indigo-300 text-[10px] font-medium">
                      Checked in
                    </p>
                    <p className="text-white text-sm font-bold">
                      {formatTime(todayAttendance.checkInTime)}
                    </p>
                    {agentShift && (
                      <p className="text-indigo-300 text-[10px] mt-0.5">
                        Ends {agentShift.endTime}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckOut}
                disabled={!canOut}
                className={`w-full py-4 rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2.5 transition-all duration-200 ${
                  canOut
                    ? "bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 text-white shadow-lg shadow-red-300/50 hover:shadow-red-400/60 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {checking ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Checking Out…
                  </>
                ) : (
                  <>
                    <LogOut className="h-5 w-5" /> Check Out Now
                  </>
                )}
              </button>
            </div>
          ) : (
            /* ── Done for the day ── */
            <div className="p-5">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 mb-4 text-center border border-emerald-100">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-200">
                  <CheckCircle2 className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-extrabold text-gray-900 text-base">
                  Attendance Complete! 🎉
                </h3>
                <p className="text-xs text-gray-400 mt-1 mb-4">
                  Great work today. See you tomorrow!
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-2xl py-3 px-2 border border-emerald-100 shadow-sm">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">
                        Check In
                      </p>
                    </div>
                    <p className="text-sm font-extrabold text-emerald-700">
                      {formatTime(todayAttendance.checkInTime)}
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl py-3 px-2 border border-rose-100 shadow-sm">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <div className="w-2 h-2 rounded-full bg-rose-400" />
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">
                        Check Out
                      </p>
                    </div>
                    <p className="text-sm font-extrabold text-rose-700">
                      {formatTime(todayAttendance.checkOutTime)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Late / Overtime badges */}
              <div className="space-y-2">
                {todayAttendance.isLate && (
                  <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2">
                    <span className="text-base">⏰</span>
                    <p className="text-xs font-semibold text-orange-700">
                      Late arrival · {todayAttendance.lateMinutes} min
                    </p>
                  </div>
                )}
                {todayAttendance.isOvertime && (
                  <div className="flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-xl px-3 py-2">
                    <span className="text-base">⭐</span>
                    <p className="text-xs font-semibold text-violet-700">
                      Overtime · {todayAttendance.overtimeMinutes} min
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            QUICK ACTIONS
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="grid grid-cols-2 gap-3">
          {/* Month picker */}
          <button
            onClick={() => setFilterModal(true)}
            className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 hover:border-indigo-200 hover:shadow-md active:scale-[0.98] transition-all text-left group"
          >
            <div className="w-9 h-9 rounded-2xl bg-indigo-100 flex items-center justify-center mb-3 group-hover:bg-indigo-200 transition-colors">
              <BarChart3 className="h-4 w-4 text-indigo-600" />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
              Monthly View
            </p>
            <p className="text-sm font-extrabold text-gray-800 group-hover:text-indigo-700 transition-colors leading-tight">
              {getMonthName(currentFilter.month)}
              <br />
              <span className="text-xs font-semibold text-gray-400">
                {currentFilter.year}
              </span>
            </p>
          </button>

          {/* Leave request */}
          <button
            onClick={handleLeaveClick}
            className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-3xl p-4 shadow-lg shadow-violet-300/40 hover:shadow-violet-400/50 hover:-translate-y-0.5 active:translate-y-0 transition-all text-left overflow-hidden"
          >
            <div className="absolute -top-3 -right-3 w-16 h-16 rounded-full bg-white/8" />
            <div className="absolute bottom-1 right-2 w-10 h-10 rounded-full bg-white/5" />
            <div className="relative">
              <div className="w-9 h-9 rounded-2xl bg-white/15 flex items-center justify-center mb-3">
                <ClipboardList className="h-4 w-4 text-white" />
              </div>
              <p className="text-[10px] font-bold text-violet-200 uppercase tracking-wide mb-0.5">
                Request
              </p>
              <p className="text-sm font-extrabold text-white leading-tight">
                Leave Day
              </p>
            </div>
          </button>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            LEAVE REQUESTS PANEL
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => setShowLeaveList((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50/70 active:bg-gray-100/70 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-fuchsia-100 to-purple-100 flex items-center justify-center">
                <ClipboardList className="h-4 w-4 text-fuchsia-600" />
              </div>
              <span className="font-bold text-gray-800 text-sm">
                Leave Requests
              </span>
            </div>
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${showLeaveList ? "bg-gray-100" : "bg-gray-50"}`}
            >
              {showLeaveList ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </div>
          </button>

          <AnimatePresence>
            {showLeaveList && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden"
              >
                <div className="border-t border-gray-100 px-5 pt-4 pb-5">
                  <LeaveRequestsList />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            MONTHLY SUMMARY
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {filteredSummary && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                <h2 className="font-bold text-gray-800 text-sm">
                  Monthly Summary
                </h2>
              </div>
              <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 rounded-full px-3 py-1 border border-indigo-100">
                {getMonthName(currentFilter.month)} {currentFilter.year}
              </span>
            </div>

            <div className="px-5 pb-5 pt-4">
              <AttendanceSummary
                monthlySummary={filteredSummary}
                filter={currentFilter}
              />
            </div>
          </div>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            LOCATION STATUS
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div
          className={`rounded-3xl border px-4 py-4 flex items-center justify-between shadow-sm ${
            loading
              ? "bg-white border-gray-100"
              : distance === null
                ? "bg-red-50 border-red-200"
                : inRange
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-orange-50 border-orange-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                loading
                  ? "bg-gray-100"
                  : inRange
                    ? "bg-emerald-100"
                    : distance === null
                      ? "bg-red-100"
                      : "bg-orange-100"
              }`}
            >
              <MapPin
                className={`h-5 w-5 ${
                  loading
                    ? "text-gray-400"
                    : inRange
                      ? "text-emerald-600"
                      : distance === null
                        ? "text-red-500"
                        : "text-orange-500"
                }`}
              />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-0.5">
                Location Status
              </p>
              <p
                className={`text-sm font-bold ${
                  loading
                    ? "text-gray-500"
                    : inRange
                      ? "text-emerald-700"
                      : distance === null
                        ? "text-red-600"
                        : "text-orange-600"
                }`}
              >
                {loading
                  ? "Checking location…"
                  : distance === null
                    ? "Location unavailable"
                    : inRange
                      ? "Within office range ✓"
                      : "Outside office range"}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[10px] text-gray-400 font-medium">Distance</p>
            <p
              className={`text-base font-extrabold ${
                loading
                  ? "text-gray-400"
                  : inRange
                    ? "text-emerald-700"
                    : distance === null
                      ? "text-red-500"
                      : "text-orange-600"
              }`}
            >
              {distance !== null && distance !== undefined
                ? `${distance.toFixed(0)}m`
                : "—"}
            </p>
            <p className="text-[10px] text-gray-400">Limit: {checkRadius}m</p>
          </div>
        </div>
      </div>
      {/* /main content */}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          MODALS
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <AttendanceFilter
        visible={filterModal}
        onClose={() => setFilterModal(false)}
        onApply={(f) => {
          setCurrentFilter(f);
          loadSummary(f.year, f.month);
        }}
        currentFilter={currentFilter}
      />

      <GlobalModal
        visible={activeLeaveModal}
        onClose={() => {
          setActiveLeaveModal(false);
          setActiveLeaveInfo(null);
        }}
        title="Active Leave Found"
        message={
          activeLeaveInfo
            ? `You already have an approved leave from ${new Date(activeLeaveInfo.startDate).toLocaleDateString("en-PK")} to ${new Date(activeLeaveInfo.endDate).toLocaleDateString("en-PK")}.\n\nLeave Type: ${activeLeaveInfo.leaveType}\nReason: ${activeLeaveInfo.reason}\n\nYou cannot request another leave until your current leave ends.`
            : "You have an active approved leave."
        }
        icon="🚫"
        type="warning"
        buttons={[
          {
            text: "View My Leaves",
            icon: "📋",
            color: "#6366f1",
            onPress: () => {
              setShowLeaveList(true);
              setActiveLeaveModal(false);
            },
          },
          {
            text: "OK, Got It",
            icon: "✅",
            color: "#8b5cf6",
            onPress: () => setActiveLeaveModal(false),
          },
        ]}
      />
    </div>
  );
}
