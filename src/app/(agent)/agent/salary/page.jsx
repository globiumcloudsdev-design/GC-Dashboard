//app/(agent)/agent/salary/page.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import {
  Calendar,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Wallet,
  Clock,
  UserCheck,
  Calculator,
  BarChart3,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useLoaderContext } from "@/context/LoaderContext";
import { agentPayrollService } from "@/services/agentPayrollService";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

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

const YEARS = [2024, 2025, 2026, 2027];

export default function AgentSalaryPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [payrolls, setPayrolls] = useState([]);
  const [currentPayroll, setCurrentPayroll] = useState(null);
  const [loading, setLoading] = useState(true);

  const { showLoader, hideLoader } = useLoaderContext();

  // Fetch History
  const fetchPayrolls = useCallback(async () => {
    try {
      setLoading(true);
      const res = await agentPayrollService.getMyPayrolls();
      if (res.success) {
        setPayrolls(res.data);
        const found = res.data.find(
          (p) => p.month === selectedMonth && p.year === selectedYear,
        );
        setCurrentPayroll(found || null);
      }
    } catch (err) {
      toast.error("Failed to fetch salary history");
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchPayrolls();
  }, [fetchPayrolls]);

  // Generate / Regenerate
  const handleGenerate = async () => {
    try {
      showLoader("generate-payroll", "Calculating salary...");
      const res = await agentPayrollService.generateMyPayroll(
        selectedMonth,
        selectedYear,
      );
      if (res.success) {
        toast.success("Salary generated successfully!");
        setCurrentPayroll(res.data);
        fetchPayrolls(); // Refresh list
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error(err.message || "Failed to generate salary");
    } finally {
      hideLoader("generate-payroll");
    }
  };

  // Status Badge
  const StatusBadge = ({ status }) => {
    const styles = {
      paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
      generated: "bg-blue-100 text-blue-700 border-blue-200",
      failed: "bg-rose-100 text-rose-700 border-rose-200",
      pending: "bg-amber-100 text-amber-700 border-amber-200",
    };
    return (
      <span
        className={cn(
          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap",
          styles[status] || "bg-slate-100 text-slate-700 border-slate-200",
        )}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      {/* --- PREMIUM HERO HEADER --- */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-6 pt-12 pb-24 mt-4 rounded-[40px] shadow-2xl shadow-indigo-950/20 mb-8 max-w-7xl mx-auto">
        {/* Decorative Elements */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]" />

        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1 px-3 rounded-full bg-indigo-500/10 backdrop-blur-md text-[9px] font-bold text-indigo-400 uppercase tracking-[0.3em] border border-indigo-500/20">
                Financial Hub
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
              Earnings{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-blue-200 to-cyan-200">
                Management
              </span>
            </h1>
            <p className="text-indigo-100/40 font-medium text-sm md:text-base max-w-md leading-relaxed">
              Comprehensive analysis of your performance metrics and historical
              salary dispatches.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-white/5 backdrop-blur-xl p-3 rounded-[32px] border border-white/10 shadow-2xl">
            <div className="flex items-center gap-2 px-2">
              <Select
                value={String(selectedMonth)}
                onValueChange={(v) => setSelectedMonth(parseInt(v))}
              >
                <SelectTrigger className="w-[140px] h-12 bg-transparent border-none text-white font-bold focus:ring-0">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <SelectValue placeholder="Month" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-white/10 bg-slate-900 text-white">
                  {MONTHS.map((m, i) => (
                    <SelectItem
                      key={i}
                      value={String(i + 1)}
                      className="focus:bg-indigo-600 focus:text-white rounded-lg"
                    >
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="w-px h-6 bg-white/10" />

              <Select
                value={String(selectedYear)}
                onValueChange={(v) => setSelectedYear(parseInt(v))}
              >
                <SelectTrigger className="w-[100px] h-12 bg-transparent border-none text-white font-bold focus:ring-0">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-white/10 bg-slate-900 text-white">
                  {YEARS.map((y) => (
                    <SelectItem
                      key={y}
                      value={String(y)}
                      className="focus:bg-indigo-600 focus:text-white rounded-lg"
                    >
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={currentPayroll?.status === "paid"}
              className="h-12 px-6 gap-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/20 group border-none"
            >
              {currentPayroll ? (
                <RefreshCw
                  className={cn("w-4 h-4", loading && "animate-spin")}
                />
              ) : (
                <Calculator className="w-4 h-4" />
              )}
              <span className="tracking-tight">
                {currentPayroll ? "Recalculate" : "Process Salary"}
              </span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 space-y-8">
        {/* 📊 SUMMARY ROW */}
        <AnimatePresence mode="wait">
          {currentPayroll ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6"
            >
              {/* Main Net Salary Card */}
              <div className="md:col-span-2 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-800 rounded-[40px] p-8 text-white shadow-2xl flex flex-col justify-between group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl transition-transform group-hover:scale-110" />

                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
                      <Wallet className="w-6 h-6 text-indigo-200" />
                    </div>
                    <div>
                      <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-[0.2em] leading-none">
                        Net Compensation
                      </p>
                      <h3 className="text-sm font-bold text-white mt-1">
                        Payable Amount
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-indigo-300 opacity-60 tracking-tight mr-1">
                      PKR
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">
                      {currentPayroll.netSalary.toLocaleString()}
                    </h2>
                  </div>
                </div>

                <div className="mt-12 flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        currentPayroll.status === "paid"
                          ? "bg-emerald-400"
                          : "bg-amber-400",
                      )}
                    />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      {currentPayroll.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 opacity-60">
                    <Calendar size={14} />
                    <span className="text-xs font-bold uppercase tracking-widest">
                      {MONTHS[currentPayroll.month - 1]} {currentPayroll.year}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="md:col-span-2 grid grid-cols-2 gap-6">
                <div className="bg-white rounded-[40px] p-6 shadow-xl shadow-slate-200/50 border border-slate-100/50 group transition-all hover:bg-emerald-50/30">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl w-fit mb-4 group-hover:rotate-6 transition-transform">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">
                    Attendance
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-800 tracking-tighter">
                      {currentPayroll.presentDays}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      /{currentPayroll.totalDaysInMonth}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-emerald-600 mt-2">
                    Active Days
                  </p>
                </div>

                <div className="bg-white rounded-[40px] p-6 shadow-xl shadow-slate-200/50 border border-slate-100/50 group transition-all hover:bg-rose-50/30">
                  <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl w-fit mb-4 group-hover:-rotate-6 transition-transform">
                    <TrendingDown className="w-6 h-6" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">
                    Deductions
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[10px] font-bold text-rose-400 opacity-60 mr-1">
                      PKR
                    </span>
                    <span className="text-3xl font-black text-rose-600 tracking-tighter">
                      {currentPayroll.totalDeduction.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-rose-500 mt-2">
                    Monthly Adjustments
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-[40px] border-2 border-dashed border-slate-100 p-16 flex flex-col items-center justify-center text-center shadow-sm"
            >
              <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 rotate-3 border border-slate-100">
                <Calculator className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                No Financial Record
              </h3>
              <p className="text-slate-500 font-medium max-w-sm mt-3 leading-relaxed">
                Detailed statement for{" "}
                <span className="text-indigo-600 font-bold">
                  {MONTHS[selectedMonth - 1]} {selectedYear}
                </span>{" "}
                is currently unavailable. Use the process button above to
                generate.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 📜 DETAILED BREAKDOWN ROW */}
        {currentPayroll && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Earnings Section */}
            <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-slate-200/50 border border-slate-100/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500 opacity-[0.03] rounded-bl-full" />
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-emerald-100/50 text-emerald-600 rounded-2xl">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 tracking-tight">
                    Gross Earnings
                  </h4>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    Revenue Sources
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center group/item transition-all hover:translate-x-1">
                  <span className="text-sm font-bold text-slate-500">
                    Base Salary
                  </span>
                  <span className="text-base font-black text-slate-800 tracking-tight">
                    ${currentPayroll.basicSalary.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center group/item transition-all hover:translate-x-1">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-500">
                      Attendance Perk
                    </span>
                    {currentPayroll.earnedAllowance === 0 &&
                      currentPayroll.attendanceAllowance > 0 && (
                        <span className="text-[10px] text-rose-500 font-bold mt-0.5">
                          {currentPayroll.notes}
                        </span>
                      )}
                  </div>
                  <span
                    className={cn(
                      "text-base font-black tracking-tight",
                      currentPayroll.earnedAllowance > 0
                        ? "text-emerald-600"
                        : "text-slate-300",
                    )}
                  >
                    +${currentPayroll.earnedAllowance.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center group/item transition-all hover:translate-x-1">
                  <span className="text-sm font-bold text-slate-500">
                    Sales Incentives
                  </span>
                  <span className="text-base font-black text-emerald-600 tracking-tight">
                    +${currentPayroll.earnedIncentive.toLocaleString()}
                  </span>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-between items-end">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Subtotal
                  </span>
                  <span className="text-2xl font-black text-slate-900 tracking-tighter">
                    ${currentPayroll.grossSalary.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Deductions Section */}
            <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-slate-200/50 border border-slate-100/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500 opacity-[0.03] rounded-bl-full" />
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-rose-100/50 text-rose-600 rounded-2xl">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 tracking-tight">
                    Adjustments
                  </h4>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    Penalties & Cuts
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-start group/item transition-all hover:translate-x-1">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-500">
                      Late Penalty
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-tighter">
                      {currentPayroll.latePenaltyCount} severe incidents
                    </span>
                  </div>
                  <span className="text-base font-black text-rose-600 tracking-tight">
                    -${currentPayroll.lateDeductionAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-start group/item transition-all hover:translate-x-1">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-500">
                      Absenteeism
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-tighter">
                      {currentPayroll.absentDays} days (
                      {currentPayroll.convertedAbsents} converted)
                    </span>
                  </div>
                  <span className="text-base font-black text-rose-600 tracking-tight">
                    -${currentPayroll.absentDeductionAmount.toLocaleString()}
                  </span>
                </div>
                <div className="h-6" />{" "}
                {/* Spacer to align visually with Earnings */}
                <div className="pt-6 border-t border-slate-100 flex justify-between items-end">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Total Cut
                  </span>
                  <span className="text-2xl font-black text-rose-600 tracking-tighter">
                    -${currentPayroll.totalDeduction.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Metrics/Stats Section */}
            <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-slate-200/50 border border-slate-100/50 group">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-100/50 text-blue-600 rounded-2xl">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 tracking-tight">
                    Efficiency Stats
                  </h4>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    Performance Data
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-slate-50 transition-colors hover:bg-white border border-transparent hover:border-slate-100 rounded-3xl flex flex-col items-center">
                  <span className="text-2xl font-black text-slate-800 tracking-tighter">
                    {currentPayroll.totalDaysInMonth}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Calendar Days
                  </span>
                </div>
                <div className="p-5 bg-emerald-50/50 transition-colors hover:bg-white border border-transparent hover:border-emerald-100 rounded-3xl flex flex-col items-center">
                  <span className="text-2xl font-black text-emerald-600 tracking-tighter">
                    {currentPayroll.presentDays}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Work Days
                  </span>
                </div>
                <div className="p-5 bg-amber-50/50 transition-colors hover:bg-white border border-transparent hover:border-amber-100 rounded-3xl flex flex-col items-center">
                  <span className="text-2xl font-black text-amber-600 tracking-tighter">
                    {currentPayroll.totalLates}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Punctuality
                  </span>
                </div>
                <div className="p-5 bg-rose-50/50 transition-colors hover:bg-white border border-transparent hover:border-rose-100 rounded-3xl flex flex-col items-center">
                  <span className="text-2xl font-black text-rose-600 tracking-tighter">
                    {currentPayroll.absentDays}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Absences
                  </span>
                </div>
              </div>

              <div className="mt-8 p-6 bg-slate-900 rounded-[32px] flex items-center justify-between shadow-xl shadow-slate-200 group-hover:bg-indigo-950 transition-colors">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-indigo-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-widest">
                    Rate Per Day
                  </span>
                </div>
                <span className="text-xl font-black text-white tracking-tighter">
                  PKR {Math.round(currentPayroll.perDaySalary).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 📅 HISTORY SECTION */}
        <div className="bg-white rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-100/50 p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-900 rounded-2xl text-white">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Statement History
                </h2>
                <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-[0.2em] mt-1">
                  Audit Trail
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                  <th className="px-6 py-4">Settlement Period</th>
                  <th className="px-6 py-4">Gross Comp</th>
                  <th className="px-6 py-4">Adjustments</th>
                  <th className="px-6 py-4">Payout</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {payrolls.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center">
                        <UserCheck className="w-12 h-12 text-slate-100 mb-4" />
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
                          No transaction history found
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  payrolls.map((payroll) => (
                    <tr
                      key={payroll._id}
                      className="group/row hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-[10px] tracking-tighter">
                            {payroll.year}
                          </div>
                          <span className="text-sm font-bold text-slate-800 tracking-tight">
                            {MONTHS[payroll.month - 1]}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-bold text-slate-600 tracking-tight">
                          PKR {payroll.grossSalary.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-bold text-rose-500 tracking-tight">
                          -PKR {payroll.totalDeduction.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-base font-black text-emerald-700 tracking-tight">
                          PKR {payroll.netSalary.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <StatusBadge status={payroll.status} />
                      </td>
                      <td className="px-6 py-5 text-right">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setSelectedMonth(payroll.month);
                            setSelectedYear(payroll.year);
                            setCurrentPayroll(payroll);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-full px-4"
                        >
                          Analyze Details
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
