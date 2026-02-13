// // src/components/attendance/modals/EditAttendanceModal.jsx
// "use client";
// import React from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Loader2 } from "lucide-react";
// import CustomModal from "@/components/ui/customModal";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// export default function EditAttendanceModal({
//   isOpen,
//   onClose,
//   editForm,
//   setEditForm,
//   shifts,
//   loading,
//   onSubmit
// }) {
//   return (
//     <CustomModal
//       isOpen={isOpen}
//       onClose={onClose}
//       title="Edit Attendance"
//       description="Update attendance record details"
//       size="lg"
//       preventClose={loading}
//     >
//       <form onSubmit={onSubmit} className="space-y-4">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {/* Status */}
//           <div className="space-y-2">
//             <Label htmlFor="status">Status</Label>
//             <Select
//               value={editForm.status}
//               onValueChange={(value) => setEditForm({ ...editForm, status: value })}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Select status" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="present">Present</SelectItem>
//                 <SelectItem value="absent">Absent</SelectItem>
//                 <SelectItem value="leave">Leave</SelectItem>
//                                 <SelectItem value="approved_leave">Approved Leave</SelectItem>
//                 <SelectItem value="half-day">Half Day</SelectItem>
//                 <SelectItem value="late">Late</SelectItem>
//                 <SelectItem value="early_checkout">Early Checkout</SelectItem>
//                 <SelectItem value="overtime">Overtime</SelectItem>
//                 <SelectItem value="holiday">Holiday</SelectItem>
//                 <SelectItem value="weekly-off">Weekly Off</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           {/* Date */}
//           <div className="space-y-2">
//             <Label htmlFor="date">Date</Label>
//             <Input
//               type="date"
//               value={editForm.date}
//               onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
//               required
//               className="w-full"
//             />
//           </div>

//           {/* Shift */}
//           <div className="space-y-2">
//             <Label htmlFor="shift">Shift</Label>
//             <Select
//               value={editForm.shiftId}
//               onValueChange={(value) => setEditForm({ ...editForm, shiftId: value })}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Select Shift" />
//               </SelectTrigger>
//               <SelectContent>
//                 {shifts?.map((shift) => (
//                   <SelectItem key={shift._id} value={shift._id}>
//                     {shift.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//         </div>

//         {/* Conditional Time Fields */}
//         {(editForm.status === 'present' || editForm.status === 'half-day') && (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="checkIn">Check-In Time <span className="text-xs text-gray-500">(PKT)</span></Label>
//               <Input
//                 type="time"
//                 value={editForm.checkInTime || ''}
//                 onChange={(e) => setEditForm({ ...editForm, checkInTime: e.target.value })}
//                 required={editForm.status === 'present' || editForm.status === 'half-day'}
//                 className="w-full"
//               />
//               <p className="text-xs text-gray-500">Pakistani Time (PKT = UTC+5)</p>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="checkOut">Check-Out Time <span className="text-xs text-gray-500">(PKT)</span></Label>
//               <Input
//                 type="time"
//                 value={editForm.checkOutTime || ''}
//                 onChange={(e) => setEditForm({ ...editForm, checkOutTime: e.target.value })}
//                 className="w-full"
//               />
//               <p className="text-xs text-gray-500">Leave empty if not checked out yet</p>
//             </div>
//           </div>
//         )}

//         <div className="flex flex-col sm:flex-row gap-2 pt-4">
//           <Button
//             type="submit"
//             className="flex-1 w-full"
//             disabled={loading}
//           >
//             {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//             Update Attendance
//           </Button>
//           <Button
//             type="button"
//             variant="outline"
//             onClick={onClose}
//             className="flex-1 w-full"
//             disabled={loading}
//           >
//             Cancel
//           </Button>
//         </div>
//       </form>
//     </CustomModal>
//   );
// }





