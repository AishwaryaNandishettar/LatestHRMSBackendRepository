# Manager Attendance & Timesheet Fix - Complete Guide

## Current Status
✅ Backend compiled successfully
✅ All code changes implemented
✅ Ready for testing

## What Was Fixed

### 1. **Attendance Service** (`AttendanceService.java`)
- `checkIn()` and `checkOut()` now normalize userId (convert email to MongoDB _id)
- `getManagerAttendance()` returns manager's own records + team records
- Uses `ArrayList` for proper list handling

### 2. **Timesheet Service** (`TimesheetService.java`)
- Manager role now fetches own + team data
- Properly filters manager's own record (sets reportingManager to "-")
- Uses `findByUserIdInAndDateStartingWith()` for batch queries

### 3. **Attendance Repository** (`AttendanceRepository.java`)
- Added `findByDateStartingWith()` for admin queries
- Added `findByUserIdAndDateStartingWith()` for employee queries
- Added `findByUserIdInAndDateStartingWith()` for manager/batch queries

### 4. **Frontend** (`Attendance.jsx` & `Timesheet.jsx`)
- Simplified manager filtering logic
- Properly handles manager's own + team data display

## Testing Steps

### Step 1: Stop Old Backend
```
# If backend is running, stop it (Ctrl+C in terminal)
```

### Step 2: Start Fresh Backend
```
cd HRMS-Backend
mvn spring-boot:run
```
Wait for: `Started HmrsBackendApplication in X seconds`

### Step 3: Clear Browser Cache
1. Open browser DevTools (F12)
2. Go to Application → Storage
3. Clear All Site Data
4. OR: Ctrl+Shift+Delete → All time → Clear data

### Step 4: Test Manager Login (Aishmanager@omoi.com)

#### Test 4A: Attendance Page
1. Login as Aishmanager@omoi.com
2. Go to Attendance page
3. **Expected Result:**
   - Should see manager's own check-in records
   - Should see adhviti's check-in records
   - Table should NOT be empty

#### Test 4B: Check-In/Check-Out
1. Click "Check In" button
2. **Expected Result:**
   - Should show "Check-in successful" popup (only once)
   - Manager's check-in details should appear in table
   - Should NOT show "failed" popup

3. Click "Check Out" button
4. **Expected Result:**
   - Should show "Check-out successful" popup
   - Check-out time should appear in table

#### Test 4C: Timesheet Page
1. Go to Timesheet page
2. **Expected Result:**
   - Should see manager's own timesheet record
   - Should see adhviti's timesheet record
   - Manager's reportingManager should show "-"
   - adhviti's reportingManager should show "Aishmanager@omoi.com" or manager's name

### Step 5: Test Employee Login (adhviti@omoi.com)

#### Test 5A: Attendance Page
1. Login as adhviti@omoi.com
2. Go to Attendance page
3. **Expected Result:**
   - Should see ONLY adhviti's own records
   - Should NOT see manager's records
   - Should NOT see other employees' records

#### Test 5B: Timesheet Page
1. Go to Timesheet page
2. **Expected Result:**
   - Should see ONLY adhviti's own timesheet
   - Should NOT see manager's timesheet
   - Should NOT see other employees' timesheet

### Step 6: Test Admin Login (admin@omoi.com)

#### Test 6A: Attendance Page
1. Login as admin@omoi.com
2. Go to Attendance page
3. **Expected Result:**
   - Should see ALL employees' records
   - Should see manager's records
   - Should see adhviti's records

#### Test 6B: Timesheet Page
1. Go to Timesheet page
2. **Expected Result:**
   - Should see ALL employees' timesheet
   - Should see manager's timesheet
   - Should see adhviti's timesheet

## Troubleshooting

### Issue: "No attendance records found" for Manager
**Solution:**
1. Check backend logs for errors
2. Verify manager email is correct (Aishmanager@omoi.com)
3. Clear browser cache and refresh
4. Check MongoDB to verify records exist

### Issue: Double popup on check-in
**Solution:**
1. This should be fixed now
2. If still happening, check browser console for errors
3. Verify backend is restarted

### Issue: Manager's own record not showing
**Solution:**
1. Verify manager has a User record in MongoDB
2. Verify manager's check-in was stored with correct userId
3. Check backend logs for enrichAttendance() errors

## Database Verification

To verify data in MongoDB:

```javascript
// Check manager user exists
db.users.findOne({ email: "Aishmanager@omoi.com" })

// Check manager's attendance records
db.attendances.find({ userId: "<manager_id>" })

// Check team member's attendance records
db.attendances.find({ userId: "<adhviti_id>" })

// Check manager has no employee record
db.employees.findOne({ email: "Aishmanager@omoi.com" })
// Should return null
```

## Key Points

1. **Manager's Own Record**: Should display in Attendance page with manager's details
2. **Team Records**: Should display in Attendance page with team member details
3. **Timesheet**: Manager should see own + team, Employee should see only own
4. **No Double Popup**: Check-in should show success popup only once
5. **No Manager in Employee Timesheet**: Employee should NOT see manager's timesheet

## Next Steps After Testing

1. If all tests pass: ✅ Issue is resolved
2. If any test fails: Check the specific error and debug
3. Document any issues found
4. Make additional fixes if needed

---

**Last Updated:** May 7, 2026
**Status:** Ready for Testing
