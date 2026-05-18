# Debug Guide: Leave Not Displaying on Home Page

## 🔍 Issue Analysis

Based on your screenshots, the approved leaves are:
- **Loss of Pay**: 2026-04-21 to 2026-04-22
- **Sick Leave**: 2026-04-22 to 2026-04-22

**Today's Date**: April 29, 2026

**Problem**: These leaves are in the **past** (April 21-22), so they won't show on the home page because the system only displays employees who are **currently on leave TODAY** (April 29).

## ✅ Solution: Create a Leave for Today

### Option 1: Create a New Leave for Today (Recommended)

1. **Go to Leave Management Page**
2. **Click "Apply Leave"**
3. **Fill in the form:**
   - **Leave Type**: Sick Leave (or any type)
   - **Start Date**: `2026-04-29` (today)
   - **End Date**: `2026-04-30` (tomorrow)
   - **Reason**: Testing leave display
4. **Submit the leave**
5. **As Admin, approve the leave**
6. **Refresh the Home page**
7. **You should now see the employee in "Who's on Leave Today" section**

### Option 2: Update Existing Leave Dates in MongoDB

```javascript
// Connect to MongoDB
use your_database_name;

// Update an existing approved leave to include today
db.leave_requests.updateOne(
  { 
    status: "Approved",
    employeeName: "Adhivhi" // or the employee name
  },
  { 
    $set: { 
      startDate: "2026-04-29",
      endDate: "2026-04-30"
    } 
  }
);

// Verify the update
db.leave_requests.find({ 
  status: "Approved",
  startDate: { $lte: "2026-04-29" },
  endDate: { $gte: "2026-04-29" }
}).pretty();
```

## 🔍 Check Backend Logs

After updating the leave, check your backend console logs. You should see:

```
🔍 HomeService: Today's date is: 2026-04-29
🔍 HomeService: Total leaves to check: X
🔍 Checking leave - Status: Approved, Start: 2026-04-29, End: 2026-04-30, Type: Sick Leave
   📅 Start: 2026-04-29, End: 2026-04-30, Today: 2026-04-29, On leave today: true
   ✅ INCLUDED - Employee is on leave today!
   ✅ Added to leaveUsers: Adhivhi
🔍 HomeService: Final leaveUsers count: 1
```

If you see:
```
   ❌ Filtered out - Not on leave today
```

This means the leave dates don't include today.

## 📊 Understanding the Date Logic

The system checks if **TODAY** falls between the leave's start and end dates:

```java
// Today must be >= startDate AND <= endDate
boolean isOnLeaveToday = !today.isBefore(startDate) && !today.isAfter(endDate);
```

### Examples:

| Leave Start | Leave End | Today      | Shows on Home? | Reason                          |
|-------------|-----------|------------|----------------|---------------------------------|
| 2026-04-21  | 2026-04-22| 2026-04-29 | ❌ NO          | Leave ended on April 22         |
| 2026-04-29  | 2026-04-30| 2026-04-29 | ✅ YES         | Today is within leave period    |
| 2026-04-28  | 2026-04-30| 2026-04-29 | ✅ YES         | Today is within leave period    |
| 2026-04-30  | 2026-05-01| 2026-04-29 | ❌ NO          | Leave starts tomorrow           |
| 2026-04-29  | 2026-04-29| 2026-04-29 | ✅ YES         | Single day leave (today)        |

## 🧪 Quick Test Steps

### Step 1: Check Current Date
```bash
# In your backend logs, look for:
🔍 HomeService: Today's date is: 2026-04-29
```

### Step 2: Create Test Leave
```javascript
// MongoDB command to create a test leave for today
db.leave_requests.insertOne({
  userId: "YOUR_USER_ID", // Get from db.users.findOne()
  employeeName: "Test User",
  leaveType: "Sick Leave",
  startDate: "2026-04-29",
  endDate: "2026-04-30",
  status: "Approved",
  reason: "Testing leave display"
});
```

### Step 3: Verify in Database
```javascript
// Check if leave exists for today
const today = "2026-04-29";
db.leave_requests.find({
  status: "Approved",
  startDate: { $lte: today },
  endDate: { $gte: today }
}).pretty();
```

