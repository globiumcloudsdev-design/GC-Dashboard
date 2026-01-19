# Agent Sales System Documentation

## Overview
The Agent Sales System is designed to track and manage agent performance based on different target types. Agents can have targets for either booking counts (digit), revenue amounts, or both.

## Target Types

### 1. Digit Target (`monthlyTargetType: 'digit'`)
**Description:** Agent has a target based on the number of completed bookings.

**API Routes:**
- **GET** `/api/agents?targetType=amount&limit=10`
  - Returns agents with `monthlyTargetType` as 'digit' or 'both'
  - Query parameter: `targetType=amount` (filters for revenue-capable agents)

- **GET** `/api/promo-codes/agent/{agentId}/bookings?startDate={start}&endDate={end}&limit=1000`
  - Returns bookings associated with the agent
  - Date range filtering for monthly performance
  - URL: `http://localhost:3000/api/promo-codes/agent/{agentId}/bookings?startDate=2024-01-01T00:00:00.000Z&endDate=2024-01-31T23:59:59.999Z&limit=1000`

**Data Structure:**
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "_id": "booking_id",
        "bookingId": "BK-001",
        "status": "completed",
        "discountedPrice": 250,
        "totalPrice": 280,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "formData": {
          "firstName": "John",
          "lastName": "Doe"
        }
      }
    ]
  }
}
```

**Performance Calculation:**
- Completed bookings: `status === 'completed' || status === 'confirmed'`
- Progress: `(completedBookings / monthlyDigitTarget) * 100`

---

### 2. Amount Target (`monthlyTargetType: 'amount'`)
**Description:** Agent has a target based on revenue generated from projects.

**API Routes:**
- **GET** `/api/agents?targetType=amount&limit=10`
  - Returns agents with `monthlyTargetType` as 'amount' or 'both'
  - Query parameter: `targetType=amount` (filters for revenue-capable agents)

- **GET** `/api/projects?assignedAgent={agentId}&startDate={start}&endDate={end}&limit=1000`
  - Returns projects assigned to the agent
  - Date range filtering for monthly performance
  - URL: `http://localhost:3000/api/projects?assignedAgent={agentId}&startDate=2024-01-01T00:00:00.000Z&endDate=2024-01-31T23:59:59.999Z&limit=1000`

**Data Structure:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "project_id",
      "slug": "project-slug",
      "title": "E-commerce Website",
      "status": "Completed",
      "price": 50000,
      "createdAt": "2024-01-10T09:00:00.000Z",
      "client": {
        "name": "ABC Company"
      },
      "assignedAgent": {
        "_id": "agent_id",
        "agentName": "John Doe"
      }
    }
  ]
}
```

**Performance Calculation:**
- Completed projects: `status === 'Completed' || status === 'Delivered'`
- Revenue: Sum of `price` from completed projects
- Progress: `(totalRevenue / monthlyAmountTarget) * 100`

---

### 3. Both Targets (`monthlyTargetType: 'both'`)
**Description:** Agent has targets for both booking count and revenue amount.

**API Routes:**
- **GET** `/api/agents?targetType=amount&limit=10`
  - Returns agents with `monthlyTargetType` as 'both'
  - Query parameter: `targetType=amount` (filters for revenue-capable agents)

- **Combined Data Fetch:**
  - **GET** `/api/promo-codes/agent/{agentId}/bookings?startDate={start}&endDate={end}&limit=1000`
  - **GET** `/api/projects?assignedAgent={agentId}&startDate={start}&endDate={end}&limit=1000`
  - Both APIs called simultaneously and data combined

**Data Structure:**
```json
{
  "success": true,
  "data": [
    // Bookings
    {
      "type": "booking",
      "_id": "booking_id",
      "bookingId": "BK-001",
      "status": "completed",
      "discountedPrice": 250,
      "date": "2024-01-15T10:30:00.000Z"
    },
    // Projects
    {
      "type": "project",
      "_id": "project_id",
      "slug": "project-slug",
      "title": "E-commerce Website",
      "status": "Completed",
      "price": 50000,
      "date": "2024-01-10T09:00:00.000Z"
    }
  ]
}
```

**Performance Calculation:**
- Digit Progress: `(completedBookings / monthlyDigitTarget)`
- Amount Progress: `(totalRevenue / monthlyAmountTarget)`
- Overall Progress: `((digitProgress + amountProgress) / 2) * 100`

---

## Agent Detail Page Features

### Progress Bar
- **Location:** Above the tabs section
- **Functionality:** Shows monthly performance percentage
- **Color Coding:**
  - Red: < 50%
  - Yellow: 50-74%
  - Blue: 75-99%
  - Green: 100%+

### Sales History Tab
**Dynamic Content Based on Target Type:**

1. **Digit Target Agents:**
   - Shows booking history table
   - Columns: Booking ID, Date, Customer, Amount, Status
   - Filters completed/confirmed bookings for performance

2. **Amount Target Agents:**
   - Shows project history table
   - Columns: Project ID, Date, Project Title, Amount, Status
   - Filters completed/delivered projects for revenue

3. **Both Target Agents:**
   - Shows combined sales history table
   - Columns: ID, Date, Title, Amount, Status
   - Includes both bookings and projects sorted by date

### Export Functionality
- **CSV Export:** Available for all target types
- **File Naming:** `Sales_{AgentName}_{Month}_{Year}.csv`
- **Data Format:** Includes relevant fields based on target type

---

## API Endpoints Summary

| Endpoint | Method | Purpose | Parameters |
|----------|--------|---------|------------|
| `/api/agents` | GET | Get revenue agents | `targetType=amount`, `limit=10` |
| `/api/promo-codes/agent/{id}/bookings` | GET | Get agent bookings | `startDate`, `endDate`, `limit` |
| `/api/projects` | GET | Get agent projects | `assignedAgent`, `startDate`, `endDate`, `limit` |

## Testing URLs

### Development Server
```
Base URL: http://localhost:3000
```

### Test Commands
```bash
# Get revenue agents
curl "http://localhost:3000/api/agents?targetType=amount&limit=10"

