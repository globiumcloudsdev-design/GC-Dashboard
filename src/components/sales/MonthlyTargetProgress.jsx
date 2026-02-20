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
            : "bg-[#10B5DB]",
        textColor: isAchieved
          ? "text-emerald-600"
          : percentage >= 70
            ? "text-amber-600"
            : "text-[#10B5DB]",
        type: "digit",
        message: isAchieved
          ? "Digit target achieved!"
          : `${digitTarget - achievedDigits} units remaining`,
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
            : "bg-[#10B5DB]",
        textColor: isAchieved
          ? "text-emerald-600"
          : percentage >= 70
            ? "text-amber-600"
            : "text-[#10B5DB]",
        type: "amount",
        message: isAchieved
          ? "Revenue target achieved!"
          : `${currency} ${(amountTarget - achievedAmount).toLocaleString()} remaining`,
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
            : "bg-[#10B5DB]",
        textColor: isAchieved
          ? "text-emerald-600"
          : percentage >= 70
            ? "text-amber-600"
            : "text-[#10B5DB]",
        type: "both",
        message: isAchieved
          ? "Both targets achieved!"
          : `${Math.max(0, digitTarget - achievedDigits)} units & ${currency} ${Math.max(0, amountTarget - achievedAmount).toLocaleString()} left`,
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
    <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-white overflow-hidden p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/5 group">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-5">
          <div
            className={cn(
              "p-4 rounded-[1.25rem] shadow-sm transition-transform duration-500 group-hover:rotate-6",
              targetType === "none"
                ? "bg-slate-100"
                : targetType === "digit"
                  ? "bg-blue-100"
                  : targetType === "amount"
                    ? "bg-emerald-100"
                    : "bg-purple-100",
            )}
          >
            {targetType === "digit" ? (
              <Hash className="w-6 h-6 text-blue-600" />
            ) : targetType === "amount" ? (
              <DollarSign className="w-6 h-6 text-emerald-600" />
            ) : targetType === "both" ? (
              <TrendingUp className="w-6 h-6 text-purple-600" />
            ) : (
              <Target className="w-6 h-6 text-slate-600" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              Performance
            </h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
              Target Progress
            </p>
          </div>
        </div>
        <div className="text-right">
          <div
            className={cn(
              "text-3xl font-black tracking-tighter mb-0.5",
              progress.textColor,
            )}
          >
            {progress.percentage.toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Progress Bar Container - Glowing */}
      <div className="relative h-5 w-full bg-slate-100 rounded-full overflow-hidden mb-8 shadow-inner">
        <div
          className={cn(
            "absolute h-full left-0 top-0 transition-all duration-1000 ease-out rounded-full shadow-[0_0_20px_rgba(0,0,0,0.1)]",
            progress.color,
          )}
          style={{ width: `${progress.percentage}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent animate-pulse" />
        </div>
      </div>

      {/* Target Info Cards */}
      <div className="space-y-4">
        {targetType === "digit" && (
          <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                Digit Target
              </p>
              <p className="text-lg font-extrabold text-gray-800">
                {progress.completed}{" "}
                <span className="text-sm font-normal text-gray-400">
                  / {progress.target} units
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                Left
              </p>
              <p className="text-lg font-extrabold text-[#10B5DB]">
                {progress.remaining}
              </p>
            </div>
          </div>
        )}

        {targetType === "amount" && (
          <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                Revenue Target
              </p>
              <p className="text-lg font-extrabold text-gray-800 font-mono truncate max-w-[120px]">
                {currency} {progress.completed.toLocaleString()}{" "}
                <span className="text-sm font-normal text-gray-400">
                  / {progress.target.toLocaleString()}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                Left
              </p>
              <p className="text-lg font-extrabold text-emerald-600 truncate max-w-[100px]">
                {progress.remaining.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {targetType === "both" && (
          <div className="space-y-3">
            <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                  Units Progress
                </p>
                <p className="text-base font-extrabold text-gray-800">
                  {progress.digitCompleted}{" "}
                  <span className="text-xs font-normal text-gray-400">
                    / {progress.digitTarget}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                  Target
                </p>
                <p className="text-base font-extrabold text-blue-600">
                  {progress.digitRemaining} left
                </p>
              </div>
            </div>
            <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                  Revenue Progress
                </p>
                <p className="text-base font-extrabold text-gray-800 font-mono truncate max-w-[120px]">
                  {currency} {progress.amountCompleted.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                  Target
                </p>
                <p className="text-base font-extrabold text-emerald-600 truncate max-w-[100px]">
                  {progress.amountRemaining.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {targetType === "none" && (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-8 text-center">
            <div className="w-16 h-16 bg-white shadow-md rounded-2xl flex items-center justify-center mx-auto mb-5 rotate-3">
              <Target className="w-8 h-8 text-slate-200" />
            </div>
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
              No Active Target
            </h4>
            <p className="text-xs text-slate-400 font-bold leading-relaxed max-w-[180px] mx-auto">
              Monthly goals have not been assigned to your profile yet.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Status Badge */}
      <div
        className={cn(
          "mt-8 flex items-center justify-center gap-3 p-4 rounded-2xl border transition-all duration-700",
          progress.isAchieved
            ? "bg-emerald-50 border-emerald-100 text-emerald-700 shadow-lg shadow-emerald-500/10"
            : "bg-slate-50 border-slate-100 text-slate-500",
        )}
      >
        {progress.isAchieved ? (
          <>
            <div className="p-1 bg-emerald-500 rounded-full">
              <CheckCircle2 size={12} className="text-white" />
            </div>
            <span className="text-xs font-black tracking-widest uppercase italic">
              All targets achieved!
            </span>
          </>
        ) : (
          <>
            <BarChart3
              size={14}
              className={cn("animate-pulse", progress.textColor)}
            />
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-center">
              {progress.message}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default MonthlyTargetProgress;
