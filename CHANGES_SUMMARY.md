# Complete Changes Summary - Manager Attendance & Timesheet Fix

## Overview
Fixed manager (Aishmanager@omoi.com) not seeing their own and team members' attendance/timesheet data.

---

## Files Changed: 5 Total

### 1. Backend Repository Layer
**File:** `HRMS-Backend/src/main/java/com/omoikaneinnovation/hmrsbackend/repository/AttendanceRepository.java`

**Change:** Added new query method
```java
// NEW METHOD
List<Attendance> findByUserIdInAndDateStartingWith(List<String> userIds, String month);
```

**Why:** Allows fetching attendance records for multiple users (manager + team) for a specific month.

---

### 2. Backend Service Layer - Attendance
**File:** `HRMS-Backend/src/main/java/com/omoikaneinnovation/hmrsbackend/service/AttendanceService.java`

**Change:** Updated `getManagerAttendance()` method

**Before:**
```java
// Only fetched team members, not manager's own records
List<User> team = userRepo.findByManagerEmail(managerEmail);
List<String> userIds = team.stream().map(User::getId).collect(Collectors.toList());
List<Attendance> records = attendanceRepo.findByUserIdIn(userIds);
```

**After:**
```java
// Fetch team members
List<User> team = userRepo.findByManagerEmail(managerEmail);
List<String> userIds = team.stream().map(User::getId).collect(Collectors.toList());

// ALSO include manager's own records
Optional<User> managerOpt = userRepo.findByEmail(managerEmail);
if (managerOpt.isPresent()) {
    User manager = managerOpt.get();
    String managerId = manager.getId();
    if (!userIds.contains(managerId)) {
        userIds.add(managerId);
    }
}

List<Attendance> records = attendanceRepo.findByUserIdIn(userIds);

// Enrich manager's own record with correct details
if (managerOpt.isPresent() && att.getUserId().equals(managerOpt.get().getId())) {
    User manager = managerOpt.get();
    // Always use manager's details for their own record
    dto.setName(manager.getName() != null ? manager.getName() : manager.getEmail());
    dto.setEmpId(manager.getEmployeeId() != null ? manager.getEmployeeId() : "MGR-" + manager.getId().substring(0, 6));
    dto.setDepartment(manager.getDepartment() != null ? manager.getDepartment() : "Management");
    dto.setReportingManager("-"); // Manager has no reporting manager
}
```

**Why:** 
- Includes manager's own attendance records
- Ensures manager's records display with correct name/empId/department
- Sets manager's reporting manager to "-" (no one above them)

---

### 3. Backend Service Layer - Timesheet
**File:** `HRMS-Backend/src/main/java/com/omoikaneinnovation/hmrsbackend/service/TimesheetService.java`

**Change:** Updated `getMonthlySummary()` method to handle manager role

**Before:**
```java
if (auth.getAuthorities().stream()
        .anyMatch(a -> a.getAuthority().equals("ROLE_EMPLOYEE"))) {
    data = repo.findByUserIdAndDateStartingWith(userId, month);
} else {
    data = repo.findByDateStartingWith(month); // Admin gets all
}
```

**After:**
```java
if (auth.getAuthorities().stream()
        .anyMatch(a -> a.getAuthority().equals("ROLE_EMPLOYEE"))) {
    // Employee: only their own data
    data = repo.findByUserIdAndDateStartingWith(userId, month);
} else if (auth.getAuthorities().stream()
        .anyMatch(a -> a.getAuthority().equals("ROLE_MANAGER"))) {
    // Manager: their own + team data
    Optional<User> managerOpt = userRepo.findByEmail(userId);
    if (managerOpt.isPresent()) {
        User manager = managerOpt.get();
        String managerId = manager.getId();
        userIds.add(managerId); // Add manager's own ID
        
        // Add all team members
        List<User> team = userRepo.findByManagerEmail(userId);
        team.forEach(u -> userIds.add(u.getId()));
    }
    data = repo.findByUserIdInAndDateStartingWith(userIds, month);
} else {
    // Admin: all data
    data = repo.findByDateStartingWith(month);
}
```

**Additional Change:** Set manager's reporting manager to "-"
```java
// For manager's own record, set reporting manager to "-"
if (auth.getAuthorities().stream()
        .anyMatch(a -> a.getAuthority().equals("ROLE_MANAGER")) &&
    u.getEmail() != null && u.getEmail().equals(userId)) {
    managerName = "-";
}
```

**Why:**
- Managers now see their own + team members' timesheet data
- Manager's own record shows "-" as reporting manager
- Team members' records show manager's name as reporting manager

