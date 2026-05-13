# Task Role-Based Filtering Guide

## Problem Solved

### Before
- ❌ Padmanabhmanager saw ALL tasks (including Adhviti's tasks)
- ❌ Tasks assigned to Adhviti appeared in Padmanabhmanager's view
- ❌ No proper manager hierarchy filtering

### After
- ✅ Padmanabhmanager sees ONLY tasks assigned to Mahesh (his direct report)
- ✅ Adhviti's tasks do NOT appear in Padmanabhmanager's view
- ✅ Mahesh sees tasks assigned to him AND his employees
- ✅ Employees see only their own tasks
- ✅ Admin sees all tasks

---

## How It Works

### Task Visibility by Role

```
Admin
├── Sees: ALL tasks
└── Can: Create, assign, approve, reject

Manager (Padmanabhmanager)
├── Sees: Own tasks + Team members' tasks (Mahesh + Mahesh's employees)
├── Can: Create tasks for team, approve/reject
└── Cannot: See tasks from other managers' teams

Manager (Mahesh)
├── Sees: Own tasks + Employees' tasks
├── Can: Create tasks for employees, approve/reject
└── Cannot: See tasks from other managers' teams

Employee (Adhviti)
├── Sees: Only own tasks
├── Can: Accept, work on, submit tasks
└── Cannot: See other employees' tasks
```

---

## Data Flow

### Padmanabhmanager's Task Request

```
Padmanabhmanager logs in (Padmanabhmanager@omoi.com)
    ↓
Frontend: GET /api/tasks
    ↓
Backend (TaskController.getAllTasks):
    1. Check role: ROLE_MANAGER
    2. Get manager's email: Padmanabhmanager@omoi.com
    3. Query: db.users.find({ managerEmail: "Padmanabhmanager@omoi.com" })
    4. Result: [Mahesh]
    5. Query: db.tasks.find({ assignee: ["Padmanabhmanager@omoi.com", "mahesh@gmail.com"] })
    6. Result: Only tasks assigned to Padmanabhmanager or Mahesh
    ↓
Returns: Filtered tasks
    ↓
Frontend displays: Only Padmanabhmanager's + Mahesh's tasks
```

### Mahesh's Task Request

```
Mahesh logs in (mahesh@gmail.com)
    ↓
Frontend: GET /api/tasks
    ↓
Backend (TaskController.getAllTasks):
    1. Check role: ROLE_MANAGER
    2. Get manager's email: mahesh@gmail.com
    3. Query: db.users.find({ managerEmail: "mahesh@gmail.com" })
    4. Result: [Employee1, Employee2, Employee3]
    5. Query: db.tasks.find({ assignee: ["mahesh@gmail.com", "employee1@gmail.com", "employee2@gmail.com", "employee3@gmail.com"] })
    6. Result: Tasks assigned to Mahesh or his employees
    ↓
Returns: Filtered tasks
    ↓
Frontend displays: Mahesh's + employees' tasks
```

### Employee's Task Request

```
Employee logs in (employee1@gmail.com)
    ↓
Frontend: GET /api/tasks/my
    ↓
Backend (TaskController.getMyTasks):
    1. Query: db.tasks.find({ assignee: "employee1@gmail.com" })
    2. Result: Only tasks assigned to this employee
    ↓
Returns: Employee's tasks only
    ↓
Frontend displays: Only employee's tasks
```

---

## Code Changes

### 1. TaskController.java
```java
// BEFORE
@GetMapping
public List<Task> getAllTasks() {
    return service.getAllTasks();  // Returns ALL tasks
}

// AFTER
@GetMapping
public List<Task> getAllTasks(Authentication auth) {
    String userEmail = auth != null ? auth.getName() : "";
    boolean isAdmin = auth != null && auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    
    if (isAdmin) {
        return service.getAllTasks();  // Admin sees all
    } else {
        return service.getTasksByManager(userEmail);  // Manager sees only team tasks
    }
}
```

### 2. TaskService.java
```java
// ADDED: New method to get tasks by manager
public List<Task> getTasksByManager(String managerEmail) {
    // Get all team members under this manager
    List<User> team = userRepo.findByManagerEmail(managerEmail);
    
    // Extract their emails
    List<String> teamEmails = team.stream()
            .map(User::getEmail)
            .collect(Collectors.toList());
    
    // Also include the manager's own email
    teamEmails.add(managerEmail);
    
    // Get tasks assigned to team members
    return repo.findByAssigneeIn(teamEmails);
}
```

### 3. TaskRepository.java
```java
// ADDED: New method to find tasks by multiple assignees
List<Task> findByAssigneeIn(List<String> assignees);
```

---

## MongoDB Setup Required

### Set Manager Relationships

```javascript
// Set Mahesh's manager
db.users.updateOne(
  { email: "mahesh@gmail.com" },
  { $set: { managerEmail: "Padmanabhmanager@omoi.com" } }
)

// Set Mahesh's employees' manager
db.users.updateMany(
  { managerEmail: "mahesh@gmail.com" },
  { $set: { managerEmail: "mahesh@gmail.com" } }
)
```

---

## Expected Results

### Padmanabhmanager's Task Page
```
Total: 5 | Assigned: 1 | In Progress: 1 | Submitted: 0 | Completed: 2 | Rejected: 0

┌──────────────────────────────────────────────────────────────────┐
│ TASK │ ASSIGNED TO │ PRIORITY │ ASSIGNED DATE │ DUE DATE │ ... │
├──────────────────────────────────────────────────────────────────┤
│ Task1 │ Padmanabhmanager │ HIGH │ 26 Apr 2026 │ 4/27/2026 │ ... │
│ Task2 │ Mahesh │ MEDIUM │ 29 Apr 2026 │ 4/29/2026 │ ... │
│ Task3 │ Mahesh │ HIGH │ 01 May 2026 │ 5/1/2026 │ ... │
└──────────────────────────────────────────────────────────────────┘
(NO Adhviti tasks)
```

### Mahesh's Task Page
```
Total: 4 | Assigned: 1 | In Progress: 1 | Submitted: 0 | Completed: 2 | Rejected: 0

┌──────────────────────────────────────────────────────────────────┐
│ TASK │ ASSIGNED TO │ PRIORITY │ ASSIGNED DATE │ DUE DATE │ ... │
├──────────────────────────────────────────────────────────────────┤
│ Task2 │ Mahesh │ MEDIUM │ 29 Apr 2026 │ 4/29/2026 │ ... │
│ Task3 │ Mahesh │ HIGH │ 01 May 2026 │ 5/1/2026 │ ... │
│ Task4 │ Employee1 │ MEDIUM │ 02 May 2026 │ 5/2/2026 │ ... │
│ Task5 │ Employee2 │ HIGH │ 03 May 2026 │ 5/3/2026 │ ... │
└──────────────────────────────────────────────────────────────────┘
(Mahesh's + employees' tasks)
```

### Adhviti's Task Page
```
Total: 2 | Assigned: 0 | In Progress: 1 | Submitted: 0 | Completed: 1 | Rejected: 0

┌──────────────────────────────────────────────────────────────────┐
│ TASK │ ASSIGNED TO │ PRIORITY │ ASSIGNED DATE │ DUE DATE │ ... │
├──────────────────────────────────────────────────────────────────┤
│ Task6 │ Adhviti │ MEDIUM │ 04 May 2026 │ 5/4/2026 │ ... │
│ Task7 │ Adhviti │ HIGH │ 05 May 2026 │ 5/5/2026 │ ... │
└──────────────────────────────────────────────────────────────────┘
(Only Adhviti's tasks)
```

---

## Manager Hierarchy

```
Padmanabhmanager@omoi.com
└── Mahesh@gmail.com
    ├── Employee1@gmail.com
    ├── Employee2@gmail.com
    └── Employee3@gmail.com

Aishmanager@omoi.com
└── Adhviti@gmail.com
```

---

## Testing Checklist

- [ ] Padmanabhmanager logs in → Sees only Mahesh's tasks
- [ ] Padmanabhmanager does NOT see Adhviti's tasks
- [ ] Mahesh logs in → Sees own + employees' tasks
- [ ] Adhviti logs in → Sees only own tasks
- [ ] Admin logs in → Sees all tasks
- [ ] Padmanabhmanager can create tasks for Mahesh
- [ ] Mahesh can create tasks for employees
- [ ] Employees can only accept/work on their own tasks

---

## Files Modified

1. ✅ `TaskController.java` - Added role-based filtering
2. ✅ `TaskService.java` - Added `getTasksByManager()` method
3. ✅ `TaskRepository.java` - Added `findByAssigneeIn()` method

---

## Troubleshooting

### Issue: Manager still sees all tasks

**Check 1:** Verify managerEmail is set in MongoDB
```javascript
db.users.findOne({ email: "mahesh@gmail.com" })
// Should show: "managerEmail": "Padmanabhmanager@omoi.com"
```

**Check 2:** Verify backend is running with latest code
- Rebuild: `mvn clean package`
- Restart backend

**Check 3:** Clear browser cache
- Ctrl+Shift+Delete
- Refresh page

### Issue: Manager can't see team members' tasks

**Check 1:** Verify team members have managerEmail set
```javascript
db.users.find({ managerEmail: "mahesh@gmail.com" })
```

**Check 2:** Verify tasks are assigned to team members
```javascript
db.tasks.find({ assignee: "mahesh@gmail.com" })
```

---

## Done! ✅

All code changes are complete. Just need to:
1. Update MongoDB (set managerEmail)
2. Rebuild backend
3. Test thoroughly
4. Deploy
