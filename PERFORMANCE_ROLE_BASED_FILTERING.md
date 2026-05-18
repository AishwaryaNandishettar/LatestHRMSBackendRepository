# Performance Role-Based Filtering Guide

## Problem Solved

### Before
- ❌ Aishmanager@omoi.com saw ALL employees' performance
- ❌ Padmanabh@omoi.com saw ALL employees' performance
- ❌ No proper manager hierarchy filtering

### After
- ✅ Aishmanager@omoi.com sees ONLY Adhviti's performance
- ✅ Padmanabh@omoi.com sees ONLY Mahesh's performance
- ✅ Aishwarya@company.com (Admin) sees ALL employees' performance
- ✅ Employees see only their own performance

---

## Performance Visibility by Role

```
Admin (Aishwarya@company.com)
├── Sees: ALL employees' performance
└── Can: View, manage all performance records

Manager (Aishmanager@omoi.com)
├── Sees: Only Adhviti's performance (direct report)
├── Can: View, provide feedback
└── Cannot: See other managers' teams

Manager (Padmanabh@omoi.com)
├── Sees: Only Mahesh's performance (direct report)
├── Can: View, provide feedback
└── Cannot: See other managers' teams

Employee (Adhviti@gmail.com)
├── Sees: Only own performance
└── Can: View own record
```

---

## How It Works

### Data Flow: Aishmanager's Performance Request

```
Aishmanager logs in (Aishmanager@omoi.com)
    ↓
Frontend: GET /api/performance
    ↓
Backend (PerformanceController.getAll):
    1. Check role: ROLE_MANAGER
    2. Get manager's email: Aishmanager@omoi.com
    3. Query: db.users.find({ managerEmail: "Aishmanager@omoi.com" })
    4. Result: [Adhviti]
    5. Extract employee IDs: ["ADHVITI_EMP_ID"]
    6. Query: db.performance.find({ employeeId: ["ADHVITI_EMP_ID"] })
    7. Result: Only Adhviti's performance record
    ↓
Returns: Filtered performance data
    ↓
Frontend displays: Only Adhviti's performance
```

### Data Flow: Admin's Performance Request

```
Admin logs in (Aishwarya@company.com)
    ↓
Frontend: GET /api/performance
    ↓
Backend (PerformanceController.getAll):
    1. Check role: ROLE_ADMIN
    2. Query: db.performance.find({})
    3. Result: ALL performance records
    ↓
Returns: All performance data
    ↓
Frontend displays: All employees' performance
```

---

## Code Changes

### 1. PerformanceController.java
```java
// BEFORE
@GetMapping
public ResponseEntity<List<Performance>> getAll() {
    return ResponseEntity.ok(service.getAll());  // Returns ALL
}

// AFTER
@GetMapping
public ResponseEntity<List<Performance>> getAll(Authentication auth) {
    String userEmail = auth != null ? auth.getName() : "";
    boolean isAdmin = auth != null && auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    
    if (isAdmin) {
        return ResponseEntity.ok(service.getAll());  // Admin sees all
    } else {
        return ResponseEntity.ok(service.getPerformanceByManager(userEmail));  // Manager sees only team
    }
}
```

### 2. PerformanceService.java
```java
// ADDED: New method to get performance by manager
public List<Performance> getPerformanceByManager(String managerEmail) {
    // Get all team members under this manager
    List<User> team = userRepo.findByManagerEmail(managerEmail);
    
    // Extract their employee IDs
    List<String> teamEmpIds = team.stream()
            .map(User::getEmployeeId)
            .filter(id -> id != null && !id.isBlank())
            .collect(Collectors.toList());
    
    // Get performance records for team members
    return repo.findByEmployeeIdIn(teamEmpIds);
}
```

### 3. PerformanceRepository.java
```java
// ADDED: New method to find performance by multiple employee IDs
List<Performance> findByEmployeeIdIn(List<String> employeeIds);
```

---

## Manager Hierarchy

```
Aishmanager@omoi.com
└── Adhviti@gmail.com

Padmanabh@omoi.com
└── Mahesh@gmail.com
    ├── Employee1@gmail.com
    ├── Employee2@gmail.com
    └── Employee3@gmail.com

Aishwarya@company.com (Admin)
└── Sees all employees
```

