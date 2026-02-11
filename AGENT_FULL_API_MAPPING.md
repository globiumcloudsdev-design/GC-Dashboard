# GC - Agent App Full API & Function Mapping

Bhai, ye rahi aapki **Full Agent App** ki API Mapping file. Isme har wo function shamil hai jo Agent ki app mein use ho raha hai ya hoga.

Developers ko sirf ye file dekhni hai taake unhein pata chale ke konsa service function call karna hai aur backend pe data kahan ja raha hai.

---

## 🔐 1. Authentication & Profile (Login System)
**Primary Service:** `agentService.js` (or `agentAuthService.js` in some contexts)

| Feature | Function Name | Method | API Endpoint | Description |
|---|---|---|---|---|
| **Login** | `login(agentId, password)` | `POST` | `/agents/login` | Login kar ke Token aur Agent Data return karta hai. |
| **Get Profile** | `getProfile()` | `GET` | `/agents/profile` | Current logged-in Agent ki details (Name, ID, Photo) laata hai. |
| **Update Profile** | `updateProfile(data)` | `PUT` | `/agents/profile` | Phone, Address, City waghera update karne ke liye. **Photo Upload** yahan handle hogi. |
| **Change Password** | `changePassword(old, new)` | `PUT` | `/agents/change-password` | Password badalne ke liye. |
| **Forgot Pass** | `forgotPassword(email)` | `POST` | `/agents/forgot-password` | Reset link email par bhejta hai. |
| **Reset Pass** | `resetPassword(token, pass)` | `POST` | `/agents/reset-password` | Token confirm hone par naya password set karta hai. |
| **Check Auth** | `isAuthenticated()` | - | - | Local check: Token expired hai ya nahi. |

---

## 📍 2. Dashboard & Home
**Services:** `agentService.js`, `agentAttendenceService.js`

| Feature | Function Name | Method | API Endpoint | Description |
|---|---|---|---|---|
| **Stats Overview** | `getDashboardData()` | `GET` | `/agents/dashboard` | Main screen ke cards (Total Sales, Revenue, Attendance Today). |
| **Get Shifts** | `getAgentShifts()` | `GET` | `/agents/shifts` | Agent ki shift timing check karne ke liye. |
| **Today Status** | `getTodayStatus()` | `GET` | `/attendance/today` | Check karta hai ke kya aaj Check-In ho chuka hai? |

---

## ⏱ 3. Attendance System (Hazri)
**Primary Service:** `agentAttendenceService.js`

| Feature | Function Name | Method | API Endpoint | Description |
|---|---|---|---|---|
| **Check In** | `checkIn({ lat, lng })` | `POST` | `/attendance/checkin` | Subah hazri lagane ke liye. Location data bhejta hai. |
| **Check Out** | `checkOut({ lat, lng })` | `POST` | `/attendance/checkout` | Shaam ko chutti mark karne ke liye. |
| **Monthly Logs** | `getMonthlySummary(m, y)` | `GET` | `/attendance/my` | `?month=X&year=Y` query bhej kar poore mahine ka record laata hai. |
| **Attendance List** | `getAttendanceHistory()` | `GET` | `/attendance/my` | Recent 50 hazri records list ke liye. |

---

## 📅 4. Leave Management (Chutti Request)
**Primary Service:** `agentLeaveService.js`

| Feature | Function Name | Method | API Endpoint | Description |
|---|---|---|---|---|
| **Request Leave** | `requestLeave(data)` | `POST` | `/attendance/leave/request` | Apply for leave (Sick/Casual). `reason`, `date` required. |
| **My Leaves** | `getMyLeaves()` | `GET` | `/attendance/leave/request?userType=agent` | Apni bheji hui requests ka status (Pending/Approved) dekhne ke liye. |

---

## 💰 5. Sales & Performance (Targets)
**Services:** `agentSalesService.js`, `projectService.js`

### A. General Sales Data
| Feature | Function Name | Method | API Endpoint | Description |
|---|---|---|---|---|
| **Sales Overview** | `getAgentSalesOverview(id)` | `GET` | `/promo-codes/agent/{id}/...` | Total Sales, Conversion, Graphs ka main data. |
| **Booking List** | `getAgentBookings(id)` | `GET` | `/promo-codes/agent/{id}/bookings` | **Digit Target** walo ke liye booked customers ki list. |
| **Conversion** | `getAgentConversionRates(id)`| `GET` | `/promo-codes/agent/{id}/conversion-rates` | Visit vs Sales percentage of success. |

### B. Project Uploads (For Revenue Agents) ⚠️
| Feature | Function Name | Method | API Endpoint | Description |
|---|---|---|---|---|
| **List Projects** | `getProjects(options)` | `GET` | `/projects` | Filter: `?assignedAgent={myId}` laga kar sirf apne projects laayein. |
| **Add Project** | `createProject(data)` | `POST` | `/projects` | Naya Sales Project enter karne ke liye (Amount Target ke liye). |
| **Update Project** | `updateProject(id, data)` | `PUT` | `/projects/{id}` | Status update ("Completed") ya details change karne ke liye. |
| **Upload Image** | `uploadImages(files)` | `POST` | `/projects/upload` | Project ka screenshot/proof lagane ke liye. |

---

## 💸 6. Payroll (Salary Slip)
**Primary Service:** `agentPayrollService.js`

| Feature | Function Name | Method | API Endpoint | Description |
|---|---|---|---|---|
| **View History** | `getMyPayrolls()` | `GET` | `/payroll/my` | Pichle mahino ki salary slips ki list. |
| **Generate** | `generateMyPayroll(m, y)` | `POST` | `/payroll/my/generate` | Agar salary generate nahi hui toh yahan se request hoti hai. |
| **View Detail** | `getPayrollById(id)` | `GET` | `/payroll/my/{id}` | Salary ka detailed breakdown (Allowances + Deductions). |

---

## 🔔 7. Notifications
**Primary Service:** `agentNotificationService.js`

| Feature | Function Name | Method | API Endpoint | Description |
|---|---|---|---|---|
| **Get My Notifs** | `fetchNotificationsForAgent(id)` | `GET` | `/notifications?agentId={id}` | Agent ke alerts (Salary Done, Leave Approved etc.). |
| **Mark Read** | `markAsRead(id)` | `PATCH` | `/notifications/{id}/read` | Badge hatane ke liye. |

---

### Key Notes for Development:
1.  **Token:** Sab requests mein `Authorization: Bearer Token` header automatic lagna chahiye (Interceptor ke through).
2.  **Image Upload:** Pehle `projectService.uploadImages` call hoga -> URL milega -> Phir wo URL `createProject` ya `updateProfile` mein bhejenge.
3.  **Target Logic:** Frontend par check karein:
    *   Agar `targetType === 'digit'` -> Use `getAgentBookings`.
    *   Agar `targetType === 'amount'` -> Use `getProjects` + `createProject`.

Bhai ye full mapping file (`AGENT_FULL_API_MAPPING.md`) root folder mein ready hai! 🚀
