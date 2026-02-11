# GC - Agent App Development Plan (Full Roadmap)

Bhai, ye raha poora **Master Plan** ap ki **Agent App** ke liye. Is plan mein wo saari cheezein shamil hain jo abhi tak hum discuss kar chuke hain, plus jo **New Features** (Jaise Profile Photo, Revenue Page) add karne hain.

Ye document developer ke liye aik "Blue-print" hai ke App kaise kaam karegi.

---

## 📱 1. App Structure & Navigation (Dynamic Menu)

App ka menu static nahi hoga, ye **Agent ke Type** ke hisaab se change hoga.

### **Menu Items Logic:**
1.  **Dashboard:** (Sab ke liye)
2.  **Attendance:** (Sab ke liye)
3.  **Sales Performance:** (Sab ke liye - lekin data andar different hoga)
4.  **Upload Sales (Projects):** ⚠️ **Condition:** Sirf un Agents ko dikhega jinka Target Type **'Revenue'** ya **'Both'** hai.
    *   *Logic:* `if (agent.monthlyTargetType === 'amount' || agent.monthlyTargetType === 'both') { Show Upload Sales }`
5.  **Salary:** (Sab ke liye)
6.  **Profile:** (Sab ke liye) - **New: Photo Upload**

---

## 🛠 2. Modules & Features Detail

### **A. Authentication (Login)**
*   **Input:** Agent ID (e.g., AB1234) or Email + Password.
*   **Action:** Login par API se Agent ka poora object (`agent`) milega.
*   **Storage:** Token aur Agent Data ko Local Storage mein save karna hai taake baar baar login na karna pade.
*   **Check:** Login hote hi check karna hai ke `monthlyTargetType` kya hai, usi hisaab se UI set karni hai.

### **B. Dashboard (Home Screen)**
*   **Header:** Agent ka Naam aur **Profile Photo** (New Feature).
*   **Quick Actions:** Check-in Button (Agar subah hai), Check-out (Agar shaam hai).
*   **Cards:** 
    *   Today's Status (Present/Absent).
    *   Monthly Progress (Target vs Achieved).
*   **Recent Activity:** Last 5 bookings ya projects ki list.

### **C. Attendance System (Geo-Fencing)**
*   **Process:**
    1.  User "Check-in" dabayega.
    2.  App GPS Location legi (`navigator.geolocation`).
    3.  Distance calculate hoga Office Location se.
    4.  Agar `Distance <= Permitted Radius` -> API Call `/attendance/checkin`.
    5.  Agar `Distance > Permitted Radius` -> Error: "You are too far from office".

### **D. Sales Performance (Target Logic)**
Yahan logic complex hai, dhyan dena hai:
*   **Digit Agents:** Inko sirf Graph dikhega ke "Kitni Bookings huin". Revenue chupa dena hai.
*   **Revenue Agents:** Inko dikhega "Kitna Amount jama hua" Projects se.
*   **Both:** Inko 2 Progress Bars dikhengi. 1. Bookings Count, 2. Revenue Amount.

### **E. Upload Sales / Projects (⚠️ Only for Revenue/Both Agents)**
Ye wo naya page hai jo aap ne manga hai.
*   **Purpose:** Revenue wale agents apni "Badi Sales" (Projects) yahan upload karenge taake wo unke Target mein count hon.
*   **Features:**
    *   **Add Project:** Form (Client Name, Title, **Amount/Price**, Deadline).
    *   **My Projects List:** Agent ke apne projects ki list.
    *   **Status Update:** Agent project ko "Completed" mark kar sakega jab client paise de de.
*   **API:** `POST /projects` (Create), `GET /projects?assignedAgent=ME` (List).

### **F. Profile & Settings (📸 New Feature: Photo Upload)**
Abhi tak sirf text edit ho raha tha, ab hum image bhi add karenge.
*   **View:** Agent ki details (Name, ID, Phone, Address).
*   **Edit Mode:**
    *   Fields: Phone, Address, City update karne ki ijazat.
    *   **Photo Upload:** 
        *   User gallery se photo select karega.
        *   Photo pehle Cloudinary/Server par upload hogi.
        *   Wahan se URL milega jo Agent ki Profile mein save hoga (`avatar` or `profilePicture` field).
*   **Logic:**
    ```javascript
    // Update Profile Function
    const handleUpdate = async () => {
       const payload = { ...textData };
       if (newImageFile) {
          const uploadRes = await uploadService.upload(newImageFile);
          payload.profilePicture = uploadRes.url;
       }
       await agentService.updateProfile(payload);
    }
    ```

### **G. Salary Module**
*   **History:** Dropdown se Month/Year select karke purani slip dekhna.
*   **Generate:** Agar current month khatam hogaya hai toh "Generate Salary" ka button.
*   **View:** Basic Salary + Commission (calculated from Sales module) = Final Payout.

---

## 🚀 3. Implementation Checklist (Devs ke liye)

### **Legacy vs New Features**
| Feature | Status | Action Required |
|---|---|---|
| **Login/Auth** | ✅ Ready | Token refresh logic verify karein. |
| **Attendance** | ✅ Ready | GPS accuracy check karein. |
| **Sales Graphs** | ⚠️ Updates Needed | Target Type ke hisaab se Graph change karna hai. |
| **Project Upload** | ❌ New Page | Naya form banana hai sirf Revenue agents ke liye. |
| **Profile Photo** | ❌ New Feature | Image Picker + Upload API integrate karni hai. |

### **API Requirements (Backend Check)**
*   Ensure `PUT /agent/profile` endpoint accepts `profilePicture` URL.
*   Ensure `GET /projects` filters correctly by `assignedAgent`.

---

## 🏁 4. Mobile App Specifics (Agar React Native / App hai)
Agar ye web-view nahi balke proper Mobile App hai:
*   **Camera Permission:** Profile photo aur Documents upload ke liye maangni padegi.
*   **Location Permission:** Attendance ke liye "While Using App" permission zaroori hai.
*   **Notifications:** Push notifications integrate karein jab:
    *   Salary generate ho.
    *   Check-in successful ho.
    *   Project status change ho.

Bhai ye plan follow karein toh App perfect banegi aur Agent Types ka masla bhi hal ho jayega!
