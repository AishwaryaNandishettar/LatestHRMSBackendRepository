# 🚀 LOCALHOST SETUP - COMPLETE GUIDE

## ✅ WHAT'S ALREADY DONE

1. **Frontend `.env` configured** → Points to `http://localhost:8082`
2. **AuthController updated** → Now allows localhost origins (5173, 5176)
3. **SecurityConfig configured** → Allows localhost:5176 and 127.0.0.1:5176
4. **WebConfig configured** → Has CORS mappings with allowedOriginPatterns("*")

---

## 📋 STEP-BY-STEP INSTRUCTIONS

### **STEP 1: Start Backend Server**

Open a terminal in the project root and run:

```bash
cd HRMS-Backend
mvn spring-boot:run
```

**Expected Output:**
```
Started HmrsBackendApplication in X.XXX seconds
Tomcat started on port(s): 8082 (http)
```

**✅ Backend will be running at:** `http://localhost:8082`

---

### **STEP 2: Start Frontend Server**

Open a **NEW terminal** (keep backend running) and run:

```bash
cd HRMS-Frontend
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5176/
➜  Network: use --host to expose
```

**✅ Frontend will be running at:** `http://localhost:5176`

---

### **STEP 3: Open Application in Browser**

1. Open your browser
2. Go to: **`http://localhost:5176`**
3. You should see the HRMS login page

---

### **STEP 4: Create Admin User (If Needed)**

If you don't have login credentials, create an admin user:

1. Open browser console (F12 → Console tab)
2. Paste this code and press Enter:

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
  alert('✅ User created successfully!\n\nEmail: admin@hrms.com\nPassword: Admin@123\n\nYou can now login!');
})
.catch(e => {
  console.error('❌ Error:', e);
  alert('❌ Error: ' + e.message + '\n\nThe user might already exist or backend is not responding.');
});
```

---

### **STEP 5: Login**

Use these credentials:

- **Email:** `admin@hrms.com`
- **Password:** `Admin@123`

---

## 🔧 TROUBLESHOOTING

### **Problem: Backend won't start**

**Solution:**
```bash
# Make sure you're in HRMS-Backend folder
cd HRMS-Backend

# Clean and rebuild
mvn clean install

# Then start
mvn spring-boot:run
```

---

### **Problem: Frontend won't start**

**Solution:**
```bash
# Make sure you're in HRMS-Frontend folder
cd HRMS-Frontend

# Install dependencies
npm install

# Then start
npm run dev
```

---

### **Problem: CORS errors in browser console**

**Check:**
1. Backend is running on port 8082
2. Frontend is running on port 5176
3. `.env` file has `VITE_API_BASE_URL=http://localhost:8082`

**If still having issues, restart both servers**

---

### **Problem: Login not working**

**Check:**
1. Open browser console (F12)
2. Look for errors
3. Check Network tab → See if `/api/auth/login` request is being sent
4. If 401 error → Wrong credentials
5. If CORS error → Backend not configured properly
6. If connection refused → Backend not running

---

## 📝 IMPORTANT NOTES

1. **Keep both terminals open** - Backend and Frontend must run simultaneously
2. **Port 8082** - Backend runs here (configured in application.properties)
3. **Port 5176** - Frontend runs here (configured in vite.config.js)
4. **MongoDB** - Using MongoDB Atlas (connection string in application.properties)
5. **Environment Variables** - Already configured in `.env` file

---

## 🎯 QUICK COMMANDS SUMMARY

```bash
# Terminal 1 - Backend
cd HRMS-Backend
mvn spring-boot:run

# Terminal 2 - Frontend
cd HRMS-Frontend
npm run dev

# Browser
http://localhost:5176
```

---

## ✅ SUCCESS CHECKLIST

- [ ] Backend running on port 8082
- [ ] Frontend running on port 5176
- [ ] No CORS errors in browser console
- [ ] Login page loads successfully
- [ ] Can create admin user via console
- [ ] Can login with credentials
- [ ] Dashboard loads after login

---

## 🆘 STILL NOT WORKING?

1. **Check if ports are already in use:**
   ```bash
   # Windows
   netstat -ano | findstr :8082
   netstat -ano | findstr :5176
   ```

2. **Kill processes if needed:**
   ```bash
   # Find PID from above command, then:
   taskkill /PID <PID> /F
   ```

3. **Restart everything:**
   - Close both terminals
   - Start backend first
   - Then start frontend
   - Clear browser cache (Ctrl+Shift+Delete)
   - Try again

---

## 📞 NEED HELP?

If you're still facing issues, provide:
1. Error messages from backend terminal
2. Error messages from frontend terminal
3. Browser console errors (F12 → Console)
4. Network tab errors (F12 → Network)
