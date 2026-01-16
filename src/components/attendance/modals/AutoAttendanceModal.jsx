// src/components/attendance/modals/AutoAttendanceModal.jsx
"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import CustomModal from "@/components/ui/customModal";

export default function AutoAttendanceModal({
  isOpen,
  onClose,
  autoForm,
  setAutoForm,
  loading,
  onSubmit
}) {
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Process Auto Attendance (Agents)"
      description="Automatically mark absent for agents without attendance on the selected date. Holidays and weekly offs are respected."
      size="md"
      preventClose={loading}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            type="date"
            value={autoForm.date}
            onChange={(e) => setAutoForm({ ...autoForm, date: e.target.value })}
            required
            className="w-full"
          />
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">How Auto Attendance (Agents) Works:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Agents without attendance will be marked as <strong>Absent</strong></li>
            <li>• If date is a holiday, agents will be marked as <strong>Holiday</strong></li>
            <li>• If date is weekly off, agents will be marked as <strong>Weekly Off</strong></li>
            <li>• Existing attendance records will not be modified</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-4">
          <Button
            type="submit"
            className="flex-1 w-full"
            disabled={loading || !autoForm.date}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Process Auto Attendance
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