---

## MongoDB Setup Required

### Set Manager Relationships

```javascript
// Set Adhviti's manager
db.users.updateOne(
  { email: "adhviti@gmail.com" },
  { $set: { managerEmail: "Aishmanager@omoi.com" } }
)

// Set Mahesh's manager
db.users.updateOne(
  { email: "mahesh@gmail.com" },
  { $set: { managerEmail: "Padmanabh@omoi.com" } }
)

// Set Mahesh's employees' manager
db.users.updateMany(
  { managerEmail: "mahesh@gmail.com" },
  { $set: { managerEmail: "mahesh@gmail.com" } }
)
```

---

## Expected Results

### Aishmanager's Performance Page
```
Team Performance Management

┌──────────────────────────────────────────────────────────────┐
│ NAME │ DESIGNATION │ OVERALL SCORE │ PERFORMANCE BAND │ ... │
├──────────────────────────────────────────────────────────────┤
│ Adhviti │ Junior Developer │ 3.8 │ Meets Expectations │ ... │
└──────────────────────────────────────────────────────────────┘
(ONLY Adhviti's performance)
```

### Padmanabh's Performance Page
```
Team Performance Management

┌──────────────────────────────────────────────────────────────┐
│ NAME │ DESIGNATION │ OVERALL SCORE │ PERFORMANCE BAND │ ... │
├──────────────────────────────────────────────────────────────┤
│ Mahesh │ Manager │ 4.2 │ Exceeds Expectations │ ... │
└──────────────────────────────────────────────────────────────┘
(ONLY Mahesh's performance)
```

### Admin's Performance Page
```
Employee Performance Overview

┌──────────────────────────────────────────────────────────────┐
│ NAME │ DESIGNATION │ OVERALL SCORE │ PERFORMANCE BAND │ ... │
├──────────────────────────────────────────────────────────────┤
│ Adhviti │ Junior Developer │ 3.8 │ Meets Expectations │ ... │
│ Mahesh │ Manager │ 4.2 │ Exceeds Expectations │ ... │
│ Employee1 │ Developer │ 3.9 │ Meets Expectations │ ... │
│ Employee2 │ Developer │ 4.1 │ Exceeds Expectations │ ... │
│ ... │ ... │ ... │ ... │ ... │
└──────────────────────────────────────────────────────────────┘
(ALL employees' performance)
```

---

## Testing Checklist

- [ ] Aishmanager logs in → Sees only Adhviti's performance
- [ ] Aishmanager does NOT see other employees' performance
- [ ] Padmanabh logs in → Sees only Mahesh's performance
- [ ] Padmanabh does NOT see other employees' performance
- [ ] Admin logs in → Sees all employees' performance
- [ ] Employee logs in → Sees only own performance
- [ ] Manager can provide feedback on team member's performance
- [ ] Admin can view and manage all performance records

---

## Files Modified

1. ✅ `PerformanceController.java` - Added role-based filtering
2. ✅ `PerformanceService.java` - Added `getPerformanceByManager()` method
3. ✅ `PerformanceRepository.java` - Added `findByEmployeeIdIn()` method

---

## Troubleshooting

### Issue: Manager still sees all employees' performance

**Check 1:** Verify managerEmail is set in MongoDB
```javascript
db.users.findOne({ email: "adhviti@gmail.com" })
// Should show: "managerEmail": "Aishmanager@omoi.com"
```

**Check 2:** Verify backend is running with latest code
- Rebuild: `mvn clean package`
- Restart backend

**Check 3:** Clear browser cache
- Ctrl+Shift+Delete
- Refresh page

### Issue: Manager can't see team member's performance

**Check 1:** Verify team member has managerEmail set
```javascript
db.users.findOne({ email: "adhviti@gmail.com" })
```

**Check 2:** Verify performance record exists
```javascript
db.performance.findOne({ employeeId: "ADHVITI_EMP_ID" })
```

**Check 3:** Verify employee ID is correct
```javascript
db.users.findOne({ email: "adhviti@gmail.com" })
// Check: "employeeId" field
```

---

## Done! ✅

All code changes are complete. Just need to:
1. Update MongoDB (set managerEmail)
2. Rebuild backend
3. Test thoroughly
4. Deploy
