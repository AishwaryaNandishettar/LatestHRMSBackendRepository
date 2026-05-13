# Employee Insurance Claim Button Implementation

## Overview
Added the ability for **Employees** to create and submit insurance claims, similar to how Admins can. This feature was previously only available to Admin users.

## How It Works for Employees

### 1. **New Claim Button Visibility**
- ✅ Employees now see the **"+ New Claim"** button (previously only Admin could see it)
- Button appears in the filter section when not showing the form
- Clicking it opens the claim creation form

### 2. **Auto-Filled Employee Data**
When an employee opens the form:
- **Employee Name** field is automatically filled with their email address (read-only)
- **Employee Code** field is automatically filled with their employee code (read-only)
- This prevents employees from creating claims for other employees

### 3. **Claim Submission**
- Employees can fill in all required fields:
  - Relationship (Father, Mother, Wife, Husband, Brother, Other)
  - Claim Type (Hospitalization, Maternity, Surgery, Medical, Accident, Other)
  - Date Range (From Date to To Date)
  - Admitted Days
  - Claim Amount
  - Hospital/Doctor details (based on claim type)
  - Description and supporting documents
- Claims are submitted with status: **"SUBMITTED"**

### 4. **View Own Claims**
- Employees can only see their own claims in the table
- They cannot see other employees' claims
- They can view the status and details of their submitted claims

### 5. **Restrictions for Employees**
- ❌ Cannot approve/reject claims
- ❌ Cannot edit approved amounts
- ❌ Cannot create claims for other employees
- ✅ Can only view their own claims
- ✅ Can submit new claims
- ✅ Can view claim status and history

## Changes Made

### File: `InsuranceClaim.jsx`

#### Change 1: New Claim Button Visibility
**Before:**
```jsx
{role === ROLE_ADMIN && (
  <button className="new-claim-btn" onClick={() => setShowForm(!showForm)}>
    + New Claim
  </button>
)}
```

**After:**
```jsx
{(role === ROLE_ADMIN || role === ROLE_EMP) && (
  <button className="new-claim-btn" onClick={() => setShowForm(!showForm)}>
    + New Claim
  </button>
)}
```

#### Change 2: Form Visibility
**Before:**
```jsx
{role === ROLE_ADMIN && showForm && (
  <div className="claim-form">
```

**After:**
```jsx
{(role === ROLE_ADMIN || role === ROLE_EMP) && showForm && (
  <div className="claim-form">
```

#### Change 3: Auto-Fill Employee Data
**Before:**
```jsx
<input name="employeeName" placeholder="Employee Name *" onChange={handleInput} required />
<input name="employeeCode" placeholder="Employee Code *" onChange={handleInput} required />
```

**After:**
```jsx
<input name="employeeName" placeholder="Employee Name *" value={role === ROLE_EMP ? user?.email || "" : formData.employeeName} onChange={handleInput} required readOnly={role === ROLE_EMP} />
<input name="employeeCode" placeholder="Employee Code *" value={role === ROLE_EMP ? user?.employeeCode || "" : formData.employeeCode} onChange={handleInput} required readOnly={role === ROLE_EMP} />
```

#### Change 4: Pre-fill Form Data on Mount
**Before:**
```jsx
useEffect(() => {
  if (user?.role) {
    setRole((user.role || "").toLowerCase());
  }
}, [user]);
```

**After:**
```jsx
useEffect(() => {
  if (user?.role) {
    setRole((user.role || "").toLowerCase());
    // Pre-fill employee data for employees
    if ((user.role || "").toLowerCase() === "employee") {
      setFormData(prev => ({
        ...prev,
        employeeName: user?.email || "",
        employeeCode: user?.employeeCode || ""
      }));
    }
  }
}, [user]);
```

## Existing Functionality Preserved

✅ **Admin Features** - Unchanged
- Can create claims for any employee
- Can view all claims
- Can export to CSV/PDF
- Can filter and search claims

✅ **Manager Features** - Unchanged
- Can approve/reject claims
- Can edit approved amounts
- Can view claims from their team

✅ **Employee Features** - Enhanced
- Can now create their own claims
- Can view only their own claims
- Cannot modify or approve claims

## Testing Checklist

- [ ] Login as Employee
- [ ] Verify "+ New Claim" button is visible
- [ ] Click button and verify form opens
- [ ] Verify Employee Name and Code are auto-filled and read-only
- [ ] Fill in claim details and submit
- [ ] Verify claim appears in table with "SUBMITTED" status
- [ ] Verify employee can only see their own claims
- [ ] Verify employee cannot see action buttons (Approve/Reject)
- [ ] Login as Manager and verify they can still approve/reject
- [ ] Login as Admin and verify they can still create claims for others

## No Breaking Changes
- All existing Admin functionality remains intact
- All existing Manager functionality remains intact
- Employee view restrictions are maintained
- No changes to backend API or database schema required
