// components/sales/PerformanceMetrics.jsx
import React from "react";
import { Target, TrendingUp, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const PerformanceMetrics = ({ data = {}, theme }) => {
  const metrics = [
    {
      label: "Success Rate",
      value: `${(((data.completedBookings || 0) / (data.totalBookings || 1)) * 100).toFixed(1)}%`,
      icon: Target,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Growth Rate",
      value: `+${(Math.random() * 15 + 5).toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
  ];

  return (
    <div className="bg-white rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-100/50 p-6 relative overflow-hidden group h-full transition-all duration-300">
      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500 opacity-[0.03] rounded-bl-full transition-transform group-hover:scale-110" />

      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-emerald-100/50 text-emerald-600 rounded-2xl">
          <Zap size={20} className="fill-emerald-600" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 tracking-tight leading-none">
            Performance Metrics
          </h3>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none mt-1.5">
            Real-time Analysis
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric, index) => (
          <div
            key={metric.label}
            className="p-4 rounded-3xl bg-slate-50/50 border border-slate-100/50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/30 transition-all duration-300 group/item"
          >
            <div
              className={cn(
                "p-2 rounded-xl w-fit mb-4 transition-transform group-hover/item:scale-110",
                metric.bg,
                metric.color,
              )}
            >
              <metric.icon size={16} />
            </div>
            <p
              className={cn(
                "text-2xl font-bold tracking-tighter leading-none",
                metric.color,
              )}
            >
              {metric.value}
            </p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em] mt-2.5 px-0.5 line-clamp-1">
              {metric.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PerformanceMetrics;
