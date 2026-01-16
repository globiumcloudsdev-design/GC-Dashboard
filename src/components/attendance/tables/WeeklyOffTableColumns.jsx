// src/components/attendance/tables/WeeklyOffTableColumns.jsx
"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, ToggleLeft, ToggleRight } from "lucide-react";

export const getWeeklyOffColumns = ({
  canEditWeeklyOff,
  canDeleteWeeklyOff,
  handleToggleWeeklyOff,
  handleDeleteWeeklyOff,
}) => {
  return [
    {
      label: "Day",
      minWidth: "120px",
      render: (w) => <div className="font-medium capitalize">{w.day}</div>,
    },
    {
      label: "Name",
      minWidth: "150px",
      render: (w) => w.name,
    },
    {
      label: "Description",
      minWidth: "200px",
      render: (w) => (
        <div className="max-w-[250px] truncate" title={w.description}>
          {w.description || "—"}
        </div>
      ),
    },
    {
      label: "Status",
      minWidth: "100px",
      render: (w) => (
        <Badge variant={w.isActive ? "default" : "secondary"}>
          {w.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    ...(canEditWeeklyOff || canDeleteWeeklyOff
      ? [
          {
            label: "Actions",
            minWidth: "150px",
            render: (w) => (
              <div className="flex gap-2">
                {canEditWeeklyOff && (
                  <Button
                    variant={w.isActive ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleToggleWeeklyOff(w._id, !w.isActive)}
                  >
                    {w.isActive ? (
                      <ToggleLeft className="h-4 w-4 mr-1" />
                    ) : (
                      <ToggleRight className="h-4 w-4 mr-1" />
                    )}
                    {w.isActive ? "Deactivate" : "Activate"}
                  </Button>
                )}
                {canDeleteWeeklyOff && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteWeeklyOff(w._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ),
          },
        ]
      : []),
  ];
};