### Step 4: Check API Response
```bash
# Call the home API directly
curl "http://localhost:8080/api/home/me?email=YOUR_EMAIL"

# Look for leaveUsers array in response:
{
  "leaveUsers": [
    {
      "name": "Test User",
      "startDate": "2026-04-29",
      "endDate": "2026-04-30",
      "leaveType": "Sick Leave",
      "department": "IT"
    }
  ]
}
```

### Step 5: Check Frontend Console
```javascript
// Open browser console (F12) and look for:
console.log("✅ Home data loaded:", data);

// Check if leaveUsers array has data:
data.leaveUsers // Should be an array with leave objects
```

## 🐛 Common Issues

### Issue 1: Leave dates are in the past
**Symptom**: Approved leaves exist but don't show on home page
**Solution**: Create a new leave with dates that include today

### Issue 2: Leave status is not "Approved"
**Symptom**: Leave shows as "PENDING" or "Rejected"
**Solution**: Make sure the leave status is exactly "Approved" (case-insensitive)

### Issue 3: User ID mismatch
**Symptom**: Leave exists but user name shows as userId
**Solution**: Verify that `leave.userId` matches a user's `_id` in the users collection

### Issue 4: Date format issue
**Symptom**: Backend logs show date parsing errors
**Solution**: Ensure dates are in ISO format: "YYYY-MM-DD" (e.g., "2026-04-29")

### Issue 5: Empty leaveUsers array in API response
**Symptom**: API returns `leaveUsers: []`
**Solution**: Check backend logs to see why leaves are being filtered out

## 🔧 MongoDB Queries to Help Debug

### Find all approved leaves:
```javascript
db.leave_requests.find({ status: "Approved" }).pretty();
```

### Find leaves for today:
```javascript
const today = "2026-04-29";
db.leave_requests.find({
  status: "Approved",
  startDate: { $lte: today },
  endDate: { $gte: today }
}).pretty();
```

### Find all leaves for a specific user:
```javascript
db.leave_requests.find({ 
  userId: "YOUR_USER_ID" 
}).sort({ startDate: -1 }).pretty();
```

### Update a leave to include today:
```javascript
db.leave_requests.updateOne(
  { _id: ObjectId("YOUR_LEAVE_ID") },
  { 
    $set: { 
      startDate: "2026-04-29",
      endDate: "2026-04-30",
      status: "Approved"
    } 
  }
);
```

### Count approved leaves for today:
```javascript
const today = "2026-04-29";
db.leave_requests.countDocuments({
  status: "Approved",
  startDate: { $lte: today },
  endDate: { $gte: today }
});
```

## ✅ Expected Behavior

Once you have a leave that includes today's date:

1. **Backend logs** should show:
   ```
   ✅ INCLUDED - Employee is on leave today!
   🔍 HomeService: Final leaveUsers count: 1 (or more)
   ```

2. **API response** should include:
   ```json
   {
     "leaveUsers": [
       {
         "name": "Employee Name",
         "startDate": "2026-04-29",
         "endDate": "2026-04-30",
         "leaveType": "Sick Leave",
         "department": "IT"
       }
     ]
   }
   ```

3. **Home page** should display:
   ```
   🏖️ Who's on Leave Today                    [1 person]
   ┌─────────────────┐
   │ 👤              │
   │ Employee Name   │
   │ Apr 29 - Apr 30 │
   │ [Sick Leave]    │
   └─────────────────┘
   ```

## 📞 Still Not Working?

If you've followed all steps and it's still not working:

1. **Restart the backend server** to ensure new code is loaded
2. **Clear browser cache** (Ctrl+Shift+R)
3. **Check backend console** for any errors
4. **Check browser console** for any errors
5. **Verify the API response** using curl or Postman
6. **Share the backend logs** showing the leave filtering process

## 🎯 Quick Fix Summary

**The issue is simple**: Your approved leaves are from **April 21-22**, but today is **April 29**. The system only shows employees who are **currently on leave TODAY**.

**Solution**: Create a new leave request with dates that include today (April 29, 2026), get it approved, and refresh the home page. You should then see the employee in the "Who's on Leave Today" section! 🎉
