# 🚀 START LOCALHOST NOW - SIMPLE 3-STEP GUIDE

## ✅ EVERYTHING IS ALREADY CONFIGURED!

All CORS settings, environment variables, and configurations are done. Just follow these 3 steps:

---

## 📍 STEP 1: Start Backend

Open **Terminal 1** and run:

```bash
cd HRMS-Backend
mvn spring-boot:run
```

**Wait for this message:**
```
Started HmrsBackendApplication in X.XXX seconds
Tomcat started on port(s): 8082 (http)
```

✅ **Backend is now running at:** `http://localhost:8082`

---

## 📍 STEP 2: Start Frontend

Open **Terminal 2** (NEW terminal, keep Terminal 1 running) and run:

```bash
cd HRMS-Frontend
npm run dev
```

**Wait for this message:**
```
➜  Local:   http://localhost:5176/
```

✅ **Frontend is now running at:** `http://localhost:5176`

---

## 📍 STEP 3: Open in Browser

Go to: **`http://localhost:5176`**

You should see the HRMS login page!

---

## 🔐 LOGIN CREDENTIALS

If you need to create an admin user:

1. Open browser console (Press **F12** → **Console** tab)
2. Paste this code and press **Enter**:

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

3. Wait for success alert
4. Login with:
   - **Email:** `admin@hrms.com`
   - **Password:** `Admin@123`

---

## 🎯 THAT'S IT!

Your HRMS application is now running on localhost!

- **Backend:** http://localhost:8082
- **Frontend:** http://localhost:5176
- **MongoDB:** Already connected to Atlas

---

## 🆘 TROUBLESHOOTING

### Backend won't start?

```bash
cd HRMS-Backend
mvn clean install
mvn spring-boot:run
```

### Frontend won't start?

```bash
cd HRMS-Frontend
npm install
npm run dev
```

### Port already in use?

```bash
# Check ports
netstat -ano | findstr :8082
netstat -ano | findstr :5176

# Kill process if needed
taskkill /PID <PID> /F
```

---

## 📚 MORE HELP?

- **Detailed Guide:** See `LOCALHOST_SETUP_COMPLETE.md`
- **Quick Commands:** See `LOCALHOST_QUICK_START.txt`
- **Checklist:** See `LOCALHOST_CHECKLIST.md`

---

## ✅ WHAT'S CONFIGURED?

- ✅ Frontend `.env` → Points to `http://localhost:8082`
- ✅ AuthController → Allows localhost origins (5173, 5176)
- ✅ SecurityConfig → CORS configured for localhost
- ✅ WebConfig → CORS mappings configured
- ✅ Vite Config → Port 5176 with proxy to backend
- ✅ MongoDB Atlas → Connection string configured

**Everything is ready! Just start the servers and go!** 🚀
