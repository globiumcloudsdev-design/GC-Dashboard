"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Printer } from "lucide-react";
import CustomModal from "@/components/ui/customModal";
import { formatToPakistaniDate, formatToPakistaniTime } from "@/utils/TimeFuntions";

const PayrollPreviewModal = ({
  isOpen,
  onClose,
  data,
  month,
  salesCount,
  onSalesCountChange,
  onApplySalesCount,
  informedOverrides,
  onInformedOverrideChange,
  loading,
  onGenerate
}) => {
  if (!data) return null;
  const { processedRecords, financials, stats, agent } = data;

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Salary Calculation: ${agent?.agentName}`}
      description={`Preview for ${month}`}
      size="2xl" // Wider modal
    >
      <div className="space-y-6">
        {/* Financial Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
           <div>
               <div className="text-xs text-gray-500 uppercase">Basic Salary</div>
               <div className="text-lg font-bold">PKR {financials.basicSalary?.toLocaleString()}</div>
           </div>
           <div>
               <div className="text-xs text-gray-500 uppercase">Allowance</div>
               <div className="text-lg font-bold text-green-700">PKR {financials.earnedAllowance?.toLocaleString()}</div>
               {financials.earnedAllowance === 0 && <span className="text-xs text-red-500 block">{financials.allowanceCutReason}</span>}
           </div>
           <div>
               <div className="text-xs text-gray-500 uppercase">Deductions</div>
               <div className="text-lg font-bold text-red-600">- PKR {financials.totalDeduction?.toLocaleString()}</div>
               <span className="text-xs text-gray-500 block">(Late: {financials.lateDeductionAmount} + Absent: {financials.absentDeductionAmount})</span>
           </div>
           <div className="bg-white p-2 rounded shadow-sm border border-blue-200">
               <div className="text-xs text-blue-800 uppercase font-bold">Net Salary</div>
               <div className="text-xl font-bold text-blue-700">PKR {financials.netSalary?.toLocaleString()}</div>
           </div>
        </div>
        
         {/* Incentive Input */}
        <div className="flex items-center gap-4 bg-yellow-50 p-3 rounded border border-yellow-200">
            <div className="flex-1">
                <Label className="text-xs font-bold text-yellow-800 uppercase">Total Sales Count</Label>
                <p className="text-xs text-gray-600">Enter total approved sales count for incentive calculation.</p>
            </div>
            <div className="flex items-center gap-2">
                <Input 
                    type="number" 
                    min="0"
                    value={salesCount} 
                    onChange={(e) => onSalesCountChange(Number(e.target.value))}
                    className="w-24 h-9 bg-white"
                />
                <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={onApplySalesCount}
                    className="h-9"
                >
                    Apply
                </Button>
            </div>
            <div className="text-right">
                <div className="text-xs text-gray-500 uppercase">Earned Incentive</div>
                <div className="text-lg font-bold text-green-600">PKR {financials.earnedIncentive?.toLocaleString() || 0}</div>
            </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
           <div className="bg-gray-100 p-2 rounded">
              <span className="block text-xs font-semibold">Late (&gt;20m Penalty)</span>
              {stats.latePenaltyCount}
           </div>
           <div className="bg-gray-100 p-2 rounded">
              <span className="block text-xs font-semibold">Allow. Cut Lates</span>
              {stats.informedLates} / 5
           </div>
           <div className="bg-gray-100 p-2 rounded">
              <span className="block text-xs font-semibold">Allow. Cut Absents</span>
              {stats.informedAbsents} / 3
           </div>
           <div className="bg-gray-100 p-2 rounded">
               <span className="block text-xs font-semibold">Converted Absents</span>
               {stats.convertedAbsents} (from {stats.uninformedLates} lates)
           </div>
        </div>

        {/* Attendance Table with Checkbox */}
        <div className="max-h-60 overflow-y-auto border rounded-md">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Check In</th>
                <th className="p-2 text-left">Check Out</th>
                <th className="p-2 text-left">Late (mins)</th>
                <th className="p-2 text-center">Informed?</th>
              </tr>
            </thead>
            <tbody>
              {processedRecords.map((rec) => (
                <tr key={rec._id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{formatToPakistaniDate(rec.date)}</td>
                  <td className="p-2 capitalize">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                          rec.status==='absent' ? 'bg-red-100 text-red-800' : 
                          rec.status==='late' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100'
                      }`}>
                          {rec.status}
                      </span>
                  </td>
                  <td className="p-2 text-gray-600">
                      {rec.checkInTime ? formatToPakistaniTime(rec.checkInTime) : "-"}
                  </td>
                  <td className="p-2 text-gray-600">
                      {rec.checkOutTime ? formatToPakistaniTime(rec.checkOutTime) : "-"}
                  </td>
                  <td className="p-2">
                      {rec.lateMinutes > 0 ? <span className={rec.lateMinutes > 20 ? "text-red-600 font-bold" : ""}>{rec.lateMinutes}m</span> : "-"}
                  </td>
                  <td className="p-2 text-center">
                    {(rec.status === 'late' || rec.status === 'absent' || rec.lateMinutes > 20) && (
                      <input
                        type="checkbox"
                        checked={informedOverrides[rec._id] || rec.isInformed || false}
                        onChange={(e) => onInformedOverrideChange(rec._id, e.target.checked)}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-3 pt-2">
           <Button 
              onClick={onGenerate} 
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              disabled={loading}
          >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Printer className="mr-2 h-4 w-4" />}
              Generate Payroll & Notify
           </Button>
        </div>
      </div>
    </CustomModal>
  );
};

export default PayrollPreviewModal;
