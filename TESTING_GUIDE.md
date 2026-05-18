# HRMS Testing Guide - Role-Based Filtering

## Test Accounts Setup

### Admin Account
- **Email:** Aishwarya@company.com
- **Role:** Admin
- **Access:** All features, all employees

### Manager Account
- **Email:** Aishmanager@omoi.com
- **Role:** Manager
- **Team Members:** Adhviti (adhviti@gmail.com)
- **Access:** Own records + team members' records

### Employee Account
- **Email:** adhviti@gmail.com
- **Role:** Employee
- **Manager:** Aishmanager@omoi.com
- **Access:** Only own records

---

## Test Scenarios

### 1. ATTENDANCE MANAGEMENT

#### Test 1.1: Admin Attendance View
1. Login as **Aishwarya@company.com** (Admin)
2. Navigate to **Attendance Management**
3. **Expected:** See all employees' check-in records
4. **Verify:**
   - ✅ All employees visible in table
   - ✅ EMP ID column shows correct employee IDs
   - ✅ Emp Name column shows correct names
   - ✅ DEPT column shows correct departments
   - ✅ REPORTING MANAGER column visible

#### Test 1.2: Manager Attendance View
1. Login as **Aishmanager@omoi.com** (Manager)
2. Navigate to **Attendance Management**
3. **Expected:** See own check-in + team members' check-in
4. **Verify:**
   - ✅ Manager's own record visible with correct name, empId, dept
   - ✅ Adhviti's record visible with correct details
   - ✅ No other employees visible
   - ✅ REPORTING MANAGER column visible

#### Test 1.3: Employee Attendance View
1. Login as **adhviti@gmail.com** (Employee)
2. Navigate to **Attendance Management**
3. **Expected:** See only own check-in records
4. **Verify:**
   - ✅ Only own records visible
   - ✅ REPORTING MANAGER column NOT visible
   - ✅ Can check-in/check-out/mark WFH

#### Test 1.4: Check-In Functionality
1. Login as **Aishmanager@omoi.com** (Manager)
2. Click **Check In** button
3. Allow location access
4. **Expected:** Check-in successful
5. Navigate to **Attendance Management**
6. **Verify:**
   - ✅ Manager's check-in record appears
   - ✅ Name shows "Aishmanager" or manager's name
   - ✅ EMP ID shows manager's employee ID
   - ✅ DEPT shows manager's department
   - ✅ CHECK IN time populated
   - ✅ IN LOCATION shows coordinates

---

### 2. TIMESHEET MANAGEMENT

#### Test 2.1: Admin Timesheet View
1. Login as **Aishwarya@company.com** (Admin)
2. Navigate to **Timesheet**
3. **Expected:** See all employees' timesheet
4. **Verify:**
   - ✅ All employees visible
   - ✅ KPI cards show total counts
   - ✅ STATUS column visible

#### Test 2.2: Manager Timesheet View
1. Login as **Aishmanager@omoi.com** (Manager)
2. Navigate to **Timesheet**
3. **Expected:** See own + team members' timesheet
4. **Verify:**
   - ✅ Manager's record visible
   - ✅ Adhviti's record visible
   - ✅ No other employees visible
   - ✅ APPROVAL dropdown visible for each record

#### Test 2.3: KPI Filtering
1. Login as **Aishmanager@omoi.com** (Manager)
2. Navigate to **Timesheet**
3. Click on **Present KPI card**
4. **Expected:** Table filters to show only records with present > 0
5. **Verify:**
   - ✅ KPI card shows border/highlight
   - ✅ Table shows only present records
   - ✅ Click again to clear filter

#### Test 2.4: Dual Calendar Filtering
1. Login as **Aishmanager@omoi.com** (Manager)
2. Navigate to **Timesheet**
3. Set **From Month:** 2026-04
4. Set **To Month:** 2026-05
5. **Expected:** Table filters to show records within date range
6. **Verify:**
   - ✅ Only records from April-May visible
   - ✅ Clear Filters button appears

