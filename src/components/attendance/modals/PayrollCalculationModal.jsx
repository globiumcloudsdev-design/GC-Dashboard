// src/components/attendance/modals/PayrollCalculationModal.jsx
"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Calendar, TrendingUp } from "lucide-react";
import CustomModal from "@/components/ui/customModal";

export default function PayrollCalculationModal({
  isOpen,
  onClose,
  payrollForm,
  setPayrollForm,
  loading,
  onCalculate
}) {
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Payroll Calculation"
      description="Calculate attendance-based payroll for a specific date range"
      size="lg"
      preventClose={loading}
    >
      <form onSubmit={onCalculate} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="startDate" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Start Date
            </Label>
            <Input
              type="date"
              value={payrollForm.startDate}
              onChange={(e) => setPayrollForm({ ...payrollForm, startDate: e.target.value })}
              required
              className="w-full"
            />
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label htmlFor="endDate" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              End Date
            </Label>
            <Input
              type="date"
              value={payrollForm.endDate}
              onChange={(e) => setPayrollForm({ ...payrollForm, endDate: e.target.value })}
              required
              min={payrollForm.startDate}
              className="w-full"
            />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-medium text-green-800 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Payroll Calculation Details:
          </h4>
          <ul className="text-sm text-green-700 space-y-2">
            <li className="flex items-start gap-2">
              <span className="font-semibold min-w-[120px]">Present Days:</span>
              <span>Full salary contribution</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold min-w-[120px]">Half Days:</span>
              <span>50% salary contribution</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold min-w-[120px]">Leaves:</span>
              <span>Paid leave (full contribution)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold min-w-[120px]">Absent:</span>
              <span>No salary contribution</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold min-w-[120px]">Holidays/Weekly Off:</span>
              <span>Full salary (not counted in working days)</span>
            </li>
          </ul>
        </div>

        <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> Calculation shows attendance percentage and effective working days. 
            Final salary calculation should be done in the payroll module.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-4">
          <Button
            type="submit"
            className="flex-1 w-full bg-green-600 hover:bg-green-700"
            disabled={loading || !payrollForm.startDate || !payrollForm.endDate}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Calculate Payroll
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 w-full"
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </CustomModal>
  );
}
