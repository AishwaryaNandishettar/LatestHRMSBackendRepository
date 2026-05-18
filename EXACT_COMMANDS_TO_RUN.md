# Exact Commands to Run - Manager Fix Testing

## 🎯 Step-by-Step Instructions

### Step 1: Stop Old Backend (if running)

**In the terminal where backend is running:**
```
Press Ctrl+C
```

Wait for the process to stop completely.

---

### Step 2: Start Fresh Backend

**Open a new terminal and run:**

```bash
cd HRMS-Backend
mvn spring-boot:run
```

**Wait for this message to appear:**
```
Started HmrsBackendApplication in X seconds
```

**Example output:**
```
2026-05-07 20:15:30.123  INFO 12345 --- [main] c.o.h.HmrsBackendApplication : Started HmrsBackendApplication in 15.234 seconds (JVM running for 16.123)
```

---

### Step 3: Clear Browser Cache

**Option A - Using DevTools (Recommended):**
1. Open browser
2. Press `F12` to open DevTools
3. Go to `Application` tab
4. In left sidebar, click `Storage`
5. Click `Clear Site Data` button
6. Refresh the page (F5)

**Option B - Using Browser Menu:**
1. Press `Ctrl+Shift+Delete`
2. Select `All time` from the dropdown
3. Check all boxes
4. Click `Clear data`
5. Refresh the page (F5)

---

### Step 4: Test Manager Login

**URL:** `http://localhost:5173` (or your frontend URL)

**Login Credentials:**
- Email: `Aishmanager@omoi.com`
- Password: `admin123`

**Expected Result:**
- Login successful
- Redirected to Home page
- User info shows: "Aishmanager@omoi.com (manager)"

---

### Step 5: Test Attendance Page (Manager)

**Navigate to:** Attendance page

**Expected Results:**
1. Page loads without errors
2. Table shows records (not empty)
3. Should see:
   - Manager's own check-in records
   - adhviti's check-in records
4. Table columns: EMP ID, Login Date, Emp Name, DEPT, REPORTING MANAGER, CHECK IN, CHECK OUT, etc.

**If empty:**
- Check browser console (F12 → Console tab)
- Look for error messages
- Check backend logs for errors

---

### Step 6: Test Check-In (Manager)

**On Attendance page:**

1. Select today's date in "Select Date" field
2. Click "Check In" button
3. Allow location access when prompted

**Expected Results:**
1. Single popup appears: "Check-in successful"
2. Popup closes automatically
3. Manager's check-in details appear in table
4. Table shows:
   - Check In time
   - Location coordinates
   - Status: "Pending Approval"

**If double popup appears:**
- This means backend wasn't restarted properly
- Stop backend (Ctrl+C)
- Start fresh backend again
- Clear browser cache
- Try again

**If "Check-in failed" appears:**
- Check browser console for error
- Check backend logs
- Verify location permission is granted

---

### Step 7: Test Check-Out (Manager)

**On Attendance page:**

1. Click "Check Out" button
2. Allow location access when prompted

**Expected Results:**
1. Single popup appears: "Check-out successful"
2. Popup closes automatically
3. Manager's check-out time appears in table
4. Table shows:
   - Check Out time
   - Total Hours calculated
   - Location coordinates

---

### Step 8: Test Timesheet Page (Manager)

**Navigate to:** Timesheet page

**Expected Results:**
1. Page loads without errors
2. Table shows records (not empty)
3. Should see:
   - Manager's own timesheet record
   - adhviti's timesheet record
4. Manager's record should have:
   - reportingManager: "-" (dash)
5. adhviti's record should have:
   - reportingManager: "Aishmanager@omoi.com" or manager's name

---

### Step 9: Logout and Test Employee Login

**Click Logout button**

**Login as Employee:**
- Email: `adhviti@omoi.com`
- Password: `adhviti123`

**Expected Result:**
- Login successful
- Redirected to Home page
- User info shows: "adhviti@omoi.com (employee)"

---

### Step 10: Test Attendance Page (Employee)

**Navigate to:** Attendance page

**Expected Results:**
1. Page loads without errors
2. Table shows records
3. Should see:
   - ONLY adhviti's own records
   - Should NOT see manager's records
   - Should NOT see other employees' records

---

### Step 11: Test Timesheet Page (Employee)

**Navigate to:** Timesheet page

**Expected Results:**
1. Page loads without errors
2. Table shows records
3. Should see:
   - ONLY adhviti's own timesheet record
   - Should NOT see manager's record
   - Should NOT see other employees' records

---

### Step 12: Logout and Test Admin Login

**Click Logout button**

