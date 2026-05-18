# 🎯 START HERE - SIMPLE GUIDE

## ✅ YOUR EXISTING CREDENTIALS

**Email:** `Aishwarya@company.com`  
**Password:** `admin123`

---

## 🚀 EASIEST WAY - USE BATCH FILES

### Step 1: Start Backend
**Double-click:** `start-backend-with-env.bat`

Wait until you see: `Tomcat started on port(s): 8082`

### Step 2: Start Frontend
**Double-click:** `start-frontend-simple.bat`

Wait until you see: `Local: http://localhost:5173/`

### Step 3: Login
1. Open browser: `http://localhost:5173`
2. Enter:
   - Email: `Aishwarya@company.com`
   - Password: `admin123`
3. Click Login

**✅ DONE!**

---

## 📝 ALTERNATIVE - MANUAL COMMANDS

If batch files don't work, use manual commands:

### Terminal 1 - Backend:
```bash
cd HRMS-Backend
set MONGODB_URI=mongodb+srv://hrms_user:yWkztlbtsW7RGube@cluster0.aexpf8t.mongodb.net/Data_base_hrms?retryWrites=true&w=majority&appName=Cluster0
set SPRING_MAIL_USERNAME=aishushettar95@gmail.com
set SPRING_MAIL_PASSWORD=bbfskhrhtnujkokk
set JWT_SECRET=MyFixedSecretKey123456
mvn spring-boot:run
```

### Terminal 2 - Frontend:
```bash
cd HRMS-Frontend
npm run dev
```

---

## 🐛 TROUBLESHOOTING

### Login Not Working?

**1. Check Backend is Running:**
- Open: `http://localhost:8082`
- Should see: "Whitelabel Error Page" (this is good!)
- If not: Backend is not running

**2. Check Browser Console:**
- Press `F12`
- Click "Console" tab
- Try to login
- Look for error messages

**3. Test Backend Directly:**
Press F12, go to Console, and paste:
```javascript
fetch('http://localhost:8082/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'Aishwarya@company.com',
    password: 'admin123'
  })
})
.then(r => r.json())
.then(d => console.log('✅ Success:', d))
.catch(e => console.error('❌ Error:', e));
```

If this works but login button doesn't, the issue is in frontend.

---

## 📚 MORE HELP

- **Detailed localhost guide:** `LOGIN_WITH_EXISTING_USER.md`
- **Quick commands:** `QUICK_START_LOCALHOST.txt`
- **Fix Render deployment:** `FIX_RENDER_DEPLOYMENT.md`
- **Complete summary:** `SUMMARY_ALL_FIXES.md`

---

## 🎯 WHAT TO DO NOW

1. **Double-click** `start-backend-with-env.bat`
2. **Wait** for "Tomcat started on port(s): 8082"
3. **Double-click** `start-frontend-simple.bat`
4. **Wait** for "Local: http://localhost:5173/"
5. **Open browser:** http://localhost:5173
6. **Login with:** Aishwarya@company.com / admin123

**That's it!**

---

## ☁️ FOR PRODUCTION DEPLOYMENT

If you want to deploy to cloud (Vercel + Render):

1. **Fix Render backend first:**
   - Go to Render dashboard
   - Change environment from "Node" to "Docker"
   - Deploy

2. **See guide:** `FIX_RENDER_DEPLOYMENT.md`

---

**🎉 Everything is ready! Just run the batch files and login!**
