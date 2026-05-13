# Fix: Manager Email Not Set for Team Members

## Problem
When a manager (Aishmanager@omoi.com) views the Attendance page, they don't see their team members' (Adhviti's) check-in records.

## Root Cause
The `managerEmail` field is not set in the User document for team members in MongoDB.

## Solution

### Step 1: Update MongoDB User Documents

Go to MongoDB Atlas → Collections → users and run this query in the MongoDB shell:

```javascript
// Find Adhviti's user document
db.users.findOne({ email: "adhviti@gmail.com" })

// Update Adhviti's document to set managerEmail
db.users.updateOne(
  { email: "adhviti@gmail.com" },
  { $set: { managerEmail: "Aishmanager@omoi.com" } }
)

// Verify the update
db.users.findOne({ email: "adhviti@gmail.com" })
```

### Step 2: Verify in MongoDB Atlas

1. Go to MongoDB Atlas → Your Cluster → Collections
2. Click on "users" collection
3. Search for Adhviti's document
4. Verify that `managerEmail` field now contains "Aishmanager@omoi.com"

### Step 3: Test in Frontend

1. Log in as **Aishmanager@omoi.com**
2. Go to **Attendance** page
3. You should now see Adhviti's check-in records in the table

---

## How It Works

### Data Flow for Manager Attendance

```
Manager logs in (Aishmanager@omoi.com)
    ↓
Frontend calls: GET /api/attendance/manager?email=Aishmanager@omoi.com
    ↓
Backend (AttendanceService.getManagerAttendance)
    ↓
Queries: db.users.find({ managerEmail: "Aishmanager@omoi.com" })
    ↓
Gets all team members (Adhviti, etc.)
    ↓
Fetches their attendance records from attendance collection
    ↓
Returns to frontend
    ↓
Manager sees team members' attendance
```

---

## MongoDB Query to Set Manager Email for All Team Members

If you have multiple team members, run this to set manager email for all:

```javascript
// Set manager email for all users in IT department under Aishmanager
db.users.updateMany(
  { department: "IT" },
  { $set: { managerEmail: "Aishmanager@omoi.com" } }
)

// Or set for specific users
db.users.updateMany(
  { email: { $in: ["adhviti@gmail.com", "other@gmail.com"] } },
  { $set: { managerEmail: "Aishmanager@omoi.com" } }
)
```

---

## Verification Checklist

- [ ] Adhviti's user document has `managerEmail: "Aishmanager@omoi.com"`
- [ ] Manager can see team members in Attendance page
- [ ] Team members' check-in records appear in manager's view
- [ ] Admin can still see all records

---

## Backend Code Changes Made

✅ Added `setManagerEmail()` method to User.java model

This allows the backend to properly set and retrieve the manager email for team members.
