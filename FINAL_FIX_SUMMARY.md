# Manager Attendance & Timesheet Fix - Final Summary

## ✅ All Changes Completed

### Backend Changes

#### 1. **LoginResponse.java** - Added Missing Fields
```java
public String id;           // ✅ MongoDB _id (CRITICAL)
public String name;
public String email;
public String role;
public String token;
public String empId;        // Employee ID
public String employeeId;   // Employee ID (fallback)
public String companyId;    // Company ID
public String department;   // Department
public String managerEmail; // Manager Email
```

**Why:** Frontend needs the MongoDB _id to fetch attendance records correctly.

#### 2. **AuthController.java** - Updated Login Response
```java
res.id = user.getId();              // ✅ MongoDB _id
res.name = user.getName();
res.email = user.getEmail();
res.role = user.getRole();
res.token = token;
res.companyId = user.getCompanyId();
res.department = user.getDepartment();
res.managerEmail = user.getManagerEmail();
res.empId = emp != null ? emp.getEmployeeId() : user.getEmployeeId();
res.employeeId = emp != null ? emp.getEmployeeId() : user.getEmployeeId();
```

**Why:** Ensures all necessary user data is sent to frontend after login.

#### 3. **AttendanceService.java** - Manager Attendance Logic
```java
public List<AttendanceDTO> getManagerAttendance(String managerEmail) {
    // Get all users under this manager
    List<User> team = userRepo.findByManagerEmail(managerEmail);
    
    List<String> userIds = new ArrayList<>();
    team.forEach(u -> userIds.add(u.getId()));
    
    // Also include the manager's own records
    Optional<User> managerOpt = userRepo.findByEmail(managerEmail);
    if (managerOpt.isPresent()) {
        User manager = managerOpt.get();
        String managerId = manager.getId();
        if (!userIds.contains(managerId)) {
            userIds.add(managerId);
        }
    }
    
    // Fetch all records for manager + team
    List<Attendance> records = attendanceRepo.findByUserIdIn(userIds);
    
    // Enrich and return
    return records.stream()
            .map(att -> {
                AttendanceDTO dto = enrichAttendance(att);
                
                // If this is the manager's own record, ensure correct details
                if (managerOpt.isPresent() && att.getUserId().equals(managerOpt.get().getId())) {
                    User manager = managerOpt.get();
                    dto.setName(manager.getName() != null ? manager.getName() : manager.getEmail());
                    dto.setEmpId(manager.getEmployeeId() != null ? manager.getEmployeeId() : "MGR-" + manager.getId().substring(0, 6));
                    dto.setDepartment(manager.getDepartment() != null ? manager.getDepartment() : "Management");
                    dto.setReportingManager("-"); // Manager has no reporting manager
                }
                
                return dto;
            })
            .collect(Collectors.toList());
}
```

**Why:** Returns both manager's own records and team records.

#### 4. **TimesheetService.java** - Manager Timesheet Logic
```java
if (auth.getAuthorities().stream()
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
}
```

**Why:** Fetches manager's own + team timesheet data.

#### 5. **AttendanceRepository.java** - New Query Methods
```java
List<Attendance> findByDateStartingWith(String month);
List<Attendance> findByUserIdAndDateStartingWith(String userId, String month);
List<Attendance> findByUserIdInAndDateStartingWith(List<String> userIds, String month);
```

**Why:** Enables efficient batch queries for timesheet data.

### Frontend Changes

#### 1. **Login.jsx** - Pass User ID to Context
```javascript
login({
  id: data.id,              // ✅ MongoDB _id
  _id: data.id,             // ✅ Fallback
  name: data.name,
  email: data.email,
  role: data.role,
  token: data.token,
  empId: data.empId || data.employeeId,
  employeeId: data.employeeId || data.empId,
  department: data.department || data.dept,
  reportingManager: data.reportingManager || data.manager,
  managerEmail: data.managerEmail,
  companyId: data.companyId
});
```

**Why:** Ensures frontend has the MongoDB _id needed for attendance queries.

#### 2. **Attendance.jsx** - Manager Data Fetching
```javascript
if (role === "manager") {
    // Manager sees their own + their team's attendance
    const managerEmail = loggedUser.email;
    response = await getManagerAttendance(managerEmail);
}
```

**Why:** Calls the correct backend endpoint for manager data.