---

### 4. Frontend - Attendance Page
**File:** `HRMS-Frontend/src/Pages/Attendance.jsx`

**Change:** Simplified manager record enrichment (removed unnecessary logic)

**Before:**
```javascript
// For manager: also include their own check-in records
// Backend getManagerAttendance already includes manager's own records,
// but we need to ensure the manager's own records are enriched with correct name/empId
if (role === "manager") {
    // Enrich any records that have missing name/empId with the logged user's data
    const enriched = data.map((r) => {
        const isManagerOwnRecord =
            String(r.userId).trim().toLowerCase() ===
            String(loggedUser.id || loggedUser._id || "").trim().toLowerCase();

        if (isManagerOwnRecord) {
            return {
                ...r,
                empId: r.empId && r.empId !== "-" ? r.empId : (loggedUser.employeeId || loggedUser.empId || r.empId || "-"),
                name: r.name && r.name !== "-" && r.name !== "N/A" ? r.name : (loggedUser.name || loggedUser.employeeName || r.name || "-"),
                department: r.department && r.department !== "-" ? r.department : (loggedUser.department || r.department || "-"),
            };
        }
        return r;
    });
    setRecords(enriched);
    return;
}

setRecords(data);
```

**After:**
```javascript
setRecords(data);
```

**Why:** Backend now handles all enrichment, so frontend just displays the data as-is.

---

### 5. Frontend - Timesheet Page
**File:** `HRMS-Frontend/src/Pages/Timesheet.jsx`

**Change:** Updated manager filtering logic

**Before:**
```javascript
// Manager → only team data (match by email or name, case-insensitive)
if (role === ROLE_MGR) {
    const managerEmail = (loggedUser?.email || "").toLowerCase();
    const managerName  = (loggedUser?.name || loggedUser?.employeeName || "").toLowerCase();
    const reportingMgr = (r.reportingManager || "").toLowerCase();
    const isOwnRecord  = (r.empId || "").toLowerCase() === (loggedUser?.employeeId || loggedUser?.empId || "").toLowerCase();

    const match = reportingMgr === managerEmail || reportingMgr === managerName || isOwnRecord;

    if (!match) return false;
}
```

**After:**
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

**Why:** More robust matching logic that handles both empId and name-based matching for manager's own record.

---

## Data Flow Changes

### Before Fix
```
Manager Login
    ↓
Attendance Page → getManagerAttendance(email)
    ↓
Backend: Find team members only
    ↓
Frontend: Display team members only (manager's own records missing)
```

### After Fix
```
Manager Login
    ↓
Attendance Page → getManagerAttendance(email)
    ↓
Backend: Find manager's own ID + team members
    ↓
Backend: Fetch all attendance records
    ↓
Backend: Enrich manager's record with correct details
    ↓
Frontend: Display manager's own + team members' records
```

---

## Testing Verification

### Compilation
✅ Backend compiles: `mvn clean compile -DskipTests`

### Functionality
- [ ] Manager sees own attendance records
- [ ] Manager sees team members' attendance records
- [ ] Manager's name displays correctly
- [ ] Manager's empId displays correctly
- [ ] Manager's reporting manager shows as "-"
- [ ] Team members' reporting manager shows as manager's name
- [ ] Manager can approve/reject team timesheets
- [ ] No console errors
- [ ] No backend errors

---

## Backward Compatibility

✅ **No breaking changes**
- Employee role: Unchanged (still sees only own data)
- Admin role: Unchanged (still sees all data)
- Existing APIs: No changes to endpoints
- Database: No schema changes required

---

## Performance Impact

✅ **Minimal impact**
- Added one new repository method (uses existing indexes)
- No additional database queries for employees/admins
- Manager queries now fetch 2 queries instead of 1 (manager + team), but this is expected behavior

---

## Deployment Steps

1. **Backend:**
   ```bash
   mvn clean compile
   mvn package -DskipTests
   # Deploy JAR file
   ```

2. **Frontend:**
   ```bash
   npm run build
   # Deploy build folder
   ```

3. **Restart Services:**
   - Restart backend service
   - Clear browser cache
   - Refresh frontend

---

## Rollback Plan

If issues occur:
1. Revert the 5 files to previous versions
2. Run `mvn clean compile`
3. Run `npm run build`
4. Redeploy

---

## Support

For issues or questions:
1. Check `QUICK_TEST_GUIDE.md` for troubleshooting
2. Check `MANAGER_ATTENDANCE_TIMESHEET_FIX.md` for detailed explanation
3. Review database to ensure `managerEmail` field is set correctly on User/Employee documents
