# ⚡ Quick Fix - Do This NOW

## Problem
Manager record exists in Employee collection - DELETE IT

## Solution (2 minutes)

### Option 1: MongoDB Compass (Easy)
1. Open MongoDB Compass
2. Go to: `hrms_db` → `employees`
3. Find: `email: "Aishmanager@omoi.com"`
4. Click delete icon
5. Confirm delete

### Option 2: MongoDB Shell (mongosh)
```javascript
use hrms_db
db.employees.deleteOne({ email: "Aishmanager@omoi.com" })
```

### Option 3: MongoDB Command Line
```bash
mongosh
use hrms_db
db.employees.deleteOne({ email: "Aishmanager@omoi.com" })
```

---

## After Deletion

### Step 1: Restart Backend
```bash
cd e:\HRMSProject\HRMS-Backend
mvn spring-boot:run
```

### Step 2: Clear Browser Cache
- Ctrl+Shift+Delete
- Select "All time"
- Clear data
- Refresh: Ctrl+R

### Step 3: Test
1. Login as Aishmanager@omoi.com
2. Go to Attendance page
3. Should see your check-in records ✅
4. Go to Timesheet page
5. Should see ONLY Adhviti's record ✅

---

## Verify Deletion

### Check 1: Manager record deleted
```javascript
db.employees.find({ email: "Aishmanager@omoi.com" })
// Should return: no documents
```

### Check 2: Only team members exist
```javascript
db.employees.find({ managerEmail: "Aishmanager@omoi.com" })
// Should return: Only Adhviti
// Should NOT return: Manager
```

---

## Done! ✅

Manager's check-in will now display correctly.
Timesheet will show only team members.

Time needed: 5 minutes
