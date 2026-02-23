// src/app/(agent)/agent/dashboard/page.jsx
"use client";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3,
  MapPin,
  Users,
  Calendar,
  Zap,
  TrendingUp,
  Target,
  ChevronRight,
  Activity,
  DollarSign,
  Clock,
  CheckCircle2,
  Filter,
  Download,
  Hash,
  Bell,
  Trophy,
  Lightbulb,
  Star,
} from "lucide-react";
import { ThemeContext } from "../../../../context/ThemeContext";
import { AgentContext } from "../../../../context/AgentContext";
import { useOfficeLocation } from "../../../../context/LocationContext";
import { agentAttendanceService } from "../../../../services/agentAttendenceService";
import { agentSalesService } from "../../../../services/agentSalesService";
import {
  getAddressFromCoords,
  getCurrentLocation,
  getDistance,
} from "../../../../utils/locationUtils";
import { cn } from "../../../../lib/utils";
import ShiftSchedule from "../../../../components/ShiftSchedule";
import MonthlyTargetProgress from "../../../../components/sales/MonthlyTargetProgress";

// Accuracy threshold — ignore fixes with accuracy worse than this (in meters)
const ACCURACY_THRESHOLD = 1000;

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: custom * 0.1, ease: "easeOut" },
  }),
};

