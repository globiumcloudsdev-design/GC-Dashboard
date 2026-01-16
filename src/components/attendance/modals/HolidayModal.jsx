// src/components/attendance/modals/HolidayModal.jsx
"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import CustomModal from "@/components/ui/customModal";

export default function HolidayModal({
  isOpen,
  onClose,
  holidayForm,
  setHolidayForm,
  loading,
  onSubmit
}) {
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Holiday"
      description="Add a new holiday to the system. Recurring holidays will automatically repeat every year."
      size="lg"
      preventClose={loading}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Holiday Name *</Label>
          <Input
            type="text"
            value={holidayForm.name}
            onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
            placeholder="e.g., Independence Day"
            required
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Date *</Label>
          <Input
            type="date"
            value={holidayForm.date}
            onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })}
            required
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            value={holidayForm.description}
            onChange={(e) => setHolidayForm({ ...holidayForm, description: e.target.value })}
            placeholder="Brief description of the holiday..."
            rows={3}
            className="w-full"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="isRecurring"
            checked={holidayForm.isRecurring}
            onCheckedChange={(checked) => setHolidayForm({ ...holidayForm, isRecurring: checked })}
          />
          <Label
            htmlFor="isRecurring"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Recurring Holiday (Repeats every year)
          </Label>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-4">
          <Button
            type="submit"
            className="flex-1 w-full"
            disabled={loading || !holidayForm.name || !holidayForm.date}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Holiday
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
