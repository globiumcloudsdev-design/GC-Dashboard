// //src/Models/Agent.js
// import mongoose from 'mongoose';

// const agentSchema = new mongoose.Schema({
//   agentName: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   agentId: {
//     type: String,
//     required: true,
//     unique: true,
//     trim: true,
//     uppercase: true,
//     validate: {
//       validator: function(v) {
//         return /^[A-Z]{2}\d{4}$/.test(v);
//       },
//       message: props => `${props.value} is not a valid Agent ID! Format: 2 letters followed by 4 digits (e.g., AB1234)`
//     }
//   },
//   shift: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Shift',
//     required: true
//   },
//   email: {
//     type: String,
//     unique: true,
//     lowercase: true,
//     trim: true
//   },
//   password: {
//     type: String,
//     required: true
//   },
//   phone: {
//     type: String,
//     trim: true
//   },
  
//   // ✅ Monthly Target Types
//   monthlyTargetType: {
//     type: String,
//     enum: ['none', 'digit', 'amount', 'both'],
//     default: 'none'
//   },
  
//   // Digit Target (e.g., 100 calls, 50 settlements)
//   monthlyDigitTarget: {
//     type: Number,
//     default: 0,
//     min: [0, 'Digit target cannot be negative']
//   },
  
//   // Amount Target (e.g., 500000 revenue, 1000000 sales)
//   monthlyAmountTarget: {
//     type: Number,
//     default: 0,
//     min: [0, 'Amount target cannot be negative']
//   },
  
//   // Currency for amount target
//   targetCurrency: {
//     type: String,
//     default: 'PKR',
//     enum: ['PKR', 'USD', 'EUR', 'GBP']
//   },
  
//   // Salary Details
//   basicSalary: {
//     type: Number,
//     default: 0,
//     min: [0, 'Basic salary cannot be negative']
//   },
//   attendanceAllowance: {
//     type: Number,
//     default: 0,
//     min: [0, 'Attendance allowance cannot be negative']
//   },
//   perSaleIncentive: {
//     type: Number,
//     default: 0,
//     min: [0, 'Per sale incentive cannot be negative']
//   },

//   // Naye fields
//   employeeType: {
//     type: String,
//     enum: ['Permanent', 'Contract', 'Temporary', 'Probation', 'Intern', 'Part-time', 'Full-time', 'Freelance', 'Consultant', 'Manager'],
//     default: 'Permanent'
//   },
//   designation: {
//     type: String,
//     trim: true,
//     default: 'Sales Agent'
//   },
//   resetPasswordToken: String,
//   resetPasswordExpires: Date,
//   isActive: {
//     type: Boolean,
//     default: true
//   }
// }, {
//   timestamps: true
// });

// export default mongoose.models.Agent || mongoose.model('Agent', agentSchema);

//src/Models/Agent.js
import mongoose from 'mongoose';

