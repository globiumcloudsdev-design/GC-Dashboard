// src/components/attendance/modals/ViewLeaveModal.jsx
"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, CalendarDays, CheckCircle, XCircle, Clock } from "lucide-react";
import CustomModal from "@/components/ui/customModal";
import { formatToPakistaniDate } from "@/utils/TimeFuntions";

export default function ViewLeaveModal({
  isOpen,
  onClose,
  viewingLeave,
  canApproveLeave,
  onApprove,
  onReject
}) {
  if (!viewingLeave) return null;
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLeaveTypeIcon = (type) => {
    switch(type) {
      case 'sick': return '🤒';
      case 'casual': return '🏖️';
      case 'emergency': return '🚨';
      default: return '📋';
    }
  };

  const calculateLeaveDays = () => {
    const start = new Date(viewingLeave.startDate);
    const end = new Date(viewingLeave.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Leave Request Details"
      description="Complete information about the leave request"
      size="lg"
    >
      <div className="space-y-6">
        {/* Employee Information */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-lg mb-3 text-blue-900 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Employee Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Name</p>
              <p className="font-medium text-gray-900">
                {viewingLeave.user 
                  ? `${viewingLeave.user.firstName} ${viewingLeave.user.lastName}` 
                  : viewingLeave.agent?.agentName || '—'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Email</p>
              <p className="font-medium text-gray-900">
                {viewingLeave.user?.email || viewingLeave.agent?.email || '—'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Type</p>
              <p className="font-medium text-gray-900">
                {viewingLeave.user ? 'User' : 'Agent'}
              </p>
            </div>
            {viewingLeave.agent?.agentId && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Agent ID</p>
                <p className="font-medium text-gray-900">{viewingLeave.agent.agentId}</p>
              </div>
            )}
          </div>
        </div>

        {/* Leave Details */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
          <h3 className="font-semibold text-lg mb-3 text-amber-900 flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Leave Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Leave Type</p>
              <p className="font-medium text-gray-900 capitalize flex items-center gap-2">
                <span>{getLeaveTypeIcon(viewingLeave.leaveType)}</span>
                {viewingLeave.leaveType}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Duration</p>
              <p className="font-medium text-gray-900">{calculateLeaveDays()} day(s)</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Start Date</p>
              <p className="font-medium text-gray-900">{formatToPakistaniDate(viewingLeave.startDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">End Date</p>
              <p className="font-medium text-gray-900">{formatToPakistaniDate(viewingLeave.endDate)}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600 mb-1">Reason</p>
              <p className="font-medium text-gray-900 bg-white p-3 rounded border">
                {viewingLeave.reason || '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Status Information */}
        <div className={`p-4 rounded-lg border ${
          viewingLeave.status === 'approved' ? 'bg-green-50 border-green-200' :
          viewingLeave.status === 'rejected' ? 'bg-red-50 border-red-200' :
          'bg-yellow-50 border-yellow-200'
        }`}>
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            {viewingLeave.status === 'approved' ? (
              <><CheckCircle className="h-5 w-5 text-green-600" /> Status: Approved</>
            ) : viewingLeave.status === 'rejected' ? (
              <><XCircle className="h-5 w-5 text-red-600" /> Status: Rejected</>
            ) : (
              <><Clock className="h-5 w-5 text-yellow-600" /> Status: Pending</>
            )}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Current Status</p>
              <Badge className={`${getStatusColor(viewingLeave.status)} text-sm px-3 py-1`}>
                {viewingLeave.status.toUpperCase()}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Request Submitted</p>
              <p className="font-medium text-gray-900">
                {formatToPakistaniDate(viewingLeave.createdAt)}
              </p>
            </div>
            {viewingLeave.reviewedBy && (
              <>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Reviewed By</p>
                  <p className="font-medium text-gray-900">
                    {viewingLeave.reviewedBy?.firstName} {viewingLeave.reviewedBy?.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Reviewed At</p>
                  <p className="font-medium text-gray-900">
                    {formatToPakistaniDate(viewingLeave.reviewedAt)}
                  </p>
                </div>
                {viewingLeave.comments && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600 mb-1">Admin Comments</p>
                    <p className="font-medium text-gray-900 bg-white p-3 rounded border">
                      {viewingLeave.comments}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 w-full"
          >
            Close
          </Button>
          {canApproveLeave && viewingLeave.status === 'pending' && (
            <>
              <Button
                onClick={onApprove}
                className="flex-1 w-full bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Leave
              </Button>
              <Button
                variant="destructive"
                onClick={onReject}
                className="flex-1 w-full"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject Leave
              </Button>
            </>
          )}
        </div>
      </div>
    </CustomModal>
  );
}