#### 3. **Timesheet.jsx** - Manager Filtering Logic
```javascript
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

**Why:** Properly filters manager's own + team records in timesheet.

## 🔧 What Was Fixed

### Issue 1: Manager's Own Records Not Displaying
**Root Cause:** Frontend didn't have the MongoDB _id, so it couldn't fetch manager's own records.
**Fix:** Added `id` field to LoginResponse and passed it to frontend.

### Issue 2: Double Check-In Popup
**Root Cause:** userId normalization was inconsistent between check-in and retrieval.
**Fix:** Ensured userId is normalized to MongoDB _id in both checkIn() and checkOut() methods.

### Issue 3: Manager Not Seeing Team Records
**Root Cause:** getManagerAttendance() wasn't including team members.
**Fix:** Updated to fetch both manager's own + team records using findByUserIdIn().

### Issue 4: Employee Seeing Manager's Timesheet
**Root Cause:** No role-based filtering in timesheet queries.
**Fix:** Added role-based filtering in TimesheetService.getMonthlySummary().

## 📋 Testing Checklist

### Manager (Aishmanager@omoi.com)
- [ ] Login successful
- [ ] Attendance page shows manager's own check-in records
- [ ] Attendance page shows adhviti's check-in records
- [ ] Check-in button works (single popup, no double popup)
- [ ] Check-out button works
- [ ] Timesheet page shows manager's own record
- [ ] Timesheet page shows adhviti's record
- [ ] Manager's reportingManager shows "-"
- [ ] adhviti's reportingManager shows manager's email/name

### Employee (adhviti@omoi.com)
- [ ] Login successful
- [ ] Attendance page shows ONLY adhviti's records
- [ ] Attendance page does NOT show manager's records
- [ ] Check-in/Check-out works
- [ ] Timesheet page shows ONLY adhviti's record
- [ ] Timesheet page does NOT show manager's record

### Admin (admin@omoi.com)
- [ ] Login successful
- [ ] Attendance page shows ALL records
- [ ] Timesheet page shows ALL records

## 🚀 Deployment Steps

### Step 1: Stop Old Backend
```bash
# If running, press Ctrl+C in the terminal
```

### Step 2: Start Fresh Backend
```bash
cd HRMS-Backend
mvn spring-boot:run
```

Wait for: `Started HmrsBackendApplication in X seconds`

### Step 3: Clear Browser Cache
1. Open DevTools (F12)
2. Go to Application → Storage
3. Click "Clear Site Data"
4. OR: Ctrl+Shift+Delete → All time → Clear data

### Step 4: Test Each Role

## 📊 Data Flow

```
Manager Login
    ↓
AuthController.login()
    ↓
LoginResponse (includes id, email, role, empId)
    ↓
Frontend stores in localStorage
    ↓
Manager clicks Attendance
    ↓
Attendance.jsx calls getManagerAttendance(email)
    ↓
AttendanceService.getManagerAttendance()
    ↓
Fetches manager's own + team records
    ↓
Returns enriched AttendanceDTO list
    ↓
Frontend displays in table
```

## 🔍 Verification

### Check Backend Logs
```
Started HmrsBackendApplication in X seconds
```

### Check Browser Console
```
🔥 LOGIN RESPONSE: id=..., empId=...
```

### Check MongoDB
```javascript
// Manager user
db.users.findOne({ email: "Aishmanager@omoi.com" })

// Manager's attendance
db.attendances.find({ userId: "<manager_id>" })

// Team member's attendance
db.attendances.find({ userId: "<adhviti_id>" })
```

## ✅ Status

- ✅ Backend compiled successfully
- ✅ Backend packaged successfully
- ✅ All code changes implemented
- ✅ Ready for testing

## 📝 Next Steps

1. **Restart Backend:** `mvn spring-boot:run`
2. **Clear Browser Cache:** Ctrl+Shift+Delete
3. **Test Manager Login:** Verify attendance and timesheet display
4. **Test Employee Login:** Verify only own records show
5. **Test Admin Login:** Verify all records show
6. **Report Results:** Document any issues found

---

**Last Updated:** May 7, 2026
**Status:** ✅ Ready for Testing
**Compilation:** ✅ Success (Exit Code: 0)
**Packaging:** ✅ Success (Exit Code: 0)