# Get agent bookings (replace {agentId})
curl "http://localhost:3000/api/promo-codes/agent/{agentId}/bookings?startDate=2024-01-01T00:00:00.000Z&endDate=2024-01-31T23:59:59.999Z&limit=1000"

# Get agent projects (replace {agentId})
curl "http://localhost:3000/api/projects?assignedAgent={agentId}&startDate=2024-01-01T00:00:00.000Z&endDate=2024-01-31T23:59:59.999Z&limit=1000"
```

## Database Schema

### Agent Model
```javascript
{
  monthlyTargetType: {
    type: String,
    enum: ['digit', 'amount', 'both', 'none'],
    default: 'none'
  },
  monthlyDigitTarget: Number,    // For digit/both targets
  monthlyAmountTarget: Number,   // For amount/both targets
  targetCurrency: {
    type: String,
    default: 'PKR'
  }
}
```

### Project Model
```javascript
{
  assignedAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent'
  },
  price: Number,
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Delivered', 'Cancelled'],
    default: 'Pending'
  }
}
```

## Performance Metrics

### Real-time Calculations
- **Attendance Rate:** `(presentDays / totalDays) * 100`
- **Sales Progress:** Based on target type (digit/amount/both)
- **Revenue Tracking:** Sum of completed project prices
- **Booking Count:** Number of completed bookings

### Monthly Reporting
- Date range filtering: Start of month to end of month
- Status-based filtering: Only completed/confirmed items
- Currency formatting: PKR with locale-specific formatting

---

## Implementation Notes

1. **Dynamic API Calls:** Agent detail page dynamically chooses which APIs to call based on `monthlyTargetType`
2. **Combined Data:** For 'both' target type, data from bookings and projects APIs is merged and sorted
3. **Progress Visualization:** Progress bar updates in real-time based on current month's performance
4. **Export Flexibility:** CSV export adapts columns and data based on agent target type
5. **Error Handling:** Graceful fallbacks for missing data or API failures

## Future Enhancements

- Real-time progress updates via WebSocket
- Advanced filtering options (by status, date range, amount)
- Performance trend charts
- Automated monthly reports
- Commission calculation based on target achievement</content>
<parameter name="filePath">g:\E transfer\Globium Clouds\GC-Dashboard\AGENT_SALES_SYSTEM.md