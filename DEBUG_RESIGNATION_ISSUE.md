# 🔍 DEBUG: Manager Not Seeing Resignations

## STEPS TO DEBUG

### Step 1: Check Browser Console When Submitting Resignation

1. **Login as Adhviti** (Employee)
2. Open **Browser Console** (F12 → Console tab)
3. Go to **Profile → Resignation Letter**
4. Fill the resignation form
5. Select **Aishmanager@omoi.com** as manager
6. Click **"Submit Resignation"**

**Look for these console logs**:
```
📤 Submitting resignation with manager email: Aishmanager@omoi.com
```

**IMPORTANT**: The manager email should be **"Aishmanager@omoi.com"** (email), NOT "Aishmanager" (name)

---

### Step 2: Check MongoDB Database

1. Open **MongoDB Compass**
2. Connect to your database
3. Go to **`resignations`** collection
4. Find the resignation you just submitted

**Check the `managerName` field**:
```json
{
  "_id": "...",
  "empId": "adhviti_id",
  "empName": "Adhviti",
  "managerName": "Aishmanager@omoi.com",  // ✅ Should be EMAIL
  "status": "PENDING_MANAGER",
  ...
}
```

**If `managerName` is NOT an email**:
- The dropdown is not showing emails correctly
- Or the form is not capturing the email

---

### Step 3: Check Manager's Console When Loading Page

1. **Login as Aishmanager@omoi.com** (Manager)
2. Open **Browser Console** (F12 → Console tab)
3. Go to **Profile → Resignation Letter**

**Look for these console logs**:
```
🔍 LOADING RESIGNATIONS:
  - User Email: Aishmanager@omoi.com
  - User Role: MANAGER
  - User Emp ID: ...

👥 MANAGER - Fetching resignations for: Aishmanager@omoi.com
📋 Manager Resignations Response: [...]
📊 Number of pending resignations: 1
```

**If "Number of pending resignations: 0"**:
- The backend query is not finding any resignations
- This means the `managerName` in database doesn't match "Aishmanager@omoi.com"

---

### Step 4: Check Backend Logs

1. Look at your **Spring Boot backend console**
2. When manager loads the page, you should see a query like:
```
Hibernate: SELECT * FROM resignations WHERE manager_name = 'Aishmanager@omoi.com' AND status = 'PENDING_MANAGER'
```

**If no results**:
- The `managerName` in database doesn't match the query parameter

---

## POSSIBLE ISSUES & SOLUTIONS

### Issue 1: Manager Dropdown Shows Names Instead of Emails

**Check**: When typing in the "TO (Reporting Manager)" field, does it show:
- ✅ **Correct**: "Aishmanager (Aishmanager@omoi.com)"
- ❌ **Wrong**: "Aishmanager"

**Solution**: The `users` array needs to have correct email field.

**Check this code in Profile.jsx** (around line 70):
```javascript
const users = allEmployees.map(emp => ({
  id: emp.id || emp.employeeId,
  name: emp.fullName || emp.name || emp.empName || "N/A",
  email: emp.email || "N/A"  // ✅ Make sure this is correct
}));
```

---

### Issue 2: Employee Data Missing Email

**Check MongoDB `employees` collection**:
```json
{
  "_id": "...",
  "employeeId": "aishmanager_id",
  "name": "Aishmanager",
  "email": "Aishmanager@omoi.com",  // ✅ Must have email field
  ...
}
```

**If email is missing**:
- Add email field to all employees in MongoDB
- Or update the Employee model to include email

---

### Issue 3: Old Resignations in Database

**If you submitted resignations BEFORE the fix**:
- Those old resignations have `managerName` as "Aishmanager" (name)
- They will NEVER show up for the manager
- **Solution**: Delete old resignations and submit a new one

**MongoDB Command**:
```javascript
// Delete all old resignations
db.resignations.deleteMany({})

// Or update old resignations
db.resignations.updateMany(
  { managerName: "Aishmanager" },
  { $set: { managerName: "Aishmanager@omoi.com" } }
)
```

---

### Issue 4: Manager Email Not in localStorage

**Check**: When manager logs in, is email saved correctly?

**Open Browser Console** (when logged in as manager):
```javascript
localStorage.getItem("email")
// Should return: "Aishmanager@omoi.com"
```

**If it returns null or wrong value**:
- Check the login response
- Make sure email is saved in localStorage during login

---

## QUICK FIX: Manual Database Update

If you want to test immediately, manually update the resignation in MongoDB:

1. Open **MongoDB Compass**
2. Go to **`resignations`** collection
3. Find Adhviti's resignation
4. Click **Edit Document**
5. Change `managerName` from "Aishmanager" to "Aishmanager@omoi.com"
6. Click **Update**
7. Refresh manager's page

---

## TESTING CHECKLIST

After following the steps above:

- [ ] Console shows manager email when submitting resignation
- [ ] MongoDB has manager email (not name) in `managerName` field
- [ ] Manager's console shows correct email when loading page
- [ ] Manager's console shows "Number of pending resignations: 1"
- [ ] Manager sees resignation in "Pending Resignations for Approval" table
- [ ] Manager can approve/reject resignation
- [ ] Status changes to PENDING_HR after manager approval

---

## NEXT STEPS

1. **Follow Step 1-3** above and share the console logs with me
2. **Check MongoDB** and share what's in the `managerName` field
3. If issue persists, we'll add more debugging or fix the root cause

Let me know what you find! 🔍
