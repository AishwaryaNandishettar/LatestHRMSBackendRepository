# Forgot Password & Employee Name Sync - Implementation Guide

## Overview
This document explains the fixes implemented for:
1. **Forgot Password Flow** - Allow new users to reset their password from the login page
2. **Employee Name Synchronization** - Ensure name updates in Employee Directory reflect everywhere
3. **Timesheet Employee ID Fix** - Display proper Employee ID instead of MongoDB ObjectId

---

## 1. Forgot Password Implementation

### Backend Changes

#### File: `AuthController.java`
**Location:** `HRMS-Backend/src/main/java/com/omoikaneinnovation/hmrsbackend/controller/AuthController.java`

**Added Endpoints:**

```java
// Send OTP to user's email
POST /api/auth/forgot-password
Request Body: { "email": "user@example.com" }
Response: { "message": "OTP sent to email", "otp": "1234" }

// Reset password with OTP
POST /api/auth/reset-password
Request Body: { 
  "email": "user@example.com", 
  "otp": "1234", 
  "newPassword": "newPass123" 
}
Response: "Password reset successfully"
```

**How it works:**
1. User clicks "Forgot Password" on login page
2. Enters email → Backend generates 4-digit OTP
3. OTP is temporarily stored as hashed password in User table
4. User enters OTP + new password
5. Backend verifies OTP and sets new password

### Frontend Changes

#### File: `Login.jsx`
**Location:** `HRMS-Frontend/src/Pages/Login.jsx`

**Changes Made:**
- Integrated forgot password flow with backend API calls
- Added proper error handling
- Password validation (minimum 6 characters)
- Clear state management after successful reset

**User Flow:**
```
Login Page → Click "Forgot Password?" 
→ Enter Email → Click "Send OTP" 
→ Enter OTP → Verify OTP 
→ Enter New Password → Reset Password 
→ Back to Login
```

---

## 2. Employee Name Synchronization

### Problem
When an admin updates an employee's name in the Employee Directory:
- Name was updated in `Employee` table only
- Name in `User` table remained unchanged
- This caused inconsistency in:
  - Home page (Employee Directory widget)
  - Profile page
  - Timesheet page
  - Attendance page

### Solution

#### File: `EmployeeService.java`
**Location:** `HRMS-Backend/src/main/java/com/omoikaneinnovation/hmrsbackend/service/EmployeeService.java`

**Changes in `updateEmployee()` method:**

```java
// When fullName is updated in Employee table
if (dto.getFullName() != null && !dto.getFullName().trim().isEmpty()) {
    employee.setFullName(dto.getFullName());
    
    // ✅ NEW: Sync to User table
    Optional<User> userOpt = userRepository.findByEmail(employee.getEmail());
    if (userOpt.isPresent()) {
        User user = userOpt.get();
        user.setName(dto.getFullName());
        userRepository.save(user);
    }
}

// Same for department and designation
```

**What this fixes:**
- Name updates now propagate to both `Employee` and `User` tables
- All pages that read from `User.name` will show updated name
- Consistency across the entire application

---

## 3. Timesheet Employee ID Fix

### Problem
In the Timesheet page, the Employee ID column was showing:
- MongoDB ObjectId (e.g., `6a041d45e630184c990e8fbc`) instead of
- Proper Employee ID (e.g., `IT-EMP-0019`)

### Root Cause
When attendance records were created, `userId` field stored MongoDB `_id` instead of `employeeId`. The TimesheetService was falling back to this MongoDB ID when no proper employeeId was found.

### Solution

#### File: `TimesheetService.java`
**Location:** `HRMS-Backend/src/main/java/com/omoikaneinnovation/hmrsbackend/service/TimesheetService.java`

**Changes in `getMonthlySummary()` method:**

```java
// ✅ FIX: Set proper employee ID (NEVER MongoDB ObjectId or email)
String empId = u.getEmployeeId();
if (empId == null || empId.isBlank()) {
    // Generate placeholder from email, DON'T use MongoDB _id
    empId = "EMP-" + u.getEmail().substring(0, Math.min(5, u.getEmail().indexOf("@")));
}
obj.setEmpId(empId);

// ✅ FIX: Set display name from User.employeeName (updated name)
String name = u.getName(); // This reads from User.employeeName
if (name == null || name.isBlank()) {
    // Fallback to email prefix if name not set
    name = u.getEmail() != null ? u.getEmail().split("@")[0] : "-";
}
obj.setEmpName(name);
```

**What this fixes:**
- Timesheet now displays proper Employee ID format (IT-EMP-0019)
- Never shows MongoDB ObjectId
- Shows updated employee name from User table

---

## Testing Guide

### Test 1: Forgot Password Flow

**Steps:**
1. Go to login page: `http://localhost:5176/`
2. Click "Forgot Password?"
3. Enter email: `sujathanshettar@gmail.com`
4. Click "Send OTP"
5. Check console/alert for OTP (in production, this will be sent via email)
6. Enter the OTP
7. Click "Verify OTP"
8. Enter new password (min 6 characters)
9. Click "Reset Password"
10. Login with new password

**Expected Result:**
- ✅ OTP sent successfully
- ✅ OTP verified
- ✅ Password reset successful
- ✅ Can login with new password

---

### Test 2: Employee Name Update Sync

**Steps:**
1. Login as Admin/HR
2. Go to Employee Directory page
3. Find employee "Test User" (IT-EMP-0019)
4. Click Edit → Change name to "Sujatha N Shettar"
5. Save changes
6. Check the following pages:
   - Home page (Employee Directory widget)
   - Profile page (if logged in as that user)
   - Timesheet page
   - Attendance page

