// components/sales/PromoCodesList.jsx
import React from "react";
import { Ticket, Percent, Activity, Box } from "lucide-react";

const PromoCodesList = ({ promoCodes = [], theme = {} }) => {
  if (!promoCodes.length) {
    return (
      <div className="bg-white rounded-[40px] shadow-xl shadow-slate-200/50 border-none p-8 text-center h-full flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <Ticket className="text-slate-200" size={32} />
        </div>
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">
          No promo codes active
        </h3>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[40px] shadow-xl shadow-slate-200/50 border-none p-8 relative overflow-hidden group h-full">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 opacity-[0.03] rounded-bl-full transition-transform group-hover:scale-110" />

      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg shadow-blue-200">
          <Ticket className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
            Promo Performance
          </h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-0.5">
            {promoCodes.length} Registered Codes
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {promoCodes.map((item) => (
          <div
            key={item.promoCodeId?.toString() || item.promoCode}
            className="p-5 rounded-3xl bg-slate-50/50 border border-slate-100/50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300 group/item"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Percent size={14} />
                </div>
                <span className="text-sm font-black text-slate-900 tracking-tight">
                  {item.promoCode || "N/A"}
                </span>
              </div>
              <span className="text-[10px] font-black bg-emerald-100 text-emerald-600 px-2 py-1 rounded-lg uppercase tracking-widest">
                {item.discountPercentage ?? 0}% Off
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-slate-100/50 mt-2">
              <div className="flex items-center gap-2">
                <Activity size={12} className="text-slate-400" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Usage: {item.usedCount || 0}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-slate-900 tracking-tight">
                  {item.totalBookings ?? 0}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                  Bookings
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromoCodesList;
