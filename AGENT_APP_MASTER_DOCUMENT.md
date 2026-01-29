# GC - Agent App Master Document (Mobile App Edition)

Bhai, ye rahi aap ki **Complete Master File** jisme **Agent App** (React Native / Mobile) ka sab kuch shamil hai. Concept aur Logic se le kar Development Plan aur Technical API Reference tak, sab kuch aik jagah "Wazih" (Clear) kar diya hai taake Mobile App banana aasaan ho.

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

## 2. Sales & Targets Logic (Target Types)
Yahan **Target Type** (Digit, Amount, Both, None) ke hisaab se logic change hoti hai:

*   **Logic A: 'Digit' Agents**
    *   **Goal:** Number of Sales.
    *   **Data Source:** Sirf **Bookings** count hongi.
    *   **Success:** `Completed Bookings Count >= Monthly Digit Target`.

*   **Logic B: 'Amount' Agents (Revenue)**
    *   **Goal:** Total Revenue Generated.
    *   **Data Source:** Sirf **Projects** count honge.
    *   **Condition:** `API /projects` se wo projects fetch honge jo 'completed' hain.
    *   **Success:** `Sum(Project Price) >= Monthly Amount Target`.

*   **Logic C: 'Both' Agents (Hybrid)**
    *   **Goal:** Dono targets (Bookings aur Projects) meet karne hain.

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

### **B. Profile Photo Upload**
*   **Library:** `expo-image-picker` or `react-native-image-picker`.
*   **Logic:**
    1.  User taps "Change Photo".
    2.  `ImagePicker.launchImageLibraryAsync()` opens gallery.
    3.  Selected image converts to `FormData`.
    4.  Upload API call -> Get URL -> Save to Profile.

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
| **Booking List** | `getAgentBookings(id)` | `GET` | `/promo-codes/agent/{id}/...` | List of booked clients. |

### B. Project Uploads (Revenue Agents Only) ⚠️
| Feature | Function Name | Method | Endpoint | Description |
|---|---|---|---|---|
| **List Projects** | `getProjects(options)` | `GET` | `/projects` | Filter: `?assignedAgent={myId}` |
| **Add Project** | `createProject(data)` | `POST` | `/projects` | **Modal Form** submit. |
| **Update Project**| `updateProject(id, data)` | `PUT` | `/projects/{id}` | Status change logic. |
| **Upload Image** | `uploadImages(files)` | `POST` | `/projects/upload` | Payment proof upload. |

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
