// components/sales/RecentBookings.jsx
"use client";

import React, { useState } from "react";
import SaleDetailsModal from "./SaleDetailsModal";
import { ShoppingBag, ChevronRight, Clock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const getStatusStyles = (status) => {
  switch ((status || "").toLowerCase()) {
    case "completed":
    case "confirmed":
    case "success":
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        dot: "bg-emerald-500",
      };
    case "pending":
      return { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" };
    case "cancelled":
    case "canceled":
      return { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" };
    case "rescheduled":
      return {
        bg: "bg-indigo-50",
        text: "text-indigo-700",
        dot: "bg-indigo-500",
      };
    default:
      return { bg: "bg-slate-50", text: "text-slate-600", dot: "bg-slate-500" };
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const RecentBookings = ({ bookings = [], agent = null }) => {
  const [selectedBooking, setSelectedBooking] = useState(null);

  const formatCurrencyValue = (amount) => {
    if (!amount && amount !== 0) return "0";
    let currencySymbol = agent?.targetCurrency || "PKR";
    if (agent?.monthlyTargetType === "digit") currencySymbol = "PKR";
    if (currencySymbol === "USD") currencySymbol = "PKR";
    return `${currencySymbol} ${Number(amount).toLocaleString()}`;
  };

  return (
    <>
      <div className="bg-white rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-100/50 p-8 relative overflow-hidden group transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 opacity-[0.03] rounded-bl-full transition-transform group-hover:scale-110" />

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-lg group-hover:rotate-3 transition-transform">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight leading-none">
                Activity Feed
              </h2>
              <p className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.3em] mt-1.5 px-0.5">
                Last {bookings.length} Operations
              </p>
            </div>
          </div>
        </div>

        {!bookings.length ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-5 rotate-6">
              <Clock className="text-slate-200" size={32} />
            </div>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">
              No recent activities
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {bookings.map((item) => {
              const status = getStatusStyles(item.status);
              return (
                <div
                  key={item._id || item.bookingId}
                  onClick={() => setSelectedBooking(item)}
                  className="group/item flex items-center justify-between p-5 rounded-[32px] bg-slate-50/50 border border-slate-100/50 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center gap-5">
                    <div
                      className={cn(
                        "p-3.5 rounded-2xl transition-all duration-300 group-hover/item:scale-110 group-hover/item:rotate-3 shadow-sm",
                        status.bg,
                        status.text,
                      )}
                    >
                      {item.type === "project" ? (
                        <ShoppingBag size={22} className="opacity-90" />
                      ) : (
                        <Calendar size={22} className="opacity-90" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 group-hover/item:text-blue-600 transition-colors tracking-tight">
                        {item.type === "project"
                          ? item.title || "Untitled Project"
                          : item.customerName ||
                            `${item.formData?.firstName || "Guest"} ${item.formData?.lastName || ""}`}
                      </h4>
                      <div className="flex items-center gap-3 mt-1.5 px-0.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                          {formatDate(item.createdAt)}
                        </span>
                        <div
                          className={cn("w-1 h-1 rounded-full", status.dot)}
                        />
                        <span
                          className={cn(
                            "text-[10px] font-bold uppercase tracking-[0.1em] italic",
                            status.text,
                          )}
                        >
                          {item.status || "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {(agent?.monthlyTargetType === "amount" ||
                      agent?.monthlyTargetType === "both" ||
                      !agent?.monthlyTargetType) && (
                      <div className="text-right hidden sm:block">
                        <p className="text-base font-black text-slate-900 tracking-tighter">
                          {formatCurrencyValue(
                            item.type === "project"
                              ? item.price || item.amount || 0
                              : item.totalPrice ||
                                  item.amount ||
                                  item.totalAmount ||
                                  0,
                          )}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5 opacity-60">
                          Net
                        </p>
                      </div>
                    )}
                    <div className="p-2.5 bg-white rounded-2xl shadow-sm border border-slate-100 group-hover/item:bg-slate-900 group-hover/item:text-white transition-all duration-300">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <SaleDetailsModal
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        saleData={selectedBooking}
        currencySymbol={
          agent?.monthlyTargetType === "digit"
            ? "$"
            : agent?.targetCurrency || "PKR"
        }
      />
    </>
  );
};

export default RecentBookings;