const HomeScreen = () => {
  const router = useRouter();
  const { theme } = useContext(ThemeContext);
  const {
    agent,
    isLoggedIn,
    isLoading: agentLoading,
  } = useContext(AgentContext);
  const { officeLocation, checkRadius } = useOfficeLocation();

  const [distance, setDistance] = useState(null);
  const [currentAddress, setCurrentAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAtOffice, setIsAtOffice] = useState(false);
  const [agentStats, setAgentStats] = useState(null);
  const [lastLocationUpdate, setLastLocationUpdate] = useState(null);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [attendanceData, setAttendanceData] = useState({
    todayStatus: null,
    monthlyStats: null,
    todaysCheckIns: 0,
    lastCheckInTime: null,
  });

  // Target stats data
  const [targetStats, setTargetStats] = useState({
    targetType: "none",
    digitTarget: 0,
    amountTarget: 0,
    currency: "PKR",
    achievedDigits: 0,
    achievedAmount: 0,
    progressPercentage: 0,
    isTargetAchieved: false,
  });

  const [recentActivity, setRecentActivity] = useState([]);

  // Current month for target display
  const [currentMonth, setCurrentMonth] = useState("");

  // Fetch attendance data
  const fetchAttendanceData = async () => {
    try {
      const [todayStatusResp, monthlyStatsResp] = await Promise.allSettled([
        agentAttendanceService.getTodayStatus?.(),
        agentAttendanceService.getMonthlySummary?.(),
      ]);

      let todayStatus = null;
      if (todayStatusResp.status === "fulfilled") {
        const data = todayStatusResp.value?.data ?? todayStatusResp.value;
        todayStatus = Array.isArray(data) ? data[0] : data;
      }

      let monthlyStats = null;
      if (monthlyStatsResp.status === "fulfilled") {
        monthlyStats = monthlyStatsResp.value?.data ?? monthlyStatsResp.value;
      }

      setAttendanceData({
        todayStatus,
        monthlyStats,
        todaysCheckIns: todayStatus ? 1 : 0,
      });
    } catch (error) {
      console.error("Error fetching attendance:", error);
    }
  };

  // Fetch agent stats and targets
  const fetchAgentStats = async () => {
    if (!agent?.id && !agent?._id) return;

    try {
      const agentId = agent.id || agent._id;

      // Get agent's target info from agent data
      const agentTargetType = agent.monthlyTargetType || "none";
      const digitTarget = agent.monthlyDigitTarget || 0;
      const amountTarget = agent.monthlyAmountTarget || 0;
      const currency = agent.targetCurrency || "PKR";

      // Get current month's start and end dates
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentMonthEnd = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
      );

      const [overviewResponse, bookingsResponse] = await Promise.all([
        agentSalesService.getAgentSalesOverview(agentId),
        agentSalesService.getAgentBookings(agentId, { limit: 100 }), // Get more bookings to filter current month
      ]);

      const overview = overviewResponse?.data?.overview || {};

      // Get all bookings
      const allBookings = Array.isArray(bookingsResponse?.data?.bookings)
        ? bookingsResponse.data.bookings
        : Array.isArray(bookingsResponse?.bookings)
          ? bookingsResponse.bookings
          : [];

      // Filter current month's bookings
      const currentMonthBookings = allBookings.filter((booking) => {
        const bookingDate = new Date(booking.createdAt);
        return (
          bookingDate >= currentMonthStart && bookingDate <= currentMonthEnd
        );
      });

      // Filter current month's completed bookings
      const currentMonthCompletedBookings = currentMonthBookings.filter(
        (booking) =>
          booking.status === "completed" || booking.status === "Completed",
      );

      // Calculate achieved values based on target type
      let achievedDigits = 0;
      let achievedAmount = 0;

      // For digit or both target types, count completed bookings
      if (agentTargetType === "digit" || agentTargetType === "both") {
        achievedDigits = currentMonthCompletedBookings.length;
      }

      // For amount target: sum from completed projects
      // For both target: revenue from projects ONLY (not bookings)
      if (agentTargetType === "amount" || agentTargetType === "both") {
        // Fetch projects for current month
        try {
          // Fetch ALL projects for this agent
          console.log(
            `🔍 Dashboard: Fetching ALL projects for agent ${agentId}`,
          );
          const projectsRes = await fetch(
            `/api/projects?assignedAgent=${agentId}&limit=1000`,
          );
          const projectsJson = await projectsRes.json();
          console.log(`📦 Dashboard: Projects API response:`, projectsJson);

          let projectData = [];
          if (projectsJson && projectsJson.success) {
            projectData = projectsJson.data || [];
          } else if (Array.isArray(projectsJson)) {
            projectData = projectsJson;
          }

          // Filter by current month based on updatedAt or completedAt
          projectData = projectData.filter((p) => {
            const relevantDate = p.completedAt
              ? new Date(p.completedAt)
              : new Date(p.updatedAt);
            return (
              relevantDate >= currentMonthStart &&
              relevantDate <= currentMonthEnd
            );
          });

          console.log(
            `📦 Dashboard: Projects in current month: ${projectData.length} projects`,
          );

          // Calculate amount from completed projects only
          const completedProjects = projectData.filter((p) => {
            const status = (p.status || "").toString().toLowerCase();
            return status === "completed" || status === "delivered";
          });

          achievedAmount = completedProjects.reduce((sum, p) => {
            const amt = parseFloat(p.price) || parseFloat(p.amount) || 0;
            return sum + (isNaN(amt) ? 0 : amt);
          }, 0);

          console.log(`💰 Revenue from projects (${agentTargetType} target):`, {
            achievedAmount,
            totalProjects: projectData.length,
            completedProjects: completedProjects.length,
            completedProjectDetails: completedProjects.map((p) => ({
              title: p.title,
              price: p.price,
              status: p.status,
            })),
          });
        } catch (projErr) {
          console.error(
            "❌ Failed to fetch projects for target calculation",
            projErr,
          );
        }
      }

      // Update target stats
      setTargetStats({
        targetType: agentTargetType,
        digitTarget,
        amountTarget,
        currency,
        achievedDigits,
        achievedAmount,
        progressPercentage: 0, // Will be calculated in MonthlyTargetProgress component
        isTargetAchieved: false,
      });

      // Create recent activity from latest bookings with amounts
      const activity = allBookings.slice(0, 5).map((booking, index) => {
        const amount =
          parseFloat(booking.amount) ||
          parseFloat(booking.discountedPrice) ||
          parseFloat(booking.totalPrice) ||
          parseFloat(booking.price);

        let currencySymbol = currency || "PKR";
        if (agentTargetType === "digit") {
          currencySymbol = "$";
        } else if (currencySymbol === "USD") {
          currencySymbol = "$";
        }

        return {
          id: booking._id || index,
          message: `New booking from ${booking?.formData?.firstName || booking?.customerName || "Customer"}`,
          amount: amount
            ? `${currencySymbol} ${amount.toLocaleString()}`
            : null,
          status: booking.status || "Pending",
          time: new Date(booking.createdAt).toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
      });

      setRecentActivity(activity);
    } catch (error) {
      console.error("❌ Error fetching agent stats:", error);
    }
  };

  const fetchLocationData = async () => {
    try {
      let location = null;
      let address = "";

      if (agent?.location?.latitude && agent?.location?.longitude) {
        location = {
          latitude: agent.location.latitude,
          longitude: agent.location.longitude,
          accuracy: agent.location.accuracy,
        };
        address = agent.location.address || "";
      } else {
        try {
          const freshLocation = await getCurrentLocation();
          if (freshLocation) {
            location = freshLocation;
            try {
              const freshAddress = await getAddressFromCoords(
                freshLocation.latitude,
                freshLocation.longitude,
              );
              address = freshAddress || "";
            } catch (addressError) {
              console.warn("Could not get address:", addressError);
            }
          }
        } catch (error) {
          console.warn("Failed to get fresh location from browser:", error);
        }
      }

      if (!location || !location.latitude || !location.longitude) {
        setCurrentAddress("Location unavailable");
        setIsAtOffice(false);
        setDistance(null);
        setLocationAccuracy(null);
        setLastLocationUpdate(null);
        return;
      }

      if (location.accuracy && location.accuracy > ACCURACY_THRESHOLD) {
        setCurrentAddress("Location unavailable (low accuracy)");
        setIsAtOffice(false);
        setDistance(null);
        setLocationAccuracy(location.accuracy || null);
        setLastLocationUpdate(new Date());
        return;
      }

      const dist = getDistance(
        location.latitude,
        location.longitude,
        officeLocation.latitude,
        officeLocation.longitude,
      );

      setCurrentAddress(
        address ||
          `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`,
      );
      setIsAtOffice(dist <= checkRadius);
      setDistance(dist);
      setLocationAccuracy(location.accuracy || null);
      setLastLocationUpdate(new Date());
    } catch (error) {
      console.error("❌ Error fetching location:", error);
      setCurrentAddress("Address unavailable");
      setIsAtOffice(false);
      setDistance(null);
      setLocationAccuracy(null);
    }
  };

  const fetchAllData = async () => {
    if (!isLoggedIn || agentLoading) {
      return;
    }

    try {
      setLoading(true);
      await Promise.all([
        fetchLocationData(),
        fetchAttendanceData(),
        fetchAgentStats(),
      ]);
    } catch (error) {
      console.error("Error fetching all data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when login status or agent changes
  useEffect(() => {
    if (isLoggedIn && !agentLoading) {
      fetchAllData();

      // Refetch location every 10 seconds (reduced frequency for better performance)
      const locationRefreshInterval = setInterval(() => {
        fetchLocationData();
      }, 10000);

      return () => clearInterval(locationRefreshInterval);
    }
  }, [officeLocation, checkRadius, agent, isLoggedIn, agentLoading]);

  // Watch for agent location changes specifically
  useEffect(() => {
    if (agent?.location && isLoggedIn) {
      fetchLocationData();
    }
  }, [agent?.location?.latitude, agent?.location?.longitude]);

  // Redirect if not logged in
  useEffect(() => {
    if (!agentLoading && !isLoggedIn) {
      router.push("/agent/login");
    }
  }, [isLoggedIn, agentLoading, router]);

  // Set current month on mount
  useEffect(() => {
    const now = new Date();
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
    const currentMonthString = `${months[now.getMonth()]} ${now.getFullYear()}`;
    setCurrentMonth(currentMonthString);
  }, []);

  // Show loading
  if (agentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Return null while redirecting
  if (!isLoggedIn) {
    return null;
  }

  // Helper functions
  const formatDistance = (dist) => {
    if (dist == null) return "Unknown";

    // If within 10m radius, show "You're in office"
    if (dist <= checkRadius) {
      return "✅ You're in office";
    }

    // If greater than 10m, show distance from office
    if (dist < 1000) {
      return `📏 ${dist.toFixed(0)} m from office`;
    }

    return `📏 ${(dist / 1000).toFixed(2)} km from office`;
  };

  const formatTime = (dateString) => {
    if (!dateString) return "None";
    return new Date(dateString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const goToAttendance = () => router.push("/agent/attendance");
  const goToSales = () => router.push("/agent/sales");

  // Stat cards data - dynamic based on target type
  const getStatCards = () => {
    const cards = [];

    // Card 1: Completed Units/Bookings (always show)
    cards.push({
      title: "Completed Sales",
      value: targetStats.achievedDigits.toString(),
      subtitle: "This Month",
      icon: CheckCircle2,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      onClick: goToSales,
    });

    // Card 2: Present Days (always show)
    cards.push({
      title: "Present Days",
      value: (attendanceData.monthlyStats?.present || 0).toString(),
      subtitle: "This Month",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
      onClick: goToAttendance,
    });

    // Card 3 & 4: Based on target type
    if (targetStats.targetType === "digit") {
      cards.push({
        title: "Digit Target",
        value: targetStats.digitTarget.toString(),
        subtitle: "Units Goal",
        icon: Hash,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        onClick: goToSales,
      });
      cards.push({
        title: "Remaining",
        value: Math.max(
          0,
          targetStats.digitTarget - targetStats.achievedDigits,
        ).toString(),
        subtitle: "Units Needed",
        icon: Target,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        onClick: goToSales,
      });
    } else if (targetStats.targetType === "amount") {
      cards.push({
        title: "Revenue Target",
        value: `${targetStats.currency} ${targetStats.amountTarget.toLocaleString()}`,
        subtitle: "Monthly Goal",
        icon: DollarSign,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        onClick: goToSales,
      });
      cards.push({
        title: "Revenue Achieved",
        value: `${targetStats.currency} ${targetStats.achievedAmount.toLocaleString()}`,
        subtitle: "This Month",
        icon: TrendingUp,
        color: "text-green-600",
        bgColor: "bg-green-50",
        onClick: goToSales,
      });
    } else if (targetStats.targetType === "both") {
      cards.push({
        title: "Digit Target",
        value: `${targetStats.achievedDigits}/${targetStats.digitTarget}`,
        subtitle: "Units Progress",
        icon: Hash,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        onClick: goToSales,
      });
      cards.push({
        title: "Revenue Progress",
        value: `${targetStats.currency} ${targetStats.achievedAmount.toLocaleString()}`,
        subtitle: `of ${targetStats.currency} ${targetStats.amountTarget.toLocaleString()}`,
        icon: DollarSign,
        color: "text-green-600",
        bgColor: "bg-green-50",
        onClick: goToSales,
      });
    } else {
      // No target type
      cards.push({
        title: "Total Bookings",
        value: targetStats.achievedDigits.toString(),
        subtitle: "This Month",
        icon: Target,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        onClick: goToSales,
      });
      cards.push({
        title: "Performance",
        value: "N/A",
        subtitle: "No Target Set",
        icon: TrendingUp,
        color: "text-gray-600",
        bgColor: "bg-gray-50",
        onClick: goToSales,
      });
    }

    return cards;
  };

  const statCards = getStatCards();

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10">
      {/* Header Section */}
      <div className="mb-10 px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">
              Welcome back,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B5DB] to-blue-600">
                {agent?.agentName || agent?.name || "Employee"}
              </span>
              !
            </h1>
            <p className="text-slate-500 font-medium text-base">
              Here's what's happening in{" "}
              <span className="text-slate-900 font-bold">{currentMonth}</span>
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-4 bg-white/50 backdrop-blur-md p-2 rounded-2xl border border-white shadow-sm"
          >
            <div className="flex flex-col items-end px-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                System Status
              </span>
              <span className="flex items-center gap-2 text-sm font-bold text-emerald-600">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live & Operational
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Location Card - Modernized */}
      {(currentAddress || distance !== null) && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1}
          className="mx-4 sm:mx-6 lg:mx-8 mb-10"
        >
          <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/60 relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
              <div className="flex items-start gap-6 flex-1">
                <div className="p-4 bg-gradient-to-br from-[#10B5DB] to-blue-600 rounded-[1.5rem] shadow-lg shadow-blue-200">
                  <MapPin className="h-7 w-7 text-white" />
                </div>
                <div className="space-y-3 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <h3 className="text-xl font-bold text-slate-900">
                      Current Location
                    </h3>
                    {isAtOffice ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 uppercase tracking-wider">
                        At Office
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold border border-amber-200 uppercase tracking-wider">
                        Remote
                      </span>
                    )}
                  </div>

                  {currentAddress && (
                    <p className="text-slate-600 font-medium flex items-center gap-2 text-sm">
                      <span className="text-[#10B5DB]">📍</span>
                      {currentAddress}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4">
                    {distance !== null && (
                      <div className="flex items-center gap-2 bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200/50">
                        <Target className="h-4 w-4 text-slate-500" />
                        <span className="text-xs font-bold text-slate-700">
                          {formatDistance(distance)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">
                        Live Tracking
                      </span>
                    </div>

                    {lastLocationUpdate && (
                      <div className="flex items-center gap-2 text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          Updated {lastLocationUpdate.toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {!isAtOffice && distance !== null && (
                <div className="hidden lg:block h-16 w-[1px] bg-slate-200/60 mx-4" />
              )}

              {!isAtOffice && locationAccuracy && (
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Position Accuracy
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          locationAccuracy < 100
                            ? "bg-emerald-500"
                            : locationAccuracy < 500
                              ? "bg-amber-500"
                              : "bg-red-500",
                        )}
                        style={{
                          width: `${Math.max(10, 100 - locationAccuracy / 10)} %`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-black text-slate-700">
                      {locationAccuracy.toFixed(0)}m
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Grid - Premium Redesign */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 px-4 sm:px-6 lg:px-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            onClick={stat.onClick}
            className="cursor-pointer group relative"
          >
            {/* Glossy Card */}
            <div className="h-full bg-white/70 backdrop-blur-xl rounded-[2rem] p-6 shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-white hover:border-[#10B5DB]/30 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 overflow-hidden">
              {/* Background Glow Effect */}
              <div
                className={cn(
                  "absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700",
                  stat.bgColor.replace("bg-", "bg-"),
                )}
              />

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={cn(
                      "p-3 rounded-xl shadow-sm transform transition-transform duration-500 group-hover:rotate-12",
                      stat.bgColor,
                    )}
                  >
                    <stat.icon className={cn("h-6 w-6", stat.color)} />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                    <span className="text-[10px] font-black text-[#10B5DB] uppercase tracking-widest">
                      Details
                    </span>
                    <ChevronRight className="h-4 w-4 text-[#10B5DB]" />
                  </div>
                </div>

                <div className="mt-auto">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-1">
                    {stat.title}
                  </h4>
                  <div className="flex flex-col">
                    <span className="text-2xl font-black text-slate-900 tracking-tighter leading-none mb-1">
                      {stat.value}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100/50 w-fit px-2 py-0.5 rounded-md mt-0.5">
                      {stat.subtitle}
                    </span>
                  </div>
                </div>

                {/* Progress Bar (Subtle) */}
                <div className="mt-6 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "70%" }}
                    className={cn(
                      "h-full rounded-full",
                      stat.color.replace("text-", "bg-"),
                    )}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-8 px-4 sm:px-6 lg:px-8">
        {/* Recent Activity */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={3}
          className="lg:col-span-4"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-white overflow-hidden h-full">
            <div className="p-6 border-b border-slate-50 bg-slate-50/20">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white shadow-sm rounded-2xl">
                    <Activity className="h-6 w-6 text-[#10B5DB]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                      Recent Activity
                    </h3>
                    <p className="text-slate-500 text-xs font-bold">
                      Your latest performance updates
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 rounded-xl border border-slate-100 text-sm font-bold text-slate-600 transition-all shadow-sm">
                    <Filter className="h-4 w-4" />
                    Filter
                  </button>
                  <button className="p-2.5 bg-white hover:bg-slate-50 rounded-xl border border-slate-100 text-slate-600 transition-all shadow-sm">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col h-full">
              {/* Activity Section - Feed Style */}
              <div className="flex-1 p-6 max-h-[400px] overflow-y-auto custom-scrollbar">
                <div className="space-y-6 relative">
                  {/* Timeline Line */}
                  {recentActivity.length > 0 && (
                    <div className="absolute left-[27px] top-10 bottom-10 w-[2px] bg-gradient-to-b from-blue-100 via-slate-100 to-transparent hidden sm:block" />
                  )}

                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative flex items-start gap-6"
                      >
                        {/* Status Icon with Timeline Dot */}
                        <div className="relative z-10 flex-shrink-0">
                          <div
                            className={cn(
                              "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
                              activity.status?.toLowerCase() === "completed"
                                ? "bg-emerald-500 text-white shadow-emerald-200"
                                : "bg-blue-600 text-white shadow-blue-200",
                            )}
                          >
                            {activity.status?.toLowerCase() === "completed" ? (
                              <CheckCircle2 className="w-6 h-6" />
                            ) : (
                              <TrendingUp className="w-6 h-6" />
                            )}
                          </div>
                        </div>

                        {/* Content Card */}
                        <div
                          className="flex-1 bg-slate-50/50 hover:bg-white p-5 rounded-3xl border border-slate-100/50 hover:border-blue-100 transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/5 cursor-pointer group/card"
                          onClick={goToSales}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                            <h4 className="text-base font-black text-slate-800 group-hover/card:text-blue-600 transition-colors">
                              {activity.message}
                            </h4>
                            <span
                              className={cn(
                                "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border self-start sm:self-center",
                                activity.status?.toLowerCase() === "completed"
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                  : "bg-blue-50 text-blue-600 border-blue-100",
                              )}
                            >
                              {activity.status || "In Review"}
                            </span>
                          </div>

                          <div className="flex items-center gap-6">
                            {activity.amount && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-400">
                                  Total:
                                </span>
                                <span className="text-sm font-black text-emerald-600">
                                  {activity.amount}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <Clock className="w-3.5 h-3.5" />
                              <span className="text-xs font-bold">
                                {activity.time}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-20 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-100">
                      <div className="w-20 h-20 bg-white shadow-lg rounded-3xl mx-auto flex items-center justify-center mb-6">
                        <Activity className="h-10 w-10 text-slate-200" />
                      </div>
                      <h4 className="text-xl font-black text-slate-400 underline decoration-slate-200 underline-offset-8">
                        No Recent Activity
                      </h4>
                    </div>
                  )}
                </div>
              </div>

              {/* Notice Board Section - Modern Grid */}
              <div className="bg-slate-900/5 border-t border-white/50 p-6 sm:p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md">
                      <Bell className="h-6 w-6 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">
                        Notice Board
                      </h3>
                      <p className="text-slate-500 text-xs font-bold">
                        Company announcements
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Notice Card 1 */}
                  <div className="relative group overflow-hidden bg-gradient-to-br from-white to-orange-50/30 p-5 rounded-[1.5rem] border border-white shadow-sm hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 cursor-pointer">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/5 rounded-full blur-2xl -mr-8 -mt-8" />
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-[9px] font-black rounded-md uppercase tracking-widest">
                        New
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        Policy Update
                      </span>
                    </div>
                    <h4 className="text-base font-black text-slate-900 mb-1 leading-tight">
                      Incentive Program 2026
                    </h4>
                    <p className="text-[11px] text-slate-500 font-bold leading-relaxed mb-3">
                      Top performers this quarter will be eligible for an
                      all-expenses paid retreat.
                    </p>
                    <div className="flex items-center gap-2 text-orange-600 group-hover:translate-x-2 transition-transform duration-300">
                      <span className="text-[9px] font-bold uppercase tracking-widest">
                        Read Details
                      </span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Notice Card 2 */}
                  <div className="relative group overflow-hidden bg-gradient-to-br from-white to-blue-50/30 p-5 rounded-[1.5rem] border border-white shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 cursor-pointer">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full blur-2xl -mr-8 -mt-8" />
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[9px] font-black rounded-md uppercase tracking-widest">
                        Event
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        Office News
                      </span>
                    </div>
                    <h4 className="text-base font-black text-slate-900 mb-1 leading-tight">
                      Weekly Team Sync
                    </h4>
                    <p className="text-[11px] text-slate-500 font-bold leading-relaxed mb-3">
                      Join us this Friday in the main conference room for our
                      weekly sync and celebration.
                    </p>
                    <div className="flex items-center gap-2 text-blue-600 group-hover:translate-x-2 transition-transform duration-300">
                      <span className="text-[9px] font-bold uppercase tracking-widest">
                        Add to Calendar
                      </span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Leaderboard & Tips - Filling the space */}
              <div className="px-6 py-6 bg-slate-50/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Small Leaderboard */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Trophy className="w-4 h-4 text-amber-500" />
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-tighter">
                        Top Performers
                      </h4>
                    </div>
                    <div className="space-y-3">
                      {[
                        {
                          name: "Sarah K.",
                          sales: "124",
                          color: "bg-blue-500",
                        },
                        {
                          name: "Mike R.",
                          sales: "118",
                          color: "bg-emerald-500",
                        },
                        {
                          name: "Ali H.",
                          sales: "112",
                          color: "bg-purple-500",
                        },
                      ].map((winner, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-100 shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-black",
                                winner.color,
                              )}
                            >
                              {winner.name.charAt(0)}
                            </div>
                            <span className="text-xs font-bold text-slate-700">
                              {winner.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span className="text-[10px] font-black text-slate-900">
                              {winner.sales}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pro Tip Card */}
                  <div className="bg-gradient-to-br from-[#10B5DB] to-blue-600 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-xl shadow-blue-500/20">
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                      <Lightbulb className="w-16 h-16 rotate-12" />
                    </div>
                    <h4 className="text-sm font-black mb-2 uppercase tracking-widest flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Pro Tip
                    </h4>
                    <p className="text-xs font-bold leading-relaxed opacity-90">
                      "Personalizing your opening pitch can increase conversion
                      rates by up to 25%. Try mentioning a specific benefit
                      early on."
                    </p>
                  </div>
                </div>
              </div>

              {recentActivity.length > 0 && (
                <div className="p-6 pt-0">
                  <button
                    onClick={goToSales}
                    className="w-full bg-slate-900 hover:bg-[#10B5DB] text-white py-3.5 rounded-xl text-sm font-black transition-all duration-300 shadow-xl shadow-slate-200 hover:shadow-blue-500/20 uppercase tracking-widest flex items-center justify-center gap-3 group"
                  >
                    View Sales Dashboard
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={5}
          className="lg:col-span-3 space-y-8"
        >
          {/* Shift Schedule Component */}
          <ShiftSchedule />

          {/* Monthly Target Progress */}
          <MonthlyTargetProgress
            theme={theme}
            currentMonth={currentMonth}
            achievedDigits={targetStats.achievedDigits}
            achievedAmount={targetStats.achievedAmount}
            digitTarget={targetStats.digitTarget}
            amountTarget={targetStats.amountTarget}
            targetType={targetStats.targetType}
            currency={targetStats.currency}
          />

          {/* Quick Actions - Modernized */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-white overflow-hidden">
            <div className="p-6 border-b border-slate-50 bg-slate-50/40">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-indigo-50 rounded-xl">
                  <Zap className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Quick Actions
                </h3>
              </div>
            </div>
            <div className="p-6 space-y-3">
              <button
                onClick={goToSales}
                className="group w-full flex items-center justify-between bg-slate-50 hover:bg-[#10B5DB] p-4 rounded-[1.25rem] transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-blue-500/20 border border-slate-100 hover:border-transparent"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white rounded-lg shadow-sm group-hover:scale-110 transition-all duration-500">
                    <Hash className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-black text-slate-700 group-hover:text-white transition-colors">
                    Add New Lead
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={goToAttendance}
                className="group w-full flex items-center justify-between bg-slate-50 hover:bg-emerald-600 p-4 rounded-[1.25rem] transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-emerald-500/20 border border-slate-100 hover:border-transparent"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white rounded-lg shadow-sm group-hover:scale-110 transition-all duration-500">
                    <Calendar className="h-4 w-4 text-emerald-600" />
                  </div>
                  <span className="text-sm font-black text-slate-700 group-hover:text-white transition-colors">
                    View Attendance
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </button>

              <button className="group w-full flex items-center justify-between bg-slate-50 hover:bg-purple-600 p-4 rounded-[1.25rem] transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-purple-500/20 border border-slate-100 hover:border-transparent">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white rounded-lg shadow-sm group-hover:scale-110 transition-all duration-500">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-black text-slate-700 group-hover:text-white transition-colors">
                    Generate Report
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomeScreen;
