//app/(agent)/agent/salary/page.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { 
  Calendar, CheckCircle, AlertCircle, RefreshCw, ChevronLeft, ChevronRight, 
  DollarSign, TrendingDown, TrendingUp, Wallet, Clock, UserCheck, Calculator 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useLoaderContext } from '@/context/LoaderContext';
import { agentPayrollService } from "@/services/agentPayrollService";

const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

const YEARS = [2024, 2025, 2026, 2027];

export default function AgentSalaryPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const [payrolls, setPayrolls] = useState([]);
  const [currentPayroll, setCurrentPayroll] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [viewDetail, setViewDetail] = useState(null); // ID of payroll to view in detailed modal
  
  const { showLoader, hideLoader } = useLoaderContext();

  // Fetch History
  const fetchPayrolls = useCallback(async () => {
    try {
      setLoading(true);
      const res = await agentPayrollService.getMyPayrolls();
      if (res.success) {
        setPayrolls(res.data);
        // Find if selected month/year already generated
        const found = res.data.find(p => p.month === selectedMonth && p.year === selectedYear);
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
      const res = await agentPayrollService.generateMyPayroll(selectedMonth, selectedYear);
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
      paid: "bg-green-100 text-green-700",
      generated: "bg-blue-100 text-blue-700",
      failed: "bg-red-100 text-red-700",
      pending: "bg-yellow-100 text-yellow-700"
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || "bg-gray-100 text-gray-700"}`}>
        {status?.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 mt-16">
      
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Salary Management</h1>
          <p className="text-muted-foreground mt-1">View, generate, and manage your monthly payrolls.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm border">
          <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
            <SelectTrigger className="w-[140px]">
               <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m, i) => (
                <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(parseInt(v))}>
            <SelectTrigger className="w-[100px]">
               <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
             onClick={handleGenerate}
             disabled={currentPayroll?.status === 'paid'}
             className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {currentPayroll ? <RefreshCw className="w-4 h-4" /> : <Calculator className="w-4 h-4" />}
            {currentPayroll ? "Regenerate" : "Generate Salary"}
          </Button>
        </div>
      </div>

      {/* 📊 CURRENT MONTH SUMMARY CARD (If Generated) */}
      {currentPayroll ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
           {/* Net Salary */}
           <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0 shadow-lg col-span-1 md:col-span-2">
             <CardContent className="p-6 flex flex-col justify-between h-full">
               <div>
                 <p className="text-indigo-100 font-medium flex items-center gap-2">
                   <Wallet className="w-4 h-4" /> Net Salary
                   </p>
                 <h2 className="text-4xl font-bold mt-2">${currentPayroll.netSalary.toLocaleString()}</h2>
               </div>
               <div className="mt-4 flex items-center justify-between text-indigo-100 text-sm">
                  <span>Status: {currentPayroll.status.toUpperCase()}</span>
                  <span>{MONTHS[currentPayroll.month - 1]} {currentPayroll.year}</span>
               </div>
             </CardContent>
           </Card>

            {/* Attendance Stats */}
           <Card>
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium text-muted-foreground">Attendance</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="flex justify-between items-center">
                 <div className="text-2xl font-bold text-slate-800">{currentPayroll.presentDays} <span className="text-xs font-normal text-muted-foreground">Days</span></div>
                 <CheckCircle className="w-5 h-5 text-green-500" />
               </div>
               <p className="text-xs text-muted-foreground mt-1">Total Present Days</p>
             </CardContent>
           </Card>

            {/* Deductions */}
           <Card>
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium text-muted-foreground">Total Deductions</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="flex justify-between items-center">
                 <div className="text-2xl font-bold text-red-600">-${currentPayroll.totalDeduction.toLocaleString()}</div>
                 <TrendingDown className="w-5 h-5 text-red-500" />
               </div>
               <p className="text-xs text-muted-foreground mt-1">Absents & Late Penalties</p>
             </CardContent>
           </Card>
        </div>
      ) : (
        <Card className="bg-slate-50 border-dashed border-2 p-10 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
             <Calculator className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700">No Salary Slip Generated</h3>
          <p className="text-muted-foreground max-w-sm mt-2">
            Details for {MONTHS[selectedMonth - 1]} {selectedYear} are not available yet. Click "Generate Salary" to calculate.
          </p>
        </Card>
      )}

      {/* 📜 PAYROLL DETAILED BREAKDOWN (If Generated) */}
      {currentPayroll && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* LEFT: EARNINGS */}
             <Card className="col-span-1 border-t-4 border-t-green-500">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-600" /> Earnings
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="flex justify-between items-center border-b pb-2">
                       <span className="text-slate-600">Basic Salary</span>
                       <span className="font-semibold">${currentPayroll.basicSalary.toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between items-center border-b pb-2">
                       <div className="flex flex-col">
                           <span className="text-slate-600">Attendance Allowance</span>
                           {currentPayroll.earnedAllowance === 0 && currentPayroll.attendanceAllowance > 0 && (
                               <span className="text-xs text-red-500">Cut: {currentPayroll.notes}</span>
                           )}
                       </div>
                       <span className={`font-semibold ${currentPayroll.earnedAllowance > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                           +${currentPayroll.earnedAllowance.toLocaleString()}
                       </span>
                   </div>
                   <div className="flex justify-between items-center border-b pb-2">
                       <span className="text-slate-600">Sales Incentive</span>
                       <span className="font-semibold text-green-600">+${currentPayroll.earnedIncentive.toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between items-center pt-2">
                       <span className="font-bold text-lg">Gross Earnings</span>
                       <span className="font-bold text-lg text-slate-900">${currentPayroll.grossSalary.toLocaleString()}</span>
                   </div>
                </CardContent>
             </Card>
             
             {/* MIDDLE: DEDUCTIONS */}
             <Card className="col-span-1 border-t-4 border-t-red-500">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingDown className="w-5 h-5 text-red-600" /> Deductions
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="flex justify-between items-center border-b pb-2">
                       <div className="flex flex-col">
                         <span className="text-slate-600">Late Penalty (1.16%)</span>
                         <span className="text-xs text-muted-foreground">{currentPayroll.latePenaltyCount} severe lates</span>
                       </div>
                       <span className="font-semibold text-red-600">-${currentPayroll.lateDeductionAmount.toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between items-center border-b pb-2">
                       <div className="flex flex-col">
                         <span className="text-slate-600">Absent Deduction</span>
                         <span className="text-xs text-muted-foreground">{currentPayroll.absentDays} days + {currentPayroll.convertedAbsents} converted</span>
                       </div>
                       <span className="font-semibold text-red-600">-${currentPayroll.absentDeductionAmount.toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between items-center pt-2">
                       <span className="font-bold text-lg">Total Deductions</span>
                       <span className="font-bold text-lg text-red-600">-${currentPayroll.totalDeduction.toLocaleString()}</span>
                   </div>
                </CardContent>
             </Card>

             {/* RIGHT: ATTENDANCE STATS */}
             <Card className="col-span-1 border-t-4 border-t-blue-500">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-600" /> Stats
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-lg text-center">
                        <div className="text-2xl font-bold text-slate-700">{currentPayroll.totalDaysInMonth}</div>
                        <div className="text-xs text-muted-foreground">Days in Month</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">{currentPayroll.presentDays}</div>
                        <div className="text-xs text-muted-foreground">Present</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg text-center">
                        <div className="text-2xl font-bold text-yellow-600">{currentPayroll.totalLates}</div>
                        <div className="text-xs text-muted-foreground">Total Lates</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg text-center">
                        <div className="text-2xl font-bold text-red-600">{currentPayroll.absentDays}</div>
                        <div className="text-xs text-muted-foreground">Actual Absents</div>
                    </div>
                    <div className="col-span-2 bg-blue-50 p-3 rounded-lg flex justify-between items-center">
                         <span className="text-sm text-blue-800">Per Day Salary</span>
                         <span className="font-bold text-blue-900">${Math.round(currentPayroll.perDaySalary)}</span>
                    </div>
                </CardContent>
             </Card>
          </div>
      )}

      {/* 📅 HISTORY TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>Past salary slips generated.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase font-medium">
                <tr>
                  <th className="px-4 py-3">Month</th>
                  <th className="px-4 py-3">Gross</th>
                  <th className="px-4 py-3">Deductions</th>
                  <th className="px-4 py-3">Net Salary</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {payrolls.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-muted-foreground">No history found.</td>
                  </tr>
                ) : (
                  payrolls.map((payroll) => (
                    <tr key={payroll._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">
                        {MONTHS[payroll.month - 1]}, {payroll.year}
                      </td>
                      <td className="px-4 py-3">${payroll.grossSalary.toLocaleString()}</td>
                      <td className="px-4 py-3 text-red-600">-${payroll.totalDeduction.toLocaleString()}</td>
                      <td className="px-4 py-3 font-bold text-emerald-700">${payroll.netSalary.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={payroll.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                             setSelectedMonth(payroll.month);
                             setSelectedYear(payroll.year);
                             setCurrentPayroll(payroll);
                             window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
