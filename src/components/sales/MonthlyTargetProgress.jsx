// components/sales/MonthlyTargetProgress.jsx
import React, { useContext } from "react";
import {
  Hash,
  DollarSign,
  TrendingUp,
  Target,
  CheckCircle2,
  BarChart3,
} from "lucide-react";
import { ThemeContext } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

const MonthlyTargetProgress = ({
  currentMonth = "",
  achievedDigits = 0,
  achievedAmount = 0,
  digitTarget = 1, // Avoid division by zero
  amountTarget = 1, // Avoid division by zero
  targetType = "none",
  currency = "PKR",
}) => {
  const { theme: themeContext } = useContext(ThemeContext);

  // Calculate progress based on target type
  const calculateProgress = () => {
    if (targetType === "none") {
      return {
        percentage: 0,
        isAchieved: false,
        label: "No target set",
        color: "bg-gray-400",
        textColor: "text-gray-400",
        type: "none",
        message: "No target set for this month",
      };
    }

    if (targetType === "digit") {
      const progress = digitTarget > 0 ? achievedDigits / digitTarget : 0;
      const percentage = Math.min(progress * 100, 100);
      const isAchieved = achievedDigits >= digitTarget;

      return {
        percentage,
        isAchieved,
        completed: achievedDigits,
        target: digitTarget,
        remaining: Math.max(0, digitTarget - achievedDigits),
        label: "units",
        color: isAchieved
          ? "bg-emerald-500"
          : percentage >= 70
            ? "bg-amber-500"
            : "bg-blue-600",
        textColor: isAchieved
          ? "text-emerald-600"
          : percentage >= 70
            ? "text-amber-600"
            : "text-blue-600",
        type: "digit",
        message: isAchieved
          ? "Target reached!"
          : `${digitTarget - achievedDigits} target remaining`,
      };
    }

    if (targetType === "amount") {
      const progress = amountTarget > 0 ? achievedAmount / amountTarget : 0;
      const percentage = Math.min(progress * 100, 100);
      const isAchieved = achievedAmount >= amountTarget;

      return {
        percentage,
        isAchieved,
        completed: achievedAmount,
        target: amountTarget,
        remaining: Math.max(0, amountTarget - achievedAmount),
        label: currency,
        color: isAchieved
          ? "bg-emerald-500"
          : percentage >= 70
            ? "bg-amber-500"
            : "bg-blue-600",
        textColor: isAchieved
          ? "text-emerald-600"
          : percentage >= 70
            ? "text-amber-600"
            : "text-blue-600",
        type: "amount",
        message: isAchieved
          ? "Revenue goal reached!"
          : `${currency} ${(amountTarget - achievedAmount).toLocaleString()} left`,
      };
    }

    if (targetType === "both") {
      const digitProgress = digitTarget > 0 ? achievedDigits / digitTarget : 0;
      const amountProgress =
        amountTarget > 0 ? achievedAmount / amountTarget : 0;
      const combinedProgress = (digitProgress + amountProgress) / 2;
      const percentage = Math.min(combinedProgress * 100, 100);

      const digitAchieved = achievedDigits >= digitTarget;
      const amountAchieved = achievedAmount >= amountTarget;
      const isAchieved = digitAchieved && amountAchieved;

      return {
        percentage,
        isAchieved,
        digitCompleted: achievedDigits,
        digitTarget,
        digitRemaining: Math.max(0, digitTarget - achievedDigits),
        amountCompleted: achievedAmount,
        amountTarget,
        amountRemaining: Math.max(0, amountTarget - achievedAmount),
        currency,
        color: isAchieved
          ? "bg-emerald-500"
          : percentage >= 70
            ? "bg-amber-500"
            : "bg-blue-600",
        textColor: isAchieved
          ? "text-emerald-600"
          : percentage >= 70
            ? "text-amber-600"
            : "text-blue-600",
        type: "both",
        message: isAchieved
          ? "Goals achieved!"
          : `${Math.max(0, digitTarget - achievedDigits)} units & ${currency} left`,
      };
    }

    return {
      percentage: 0,
      isAchieved: false,
      label: "Invalid",
      color: "bg-gray-400",
      textColor: "text-gray-400",
      type: "none",
      message: "Invalid configuration",
    };
  };

  const progress = calculateProgress();

  return (
    <div className="bg-white/90 backdrop-blur-2xl rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.04)] border border-white p-8 transition-all duration-500 hover:shadow-2xl group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full -mr-10 -mt-10 blur-3xl transition-transform group-hover:scale-110" />

      {/* Header */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-5">
          <div
            className={cn(
              "p-4 rounded-2xl shadow-sm transition-transform duration-500 group-hover:rotate-6",
              targetType === "none"
                ? "bg-slate-100"
                : targetType === "digit"
                  ? "bg-blue-100/50"
                  : targetType === "amount"
                    ? "bg-emerald-100/50"
                    : "bg-indigo-100/50",
            )}
          >
            {targetType === "digit" ? (
              <Hash className="w-6 h-6 text-blue-600" />
            ) : targetType === "amount" ? (
              <DollarSign className="w-6 h-6 text-emerald-600" />
            ) : targetType === "both" ? (
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            ) : (
              <Target className="w-6 h-6 text-slate-600" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight leading-none">
              Monthly Goal
            </h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1.5 px-0.5">
              {currentMonth} System Tracking
            </p>
          </div>
        </div>
        <div className="text-right">
          <div
            className={cn(
              "text-4xl font-bold tracking-tighter mb-0.5",
              progress.textColor,
            )}
          >
            {progress.percentage.toFixed(0)}
            <span className="text-xl font-bold opacity-40 ml-0.5 tracking-tight">
              %
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="relative h-6 w-full bg-slate-100/80 rounded-full overflow-hidden mb-8 shadow-inner border border-slate-200/50">
        <div
          className={cn(
            "absolute h-full left-0 top-0 transition-all duration-1000 ease-out rounded-full shadow-[0_0_20px_rgba(0,0,0,0.05)]",
            progress.color,
          )}
          style={{ width: `${progress.percentage}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse" />
        </div>
      </div>

      {/* Goal Cards */}
      <div className="space-y-4 relative z-10">
        {targetType === "digit" && (
          <div className="bg-slate-50/50 rounded-3xl p-5 border border-slate-100/80 flex items-center justify-between group/card transition-colors hover:bg-white hover:border-blue-100">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase mb-2.5 tracking-[0.2em] px-0.5">
                Digit Target
              </p>
              <p className="text-2xl font-bold text-slate-800 tracking-tighter">
                {progress.completed}
                <span className="text-xs font-bold text-slate-400 ml-1.5 opacity-60 tracking-normal uppercase">
                  / {progress.target} units
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold text-slate-400 uppercase mb-2.5 tracking-[0.2em] px-0.5">
                Delta
              </p>
              <p className="text-2xl font-bold text-blue-600 tracking-tighter">
                {progress.remaining}
              </p>
            </div>
          </div>
        )}

        {targetType === "amount" && (
          <div className="bg-slate-50/50 rounded-3xl p-5 border border-slate-100/80 flex items-center justify-between group/card transition-colors hover:bg-white hover:border-emerald-100">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wider">
                Revenue Target
              </p>
              <p className="text-2xl font-bold text-slate-800 tracking-tighter">
                {currency} {progress.completed.toLocaleString()}
                <span className="text-[10px] font-bold text-slate-400 ml-2 opacity-50 block mt-1 uppercase tracking-wider">
                  Target: {progress.target.toLocaleString()}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wider">
                Required
              </p>
              <p className="text-2xl font-black text-emerald-600 tracking-tight">
                {progress.remaining.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {targetType === "both" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50/50 rounded-3xl p-5 border border-slate-100/80 hover:bg-white hover:border-blue-100 transition-all">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wider">
                Units
              </p>
              <p className="text-2xl font-black text-slate-800 tracking-tight">
                {progress.digitCompleted}
                <span className="text-xs font-bold text-slate-400 ml-1.5 opacity-60">
                  / {progress.digitTarget}
                </span>
              </p>
              <p className="text-[11px] font-bold text-blue-600 mt-1 uppercase tracking-wider">
                {progress.digitRemaining} left
              </p>
            </div>
            <div className="bg-slate-50/50 rounded-3xl p-5 border border-slate-100/80 hover:bg-white hover:border-emerald-100 transition-all">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wider">
                Revenue
              </p>
              <p className="text-xl font-black text-slate-800 font-mono tracking-tight line-clamp-1">
                {currency} {progress.amountCompleted.toLocaleString()}
              </p>
              <p className="text-[11px] font-bold text-emerald-600 mt-1 uppercase tracking-wider">
                {progress.amountRemaining.toLocaleString()} left
              </p>
            </div>
          </div>
        )}

        {targetType === "none" && (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-8 text-center">
            <div className="w-16 h-16 bg-white shadow-md rounded-2xl flex items-center justify-center mx-auto mb-5 rotate-3">
              <Target className="w-8 h-8 text-slate-100" />
            </div>
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">
              No Active Target
            </h4>
            <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-[180px] mx-auto opacity-70">
              Monthly goals have not been assigned to your profile yet.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Status Badge */}
      <div
        className={cn(
          "mt-8 flex items-center justify-center gap-3 p-4 rounded-2xl border transition-all duration-700 relative z-10",
          progress.isAchieved
            ? "bg-emerald-50 border-emerald-100 text-emerald-700 shadow-xl shadow-emerald-500/10"
            : "bg-slate-50/50 border-slate-100/80 text-slate-500",
        )}
      >
        {progress.isAchieved ? (
          <>
            <div className="p-1 bg-emerald-500 rounded-full animate-bounce">
              <CheckCircle2 size={12} className="text-white" />
            </div>
            <span className="text-xs font-bold tracking-[0.1em] uppercase italic">
              All targets achieved!
            </span>
          </>
        ) : (
          <>
            <BarChart3
              size={14}
              className={cn("animate-pulse", progress.textColor)}
            />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-center">
              {progress.message}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default MonthlyTargetProgress;
