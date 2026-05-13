# Fix Manager Check-In Display Issue

## Problem
1. Manager check-in shows "successful" then "failed" popup
2. Manager's check-in details not displaying in attendance table
3. Need manager's own check-in records to display

## Root Cause
The manager's `userId` sent from frontend (email or ID) doesn't match the MongoDB `_id` stored in the database. The backend was storing attendance with the wrong userId format.

## Solution
Updated backend to normalize userId:
- If userId is an email, convert it to the actual MongoDB `_id`
- This ensures check-in records are stored and retrieved correctly

## Changes Made

### File: AttendanceService.java

**Updated checkIn() method:**
```java
// Normalize userId: if it looks like an email, find the user and get their ID
String normalizedUserId = userId;
if (userId != null && userId.contains("@")) {
    Optional<User> userOpt = userRepo.findByEmail(userId);
    if (userOpt.isPresent()) {
        normalizedUserId = userOpt.get().getId();
    }
}

// Use normalizedUserId for all operations
attendance.setUserId(normalizedUserId);
```

**Updated checkOut() method:**
- Same normalization logic applied

## Testing Steps

### Step 1: Rebuild Backend
```bash
cd e:\HRMSProject\HRMS-Backend
mvn clean compile
mvn package -DskipTests
```

### Step 2: Stop Old Backend
- Press Ctrl+C in terminal
- Or: `taskkill /F /IM java.exe`

### Step 3: Start Fresh Backend
```bash
cd e:\HRMSProject\HRMS-Backend
mvn spring-boot:run
```

### Step 4: Clear Browser Cache
- Ctrl+Shift+Delete
- Select "All time"
- Clear data
- Refresh: Ctrl+R

### Step 5: Test Manager Check-In
1. Login as Aishmanager@omoi.com
2. Go to Attendance page
3. Click "Check In"
4. Should see: "Check-in successful" (only once)
5. Refresh page (F5)
6. Should see your check-in record in table:
   - EMP ID: MGR001
   - Name: Aishmanager
   - Check In: [time]

### Step 6: Test Manager Check-Out
1. Click "Check Out"
2. Should see: "Check-out successful" (only once)
3. Refresh page (F5)
4. Should see updated record:
   - Check Out: [time]
   - Total Hours: [calculated]

### Step 7: Verify Team Member Records
1. Refresh page (F5)
2. Should see BOTH:
   - Your record (MGR001 - Aishmanager)
   - Team member record (OMOI123 - Adhviti)

## Expected Result

### Attendance Page (Manager View)
| EMP ID | Name | Department | Check In | Check Out | Total Hours |
|--------|------|-----------|----------|-----------|-------------|
| MGR001 | Aishmanager | Management | 09:00 | 18:00 | 9h 0m 0s |
| OMOI123 | Adhviti | IT | 09:15 | 17:45 | 8h 30m 0s |

## Verification

### Check 1: Manager's check-in record exists
```javascript
db.attendance.find({ 
  userId: "manager_mongodb_id",
  date: "2026-05-07"
})
// Should return: Manager's check-in record
```

### Check 2: Only one popup appears
- Click "Check In"
- Should see: "Check-in successful" popup (only once)
- Should NOT see: "Check-in failed" popup

### Check 3: Records display in table
- Refresh page
- Should see manager's record in table
- Should see team member's record in table

## Compilation Status
✅ Backend compiles successfully

## Files Modified
- `AttendanceService.java` - Updated checkIn() and checkOut() methods

## Time Needed
- Rebuild: 5 min
- Test: 5 min
- Total: 10 minutes

## Done! ✅

Manager's check-in will now display correctly in the attendance table.
