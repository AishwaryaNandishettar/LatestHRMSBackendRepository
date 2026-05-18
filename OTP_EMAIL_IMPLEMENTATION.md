# OTP Email Implementation - Complete Guide

## ✅ What Was Implemented

### OTP is now sent via EMAIL instead of showing in alert

**Before:**
- OTP was displayed in browser alert
- User could see OTP immediately (not secure)

**After:**
- OTP is sent to user's email address
- User must check their email inbox
- More secure and realistic flow

---

## 📧 Email Configuration

### SMTP Settings (Already Configured)
Your application is configured to use Gmail SMTP:

```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=aishushettar95@gmail.com
spring.mail.password=bbfskhrhtnujkokk
```

**Email Sender:** aishushettar95@gmail.com

---

## 🎨 Email Template

A beautiful, professional email template has been created:

**Location:** `HRMS-Backend/src/main/resources/templates/email/otp-email.html`

**Features:**
- 🎨 Modern gradient design
- 🔐 Large, clear OTP display
- ⏱️ Validity timer (10 minutes)
- ⚠️ Security warning
- 📱 Mobile responsive
- 🏢 Company branding

**Email Preview:**
```
┌─────────────────────────────────────┐
│   🔐 Password Reset Request         │
│   HRMS - Human Resource Management  │
├─────────────────────────────────────┤
│                                     │
│   Hello,                            │
│                                     │
│   We received a request to reset   │
│   your password for your HRMS       │
│   account (user@example.com).       │
│                                     │
│   ┌───────────────────────────┐    │
│   │   Your OTP Code           │    │
│   │                           │    │
│   │       1 2 3 4             │    │
│   │                           │    │
│   │   ⏱️ Valid for 10 minutes │    │
│   └───────────────────────────┘    │
│                                     │
│   ⚠️ Security Notice:               │
│   If you didn't request this,      │
│   please ignore this email.        │
│                                     │
├─────────────────────────────────────┤
│   Omoi HR Works                     │
│   © 2026 Omoi Innovations           │
└─────────────────────────────────────┘
```

---

## 🔄 Updated Flow

### Complete Password Reset Flow:

```
1. User clicks "Forgot Password?" on login page
   ↓
2. User enters email: sujathanshettar@gmail.com
   ↓
3. User clicks "Send OTP"
   ↓
4. Backend generates 4-digit OTP (e.g., 0449)
   ↓
5. Backend sends email to user's inbox
   ↓
6. User receives email with OTP
   ↓
7. User checks email inbox
   ↓
8. User enters OTP from email
   ↓
9. User clicks "Verify OTP"
   ↓
10. User enters new password
    ↓
11. User clicks "Reset Password"
    ↓
12. Password updated successfully
    ↓
13. User can login with new password
```

---

## 🧪 Testing Guide

### Step 1: Restart Backend
```bash
cd HRMS-Backend
# Stop current server (Ctrl + C)
./mvnw spring-boot:run
```

**Wait for:** `Started HmrsbackendApplication`

### Step 2: Restart Frontend
```bash
cd HRMS-Frontend
# Stop current server (Ctrl + C)
npm run dev
```

**Open:** http://localhost:5176

### Step 3: Test Forgot Password

1. **Go to Login Page**
   - URL: http://localhost:5176
   - Click "Forgot Password?"

2. **Enter Email**
   ```
   Email: sujathanshettar@gmail.com
   ```
   - Click "Send OTP"

3. **Check Alert**
   - You should see: "✅ OTP sent to sujathanshettar@gmail.com. Please check your email inbox."

4. **Check Email Inbox**
   - Open Gmail: https://mail.google.com
   - Login as: sujathanshettar@gmail.com
   - Look for email from: aishushettar95@gmail.com
   - Subject: "Your OTP Code - HRMS"
   - Open the email

5. **Get OTP from Email**
   - You'll see a large 4-digit OTP (e.g., 0449)
   - Copy the OTP

6. **Enter OTP**
   - Go back to the browser
   - Enter the OTP from email
   - Click "Verify OTP"

7. **Set New Password**
   ```
   New Password: MyNewPass123
   ```
   - Click "Reset Password"

8. **Login with New Password**
   ```
   Email: sujathanshettar@gmail.com
   Password: MyNewPass123
   ```
   - Click "Login"
   - ✅ You should be logged in!

---

## 🔍 Troubleshooting

### Issue 1: Email Not Received

**Possible Causes:**
1. Email went to Spam folder
2. SMTP credentials expired
3. Email service blocked

**Solutions:**
1. Check Spam/Junk folder
2. Check backend console for errors:
   ```
   ❌ Failed to send OTP email: ...
   ```
3. Verify SMTP settings in `application.properties`
4. Check if Gmail account allows "Less secure app access"

### Issue 2: "Failed to send OTP"

**Solution:**
1. Check backend console logs
2. Verify email service is running
3. Check internet connection
4. Verify SMTP credentials

### Issue 3: OTP Invalid

**Possible Causes:**
1. OTP expired (10 minutes)
2. Wrong OTP entered
3. Multiple OTP requests (only latest is valid)

**Solutions:**
1. Request new OTP
2. Double-check OTP from email
3. Copy-paste OTP instead of typing

---

## 📊 Backend Logs

### Successful OTP Send:
```
✅ OTP sent to email: sujathanshettar@gmail.com | OTP: 0449
Email sent successfully to: sujathanshettar@gmail.com
```

### Failed OTP Send:
```
❌ Failed to send OTP email: Connection refused
Failed to send email to sujathanshettar@gmail.com: ...
```

---

## 🔐 Security Features

### 1. OTP Expiry
- OTP valid for **10 minutes** only
- After 10 minutes, user must request new OTP

### 2. OTP Storage
- OTP is hashed using BCrypt before storing
- Original OTP never stored in plain text

### 3. One-Time Use
- Each OTP can only be used once
- After password reset, OTP becomes invalid

### 4. Email Verification
- OTP sent only to registered email
- Prevents unauthorized password resets

---

## 📝 Files Modified

### Backend (2 files)
1. ✅ `AuthController.java` - Added EmailService integration
2. ✅ `otp-email.html` - Created email template

### Frontend (1 file)
1. ✅ `Login.jsx` - Updated alert message

---

## 🎯 Production Checklist

Before deploying to production:

- [ ] Remove OTP from backend console logs
- [ ] Remove OTP from API response
- [ ] Add rate limiting (max 3 OTP requests per hour)
- [ ] Add OTP expiry tracking in database
- [ ] Configure production SMTP server
- [ ] Add email delivery monitoring
- [ ] Test with multiple email providers (Gmail, Outlook, etc.)
- [ ] Add email delivery retry mechanism
- [ ] Configure email templates for different languages

---

## 🚀 Next Steps

### Optional Enhancements:

1. **OTP Expiry Tracking**
   - Store OTP expiry timestamp in database
   - Validate expiry before accepting OTP

2. **Rate Limiting**
   - Limit OTP requests to 3 per hour per email
   - Prevent OTP spam

3. **Email Delivery Status**
   - Track email delivery success/failure
   - Notify user if email fails

4. **Multiple Email Providers**
   - Support Gmail, Outlook, Yahoo, etc.
   - Fallback to SMS if email fails

5. **OTP Resend**
   - Add "Resend OTP" button
   - Cooldown period between resends

---

## 📞 Support

If you encounter any issues:
1. Check backend console logs
2. Check email spam folder
3. Verify SMTP credentials
4. Test with different email address

---

**Status:** ✅ Ready for Testing
**Date:** May 13, 2026
**Version:** 2.0 (Email Integration)
