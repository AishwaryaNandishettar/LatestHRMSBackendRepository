# Quick Test Guide - Manager Attendance & Timesheet

## What Was Fixed

### Before Fix ❌
- Manager (Aishmanager@omoi.com) saw **no attendance records** on Attendance page
- Manager saw **no timesheet data** on Timesheet page
- Manager's own records were missing or showing incorrect employee details

### After Fix ✅
- Manager sees **their own check-in records** with correct name/empId
- Manager sees **all team members' check-in records** (e.g., Adhviti)
- Manager sees **their own timesheet** with "-" as reporting manager
- Manager sees **all team members' timesheet** with manager's name as reporting manager

---

## How to Test

### Step 1: Login as Manager
```
Email: Aishmanager@omoi.com
Password: [your password]
```

### Step 2: Go to Attendance Management
- Click **Attendance Management** in sidebar
- You should see:
  - **Your own check-in records** (Manager's name, Manager's empId)
  - **Team members' check-in records** (e.g., Adhviti's records)

### Step 3: Go to Timesheet
- Click **Timesheet Management** in sidebar
- You should see:
  - **Your own timesheet row** with:
    - Your name
    - Your empId
    - Reporting Manager = "-" (empty)
  - **Team members' timesheet rows** with:
    - Their name
    - Their empId
    - Reporting Manager = "Aishmanager" (or your name)

### Step 4: Test Approval
- On Timesheet page, select a team member's row
- Click the Status dropdown
- Select "Approve" or "Reject"
- Should work without errors

---

## Expected Data Structure

### Attendance Table (Manager View)
| EMP ID | Login Date | Emp Name | DEPT | REPORTING MANAGER | CHECK IN | CHECK OUT | ... |
|--------|-----------|----------|------|-------------------|----------|-----------|-----|
| MGR001 | 2026-05-07 | Aishmanager | Management | - | 09:00 | 18:00 | ... |
| OMOI123 | 2026-05-07 | Adhviti | IT | Aishmanager | 09:15 | 17:45 | ... |

### Timesheet Table (Manager View)
| EMP ID | EMP NAME | DEPARTMENT | REPORTING MANAGER | MONTH | PRESENT | LEAVE | LOP | ... |
|--------|----------|-----------|-------------------|-------|---------|-------|-----|-----|
| MGR001 | Aishmanager | Management | - | 2026-05 | 20 | 1 | 0 | ... |
| OMOI123 | Adhviti | IT | Aishmanager | 2026-05 | 20 | 2 | 0 | ... |

---

## Troubleshooting

### Issue: Manager still sees no records
**Solution:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Restart backend: `mvn spring-boot:run`
3. Restart frontend: `npm run dev`
4. Login again

### Issue: Manager's name shows as "-"
**Solution:**
1. Check User document in MongoDB - ensure `name` field is set
2. Check User document - ensure `employeeId` field is set
3. Restart backend

### Issue: Team members not showing
**Solution:**
1. Check Employee collection - ensure `managerEmail` field matches manager's email
2. Check User collection - ensure `managerEmail` field matches manager's email
3. Verify team members have `managerEmail = Aishmanager@omoi.com`

### Issue: Timesheet shows "No records found"
**Solution:**
1. Ensure attendance records exist for the selected month
2. Check that attendance records have `checkIn` and `checkOut` times
3. Verify the month selector is set to correct month

---

## Backend Endpoints Used

### Attendance
```
GET /api/attendance/manager?email=Aishmanager@omoi.com
```
Returns: List of manager's own + team members' attendance records

### Timesheet
```
GET /api/timesheet/monthly?month=2026-05
```
Returns: Aggregated timesheet summary for manager's own + team members

---

## Database Queries

### Find Manager's Team
```javascript
db.users.find({ managerEmail: "Aishmanager@omoi.com" })
```

### Find Manager's Attendance
```javascript
db.attendance.find({ userId: { $in: [managerId, teamMember1Id, teamMember2Id, ...] } })
```

### Find Manager's Timesheet
```javascript
db.attendance.find({ 
  userId: { $in: [managerId, teamMember1Id, teamMember2Id, ...] },
  date: { $regex: "^2026-05" }
})
```

---

## Success Criteria

✅ Manager sees own attendance records
✅ Manager sees team members' attendance records
✅ Manager's name displays correctly (not "-")
✅ Manager's empId displays correctly
✅ Manager's reporting manager shows as "-"
✅ Team members' reporting manager shows as manager's name
✅ Manager can approve/reject team timesheets
✅ No errors in browser console
✅ No errors in backend logs

---

## Rollback (if needed)

If issues occur, revert these files:
1. `AttendanceRepository.java` - Remove new method
2. `AttendanceService.java` - Revert getManagerAttendance()
3. `TimesheetService.java` - Revert getMonthlySummary()
4. `Attendance.jsx` - Revert manager record handling
5. `Timesheet.jsx` - Revert manager filtering

Then rebuild:
```bash
mvn clean compile
npm run build
```