#### Test 2.5: Manager Approval
1. Login as **Aishmanager@omoi.com** (Manager)
2. Navigate to **Timesheet**
3. Find Adhviti's record
4. Click **APPROVAL dropdown**
5. Select **Approve**
6. **Expected:** Status changes to Approved
7. **Verify:**
   - ✅ Dropdown shows Pending/Approve/Reject options
   - ✅ Status updates in table

---

### 3. TASK MANAGEMENT

#### Test 3.1: Admin Task View
1. Login as **Aishwarya@company.com** (Admin)
2. Navigate to **Task Management**
3. **Expected:** See all tasks
4. **Verify:**
   - ✅ All tasks visible in tracking table
   - ✅ Can create task for any employee

#### Test 3.2: Manager Task View
1. Login as **Aishmanager@omoi.com** (Manager)
2. Navigate to **Task Management**
3. **Expected:** See only tasks assigned to team members
4. **Verify:**
   - ✅ Only Adhviti's tasks visible
   - ✅ No other employees' tasks visible
   - ✅ Tracking table shows only team member tasks

#### Test 3.3: Manager Task Assignment
1. Login as **Aishmanager@omoi.com** (Manager)
2. Navigate to **Task Management**
3. Scroll to **Create Task** form
4. **Verify:**
   - ✅ Assignee dropdown shows only Adhviti
   - ✅ Cannot assign to other employees

#### Test 3.4: Employee Task Actions
1. Login as **adhviti@gmail.com** (Employee)
2. Navigate to **Task Management**
3. Find assigned task
4. Click **Accept** button
5. **Expected:** Task status changes to ACCEPTED
6. **Verify:**
   - ✅ Progress slider appears
   - ✅ Can update progress
   - ✅ Can submit for approval

---

### 4. HELPDESK TICKET MANAGEMENT

#### Test 4.1: Admin Helpdesk View
1. Login as **Aishwarya@company.com** (Admin)
2. Navigate to **Helpdesk**
3. **Expected:** See all tickets
4. **Verify:**
   - ✅ All tickets visible
   - ✅ Raised By filter available
   - ✅ Role column visible
   - ✅ Resolve/Reopen buttons visible

#### Test 4.2: Manager Helpdesk View
1. Login as **Aishmanager@omoi.com** (Manager)
2. Navigate to **Helpdesk**
3. **Expected:** See own + team members' tickets
4. **Verify:**
   - ✅ Manager's tickets visible
   - ✅ Adhviti's tickets visible
   - ✅ No other employees' tickets visible
   - ✅ Raised By filter NOT available

#### Test 4.3: Employee Helpdesk View
1. Login as **adhviti@gmail.com** (Employee)
2. Navigate to **Helpdesk**
3. **Expected:** See only own tickets
4. **Verify:**
   - ✅ Only own tickets visible
   - ✅ Can raise new ticket
   - ✅ Can attach file

#### Test 4.4: Attachment Viewing
1. Login as **Aishwarya@company.com** (Admin)
2. Navigate to **Helpdesk**
3. Find ticket with attachment
4. Click on **attachment link** (📎 filename)
5. **Expected:** New window opens with attachment viewer
6. **Verify:**
   - ✅ Toolbar shows filename
   - ✅ Download button works
   - ✅ Print button works
   - ✅ Close button works
   - ✅ Image displays correctly (if image)
   - ✅ PDF embeds correctly (if PDF)

#### Test 4.5: Ticket Resolution
1. Login as **Aishwarya@company.com** (Admin)
2. Navigate to **Helpdesk**
3. Find Open ticket
4. Click **Resolve** button
5. Confirm in modal
6. **Expected:** Ticket status changes to Resolved
7. **Verify:**
   - ✅ Modal shows ticket details
   - ✅ Status updates to Resolved
   - ✅ Resolved By shows admin email
   - ✅ Reopen button appears

---

### 5. PERFORMANCE MANAGEMENT

