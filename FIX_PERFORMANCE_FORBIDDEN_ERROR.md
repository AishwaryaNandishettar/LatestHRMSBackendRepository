# Fix: Performance Seed Data "Forbidden" Error

## Problem
When clicking "Seed Data" or "Debug" buttons in the Performance page, you get:
```
❌ Failed to seed data: Forbidden
```

## Root Cause
The user's role in the database is not in the correct format (uppercase) that Spring Security expects. The SecurityConfig requires users to have one of these roles:
- `ADMIN`
- `HR`
- `MANAGER`
- `EMPLOYEE`

If the role is stored as "manager" (lowercase) or "Manager" (mixed case), Spring Security will reject the request with a "Forbidden" error.

## Solution Applied

### 1. Backend Fixes

#### ✅ Fixed UserDetailsServiceImpl
Updated to ensure roles are always uppercase when loading user details:
```java
// File: HRMS-Backend/src/main/java/com/omoikaneinnovation/hmrsbackend/security/UserDetailsServiceImpl.java
String role = user.getRole() != null ? user.getRole().toUpperCase() : "EMPLOYEE";
```

#### ✅ Fixed AdminSetupService
Changed admin role from "Admin" to "ADMIN":
```java
// File: HRMS-Backend/src/main/java/com/omoikaneinnovation/hmrsbackend/service/AdminSetupService.java
admin.setRole("ADMIN"); // Was: "Admin"
```

#### ✅ Added Role Update Endpoint
Created a new endpoint to update user roles:
```
POST /api/employee/update-role
Body: { "email": "user@example.com", "role": "MANAGER" }
```

### 2. Update Manager Role in Database

#### Option A: Using the HTML Tool (Recommended)

1. **Start your backend server** (if not already running):
   ```bash
   cd HRMS-Backend
   mvn spring-boot:run
   ```

2. **Open the role update tool**:
   - Open `update-user-role.html` in your browser
   - Enter the manager's email address
   - Select "MANAGER" from the dropdown
   - Click "Update Role"

3. **Verify the update**:
   - You should see: `✅ Success! Role updated for [email]: [old_role] → MANAGER`

#### Option B: Using cURL

```bash
curl -X POST http://localhost:8080/api/employee/update-role \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@example.com","role":"MANAGER"}'
```

#### Option C: Using Postman

1. Create a new POST request to: `http://localhost:8080/api/employee/update-role`
2. Set Headers: `Content-Type: application/json`
3. Set Body (raw JSON):
   ```json
   {
     "email": "manager@example.com",
     "role": "MANAGER"
   }
   ```
4. Send the request

### 3. Restart Backend

After updating the role, restart your backend server:
```bash
# Stop the server (Ctrl+C)
# Start it again
mvn spring-boot:run
```

### 4. Test the Fix

1. **Log out and log back in** as the manager
   - This ensures a new JWT token is generated with the correct role

2. **Navigate to Performance page**:
   ```
   http://localhost:5176/performance
   ```

3. **Click "Seed Data"** button
   - You should now see: `✅ Sample performance data created successfully!`

4. **Click "Debug"** button
   - Should display employee debug information in console

## Verification Steps

### Check User Role in Database

If you have MongoDB Compass or mongosh:

```javascript
// Connect to your database
use hrms_db

// Find the manager user
db.users.find({ email: "manager@example.com" })

// The role field should show "MANAGER" (uppercase)
```

### Check JWT Token

1. Open browser DevTools (F12)
2. Go to Application/Storage → Local Storage
3. Find the `token` key
4. Copy the token value
5. Go to [jwt.io](https://jwt.io)
6. Paste the token
7. Check the payload - the `role` field should be "MANAGER"

### Check Backend Logs

When you log in, you should see in the backend console:
```
🔍 UserDetailsService: Loading user: manager@example.com, Role: MANAGER
JWT Role: MANAGER
```

## Common Issues

### Issue 1: Still getting "Forbidden" after update
**Solution**: Make sure you logged out and logged back in to get a new JWT token with the updated role.

### Issue 2: "User not found" error
**Solution**: Check that the email address is correct. The email must match exactly what's in the database.

### Issue 3: Backend not running
**Solution**: Make sure the backend is running on `http://localhost:8080` before using the update tool.

### Issue 4: Role still lowercase in database
**Solution**: The fix in UserDetailsServiceImpl will handle this automatically by converting to uppercase when loading user details.

## Valid Roles

The system supports these roles (must be uppercase):
- **ADMIN** - Full system access, can manage all features
- **HR** - Human Resources access, can manage employees
- **MANAGER** - Team management access, can view team performance
- **EMPLOYEE** - Basic employee access, can view own data

## Role Hierarchy

The system has a role hierarchy:
```
ADMIN > HR > MANAGER > EMPLOYEE
```

This means:
- ADMIN has all permissions of HR, MANAGER, and EMPLOYEE
- HR has all permissions of MANAGER and EMPLOYEE
- MANAGER has all permissions of EMPLOYEE

## Files Modified

1. `HRMS-Backend/src/main/java/com/omoikaneinnovation/hmrsbackend/security/UserDetailsServiceImpl.java`
2. `HRMS-Backend/src/main/java/com/omoikaneinnovation/hmrsbackend/service/AdminSetupService.java`
3. `HRMS-Backend/src/main/java/com/omoikaneinnovation/hmrsbackend/service/EmployeeService.java`
4. `HRMS-Backend/src/main/java/com/omoikaneinnovation/hmrsbackend/controller/EmployeeController.java`

## New Files Created

1. `update-user-role.html` - Tool to update user roles
2. `FIX_PERFORMANCE_FORBIDDEN_ERROR.md` - This guide

## Next Steps

After fixing the manager role:

1. **Test all manager features**:
   - Performance page seed data
   - Performance page debug
   - Team performance tracking
   - Give feedback to employees

2. **Update other users if needed**:
   - Use the same tool to update HR users to "HR" role
   - Update admin users to "ADMIN" role

3. **Document your roles**:
   - Keep track of which users have which roles
   - Document the permissions for each role

## Need Help?

If you're still experiencing issues:

1. Check the backend console logs for error messages
2. Check the browser console (F12) for frontend errors
3. Verify the JWT token contains the correct role
4. Ensure you logged out and back in after updating the role
5. Make sure the backend is running and accessible

## Summary

The fix ensures that:
1. ✅ Roles are always stored and compared in UPPERCASE
2. ✅ UserDetailsServiceImpl converts roles to uppercase
3. ✅ New endpoint allows easy role updates
4. ✅ HTML tool provides user-friendly interface
5. ✅ All new users get roles in correct format

After applying these fixes and updating the manager's role, the "Forbidden" error should be resolved!
