# Resignation Workflow - Quick Test Guide

## Prerequisites
- Backend running on http://localhost:8080
- Frontend running on http://localhost:5173
- MongoDB with employee data
- At least 3 users: Employee, Manager, Admin

---

## Quick Test Scenario

### Setup
Ensure in MongoDB:
- Employee: Adhviti (empId: emp001, managerEmail: "Aishmanager@omoi.com")
- Manager: Aishmanager (email: "Aishmanager@omoi.com")
- Admin: Any admin user

---

## Test Steps

### Step 1: Employee Submits Resignation
```
1. Open browser → http://localhost:5173
2. Login as: Adhviti (employee)
3. Navigate to: Profile → Resignation Management
4. Fill form:
   - Reason: "Better opportunity"
   - Notice Period: "60 Days"
   - Last Working Day: (auto-calculated)
5. Click: "Submit Resignation"
6. Expected: ✅ "Resignation submitted successfully!"
7. Expected: Status shows "PENDING_MANAGER" (yellow badge)
```

### Step 2: Manager Reviews
```
1. Logout and Login as: Aishmanager (manager)
2. Navigate to: Profile → Resignation Management
3. Expected: See "Pending Resignations for Approval" section
4. Expected: See Adhviti's resignation in table
5. Click: "✓ Approve" button
6. Expected: ✅ "Resignation approved!"
7. Expected: Table refreshes, no more pending resignations
```

### Step 3: Admin Approves
```
1. Logout and Login as: Admin user
2. Navigate to: Profile → Resignation Management
3. Expected: See "Pending HR Approvals" section
4. Expected: See Adhviti's resignation
5. Click: "✓ Approve" button
6. Expected: ✅ "Resignation approved!"
7. Expected: In "All Resignations Tracking" table:
   - Status: "APPROVED" (green badge)
   - Manager Approved By: "Aishmanager@omoi.com"
   - HR Approved By: (admin's email)
```

---

## What Should Happen at Each Stage

### Employee View
- ✅ Can submit resignation
- ✅ Cannot approve their own resignation
- ✅ Sees their resignation status
- ✅ Cannot see other employees' resignations

### Manager View
- ✅ Sees "Pending Resignations for Approval" section
- ✅ Only sees resignations where managerName = their email
- ✅ Can approve (moves to PENDING_HR)
- ✅ Can reject (marks as REJECTED)
- ✅ Cannot see HR approval section

### Admin View
- ✅ Sees "Pending HR Approvals" section
- ✅ Sees all resignations with status PENDING_HR
- ✅ Can approve (marks as APPROVED)
- ✅ Can reject (marks as REJECTED)
- ✅ Sees "All Resignations Tracking" table with complete history
- ✅ Can see all resignations regardless of status

---

## API Endpoints to Test (Using Postman/cURL)

### 1. Submit Resignation
```bash
POST http://localhost:8080/api/resignation/submit
Content-Type: application/json

{
  "empId": "emp001",
  "empName": "Adhviti",
  "department": "Engineering",
  "managerName": "Aishmanager@omoi.com",
  "reason": "Better opportunity",
  "remarks": "Thank you for the opportunity",
  "resignationDate": "2025-05-08",
  "lastWorkingDay": "2025-07-07",
  "status": "PENDING_MANAGER"
}
```

### 2. Get Manager's Pending Resignations
```bash
GET http://localhost:8080/api/resignation/pending-manager?managerEmail=Aishmanager@omoi.com
```

### 3. Get HR's Pending Resignations
```bash
GET http://localhost:8080/api/resignation/pending-hr
```

### 4. Approve Resignation
```bash
POST http://localhost:8080/api/resignation/approve/{resignationId}?approverName=Aishmanager@omoi.com
```

### 5. Reject Resignation
```bash
POST http://localhost:8080/api/resignation/reject/{resignationId}?rejectionReason=Not appropriate time
```

### 6. Get All Resignations
```bash
GET http://localhost:8080/api/resignation/all
```

---

## Common Issues & Solutions

### Issue: "No pending resignations" in Manager view
**Check**:
- Is the resignation status "PENDING_MANAGER"?
- Does managerName match the logged-in manager's email?
- Is the manager's email correct in MongoDB?

**Solution**:
```javascript
// Check in MongoDB
db.resignations.findOne({empId: "emp001"})
// Should show: managerName: "Aishmanager@omoi.com", status: "PENDING_MANAGER"
```

### Issue: Manager sees all resignations instead of just theirs
**Check**:
- Backend is filtering by managerName correctly
- Manager's email is set correctly in localStorage

**Solution**:
- Check browser console for API response
- Verify managerName field in resignation matches manager's email

### Issue: Status not updating after approval
**Check**:
- API call succeeded (check network tab)
- Backend returned updated resignation
- Frontend reloaded the table

**Solution**:
- Check browser console for errors
- Verify backend is running
- Try refreshing the page

### Issue: Admin doesn't see "All Resignations Tracking" table
**Check**:
- User role is "ADMIN"
- Check localStorage: `localStorage.getItem("role")`

**Solution**:
- Logout and login again
- Check that user has ADMIN role in database

---

## Expected Database State After Complete Workflow

```javascript
// In MongoDB - resignations collection
{
  _id: ObjectId("..."),
  empId: "emp001",
  empName: "Adhviti",
  department: "Engineering",
  managerName: "Aishmanager@omoi.com",
  reason: "Better opportunity",
  remarks: "Thank you for the opportunity",
  resignationDate: "2025-05-08",
  lastWorkingDay: "2025-07-07",
  status: "APPROVED",
  approvedByManager: "Aishmanager@omoi.com",
  approvedByHR: "admin@email.com",
  rejectionReason: null
}
```

---

## Verification Checklist

- [ ] Employee can submit resignation
- [ ] Employee sees "PENDING_MANAGER" status
- [ ] Manager sees resignation in pending list
- [ ] Manager can approve (status → PENDING_HR)
- [ ] Manager can reject (status → REJECTED)
- [ ] Admin sees resignation in pending HR list
- [ ] Admin can approve (status → APPROVED)
- [ ] Admin can reject (status → REJECTED)
- [ ] Admin sees complete tracking table
- [ ] All status badges show correct colors
- [ ] Approver names are recorded correctly
- [ ] No "Simulate" buttons appear
- [ ] Tables refresh after approval/rejection
- [ ] Error messages appear for failed operations

---

## Performance Notes

- First load may take 2-3 seconds (API calls)
- Table refresh is instant after approval
- No page reload needed
- All data persists in MongoDB

---

## Support

If you encounter issues:
1. Check browser console (F12 → Console tab)
2. Check backend logs
3. Verify MongoDB data
4. Check network requests (F12 → Network tab)
5. Verify user roles and emails match

---

## Next Steps

After testing:
1. ✅ Verify all workflows work correctly
2. ✅ Test with different users
3. ✅ Test rejection scenarios
4. ✅ Test with different notice periods
5. ✅ Verify email notifications (if implemented)
6. ✅ Deploy to production

---

**Last Updated**: May 8, 2025
**Status**: Ready for Testing ✅
