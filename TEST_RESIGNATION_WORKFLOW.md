# 🧪 RESIGNATION WORKFLOW - TESTING GUIDE

## 🎯 WHAT WAS FIXED

**Problem**: Employee (Adhviti) could approve their own resignation. Manager (Aishmanager@omoi.com) never saw the resignation.

**Solution**: Fixed frontend to send manager's **EMAIL** instead of **NAME** when submitting resignation.

---

## ✅ TESTING CHECKLIST

### **TEST 1: Employee Submits Resignation** 👤

**Login as**: Adhviti (Employee)

**Steps**:
1. Go to **Profile** page
2. Click **Exit Management** tab
3. Fill the resignation form:
   - **Reason**: "Better opportunity"
   - **Remarks**: "Thank you for everything"
   - **TO (Reporting Manager)**: Type "Aish" and select **Aishmanager@omoi.com**
   - **Notice Period**: 60 Days
   - **Last Working Day**: Select a date
4. Click **"Submit Resignation"** button

**Expected Result**:
- ✅ Alert: "Resignation submitted successfully!"
- ✅ Form disappears
- ✅ Shows "Your Resignation Status" box with:
  - Submitted date
  - Last working day
  - Reason
  - Status: **PENDING_MANAGER** (yellow badge)
- ❌ NO "Simulate Manager Approval" or "Simulate HR Approval" buttons

**Console Check**:
```
📤 Submitting resignation with manager email: Aishmanager@omoi.com
```

---

### **TEST 2: Manager Sees and Approves Resignation** 👥

**Login as**: Aishmanager@omoi.com (Manager)

**Steps**:
1. Go to **Profile** page
2. Click **Exit Management** tab
3. Look for **"Pending Resignations for Approval"** section

**Expected Result**:
- ✅ Should see a table with Adhviti's resignation:
  - Emp ID: Adhviti's ID
  - Employee Name: Adhviti
  - Department: Adhviti's department
  - Reason: "Better opportunity"
  - Last Working Day: Date selected
  - Submitted Date: Today's date
  - Actions: **"✓ Approve"** and **"✗ Reject"** buttons

**Steps to Approve**:
4. Click **"✓ Approve"** button

**Expected Result**:
- ✅ Alert: "Resignation approved!"
- ✅ Resignation disappears from manager's pending list
- ✅ Status changes to **PENDING_HR**

---

### **TEST 3: Admin Sees and Approves Resignation** 👑

**Login as**: Admin

**Steps**:
1. Go to **Profile** page
2. Click **Exit Management** tab
3. Look for **"Pending HR Approvals"** section

**Expected Result**:
- ✅ Should see a table with Adhviti's resignation:
  - Emp ID: Adhviti's ID
  - Employee Name: Adhviti
  - Department: Adhviti's department
  - Manager Approved: Aishmanager@omoi.com
  - Reason: "Better opportunity"
  - Last Working Day: Date selected
  - Actions: **"✓ Approve"** and **"✗ Reject"** buttons

**Steps to Approve**:
4. Click **"✓ Approve"** button

**Expected Result**:
- ✅ Alert: "Resignation approved!"
- ✅ Resignation disappears from "Pending HR Approvals"
- ✅ Status changes to **APPROVED**

**Check Tracking Table**:
5. Scroll down to **"All Resignations Tracking"** table

**Expected Result**:
- ✅ Should see Adhviti's resignation with:
  - Status: **APPROVED** (green badge)
  - Manager Approved By: Aishmanager@omoi.com
  - HR Approved By: Admin's email

---

### **TEST 4: Employee Sees Final Status** 👤

**Login as**: Adhviti (Employee)

**Steps**:
1. Go to **Profile** page
2. Click **Exit Management** tab

**Expected Result**:
- ✅ Shows "Your Resignation Status" box with:
  - Status: **APPROVED** (green badge)
  - All resignation details

---

### **TEST 5: Rejection Flow** ❌

**Login as**: Adhviti (Employee)

**Steps**:
1. Submit another resignation (follow TEST 1 steps)

**Login as**: Aishmanager@omoi.com (Manager)

**Steps**:
2. Go to **Profile → Exit Management**
3. Click **"✗ Reject"** button
4. Enter rejection reason: "Please reconsider"
5. Click OK

**Expected Result**:
- ✅ Alert: "Resignation rejected!"
- ✅ Resignation disappears from manager's pending list
- ✅ Status changes to **REJECTED**

**Login as**: Adhviti (Employee)

**Steps**:
6. Go to **Profile → Exit Management**

**Expected Result**:
- ✅ Shows "Your Resignation Status" box with:
  - Status: **REJECTED** (red badge)
  - Rejection Reason: "Please reconsider"

---

## 🔍 DEBUGGING TIPS

### **If Manager Doesn't See Resignation**:

1. **Check Console Logs**:
   - When submitting resignation, should see:
     ```
     📤 Submitting resignation with manager email: Aishmanager@omoi.com
     ```
   - If it shows a name instead of email, the fix didn't apply

2. **Check MongoDB**:
   - Open MongoDB Compass
   - Go to `resignations` collection
   - Find the resignation document
   - Check `managerName` field - should be **"Aishmanager@omoi.com"** (email), not "Aishmanager" (name)

3. **Check Manager Email**:
   - When selecting manager in dropdown, make sure it shows email in parentheses:
     ```
     Aishmanager (Aishmanager@omoi.com)
     ```

4. **Check Backend Logs**:
   - When manager loads page, backend should query:
     ```
     findByManagerNameAndStatus("Aishmanager@omoi.com", "PENDING_MANAGER")
     ```

### **If Employee Sees Approval Buttons**:
- This should NOT happen anymore
- The old "Simulate Manager Approval" and "Simulate HR Approval" buttons are removed
- Employee should only see status, not action buttons

### **If Admin Doesn't See Tracking Table**:
- Make sure you're logged in as **ADMIN** role
- Check console for errors
- Verify `getAllResignations()` API call is successful

---

## 📊 EXPECTED DATABASE STATE

After complete workflow, MongoDB `resignations` collection should have:

```json
{
  "_id": "...",
  "empId": "adhviti_id",
  "empName": "Adhviti",
  "department": "Engineering",
  "managerName": "Aishmanager@omoi.com",  // ✅ EMAIL, not name
  "reason": "Better opportunity",
  "remarks": "Thank you for everything",
  "resignationDate": "2026-05-08",
  "lastWorkingDay": "2026-07-08",
  "status": "APPROVED",
  "approvedByManager": "Aishmanager@omoi.com",
  "approvedByHR": "admin@omoi.com"
}
```

---

## ✅ SUCCESS CRITERIA

- ✅ Employee can submit resignation
- ✅ Manager sees resignation in their pending list
- ✅ Manager can approve/reject resignation
- ✅ Admin sees resignation in HR pending list
- ✅ Admin can approve/reject resignation
- ✅ Admin sees all resignations in tracking table
- ✅ Employee sees final status (cannot approve own resignation)
- ✅ Status transitions: PENDING_MANAGER → PENDING_HR → APPROVED
- ✅ Rejection reason is captured and displayed

---

## 🚀 READY TO TEST!

Start with TEST 1 and follow the sequence. Each test builds on the previous one.

**Good luck!** 🎉
