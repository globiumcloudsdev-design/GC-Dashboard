// src/components/attendance/modals/ShiftAutoAttendanceModal.jsx
"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import CustomModal from "@/components/ui/customModal";

export default function ShiftAutoAttendanceModal({
  isOpen,
  onClose,
  shiftAutoForm,
  setShiftAutoForm,
  loading,
  onSubmit
}) {
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Process Auto Attendance (Shift Basis)"
      description="Process attendance based on shift schedules. Marks absent for employees who missed their scheduled shift."
      size="md"
      preventClose={loading}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            type="date"
            value={shiftAutoForm.date}
            onChange={(e) => setShiftAutoForm({ ...shiftAutoForm, date: e.target.value })}
            required
            className="w-full"
          />
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <h4 className="font-medium text-purple-800 mb-2">How Auto Attendance (Shift) Works:</h4>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• Checks shift schedules for the selected date</li>
            <li>• Employees with scheduled shift but no attendance = <strong>Absent</strong></li>
            <li>• Respects holidays and weekly offs for scheduled shifts</li>
            <li>• Only processes employees with active shift schedules</li>
            <li>• Existing attendance records will not be modified</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-4">
          <Button
            type="submit"
            className="flex-1 w-full"
            disabled={loading || !shiftAutoForm.date}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Process Shift Attendance
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
