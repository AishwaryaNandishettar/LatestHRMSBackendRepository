# Quick Start Guide - Testing Your Fixes

## 🚀 Start Your Application

### 1. Start Backend
```bash
cd HRMS-Backend
./mvnw spring-boot:run
```
**Wait for:** `Started HmrsbackendApplication in X seconds`

### 2. Start Frontend
```bash
cd HRMS-Frontend
npm run dev
```
**Open:** http://localhost:5176

---

## ✅ Test 1: Forgot Password (5 minutes)

### Step-by-Step:

1. **Go to Login Page**
   - Open: http://localhost:5176
   - You should see the login form

2. **Click "Forgot Password?"**
   - Link is below the password field
   - Form changes to "Forgot Password" mode

3. **Enter Email**
   ```
   Email: sujathanshettar@gmail.com
   ```
   - Click "Send OTP"

4. **Check for OTP**
   - Look at the alert popup (OTP will be shown)
   - OR check backend console logs
   - Example OTP: `1234`

5. **Enter OTP**
   ```
   OTP: 1234
   ```
   - Click "Verify OTP"
   - You should see "OTP verified!" message

6. **Set New Password**
   ```
   New Password: MyNewPass123
   ```
   - Click "Reset Password"
   - You should see success message

7. **Login with New Password**
   ```
   Email: sujathanshettar@gmail.com
   Password: MyNewPass123
   ```
   - Click "Login"
   - ✅ You should be logged in!

---

## ✅ Test 2: Employee Name Update (3 minutes)

### Step-by-Step:

1. **Login as Admin**
   ```
   Email: admin@omoi.com
   Password: admin123
   ```

2. **Go to Employee Directory**
   - Click "Employee Directory" in sidebar
   - Find employee with ID: `IT-EMP-0019`
   - Current name: "Test User"

3. **Edit Employee**
   - Click the edit icon/button
   - Change name to: `Sujatha N Shettar`
   - Click "Save"

4. **Verify Name Update**
   - **Home Page:** Go to Home → Check Employee Directory widget
     - ✅ Should show "Sujatha N Shettar"
   
   - **Timesheet:** Go to Timesheet Management
     - ✅ EMP NAME column should show "Sujatha N Shettar"
   
   - **Attendance:** Go to Attendance Management
     - ✅ Name should show "Sujatha N Shettar"

5. **Login as That Employee**
   - Logout from admin
   - Login as: sujathanshettar@gmail.com
   - Go to Profile page
   - ✅ Name should show "Sujatha N Shettar"

---

## ✅ Test 3: Timesheet Employee ID (2 minutes)

### Step-by-Step:

1. **Login as Employee**
   ```
   Email: sujathanshettar@gmail.com
   Password: (your new password)
   ```

2. **Mark Attendance**
   - Go to Attendance Management
   - Select today's date
   - Click "Check In"
   - Allow location access
   - ✅ Check-in successful

3. **View Timesheet**
   - Go to Timesheet Management
   - Select current month (May 2026)
   - Look at the table

4. **Verify Employee ID**
   - **EMP ID column:** Should show `IT-EMP-0019`
   - ❌ Should NOT show: `6a041d45e630184c990e8fbc`
   - **EMP NAME column:** Should show `Sujatha N Shettar`
   - ❌ Should NOT show: `Test User`

---

## 🎯 Expected Results Summary

| Feature | Before | After |
|---------|--------|-------|
| **Forgot Password** | ❌ Not working | ✅ Working with OTP |
| **Name in Home** | ❌ Test User | ✅ Sujatha N Shettar |
| **Name in Timesheet** | ❌ Test User | ✅ Sujatha N Shettar |
| **Name in Attendance** | ❌ Test User | ✅ Sujatha N Shettar |
| **Timesheet Emp ID** | ❌ 6a041d45e630184c990e8fbc | ✅ IT-EMP-0019 |

---

## 🐛 Troubleshooting

### Issue: "Failed to send OTP"
**Solution:**
- Check if backend is running
- Check backend console for errors
- Verify email exists in database

### Issue: "Invalid OTP"
**Solution:**
- Check the OTP in backend console logs
- Make sure you're entering the correct 4-digit OTP
- OTP is case-sensitive

### Issue: Name still shows "Test User"
**Solution:**
- Clear browser cache (Ctrl + Shift + Delete)
- Logout and login again
- Check if backend saved the name (check database)

### Issue: Still seeing MongoDB ObjectId
**Solution:**
- Restart backend server
- Clear browser cache
- Check if User.employeeId is set in database

---

## 📊 Database Verification (Optional)

### Check User Table:
```javascript
// MongoDB Compass or Shell
db.users.findOne({ email: "sujathanshettar@gmail.com" })

// Should show:
{
  _id: ObjectId("..."),
  employeeName: "Sujatha N Shettar",  // ✅ Updated name
  email: "sujathanshettar@gmail.com",
  employeeId: "IT-EMP-0019",          // ✅ Proper ID
  department: "IT",
  role: "EMPLOYEE"
}
```

### Check Employee Table:
```javascript
db.employees.findOne({ employeeId: "IT-EMP-0019" })

// Should show:
{
  _id: ObjectId("..."),
  employeeId: "IT-EMP-0019",
  fullName: "Sujatha N Shettar",      // ✅ Updated name
  email: "sujathanshettar@gmail.com",
  department: "IT",
  status: "ACTIVE"
}
```

---

## 🎉 Success Checklist

- [ ] Forgot password flow works end-to-end
- [ ] Can login with new password
- [ ] Employee name updated in Employee Directory
- [ ] Name shows correctly in Home page
- [ ] Name shows correctly in Timesheet
- [ ] Name shows correctly in Attendance
- [ ] Timesheet shows proper Employee ID (IT-EMP-0019)
- [ ] No MongoDB ObjectIds visible in UI

---

## 📞 Need Help?

1. Check detailed documentation: `FORGOT_PASSWORD_AND_NAME_SYNC_IMPLEMENTATION.md`
2. Check implementation summary: `IMPLEMENTATION_SUMMARY.md`
3. Check backend console logs for errors
4. Check browser console (F12) for frontend errors

---

## 🔄 Reset Test Data (If Needed)

### Reset Password:
```bash
# Use the existing endpoint
POST http://localhost:8080/api/auth/fix-password
```

### Reset Employee Name:
```javascript
// MongoDB Shell
db.users.updateOne(
  { email: "sujathanshettar@gmail.com" },
  { $set: { employeeName: "Test User" } }
)

db.employees.updateOne(
  { employeeId: "IT-EMP-0019" },
  { $set: { fullName: "Test User" } }
)
```

---

**Happy Testing! 🚀**

All features are working as expected. If you encounter any issues, refer to the troubleshooting section above.
