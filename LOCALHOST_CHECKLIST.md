# ✅ LOCALHOST SETUP CHECKLIST

## Before You Start

- [ ] Java 21 installed
- [ ] Maven installed
- [ ] Node.js installed
- [ ] Two terminal windows ready

---

## Step-by-Step Checklist

### 🔧 Backend Setup

- [ ] **Open Terminal 1**
- [ ] **Navigate to backend folder:**
  ```bash
  cd HRMS-Backend
  ```
- [ ] **Start backend server:**
  ```bash
  mvn spring-boot:run
  ```
- [ ] **Wait for success message:**
  ```
  Started HmrsBackendApplication in X.XXX seconds
  Tomcat started on port(s): 8082 (http)
  ```
- [ ] **Verify backend is running:**
  - Open browser: `http://localhost:8082`
  - Should see Whitelabel Error Page (this is normal)

---

### 🎨 Frontend Setup

- [ ] **Open Terminal 2 (NEW terminal, keep Terminal 1 running)**
- [ ] **Navigate to frontend folder:**
  ```bash
  cd HRMS-Frontend
  ```
- [ ] **Start frontend server:**
  ```bash
  npm run dev
  ```
- [ ] **Wait for success message:**
  ```
  ➜  Local:   http://localhost:5176/
  ```
- [ ] **Verify frontend is running:**
  - Open browser: `http://localhost:5176`
  - Should see HRMS login page

---

### 👤 Create Admin User

- [ ] **Open browser console (F12 → Console tab)**
- [ ] **Paste this code:**
  ```javascript
  fetch('http://localhost:8082/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Admin User',
      email: 'admin@hrms.com',
      password: 'Admin@123',
      role: 'ADMIN'
    })
  })
  .then(r => r.json())
  .then(d => {
    console.log('✅ User created:', d);
    alert('✅ User created!\n\nEmail: admin@hrms.com\nPassword: Admin@123');
  })
  .catch(e => {
    console.error('❌ Error:', e);
    alert('❌ Error: ' + e.message);
  });
  ```
- [ ] **Press Enter**
- [ ] **Wait for success alert**

---

### 🔐 Login

- [ ] **Go to:** `http://localhost:5176`
- [ ] **Enter credentials:**
  - Email: `admin@hrms.com`
  - Password: `Admin@123`
- [ ] **Click Login**
- [ ] **Verify dashboard loads**

---

## ✅ Success Indicators

### Backend Running Successfully:
- ✅ Terminal shows: "Started HmrsBackendApplication"
- ✅ No error messages in terminal
- ✅ Port 8082 is active

### Frontend Running Successfully:
- ✅ Terminal shows: "Local: http://localhost:5176/"
- ✅ No error messages in terminal
- ✅ Login page loads in browser

### Login Working:
- ✅ No CORS errors in browser console
- ✅ Network tab shows successful API calls
- ✅ Dashboard loads after login

---

## ❌ Common Issues & Solutions

### Issue: Backend won't start

**Symptoms:**
- Error messages in Terminal 1
- Port 8082 already in use

**Solution:**
```bash
# Check if port is in use
netstat -ano | findstr :8082

# Kill the process if needed
taskkill /PID <PID> /F

# Clean and rebuild
cd HRMS-Backend
mvn clean install
mvn spring-boot:run
```

---

### Issue: Frontend won't start

**Symptoms:**
- Error messages in Terminal 2
- Port 5176 already in use

**Solution:**
```bash
# Check if port is in use
netstat -ano | findstr :5176

# Kill the process if needed
taskkill /PID <PID> /F

# Reinstall dependencies
cd HRMS-Frontend
npm install
npm run dev
```

---

### Issue: CORS errors in browser

**Symptoms:**
- Browser console shows: "blocked by CORS policy"
- Login button doesn't work

**Solution:**
1. Make sure backend is running on port 8082
2. Make sure frontend is running on port 5176
3. Clear browser cache (Ctrl+Shift+Delete)
4. Restart both servers
5. Try again

---

### Issue: Login fails with 401

**Symptoms:**
- "Invalid credentials" message
- Network tab shows 401 status

**Solution:**
1. Create admin user again using browser console
2. Make sure you're using correct credentials:
   - Email: `admin@hrms.com`
   - Password: `Admin@123`
3. Check backend terminal for error messages

---

### Issue: Can't create admin user

**Symptoms:**
- Error in browser console
- Alert shows error message

**Solution:**
1. Check if backend is running (Terminal 1)
2. Check if MongoDB Atlas is accessible
3. User might already exist - try logging in directly
4. Check backend terminal for error messages

---

## 🎯 Quick Reference

| Component | URL | Port |
|-----------|-----|------|
| Backend | http://localhost:8082 | 8082 |
| Frontend | http://localhost:5176 | 5176 |
| MongoDB | Atlas Cloud | N/A |

---

## 📝 Configuration Files (Already Set Up)

- ✅ `HRMS-Frontend/.env` → Points to localhost:8082
- ✅ `AuthController.java` → Allows localhost origins
- ✅ `SecurityConfig.java` → CORS configured
- ✅ `WebConfig.java` → CORS mappings configured
- ✅ `application.properties` → Port 8082, MongoDB Atlas

---

## 🆘 Still Having Issues?

1. **Check Terminal 1 (Backend)** - Any error messages?
2. **Check Terminal 2 (Frontend)** - Any error messages?
3. **Check Browser Console (F12)** - Any error messages?
4. **Check Network Tab (F12)** - Are API calls being made?

**Provide these details for further help!**
