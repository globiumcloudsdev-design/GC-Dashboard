# Payroll System - Complete Salary Scenarios Documentation

## Overview
This document provides a comprehensive guide to the payroll system, including all salary calculation rules, target types, and scenarios for both admin-generated and agent self-generated payrolls.

---

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Agent Target Types](#agent-target-types)
3. [Salary Components](#salary-components)
4. [Calculation Rules](#calculation-rules)
5. [Sales & Incentive Logic](#sales--incentive-logic)
6. [Generation Methods](#generation-methods)
7. [Scenarios & Examples](#scenarios--examples)
8. [API Endpoints](#api-endpoints)

---

## System Architecture

### Core Files
- **`src/lib/payrollUtils.js`** - Centralized payroll calculation logic
- **`src/app/api/payroll/route.js`** - Admin payroll generation & listing
- **`src/app/api/payroll/my/generate/route.js`** - Agent self-generation
- **`src/app/api/payroll/generate-all/route.js`** - Bulk generation for all agents
- **`src/Models/Payroll.js`** - Payroll database schema
- **`src/components/GenerateAllSalaryModal.jsx`** - UI for bulk generation

### Key Principles
1. **Attendance-Based Deductions**: Absents and lates reduce salary
2. **Target-Based Incentives**: Sales incentives depend on agent target type
3. **Month-Based Completion**: Sales count in the month they are completed, not initiated
4. **Manual Override Support**: For zero-sales agents or exceptions

---

## Agent Target Types

### 1. None (`none`)
- **Purpose**: Agents without sales responsibilities
- **Incentive**: No sales incentive
- **Example**: Administrative staff, support roles

### 2. Digit Target (`digit`)
- **Purpose**: Target based on number of completed bookings
- **Metric**: Count of bookings
- **Source**: Bookings using agent's promo codes
- **Field**: `monthlyDigitTarget` (e.g., 50 bookings)
- **Incentive Calculation**: `completedBookings × perSaleIncentive`

### 3. Amount Target (`amount`)
- **Purpose**: Target based on revenue generated
- **Metric**: Total revenue in PKR/USD/etc
- **Source**: Completed projects assigned to agent
- **Field**: `monthlyAmountTarget` (e.g., PKR 500,000)
- **Incentive Calculation**: `completedProjects × perSaleIncentive`

### 4. Both (`both`)
- **Purpose**: Combined digit and amount targets
- **Metrics**: Both bookings count and project revenue
- **Sources**: Both promo code bookings and assigned projects
- **Incentive Calculation**: `(bookingIncentive + projectIncentive)`

---

## Salary Components

### Base Components
1. **Basic Salary** (`basicSalary`)
   - Core monthly salary
   - Fixed amount from agent profile
   
2. **Attendance Allowance** (`attendanceAllowance`)
   - Bonus for good attendance
   - Can be cut based on rules (see below)

3. **Per Sale Incentive** (`perSaleIncentive`)
   - Amount earned per sale/project
   - Applied based on target type

### Calculated Components
1. **Per Day Salary**: `basicSalary / totalDaysInMonth`
2. **Gross Salary**: `basicSalary + earnedAllowance + earnedIncentive`
3. **Net Salary**: `grossSalary - totalDeduction`

---

## Calculation Rules

### Rule 1: Absent Deduction
**Formula**: `(uninformedAbsents + informedAbsents + convertedAbsents) × perDaySalary`

**Components**:
- **Uninformed Absents**: Days absent without prior notice
- **Informed Absents**: Days absent with notice
- **Converted Absents**: `Math.floor(uninformedLates / 3)` (3 uninformed lates = 1 absent)

**Example**:
```
Basic Salary: PKR 30,000
Days in Month: 30
Per Day Salary: PKR 1,000

Uninformed Absents: 2
Informed Absents: 1
Uninformed Lates: 6 → Converted Absents = 2

Total Deductable Days: 2 + 1 + 2 = 5
Absent Deduction: 5 × 1,000 = PKR 5,000
```

### Rule 2: Late Penalty (>20 minutes)
**Formula**: `latePenaltyCount × (basicSalary × 0.0116)`

**Trigger**: Each late check-in over 20 minutes
**Percentage**: 1.16% of basic salary per occurrence

**Example**:
```
Basic Salary: PKR 30,000
Lates > 20 mins: 3

Late Deduction: 3 × (30,000 × 0.0116) = 3 × 348 = PKR 1,044
```

### Rule 3: Allowance Cut
**Conditions** (Any of these cuts allowance to 0):
- **5+ Informed Lates**: Being late 5 or more times even with notice
- **3+ Informed Absents**: Being absent 3 or more times even with notice

**Result**: `earnedAllowance = 0`

**Example**:
```
Attendance Allowance: PKR 5,000
Informed Lates: 6
Informed Absents: 1

Result: Allowance = 0 (due to 6 informed lates ≥ 5)
```

---

## Sales & Incentive Logic

### For Digit Target Agents

#### Source: Promo Code Bookings
The system:
1. Finds all promo codes belonging to the agent (`PromoCode.find({ agentId })`)
2. Finds bookings using those promo codes with `status: 'completed'`
3. Filters bookings completed in the target month (checks `completedAt` field)
4. Counts the bookings: `salesCount`

#### Incentive Calculation
```javascript
earnedIncentive = salesCount × perSaleIncentive
```

#### Pending Bookings Rule
**Critical**: If a booking is initiated in January but completed in February, it counts toward **February's** salary, not January's.

**Example**:
```
Agent: John (Digit Target)
Per Sale Incentive: PKR 500

January Sales:
- Booking #1: Created Jan 5, Completed Jan 20 ✅ 
- Booking #2: Created Jan 25, Status: Pending ❌
January Incentive: 1 × 500 = PKR 500

February Sales:
- Booking #2: Completed Feb 3 ✅ (counts in Feb now)
- Booking #3: Created Feb 10, Completed Feb 15 ✅
February Incentive: 2 × 500 = PKR 1,000
```

### For Amount Target Agents

#### Source: Assigned Projects
The system:
1. Finds projects where agent is assigned (`Project.find({ assignedAgent: agentId })`)
2. Filters projects with `status: 'completed'`
3. Filters projects completed in the target month (checks `completedAt` field)
4. Sums project prices: `revenue`
5. Counts projects: `completedProjectsCount`

#### Incentive Calculation
```javascript
earnedIncentive = completedProjectsCount × perSaleIncentive
```

**Note**: Can also be configured as percentage of revenue in future enhancements

#### Pending Projects Rule
**Critical**: Similar to bookings, projects count in the month they are completed.

**Example**:
```
Agent: Sarah (Amount Target)
Per Sale Incentive: PKR 5,000

January Projects:
- Project A: Started Jan 1, Completed Jan 25, Price: PKR 50,000 ✅
- Project B: Started Jan 20, Status: In Progress ❌
January Incentive: 1 × 5,000 = PKR 5,000
January Revenue: PKR 50,000

February Projects:
- Project B: Completed Feb 10, Price: PKR 75,000 ✅
- Project C: Started Feb 15, Completed Feb 28, Price: PKR 60,000 ✅
February Incentive: 2 × 5,000 = PKR 10,000
February Revenue: PKR 135,000
```

### For Both Target Agents
Combines both digit and amount calculations:
```javascript
bookingIncentive = salesCount × perSaleIncentive
projectIncentive = completedProjectsCount × perSaleIncentive
earnedIncentive = bookingIncentive + projectIncentive
```

---

## Generation Methods

### 1. Admin Generation (Manual)
**Route**: `POST /api/payroll`
**Features**:
- Generate for specific agent
- Preview before saving (`action: 'calculate'`)
- Save payroll (`action: 'generate'`)
- Support informed overrides (checkboxes for each attendance record)
- Support manual sales override

**Body**:
```json
{
  "action": "generate",
  "agentId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "month": 1,
  "year": 2026,
  "informedOverrides": {
    "attendanceId1": true,
    "attendanceId2": false
  },
  "manualSalesOverride": 10
}
```

### 2. Agent Self-Generation
**Route**: `POST /api/payroll/my/generate`
**Features**:
- Agent generates their own salary
- Automatic sales calculation
- Cannot override informed status
- Can provide manual sales override if needed

**Body**:
```json
{
  "month": 1,
  "year": 2026,
  "manualSalesOverride": null
}
```

### 3. Bulk Generation (All Agents)
**Route**: `POST /api/payroll/generate-all`
**Features**:
- Generate for all active agents at once
- Automatic detection of zero-sales agents
- Two-step process:
  1. First attempt - identifies zero-sales agents
  2. Second attempt - with manual overrides for zero-sales agents
- Detailed results reporting

**Body**:
```json
{
  "month": 1,
  "year": 2026,
  "manualOverrides": {
    "agentId1": 5,
    "agentId2": 100000
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "generated": [
      {
        "agentId": "...",
        "agentName": "John Doe",
        "netSalary": 35000,
        "salesCount": 10
      }
    ],
    "failed": [],
    "zeroSales": [
      {
        "agentId": "...",
        "agentName": "Jane Smith",
        "targetType": "digit",
        "salesData": { "salesCount": 0 }
      }
    ],
    "alreadyGenerated": []
  }
}
```

---

## Scenarios & Examples

### Scenario 1: Perfect Attendance, Good Sales
**Agent Profile**:
- Basic Salary: PKR 30,000
- Attendance Allowance: PKR 5,000
- Per Sale Incentive: PKR 500
- Target Type: Digit
- Monthly Target: 50 bookings

**Performance** (January 2026):
- Present Days: 30/30
- Lates: 0
- Absents: 0
- Completed Bookings: 55

**Calculation**:
```
Basic Salary: PKR 30,000
Attendance Allowance: PKR 5,000 (no violations)
Sales Incentive: 55 × 500 = PKR 27,500

Gross Salary: 30,000 + 5,000 + 27,500 = PKR 62,500
Deductions: 0
Net Salary: PKR 62,500
```

### Scenario 2: Some Lates, Below Target
**Agent Profile**:
- Basic Salary: PKR 25,000
- Attendance Allowance: PKR 3,000
- Per Sale Incentive: PKR 1,000
- Target Type: Amount
- Monthly Target: PKR 500,000

**Performance** (February 2026):
- Present Days: 27/28
- Uninformed Lates (< 20 mins): 4
- Uninformed Lates (> 20 mins): 2
- Uninformed Absents: 1
- Completed Projects Revenue: PKR 250,000
- Completed Projects Count: 2

**Calculation**:
```
Basic Salary: PKR 25,000
Attendance Allowance: PKR 3,000 (no violations)
Per Day Salary: 25,000 / 28 = PKR 893

Absent Deduction:
- Uninformed Absents: 1
- Converted Absents: 4 ÷ 3 = 1
- Total: 1 + 1 = 2 days
- Amount: 2 × 893 = PKR 1,786

Late Penalty:
- Lates > 20 mins: 2
- Amount: 2 × (25,000 × 0.0116) = 2 × 290 = PKR 580

Sales Incentive: 2 × 1,000 = PKR 2,000

Gross Salary: 25,000 + 3,000 + 2,000 = PKR 30,000
Total Deduction: 1,786 + 580 = PKR 2,366
Net Salary: 30,000 - 2,366 = PKR 27,634
```

### Scenario 3: Allowance Cut, Zero Sales
**Agent Profile**:
- Basic Salary: PKR 20,000
- Attendance Allowance: PKR 4,000
- Per Sale Incentive: PKR 300
- Target Type: Digit
- Monthly Target: 30 bookings

**Performance** (March 2026):
- Informed Lates: 6
- Informed Absents: 1
- Uninformed Absents: 2
- Completed Bookings: 0

**Calculation**:
```
Basic Salary: PKR 20,000
Attendance Allowance: PKR 0 (CUT due to 6 informed lates ≥ 5)
Per Day Salary: 20,000 / 31 = PKR 645

Absent Deduction:
- Informed Absents: 1
- Uninformed Absents: 2
- Total: 3 days
- Amount: 3 × 645 = PKR 1,935

Sales Incentive: 0 × 300 = PKR 0

Gross Salary: 20,000 + 0 + 0 = PKR 20,000
Total Deduction: PKR 1,935
Net Salary: 20,000 - 1,935 = PKR 18,065

Notes: "Allowance Cut: 5+ Informed Lates"
```

### Scenario 4: Both Target Type
**Agent Profile**:
- Basic Salary: PKR 35,000
- Attendance Allowance: PKR 5,000
- Per Sale Incentive: PKR 400
- Target Type: Both
- Monthly Digit Target: 20 bookings
- Monthly Amount Target: PKR 300,000

**Performance** (April 2026):
- Present Days: 30/30
- Completed Bookings: 25
- Completed Projects: 3 (Total Revenue: PKR 400,000)

**Calculation**:
```
Basic Salary: PKR 35,000
Attendance Allowance: PKR 5,000

Booking Incentive: 25 × 400 = PKR 10,000
Project Incentive: 3 × 400 = PKR 1,200
Total Incentive: 10,000 + 1,200 = PKR 11,200

Gross Salary: 35,000 + 5,000 + 11,200 = PKR 51,200
Deductions: 0
Net Salary: PKR 51,200
```

### Scenario 5: Pending to Completed Transition
**Agent Profile**:
- Basic Salary: PKR 28,000
- Per Sale Incentive: PKR 600
- Target Type: Digit

**January Performance**:
- Created 10 bookings
- Completed 7 bookings in January
- 3 bookings pending

**January Salary**:
```
Sales Incentive: 7 × 600 = PKR 4,200
Net Salary (simplified): PKR 28,000 + 4,200 = PKR 32,200
```

**February Performance**:
- 2 of the pending bookings completed in February
- 1 booking still pending
- Created 8 new bookings, completed 6

**February Salary**:
```
Completed from January: 2
Completed from February: 6
Total February Completions: 8

Sales Incentive: 8 × 600 = PKR 4,800
Net Salary (simplified): PKR 28,000 + 4,800 = PKR 32,800
```

---

## API Endpoints

### GET `/api/payroll`
List all payrolls with filters

**Query Parameters**:
- `month`: Filter by month (1-12)
- `year`: Filter by year
- `agent`: Filter by agent ID
- `status`: Filter by status
- `page`: Page number
- `limit`: Results per page

### POST `/api/payroll`
Generate or calculate payroll for specific agent

**Actions**:
- `calculate`: Preview without saving
- `generate`: Calculate and save

### GET `/api/payroll/:id`
Get specific payroll details

### PUT `/api/payroll/:id/status`
Update payroll status (paid/unpaid/etc)

### GET `/api/payroll/my`
Agent's own payroll history

### POST `/api/payroll/my/generate`
Agent self-generate salary

### POST `/api/payroll/generate-all`
Bulk generate for all agents

---

## UI Components

### PayrollAdminPage
**Location**: `src/app/(dashboard)/dashboard/payroll/page.jsx`

**Features**:
- View all payrolls with filters
- Export to Excel
- Print reports
- **"Generate All Salary" button** - Opens bulk generation modal
- Mark payrolls as paid/unpaid
- View payslip details

### GenerateAllSalaryModal
**Location**: `src/components/GenerateAllSalaryModal.jsx`

**Steps**:
1. **Select Month/Year**: Choose target period
2. **Handle Zero Sales**: Review and provide manual values for agents with no sales
3. **View Results**: See summary of generated, failed, and skipped payrolls

**Features**:
- Visual month/year selector
- Automatic zero-sales detection
- Manual override inputs with target type indicators
- Real-time validation
- Detailed results breakdown
- Success/error summary

---

## Database Schema

### Payroll Model Fields

```javascript
{
  agent: ObjectId,
  month: Number,          // 1-12
  year: Number,
  
  // Salary Snapshot
  basicSalary: Number,
  attendanceAllowance: Number,
  perSaleIncentive: Number,
  
  // Attendance Stats
  totalDaysInMonth: Number,
  workingDays: Number,
  presentDays: Number,
  totalLates: Number,
  latePenaltyCount: Number,
  uninformedLates: Number,
  informedLates: Number,
  absentDays: Number,
  convertedAbsents: Number,
  informedAbsents: Number,
  
  // Sales Stats (NEW)
  targetType: String,     // 'none', 'digit', 'amount', 'both'
  salesCount: Number,     // For digit target
  revenue: Number,        // For amount target
  completedBookingsCount: Number,
  completedProjectsCount: Number,
  
  // Financials
  perDaySalary: Number,
  lateDeductionAmount: Number,
  absentDeductionAmount: Number,
  earnedAllowance: Number,
  earnedIncentive: Number,
  grossSalary: Number,
  totalDeduction: Number,
  netSalary: Number,
  
  // Metadata
  status: String,         // 'generated', 'paid', 'unpaid', etc
  generatedBy: ObjectId,
  generatedAt: Date,
  paymentDate: Date,
  notes: String
}
```

---

## Best Practices

### For Admins
1. **Run Auto Attendance** before generating payroll to ensure all days are recorded
2. **Use Preview Mode** (`action: 'calculate'`) before finalizing
3. **Handle Zero Sales** agents appropriately - ask for justification or manual values
4. **Verify Incentives** match the agent's actual performance
5. **Document Exceptions** in the notes field

### For Agents
1. **Ensure Promo Codes** are assigned correctly to bookings
2. **Update Project Status** promptly when completed
3. **Mark Completions** in the correct month for accurate incentives
4. **Review Generated Salary** and report discrepancies immediately

### For Developers
1. **Always Use** `calculatePayrollLogic()` from `payrollUtils.js`
2. **Test Edge Cases**: Zero sales, all absents, maximum incentives
3. **Handle Timezones**: Use UTC for date comparisons
4. **Validate Inputs**: Especially manual overrides
5. **Log Errors**: Comprehensive error messages for debugging

---

## Migration Notes

### Existing Payrolls
- Old payrolls without sales stats will show 0
- Sales count can be backfilled if needed using historical data
- Target type defaults to 'none' for backward compatibility

### Agent Setup
- Ensure all sales agents have `monthlyTargetType` set
- Configure `monthlyDigitTarget` or `monthlyAmountTarget` as appropriate
- Set `perSaleIncentive` value

---

## Future Enhancements

### Potential Features
1. **Commission Tiers**: Different incentive rates based on target achievement
2. **Bonus System**: Additional bonuses for exceeding targets
3. **Quarterly Incentives**: Long-term performance rewards
4. **Team Targets**: Shared goals with split incentives
5. **Penalty Days**: Option to not deduct for informed absents/lates in special cases
6. **Revenue Percentage**: Instead of fixed per-project incentive
7. **Advance Salary**: Partial payroll before month end
8. **Payroll History Analytics**: Trends and insights dashboard

---

## Support & Troubleshooting

### Common Issues

**Issue**: Zero sales agents block bulk generation
**Solution**: Use the modal's manual override feature to provide values

**Issue**: Pending bookings not counting
**Solution**: Ensure `completedAt` date is set when status changes to 'completed'

**Issue**: Incentive not calculating
**Solution**: Check agent's `monthlyTargetType` and `perSaleIncentive` values

**Issue**: Duplicate payroll error
**Solution**: Check if payroll already exists for that agent/month/year combination

---

## Version History

- **v2.0.0** (Feb 2026) - Target-based incentive system with booking/project completion tracking
- **v1.5.0** (Jan 2026) - Bulk generation feature
- **v1.0.0** (Dec 2025) - Initial attendance-based payroll system

---

## Contact
For questions or issues, contact the development team or refer to the API documentation.
