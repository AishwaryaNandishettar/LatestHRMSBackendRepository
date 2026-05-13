# Setup Manager Hierarchy in MongoDB

## Goal
Set up the manager hierarchy so that:
- **Padmanabhmanager** manages **Mahesh**
- **Mahesh** manages his employees
- Timesheet data flows up the hierarchy

---

## Step 1: Set Mahesh's Manager

In MongoDB Atlas, run:

```javascript
db.users.updateOne(
  { email: "mahesh@gmail.com" },
  { $set: { managerEmail: "Padmanabhmanager@omoi.com" } }
)
```

**Verify:**
```javascript
db.users.findOne({ email: "mahesh@gmail.com" })
// Should show: "managerEmail": "Padmanabhmanager@omoi.com"
```

---

## Step 2: Set Mahesh's Employees' Manager

For each employee under Mahesh, run:

```javascript
// Employee 1
db.users.updateOne(
  { email: "employee1@gmail.com" },
  { $set: { managerEmail: "mahesh@gmail.com" } }
)

// Employee 2
db.users.updateOne(
  { email: "employee2@gmail.com" },
  { $set: { managerEmail: "mahesh@gmail.com" } }
)

// Employee 3
db.users.updateOne(
  { email: "employee3@gmail.com" },
  { $set: { managerEmail: "mahesh@gmail.com" } }
)
```

**Or update all at once:**
```javascript
db.users.updateMany(
  { department: "IT" },  // Adjust filter as needed
  { $set: { managerEmail: "mahesh@gmail.com" } }
)
```

---

## Step 3: Verify the Hierarchy

```javascript
// Padmanabhmanager's direct reports
db.users.find({ managerEmail: "Padmanabhmanager@omoi.com" })
// Should return: Mahesh

// Mahesh's direct reports
db.users.find({ managerEmail: "mahesh@gmail.com" })
// Should return: Employee1, Employee2, Employee3, etc.
```

---

## Step 4: Test in Frontend

### Test 1: Padmanabhmanager's View
1. Log in as **Padmanabhmanager@omoi.com**
2. Go to **Timesheet** page
3. Should see:
   - Own timesheet
   - Mahesh's timesheet
   - Mahesh's employees' timesheet

### Test 2: Mahesh's View
1. Log in as **mahesh@gmail.com**
2. Go to **Timesheet** page
3. Should see:
   - Own timesheet
   - All employees' timesheet

### Test 3: Employee's View
1. Log in as **employee@gmail.com**
2. Go to **Timesheet** page
3. Should see:
   - Only own timesheet
   - NO "Submit Timesheet" button

---

## Complete Hierarchy Example

```
Padmanabhmanager@omoi.com (Top Manager)
├── Mahesh (Manager)
│   ├── Employee1
│   ├── Employee2
│   └── Employee3
└── Other Manager (if any)
    ├── Other Employee1
    └── Other Employee2
```

---

## MongoDB Query Reference

### Find all managers
```javascript
db.users.find({ role: "manager" })
```

### Find all employees under a manager
```javascript
db.users.find({ managerEmail: "mahesh@gmail.com" })
```

### Find users without a manager
```javascript
db.users.find({ managerEmail: { $exists: false } })
```

### Update multiple users at once
```javascript
db.users.updateMany(
  { _id: { $in: [id1, id2, id3] } },
  { $set: { managerEmail: "mahesh@gmail.com" } }
)
```

---

## Troubleshooting

### Issue: Mahesh's employees don't show in Padmanabhmanager's timesheet

**Check 1:** Verify Mahesh has managerEmail set
```javascript
db.users.findOne({ email: "mahesh@gmail.com" })
```

**Check 2:** Verify employees have managerEmail set to Mahesh
```javascript
db.users.findOne({ email: "employee1@gmail.com" })
```

**Check 3:** Verify attendance records exist
```javascript
db.attendance.find({ userId: "mahesh@gmail.com" }).limit(5)
```

**Check 4:** Clear browser cache and refresh

---

## Done! ✅

Your manager hierarchy is now set up. Timesheet data will flow up the hierarchy:
- Employees → Mahesh → Padmanabhmanager
