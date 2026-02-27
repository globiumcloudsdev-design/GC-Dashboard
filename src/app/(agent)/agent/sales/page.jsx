// //src/app/(agent)/agent/sales/page.jsx
"use client";

import React, { useContext, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Target,
  Users,
  DollarSign,
  RefreshCw,
  Calendar,
  BarChart3,
  Sparkles,
  ArrowUpRight,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { ThemeContext } from "@/context/ThemeContext";
import { useAgent } from "@/context/AgentContext";
import { agentSalesService } from "@/services/agentSalesService";
import SalesOverview from "@/components/sales/SalesOverview";
import PromoCodesList from "@/components/sales/PromoCodesList";
import RecentBookings from "@/components/sales/RecentBookings";
import PerformanceMetrics from "@/components/sales/PerformanceMetrics";
import TimeRangeSelector from "@/components/sales/TimeRangeSelector";
import MonthlyTargetProgress from "@/components/sales/MonthlyTargetProgress";
import MonthSelector from "@/components/sales/MonthSelector";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const SalesScreen = () => {
  const { theme } = useContext(ThemeContext);
  const { agent, isLoggedIn, isLoading: agentLoading } = useAgent();

  console.log("SalesScreen - agent from AgentContext:", agent);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState("month");
  const [selectedMonth, setSelectedMonth] = useState("");

  const [salesOverview, setSalesOverview] = useState(null);
  const [promoCodes, setPromoCodes] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [bookingStats, setBookingStats] = useState(null);

  // State for target progress
  const [targetProgress, setTargetProgress] = useState({
    achievedDigits: 0,
    achievedAmount: 0,
    digitTarget: 0,
    amountTarget: 0,
    targetType: "none",
    currency: "PKR",
  });

  // Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, delay: custom * 0.1, ease: "easeOut" },
    }),
  };

  // Get current month on mount
  useEffect(() => {
    const currentDate = new Date();
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
    const currentMonth = `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    setSelectedMonth(currentMonth);
  }, []);

  // Calculate date range - FIXED VERSION
  const getDateRange = useCallback((range, month = null) => {
    const now = new Date();
    let start, end;

    // Agar specific month select kiya gaya hai to usi month ka data show karein
    if (month) {
      const [monthName, year] = month.split(" ");
      const monthIndex = [
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
      ].indexOf(monthName);

      if (monthIndex !== -1) {
        // Specific month ke start aur end dates
        start = new Date(year, monthIndex, 1);
        end = new Date(year, monthIndex + 1, 0, 23, 59, 59);

        return {
          startDate: start.toISOString().split("T")[0],
          endDate: end.toISOString().split("T")[0],
          month: month,
          monthName: monthName,
          year: parseInt(year),
          monthIndex: monthIndex,
        };
      }
    }

    // Agar koi specific month nahi hai, to timeRange ke basis par calculate karein
    switch (range) {
      case "day":
        start = new Date(now);
        start.setDate(now.getDate() - 1);
        break;
      case "week":
        start = new Date(now);
        start.setDate(now.getDate() - 7);
        break;
      case "month":
        start = new Date(now);
        start.setMonth(now.getMonth() - 1);
        break;
      case "year":
        start = new Date(now);
        start.setFullYear(now.getFullYear() - 1);
        break;
      default:
        start = new Date(now);
        start.setMonth(now.getMonth() - 1);
    }

    end = new Date(now);

    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
      month: month || `${months[now.getMonth()]} ${now.getFullYear()}`,
      isSpecificMonth: false,
    };
  }, []);

  // Helper function to calculate month dates
  const getMonthDates = (monthString) => {
    if (!monthString) {
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
      monthString = `${months[now.getMonth()]} ${now.getFullYear()}`;
    }

    const [monthName, year] = monthString.split(" ");
    const monthIndex = [
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
    ].indexOf(monthName);

    if (monthIndex === -1) {
      const now = new Date();
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
      };
    }

    return {
      start: new Date(year, monthIndex, 1),
      end: new Date(year, monthIndex + 1, 0, 23, 59, 59),
    };
  };

  // Fetch sales data - FIXED VERSION
  const fetchSalesData = useCallback(
    async (isRefreshing = false) => {
      if (!isLoggedIn || agentLoading) {
        console.log("⚠️ Agent not logged in or still loading");
        setSalesOverview(null);
        setPromoCodes([]);
        setRecentBookings([]);
        setPerformanceMetrics(null);
        setBookingStats(null);
        setTargetProgress({
          achievedDigits: 0,
          achievedAmount: 0,
          digitTarget: 0,
          amountTarget: 0,
          targetType: "none",
          currency: "PKR",
        });
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Check if agent exists
      if (!agent) {
        console.log("❌ Agent not found in context");
        toast.error("Agent information not found. Please login again.");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const agentId = agent.id || agent._id;
      if (!agentId) {
        console.log("❌ No agent ID found");
        toast.error("Invalid agent information");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      console.log("🔄 Starting sales data fetch for agent:", agentId, {
        selectedMonth,
        agentTargetType: agent.monthlyTargetType,
      });

      try {
        if (!isRefreshing) setLoading(true);

        const dateParams = getDateRange(timeRange, selectedMonth);
        console.log("📅 Date range params:", dateParams);

        // Get month dates for selected month (FOR TARGET CALCULATION)
        const selectedMonthDates = getMonthDates(selectedMonth);
        console.log("📆 Selected month dates:", {
          start: selectedMonthDates.start.toLocaleDateString(),
          end: selectedMonthDates.end.toLocaleDateString(),
        });

        // Get all bookings for target calculations
        const allBookingsResponse = await agentSalesService.getAgentBookings(
          agentId,
          {
            limit: 1000,
          },
        );

        // Extract bookings data from response
        let allBookings = [];
        if (
          allBookingsResponse?.data?.bookings &&
          Array.isArray(allBookingsResponse.data.bookings)
        ) {
          allBookings = allBookingsResponse.data.bookings;
        } else if (
          allBookingsResponse?.bookings &&
          Array.isArray(allBookingsResponse.bookings)
        ) {
          allBookings = allBookingsResponse.bookings;
        }

        console.log(`📦 Total bookings fetched: ${allBookings.length}`);

        // Filter SELECTED month's bookings
        const selectedMonthBookings = allBookings.filter((booking) => {
          if (!booking.createdAt) return false;
          const bookingDate = new Date(booking.createdAt);
          return (
            bookingDate >= selectedMonthDates.start &&
            bookingDate <= selectedMonthDates.end
          );
        });

        console.log(
          `📅 Selected month (${selectedMonth}) bookings: ${selectedMonthBookings.length}`,
        );

        // Filter selected month's completed bookings
        const selectedMonthCompletedBookings = selectedMonthBookings.filter(
          (booking) => {
            const status = (booking.status || "").toString().toLowerCase();
            return (
              status === "completed" ||
              status === "approved" ||
              status === "success" ||
              status === "confirmed"
            );
          },
        );

        console.log(
          `✅ Selected month completed bookings: ${selectedMonthCompletedBookings.length}`,
        );

        // Also fetch projects for the selected month to include in amount targets
        let projectData = [];
        try {
          // Fetch ALL projects for this agent (not filtered by date)
          // We'll filter by completion status instead
          console.log(`🔍 Fetching ALL projects for agent: ${agentId}`);
          const projectsRes = await fetch(
            `/api/projects?assignedAgent=${agentId}&limit=1000`,
          );
          const projectsJson = await projectsRes.json();
          console.log(`📦 Projects API response:`, projectsJson);
          if (projectsJson && projectsJson.success) {
            projectData = projectsJson.data || [];
          } else if (projectsJson && Array.isArray(projectsJson)) {
            projectData = projectsJson;
          }

          // Now filter by selected month based on updatedAt or completedAt
          projectData = projectData.filter((p) => {
            // Use completedAt if available, otherwise updatedAt
            const relevantDate = p.completedAt
              ? new Date(p.completedAt)
              : new Date(p.updatedAt);
            const isInSelectedMonth =
              relevantDate >= selectedMonthDates.start &&
              relevantDate <= selectedMonthDates.end;
            return isInSelectedMonth;
          });

          console.log(
            `📦 Projects in selected month (${selectedMonth}): ${projectData.length} projects`,
          );
        } catch (projErr) {
          console.error(
            "❌ Failed to fetch projects for agent target calculations",
            projErr,
          );
        }

        console.log(`📦 Projects fetched for month: ${projectData.length}`);

        // Calculate achieved values based on agent's target type
        let achievedDigits = 0;
        let achievedAmount = 0;

        // Get agent's target information
        const agentTargetType = agent.monthlyTargetType || "none";
        const digitTarget = agent.monthlyDigitTarget || 0;
        const amountTarget = agent.monthlyAmountTarget || 0;
        const currency = agent.targetCurrency || "PKR";

        console.log("🎯 Agent target info:", {
          type: agentTargetType,
          digitTarget,
          amountTarget,
          currency,
        });

        if (agentTargetType === "digit" || agentTargetType === "both") {
          achievedDigits = selectedMonthCompletedBookings.length;
        }

        if (agentTargetType === "amount") {
          // For 'amount' target: sum amounts from completed projects only
          const completedProjects = Array.isArray(projectData)
            ? projectData.filter((p) => {
                const status = (p.status || "").toString().toLowerCase();
                return status === "completed" || status === "delivered";
              })
            : [];

          achievedAmount = completedProjects.reduce((sum, p) => {
            const amt = parseFloat(p.price) || parseFloat(p.amount) || 0;
            return sum + (isNaN(amt) ? 0 : amt);
          }, 0);

          console.log("💰 Achieved amount (projects only):", achievedAmount);
        } else if (agentTargetType === "both") {
          // For 'both' target: digits from bookings, revenue from projects ONLY
          const completedProjects = Array.isArray(projectData)
            ? projectData.filter((p) => {
                const status = (p.status || "").toString().toLowerCase();
                return status === "completed" || status === "delivered";
              })
            : [];

          achievedAmount = completedProjects.reduce((sum, p) => {
            const amt = parseFloat(p.price) || parseFloat(p.amount) || 0;
            return sum + (isNaN(amt) ? 0 : amt);
          }, 0);

          console.log(
            "💰 Both target - Digits from bookings, Revenue from projects:",
            {
              achievedDigits,
              achievedAmount,
              totalProjects: projectData.length,
              completedProjects: completedProjects.length,
              completedProjectDetails: completedProjects.map((p) => ({
                title: p.title,
                price: p.price,
                status: p.status,
              })),
            },
          );
        }

        console.log("📊 Achieved values for selected month:", {
          selectedMonth,
          achievedDigits,
          achievedAmount,
          digitTarget,
          amountTarget,
        });

        // Update target progress state
        setTargetProgress({
          achievedDigits,
          achievedAmount,
          digitTarget,
          amountTarget,
          targetType: agentTargetType,
          currency,
        });

        // Now fetch other data in parallel
        const [
          overviewResponse,
          conversionResponse,
          recentBookingsResponse,
          statsResponse,
        ] = await Promise.allSettled([
          agentSalesService.getAgentSalesOverview(agentId, dateParams),
          agentSalesService.getAgentConversionRates(agentId, dateParams),
          agentSalesService.getAgentBookings(agentId, {
            ...dateParams,
            limit: 10,
            sort: "-createdAt",
          }),
          agentSalesService.getAgentBookingStats(agentId, dateParams),
        ]);

        console.log("📋 API Responses received");

        // Process overview response
        if (
          overviewResponse.status === "fulfilled" &&
          overviewResponse.value?.data
        ) {
          setSalesOverview(overviewResponse.value.data);

          // Extract promo codes from overview
          const promoCodesFromResponse =
            overviewResponse.value.data.promoCodeAnalytics ||
            overviewResponse.value.data.promoCodeData ||
            overviewResponse.value.data.promo_codes ||
            [];
          setPromoCodes(promoCodesFromResponse);

          console.log("📈 Overview data set");
        } else {
          console.warn("❌ Overview API failed or returned no data");
          setSalesOverview(null);
          setPromoCodes([]);
        }

        // Process conversion response
        if (
          conversionResponse.status === "fulfilled" &&
          conversionResponse.value?.data
        ) {
          setPerformanceMetrics(conversionResponse.value.data);
          console.log("📊 Performance metrics set");
        } else {
          console.warn("❌ Conversion API failed or returned no data");
          setPerformanceMetrics(null);
        }

        // Process recent bookings response and also include recent projects
        if (recentBookingsResponse.status === "fulfilled") {
          const recentData =
            recentBookingsResponse.value?.data?.bookings ||
            recentBookingsResponse.value?.bookings ||
            [];

          // Fetch recent projects for the same date range and merge
          let recentProjects = [];
          try {
            // Fetch ALL projects for agent, then filter by date on frontend
            console.log(
              `🔍 Fetching ALL projects for recent sales, agent: ${agentId}`,
            );
            const projectsRes = await fetch(
              `/api/projects?assignedAgent=${agentId}&limit=1000`,
            );
            const projectsJson = await projectsRes.json();
            console.log(`📦 Recent projects API response:`, projectsJson);

            if (projectsJson && projectsJson.success) {
              recentProjects = projectsJson.data || [];
            } else if (Array.isArray(projectsJson)) {
              recentProjects = projectsJson;
            }

            // Filter by date range using updatedAt or completedAt
            const startDate = new Date(dateParams.startDate);
            const endDate = new Date(dateParams.endDate);
            recentProjects = recentProjects.filter((p) => {
              const relevantDate = p.completedAt
                ? new Date(p.completedAt)
                : new Date(p.updatedAt);
              return relevantDate >= startDate && relevantDate <= endDate;
            });

            console.log(
              `📦 Recent projects filtered: ${recentProjects.length} projects`,
            );
          } catch (projErr) {
            console.error("❌ Failed to fetch recent projects", projErr);
          }

          // Normalize projects to booking-like objects for RecentBookings component
          const mappedProjects = (recentProjects || []).map((p) => ({
            ...p,
            _id: p._id || p.id,
            createdAt:
              p.createdAt ||
              p.updatedAt ||
              p.completedAt ||
              new Date().toISOString(),
            formData: { firstName: p.title || "Project" },
            amount: p.price || p.amount || 0,
            type: "project",
          }));

          const combinedRecent = [
            ...recentData.map((r) => ({ ...r, type: r.type || "booking" })),
            ...mappedProjects,
          ]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10);

          setRecentBookings(combinedRecent);
          console.log(
            "📦 Recent bookings (including projects) set:",
            combinedRecent.length,
          );
        } else {
          console.warn("❌ Recent bookings API failed");
          setRecentBookings([]);
        }

        // Process stats response and merge project stats
        if (statsResponse.status === "fulfilled" && statsResponse.value?.data) {
          const statsData = statsResponse.value.data;
          const overview = statsData.overview || {};

          // Combine project counts/amounts into overview
          const projectsCount = Array.isArray(projectData)
            ? projectData.length
            : 0;
          const completedProjectsList = Array.isArray(projectData)
            ? projectData.filter((p) => {
                const s = (p.status || "").toString().toLowerCase();
                return s === "completed" || s === "delivered";
              })
            : [];
          const cancelledProjectsCount = Array.isArray(projectData)
            ? projectData.filter(
                (p) =>
                  (p.status || "").toString().toLowerCase() === "cancelled",
              ).length
            : 0;
          const pendingProjectsCount = Array.isArray(projectData)
            ? projectData.filter((p) => {
                const s = (p.status || "").toString().toLowerCase();
                return (
                  s === "pending" || s === "in progress" || s === "on hold"
                );
              }).length
            : 0;

          const projectsAmount = completedProjectsList.reduce((sum, p) => {
            const amt = parseFloat(p.price) || parseFloat(p.amount) || 0;
            return sum + (isNaN(amt) ? 0 : amt);
          }, 0);

          const mergedOverview = {
            ...overview,
            totalBookings: (overview.totalBookings || 0) + projectsCount,
            completedBookings:
              (overview.completedBookings || 0) + completedProjectsList.length,
            pendingBookings:
              (overview.pendingBookings || 0) + pendingProjectsCount,
            cancelledBookings:
              (overview.cancelledBookings || 0) + cancelledProjectsCount,
            totalRevenue: (overview.totalRevenue || 0) + projectsAmount,
          };

          setBookingStats({ ...statsData, overview: mergedOverview });
          console.log("📋 Booking stats set (merged with projects)");
        } else {
          console.warn("❌ Stats API failed or returned no data");
          setBookingStats(null);
        }

        // Show success message if refreshing
        if (isRefreshing) {
          toast.success("Sales data refreshed successfully!");
        }
      } catch (error) {
        console.error("💥 Error fetching sales data:", error);

        // Show specific error messages
        let errorMessage = "Failed to load sales data. Please try again.";

        if (error.response) {
          errorMessage =
            error.response.data?.message ||
            error.response.data?.error ||
            `Server error: ${error.response.status}`;
        } else if (error.request) {
          errorMessage = "Network error. Please check your connection.";
        } else {
          errorMessage = error.message || "Request setup failed.";
        }

        toast.error(errorMessage);
      } finally {
        setLoading(false);
        setRefreshing(false);
        console.log("🏁 Fetch process completed");
      }
    },
    [
      agent,
      isLoggedIn,
      agentLoading,
      timeRange,
      selectedMonth,
      getDateRange,
      toast,
    ],
  );

  // Fetch data when component mounts or when selectedMonth changes
  useEffect(() => {
    if (isLoggedIn && !agentLoading && selectedMonth) {
      console.log(
        "🔄 Triggering fetch due to selectedMonth change:",
        selectedMonth,
      );
      fetchSalesData();
    }
  }, [fetchSalesData, isLoggedIn, agentLoading, selectedMonth]);

  // Show loading while agent context is loading
  if (agentLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading sales data...</p>
        </div>
      </div>
    );
  }

  // Redirect if not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-lg p-6 shadow-sm max-w-sm">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            Access Required
          </h3>
          <p className="text-gray-600 text-sm">
            Please login to view sales data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10">
      {/* --- PREMIUM HERO HEADER --- */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 px-6 pt-12 pb-20 mt-4 rounded-[40px] shadow-2xl shadow-indigo-950/20 mb-8 max-w-7xl mx-auto">
        {/* Decorative Elements */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[100px]" />

        <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-1 px-3 rounded-full bg-blue-500/10 backdrop-blur-md text-[9px] font-bold text-blue-400 uppercase tracking-[0.3em] border border-blue-500/20">
                Performance Analytics
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
              Sales{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-200 to-cyan-200">
                Dashboard
              </span>
            </h1>
            <p className="text-blue-100/40 font-medium text-sm md:text-base max-w-md leading-relaxed">
              Real-time synchronization of lead metrics and conversion tracking
              powered by industrial analytics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => fetchSalesData(true)}
              disabled={refreshing}
              className="h-14 px-8 rounded-2xl bg-white text-slate-900 font-bold hover:bg-blue-50 transition-all shadow-2xl shadow-blue-500/20 border-none group"
            >
              <RefreshCw
                className={cn(
                  "mr-2 h-4 w-4 text-blue-600",
                  refreshing && "animate-spin",
                )}
              />
              <span className="tracking-tight">
                {refreshing ? "Updating..." : "Refresh Data"}
              </span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 space-y-6">
        {/* Monthly Progress, Month Selector & Performance Metrics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Progress (Left Column) */}
          <div className="lg:col-span-2">
            <MonthlyTargetProgress
              theme={theme}
              currentMonth={selectedMonth}
              achievedDigits={targetProgress.achievedDigits}
              achievedAmount={targetProgress.achievedAmount}
              digitTarget={targetProgress.digitTarget}
              amountTarget={targetProgress.amountTarget}
              targetType={targetProgress.targetType}
              currency={targetProgress.currency}
            />
          </div>

          {/* Right Column (Month Selector & Performance) */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <PerformanceMetrics
              data={bookingStats?.overview || {}}
              theme={theme}
            />
            <MonthSelector
              currentMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              theme={theme}
            />
          </div>
        </div>

        {/* Sales Overview */}
        <AnimatePresence>
          {salesOverview && (
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <SalesOverview
                data={salesOverview}
                theme={theme}
                timeRange={timeRange}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Booking Stats */}
        <AnimatePresence>
          {bookingStats && (
            <div className="bg-white rounded-[40px] shadow-xl shadow-slate-200/50 border-none p-6 md:p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 opacity-[0.03] rounded-bl-full group-hover:scale-110 transition-transform" />

              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-200">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                    Sales Statistics
                  </h2>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-0.5">
                    Live Booking Performance Metrics
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    label: "Total Sales",
                    value: bookingStats.overview?.totalBookings || 0,
                    icon: TrendingUp,
                    grad: "from-blue-600 to-indigo-700",
                  },
                  {
                    label: "Completed",
                    value: bookingStats.overview?.completedBookings || 0,
                    icon: CheckCircle,
                    grad: "from-emerald-500 to-teal-600",
                  },
                  {
                    label: "Pending",
                    value: bookingStats.overview?.pendingBookings || 0,
                    icon: Clock,
                    grad: "from-amber-500 to-orange-600",
                  },
                  {
                    label: "Cancelled",
                    value: bookingStats.overview?.cancelledBookings || 0,
                    icon: XCircle,
                    grad: "from-rose-500 to-red-600",
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative p-5 rounded-[40px] bg-slate-50/50 border border-slate-100/50 group/item hover:bg-white hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={cn(
                          "p-2 rounded-xl text-white shadow-md",
                          "bg-gradient-to-br " + item.grad,
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-slate-900 tracking-tight">
                        {item.value}
                      </p>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">
                        {item.label}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Promo Codes & Recent Bookings Grid */}
        <div
          className={`grid gap-6 ${!(targetProgress.targetType === "digit" || targetProgress.targetType === "both") ? "grid-cols-1 xl:grid-cols-2" : "grid-cols-1"}`}
        >
          {/* Promo Codes (hidden when target is 'digit' or 'both') */}
          {!(
            targetProgress.targetType === "digit" ||
            targetProgress.targetType === "both"
          ) && (
            <div>
              <PromoCodesList promoCodes={promoCodes} theme={theme} />
            </div>
          )}

          {/* Recent Bookings */}
          <div>
            <RecentBookings
              bookings={recentBookings}
              theme={theme}
              agent={agent}
            />
          </div>
        </div>

        {/* Empty State */}
        <AnimatePresence>
          {!salesOverview &&
            promoCodes.length === 0 &&
            recentBookings.length === 0 && (
              <div className="text-center py-20 bg-white rounded-[40px] shadow-xl shadow-slate-200/50 border-2 border-dashed border-slate-100 max-w-lg mx-auto">
                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="h-10 w-10 text-slate-200" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">
                  No Sales Data
                </h3>
                <p className="text-slate-500 font-medium text-sm mb-8 max-w-xs mx-auto">
                  We couldn't find any sales records for the selected period.
                </p>
                <Button
                  onClick={() => fetchSalesData(true)}
                  className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all"
                >
                  Force Sync Now
                </Button>
              </div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SalesScreen;
