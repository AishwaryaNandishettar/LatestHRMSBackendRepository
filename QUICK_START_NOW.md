# Quick Start - Manager Fix Ready to Test

## ✅ What's Done
- Backend compiled ✅
- Backend packaged ✅
- All code changes implemented ✅
- Ready for testing ✅

## 🚀 What You Need to Do Now

### Step 1: Stop Old Backend (if running)
Press `Ctrl+C` in the terminal where backend is running

### Step 2: Start Fresh Backend
```bash
cd HRMS-Backend
mvn spring-boot:run
```

Wait for this message:
```
Started HmrsBackendApplication in X seconds
```

### Step 3: Clear Browser Cache
**Option A (Recommended):**
1. Open DevTools (F12)
2. Go to Application tab
3. Click "Clear Site Data"

**Option B:**
1. Press Ctrl+Shift+Delete
2. Select "All time"
3. Click "Clear data"

### Step 4: Test Manager Login

**Login as:** Aishmanager@omoi.com
**Password:** admin123

#### Test 4A: Attendance Page
1. Go to Attendance page
2. **Expected:** Should see manager's own check-in + adhviti's check-in
3. **If empty:** Check backend logs for errors

#### Test 4B: Check-In
1. Click "Check In" button
2. **Expected:** Single "Check-in successful" popup
3. **If double popup:** Backend restart needed
4. **If failed:** Check browser console for errors

#### Test 4C: Timesheet Page
1. Go to Timesheet page
2. **Expected:** Should see manager's record + adhviti's record
3. **Manager's reportingManager:** Should show "-"
4. **adhviti's reportingManager:** Should show manager's email

### Step 5: Test Employee Login

**Login as:** adhviti@omoi.com
**Password:** adhviti123

#### Test 5A: Attendance Page
1. Go to Attendance page
2. **Expected:** Should see ONLY adhviti's records
3. **Should NOT see:** Manager's records

#### Test 5B: Timesheet Page
1. Go to Timesheet page
2. **Expected:** Should see ONLY adhviti's record
3. **Should NOT see:** Manager's record

### Step 6: Test Admin Login

**Login as:** admin@omoi.com
**Password:** admin123

#### Test 6A: Attendance Page
1. Go to Attendance page
2. **Expected:** Should see ALL records (manager + adhviti + others)

#### Test 6B: Timesheet Page
1. Go to Timesheet page
2. **Expected:** Should see ALL records

## 🐛 Troubleshooting

### Issue: "No attendance records found" for Manager
**Solution:**
1. Check backend logs for errors
2. Verify manager email is correct: `Aishmanager@omoi.com`
3. Clear browser cache and refresh
4. Restart backend

### Issue: Double popup on check-in
**Solution:**
1. Restart backend: `mvn spring-boot:run`
2. Clear browser cache
3. Try check-in again

### Issue: Manager's own record not showing
**Solution:**
1. Verify backend is running
2. Check browser console (F12) for errors
3. Check backend logs for enrichAttendance() errors
4. Restart backend

## 📊 Key Points

1. **Manager's Own Record:** Should display in Attendance page
2. **Team Records:** Should display in Attendance page
3. **Timesheet:** Manager sees own + team, Employee sees only own
4. **No Double Popup:** Check-in should show success popup only once
5. **No Manager in Employee Timesheet:** Employee should NOT see manager's timesheet

## ✅ Verification

### Backend Logs Should Show:
```
Started HmrsBackendApplication in X seconds
```

### Browser Console Should Show:
```
🔥 LOGIN RESPONSE: id=..., empId=...
```

## 📝 Report Results

After testing, please report:
1. ✅ or ❌ Manager attendance page shows records
2. ✅ or ❌ Manager check-in works (single popup)
3. ✅ or ❌ Manager timesheet shows own + team
4. ✅ or ❌ Employee sees only own records
5. ✅ or ❌ Admin sees all records

---

**Status:** Ready for Testing
**Backend:** Compiled & Packaged ✅
**Frontend:** Updated ✅
