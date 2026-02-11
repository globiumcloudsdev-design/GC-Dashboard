# GC - Agent App Master Document (Mobile App Edition)

**Date:** January 29, 2026
**Status:** In Progress 🚧

Bhai, ye rahi aap ki **Complete Master File** jisme **Agent App** (React Native / Mobile) ka sab kuch shamil hai. Concept aur Logic se le kar Development Plan aur Technical API Reference tak, sab kuch aik jagah "Wazih" (Clear) kar diya hai taake Mobile App banana aasaan ho.

---

# 📊 Project Implementation Status (Current Web Logic)

Is section mein wo **Asal Code Logic** hai jo abhi Web Dashboard (`sales/page.jsx`, `salary/page.jsx`) mein chal rahi hai. Mobile App mein bhi **Same Logic** copy karni hai taake data match kare.

## 1. Sales Screen Implementation (`agent/sales/page.jsx`)

Sales page par **Target** calculate karne ka code complex hai kyunke isme Booking aur Projects dono ka data use hota hai.

### **A. Core Data Fetching Logic (Code Snippet)**
Web app mein `fetchSalesData` function ye steps follow karta hai:

```javascript
// 1. Month Dates Calculate karna
const selectedMonthDates = getMonthDates(selectedMonth); // Start & End Date nikalta hai

// 2. Bookings Fetch karna (Digit Target ke liye)
const allBookingsResponse = await agentSalesService.getAgentBookings(agentId, { limit: 1000 });
// Filter by Selected Month
const selectedMonthBookings = allBookings.filter(b => {
   const d = new Date(b.createdAt);
   return d >= selectedMonthDates.start && d <= selectedMonthDates.end;
});
// Filter Completed Results
const selectedMonthCompletedBookings = selectedMonthBookings.filter(b => 
   ['completed', 'approved', 'success'].includes(b.status?.toLowerCase())
);

// 3. Projects Fetch karna (Revenue Target ke liye)
// Note: Yahan direct API call ho rahi hai service ke bajaye
const projectsRes = await fetch(`/api/projects?assignedAgent=${agentId}&limit=1000`);
const projectsData = await projectsRes.json();
// Filter by Date & Status (Completed/Delivered)
const completedProjects = projectsData.filter(p => {
   const d = new Date(p.completedAt || p.updatedAt);
   const isCompleted = ['completed', 'delivered'].includes(p.status?.toLowerCase());
   return isCompleted && d >= selectedMonthDates.start && d <= selectedMonthDates.end;
});
```

### **B. Target Calculation (Target Type Logic)**
Ye logic decide karti hai ke Agent ne target achieve kiya ya nahi.

```javascript
/* Logic from SalesScreen */
const agentTargetType = agent.monthlyTargetType; // 'digit', 'amount', 'both'

let achievedDigits = 0;
let achievedAmount = 0;

if (agentTargetType === 'digit' || agentTargetType === 'both') {
   // Digit walo ke liye sirf Bookings count hoti hain
   achievedDigits = selectedMonthCompletedBookings.length;
}

if (agentTargetType === 'amount' || agentTargetType === 'both') {
   // Amount walo ke liye sirf Projects ka accumulated price count hota hai
   achievedAmount = completedProjects.reduce((sum, p) => {
      return sum + (parseFloat(p.price || p.amount) || 0);
   }, 0);
}
```

### **C. Associated APIs**
| Action | Method | Endpoint | Purpose |
|---|---|---|---|
| **Get Overview** | `GET` | `/promo-codes/agent/{id}/promo-codes/analytics` | Overall stats cards. |
| **Get Bookings** | `GET` | `/promo-codes/agent/{id}/bookings` | Booking list for digit target. |
| **Get Projects** | `GET` | `/api/projects?assignedAgent={id}` | Project list for revenue target. |
| **Get Conversion**| `GET` | `/promo-codes/agent/{id}/conversion-rates` | Visit vs Sale graph. |

---

## 2. Salary Screen Implementation (`agent/salary/page.jsx`)

Salary page par 2 main kaam ho rahe hain: Histroy dekhna aur New Salary Generate karna.

### **A. History Fetching Logic**
User jab page par aata hai toh purani salary slips load hoti hain.

