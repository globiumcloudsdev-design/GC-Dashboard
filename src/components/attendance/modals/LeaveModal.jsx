// src/components/attendance/modals/LeaveModal.jsx
"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import CustomModal from "@/components/ui/customModal";

export default function LeaveModal({
  isOpen,
  onClose,
  leaveForm,
  setLeaveForm,
  agents,
  loading,
  onSubmit
}) {
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Leave"
      description="Assign leave to user or agent"
      size="md"
      preventClose={loading}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="userType">User Type</Label>
            <Select
              value={leaveForm.userType}
              onValueChange={(value) => setLeaveForm({ ...leaveForm, userType: value, userId: "", agentId: "" })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agent">Agent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="person">Select Agent</Label>
            <Select
              value={leaveForm.agentId}
              onValueChange={(value) => setLeaveForm({ ...leaveForm, agentId: value })}
              disabled={!agents || agents.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={agents && agents.length ? 'Select Agent' : 'No agents available'} />
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              type="date"
              value={leaveForm.startDate}
              onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
              required
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              type="date"
              value={leaveForm.endDate}
              onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
              required
              className="w-full"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="leaveType">Leave Type</Label>
          <Select
            value={leaveForm.leaveType}
            onValueChange={(value) => setLeaveForm({ ...leaveForm, leaveType: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select leave type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sick">Sick Leave</SelectItem>
              <SelectItem value="casual">Casual Leave</SelectItem>
              <SelectItem value="emergency">Emergency Leave</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">Reason</Label>
          <Textarea
            value={leaveForm.reason}
            onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
            placeholder="Reason for leave..."
            rows={3}
            className="w-full"
            required
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-4">
          <Button
            type="submit"
            className="flex-1 w-full"
            disabled={loading || !leaveForm.agentId || !leaveForm.startDate || !leaveForm.endDate}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assign Leave
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
