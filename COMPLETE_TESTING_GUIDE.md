# Complete Testing Guide - Manager Attendance & Timesheet Fix

## 🎯 Testing Objective
Test that manager (Aishmanager@omoi.com) can see their own + team members' attendance and timesheet data.

---

## ⚠️ IMPORTANT: Backend Restart Required

### Step 1: Rebuild Backend (MUST DO)
```bash
cd e:\HRMSProject\HRMS-Backend
mvn clean compile
mvn package -DskipTests
```

**Why?** The code changes need to be compiled and packaged.

### Step 2: Stop Old Backend Server
- If backend is running, stop it
- Kill any Java processes on port 8080

### Step 3: Start Fresh Backend Server
```bash
cd e:\HRMSProject\HRMS-Backend
mvn spring-boot:run
```

**Wait for:** "Started HmrsBackendApplication in X seconds"

### Step 4: Frontend - Clear Cache & Refresh
```bash
# In browser:
1. Press Ctrl+Shift+Delete (Clear browsing data)
2. Select "All time"
3. Check "Cookies and other site data"
4. Check "Cached images and files"
5. Click "Clear data"
6. Refresh page (Ctrl+R or F5)
```

---

## 📊 Database Preparation

### Option A: Keep Existing Data (Recommended for First Test)
**No action needed** - Use existing users and attendance records

### Option B: Clean Start (If Issues Occur)
Delete old attendance records:
```javascript
// In MongoDB Compass or mongosh:
use hrms_db
db.attendance.deleteMany({})
```

**Do NOT delete users** - We need them for testing

---

## 👥 Test Users Setup

### Verify These Users Exist in Database

**Manager:**
```javascript
{
  email: "Aishmanager@omoi.com",
  name: "Aishmanager",
  employeeId: "MGR001",
  department: "Management",
  role: "manager",
  managerEmail: null
}
```

**Team Member 1:**
```javascript
{
  email: "adhviti@omoi.com",
  name: "Adhviti",
  employeeId: "OMOI123",
  department: "IT",
  role: "employee",
  managerEmail: "Aishmanager@omoi.com"  // ✅ IMPORTANT
}
```

**Team Member 2 (Optional):**
```javascript
{
  email: "employee2@omoi.com",
  name: "Employee Two",
  employeeId: "EMP002",
  department: "HR",
  role: "employee",
  managerEmail: "Aishmanager@omoi.com"  // ✅ IMPORTANT
}
```

**Admin (for comparison):**
```javascript
{
  email: "admin@omoi.com",
  name: "Admin",
  employeeId: "ADMIN001",
  department: "Admin",
  role: "admin",
  managerEmail: null
}
```

### Check in MongoDB:
```javascript
db.users.find({ email: "Aishmanager@omoi.com" })
db.users.find({ email: "adhviti@omoi.com" })
db.employees.find({ managerEmail: "Aishmanager@omoi.com" })
```

---

## 🧪 Test Scenario 1: Manager Attendance Page

### Step 1: Login as Manager
```
URL: http://localhost:5176/attendance
Email: Aishmanager@omoi.com
Password: [your password]
```

### Step 2: Check-In as Manager
1. Click "Check In" button
2. Allow location access
3. Should see: "Check-in successful"
4. Refresh page (F5)
5. Should see your record in table:
   - EMP ID: MGR001
   - Name: Aishmanager
   - Department: Management
   - Reporting Manager: - (empty)
   - Check In: [time]

### Step 3: Check-Out as Manager
1. Click "Check Out" button
2. Allow location access
3. Should see: "Check-out successful"
4. Refresh page (F5)
5. Should see updated record:
   - Check Out: [time]
   - Total Hours: [calculated]

### Step 4: Verify Team Members' Records
1. Refresh page (F5)
2. Should see BOTH:
   - Your record (MGR001 - Aishmanager)
   - Team member record (OMOI123 - Adhviti)
3. Verify team member's reporting manager shows: "Aishmanager"

