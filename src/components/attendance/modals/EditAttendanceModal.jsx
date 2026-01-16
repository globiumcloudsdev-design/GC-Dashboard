// src/components/attendance/modals/EditAttendanceModal.jsx
"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import CustomModal from "@/components/ui/customModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EditAttendanceModal({
  isOpen,
  onClose,
  editForm,
  setEditForm,
  shifts,
  loading,
  onSubmit
}) {
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Attendance"
      description="Update attendance record details"
      size="lg"
      preventClose={loading}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={editForm.status}
              onValueChange={(value) => setEditForm({ ...editForm, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="leave">Leave</SelectItem>
                <SelectItem value="half-day">Half Day</SelectItem>
                <SelectItem value="holiday">Holiday</SelectItem>
                <SelectItem value="weekly-off">Weekly Off</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              type="date"
              value={editForm.date}
              onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
              required
              className="w-full"
            />
          </div>

          {/* Shift */}
          <div className="space-y-2">
            <Label htmlFor="shift">Shift</Label>
            <Select
              value={editForm.shiftId}
              onValueChange={(value) => setEditForm({ ...editForm, shiftId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Shift" />
              </SelectTrigger>
              <SelectContent>
                {shifts?.map((shift) => (
                  <SelectItem key={shift._id} value={shift._id}>
                    {shift.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Conditional Time Fields */}
        {(editForm.status === 'present' || editForm.status === 'half-day') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkIn">Check-In Time</Label>
              <Input
                type="time"
                value={editForm.checkInTime || ''}
                onChange={(e) => setEditForm({ ...editForm, checkInTime: e.target.value })}
                required={editForm.status === 'present' || editForm.status === 'half-day'}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkOut">Check-Out Time</Label>
              <Input
                type="time"
                value={editForm.checkOutTime || ''}
                onChange={(e) => setEditForm({ ...editForm, checkOutTime: e.target.value })}
                className="w-full"
              />
              <p className="text-xs text-gray-500">Leave empty if not checked out yet</p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 pt-4">
          <Button
            type="submit"
            className="flex-1 w-full"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Attendance
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
