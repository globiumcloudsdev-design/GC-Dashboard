// components/sales/SalesOverview.jsx
import React from "react";
import { BarChart3, Ticket, Wallet } from "lucide-react";

const SalesOverview = ({ data = {}, theme = {}, timeRange = "All Time" }) => {
  const overview = data.overview || {};

  const stats = [
    {
      label: "Total Promo Codes",
      value: overview.totalPromoCodes || 0,
      icon: Ticket,
      color: "text-blue-600",
      bg: "bg-blue-50/50",
    },
    {
      label: "Total Revenue Generated",
      value: (overview.totalAmount || 0).toLocaleString(),
      icon: Wallet,
      color: "text-indigo-600",
      bg: "bg-indigo-50/50",
      isCurrency: true,
    },
  ];

  return (
    <div className="bg-white rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-100/50 p-8 relative overflow-hidden group transition-all duration-300">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 opacity-[0.03] rounded-bl-full transition-transform group-hover:scale-110" />

      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-lg shadow-indigo-200 group-hover:rotate-3 transition-transform">
          <BarChart3 className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Sales Overview
          </h2>
          <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-[0.2em] mt-1">
            Activity Summary • {timeRange}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-6 rounded-[32px] bg-slate-50/50 border border-slate-100/50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300 group/item"
          >
            <div className="flex items-center justify-between mb-5">
              <div
                className={`p-3 rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover/item:scale-110`}
              >
                <stat.icon size={24} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900 tracking-tighter">
                {stat.isCurrency && (
                  <span className="text-sm font-bold text-slate-400 mr-1.5 opacity-60">
                    PKR
                  </span>
                )}
                {stat.value}
              </p>
              <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mt-1.5 opacity-80">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalesOverview;