#### Test 5.1: Admin Performance View
1. Login as **Aishwarya@company.com** (Admin)
2. Navigate to **Performance**
3. **Expected:** See all employees in dropdown
4. **Verify:**
   - ✅ All active employees visible
   - ✅ Can select any employee
   - ✅ Team Performance Tracking table shows all employees

#### Test 5.2: Manager Performance View
1. Login as **Aishmanager@omoi.com** (Manager)
2. Navigate to **Performance**
3. **Expected:** See only team members
4. **Verify:**
   - ✅ Only Adhviti visible in dropdown
   - ✅ Team Performance Tracking shows only Adhviti
   - ✅ Cannot select other employees

#### Test 5.3: Employee Performance View
1. Login as **adhviti@gmail.com** (Employee)
2. Navigate to **Performance**
3. **Expected:** See only own performance
4. **Verify:**
   - ✅ Dropdown shows only own name
   - ✅ Cannot change selection
   - ✅ Shows "My Performance" title

#### Test 5.4: Manager Feedback
1. Login as **Aishmanager@omoi.com** (Manager)
2. Navigate to **Performance**
3. Select **Adhviti** from dropdown
4. Click **Give Feedback** button
5. Fill feedback form:
   - Quarter: Q2 2026
   - Rating: 4.5
   - Comments: "Excellent performance"
6. Click **Save**
7. **Expected:** Feedback saved successfully
8. **Verify:**
   - ✅ Modal closes
   - ✅ Feedback appears in reviews table
   - ✅ Reviewer shows "Manager"

---

## Verification Checklist

### Attendance
- [ ] Admin sees all employees
- [ ] Manager sees own + team
- [ ] Employee sees only own
- [ ] Manager's name/empId/dept correct
- [ ] Check-in/out works
- [ ] Date range filtering works
- [ ] Export CSV/Excel works

### Timesheet
- [ ] Admin sees all employees
- [ ] Manager sees own + team
- [ ] Employee sees only own
- [ ] KPI cards filter correctly
- [ ] Dual calendar filters correctly
- [ ] Manager can approve/reject
- [ ] Status column shows correctly

### Task
- [ ] Admin sees all tasks
- [ ] Manager sees only team tasks
- [ ] Employee sees only own tasks
- [ ] Manager can assign to team only
- [ ] Employee can accept/reject/submit
- [ ] Manager can approve/reject
- [ ] Progress tracking works

### Helpdesk
- [ ] Admin sees all tickets
- [ ] Manager sees own + team
- [ ] Employee sees only own
- [ ] Attachment viewing works
- [ ] Admin can resolve/reopen
- [ ] Filters work correctly
- [ ] Email notifications sent

### Performance
- [ ] Admin sees all employees
- [ ] Manager sees only team
- [ ] Employee sees only own
- [ ] Manager can give feedback
- [ ] Performance band calculated
- [ ] Charts display correctly
- [ ] Team tracking shows correct data

---

## Troubleshooting

### Issue: Manager sees all employees instead of just team
**Solution:** 
1. Verify employee has `managerEmail` field set to manager's email
2. Check backend logs for filtering errors
3. Clear browser cache and refresh

### Issue: Attachment not displaying
**Solution:**
1. Verify attachment was uploaded with base64 data
2. Check browser console for errors
3. Try different file format (PDF vs Image)

### Issue: KPI filter not working
**Solution:**
1. Verify data has correct status values
2. Clear filters and try again
3. Check browser console for JavaScript errors

### Issue: Manager's own record not showing
**Solution:**
1. Verify manager has checked in
2. Check backend logs for enrichment errors
3. Verify manager's User record has name/empId/dept fields

---

## Performance Benchmarks

- Attendance page load: < 2 seconds
- Timesheet page load: < 2 seconds
- Task page load: < 1 second
- Helpdesk page load: < 2 seconds
- Performance page load: < 3 seconds
- Attachment view: < 1 second

---

**Last Updated:** May 7, 2026
**Test Environment:** Development
**Status:** Ready for testing
