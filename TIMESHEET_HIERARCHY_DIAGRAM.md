# Timesheet Hierarchy Diagram

## Organization Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                         ADMIN                                   │
│                    (Sees All Data)                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  Padmanabhmanager@omoi.com                      │
│                    (Top Manager)                                │
│  Sees: Own + Mahesh + Mahesh's Employees                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────────────┐
                    │                 │
        ┌───────────┴─────────────────┴───────────┐
        ↓                                         ↓
┌──────────────────┐                    ┌──────────────────┐
│ Mahesh@gmail.com │                    │ Other Manager    │
│   (Manager)      │                    │   (Manager)      │
│ Sees: Own +      │                    │ Sees: Own +      │
│ Employees        │                    │ Employees        │
└──────────────────┘                    └──────────────────┘
        ↓                                         ↓
    ┌───┴───┬───────┐                       ┌────┴────┐
    ↓       ↓       ↓                       ↓         ↓
┌────────┐┌────────┐┌────────┐        ┌────────┐┌────────┐
│Employee│ │Employee│ │Employee│        │Employee│ │Employee│
│   1    │ │   2    │ │   3    │        │   4    │ │   5    │
│(Sees   │ │(Sees   │ │(Sees   │        │(Sees   │ │(Sees   │
│ Own)   │ │ Own)   │ │ Own)   │        │ Own)   │ │ Own)   │
└────────┘ └────────┘ └────────┘        └────────┘ └────────┘
```

---

## Data Flow: Padmanabhmanager's Timesheet Request

```
┌─────────────────────────────────────────────────────────────────┐
│ Padmanabhmanager logs in                                        │
│ Email: Padmanabhmanager@omoi.com                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Frontend: GET /api/timesheet/monthly?month=2026-05             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Backend: TimesheetService.getMonthlySummary()                  │
│                                                                 │
│ 1. Get manager's email: Padmanabhmanager@omoi.com             │
│ 2. Query: db.users.find({                                     │
│      managerEmail: "Padmanabhmanager@omoi.com"                │
│    })                                                          │
│    Result: [Mahesh]                                           │
│                                                                 │
│ 3. Build userIds list:                                        │
│    - Padmanabhmanager's ID                                    │
│    - Padmanabhmanager's email                                 │
│    - Mahesh's ID                                              │
│    - Mahesh's email                                           │
│                                                                 │
│ 4. Query: db.attendance.find({                                │
│      userId: [list of userIds]                                │
│    })                                                          │
│    Result: All attendance records for manager + team          │
│                                                                 │
│ 5. Aggregate into timesheet summary                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Response: TimesheetSummary[]                                    │
│ [                                                               │
│   {empId: "MGR001", empName: "Padmanabhmanager", ...},        │
│   {empId: "MGR002", empName: "Mahesh", ...},                  │
│   {empId: "EMP001", empName: "Employee1", ...},               │
│   {empId: "EMP002", empName: "Employee2", ...},               │
│   {empId: "EMP003", empName: "Employee3", ...}                │
│ ]                                                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Frontend: Display in table                                      │
│                                                                 │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ EMP ID │ NAME │ DEPT │ REPORTING MGR │ PRESENT │ ... │  │
│ ├──────────────────────────────────────────────────────────┤  │
│ │ MGR001 │ Padmanabhmanager │ Mgmt │ - │ 20 │ ... │  │
│ │ MGR002 │ Mahesh │ IT │ Padmanabhmanager │ 18 │ ... │  │
│ │ EMP001 │ Employee1 │ IT │ Mahesh │ 19 │ ... │  │
│ │ EMP002 │ Employee2 │ IT │ Mahesh │ 20 │ ... │  │
│ │ EMP003 │ Employee3 │ IT │ Mahesh │ 19 │ ... │  │
│ └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Employee's Timesheet Request

```
┌─────────────────────────────────────────────────────────────────┐
│ Employee logs in                                                │
│ Email: employee1@gmail.com                                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Frontend: GET /api/timesheet/monthly?month=2026-05             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Backend: TimesheetService.getMonthlySummary()                  │
│                                                                 │
│ 1. Check role: ROLE_EMPLOYEE                                  │
│ 2. Query: db.attendance.find({                                │
│      userId: "employee1@gmail.com",                           │
│      date: { $regex: "^2026-05" }                             │
│    })                                                          │
│    Result: Only employee's attendance records                 │
│                                                                 │
│ 3. Aggregate into timesheet summary                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Response: TimesheetSummary[]                                    │
│ [                                                               │
│   {empId: "EMP001", empName: "Employee1", ...}                │
│ ]                                                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Frontend: Display in table                                      │
│                                                                 │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ EMP ID │ NAME │ DEPT │ REPORTING MGR │ PRESENT │ ... │  │
│ ├──────────────────────────────────────────────────────────┤  │
│ │ EMP001 │ Employee1 │ IT │ Mahesh │ 19 │ ... │  │
│ └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│ NO BUTTONS (Submit, Approve, Reject)                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## MongoDB Structure

### User Document
```json
{
  "_id": ObjectId("..."),
  "email": "mahesh@gmail.com",
  "employeeId": "MGR002",
  "name": "Mahesh",
  "role": "manager",
  "department": "IT",
  "managerEmail": "Padmanabhmanager@omoi.com",  // ← KEY FIELD
  "managerId": "...",
  "managerName": "Padmanabhmanager"
}
```

### Attendance Document
```json
{
  "_id": ObjectId("..."),
  "userId": "mahesh@gmail.com",
  "date": "2026-05-08",
  "checkIn": "09:30",
  "checkOut": "17:30",
  "locationIn": "...",
  "locationOut": "...",
  "status": "Pending Approval"
}
```

---

## Query Examples

### Find all managers
```javascript
db.users.find({ role: "manager" })
```

### Find Padmanabhmanager's direct reports
```javascript
db.users.find({ managerEmail: "Padmanabhmanager@omoi.com" })
// Returns: [Mahesh, Other Manager, ...]
```

### Find Mahesh's direct reports
```javascript
db.users.find({ managerEmail: "mahesh@gmail.com" })
// Returns: [Employee1, Employee2, Employee3, ...]
```

### Find all attendance for Mahesh
```javascript
db.attendance.find({ userId: "mahesh@gmail.com" })
```

---

## Summary

```
Hierarchy:
  Padmanabhmanager
    └── Mahesh
        ├── Employee1
        ├── Employee2
        └── Employee3

Timesheet Visibility:
  Padmanabhmanager sees: Self + Mahesh + Employees
  Mahesh sees: Self + Employees
  Employee1 sees: Self only
  Admin sees: Everyone
```

---

## Done! ✅

This diagram shows how the timesheet hierarchy works with the new changes.
