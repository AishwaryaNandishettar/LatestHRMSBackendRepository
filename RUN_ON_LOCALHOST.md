# 🏠 RUN HRMS ON LOCALHOST - COMPLETE GUIDE

## ✅ PREREQUISITES

Make sure you have installed:
- ✅ Java 21
- ✅ Maven
- ✅ Node.js (v18 or higher)
- ✅ MongoDB (local) OR MongoDB Atlas account

---

## 🚀 STEP 1: START BACKEND

### Option A: Using IntelliJ IDEA / Eclipse
1. Open `HRMS-Backend` folder in your IDE
2. Find `HmrsBackendApplication.java`
3. Right-click → Run
4. Wait for: `Started HmrsBackendApplication`
5. Backend will run on: `http://localhost:8082`

### Option B: Using Command Line
```bash
cd HRMS-Backend
mvn spring-boot:run
```

**Expected output:**
```
Started HmrsBackendApplication in X seconds
Tomcat started on port(s): 8082
```

---

## 🚀 STEP 2: START FRONTEND

Open a **NEW terminal** (don't close backend terminal):

```bash
cd HRMS-Frontend
npm install
npm run dev
```

**Expected output:**
```
VITE v5.x.x  ready in X ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## 🌐 STEP 3: OPEN IN BROWSER

1. Open browser
2. Go to: **http://localhost:5173**
3. You should see the login page

---

## 🔐 STEP 4: CREATE ADMIN USER (IF NEEDED)

If you don't have a user account:

### Option 1: Use Browser Console
1. Press **F12** → Console tab
2. Paste this code:

```javascript
fetch('http://localhost:8082/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Admin',
    email: 'admin@test.com',
    password: 'admin123',
    role: 'ADMIN'
  })
})
.then(r => r.json())
.then(d => alert('User created! Email: admin@test.com, Password: admin123'))
.catch(e => alert('Error: ' + e));
```

3. Press Enter
4. Login with:
   - Email: `admin@test.com`
   - Password: `admin123`

---

## 📊 CONFIGURATION SUMMARY

| Component | URL | Port |
|-----------|-----|------|
| **Backend** | `http://localhost:8082` | 8082 |
| **Frontend** | `http://localhost:5173` | 5173 |
| **MongoDB** | Local or Atlas | 27017 or cloud |

---

## 🔧 TROUBLESHOOTING

### Problem: Backend won't start

**Error: "Port 8082 is already in use"**
- Another process is using port 8082
- Kill the process or change port in `application.properties`

**Error: "Cannot connect to MongoDB"**
- Check MongoDB is running (if local)
- Check MongoDB Atlas connection string (if cloud)

---

### Problem: Frontend won't start

**Error: "Port 5173 is already in use"**
- Another Vite server is running
- Kill it or it will ask to use port 5174

**Error: "Cannot find module"**
- Run: `npm install` first

---

### Problem: CORS Error

**Error: "blocked by CORS policy"**
- Make sure backend is running on `http://localhost:8082`
- Make sure frontend `.env` has: `VITE_API_BASE_URL=http://localhost:8082`
- Restart frontend after changing `.env`

---

### Problem: Login not working

**Error: "Invalid credentials"**
- Create a user first (see Step 4)
- Or check MongoDB has users

---

## 📝 QUICK START COMMANDS

### Terminal 1 (Backend):
```bash
cd HRMS-Backend
mvn spring-boot:run
```

### Terminal 2 (Frontend):
```bash
cd HRMS-Frontend
npm run dev
```

### Browser:
```
http://localhost:5173
```

---

## ✅ SUCCESS CHECKLIST

- [ ] Backend running on http://localhost:8082
- [ ] Frontend running on http://localhost:5173
- [ ] MongoDB connected (local or Atlas)
- [ ] User account created
- [ ] Can login successfully
- [ ] **WORKING ON LOCALHOST!** 🎉

---

## 🎯 CURRENT CONFIGURATION

Your `.env` file is now set to:
```
VITE_API_BASE_URL=http://localhost:8082
```

This means frontend will connect to your local backend!

---

**Open 2 terminals, run backend and frontend, and access http://localhost:5173!** 🚀