```javascript
// Fetch Payroll History
const fetchPayrolls = async () => {
    const res = await agentPayrollService.getMyPayrolls();
    if (res.success) {
        setPayrolls(res.data);
        // Current month ki slip dhoondna
        const found = res.data.find(p => p.month === selectedMonth && p.year === selectedYear);
        setCurrentPayroll(found || null);
    }
}
```

### **B. Generate Salary Logic**
Agar current month ki salary nahi bani, toh user "Generate" button dabata hai.

```javascript
// Generate Payroll
const handleGenerate = async () => {
    // API Call to Calculate & Save Salary
    const res = await agentPayrollService.generateMyPayroll(selectedMonth, selectedYear);
    if (res.success) {
        toast.success("Salary generated!");
        setCurrentPayroll(res.data); // Update UI immediately
        fetchPayrolls(); // Refresh List
    }
}
```

### **C. Associated APIs**
| Action | Method | Endpoint | Purpose |
|---|---|---|---|
| **Get History** | `GET` | `/payroll/my` | Returns array of past salary slips. |
| **Generate** | `POST` | `/payroll/my/generate` | Payload: `{ month: 3, year: 2025 }`. Backend calculates basic + comm - deductions. |

---

## 3. Dashboard Implementation (`agent/dashboard/page.jsx`)

Dashboard par **Attendance** aur **Location** ka main role hai.

### **A. Location & Attendance Logic**
```javascript
// Check Location Distance
const checkLocation = async () => {
   const currentLoc = await getCurrentLocation(); // Browser/Device GPS
   const dist = getDistance(currentLoc, officeLocation); // Haversine Formula
   
   if (dist <= checkRadius) {
       setIsAtOffice(true); // Allow Check-in
   } else {
       setIsAtOffice(false); // Show "Too Far" error
   }
}

// Check Today's Status
const loadTodayStatus = async () => {
   const today = await agentAttendanceService.getTodayStatus();
   if (today) {
       setTodayAttendance(today); // Show Check-out button
   }
}
```

### **B. Associated APIs**
| Action | Method | Endpoint | Purpose |
|---|---|---|---|
| **Today Status** | `GET` | `/attendance/today` | Check if checked-in today. |
| **Check In** | `POST` | `/attendance/checkin` | Payload: `{ latitude, longitude, address }`. |
| **Check Out** | `POST` | `/attendance/checkout` | Payload: `{ latitude, longitude }`. |

---

# 📚 Table of Contents
1.  **Phase 1: Concept & Logic** (Mobile App Frontend Logic)
2.  **Phase 2: Development Roadmap** (Features, App Structure aur Mobile Specifics)
3.  **Phase 3: Technical API Reference** (Function/Endpoint mapping & Storage)

---

# 🚀 Phase 1: Concept & Logic (Frontend Logic)
*Yahan bataya gaya hai ke har screen par data kaise aa raha hai aur kya logic hai.*

## 1. Dashboard Logic
*   **Checking Logic:** Sab se pehle device location check hoti hai (`expo-location` ya `react-native-geolocation-service`). Agar Agent office ke radius (e.g., 200m) ke andar hai toh `IsAtOffice` true hota hai.
*   **Stats Logic:** API call `await api.get(...)` ke baad data `useState` mein set hota hai.

## 2. Sales & Targets Logic (Visual & Functional Breakdown)
Yahan **Target Type** ke hisaab se puri Screen aur Calculation badal jayegi:

### **Scenario A: 'Digit' Agents (Bookings Only)**
*   **Kiya Dikhega (UI):**
    *   Sirf **1 Circular Progress/Bar** hogi: "Bookings Achieved / Target".
    *   **Card:** "Total Bookings" count show karega.
    *   **Graph:** Line Chart showing daily bookings count.
*   **Backend Logic:**
    *   Check: `agent.monthlyTargetType === 'digit'`
    *   Data: Call `getAgentBookings(id)`
    *   Logic: Filter bookings where `status === 'completed'`.
    *   *Note:* Amount ya Revenue ka zikar kahin nahi hoga is screen par.

### **Scenario B: 'Amount' Agents (Revenue Only)**
*   **Kiya Dikhega (UI):**
    *   Sirf **1 Circular Progress/Bar** hogi: "Revenue Generated / Amount Target".
    *   Currency show hogi (e.g., "PKR 500,000 / 1,000,000").
    *   **Card:** "Total Projects Value".
    *   **List:** Recent Sales mein "Projects" dikhenge (Bookings nahi).
