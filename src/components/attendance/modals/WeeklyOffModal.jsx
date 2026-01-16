// src/components/attendance/modals/WeeklyOffModal.jsx
"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import CustomModal from "@/components/ui/customModal";

export default function WeeklyOffModal({
  isOpen,
  onClose,
  weeklyOffForm,
  setWeeklyOffForm,
  loading,
  onSubmit
}) {
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Weekly Off Day"
      description="Set a weekly off day that will automatically mark as off every week"
      size="md"
      preventClose={loading}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="day">Day of Week</Label>
          <Select
            value={weeklyOffForm.day}
            onValueChange={(value) => setWeeklyOffForm({
              ...weeklyOffForm,
              day: value,
              name: value.charAt(0).toUpperCase() + value.slice(1) + " - Weekly Off"
            })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select day" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sunday">Sunday</SelectItem>
              <SelectItem value="monday">Monday</SelectItem>
              <SelectItem value="tuesday">Tuesday</SelectItem>
              <SelectItem value="wednesday">Wednesday</SelectItem>
              <SelectItem value="thursday">Thursday</SelectItem>
              <SelectItem value="friday">Friday</SelectItem>
              <SelectItem value="saturday">Saturday</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Display Name</Label>
          <Input
            type="text"
            value={weeklyOffForm.name}
            onChange={(e) => setWeeklyOffForm({ ...weeklyOffForm, name: e.target.value })}
            placeholder="e.g., Sunday, Weekly Off"
            required
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            value={weeklyOffForm.description}
            onChange={(e) => setWeeklyOffForm({ ...weeklyOffForm, description: e.target.value })}
            placeholder="Description for this weekly off..."
            rows={2}
            className="w-full"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-4">
          <Button
            type="submit"
            className="flex-1 w-full"
            disabled={loading || !weeklyOffForm.day || !weeklyOffForm.name}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Weekly Off
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
