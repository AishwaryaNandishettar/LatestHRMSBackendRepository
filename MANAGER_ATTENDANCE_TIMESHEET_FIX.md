# Manager Attendance & Timesheet Fix - Complete Implementation

## Problem Summary
Manager (Aishmanager@omoi.com) was not seeing:
1. **Attendance Page**: Their own check-in details + team members' check-in details
2. **Timesheet Page**: Their own timesheet + team members' timesheet data

The manager's own records were displaying with incorrect/missing employee details.

---

## Solution Overview

### Backend Changes

#### 1. **AttendanceRepository.java** ✅
Added new method to support manager queries:
```java
List<Attendance> findByUserIdInAndDateStartingWith(List<String> userIds, String month);
```

#### 2. **AttendanceService.java** ✅
Updated `getManagerAttendance()` method to:
- Fetch manager's own attendance records
- Fetch all team members' attendance records (via `findByManagerEmail`)
- Enrich manager's own records with correct name, empId, and department
- Set manager's reporting manager to "-" (no one above them)

**Key Logic:**
```java
// Get manager's own records + team records
List<User> team = userRepo.findByManagerEmail(managerEmail);
List<String> userIds = team.stream().map(User::getId).collect(Collectors.toList());

// Add manager's own ID
Optional<User> managerOpt = userRepo.findByEmail(managerEmail);
if (managerOpt.isPresent()) {
    userIds.add(managerOpt.get().getId());
}

// Fetch all records
List<Attendance> records = attendanceRepo.findByUserIdIn(userIds);

// Enrich manager's own record with proper details
if (managerOpt.isPresent() && att.getUserId().equals(managerOpt.get().getId())) {
    User manager = managerOpt.get();
    dto.setName(manager.getName());
    dto.setEmpId(manager.getEmployeeId());
    dto.setDepartment(manager.getDepartment());
    dto.setReportingManager("-");
}
```

#### 3. **TimesheetService.java** ✅
Updated `getMonthlySummary()` method to:
- Check user role from authentication context
- For **EMPLOYEE**: Show only their own timesheet
- For **MANAGER**: Show their own + team members' timesheet
- For **ADMIN**: Show all timesheets
- Properly enrich manager's own record with correct details

**Key Logic:**
```java
if (auth.getAuthorities().stream()
        .anyMatch(a -> a.getAuthority().equals("ROLE_MANAGER"))) {
    // Manager: their own + team data
    Optional<User> managerOpt = userRepo.findByEmail(userId);
    if (managerOpt.isPresent()) {
        User manager = managerOpt.get();
        userIds.add(manager.getId()); // Add manager's own ID
        
        // Add all team members
        List<User> team = userRepo.findByManagerEmail(userId);
        team.forEach(u -> userIds.add(u.getId()));
    }
    data = repo.findByUserIdInAndDateStartingWith(userIds, month);
}

// For manager's own record, set reporting manager to "-"
if (auth.getAuthorities().stream()
        .anyMatch(a -> a.getAuthority().equals("ROLE_MANAGER")) &&
    u.getEmail() != null && u.getEmail().equals(userId)) {
    managerName = "-";
}
```

---

### Frontend Changes

#### 1. **Attendance.jsx** ✅
Simplified the manager record enrichment:
- Removed unnecessary conditional checks
- Backend now handles all enrichment
- Frontend just displays the data as-is

#### 2. **Timesheet.jsx** ✅
Updated manager filtering logic:
```javascript
// Manager → show own record + team data
if (role === ROLE_MGR) {
    const managerEmail = (loggedUser?.email || "").toLowerCase();
    const managerName  = (loggedUser?.name || loggedUser?.employeeName || "").toLowerCase();
    const reportingMgr = (r.reportingManager || "").toLowerCase();
    const managerEmpId = (loggedUser?.employeeId || loggedUser?.empId || "").toLowerCase();
    const recordEmpId  = (r.empId || "").toLowerCase();
    
    // Match if: reporting manager is this manager OR this is the manager's own record
    const isOwnRecord  = recordEmpId === managerEmpId || 
                        (r.empName && r.empName.toLowerCase() === managerName);
    const isTeamRecord = reportingMgr === managerEmail || reportingMgr === managerName;

    const match = isOwnRecord || isTeamRecord;
    if (!match) return false;
}
```

---

## Data Flow

### Attendance Page (Manager View)
1. Manager logs in as `Aishmanager@omoi.com`
2. Frontend calls `getManagerAttendance(managerEmail)`
3. Backend:
   - Finds all users with `managerEmail = Aishmanager@omoi.com`
   - Adds manager's own ID to the list
   - Fetches all attendance records for these users
   - Enriches each record with proper employee details
   - For manager's own record: uses manager's name, empId, department
4. Frontend displays all records in table

### Timesheet Page (Manager View)
1. Manager logs in as `Aishmanager@omoi.com`
2. Frontend calls `getTimesheet(month)`
3. Backend:
   - Checks authentication role = ROLE_MANAGER
   - Finds all users with `managerEmail = Aishmanager@omoi.com`
   - Adds manager's own ID to the list
   - Fetches attendance data for all these users for the month
   - Aggregates into timesheet summary
   - For manager's own record: sets reportingManager = "-"
4. Frontend displays all records in table
5. Manager can approve/reject team members' timesheets

---

## Testing Checklist

### Attendance Page
- [ ] Manager logs in
- [ ] Manager's own check-in records display with correct name/empId
- [ ] Team members' check-in records display
- [ ] Manager can check-in/check-out
- [ ] Date range filtering works
- [ ] Employee search works

### Timesheet Page
- [ ] Manager logs in
- [ ] Manager's own timesheet displays with "-" as reporting manager
- [ ] Team members' timesheet displays with manager's name as reporting manager
- [ ] KPI cards show correct totals
- [ ] Manager can approve/reject team timesheets
- [ ] Month filtering works

### Employee View (No Changes)
- [ ] Employee sees only their own attendance
- [ ] Employee sees only their own timesheet
- [ ] Employee cannot see team data

### Admin View (No Changes)
- [ ] Admin sees all attendance records
- [ ] Admin sees all timesheet records

---

## Files Modified

### Backend
1. `AttendanceRepository.java` - Added new query method
2. `AttendanceService.java` - Updated getManagerAttendance()
3. `TimesheetService.java` - Updated getMonthlySummary()

### Frontend
1. `Attendance.jsx` - Simplified manager record handling
2. `Timesheet.jsx` - Updated manager filtering logic

---

## Compilation Status
✅ Backend compiles successfully with `mvn clean compile -DskipTests`

---

## Notes
- No existing logic was changed for employees or admins
- Manager's own records now display correctly with their proper details
- Team members' records show manager's name as reporting manager
- All role-based access control is maintained
- Database queries are optimized using indexed fields
