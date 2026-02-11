# Agent Dashboard Logic & Data Flow Documentation (Roman Urdu)

Bhai, ye rahi puri detail **GC-Dashboard** ke Agent Panel ke har page ki. Yahan har page ki data retrieval, processing, aur logic explain ki gayi hai jo abhi system mein implement hui hai.

---

## 1. Dashboard (Home Screen)
**Path:** `src/app/(agent)/agent/dashboard/page.jsx`

Ye main landing page hai jahan Agent ko apni current status dikhti hai.

### **API Calls & Services:**
1.  **Attendance Status:** `agentAttendanceService.getTodayStatus()` call hota hai check karne ke liye ke aaj Check-in kiya hai ya nahi.
2.  **Monthly Attendance:** `agentAttendanceService.getMonthlySummary()` call hota hai month ka overview lene ke liye.
3.  **Stats Overview:** `agentSalesService.getAgentSalesOverview(agentId)` aur `getAgentBookings(agentId)` se poora data aata hai.
4.  **Location:** Browser ki Geolocation use karke `officeLocation` se distance calculate hota hai using `utils/locationUtils`.

### **Logic & Conditions:**
*   **Checking Logic:** Sab se pehle location check hoti hai. Agar Agent office ke radius (e.g., 200m) ke andar hai toh `IsAtOffice` true hota hai aur Check-in ka button enable hota hai. Agar accuracy kam hai toh error aata hai.
*   **Stats Logic:**
    *   **Total Bookings:** API se mili saari bookings ko filter kiya jata hai current month ke liye.
    *   **Achieved Sales:** Current month ki wo bookings jo `completed` status mein hain.
    *   **Monthly Target:** Agent ke profile se `monthlyTarget` field uthaya jata hai.

---

## 2. Sales Screen (Performance) ✅ **[Important]**
**Path:** `src/app/(agent)/agent/sales/page.jsx`

Ye page sab se complex hai kyun ke yahan **Target Type** (Digit, Amount, Both, None) ke hisaab se calculations change hoti hain.

### **Conditions & Target Logic:**
System check karta hai ke Agent ka `monthlyTargetType` kya set hai Database mein.

*   **Agar `Target Type = 'digit' or 'both'`:**
    *   **Data Source:** Sirf `Bookings` count hongi.
    *   **Condition:** `selectedMonthCompletedBookings.length`.
    *   Matlab jitni bookings complete, utna target achieve.

*   **Agar `Target Type = 'amount'`:**
    *   **Data Source:** Sirf **Projects** count honge. Bookings ignore hongi revenue ke liye.
    *   **Condition:** System `/api/projects` call karta hai, phir filter karta hai wo projects jo 'completed' ya 'delivered' hain.
    *   **Calculation:** Un projects ki `price` ya `amount` ko sum kiya jata hai.

*   **Agar `Target Type = 'both'` (Hybrid):**
    *   **Digit Target:** Ye **Bookings** se count hoga.
    *   **Amount Target:** Ye **Projects** ki revenue se count hoga.
    *   Is case mein Agent ko dono poore karne padte hain.

### **Data Flow:**
1.  **Fetch Sales:** `agentSalesService.getAgentBookings` se saari bookings aati hain. Frontend unhein date ke hisaab se filter karta hai.
2.  **Fetch Projects:** Explicitly `/api/projects` fetch kiya jata hai taake revenue calculate ho sake (kyunki bookings mein revenue field nahi hoti aksar, wo fixed counting hoti hai).
3.  **Recent Activity:** Bookings aur Projects dono ki list ko merge karke date sort karke "Recent Activity" mein dikhaya jata hai.

---

## 3. Attendance Screen
**Path:** `src/app/(agent)/agent/attendance/page.jsx`

### **Logic:**
*   **Check-In:**
    *   User jab button dabata hai, pehle browser location lata hai (`navigator.geolocation`).
    *   Condition: `Distance <= Radius` AND `Accuracy < Threshold` (1000m).
    *   Agar sab theek hai toh `agentAttendanceService.checkIn()` call hoti hai.
*   **Check-Out:**
    *   Check-out sirf tab ho sakta hai agar Check-in already exist karta ho aur Check-out time null ho.
*   **Leaves:** Leaves ka data `loadTodayLeave` aur active leaves ki API call se aata hai. Check-in disable hojata hai agar aaj leave approved hai.

---

## 4. Salary Screen
**Path:** `src/app/(agent)/agent/salary/page.jsx`

### **Logic:**
*   **History:** Page load hone par `agentPayrollService.getMyPayrolls()` call hota hai jo purani saari salary slips laata hai.
*   **Generate Salary:**
    *   User Month aur Year select karta hai.
    *   Button click par `agentPayrollService.generateMyPayroll(month, year)` call hoti hai.
    *   Backend pe salary calculate hoti hai (Basic + Allowances + Commission based on Target Achievements jo Sales screen pe dekha humne).

---

## 5. Projects Screen
**Path:** `src/app/(agent)/agent/projects/page.jsx`

### **Logic:**
*   **Fetching:** `projectService.getProjects()` call karke saare projects laye jate hain.
*   **Filtering:** Phir frontend pe filter lagta hai: `p.assignedAgent === agent.id`. Sirf wo projects dikhte hain jo is agent ko assign huye hain.
*   **Creation:** Agent khud bhi project create kar sakta hai using `projectService.createProject`.

---

## 6. Notification & Profile
**Paths:** `.../agent/notification/page.jsx`, `.../agent/profile/page.jsx`

*   **Notification:** Simple list fetch hoti hai, unread ko highlight kiya jata hai. Read karne par state update hoti hai.
*   **Profile:** Agent apni details (Name, Phone, etc.) edit kar sakta hai jo Context aur Database dono mein update hoti hain.

---

### **Summary Table**

| Page | Primary Data/API | Key Constraint |
|Data Type| Logic Used |
|---|---|---|
| **Dashboard** | Attendance, Overview Stats | Current Month Filtering |
| **Sales** | Bookings + Projects | Target Type ('digit', 'amount', 'both') determines success |
| **Attendance** | Check-in/Out, Leaves | Geofencing (Radius Check) |
| **Salary** | Payrolls History | On-demand Generation Logic |
| **Projects** | Projects List | Client-side filtering by Agent ID |

Bhai agar is mein koi specific API ka response structure chahiye ya backend logic deep mein chahiye toh batao, mein wo bhi dug out kar ke bata dunga. Abhi ye frontend pe jo ho raha hai wo explain kiya hai.
