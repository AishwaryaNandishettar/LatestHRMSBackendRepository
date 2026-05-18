# KPI Cards Debugging Guide

If the KPI cards are still not showing values after the fix, follow these steps:

## Step 1: Check Backend Logs

Look for these log messages in the backend console:

```
🔍 HomeService: Processing userId: [userId], role: [role]
🔍 HomeService: Admin/HR role detected, fetching employee counts
🔍 HomeService: Total users: [count], Active: [count]
🔍 HomeService: Pending leaves: [count]
🔍 HomeService: Payroll total: [amount]
🔍 HomeService: Response created successfully
```

**If you see these logs**: Backend is working correctly, issue is in frontend

**If you don't see these logs**: 
- Check if the user role is correctly set to ADMIN/HR/MANAGER
- Verify the email parameter is being passed correctly

## Step 2: Check Frontend Console Logs

Open browser DevTools (F12) and look for these logs:

```
🔄 Loading dashboard data...
📡 Fetching home dashboard data...
📡 Raw home data response: {...}
📡 Home stats: {...}
📡 Leave pending: [number]
📡 Setting leave requests from stats: [number]
📡 Setting payroll from stats: [number]
✅ Dashboard data loaded successfully
```

**If you see these logs with values**: Data is being fetched correctly

**If values are undefined/null**:
- Check the API response in Network tab
- Verify the backend is returning the stats object

## Step 3: Check Network Tab

1. Open DevTools → Network tab
2. Filter for `/api/home/me` request
3. Click on the request and check the Response tab
4. Look for this structure:

```json
{
  "stats": {
    "totalEmployees": 5,
    "activeEmployees": 4,
    "leavePending": 2,
    "payrollTotal": 250000,
    ...
  },
  "events": [...],
  "leaveGraph": [...],
  ...
}
```

**If stats is null or missing fields**:
- Backend is not setting the values correctly
- Check HomeService.java logs

**If stats has values but KPI cards are blank**:
- Frontend state is not being updated
- Check if `setLeaveRequests()` and `setPayrollStat()` are being called

## Step 4: Verify Database Data

Check if your database has:

1. **Users**: At least one user with role = "ADMIN" or "HR"
2. **Leave Requests**: At least one with status = "Pending"
3. **Salaries**: At least one salary record with earnings/deductions

Run these checks in MongoDB:

```javascript
// Check users
db.users.find({ role: { $in: ["ADMIN", "HR", "MANAGER"] } }).count()

// Check pending leaves
db.leave_requests.find({ status: "Pending" }).count()

// Check salaries
db.salaries.find().count()
```

## Step 5: Manual API Test

Test the API directly using curl or Postman:

```bash
curl -X GET "http://localhost:8082/api/home/me?email=admin@company.com" \
  -H "Content-Type: application/json"
```

Expected response should include stats with all fields populated.

## Common Issues & Solutions

### Issue: KPI cards show "—" (dash)
**Solution**: 
- Check if `homeData?.stats` is null
- Verify backend is returning stats object
- Check browser console for errors

### Issue: Leave Requests shows 0 but there are pending leaves
**Solution**:
- Check if leave status is exactly "Pending" (case-sensitive)
- Verify leave data is in database
- Check backend logs for pending leave count

### Issue: Org Payroll shows ₹0 but salaries exist
**Solution**:
- Check if salary records have earnings/deductions
- Verify salary structure matches Salary.Item format
- Check backend logs for payroll total calculation

### Issue: Total Employees shows 0 but users exist
**Solution**:
- Check if users have status = "ACTIVE"
- Verify user role is ADMIN/HR/MANAGER
- Check backend logs for user count

## Step 6: Force Refresh

If everything looks correct but still not showing:

1. **Backend**: Restart the Spring Boot application
2. **Frontend**: Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
3. **Clear Cache**: Clear browser cache and cookies
4. **Logout/Login**: Logout and login again

## Step 7: Check Role-Based Access

KPI cards only show for ADMIN/HR/MANAGER roles. Verify:

```javascript
// In browser console
console.log(user?.role)  // Should be "admin", "hr", or "manager"
```

If role is "employee", KPI cards won't show (this is by design).

## Still Not Working?

If you've followed all steps and it's still not working:

1. Check the complete backend logs for any errors
2. Verify all three files were modified correctly:
   - HomeService.java
   - HomeResponse.java  
   - Home.jsx
3. Ensure backend was rebuilt after changes
4. Check if there are any CORS or authentication errors in browser console
