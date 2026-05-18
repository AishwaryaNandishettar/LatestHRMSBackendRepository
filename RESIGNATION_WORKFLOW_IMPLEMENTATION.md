# Resignation Workflow Implementation - Complete Guide

## Overview
This document explains the complete resignation workflow that has been implemented in the HRMS system. The workflow ensures proper approval hierarchy: Employee → Manager → Admin (HR).

---

## How the Workflow Works

### 1. **Employee Submits Resignation**
- Employee navigates to Profile → Resignation Management
- Fills out resignation form:
  - Reason for resignation
  - Remarks (optional)
  - Selects manager from dropdown
  - Selects notice period (30/45/60/90 days)
  - Option to request early release
  - Last working day (auto-calculated or custom)
- Clicks "Submit Resignation"
- **Status**: `PENDING_MANAGER`
- **Backend**: Resignation saved to MongoDB with `status = "PENDING_MANAGER"`

### 2. **Manager Reviews & Approves**
- Manager logs in and navigates to Profile → Resignation Management
- Sees "Pending Resignations for Approval" section
- Shows all resignations where:
  - `managerName` = current manager's email
  - `status` = "PENDING_MANAGER"
- Manager can:
  - **Approve**: Resignation moves to `PENDING_HR` status, `approvedByManager` field is set
  - **Reject**: Resignation marked as `REJECTED`, `rejectionReason` is recorded

### 3. **Admin (HR) Reviews & Approves**
- Admin logs in and navigates to Profile → Resignation Management
- Sees two sections:
  - **Pending HR Approvals**: Resignations with `status = "PENDING_HR"`
  - **All Resignations Tracking**: Complete history of all resignations
- Admin can:
  - **Approve**: Resignation marked as `APPROVED`, `approvedByHR` field is set
  - **Reject**: Resignation marked as `REJECTED`, `rejectionReason` is recorded
- Tracking table shows final status for all resignations

---

## Database Schema (MongoDB)

### Resignation Collection Fields

```javascript
{
  _id: ObjectId,
  empId: String,              // Employee ID
  empName: String,            // Employee Name
  department: String,         // Department
  doj: String,               // Date of Joining
  tenure: String,            // Tenure
  managerName: String,       // Manager's email (identifies who should approve)
  reason: String,            // Reason for resignation
  remarks: String,           // Additional remarks
  resignationDate: String,   // Date resignation was submitted
  lastWorkingDay: String,    // Last working day
  status: String,            // PENDING_MANAGER, PENDING_HR, APPROVED, REJECTED
  approvedByManager: String, // Manager's email who approved
  approvedByHR: String,      // Admin's email who approved
  rejectionReason: String    // Reason if rejected
}
```

---

## Status Flow

```
PENDING_MANAGER
    ↓
    ├─→ [Manager Approves] → PENDING_HR
    │                           ↓
    │                    [Admin Approves] → APPROVED
    │                           ↓
    │                    [Admin Rejects] → REJECTED
    │
    └─→ [Manager Rejects] → REJECTED
```

---

## API Endpoints

### Backend Endpoints (Java Spring Boot)

#### 1. Submit Resignation
```
POST /api/resignation/submit
Body: {
  empId, empName, department, managerName, reason, remarks,
  resignationDate, lastWorkingDay, status: "PENDING_MANAGER"
}
Response: Resignation object
```

#### 2. Get Employee's Resignations
```
GET /api/resignation/{empId}
Response: List<Resignation>
```

#### 3. Get Resignations for Manager Approval
```
GET /api/resignation/pending-manager?managerEmail=manager@email.com
Response: List<Resignation> where status="PENDING_MANAGER" and managerName=email
```

#### 4. Get Resignations for HR Approval
```
GET /api/resignation/pending-hr
Response: List<Resignation> where status="PENDING_HR"
```

#### 5. Get All Resignations (Admin Only)
```
GET /api/resignation/all
Response: List<Resignation>
```

#### 6. Approve Resignation
```
POST /api/resignation/approve/{id}?approverName=approver@email.com
Logic:
  - If status="PENDING_MANAGER": Move to PENDING_HR, set approvedByManager
  - If status="PENDING_HR": Mark as APPROVED, set approvedByHR
Response: Updated Resignation object
```

#### 7. Reject Resignation
```
POST /api/resignation/reject/{id}?rejectionReason=reason
Logic:
  - Set status="REJECTED"
  - Set rejectionReason
Response: Updated Resignation object
```

---

## Frontend Components

### Profile.jsx - Resignation Management Section

#### Employee View
- **Form**: Submit resignation (only if no resignation exists)
- **Status**: Shows their resignation status with color coding
  - Yellow: PENDING_MANAGER
  - Yellow: PENDING_HR
  - Green: APPROVED
  - Red: REJECTED

#### Manager View
- **Pending Resignations Table**: Shows resignations awaiting their approval
- **Columns**: Emp ID, Name, Department, Reason, Last Working Day, Submitted Date, Actions
- **Actions**: Approve (✓) or Reject (✗) buttons
- **Auto-reload**: Table refreshes after approval/rejection