**Expected Result:**
- ✅ Name updated in Employee Directory
- ✅ Name shows "Sujatha N Shettar" in Home page
- ✅ Name shows "Sujatha N Shettar" in Timesheet
- ✅ Name shows "Sujatha N Shettar" in Attendance
- ✅ Name shows "Sujatha N Shettar" in Profile

---

### Test 3: Timesheet Employee ID Display

**Steps:**
1. Login as the new user (sujathanshettar@gmail.com)
2. Mark attendance (Check In)
3. Go to Timesheet page
4. Select current month
5. Check the "EMP ID" column

**Expected Result:**
- ✅ Shows "IT-EMP-0019" (proper format)
- ❌ Does NOT show MongoDB ObjectId like "6a041d45e630184c990e8fbc"
- ✅ Shows "Sujatha N Shettar" in EMP NAME column

---

## Database Schema Reference

### User Collection
```javascript
{
  _id: ObjectId("..."),           // MongoDB ID
  employeeName: "Sujatha N Shettar",  // Display name (synced from Employee)
  email: "sujathanshettar@gmail.com",
  password: "$2a$10$...",          // BCrypt hashed
  role: "EMPLOYEE",
  employeeId: "IT-EMP-0019",      // Proper employee ID
  department: "IT",
  designation: "Developer",
  managerEmail: "manager@omoi.com",
  companyId: "COMP-001"
}
```

### Employee Collection
```javascript
{
  _id: ObjectId("..."),
  employeeId: "IT-EMP-0019",      // Unique employee ID
  fullName: "Sujatha N Shettar",  // Full name
  email: "sujathanshettar@gmail.com",
  department: "IT",
  designation: "Developer",
  joiningDate: "2026-05-13",
  status: "ACTIVE",
  userId: "...",                  // Reference to User._id
  companyId: "COMP-001"
}
```

### Attendance Collection
```javascript
{
  _id: ObjectId("..."),
  userId: "sujathanshettar@gmail.com",  // Email or User._id
  empId: "IT-EMP-0019",
  name: "Sujatha N Shettar",
  department: "IT",
  date: "2026-05-13",
  checkIn: "09:15:30",
  checkOut: "17:45:20",
  locationIn: "14.7635, 75.1253",
  locationOut: "14.7635, 75.1253",
  status: "Pending Approval"
}
```

---

## API Endpoints Summary

### Authentication
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/forgot-password      ← NEW
POST /api/auth/reset-password       ← NEW
POST /api/auth/change-password
```

### Employee Management
```
GET  /api/employee/all
POST /api/employee/create
PUT  /api/employee/update/{employeeId}  ← ENHANCED (now syncs to User table)
```

### Timesheet
```
GET  /api/timesheet/monthly?month=2026-05  ← FIXED (proper empId display)
POST /api/timesheet/submit
PUT  /api/timesheet/approve
```

---

## Important Notes

### For New Users (Invited via Email)

**Current Flow:**
1. Admin sends invitation → User receives email with:
   - Application link with token
   - Username (email)
   - Temporary password (e.g., `Temp@123`)

2. User clicks link → InviteAccept page → Sets new password

3. User can now:
   - Login with new password
   - OR click "Forgot Password" to reset again

**Realistic Flow (Recommended):**
1. Admin sends invitation → User receives email with application link only
2. User clicks link → Redirected to login page
3. User clicks "Forgot Password" → Enters email → Receives OTP
4. User enters OTP → Sets new password
5. User logs in with new password

### Security Considerations

1. **OTP Storage:** Currently OTP is temporarily stored as hashed password. In production:
   - Use separate OTP table with expiry timestamp
   - Implement rate limiting (max 3 attempts)
   - Add OTP expiry (10 minutes)

2. **Email Service:** Currently OTP is returned in API response for testing. In production:
   - Integrate with email service (SendGrid, AWS SES, etc.)
   - Never return OTP in API response
   - Send OTP only via email

3. **Password Policy:** Enforce strong passwords:
   - Minimum 8 characters
   - At least 1 uppercase, 1 lowercase, 1 number, 1 special character

---

## Files Modified

### Backend
1. ✅ `AuthController.java` - Added forgot password endpoints
2. ✅ `EmployeeService.java` - Added name sync to User table
3. ✅ `TimesheetService.java` - Fixed empId display logic

### Frontend
1. ✅ `Login.jsx` - Integrated forgot password with backend

### No Changes Required
- ❌ `Home.jsx` - Already reads from User.name
- ❌ `Profile.jsx` - Already reads from User.name
- ❌ `Attendance.jsx` - Already reads from User.name
- ❌ `Timesheet.jsx` - Backend fix handles empId display

---

## Troubleshooting

### Issue: OTP not received
**Solution:** Check backend console for OTP (currently logged for testing)

### Issue: Name not updating in Timesheet
**Solution:** 
1. Check if User.employeeName is updated in database
2. Clear browser cache and refresh
3. Re-login to get fresh user data

### Issue: Still seeing MongoDB ObjectId in Timesheet
**Solution:**
1. Check if User.employeeId is set correctly
2. Verify attendance records have proper userId
3. Check TimesheetService logs for user lookup

---

## Next Steps (Optional Enhancements)

1. **Email Integration:**
   - Integrate SendGrid or AWS SES for OTP delivery
   - Create email templates for forgot password

2. **OTP Management:**
   - Create separate OTP table with expiry
   - Implement rate limiting
   - Add OTP resend functionality

3. **Password Policy:**
   - Add password strength meter
   - Enforce password complexity rules
   - Add password history (prevent reuse)

4. **Audit Trail:**
   - Log all password reset attempts
   - Track employee name changes
   - Monitor failed login attempts

---

## Support

For any issues or questions, contact the development team.

**Last Updated:** May 13, 2026
**Version:** 1.0