*   **Backend Logic:**
    *   ⚠️ **CRITICAL:** Amount Target ke liye **Bookings** count nahi hoti! **Projects** count hote hain.
    *   Check: `agent.monthlyTargetType === 'amount'`
    *   Data: Call `getProjects({ assignedAgent: id })` (Endpoint: `/api/projects`)
    *   Logic: Filter projects where `status === 'completed'`.
    *   Calculation: `Sum(project.price)` of completed projects.

### **Scenario C: 'Both' Agents (Hybrid)**
*   **Kiya Dikhega (UI):**
    *   **2 Alag Progress Bars** hongi (Side-by-side ya Stacked).
        1.  **Digit Target:** "Bookings Done" (Calculated from `getAgentBookings`)
        2.  **Amount Target:** "Revenue Earned" (Calculated from `getProjects`)
    *   **Incentive Status:** User ko incentive tab milega jab **DONO** bar 100% hongi.
*   **Backend Logic:**
    *   Check: `agent.monthlyTargetType === 'both'`
    *   Data: API calls `getAgentBookings` AND `getProjects` (Parallel calls).
    *   Display: Dono data sets ko merge karke dikhana hoga.

## 3. Attendance Logic
*   **Check-In Process:**
    1.  User button press karega.
    2.  App permission check karegi (`Location.requestForegroundPermissionsAsync()`).
    3.  `getCurrentPositionAsync` se lat/lng milegi.
    4.  Distance calculate hoga formula se.
    5.  `Distance <= Radius` hone par API call jayegi.

## 4. Salary Logic
*   **History:** `Dropdown` (ya Mobile Picker) se Month select hoga.
*   **Generate:** Button press par `Alert.alert` confirm karega, phir generate API call hogi.

---

# 📱 Phase 2: Development Roadmap (Mobile App Structure)

## 1. Stack & Navigation (`React Navigation`)
We will use **Bottom Tab Navigator** for main screens and **Stack Navigator** for Auth/Details.

1.  **Auth Stack:** Login Screen.
2.  **Main Tab Navigator:**
    *   🏠 **Home:** Dashboard.
    *   📊 **Sales:** Performance Graphs.
    *   🕒 **Attendance:** Check-in/History.
    *   💰 **Salary:** Pay Slips.
    *   👤 **Profile:** Settings & Edit.
3.  **Conditional Tab/Screen:**
    *   📂 **Upload Sales:** ⚠️ **Logic:** `if (agent.monthlyTargetType === 'amount' || 'both')` tabhi ye tab/screen access hogi.

## 2. Storage & State Management
*   **Web mein:** `localStorage` use hota tha.
*   **Mobile App mein:** **`AsyncStorage`** use hoga.
    *   Token Save: `await AsyncStorage.setItem('agentToken', token)`
    *   Agent Data: `await AsyncStorage.setItem('agentData', JSON.stringify(agent))`
    *   Logout: `await AsyncStorage.multiRemove(['agentToken', 'agentData'])`

## 3. New Features Implementation

### **A. Upload Sales / Projects Screen**
*   **Components:** `TextInput` fields for Project Name, Amount.
*   **Features:**
    *   List view (`FlatList`) showing current projects.
    *   Floating Action Button (FAB) to add new project.

### **B. Profile Photo Upload (Implementation Step)**
*   **Library:** `expo-image-picker`
*   **API Strategy:** **Use Same Update API** (`PUT /agents/profile`)
*   **Step-by-Step Logic:**
    1.  User taps "Change Photo".
    2.  `ImagePicker` opens -> User selects Photo.
    3.  **Upload:** Photo pehle File Upload API par jayegi (e.g. `/upload`).
    4.  **Get URL:** Server URL return karega (e.g. `https://cloud.com/img.jpg`).
    5.  **Save:** Ye URL wapis `PUT /agents/profile` mein bhejna hai `profilePicture` key ke sath.
    *   *Note:* Profile Edit aur Photo Upload same `updateProfile` function se handle honge.