**Login as Admin:**
- Email: `admin@omoi.com`
- Password: `admin123`

**Expected Result:**
- Login successful
- Redirected to Home page
- User info shows: "admin@omoi.com (admin)"

---

### Step 13: Test Attendance Page (Admin)

**Navigate to:** Attendance page

**Expected Results:**
1. Page loads without errors
2. Table shows records
3. Should see:
   - Manager's records
   - adhviti's records
   - All other employees' records

---

### Step 14: Test Timesheet Page (Admin)

**Navigate to:** Timesheet page

**Expected Results:**
1. Page loads without errors
2. Table shows records
3. Should see:
   - Manager's timesheet record
   - adhviti's timesheet record
   - All other employees' timesheet records

---

## 🔍 Verification Checklist

### Backend Verification
- [ ] Backend started successfully
- [ ] No errors in backend logs
- [ ] Backend logs show: "Started HmrsBackendApplication in X seconds"

### Manager Tests
- [ ] Manager login successful
- [ ] Attendance page shows manager's own records
- [ ] Attendance page shows adhviti's records
- [ ] Check-in shows single popup (not double)
- [ ] Check-in details appear in table
- [ ] Check-out works correctly
- [ ] Timesheet page shows manager's record
- [ ] Timesheet page shows adhviti's record
- [ ] Manager's reportingManager shows "-"
- [ ] adhviti's reportingManager shows manager's email

### Employee Tests
- [ ] Employee login successful
- [ ] Attendance page shows ONLY own records
- [ ] Attendance page does NOT show manager's records
- [ ] Timesheet page shows ONLY own record
- [ ] Timesheet page does NOT show manager's record

### Admin Tests
- [ ] Admin login successful
- [ ] Attendance page shows ALL records
- [ ] Timesheet page shows ALL records

---

## 🐛 Troubleshooting Commands

### If Backend Won't Start
```bash
# Kill any existing Java process
taskkill /F /IM java.exe

# Then start fresh
cd HRMS-Backend
mvn spring-boot:run
```

### If Backend Compilation Fails
```bash
cd HRMS-Backend
mvn clean compile
```

### If You Need to Rebuild Everything
```bash
cd HRMS-Backend
mvn clean package -DskipTests
mvn spring-boot:run
```

### Check Backend Logs
```bash
# Backend logs are printed in the terminal where mvn spring-boot:run is running
# Look for:
# - "Started HmrsBackendApplication"
# - "🔥 LOGIN RESPONSE: id=..."
# - Any error messages
```

### Check Frontend Logs
```bash
# In browser:
# 1. Press F12 to open DevTools
# 2. Go to Console tab
# 3. Look for:
#    - "🔥 LOGIN RESPONSE: ..."
#    - Any error messages in red
```

---

## 📊 Expected Console Output

### Backend Console (when manager logs in)
```
===== LOGIN DEBUG =====
EMAIL: Aishmanager@omoi.com
RAW PASSWORD: admin123
DB PASSWORD: $2a$10$...
MATCH: true
Password Match: true
🔥 LOGIN RESPONSE: id=507f1f77bcf86cd799439011, empId=MGR-507f1f
```

### Browser Console (when manager logs in)
```
🔥 LOGIN RESPONSE: {
  id: "507f1f77bcf86cd799439011",
  name: "Aishmanager",
  email: "Aishmanager@omoi.com",
  role: "manager",
  token: "eyJhbGc...",
  empId: "MGR-507f1f",
  ...
}
✅ LOGIN SUCCESSFUL - Redirecting to Home
```

---

## ✅ Success Criteria

All of the following must be true:

1. ✅ Backend starts without errors
2. ✅ Manager can login
3. ✅ Manager sees own + team attendance records
4. ✅ Manager check-in shows single popup
5. ✅ Manager check-in details appear in table
6. ✅ Manager sees own + team timesheet records
7. ✅ Employee sees only own records
8. ✅ Admin sees all records

---

## 📝 Report Template

After testing, please report:

```
MANAGER TESTS:
- Attendance page shows records: ✅ / ❌
- Check-in works (single popup): ✅ / ❌
- Check-in details in table: ✅ / ❌
- Timesheet shows own + team: ✅ / ❌

EMPLOYEE TESTS:
- Attendance shows only own: ✅ / ❌
- Timesheet shows only own: ✅ / ❌

ADMIN TESTS:
- Attendance shows all: ✅ / ❌
- Timesheet shows all: ✅ / ❌

ISSUES FOUND:
[List any issues here]
```

---

**Last Updated:** May 7, 2026
**Status:** ✅ Ready for Testing
