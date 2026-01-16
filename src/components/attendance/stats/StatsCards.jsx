// src/components/attendance/stats/StatsCards.jsx
"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CheckCircle, XCircle, Clock } from "lucide-react";

export default function StatsCards({ attendance, total }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (isMobile) {
    return (
      <div className="space-y-3 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="p-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-blue-800">
                  Total
                </CardTitle>
                <Calendar className="h-3 w-3 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-lg font-bold text-blue-700">{total}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="p-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-green-800">
                  Present
                </CardTitle>
                <CheckCircle className="h-3 w-3 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-lg font-bold text-green-700">
                {attendance.filter((a) => a.status === "present").length}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardHeader className="p-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-red-800">
                  Absent
                </CardTitle>
                <XCircle className="h-3 w-3 text-red-600" />
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-lg font-bold text-red-700">
                {attendance.filter((a) => a.status === "absent").length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardHeader className="p-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-yellow-800">
                  Leave/Off
                </CardTitle>
                <Clock className="h-3 w-3 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-lg font-bold text-yellow-700">
                {attendance.filter(
                  (a) =>
                    a.status.includes("leave") ||
                    a.status === "holiday" ||
                    a.status === "weekly_off"
                ).length}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
          <CardTitle className="text-sm font-medium text-blue-800">
            Total Records
          </CardTitle>
          <Calendar className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-2xl font-bold text-blue-700">{total}</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
          <CardTitle className="text-sm font-medium text-green-800">
            Present Today
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-2xl font-bold text-green-700">
            {attendance.filter((a) => a.status === "present").length}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
          <CardTitle className="text-sm font-medium text-red-800">
            Absent Today
          </CardTitle>
          <XCircle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-2xl font-bold text-red-700">
            {attendance.filter((a) => a.status === "absent").length}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
          <CardTitle className="text-sm font-medium text-yellow-800">
            On Leave/Off
          </CardTitle>
          <Clock className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-2xl font-bold text-yellow-700">
            {attendance.filter(
              (a) =>
                a.status.includes("leave") ||
                a.status === "holiday" ||
                a.status === "weekly_off"
            ).length}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