const agentSchema = new mongoose.Schema({
  agentName: {
    type: String,
    required: true,
    trim: true
  },
  agentId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    validate: {
      validator: function(v) {
        return /^[A-Z]{2}\d{4}$/.test(v);
      },
      message: props => `${props.value} is not a valid Agent ID! Format: 2 letters followed by 4 digits (e.g., AB1234)`
    }
  },
  shift: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shift',
    required: true
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    trim: true
  },
  
  // ✅ Monthly Target Types
  monthlyTargetType: {
    type: String,
    enum: ['none', 'digit', 'amount', 'both'],
    default: 'none'
  },
  
  // Digit Target (e.g., 100 calls, 50 settlements)
  monthlyDigitTarget: {
    type: Number,
    default: 0,
    min: [0, 'Digit target cannot be negative']
  },
  
  // Amount Target (e.g., 500000 revenue, 1000000 sales)
  monthlyAmountTarget: {
    type: Number,
    default: 0,
    min: [0, 'Amount target cannot be negative']
  },
  
  // Currency for amount target
  targetCurrency: {
    type: String,
    default: 'PKR',
    enum: ['PKR', 'USD', 'EUR', 'GBP']
  },
  
  // Salary Details
  basicSalary: {
    type: Number,
    default: 0,
    min: [0, 'Basic salary cannot be negative']
  },
  attendanceAllowance: {
    type: Number,
    default: 0,
    min: [0, 'Attendance allowance cannot be negative']
  },

  // ✅ IMPROVED INCENTIVE STRUCTURE
  // Commission Structure Type (Basic+Comm or Only Comm)
  commissionType: {
    type: String,
    enum: ['Basic + Commission', 'Only Commission'],
    default: 'Basic + Commission'
  },

  // In Target Incentive (previously Before Target)
  perSaleIncentiveInTarget: {
    type: Number,
    default: 0,
    min: [0, 'Incentive cannot be negative']
  },
  inTargetIncentiveType: {
    type: String,
    enum: ['fixed', 'percentage'],
    default: 'fixed'
  },
  
  // After Target Incentive (when target is achieved)
  perSaleIncentiveAfterTarget: {
    type: Number,
    default: 0,
    min: [0, 'Incentive cannot be negative']
  },
  afterTargetIncentiveType: {
    type: String,
    enum: ['fixed', 'percentage'],
    default: 'fixed'
  },
  
  // Additional settings for percentage calculation
  incentivePercentageOn: {
    type: String,
    enum: ['sale_amount', 'profit', 'revenue'],
    default: 'sale_amount'
  },
  
  // Minimum sale amount for incentive eligibility
  minSaleAmountForIncentive: {
    type: Number,
    default: 0,
    min: [0, 'Minimum sale amount cannot be negative']
  },

  // ✅ Bank Details
  bankDetails: {
    bankName: { type: String, trim: true },
    accountTitle: { type: String, trim: true },
    accountNumber: { type: String, trim: true },
    iban: { type: String, trim: true },
    branchCode: { type: String, trim: true }
  },

  // ✅ Documents
  documents: [{
    name: { type: String, required: true }, // e.g., "CNIC Front"
    url: { type: String, required: true },
    type: { type: String }, // 'image', 'pdf', etc.
    publicId: { type: String },
    uploadedAt: { type: Date, default: Date.now }
  }],

  // Naye fields
  employeeType: {
    type: String,
    enum: ['Permanent', 'Contract', 'Temporary', 'Probation', 'Intern', 'Part-time', 'Full-time', 'Freelance', 'Consultant', 'Manager'],
    default: 'Permanent'
  },
  designation: {
    type: String,
    trim: true,
    default: 'Sales Agent'
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// ✅ Helper method to calculate incentive for a sale
agentSchema.methods.calculateIncentive = function(achievedDigit = 0, achievedAmount = 0, saleAmount = 0, saleProfit = 0) {
  let incentive = 0;
  let isTargetAchieved = false;
  
  // Check if target is achieved
  if (this.monthlyTargetType === 'digit') {
    isTargetAchieved = achievedDigit >= this.monthlyDigitTarget;
  } else if (this.monthlyTargetType === 'amount') {
    isTargetAchieved = achievedAmount >= this.monthlyAmountTarget;
  } else if (this.monthlyTargetType === 'both') {
    isTargetAchieved = achievedDigit >= this.monthlyDigitTarget && 
                      achievedAmount >= this.monthlyAmountTarget;
  } else {
    // 'none' - no target, always use in target incentive
    isTargetAchieved = false;
  }
  
  // Check minimum sale amount eligibility
  if (saleAmount < this.minSaleAmountForIncentive) {
    return { incentive: 0, isTargetAchieved, message: 'Sale amount below minimum threshold' };
  }
  
  if (isTargetAchieved) {
    // After target incentive calculation
    if (this.afterTargetIncentiveType === 'fixed') {
      incentive = this.perSaleIncentiveAfterTarget;
    } else if (this.afterTargetIncentiveType === 'percentage') {
      const baseAmount = this.incentivePercentageOn === 'sale_amount' ? saleAmount :
                        this.incentivePercentageOn === 'profit' ? saleProfit :
                        saleAmount; // revenue is same as sale_amount for now
      incentive = (baseAmount * this.perSaleIncentiveAfterTarget) / 100;
    }
  } else {
    // In target incentive calculation
    if (this.inTargetIncentiveType === 'fixed') {
      incentive = this.perSaleIncentiveInTarget;
    } else if (this.inTargetIncentiveType === 'percentage') {
      const baseAmount = this.incentivePercentageOn === 'sale_amount' ? saleAmount :
                        this.incentivePercentageOn === 'profit' ? saleProfit :
                        saleAmount;
      incentive = (baseAmount * this.perSaleIncentiveInTarget) / 100;
    }
  }
  
  return {
    incentive,
    isTargetAchieved,
    incentiveType: isTargetAchieved ? 'after_target' : 'in_target',
    incentiveRate: isTargetAchieved ? this.perSaleIncentiveAfterTarget : this.perSaleIncentiveInTarget,
    rateType: isTargetAchieved ? this.afterTargetIncentiveType : this.inTargetIncentiveType
  };
};

// ✅ Virtual for total incentive potential
agentSchema.virtual('estimatedMonthlyIncentive').get(function() {
  if (this.monthlyTargetType === 'digit' && this.inTargetIncentiveType === 'fixed') {
    return this.monthlyDigitTarget * this.perSaleIncentiveInTarget;
  } else if (this.monthlyTargetType === 'amount' && this.inTargetIncentiveType === 'percentage') {
    return (this.monthlyAmountTarget * this.perSaleIncentiveInTarget) / 100;
  }
  return 0;
});

export default mongoose.models.Agent || mongoose.model('Agent', agentSchema);