### **C. Mobile Specifics (Permissions)**
*   **Permissions:** `app.json` ya `AndroidManifest.xml` mein permissions add karni hongi:
    *   `ACCESS_FINE_LOCATION` (Attendance)
    *   `CAMERA` / `READ_EXTERNAL_STORAGE` (Profile Photo)

---

# 🔧 Phase 3: Technical API Reference (Developers)
*Note: Use `axios` with an interceptor to insert Token from `AsyncStorage`.*

## 🔐 1. Authentication & Profile
**Service:** `agentService.js`

| Feature | Function Name | Method | Endpoint | Description |
|---|---|---|---|---|
| **Login** | `login(id, pass)` | `POST` | `/agents/login` | Save token in `AsyncStorage`. |
| **Get Profile** | `getProfile()` | `GET` | `/agents/profile` | Read token from storage first. |
| **Update Profile** | `updateProfile(data)` | `PUT` | `/agents/profile` | **Photo Upload** yahan handle hogi. |

## 📍 2. Dashboard & Home
**Service:** `agentService.js`, `agentAttendenceService.js`

| Feature | Function Name | Method | Endpoint | Description |
|---|---|---|---|---|
| **Stats Data** | `getDashboardData()` | `GET` | `/agents/dashboard` | Main cards data. |
| **Today Status** | `getTodayStatus()` | `GET` | `/attendance/today` | Check-in status check. |
| **Get Shifts** | `getAgentShifts()` | `GET` | `/agents/shifts` | Shift timings. |

## ⏱ 3. Attendance System
**Service:** `agentAttendenceService.js`

| Feature | Function Name | Method | Endpoint | Description |
|---|---|---|---|---|
| **Check In** | `checkIn({lat, lng})` | `POST` | `/attendance/checkin` | Subah ki hazri. |
| **Check Out** | `checkOut({lat, lng})` | `POST` | `/attendance/checkout` | Shaam ki chutti. |
| **Monthly Logs**| `getMonthlySummary(m, y)`| `GET` | `/attendance/my` | `FlatList` data source. |

## 💰 4. Sales & Projects (Target System)
**Service:** `agentSalesService.js`, `projectService.js`

### A. General Sales (Digits)
| Feature | Function Name | Method | Endpoint | Description |
|---|---|---|---|---|
| **Sales Overview**| `getAgentSalesOverview(id)`| `GET` | `/promo-codes/agent/{id}/...`| Main Graphs Data. |
| **Booking List** | `getAgentBookings(id)` | `GET` | `/promo-codes/agent/{id}/bookings` | List of booked clients. |

### B. Project Uploads (Revenue Agents Only) ⚠️
| Feature | Function Name | Method | Endpoint | Description |
|---|---|---|---|---|
| **List Projects** | `getProjects(options)` | `GET` | `/api/projects` | **IMP:** Filter `?assignedAgent={myId}` & `limit=1000`. |
| **Add Project** | `createProject(data)` | `POST` | `/api/projects` | **Modal Form** submit. |
| **Update Project**| `updateProject(id, data)` | `PUT` | `/api/projects/{id}` | Status change logic. |
| **Upload Image** | `uploadImages(files)` | `POST` | `/api/projects/upload` | Payment proof upload. |

## 🔔 6. Notifications
**Service:** `agentNotificationService.js`

| Feature | Function Name | Method | Endpoint | Description |
|---|---|---|---|---|
| **Get Notifs** | `fetchNotificationsForAgent`| `GET` | `/notifications` | RefreshControl pull-to-refresh. |
| **Read** | `markAsRead(id)` | `PATCH` | `/notifications/{id}/read`| Detail open karne par. |

---

### 📝 Final Developer Note (React Native)
Bhai, code karte waqt dhyan rakhna:
1.  **Axios Interceptor:** Token `AsyncStorage` se nikalna padega, jo asynchronous operation hai. Isliye interceptor `async` hona chahiye.
    ```javascript
    api.interceptors.request.use(async (config) => {
      const token = await AsyncStorage.getItem('agentToken');
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    ```
2.  **Navigation:** `agentData` ko `useContext` ya `Redux` mein rakhna taake pore app mein pata ho ke ye "Revenue" agent hai ya "Digit" agent.

Ye document follow karoge toh Mobile App development ekdum smooth hogi! 🚀
