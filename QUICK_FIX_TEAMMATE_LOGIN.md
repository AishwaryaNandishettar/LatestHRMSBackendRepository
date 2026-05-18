# ⚡ Quick Fix - Teammate Login Issue

## 🎯 Problem
Your teammate can't login even though they have database access.

## ✅ Solution (2 Minutes)

### **Step 1: Open Postman**

### **Step 2: Create User**

**Request:**
```
Method: POST
URL: http://localhost:8080/api/auth/register
Headers: Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "Teammate Name",
  "email": "teammate@example.com",
  "password": "Teammate@123",
  "role": "ADMIN",
  "companyId": "COMP001",
  "department": "IT",
  "employeeId": "EMP001",
  "managerEmail": "manager@example.com"
}
```

### **Step 3: Send Request**

**Expected Response:**
```json
{
  "id": "6a0096d92ba292439b9db446",
  "name": "Teammate Name",
  "email": "teammate@example.com",
  "role": "ADMIN",
  "password": "$2a$10$..." (hashed)
}
```

### **Step 4: Share Credentials**

Tell your teammate:
- **Email**: `teammate@example.com`
- **Password**: `Teammate@123`

### **Step 5: Teammate Logs In**

✅ **Done!**

---

## 🔍 Why This Works

1. **Existing Endpoint**: Uses `/api/auth/register` (already in your code)
2. **Proper Hashing**: Password is hashed correctly by BCrypt
3. **No Code Changes**: Works immediately
4. **Safe**: Uses tested registration logic

---

## 📊 Alternative: Use Existing User

If you have existing users in database:

**Common credentials:**
- Email: `admin@omoi.com` / Password: `admin123`
- Email: `Aishmanager@omoi.com` / Password: `admin123`
- Email: `manager@omoi.com` / Password: `Manager@123`

---

## 🐛 If Still Not Working

### **Check Backend Logs:**
When teammate tries to login, you should see:
```
===== LOGIN DEBUG =====
EMAIL: teammate@example.com
RAW PASSWORD: Teammate@123
DB PASSWORD: $2a$10$...
MATCH: true
```

**If MATCH is false**: Password is wrong, reset it

### **Check Database:**
1. Open MongoDB Compass
2. Database: `hrms_db`
3. Collection: `users`
4. Find: `{ "email": "teammate@example.com" }`
5. Verify user exists

---

## 📞 Need Help?

Read full explanation: `TEAMMATE_LOGIN_ISSUE_EXPLANATION.md`

---

**Time**: 2 minutes  
**Code Changes**: None  
**Status**: ✅ Ready to use
