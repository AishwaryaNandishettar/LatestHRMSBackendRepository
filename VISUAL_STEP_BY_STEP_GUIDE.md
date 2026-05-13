# Visual Step-by-Step Guide - Forgot Password Flow

## ⚠️ IMPORTANT: Do NOT try to login with OTP!

The OTP is ONLY for the "Forgot Password" flow, NOT for login.

---

## 📸 Step-by-Step Screenshots

### Step 1: Go to Login Page
```
URL: http://localhost:5176
```
You should see:
- Email field
- Password field
- **"Forgot Password?" link** ← CLICK THIS

---

### Step 2: Click "Forgot Password?"
After clicking, the page should change to show:
- **"Forgot Password" heading**
- Email field only
- **"Send OTP" button**
- "← Back to Login" link

**DO NOT enter password here!**

---

### Step 3: Enter Email and Send OTP
1. Enter email: `sujathanshettar@gmail.com`
2. Click **"Send OTP"** button
3. You should see alert: "✅ OTP sent to sujathanshettar@gmail.com. Please check your email inbox."

---

### Step 4: Check Backend Console
You should see:
```
========================================
✅ FORGOT PASSWORD REQUEST
  Email: sujathanshettar@gmail.com
  Generated OTP: [4473]  ← THIS IS YOUR OTP
  OTP length: 4
  Hashed OTP stored: $2a$10$...
  Expiry time: 1715612345678
  User saved successfully
========================================
✅ OTP email sent successfully to: sujathanshettar@gmail.com
```

**Copy the OTP number from console** (e.g., 4473)

---

### Step 5: Check Email
1. Open Gmail
2. Find email with subject: "Your OTP Code - HRMS"
3. You should see OTP: **4473**
4. Verify it matches the console

---

### Step 6: Enter OTP
The page should now show:
- **"Enter OTP" heading**
- OTP input field
- **"Verify OTP" button**
- "← Cancel" link

1. Enter OTP: `4473`
2. Click **"Verify OTP"** button

---

### Step 7: Check Backend Console Again
You should see:
```
🔍 Reset password request:
  Email: sujathanshettar@gmail.com
  OTP received: [4473]
  OTP length: 4
  OTP after trim: [4473]
  User found: sujathanshettar@gmail.com
  User resetOtp exists: true
  User otpExpiryTime: 1715612345678
  Current time: 1715612000000
  Expiry time: 1715612345678
  Time remaining: 345 seconds
  Verifying OTP...
  OTP Match: true  ← THIS SHOULD BE TRUE
✅ Password reset successfully for: sujathanshettar@gmail.com
```

---

### Step 8: Set New Password
After OTP is verified, you should see:
- **"Enter new password" field**
- **"Reset Password" button**

1. Enter new password: `MyNewPass123`
2. Click **"Reset Password"** button
3. You should see: "✅ Password reset successful! You can now login with your new password."

---

### Step 9: Login with New Password
The page should automatically go back to login page.

1. Enter email: `sujathanshettar@gmail.com`
2. Enter password: `MyNewPass123` ← YOUR NEW PASSWORD
3. Click **"Login"** button
4. ✅ You should be logged in!

---

## ❌ Common Mistakes

### Mistake 1: Trying to Login with OTP
```
❌ WRONG:
Login Page → Enter email → Enter OTP as password → Click Login
```

```
✅ CORRECT:
Login Page → Click "Forgot Password?" → Enter email → Send OTP → Enter OTP → Verify → Set new password → Login
```

---

### Mistake 2: Not Clicking "Forgot Password?"
You MUST click the "Forgot Password?" link to start the password reset flow.

---

### Mistake 3: Entering OTP in Password Field
The OTP should be entered in the **OTP field** on the **Forgot Password page**, NOT in the password field on the login page.

---

## 🔍 What You Should See at Each Step

### Login Page (Initial)
```
┌─────────────────────────────┐
│   Omoi HR Works             │
├─────────────────────────────┤
│   Email: [____________]     │
│   Password: [__________]    │
│   [Login]                   │
│   Forgot Password? ← CLICK  │
└─────────────────────────────┘
```

### Forgot Password Page (Step 1)
```
┌─────────────────────────────┐
│   Forgot Password           │
├─────────────────────────────┤
│   Email: [____________]     │
│   [Send OTP]                │
│   ← Back to Login           │
└─────────────────────────────┘
```

### Enter OTP Page (Step 2)
```
┌─────────────────────────────┐
│   Enter OTP                 │
├─────────────────────────────┤
│   OTP: [____]               │
│   [Verify OTP]              │
│   ← Cancel                  │
└─────────────────────────────┘
```

### Set New Password Page (Step 3)
```
┌─────────────────────────────┐
│   Enter OTP                 │
├─────────────────────────────┤
│   OTP: [4473] ✓             │
│   New Password: [_______]   │
│   [Reset Password]          │
└─────────────────────────────┘
```

---

## 📋 Checklist

Before testing, make sure:
- [ ] Backend server is running
- [ ] Backend was restarted after code changes
- [ ] You see "Started HmrsbackendApplication" in console
- [ ] Frontend is running on http://localhost:5176
- [ ] You're on the LOGIN page (not already logged in)

During testing:
- [ ] Click "Forgot Password?" link
- [ ] Page changes to "Forgot Password" form
- [ ] Enter email and click "Send OTP"
- [ ] Check backend console for OTP
- [ ] Check email for OTP
- [ ] OTP from email matches console
- [ ] Enter OTP in OTP field (not password field!)
- [ ] Click "Verify OTP"
- [ ] Check backend console for "OTP Match: true"
- [ ] Enter new password
- [ ] Click "Reset Password"
- [ ] Go back to login page
- [ ] Login with NEW password

---

## 🚨 If You See "Invalid email or password"

This means you're trying to **LOGIN** with the OTP, which is WRONG.

**Solution:**
1. Go back to login page
2. Click "Forgot Password?" link
3. Follow the forgot password flow
4. Do NOT try to login with OTP

---

## 📞 Need Help?

Please provide:
1. Screenshot of the page you're on
2. Backend console output (copy all text)
3. Which step you're stuck on

---

**Remember: OTP is for password reset, NOT for login!**
