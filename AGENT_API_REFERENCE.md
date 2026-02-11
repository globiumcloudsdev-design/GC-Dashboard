# Agent Dashboard API Reference & Functions Documentation (Roman Urdu)

Bhai, ye rahi wo file jisme Agent Dashboard mein use hone wale saare **API Functions**, **Endpoints**, aur **Service Files** ki detail hai.

Is list se aapko exactly pata chal jayega ke frontend konsa function call kar raha hai aur wo backend ke kis URL par request bhej raha hai.

---

## 🔍 Overview
Frontend mein humne `src/services` folder mein alag alag files banayi hain taake code clean rahe. Har service file backend se baat karti hai using `axios` (`api` instance).

---

## 1. Attendance Service (Hazri System)
**File Path:** `src/services/agentAttendenceService.js`
Ye service Agent ki check-in, check-out aur history handle karti hai.

| Function Name | HTTP Method | API Endpoint | Description (Kya karta hai?) |
|---|---|---|---|
| `checkIn(data)` | `POST` | `/attendance/checkin` | Subah aate waqt check-in mark karta hai. `lat`, `lng` bhejna zaroori hai. |
| `checkOut(data)` | `POST` | `/attendance/checkout` | Shaam ko check-out mark karta hai. |
| `getTodayStatus()` | `GET` | `/attendance/today` | Check karta hai ke aaj current agent ne check-in kiya hai ya nahi. (Local storage se bhi check karta hai). |
| `getMonthlySummary(m, y)` | `GET` | `/attendance/my?month=X&year=Y` | Poore month ki attendance history laata hai (Present, Absent, Late counts). |
| `getAttendanceHistory()` | `GET` | `/attendance/my?limit=50` | Recent attendance records ki list laata hai table ke liye. |

---

## 2. Sales Service (Target & Performance)
**File Path:** `src/services/agentSalesService.js`
Ye sab se important service hai jo targets, commission aur sales data laati hai.

| Function Name | HTTP Method | API Endpoint | Description |
|---|---|---|---|
| `getAgentSalesOverview(id)` | `GET` | `/promo-codes/agent/{id}/promo-codes/analytics` | Agent ka main dashboard data (Total Sales, Revenue, Active Promo Codes). |
| `getAgentBookings(id)` | `GET` | `/promo-codes/agent/{id}/bookings` | Agent ke through ki gayi saari bookings ki list laata hai. **Digit Target** yahan se calculate hota hai. |
| `getAgentConversionRates(id)` | `GET` | `/promo-codes/agent/{id}/conversion-rates` | Visit vs Sales ka ratio check karne ke liye. |
| `getAgentBookingStats(id)` | `GET` | `/promo-codes/agent/{id}/booking-stats` | Completed vs Cancelled vs Pending bookings ka count. |
| `getAgentMonthlyStats(id)` | `GET` | `/promo-codes/agent/{id}/monthly-stats` | Specific month ki performance report. |

---

## 3. Payroll Service (Salary)
**File Path:** `src/services/agentPayrollService.js`
Ye service salary slips generate aur view karne ke liye hai.

| Function Name | HTTP Method | API Endpoint | Description |
|---|---|---|---|
| `getMyPayrolls()` | `GET` | `/payroll/my` | Purani saari salary slips ki history laata hai. |
| `generateMyPayroll(m, y)` | `POST` | `/payroll/my/generate` | Kisi specific month ki salary generate karta hai agar pehle nahi bani. |
| `getPayrollById(id)` | `GET` | `/payroll/my/{id}` | Kisi aik salary slip ki poori details (breakdown) laata hai. |

---

## 4. Project Service (Projects Revenue)
**File Path:** `src/services/projectService.js`
Ye service wahan use hoti hai jahan Agent ka target **Amount** (Revenue) based ho.

| Function Name | HTTP Method | API Endpoint | Description |
|---|---|---|---|
| `getProjects(options)` | `GET` | `/projects` | System ke saare projects laata hai. Frontend pe `assignedAgent` se filter lagta hai. |
| `createProject(data)` | `POST` | `/projects` | Naya project add karne ke liye. |
| `updateProject(id, data)` | `PUT` | `/projects/{projectId}` | Project ki details edit karne ke liye. |
| `toggleStatus(id)` | `PATCH` | `/projects/{id}/status` | Project complete mark karne ke liye (Status update). |

---

## 5. Notification Service
**File Path:** `src/services/agentNotificationService.js`

| Function Name | HTTP Method | API Endpoint | Description |
|---|---|---|---|
| `fetchNotificationsForAgent(id)` | `GET` | `/notifications?agentId={id}` | Agent ke liye specific notifications laata hai. |
| `markAsRead(id)` | `PATCH` | `/notifications/{id}/read` | Notification ko "Read" mark karta hai taake badge chala jaye. |

---

### 📝 Note for Developer (Aapke liye)
*   **Target Calculation Note:** Sales page par jo `Target Progress` hai, wo **Sales Service** (`getAgentBookings`) aur **Project Service** (`getProjects`) dono ka data mix karke calculate hoti hai.
    *   Booking = 1 Count (Digit Target)
    *   Project Cost = Amount (Amount Target)
*   **Authentication:** Saari requests mein `Authorization: Bearer <token>` header khud ba khud `src/lib/api.js` interceptor ke through lag jata hai. Apko alag se token bhejne ki zaroorat nahi hoti functions mein.

Bhai yeh file `AGENT_API_REFERENCE.md` ke naam se root folder mein hai.
