// src/components/attendance/tables/LeaveTableColumns.jsx
"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { formatToPakistaniDate } from "@/utils/TimeFuntions";

export const getLeaveColumns = ({
  canApproveLeave,
  setViewingLeave,
  setShowViewLeaveModal,
  handleLeaveAction,
}) => {
  const getLeaveStatusBadge = (status) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };

    return (
      <Badge className={variants[status] || ""}>
        {status?.toUpperCase()}
      </Badge>
    );
  };

  return [
    {
      label: "Agent",
      minWidth: "200px",
      render: (r) => (
        <div>
          <div className="font-medium">
            {r.user
              ? `${r.user?.firstName || ""} ${r.user?.lastName || ""}`
              : r.agent?.agentName || "—"}
          </div>
          <div className="text-xs text-muted-foreground">
            {r.user ? r.user.email : r.agent?.email}
          </div>
        </div>
      ),
    },
    {
      label: "Leave Type",
      minWidth: "100px",
      render: (r) => <span className="capitalize">{r.leaveType}</span>,
    },
    {
      label: "Period",
      minWidth: "150px",
      render: (r) => (
        <div>
          <div className="text-sm">{formatToPakistaniDate(r.startDate)}</div>
          <div className="text-xs text-muted-foreground">to</div>
          <div className="text-sm">{formatToPakistaniDate(r.endDate)}</div>
        </div>
      ),
    },
    {
      label: "Reason",
      minWidth: "150px",
      render: (r) => (
        <div className="max-w-[200px] truncate" title={r.reason}>
          {r.reason}
        </div>
      ),
    },
    {
      label: "Status",
      minWidth: "100px",
      render: (r) => getLeaveStatusBadge(r.status),
    },
    ...(canApproveLeave
      ? [
          {
            label: "Actions",
            minWidth: "200px",
            render: (r) => (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setViewingLeave(r);
                    setShowViewLeaveModal(true);
                  }}
                  title="View leave details"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {r.status === "pending" ? (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleLeaveAction(r._id, "approved")}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleLeaveAction(r._id, "rejected")}
                    >
                      Reject
                    </Button>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground italic">
                    {r.status === "approved"
                      ? "Approved"
                      : r.status === "rejected"
                      ? "Rejected"
                      : "Processed"}
                  </span>
                )}
              </div>
            ),
          },
        ]
      : [
          {
            label: "Actions",
            minWidth: "100px",
            render: (r) => (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setViewingLeave(r);
                  setShowViewLeaveModal(true);
                }}
                title="View leave details"
              >
                <Eye className="h-4 w-4" />
              </Button>
            ),
          },
        ]),
  ];
};
