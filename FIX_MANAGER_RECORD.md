# Fix Manager Record Issue

## Problem
Manager (Aishmanager@omoi.com) has a record in Employee collection with `managerEmail: "Aishmanager@omoi.com"` which is wrong.

## Solution
Delete the manager's record from Employee collection.

---

## MongoDB Commands

### Step 1: Find Manager's Employee Record
```javascript
db.employees.find({ email: "Aishmanager@omoi.com" })
```

### Step 2: Delete Manager's Employee Record
```javascript
db.employees.deleteOne({ email: "Aishmanager@omoi.com" })
```

### Step 3: Verify Deletion
```javascript
db.employees.find({ email: "Aishmanager@omoi.com" })
// Should return: no documents
```

### Step 4: Verify Only Team Members Exist
```javascript
db.employees.find({ managerEmail: "Aishmanager@omoi.com" })
// Should return: Only Adhviti and other team members
// Should NOT return: Manager's own record
```

---

## Using MongoDB Compass

1. Open MongoDB Compass
2. Connect to your database
3. Go to: `hrms_db` → `employees`
4. Find: `email: "Aishmanager@omoi.com"`
5. Delete this record
6. Verify only team members remain

---

## After Deletion

### Restart Backend
```bash
cd e:\HRMSProject\HRMS-Backend
mvn spring-boot:run
```

### Clear Browser Cache
- Ctrl+Shift+Delete
- Select "All time"
- Clear data
- Refresh: Ctrl+R

### Test Again
1. Login as Aishmanager@omoi.com
2. Go to Attendance page
3. Should see: Your check-in records
4. Go to Timesheet page
5. Should see: Only Adhviti's record (not your own)

---

## Expected Result

### Attendance Page
- ✅ Manager's check-in records display
- ✅ Team member records display

### Timesheet Page
- ✅ Only team member records display (Adhviti)
- ❌ Manager's own record should NOT display

---

## Database Structure (Correct)

### Users Collection
```javascript
{
  email: "Aishmanager@omoi.com",
  name: "Aishmanager",
  employeeId: "MGR001",
  role: "manager",
  managerEmail: null  // Manager has no manager
}
```

### Employees Collection
```javascript
// Only team members should be here
{
  email: "adhviti@omoi.com",
  name: "Adhviti",
  employeeId: "OMOI123",
  managerEmail: "Aishmanager@omoi.com"  // Points to manager
}

// Manager should NOT have a record here
```

### Attendance Collection
```javascript
// Manager's check-in
{
  userId: "manager_id",
  empId: "MGR001",
  name: "Aishmanager",
  date: "2026-05-07",
  checkIn: "09:00:00"
}

// Team member's check-in
{
  userId: "adhviti_id",
  empId: "OMOI123",
  name: "Adhviti",
  date: "2026-05-07",
  checkIn: "09:15:00"
}
```

---

## Quick Fix Steps

1. Delete manager from employees collection
2. Restart backend
3. Clear browser cache
4. Test again

Done! ✅
