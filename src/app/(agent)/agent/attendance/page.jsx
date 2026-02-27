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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-indigo-50/30">
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HERO HEADER
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-black pb-12 rounded-[40px] mx-4 mt-4 shadow-2xl shadow-indigo-950/20">
        {/* Animated Decorative Elements */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]" />

        <div className="relative px-6 pt-14 pb-4">
          {/* Top row */}
          <div className="flex items-start justify-between mb-8">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/10">
                  <GreetIcon className="h-4 w-4 text-white" />
                </div>
                <span className="text-slate-300 text-[10px] font-bold tracking-widest uppercase">
                  {greeting}
                </span>
              </div>
              <h1 className="text-3xl font-black text-white leading-tight tracking-tight">
                My Attendance
              </h1>
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                <Calendar className="h-3 w-3" />
                {new Date().toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>

            {/* Icon buttons */}
            <div className="flex items-center gap-3 mt-1">
              <button
                onClick={() => router.push("/agent/dashboard")}
                className="w-11 h-11 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/15 active:scale-90 transition-all flex items-center justify-center group"
                title="Go Home"
              >
                <Home className="h-5 w-5 text-white/80 group-hover:text-white transition-colors" />
              </button>
              <button
                onClick={onRefresh}
                disabled={refreshing}
                className="w-11 h-11 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/15 active:scale-90 transition-all flex items-center justify-center disabled:opacity-50 group"
                title="Refresh Data"
              >
                <RefreshCw
                  className={`h-5 w-5 text-white/80 group-hover:text-white transition-colors ${refreshing ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* Info chips */}
          <div className="flex flex-wrap gap-2.5">
            {/* Shift chip */}
            {agentShift ? (
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-2 hover:bg-white/10 transition-colors">
                <Clock className="h-3.5 w-3.5 text-blue-400" />
                <div className="flex flex-col">
                  <span className="text-white text-[10px] font-bold leading-none mb-0.5">
                    {agentShift.name}
                  </span>
                  <span className="text-slate-400 text-[9px] font-medium leading-none">
                    {agentShift.startTime} – {agentShift.endTime}
                  </span>
                </div>
              </div>
            ) : (
              !loading && (
                <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-2xl px-4 py-2">
                  <AlertCircle className="h-3.5 w-3.5 text-rose-400" />
                  <span className="text-rose-200 text-[10px] font-bold">
                    No Shift Assigned
                  </span>
                </div>
              )
            )}

            {/* Location chip */}
            <div
              className={`flex items-center gap-2 border rounded-2xl px-4 py-2 backdrop-blur-md transition-all ${
                loading
                  ? "bg-white/5 border-white/5"
                  : distance === null
                    ? "bg-rose-500/10 border-rose-500/20"
                    : inRange
                      ? "bg-emerald-500/10 border-emerald-500/20"
                      : "bg-amber-500/10 border-amber-500/20"
              }`}
            >
              <Navigation
                className={`h-3.5 w-3.5 ${
                  loading
                    ? "text-white/30"
                    : inRange
                      ? "text-emerald-400"
                      : distance === null
                        ? "text-rose-400"
                        : "text-amber-400"
                }`}
              />
              <div className="flex flex-col">
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider ${
                    loading
                      ? "text-white/40"
                      : inRange
                        ? "text-emerald-400/80"
                        : distance === null
                          ? "text-rose-400/80"
                          : "text-amber-400/80"
                  }`}
                >
                  Location Status
                </span>
                <span
                  className={`text-[10px] font-bold ${
                    loading
                      ? "text-white/60"
                      : inRange
                        ? "text-emerald-100"
                        : distance === null
                          ? "text-rose-100"
                          : "text-amber-100"
                  }`}
                >
                  {loading
                    ? "Checking…"
                    : distance === null
                      ? "Unavailable"
                      : inRange
                        ? `In Range (${distance.toFixed(0)}m)`
                        : `Out Range (${distance.toFixed(0)}m)`}
                </span>
              </div>
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
        <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden relative z-10 transition-all hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)]">
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
                className={`w-full py-4.5 rounded-[22px] font-black text-[16px] flex items-center justify-center gap-3 transition-all duration-300 relative overflow-hidden group ${
                  canIn
                    ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-xl shadow-emerald-200/50 hover:shadow-emerald-300/60 hover:-translate-y-1 active:scale-95"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                {/* Button Shine Effect */}
                <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:left-full transition-all duration-700" />

                {checking ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Checking In…
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5 group-hover:translate-x-1 transition-transform" />{" "}
                    Start Working
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
                className={`w-full py-4.5 rounded-[22px] font-black text-[16px] flex items-center justify-center gap-3 transition-all duration-300 relative overflow-hidden group ${
                  canOut
                    ? "bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 text-white shadow-xl shadow-rose-200/50 hover:shadow-rose-300/60 hover:-translate-y-1 active:scale-95"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:left-full transition-all duration-700" />

                {checking ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Checking Out…
                  </>
                ) : (
                  <>
                    <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />{" "}
                    Finish Working
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
            className="bg-white rounded-[32px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 hover:border-indigo-200 hover:shadow-indigo-100/50 active:scale-95 transition-all text-left"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center mb-4">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Analytics
            </p>
            <p className="text-[15px] font-black text-slate-800 leading-tight">
              {getMonthName(currentFilter.month)}
              <span className="block text-[11px] font-bold text-slate-400 mt-1">
                Year · {currentFilter.year}
              </span>
            </p>
          </button>

          {/* Leave request */}
          <button
            onClick={handleLeaveClick}
            className="group relative bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 rounded-[32px] p-5 shadow-xl shadow-indigo-200/40 hover:shadow-indigo-400/30 hover:-translate-y-1 active:scale-95 transition-all text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-4 border border-white/10">
                <ClipboardList className="h-5 w-5 text-white" />
              </div>
              <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest mb-1">
                Requests
              </p>
              <p className="text-[15px] font-black text-white leading-tight">
                Apply Leave
                <span className="block text-[11px] font-bold text-indigo-200/70 mt-1">
                  New request
                </span>
              </p>
            </div>
          </button>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            MONTHLY SUMMARY & STATISTICS
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {filteredSummary && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-800 text-sm leading-none">
                    Overview
                  </h2>
                  <p className="text-[10px] text-gray-400 font-medium mt-1">
                    Performance this month
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 rounded-full px-3 py-1.5 border border-indigo-100">
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
            LEAVE REQUESTS PANEL
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => setShowLeaveList((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50/70 active:bg-gray-100/70 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-fuchsia-50 flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-fuchsia-600" />
              </div>
              <div className="text-left">
                <span className="font-bold text-gray-800 text-sm block leading-none">
                  My Leaves
                </span>
                <p className="text-[10px] text-gray-400 font-medium mt-1">
                  History & status
                </p>
              </div>
            </div>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${showLeaveList ? "bg-gray-100 rotate-180" : "bg-gray-50"}`}
            >
              <ChevronDown className="h-4 w-4 text-gray-500" />
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
