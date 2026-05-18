# Timesheet MongoDB Storage Guide

## Problem
Timesheet data is not being saved to MongoDB Atlas.

## Solution
The timesheet system stores data in the **`attendance`** collection, NOT a separate "timesheet" collection.

---

## How It Works

### 1. **Data Flow**
```
Frontend (Timesheet.jsx)
    ↓
submitTimesheet() → POST /api/timesheet/submit
    ↓
Backend (TimesheetService.java)
    ↓
Saves to MongoDB → attendance collection
    ↓
Frontend retrieves via GET /api/timesheet/monthly
    ↓
Aggregates attendance records into timesheet summary
```

### 2. **What Gets Saved**
When you click "📤 Submit Timesheet", the following data is sent:
```json
{
  "userId": "user@example.com",
  "month": "2026-05",
  "present": 20,
  "leave": 1,
  "lop": 0,
  "halfDay": 0,
  "late": 1,
  "wfh": 2,
  "field": 0,
  "avgHours": 8.5
}
```

This creates **31 attendance records** (one for each day of the month) in MongoDB.

---

## Verification Steps

### Step 1: Check MongoDB Collections
1. Go to MongoDB Atlas → Your Cluster → Collections
2. Look for the **`attendance`** collection (NOT "timesheet")
3. You should see documents like:
```json
{
  "_id": ObjectId("..."),
  "userId": "user@example.com",
  "date": "2026-05-01",
  "checkIn": "09:00",
  "checkOut": "17:00"
}
```

### Step 2: Verify Backend Endpoint
The backend endpoint `/api/timesheet/submit` should:
- Accept POST requests with timesheet data
- Create attendance records in MongoDB
- Return success response

### Step 3: Test Submission
1. Open your HRMS Frontend
2. Go to **Timesheet** page
3. Click **"📤 Submit Timesheet"** button
4. Check MongoDB Atlas for new attendance records

---

## Troubleshooting

### Issue: "Timesheet not saved"

**Check 1: Is the attendance collection empty?**
- Go to MongoDB Atlas → Collections → attendance
- If empty, the backend is not saving data

**Check 2: Is the API endpoint working?**
- Open browser DevTools (F12)
- Go to Network tab
- Click "Submit Timesheet"
- Check if POST request to `/api/timesheet/submit` succeeds (200 status)

**Check 3: Backend Connection**
- Verify `application.properties` has correct MongoDB URI
- Check backend logs for errors

**Check 4: Frontend API Configuration**
- Check `HRMS-Frontend/src/api/axios.js` for correct backend URL
- Verify backend is running and accessible

---

## MongoDB Query to View Timesheet Data

Run this query in MongoDB Atlas to see all timesheet submissions:

```javascript
db.attendance.find({
  "date": { $regex: "^2026-05" }
}).pretty()
```

This shows all attendance records for May 2026.

---

## If You Need a Separate "timesheet" Collection

If you want a dedicated timesheet collection instead of using attendance:

1. Create a new `Timesheet` model in backend
2. Create `TimesheetRepository` 
3. Modify `TimesheetService.submitTimesheet()` to save to timesheet collection
4. Update MongoDB to have a "timesheet" collection

**But the current design uses `attendance` collection, which is fine.**

---

## Next Steps

1. ✅ Verify attendance collection exists in MongoDB
2. ✅ Submit a timesheet from the frontend
3. ✅ Check MongoDB for new attendance records
4. ✅ Verify data appears in timesheet dashboard

If you still have issues, check the backend logs for error messages.
