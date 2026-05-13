# Manager Team Attendance Setup Guide

## Current Issue
- ✅ Aishmanager@omoi.com can see their own attendance
- ❌ Aishmanager@omoi.com CANNOT see Adhviti's attendance (team member)
- ✅ Admin can see all attendance records

## Why This Happens

The system uses the `managerEmail` field in the User document to determine team relationships:

```
User (Adhviti)
├── email: "adhviti@gmail.com"
├── managerEmail: "Aishmanager@omoi.com"  ← THIS FIELD MUST BE SET
└── department: "IT"
```

When a manager logs in, the backend queries:
```javascript
db.users.find({ managerEmail: "Aishmanager@omoi.com" })
```

If `managerEmail` is not set, Adhviti won't be found, so their attendance won't show.

---

## Step-by-Step Fix

### Step 1: Open MongoDB Atlas

1. Go to https://cloud.mongodb.com
2. Log in to your account
3. Click on your cluster
4. Click "Collections"
5. Find and click on the "users" collection

### Step 2: Find Adhviti's Document

In the MongoDB collection view, search for Adhviti:
- Look for document with `email: "adhviti@gmail.com"`
- Or search by name if available

### Step 3: Update the Document

**Option A: Using MongoDB Atlas UI**

1. Click on Adhviti's document
2. Click "Edit" button
3. Add this field:
   ```json
   "managerEmail": "Aishmanager@omoi.com"
   ```
4. Click "Update"

**Option B: Using MongoDB Shell (Advanced)**

1. Click "MONGOSH" tab in MongoDB Atlas
2. Run this command:
   ```javascript
   db.users.updateOne(
     { email: "adhviti@gmail.com" },
     { $set: { managerEmail: "Aishmanager@omoi.com" } }
   )
   ```
3. Verify:
   ```javascript
   db.users.findOne({ email: "adhviti@gmail.com" })
   ```

### Step 4: Test in Frontend

1. **Log out** from current session
2. **Log in** as Aishmanager@omoi.com
3. Go to **Attendance** page
4. You should now see Adhviti's check-in records in the table

---

## Expected Result

### Before Fix
```
Attendance Management (Manager View)
┌─────────────────────────────────────┐
│ EMP ID │ NAME │ CHECK IN │ CHECK OUT │
├─────────────────────────────────────┤
│ MGR731 │ Aishmanager │ 12:45 │ 17:00 │
└─────────────────────────────────────┘
(Only manager's own record)
```

### After Fix
```
Attendance Management (Manager View)
┌─────────────────────────────────────┐
│ EMP ID │ NAME │ CHECK IN │ CHECK OUT │
├─────────────────────────────────────┤
│ MGR731 │ Aishmanager │ 12:45 │ 17:00 │
│ OMOI123 │ Adhviti │ 09:30 │ 17:30 │
│ OMOI124 │ Other Team Member │ 09:00 │ 17:00 │
└─────────────────────────────────────┘
(Manager + all team members)
```

---

## For Multiple Team Members

If you have multiple team members under Aishmanager, update each one:

```javascript
// Update Adhviti
db.users.updateOne(
  { email: "adhviti@gmail.com" },
  { $set: { managerEmail: "Aishmanager@omoi.com" } }
)

// Update other team member
db.users.updateOne(
  { email: "other.employee@gmail.com" },
  { $set: { managerEmail: "Aishmanager@omoi.com" } }
)

// Verify all team members
db.users.find({ managerEmail: "Aishmanager@omoi.com" })
```

---

## Verification Checklist

After making changes:

- [ ] Adhviti's document has `managerEmail: "Aishmanager@omoi.com"`
- [ ] Manager can log in successfully
- [ ] Attendance page shows team members' records
- [ ] Team members' check-in/check-out times are visible
- [ ] Admin view still shows all records

---

## Troubleshooting

### Issue: Still not seeing team members

**Check 1:** Verify managerEmail is set correctly
```javascript
db.users.findOne({ email: "adhviti@gmail.com" })
// Should show: "managerEmail": "Aishmanager@omoi.com"
```

**Check 2:** Verify attendance records exist
```javascript
db.attendance.find({ userId: "adhviti@gmail.com" })
// Should show check-in records
```

**Check 3:** Clear browser cache and refresh
- Press Ctrl+Shift+Delete
- Clear cache
- Refresh page

**Check 4:** Check browser console for errors
- Press F12
- Go to Console tab
- Look for error messages

---

## Backend Code Status

✅ **User.java** - Added `setManagerEmail()` method
✅ **UserRepository.java** - Has `findByManagerEmail()` method
✅ **AttendanceService.java** - `getManagerAttendance()` method works correctly
✅ **AttendanceController.java** - `/api/attendance/manager` endpoint exists
✅ **attendanceApi.js** - Frontend API call is correct

**All code is ready. Just need to update MongoDB data.**

---

## Next Steps

1. Update Adhviti's `managerEmail` in MongoDB
2. Test in frontend
3. If working, update other team members similarly
4. Consider automating this in user registration/onboarding process
