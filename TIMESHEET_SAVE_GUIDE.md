# 📋 Timesheet Save to MongoDB - Complete Guide

## What Was Wrong?

```
BEFORE (Broken):
┌─────────────────────────────────────────────────────────┐
│ Frontend: Timesheet Component                           │
│ - Display timesheet data ✅                             │
│ - Approve timesheet ✅                                  │
│ - Submit timesheet ❌ (NO BUTTON, NO API)              │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Backend: TimesheetController                            │
│ - GET /api/timesheet/monthly ✅                         │
│ - PUT /api/timesheet/approve ✅                         │
│ - POST /api/timesheet/submit ❌ (MISSING)              │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ MongoDB Atlas: attendance collection                    │
│ - No new timesheet data saved ❌                        │
└─────────────────────────────────────────────────────────┘
```

## What's Fixed Now?

```
AFTER (Working):
┌─────────────────────────────────────────────────────────┐
│ Frontend: Timesheet Component                           │
│ - Display timesheet data ✅                             │
│ - Approve timesheet ✅                                  │
│ - Submit timesheet ✅ (NEW BUTTON ADDED)               │
└─────────────────────────────────────────────────────────┘
                          ↓
                   POST /api/timesheet/submit
                   with timesheet data
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Backend: TimesheetController                            │
│ - GET /api/timesheet/monthly ✅                         │
│ - PUT /api/timesheet/approve ✅                         │
│ - POST /api/timesheet/submit ✅ (NEW ENDPOINT)         │
└─────────────────────────────────────────────────────────┘
                          ↓
                   TimesheetService.submitTimesheet()
                   Creates Attendance records
                          ↓
┌─────────────────────────────────────────────────────────┐
│ MongoDB Atlas: attendance collection                    │
│ - New timesheet data saved ✅                           │
│ - Visible in Data Explorer ✅                           │
└─────────────────────────────────────────────────────────┘
```

## Step-by-Step: How to Save Timesheet

### Step 1: Login as Employee
```
URL: http://localhost:3000/login
Username: employee@example.com
Password: your_password
```

### Step 2: Navigate to Timesheet
```
Sidebar → Timesheet
```

### Step 3: View Your Timesheet
```
- Select Month: 2026-05 (May 2026)
- See your attendance data
- Present: 20 days
- Leave: 1 day
- LOP: 0 days
- etc.
```

### Step 4: Click Submit Button
```
Look for: "📤 Submit Timesheet" button
(Only visible for employees)
```

### Step 5: Confirm Submission
```
Alert: "✅ Timesheet submitted successfully to MongoDB!"
```

### Step 6: Verify in MongoDB Atlas
```
1. Go to: https://cloud.mongodb.com
2. Select: Project 0 → Data_base_hrms
3. Click: Collections → attendance
4. Search for your email/userId
5. See new attendance records created
```

## API Endpoint Details

### POST /api/timesheet/submit

**Request Body:**
```json
{
  "userId": "employee@example.com",
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

**Response (Success):**
```json
{
  "success": true,
  "message": "Timesheet submitted successfully for 2026-05",
  "userId": "employee@example.com",
  "month": "2026-05"
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Error submitting timesheet: [error details]"
}
```

## MongoDB Data Structure

After submission, new documents are created in `attendance` collection:

```json
{
  "_id": ObjectId("..."),
  "userId": "employee@example.com",
  "date": "2026-05-01",
  "checkIn": "09:00",
  "checkOut": "17:00",
  "duration": 480,
  "status": "present"
}
```

Multiple records are created (one per day of the month).

## Troubleshooting

### Issue: Button not showing
**Solution**: Make sure you're logged in as an **employee** (not manager/admin)

### Issue: "Failed to submit timesheet"
**Solution**: 
- Check backend is running
- Check MongoDB connection
- Check browser console for errors

### Issue: Data not appearing in MongoDB
**Solution**:
- Refresh MongoDB Atlas page
- Check the correct collection: `attendance`
- Filter by your email/userId

### Issue: Duplicate submissions
**Solution**: 
- Currently allows multiple submissions for same month
- Enhancement: Add duplicate check in backend

## Code Changes Summary

### Backend (Java)

**File**: `TimesheetController.java`
```java
@PostMapping("/submit")
public Map<String, Object> submitTimesheet(@RequestBody Map<String, Object> req) {
    return service.submitTimesheet(req);
}
```

**File**: `TimesheetService.java`
```java
public Map<String, Object> submitTimesheet(Map<String, Object> req) {
    // Extract data from request
    // Create Attendance records
    // Save to MongoDB
    // Return response
}
```

### Frontend (React)

**File**: `timesheetApi.js`
```javascript
export const submitTimesheet = async (timesheetData) => {
  const res = await api.post(`/api/timesheet/submit`, timesheetData);
  return res.data;
};
```

**File**: `Timesheet.jsx`
```javascript
const handleSubmitTimesheet = async () => {
  // Prepare data
  // Call API
  // Show success/error
  // Refresh data
};

// In JSX:
<button onClick={handleSubmitTimesheet}>
  📤 Submit Timesheet
</button>
```

## Testing Checklist

- [ ] Backend is running (port 8080)
- [ ] Frontend is running (port 3000)
- [ ] MongoDB Atlas is accessible
- [ ] Logged in as employee
- [ ] Timesheet page loads
- [ ] Submit button is visible
- [ ] Click submit button
- [ ] Success message appears
- [ ] Check MongoDB for new records
- [ ] Data is visible in attendance collection

---

**Status**: ✅ Ready to use - Timesheet data now saves to MongoDB!
