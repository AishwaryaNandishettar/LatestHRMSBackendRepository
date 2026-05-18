# Quick Fix: Performance "Forbidden" Error

## The Problem
Clicking "Seed Data" or "Debug" in Performance page shows: `❌ Failed to seed data: Forbidden`

## The Cause
Your manager user's role in the database is not in uppercase format (should be "MANAGER" not "manager" or "Manager")

## Quick Fix (3 Steps)

### Step 1: Start Backend
```bash
cd HRMS-Backend
mvn spring-boot:run
```

### Step 2: Update Manager Role
Open `update-user-role.html` in your browser and:
1. Enter manager's email
2. Select "MANAGER" role
3. Click "Update Role"

### Step 3: Re-login
1. Log out from the application
2. Log back in as manager
3. Go to Performance page
4. Click "Seed Data" - should work now! ✅

## What Was Fixed

### Backend Changes:
1. ✅ `UserDetailsServiceImpl.java` - Now converts roles to uppercase
2. ✅ `AdminSetupService.java` - Admin role now "ADMIN" instead of "Admin"
3. ✅ `EmployeeController.java` - Added `/update-role` endpoint

### Tools Created:
1. ✅ `update-user-role.html` - Easy role update tool
2. ✅ `FIX_PERFORMANCE_FORBIDDEN_ERROR.md` - Detailed guide

## Verify It Works

After re-login, check browser console (F12):
```
🔍 UserDetailsService: Loading user: manager@example.com, Role: MANAGER
JWT Role: MANAGER
```

Then click "Seed Data" button - should see success message!

## Need More Help?
See `FIX_PERFORMANCE_FORBIDDEN_ERROR.md` for detailed troubleshooting.
