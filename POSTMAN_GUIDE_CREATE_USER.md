# 📮 Postman Guide - Create User for Teammate

## 🎯 Goal
Create a new user account so your teammate can login.

---

## 📋 Step-by-Step Guide

### **Step 1: Open Postman**

If you don't have Postman:
- Download from: https://www.postman.com/downloads/
- Or use web version: https://web.postman.com/

---

### **Step 2: Create New Request**

1. Click "New" → "HTTP Request"
2. Or click "+" tab

---

### **Step 3: Configure Request**

#### **Method:**
```
POST
```

#### **URL:**
```
http://localhost:8080/api/auth/register
```

**Note**: Make sure your backend is running on port 8080

---

### **Step 4: Set Headers**

1. Click "Headers" tab
2. Add header:
   - **Key**: `Content-Type`
   - **Value**: `application/json`

**Visual:**
```
┌─────────────────┬──────────────────┐
│ Key             │ Value            │
├─────────────────┼──────────────────┤
│ Content-Type    │ application/json │
└─────────────────┴──────────────────┘
```

---

### **Step 5: Set Body**

1. Click "Body" tab
2. Select "raw"
3. Select "JSON" from dropdown
4. Paste this JSON:

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

**Customize:**
- `name`: Your teammate's name
- `email`: Your teammate's email
- `password`: Choose a strong password
- `role`: `ADMIN`, `MANAGER`, or `EMP`
- `companyId`: Your company ID
- `department`: Department name
- `employeeId`: Unique employee ID
- `managerEmail`: Manager's email (optional)

---

### **Step 6: Send Request**

1. Click "Send" button
2. Wait for response

---

### **Step 7: Check Response**

#### **Success Response (200 OK):**
```json
{
  "id": "6a0096d92ba292439b9db446",
  "name": "Teammate Name",
  "email": "teammate@example.com",
  "role": "ADMIN",
  "password": "$2a$10$N9qo8uLOickgx2ZrVzY0YeIkhvuuiwxBjC0EYrcmcjjEqZhcR6sSu",
  "companyId": "COMP001",
  "department": "IT",
  "employeeId": "EMP001",
  "managerEmail": "manager@example.com"
}
```

✅ **User created successfully!**

---

#### **Error Response (400 Bad Request):**
```json
{
  "message": "Email already exists"
}
```

❌ **User already exists**
- Try different email
- Or use existing credentials

---

### **Step 8: Share Credentials**

Send to your teammate:
```
Email: teammate@example.com
Password: Teammate@123
```

**Security Note**: Ask teammate to change password after first login.

---

### **Step 9: Teammate Logs In**

Your teammate can now:
1. Open application: `http://localhost:5176`
2. Enter email: `teammate@example.com`
3. Enter password: `Teammate@123`
4. Click "Login"
5. ✅ Success!

---

## 🎯 Example Requests

### **Example 1: Admin User**
```json
{
  "name": "John Admin",
  "email": "john.admin@company.com",
  "password": "Admin@123",
  "role": "ADMIN",
  "companyId": "COMP001",
  "department": "IT",
  "employeeId": "EMP001"
}
```

### **Example 2: Manager User**
```json
{
  "name": "Jane Manager",
  "email": "jane.manager@company.com",
  "password": "Manager@123",
  "role": "MANAGER",
  "companyId": "COMP001",
  "department": "Sales",
  "employeeId": "EMP002",
  "managerEmail": "john.admin@company.com"
}
```

### **Example 3: Employee User**
```json
{
  "name": "Bob Employee",
  "email": "bob.employee@company.com",
  "password": "Employee@123",
  "role": "EMP",
  "companyId": "COMP001",
  "department": "IT",
  "employeeId": "EMP003",
  "managerEmail": "jane.manager@company.com"
}
```

---

## 🔍 Troubleshooting

### **Issue 1: Connection Refused**

**Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:8080
```

**Solution:**
- Backend is not running
- Start backend:
  ```bash
  cd e:\HRMSProject\HRMS-Backend
  mvn spring-boot:run
  ```

---

### **Issue 2: 404 Not Found**

**Error:**
```
404 Not Found
```

**Solution:**
- Check URL is correct: `http://localhost:8080/api/auth/register`
- Check backend is running
- Check port number (might be 8081 or 9090)

---

### **Issue 3: Email Already Exists**

**Error:**
```json
{
  "message": "Email already exists"
}
```

**Solution:**
- Use different email
- Or login with existing credentials
- Or reset password for existing user

---

### **Issue 4: Invalid JSON**

**Error:**
```
400 Bad Request: Invalid JSON
```

**Solution:**
- Check JSON syntax (commas, quotes, brackets)
- Use JSON validator: https://jsonlint.com/
- Copy example JSON from above

---

## 📊 Visual Guide

### **Postman Interface:**

```
┌─────────────────────────────────────────────────────────────┐
│ Postman                                                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [POST ▾] [http://localhost:8080/api/auth/register    ] [Send]│
│                                                              │
│  [Params] [Authorization] [Headers] [Body] [Pre-request]   │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Body                                               │    │
│  │ ○ none  ○ form-data  ○ x-www-form-urlencoded      │    │
│  │ ● raw   ○ binary     ○ GraphQL                    │    │
│  │                                                     │    │
│  │ [Text ▾] [JSON ▾]                                  │    │
│  │                                                     │    │
│  │ {                                                  │    │
│  │   "name": "Teammate Name",                        │    │
│  │   "email": "teammate@example.com",                │    │
│  │   "password": "Teammate@123",                     │    │
│  │   "role": "ADMIN",                                │    │
│  │   "companyId": "COMP001",                         │    │
│  │   "department": "IT",                             │    │
│  │   "employeeId": "EMP001"                          │    │
│  │ }                                                  │    │
│  │                                                     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Response:                                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Status: 200 OK                                     │    │
│  │                                                     │    │
│  │ {                                                  │    │
│  │   "id": "6a0096d92ba292439b9db446",               │    │
│  │   "name": "Teammate Name",                        │    │
│  │   "email": "teammate@example.com",                │    │
│  │   "role": "ADMIN",                                │    │
│  │   "password": "$2a$10$..."                        │    │
│  │ }                                                  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist

Before sending request:
- [ ] Backend is running
- [ ] URL is correct: `http://localhost:8080/api/auth/register`
- [ ] Method is POST
- [ ] Header `Content-Type: application/json` is set
- [ ] Body is raw JSON
- [ ] JSON is valid (no syntax errors)
- [ ] Email is unique (not already in database)
- [ ] Password is strong

After sending request:
- [ ] Response is 200 OK
- [ ] User ID is returned
- [ ] Credentials are shared with teammate
- [ ] Teammate can login successfully

---

## 📞 Need Help?

- **Full explanation**: `TEAMMATE_LOGIN_ISSUE_EXPLANATION.md`
- **Quick fix**: `QUICK_FIX_TEAMMATE_LOGIN.md`

---

**Time**: 2 minutes  
**Difficulty**: Easy  
**Status**: ✅ Ready to use
