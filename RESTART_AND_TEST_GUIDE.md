# RESTART AND TEST GUIDE - OTP Fix

## ⚠️ IMPORTANT: You MUST restart the backend server for changes to take effect!

---

## Step 1: Stop Backend Server

1. Go to the terminal where backend is running
2. Press `Ctrl + C` to stop the server
3. Wait for it to fully stop

---

## Step 2: Restart Backend Server

```bash
cd e:\HRMSProject\HRMS-Backend
mvnw spring-boot:run
```

**Wait for this message:**
```
Started HmrsbackendApplication in X.XXX seconds
```

---

## Step 3: Test OTP Flow

### 3.1 Request OTP

1. Go to: http://localhost:5176
2. Click "Forgot Password?"
3. Enter email: `sujathanshettar@gmail.com`
4. Click "Send OTP"

### 3.2 Check Backend Console

You should see detailed logs like this:

```
========================================
✅ FORGOT PASSWORD REQUEST
  Email: sujathanshettar@gmail.com
  Generated OTP: [7105]
  OTP length: 4
  Hashed OTP stored: $2a$10$abcdefghij...
  Expiry time: 1715612345678
  User saved successfully
========================================
✅ OTP email sent successfully to: sujathanshettar@gmail.com
```

**Copy the OTP from the console** (e.g., 7105)

### 3.3 Check Email

1. Open Gmail
2. Find email from: aishushettar95@gmail.com
3. Subject: "Your OTP Code - HRMS"
4. Verify OTP matches console (e.g., 7105)

### 3.4 Enter OTP

1. Go back to browser
2. Enter OTP: `7105`
3. Click "Verify OTP"

### 3.5 Check Backend Console Again

You should see:

```
🔍 Reset password request:
  Email: sujathanshettar@gmail.com
  OTP received: [7105]
  OTP length: 4
  OTP after trim: [7105]
  User found: sujathanshettar@gmail.com
  User resetOtp exists: true
  User otpExpiryTime: 1715612345678
  Current time: 1715612000000
  Expiry time: 1715612345678
  Time remaining: 345 seconds
  Verifying OTP...
  OTP Match: true
✅ Password reset successfully for: sujathanshettar@gmail.com
```

### 3.6 Set New Password

1. Enter new password: `MyNewPass123`
2. Click "Reset Password"
3. You should see: "✅ Password reset successful!"

### 3.7 Login

1. Go back to login page
2. Enter:
   - Email: `sujathanshettar@gmail.com`
   - Password: `MyNewPass123`
3. Click "Login"
4. ✅ You should be logged in!

---

## 🔍 Troubleshooting

### Issue: "No OTP found"

**Cause:** Backend server not restarted after code changes

**Solution:**
1. Stop backend (Ctrl + C)
2. Restart backend: `mvnw spring-boot:run`
3. Try again

---

### Issue: "OTP expired"

**Cause:** More than 10 minutes passed since OTP was sent

**Solution:**
1. Request new OTP
2. Enter OTP within 10 minutes

---

### Issue: "Invalid OTP"

**Possible Causes:**
1. Wrong OTP entered
2. Whitespace in OTP
3. Backend not restarted

**Solution:**
1. Check backend console for exact OTP
2. Copy OTP carefully (no spaces)
3. Restart backend if needed
4. Request new OTP

---

### Issue: Backend console shows no logs

**Cause:** Backend not running or not restarted

**Solution:**
1. Check if backend is running
2. Restart backend: `mvnw spring-boot:run`
3. Wait for "Started HmrsbackendApplication"

---

## 📊 What to Look For in Console

### When OTP is sent:
```
========================================
✅ FORGOT PASSWORD REQUEST
  Email: sujathanshettar@gmail.com
  Generated OTP: [7105]  ← COPY THIS
  OTP length: 4
  Hashed OTP stored: $2a$10$...
  Expiry time: 1715612345678
  User saved successfully
========================================
```

### When OTP is verified:
```
🔍 Reset password request:
  Email: sujathanshettar@gmail.com
  OTP received: [7105]
  OTP length: 4
  OTP after trim: [7105]
  User found: sujathanshettar@gmail.com
  User resetOtp exists: true  ← Should be true
  User otpExpiryTime: 1715612345678
  Current time: 1715612000000
  Expiry time: 1715612345678
  Time remaining: 345 seconds  ← Should be positive
  Verifying OTP...
  OTP Match: true  ← Should be true
✅ Password reset successfully
```

---

## ✅ Success Checklist

- [ ] Backend server restarted
- [ ] "Started HmrsbackendApplication" message seen
- [ ] OTP request shows detailed logs
- [ ] OTP visible in console
- [ ] OTP received in email
- [ ] OTP from email matches console
- [ ] OTP verification shows detailed logs
- [ ] "OTP Match: true" in console
- [ ] Password reset successful
- [ ] Can login with new password

---

## 🚨 If Still Failing

1. **Copy the EXACT backend console output** when you:
   - Request OTP
   - Enter OTP

2. **Check these specific lines:**
   - `Generated OTP: [????]`
   - `OTP received: [????]`
   - `OTP Match: true/false`

3. **Share the console output** so I can see exactly what's happening

---

**Remember: Backend MUST be restarted for changes to work!**
