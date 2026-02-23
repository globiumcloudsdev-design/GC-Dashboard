// src/components/attendance/modals/ManualAttendanceModal.jsx
"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import CustomModal from "@/components/ui/customModal";

export default function ManualAttendanceModal({
  isOpen,
  onClose,
  manualForm,
  setManualForm,
  agents,
  loading,
  onSubmit
}) {
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Manual Attendance Entry"
      description="Add or update attendance record manually"
      size="md"
      preventClose={loading}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="userType">User Type</Label>
            <Select
              value={manualForm.userType}
              onValueChange={(value) => setManualForm({ ...manualForm, userType: value, userId: "", agentId: "" })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agent">Employee</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="person">Select Employee</Label>
            <Select
              value={manualForm.agentId}
              onValueChange={(value) => setManualForm({ ...manualForm, agentId: value })}
              disabled={!agents || agents.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={agents && agents.length ? 'Select Employee' : 'No employees available'} />
              </SelectTrigger>
              <SelectContent>
                {agents.map(person => (
                  <SelectItem key={person._id || person.id} value={person._id || person.id}>
                    {`${person.agentName || person.name} (${person.agentId || person.email})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            type="date"
            value={manualForm.date}
            onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
            required
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={manualForm.status}
            onValueChange={(value) => setManualForm({ ...manualForm, status: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="present">Present</SelectItem>
              <SelectItem value="late">Late</SelectItem>
              <SelectItem value="half_day">Half Day</SelectItem>
              <SelectItem value="absent">Absent</SelectItem>
              <SelectItem value="early_checkout">Early Checkout</SelectItem>
              <SelectItem value="overtime">Overtime</SelectItem>
              <SelectItem value="leave">Leave</SelectItem>
              <SelectItem value="approved_leave">Approved Leave</SelectItem>
              <SelectItem value="pending_leave">Pending Leave</SelectItem>
              <SelectItem value="holiday">Holiday</SelectItem>
              <SelectItem value="weekly_off">Weekly Off</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="checkInTime">Check In Time</Label>
            <Input
              type="time"
              value={manualForm.checkInTime}
              onChange={(e) => setManualForm({ ...manualForm, checkInTime: e.target.value })}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="checkOutTime">Check Out Time</Label>
            <Input
              type="time"
              value={manualForm.checkOutTime}
              onChange={(e) => setManualForm({ ...manualForm, checkOutTime: e.target.value })}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-4">
          <Button
            type="submit"
            className="flex-1 w-full"
            disabled={loading || !manualForm.agentId || !manualForm.date || !manualForm.status}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Attendance
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