"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Info } from "lucide-react";
import CustomModal from "@/components/ui/customModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function EditAttendanceModal({
  isOpen,
  onClose,
  editForm,
  setEditForm,
  shifts,
  loading,
  onSubmit
}) {
  // Helper to check if time fields should be shown
  const showTimeFields = () => {
    return ['present', 'late', 'half-day', 'half_day', 'early_checkout', 'overtime'].includes(editForm.status);
  };

  // Helper to check if informed option should be shown
  const showInformedOption = () => {
    return ['late', 'absent'].includes(editForm.status);
  };

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
            <Label htmlFor="status">Status *</Label>
            <Select
              value={editForm.status}
              onValueChange={(value) => setEditForm({ ...editForm, status: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="half_day">Half Day</SelectItem>
                <SelectItem value="early_checkout">Early Checkout</SelectItem>
                <SelectItem value="overtime">Overtime</SelectItem>
                <SelectItem value="approved_leave">Approved Leave</SelectItem>
                <SelectItem value="pending_leave">Pending Leave</SelectItem>
                <SelectItem value="holiday">Holiday</SelectItem>
                <SelectItem value="weekly_off">Weekly Off</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
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
                    {shift.name} ({shift.startTime} - {shift.endTime})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Informed Switch - Only for Late or Absent */}
          {showInformedOption() && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="isInformed">Informed</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm max-w-xs">
                        {editForm.status === 'late' 
                          ? "Informed Late: Counts as present (no penalty) but affects allowance (5+ informed lates = allowance cut)"
                          : "Informed Absent: Counts as absent but affects allowance (3+ informed absents = allowance cut)"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isInformed"
                  checked={editForm.isInformed || false}
                  onCheckedChange={(checked) => setEditForm({ ...editForm, isInformed: checked })}
                />
                <Label htmlFor="isInformed" className="text-sm text-gray-600">
                  {editForm.isInformed ? 'Yes (Informed)' : 'No (Uninformed)'}
                </Label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {editForm.status === 'late' 
                  ? "Informed Late = No salary deduction"
                  : "Informed Absent = Still absent but counted separately"}
              </p>
            </div>
          )}
        </div>

        {/* Time Fields - Only for present/late/half-day/early_checkout/overtime */}
        {showTimeFields() && (
          <>
            <div className="border-t border-gray-200 my-4"></div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Timing Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkIn">
                  Check-In Time <span className="text-xs text-gray-500">(PKT)</span>
                  {['present', 'late', 'half_day'].includes(editForm.status) && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </Label>
                <Input
                  type="time"
                  value={editForm.checkInTime || ''}
                  onChange={(e) => setEditForm({ ...editForm, checkInTime: e.target.value })}
                  required={['present', 'late', 'half_day'].includes(editForm.status)}
                  className="w-full"
                  step="60"
                />
                <p className="text-xs text-gray-500">Pakistan Time (PKT = UTC+5)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkOut">Check-Out Time <span className="text-xs text-gray-500">(PKT)</span></Label>
                <Input
                  type="time"
                  value={editForm.checkOutTime || ''}
                  onChange={(e) => setEditForm({ ...editForm, checkOutTime: e.target.value })}
                  className="w-full"
                  step="60"
                />
                <p className="text-xs text-gray-500">Leave empty if not checked out</p>
              </div>
            </div>
          </>
        )}

        {/* Notes Field */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes / Remarks</Label>
          <Input
            type="text"
            id="notes"
            value={editForm.notes || ''}
            onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
            placeholder="Add any additional notes..."
            className="w-full"
          />
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-200">
          <Button
            type="submit"
            className="flex-1 w-full bg-blue-600 hover:bg-blue-700"
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

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          <p className="font-medium mb-1">📌 Informed Rules:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li><span className="font-medium">Informed Late:</span> No salary deduction, but counts towards allowance cut (5+ informed lates)</li>
            <li><span className="font-medium">Uninformed Late:</span> Deduction applies, and 3 uninformed lates = 1 absent</li>
            <li><span className="font-medium">Informed Absent:</span> Deduction applies, counts towards allowance cut (3+ informed absents)</li>
            <li><span className="font-medium">Uninformed Absent:</span> Deduction applies</li>
          </ul>
        </div>
      </form>
    </CustomModal>
  );
}