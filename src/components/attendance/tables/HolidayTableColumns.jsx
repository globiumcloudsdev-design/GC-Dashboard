// src/components/attendance/tables/HolidayTableColumns.jsx
"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { formatToPakistaniDate } from "@/utils/TimeFuntions";

export const getHolidayColumns = ({ canDeleteHolidays, handleDeleteHoliday }) => {
  return [
    {
      label: "Name",
      minWidth: "150px",
      render: (h) => <div className="font-medium">{h.name}</div>,
    },
    {
      label: "Date",
      minWidth: "120px",
      render: (h) => formatToPakistaniDate(h.date),
    },
    {
      label: "Description",
      minWidth: "200px",
      render: (h) => (
        <div className="max-w-[250px] truncate" title={h.description}>
          {h.description || "—"}
        </div>
      ),
    },
    {
      label: "Recurring",
      minWidth: "100px",
      render: (h) => (
        <Badge variant={h.isRecurring ? "default" : "secondary"}>
          {h.isRecurring ? "Yes" : "No"}
        </Badge>
      ),
    },
    ...(canDeleteHolidays
      ? [
          {
            label: "Actions",
            minWidth: "100px",
            render: (h) => (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteHoliday(h._id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            ),
          },
        ]
      : []),
  ];
};
