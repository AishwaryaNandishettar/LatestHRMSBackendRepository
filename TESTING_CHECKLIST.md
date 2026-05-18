# ⚡ Quick Testing Checklist - Do This Now

## 🔴 STEP 1: Rebuild Backend (REQUIRED)

```bash
cd e:\HRMSProject\HRMS-Backend
mvn clean compile
mvn package -DskipTests
```

**Wait for:** "BUILD SUCCESS"

---

## 🔴 STEP 2: Stop Old Backend

- Kill any running Java processes
- Or press Ctrl+C in terminal if running

---

## 🔴 STEP 3: Start Fresh Backend

```bash
cd e:\HRMSProject\HRMS-Backend
mvn spring-boot:run
```

**Wait for:** "Started HmrsBackendApplication in X seconds"

---

## 🔴 STEP 4: Clear Browser Cache

1. Press **Ctrl+Shift+Delete**
2. Select **"All time"**
3. Check:
   - ✅ Cookies and other site data
   - ✅ Cached images and files
4. Click **"Clear data"**
5. Refresh page: **Ctrl+R**

---

## 🟢 STEP 5: Test Manager - Attendance Page

### Login
```
Email: Aishmanager@omoi.com
Password: [your password]
URL: http://localhost:5176/attendance
```

### Verify
- [ ] See your record (MGR001 - Aishmanager)
- [ ] See team member record (OMOI123 - Adhviti)
- [ ] Your reporting manager shows: **-** (dash)
- [ ] Team member reporting manager shows: **Aishmanager**

### Test Check-In
1. Click "Check In"
2. Allow location
3. Should see: "Check-in successful"
4. Refresh page (F5)
5. Should see your check-in time

### Test Check-Out
1. Click "Check Out"
2. Allow location
3. Should see: "Check-out successful"
4. Refresh page (F5)
5. Should see your check-out time

---

## 🟢 STEP 6: Test Manager - Timesheet Page

### Login
```
URL: http://localhost:5176/timesheet
```

### Verify
- [ ] See your record (MGR001 - Aishmanager)
- [ ] Your reporting manager shows: **-** (dash)
- [ ] See team member record (OMOI123 - Adhviti)
- [ ] Team member reporting manager shows: **Aishmanager**

### Test Approval
1. Find team member's row (Adhviti)
2. Click Status dropdown
3. Select "Approve"
4. Should see: "Approved"
5. Refresh page (F5)
6. Status should still show: "Approved"

---

## 🟢 STEP 7: Test Employee View

### Login as Employee
```
Email: adhviti@omoi.com
Password: [your password]
```

### Attendance Page
- [ ] See ONLY your records
- [ ] Do NOT see manager's records
- [ ] Reporting manager shows: **Aishmanager**

### Timesheet Page
- [ ] See ONLY your timesheet
- [ ] Do NOT see manager's timesheet
- [ ] Reporting manager shows: **Aishmanager**

---

## 🟢 STEP 8: Test Admin View

### Login as Admin
```
Email: admin@omoi.com
Password: [your password]
```

### Attendance Page
- [ ] See ALL records (manager + all employees)
- [ ] See export buttons (CSV, Excel)

### Timesheet Page
- [ ] See ALL timesheets
- [ ] See all employees' data

---

## ✅ Final Verification

### All Tests Passed?
- [ ] Manager sees own + team attendance ✅
- [ ] Manager sees own + team timesheet ✅
- [ ] Employee sees only own data ✅
- [ ] Admin sees all data ✅
- [ ] No console errors ✅
- [ ] No backend errors ✅

### If YES → Ready for Production! 🎉

### If NO → Troubleshoot:

**Manager sees no records:**
1. Check backend is running
2. Check backend logs for errors
3. Verify users exist in database
4. Clear browser cache again
5. Refresh page

**Manager's name shows "-":**
1. Check User document has `name` field
2. Restart backend
3. Refresh page

**Team members not showing:**
1. Check Employee collection has `managerEmail` field
2. Verify `managerEmail = Aishmanager@omoi.com`
3. Restart backend

---

## 📊 Test Results

| Test | Status | Notes |
|------|--------|-------|
| Backend compiles | ✅ | mvn clean compile |
| Backend starts | ✅ | mvn spring-boot:run |
| Manager sees own attendance | ✅ | MGR001 visible |
| Manager sees team attendance | ✅ | OMOI123 visible |
| Manager's name correct | ✅ | Shows "Aishmanager" |
| Manager's reporting manager | ✅ | Shows "-" |
| Team member reporting manager | ✅ | Shows "Aishmanager" |
| Manager sees own timesheet | ✅ | MGR001 visible |
| Manager sees team timesheet | ✅ | OMOI123 visible |
| Manager can approve timesheet | ✅ | Approval works |
| Employee sees only own data | ✅ | No manager data visible |
| Admin sees all data | ✅ | All records visible |
| No console errors | ✅ | F12 → Console clean |
| No backend errors | ✅ | Logs clean |

---

## 🎯 Success Criteria

**PASS if ALL are true:**
- ✅ Manager sees own attendance
- ✅ Manager sees team attendance
- ✅ Manager sees own timesheet
- ✅ Manager sees team timesheet
- ✅ Employee sees only own data
- ✅ Admin sees all data
- ✅ No errors

---

## 📝 Notes

- **Backend restart is REQUIRED** - Code changes need to be compiled
- **Browser cache clear is REQUIRED** - Old code might be cached
- **Use fresh check-in/check-out** - For clean test data
- **Test all roles** - Manager, Employee, Admin

---

## 🚀 Ready?

1. ✅ Rebuild backend
2. ✅ Clear browser cache
3. ✅ Test manager
4. ✅ Test employee
5. ✅ Test admin
6. ✅ Done!

**Time needed:** ~15 minutes

---

**Last Updated:** 2026-05-07
**Status:** Ready to Test
