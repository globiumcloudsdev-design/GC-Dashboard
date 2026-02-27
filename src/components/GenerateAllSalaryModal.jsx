"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Calendar as CalendarIcon,
  AlertCircle,
  CheckCircle,
  XCircle,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function GenerateAllSalaryModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1); // 1: Select Date, 2: Review Zero Sales, 3: Results
  const [loading, setLoading] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [zeroSalesAgents, setZeroSalesAgents] = useState([]);
  const [manualOverrides, setManualOverrides] = useState({});
  const [results, setResults] = useState(null);

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - 2 + i,
  );

  const handleInitialGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payroll/generate-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: selectedMonth,
          year: selectedYear,
          skipZeroSales: true, // First pass - skip zero sales agents
        }),
      });

      const data = await res.json();

      if (!data.success) {
        toast.error(data.message);
        return;
      }

      // Check if there are zero sales agents
      if (data.data.zeroSales && data.data.zeroSales.length > 0) {
        setZeroSalesAgents(data.data.zeroSales);
        setResults(data.data);
        setStep(2); // Move to review step
        toast.info(
          `${data.data.zeroSales.length} agent(s) have zero sales. Please provide values.`,
        );
      } else {
        // All done
        setResults(data.data);
        setStep(3);
        toast.success(data.message);
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error("Generate All Error:", error);
      toast.error("Failed to generate payrolls");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payroll/generate-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: selectedMonth,
          year: selectedYear,
          skipZeroSales: false, // Second pass - generate all including zero sales
          manualOverrides,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        toast.error(data.message);
        return;
      }

      setResults(data.data);
      setStep(3);
      toast.success(data.message);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Generate All Error:", error);
      toast.error("Failed to generate payrolls");
    } finally {
      setLoading(false);
    }
  };

  const handleOverrideChange = (agentId, value) => {
    // Handle zero and empty values properly
    if (value === "" || value === undefined || value === null) {
      setManualOverrides((prev) => {
        const updated = { ...prev };
        delete updated[agentId];
        return updated;
      });
    } else {
      const numValue = parseFloat(value);
      setManualOverrides((prev) => ({
        ...prev,
        [agentId]: isNaN(numValue) ? 0 : numValue,
      }));
    }
  };

  const handleClose = () => {
    setStep(1);
    setZeroSalesAgents([]);
    setManualOverrides({});
    setResults(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <CalendarIcon className="w-6 h-6" />
            Generate All Employees Salary
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Select Month/Year */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Select Month</Label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Select Year</Label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <AlertCircle className="w-4 h-4 inline mr-2" />
                This will generate salary for all active employees for{" "}
                <strong>
                  {months.find((m) => m.value === selectedMonth)?.label}{" "}
                  {selectedYear}
                </strong>
                .
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleInitialGenerate} disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Generate
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Handle Zero Sales Agents */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md space-y-2">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                <AlertCircle className="w-4 h-4 inline mr-2" />
                Zero Sales Employees - Salary based on Attendance & Allowance
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                You can add manual sales values to increase incentive, or leave
                empty/0 for attendance-based salary only.
              </p>
            </div>

            {/* Table Format */}
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-800 border-b sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">
                      Employee Name
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Target
                    </th>
                    <th className="px-4 py-3 text-center font-semibold">
                      Present
                    </th>
                    <th className="px-4 py-3 text-center font-semibold">
                      Lates
                    </th>
                    <th className="px-4 py-3 text-center font-semibold">
                      Absents
                    </th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Basic
                    </th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Allowance
                    </th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Net Salary
                    </th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Manual Override
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {zeroSalesAgents.map((agent, idx) => (
                    <tr
                      key={agent.agentId}
                      className={
                        idx % 2 === 0
                          ? "bg-white dark:bg-gray-900/50"
                          : "bg-gray-50 dark:bg-gray-800/50"
                      }
                    >
                      <td className="px-4 py-3 font-semibold">
                        <div>
                          <p>{agent.agentName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {agent.agentCode}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            agent.targetType === "digit"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {agent.targetType === "digit"
                            ? "Digit"
                            : agent.targetType === "amount"
                              ? "Revenue"
                              : "Both"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded text-xs font-semibold">
                          {agent.previewSalary?.presentDays || 0}/
                          {agent.previewSalary?.totalDaysInMonth || 30}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-2 py-1 rounded text-xs font-semibold">
                          {(agent.previewSalary?.uninformedLates || 0) +
                            (agent.previewSalary?.informedLates || 0)}
                          {agent.previewSalary?.latePenaltyCount > 0 &&
                            ` (${agent.previewSalary.latePenaltyCount}>20m)`}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-1 rounded text-xs font-semibold">
                          {(agent.previewSalary?.uninformedAbsents || 0) +
                            (agent.previewSalary?.informedAbsents || 0)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-800 dark:text-gray-200">
                        PKR{" "}
                        {(
                          agent.previewSalary?.basicSalary || 0
                        ).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={
                            agent.previewSalary?.allowanceCutReason
                              ? "line-through text-red-600 font-semibold"
                              : "font-semibold text-gray-800 dark:text-gray-200"
                          }
                        >
                          PKR{" "}
                          {(
                            agent.previewSalary?.earnedAllowance || 0
                          ).toLocaleString()}
                        </span>
                        {agent.previewSalary?.allowanceCutReason && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            ✗ {agent.previewSalary.allowanceCutReason}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="font-bold text-lg text-blue-700 dark:text-blue-300">
                          PKR{" "}
                          {Math.round(
                            agent.previewSalary?.netSalary || 0,
                          ).toLocaleString()}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          D:{" "}
                          {(
                            agent.previewSalary?.totalDeduction || 0
                          ).toLocaleString()}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <Input
                            type="number"
                            placeholder="0"
                            min="0"
                            value={
                              manualOverrides[agent.agentId] !== undefined
                                ? manualOverrides[agent.agentId]
                                : ""
                            }
                            onChange={(e) =>
                              handleOverrideChange(
                                agent.agentId,
                                e.target.value,
                              )
                            }
                            className="text-sm h-8 w-32"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {agent.targetType === "digit"
                              ? "Sales #"
                              : "Revenue"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleFinalGenerate}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {Object.keys(manualOverrides).length > 0
                  ? "Generate with Overrides"
                  : "Generate Salaries"}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {step === 3 && results && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md text-center">
                <CheckCircle className="w-8 h-8 mx-auto text-green-600 mb-2" />
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {results.generated?.length || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Generated
                </p>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md text-center">
                <XCircle className="w-8 h-8 mx-auto text-red-600 mb-2" />
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                  {results.failed?.length || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Failed
                </p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md text-center">
                <AlertCircle className="w-8 h-8 mx-auto text-yellow-600 mb-2" />
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                  {results.zeroSales?.length || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Zero Sales
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md text-center">
                <TrendingUp className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {results.alreadyGenerated?.length || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Already Generated
                </p>
              </div>
            </div>

            {/* Generated List */}
            {results.generated && results.generated.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Successfully Generated ({results.generated.length})
                </h3>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {results.generated.map((item) => (
                    <div
                      key={item.agentId}
                      className="flex justify-between items-center bg-green-50 dark:bg-green-900/20 p-2 rounded text-sm"
                    >
                      <span>
                        {item.agentName} ({item.agentCode})
                      </span>
                      <div className="flex gap-3 text-xs">
                        {item.salesCount > 0 && (
                          <span className="text-gray-600">
                            Sales: {item.salesCount}
                          </span>
                        )}
                        {item.revenue > 0 && (
                          <span className="text-gray-600">
                            Revenue: {item.revenue.toLocaleString()}
                          </span>
                        )}
                        <span className="font-semibold text-green-700 dark:text-green-300">
                          PKR {item.netSalary.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Failed List */}
            {results.failed && results.failed.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  Failed ({results.failed.length})
                </h3>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {results.failed.map((item) => (
                    <div
                      key={item.agentId}
                      className="flex justify-between items-center bg-red-50 dark:bg-red-900/20 p-2 rounded text-sm"
                    >
                      <span>
                        {item.agentName} ({item.agentCode})
                      </span>
                      <span className="text-xs text-red-600">{item.error}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={handleClose}>Close</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
