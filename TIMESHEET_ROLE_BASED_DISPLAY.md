# Timesheet Role-Based Display Guide

## Changes Made

### 1. **Removed "Submit Timesheet" Button for Employees**
- ✅ Employees no longer see the "📤 Submit Timesheet" button
- ✅ Only managers and admins see action buttons
- ✅ Employees only see their own timesheet data (if they have check-in records)

### 2. **Manager Timesheet Now Shows Team Members**
- ✅ Managers see their own timesheet
- ✅ Managers see all team members' timesheet data
- ✅ Team members' check-in details are included in the timesheet

### 3. **Backend Enhancement**
- ✅ Updated `TimesheetService.getMonthlySummary()` to fetch team members by `managerEmail`
- ✅ Managers now get both their own records and team members' records

---

## How It Works Now

### For Employees
```
Employee logs in
    ↓
Goes to Timesheet page
    ↓
Sees ONLY their own timesheet (if they have check-in records)
    ↓
NO "Submit Timesheet" button
    ↓
NO action buttons
```

### For Managers
```
Manager logs in (e.g., Padmanabhmanager@omoi.com)
    ↓
Goes to Timesheet page
    ↓
Sees their own timesheet
    ↓
Sees all team members' timesheet (e.g., Mahesh's employees)
    ↓
Sees team members' check-in details
    ↓
Can approve/reject team members' timesheets
```

### For Admin
```
Admin logs in
    ↓
Goes to Timesheet page
    ↓
Sees ALL employees' timesheet
    ↓
Can approve/reject any timesheet
```

---

## Data Flow

### Manager Timesheet Request
```
Manager: Padmanabhmanager@omoi.com
    ↓
Frontend: GET /api/timesheet/monthly?month=2026-05
    ↓
Backend (TimesheetService.getMonthlySummary):
    1. Get manager's email: Padmanabhmanager@omoi.com
    2. Query: db.users.find({ managerEmail: "Padmanabhmanager@omoi.com" })
    3. Get all team members (Mahesh, etc.)
    4. Query: db.attendance.find({ userId: [manager_id, team_member_ids] })
    5. Aggregate attendance into timesheet summary
    ↓
Returns: Manager's timesheet + Team members' timesheet
    ↓
Frontend displays all records in table
```

---

## MongoDB Setup Required

### For Mahesh's Employees to Show in Padmanabhmanager's Timesheet

1. **Set Mahesh's managerEmail**
   ```javascript
   db.users.updateOne(
     { email: "mahesh@gmail.com" },
     { $set: { managerEmail: "Padmanabhmanager@omoi.com" } }
   )
   ```

2. **Set Mahesh's employees' managerEmail to Mahesh**
   ```javascript
   db.users.updateMany(
     { email: { $in: ["employee1@gmail.com", "employee2@gmail.com"] } },
     { $set: { managerEmail: "mahesh@gmail.com" } }
   )
   ```

3. **Verify the hierarchy**
   ```javascript
   // Padmanabhmanager's direct reports
   db.users.find({ managerEmail: "Padmanabhmanager@omoi.com" })
   
   // Mahesh's direct reports
   db.users.find({ managerEmail: "mahesh@gmail.com" })
   ```

---

## Expected Result

### Padmanabhmanager's Timesheet View
```
Monthly Attendance Dashboard (Timesheet)
┌─────────────────────────────────────────────────────────────┐
│ Present: 45 │ Absent: 2 │ Employees: 5 │ Avg Hours: 8.25 │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ EMP ID │ NAME │ DEPT │ REPORTING MGR │ PRESENT │ LEAVE │ ... │
├──────────────────────────────────────────────────────────────────┤
│ MGR001 │ Padmanabhmanager │ Management │ - │ 20 │ 1 │ ... │
│ MGR002 │ Mahesh │ IT │ Padmanabhmanager │ 18 │ 0 │ ... │
│ EMP001 │ Employee1 │ IT │ Mahesh │ 19 │ 1 │ ... │
│ EMP002 │ Employee2 │ IT │ Mahesh │ 20 │ 0 │ ... │
└──────────────────────────────────────────────────────────────────┘
```

### Mahesh's Timesheet View
```
Monthly Attendance Dashboard (Timesheet)
┌─────────────────────────────────────────────────────────────┐
│ Present: 39 │ Absent: 0 │ Employees: 3 │ Avg Hours: 8.10 │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ EMP ID │ NAME │ DEPT │ REPORTING MGR │ PRESENT │ LEAVE │ ... │
├──────────────────────────────────────────────────────────────────┤
│ MGR002 │ Mahesh │ IT │ Padmanabhmanager │ 18 │ 0 │ ... │
│ EMP001 │ Employee1 │ IT │ Mahesh │ 19 │ 1 │ ... │
│ EMP002 │ Employee2 │ IT │ Mahesh │ 20 │ 0 │ ... │
└──────────────────────────────────────────────────────────────────┘
```

### Employee's Timesheet View
```
Monthly Attendance Dashboard (Timesheet)
┌─────────────────────────────────────────────────────────────┐
│ Present: 19 │ Absent: 1 │ Employees: 1 │ Avg Hours: 8.00 │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ EMP ID │ NAME │ DEPT │ REPORTING MGR │ PRESENT │ LEAVE │ ... │
├──────────────────────────────────────────────────────────────────┤
│ EMP001 │ Employee1 │ IT │ Mahesh │ 19 │ 1 │ ... │
└──────────────────────────────────────────────────────────────────┘
(NO "Submit Timesheet" button)
```

---

## Code Changes Summary

### Frontend (Timesheet.jsx)
- ✅ Removed "Submit Timesheet" button for employees
- ✅ Updated filtering logic to show only own record for employees
- ✅ Managers see own + team members' records

### Backend (TimesheetService.java)
- ✅ Enhanced `getMonthlySummary()` to fetch team members by `managerEmail`
- ✅ Added email-based lookup in addition to ID-based lookup
- ✅ Properly aggregates manager + team data

### User Model (User.java)
- ✅ Added `setManagerEmail()` method (was missing)

---

## Testing Checklist

- [ ] Employee logs in → No "Submit Timesheet" button
- [ ] Employee sees only their own timesheet
- [ ] Manager logs in → Sees own timesheet
- [ ] Manager sees team members' timesheet
- [ ] Manager sees team members' check-in details
- [ ] Admin sees all employees' timesheet
- [ ] Mahesh's employees show in Padmanabhmanager's view
- [ ] Hierarchy is correct (Padmanabhmanager → Mahesh → Employees)

---

## Troubleshooting

### Issue: Manager doesn't see team members

**Check 1:** Verify managerEmail is set
```javascript
db.users.findOne({ email: "mahesh@gmail.com" })
// Should have: "managerEmail": "Padmanabhmanager@omoi.com"
```

**Check 2:** Verify team members have check-in records
```javascript
db.attendance.find({ userId: "mahesh@gmail.com" })
// Should have attendance records
```

**Check 3:** Clear browser cache and refresh
- Ctrl+Shift+Delete → Clear cache
- Refresh page

---

## Next Steps

1. ✅ Update MongoDB to set `managerEmail` for all users
2. ✅ Test manager timesheet view
3. ✅ Verify team members' data appears
4. ✅ Test employee timesheet view (no button)
5. ✅ Verify hierarchy works correctly
