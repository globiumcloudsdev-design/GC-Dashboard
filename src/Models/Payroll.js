import mongoose from "mongoose";

const PayrollSchema = new mongoose.Schema(
  {
    agent: { type: mongoose.Schema.Types.ObjectId, ref: "Agent", required: true },
    month: { type: Number, required: true }, // 1-12
    year: { type: Number, required: true },
    
    // Salary Snapshot (in case agent salary changes later)
    basicSalary: { type: Number, default: 0 },
    attendanceAllowance: { type: Number, default: 0 },
    perSaleIncentive: { type: Number, default: 0 },
    
    // Stats Used for Calculation
    totalDaysInMonth: { type: Number, default: 30 },
    workingDays: { type: Number, default: 0 },
    presentDays: { type: Number, default: 0 }, // Includes Present, Late, Half Day
    totalLates: { type: Number, default: 0 },
    latePenaltyCount: { type: Number, default: 0 }, // Lates > 20 mins
    
    uninformedLates: { type: Number, default: 0 }, // Used for Absent conversion
    informedLates: { type: Number, default: 0 },   // Used for allowance cut
    
    absentDays: { type: Number, default: 0 },      // Actual absents
    convertedAbsents: { type: Number, default: 0 }, // From 3 lates logic
    informedAbsents: { type: Number, default: 0 }, // Used for allowance cut
    
    // Financials
    perDaySalary: { type: Number, default: 0 },
    
    // Deductions
    lateDeductionAmount: { type: Number, default: 0 }, // The 1.16% cuts
    absentDeductionAmount: { type: Number, default: 0 }, // Days * Per Day Salary
    
    // Allowances
    earnedAllowance: { type: Number, default: 0 }, // 0 if rules violated
    earnedIncentive: { type: Number, default: 0 }, // Manual or calculated later
    
    // Totals
    grossSalary: { type: Number, default: 0 }, // Basic + Allowance + Incentive
    totalDeduction: { type: Number, default: 0 },
    netSalary: { type: Number, required: true }, // Final Pay
    
    status: { 
      type: String, 
      enum: ["generated", "paid", "cancelled", "processed", "failed", "refunded", "adjusted", "unpaid"], 
      default: "generated" 
    },
    
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    generatedAt: { type: Date, default: Date.now },
    paymentDate: { type: Date },
    notes: { type: String }
  },
  { timestamps: true }
);

// Prevent duplicate payroll for same agent/month/year
PayrollSchema.index({ agent: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.models.Payroll || mongoose.model("Payroll", PayrollSchema);