#### Admin View
- **Pending HR Approvals Table**: Shows resignations from managers
- **All Resignations Tracking Table**: Complete history with all details
- **Columns**: Emp ID, Name, Department, Manager, Reason, Submitted Date, Last Working Day, Status, Manager Approved By, HR Approved By
- **Actions**: Approve (✓) or Reject (✗) buttons for pending approvals

---

## API Calls (Frontend)

### resignationApi.js

```javascript
// Submit resignation
submitResignation(resignationData)

// Get employee's resignations
getResignationsByEmployee(empId)

// Get resignations for manager approval
getResignationsForApproval(managerEmail)

// Get resignations for HR approval
getResignationsForHRApproval()

// Get all resignations
getAllResignations()

// Approve resignation
approveResignation(id, approverName)

// Reject resignation
rejectResignation(id, rejectionReason)
```

---

## Key Features Implemented

✅ **Role-Based Views**
- Employees see only their resignation form and status
- Managers see resignations pending their approval
- Admins see pending HR approvals and complete tracking table

✅ **Proper Approval Hierarchy**
- Employee cannot approve their own resignation
- Manager must approve before HR sees it
- Admin (HR) gives final approval

✅ **Status Tracking**
- Color-coded status badges
- Complete audit trail with approver names
- Rejection reasons recorded

✅ **No Simulate Buttons**
- Removed "Simulate Manager Approval" and "Simulate HR Approval" buttons
- Real workflow with actual manager and admin approvals

✅ **Auto-Reload**
- Tables refresh after approval/rejection
- No page refresh needed

✅ **Error Handling**
- Try-catch blocks for all API calls
- User-friendly error messages
- Validation for required fields

---

## How to Test

### Test Case 1: Employee Submits Resignation
1. Login as Employee (e.g., Adhviti)
2. Go to Profile → Resignation Management
3. Fill resignation form
4. Click "Submit Resignation"
5. ✅ Should see "Resignation submitted successfully"
6. ✅ Status should show "PENDING_MANAGER"

### Test Case 2: Manager Approves
1. Login as Manager (e.g., Aishmanager@omoi.com)
2. Go to Profile → Resignation Management
3. ✅ Should see "Pending Resignations for Approval" section
4. ✅ Should see Adhviti's resignation
5. Click "✓ Approve"
6. ✅ Should see "Resignation approved!"
7. ✅ Table should refresh and show no pending resignations

### Test Case 3: Admin Approves
1. Login as Admin
2. Go to Profile → Resignation Management
3. ✅ Should see "Pending HR Approvals" section
4. ✅ Should see Adhviti's resignation (now with manager approval)
5. Click "✓ Approve"
6. ✅ Should see "Resignation approved!"
7. ✅ In "All Resignations Tracking" table, status should be "APPROVED"
8. ✅ "HR Approved By" should show admin's email

### Test Case 4: Manager Rejects
1. Login as Manager
2. Go to Profile → Resignation Management
3. Click "✗ Reject"
4. Enter rejection reason
5. ✅ Should see "Resignation rejected!"
6. ✅ Status should be "REJECTED"

---

## Important Notes

### Manager Identification
- Manager is identified by the `managerName` field in the resignation
- This should be set to the manager's email address
- In MongoDB, ensure each employee has a `managerEmail` field set correctly
- Example: Adhviti's `managerEmail` = "Aishmanager@omoi.com"

### Email/Name Mapping
- Frontend uses `user?.email` from AuthContext
- Backend uses `managerName` field to match resignations
- Ensure email consistency across the system

### Status Values
- `PENDING_MANAGER`: Waiting for manager approval
- `PENDING_HR`: Waiting for HR/Admin approval
- `APPROVED`: Final approval given
- `REJECTED`: Rejected by manager or HR

---

## Files Modified

### Backend
- `ResignationController.java`: Added 4 new endpoints
- `ResignationService.java`: Added 4 new methods
- `ResignationRepository.java`: Already had required query methods
- `Resignation.java`: Already had required fields

### Frontend
- `Profile.jsx`: Complete rewrite of resignation section with role-based views
- `resignationApi.js`: Added 2 new API calls
- `Profile.module.css`: Added styles for approve/reject buttons

---

## Troubleshooting

### Issue: Manager doesn't see resignations
**Solution**: Check that `managerName` field in resignation matches manager's email

### Issue: Status not updating
**Solution**: Check browser console for API errors, verify backend is running

### Issue: Buttons not appearing
**Solution**: Verify user role is set correctly in localStorage

### Issue: Table not refreshing
**Solution**: Check that API calls are returning data correctly

---

## Future Enhancements

- Email notifications when resignation is submitted/approved/rejected
- PDF generation for resignation letter
- Exit clearance checklist integration
- Full & Final settlement tracking
- Experience letter generation
- Relieving letter generation

---

## Summary

The resignation workflow is now fully functional with proper approval hierarchy:
1. Employee submits → Status: PENDING_MANAGER
2. Manager approves → Status: PENDING_HR
3. Admin approves → Status: APPROVED
4. Admin can track all resignations with complete audit trail

No more "Simulate" buttons - the workflow is now real and follows proper organizational hierarchy.