### Step 5: Test Date Filtering
1. Set "From" date: [today's date]
2. Set "To" date: [today's date]
3. Should see only today's records
4. Clear filters
5. Should see all records again

### Step 6: Test Employee Search
1. Type "Adhviti" in search box
2. Should see only Adhviti's records
3. Clear search
4. Should see all records again

---

## 📊 Test Scenario 2: Manager Timesheet Page

### Step 1: Login as Manager
```
URL: http://localhost:5176/timesheet
Email: Aishmanager@omoi.com
Password: [your password]
```

### Step 2: Check Current Month
1. Verify "From Month" and "To Month" are set to current month
2. Should see KPI cards:
   - Present: [number]
   - Absent: 0
   - Employees: 2 (or more)
   - Avg Hours: [number]

### Step 3: Verify Manager's Own Record
1. Look for row with:
   - EMP ID: MGR001
   - EMP NAME: Aishmanager
   - DEPARTMENT: Management
   - REPORTING MANAGER: - (empty/dash)
2. Should show your attendance data

### Step 4: Verify Team Members' Records
1. Look for row with:
   - EMP ID: OMOI123
   - EMP NAME: Adhviti
   - DEPARTMENT: IT
   - REPORTING MANAGER: Aishmanager (your name)
2. Should show their attendance data

### Step 5: Test Approval Dropdown
1. Click Status dropdown for team member's row
2. Should see options:
   - Pending
   - Approve
   - Reject
3. Select "Approve"
4. Should see: "Approved" message
5. Refresh page
6. Status should show: "Approved"

### Step 6: Test Month Filtering
1. Change "From Month" to previous month
2. Should see records for that month
3. Change "To Month" to next month
4. Should see records for that range
5. Reset to current month

---

## 👤 Test Scenario 3: Employee View (No Changes)

### Step 1: Login as Employee
```
Email: adhviti@omoi.com
Password: [your password]
```

### Step 2: Go to Attendance Page
1. Should see ONLY your own records
2. Should NOT see manager's records
3. Should NOT see other team members' records

### Step 3: Go to Timesheet Page
1. Should see ONLY your own timesheet
2. Should NOT see manager's timesheet
3. Should NOT see other team members' timesheet
4. Reporting Manager should show: "Aishmanager"

### Step 4: Check-In/Check-Out
1. Click "Check In"
2. Should work normally
3. Click "Check Out"
4. Should work normally

---

## 🔐 Test Scenario 4: Admin View (No Changes)

### Step 1: Login as Admin
```
Email: admin@omoi.com
Password: [your password]
```

### Step 2: Go to Attendance Page
1. Should see ALL records (manager + all employees)
2. Should see export options (CSV, Excel)

### Step 3: Go to Timesheet Page
1. Should see ALL timesheets
2. Should see all employees' data

---

## ✅ Test Checklist

### Manager Attendance Page
- [ ] Login successful
- [ ] Can check-in
- [ ] Can check-out
- [ ] Own record displays with correct name
- [ ] Own record displays with correct empId
- [ ] Own record displays with correct department
- [ ] Own reporting manager shows "-"
- [ ] Team member records visible
- [ ] Team member reporting manager shows manager's name
- [ ] Date filtering works
- [ ] Employee search works
- [ ] No console errors
- [ ] No backend errors

### Manager Timesheet Page
- [ ] Login successful
- [ ] KPI cards display correctly
- [ ] Own record visible with "-" as reporting manager
- [ ] Team member records visible
- [ ] Team member reporting manager shows manager's name
- [ ] Can approve team member timesheet
- [ ] Can reject team member timesheet
- [ ] Month filtering works
- [ ] No console errors
- [ ] No backend errors

### Employee View
- [ ] Can see only own attendance
- [ ] Can see only own timesheet
- [ ] Cannot see manager's data
- [ ] Cannot see other team members' data
- [ ] Can check-in/check-out
- [ ] Reporting manager shows correctly

### Admin View
- [ ] Can see all attendance records
- [ ] Can see all timesheet records
- [ ] Export options work

---

## 🐛 Troubleshooting

### Issue: Manager sees no records
**Solution:**
1. Verify backend is running: `mvn spring-boot:run`
2. Check backend logs for errors
3. Verify users exist in database
4. Clear browser cache (Ctrl+Shift+Delete)
5. Refresh page (Ctrl+R)

### Issue: Manager's name shows as "-"
**Solution:**
1. Check User document has `name` field
2. Check User document has `employeeId` field
3. Restart backend
4. Refresh page

### Issue: Team members not showing
**Solution:**
1. Check Employee collection has `managerEmail` field
2. Verify `managerEmail = Aishmanager@omoi.com`
3. Verify attendance records exist for team members
4. Restart backend

### Issue: "No attendance records found"
**Solution:**
1. Ensure you've checked in today
2. Verify attendance records exist in database
3. Check date range is correct
4. Refresh page

### Issue: Timesheet shows "No records found"
**Solution:**
1. Ensure attendance records exist for the month
2. Check attendance records have `checkIn` and `checkOut`
3. Verify month selector is correct
4. Refresh page

### Issue: Browser console shows errors
**Solution:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Refresh page (Ctrl+R)
3. Check backend is running
4. Check backend logs

### Issue: Backend won't start
**Solution:**
```bash
# Kill existing Java process
taskkill /F /IM java.exe

# Clean rebuild
mvn clean compile
mvn package -DskipTests

# Start fresh
mvn spring-boot:run
```

---

## 📝 Test Report Template

### Test Date: [DATE]
### Tester: [NAME]
### Backend Version: [VERSION]
### Frontend Version: [VERSION]

#### Manager Attendance Page
- [ ] PASS - Manager sees own records
- [ ] PASS - Manager sees team records
- [ ] PASS - Check-in works
- [ ] PASS - Check-out works
- [ ] PASS - Filtering works
- [ ] PASS - No errors

#### Manager Timesheet Page
- [ ] PASS - Manager sees own timesheet
- [ ] PASS - Manager sees team timesheet
- [ ] PASS - Approval works
- [ ] PASS - Filtering works
- [ ] PASS - No errors

#### Employee View
- [ ] PASS - Employee sees only own data
- [ ] PASS - Employee cannot see manager data
- [ ] PASS - Check-in/check-out works

#### Admin View
- [ ] PASS - Admin sees all data
- [ ] PASS - Export works

#### Overall Status
- [ ] ALL TESTS PASSED ✅
- [ ] SOME TESTS FAILED ❌

#### Issues Found
[List any issues]

#### Notes
[Any additional notes]

---

## 🚀 Quick Test (5 minutes)

If you just want to quickly verify it works:

1. **Restart Backend:**
   ```bash
   mvn clean compile
   mvn spring-boot:run
   ```

2. **Clear Browser Cache:**
   - Ctrl+Shift+Delete
   - Clear all data
   - Refresh page

3. **Login as Manager:**
   - Email: Aishmanager@omoi.com
   - Go to Attendance page
   - Should see your record + team member records

4. **Check Timesheet:**
   - Go to Timesheet page
   - Should see your record + team member records

5. **Done!** ✅

---

## 📊 Expected Results

### Manager Attendance Table
```
EMP ID | Name | Department | Reporting Manager | Check In | Check Out
MGR001 | Aishmanager | Management | - | 09:00 | 18:00
OMOI123 | Adhviti | IT | Aishmanager | 09:15 | 17:45
```

### Manager Timesheet Table
```
EMP ID | Name | Department | Reporting Manager | Present | Leave | LOP
MGR001 | Aishmanager | Management | - | 20 | 1 | 0
OMOI123 | Adhviti | IT | Aishmanager | 20 | 2 | 0
```

---

## ✨ Success Criteria

All of these must be true:

✅ Manager sees own attendance records
✅ Manager sees team members' attendance records
✅ Manager's name displays correctly
✅ Manager's empId displays correctly
✅ Manager's reporting manager shows "-"
✅ Team members' reporting manager shows manager's name
✅ Manager can approve/reject team timesheets
✅ Employee sees only own data
✅ Admin sees all data
✅ No console errors
✅ No backend errors

---

## 📞 Need Help?

1. Check backend logs: `mvn spring-boot:run` output
2. Check browser console: F12 → Console tab
3. Check database: MongoDB Compass
4. Review documentation: `QUICK_TEST_GUIDE.md`

---

**Last Updated:** 2026-05-07
**Status:** Ready for Testing
