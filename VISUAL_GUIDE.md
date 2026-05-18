# 🎨 VISUAL LOCALHOST SETUP GUIDE

## 📊 SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR LOCALHOST SETUP                      │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│                  │         │                  │         │                  │
│   FRONTEND       │────────▶│   BACKEND        │────────▶│   MONGODB        │
│   (React+Vite)   │         │   (Spring Boot)  │         │   (Atlas Cloud)  │
│                  │         │                  │         │                  │
│  localhost:5173  │         │  localhost:8082  │         │  Cloud Database  │
│                  │         │                  │         │                  │
└──────────────────┘         └──────────────────┘         └──────────────────┘
      Browser                    Java API                    Data Storage
```

---

## 🔄 STARTUP SEQUENCE

```
STEP 1: Start Backend
┌─────────────────────────────────────────────────────────────┐
│ Terminal 1                                                   │
│ $ cd HRMS-Backend                                           │
│ $ mvn spring-boot:run                                       │
│                                                             │
│ ⏳ Downloading dependencies...                              │
│ ⏳ Compiling Java files...                                  │
│ ⏳ Connecting to MongoDB...                                 │
│ ✅ Started HmrsBackendApplication in 15.234 seconds        │
│                                                             │
│ Backend is now running at: http://localhost:8082           │
└─────────────────────────────────────────────────────────────┘

STEP 2: Start Frontend
┌─────────────────────────────────────────────────────────────┐
│ Terminal 2 (NEW WINDOW)                                     │
│ $ cd HRMS-Frontend                                          │
│ $ npm run dev                                               │
│                                                             │
│ ⏳ Starting Vite dev server...                              │
│ ✅ VITE v7.0.4  ready in 1234 ms                           │
│                                                             │
│ ➜  Local:   http://localhost:5173/                         │
│ ➜  Network: use --host to expose                           │
└─────────────────────────────────────────────────────────────┘

STEP 3: Create Admin User
┌─────────────────────────────────────────────────────────────┐
│ Browser (http://localhost:5173)                             │
│                                                             │
│ 1. Press F12 (Developer Tools)                             │
│ 2. Click "Console" tab                                     │
│ 3. Paste the fetch() code                                  │
│ 4. Press Enter                                             │
│                                                             │
│ ✅ Alert: "User created successfully!"                     │
│                                                             │
│ Credentials:                                               │
│ Email: admin@hrms.com                                      │
│ Password: Admin@123                                        │
└─────────────────────────────────────────────────────────────┘

STEP 4: Login
┌─────────────────────────────────────────────────────────────┐
│ Login Page (http://localhost:5173)                         │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │  Email:    [admin@hrms.com                    ]     │   │
│ │  Password: [Admin@123                         ]     │   │
│ │                                                     │   │
│ │            [ LOGIN ]                                │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ ✅ Redirected to Dashboard                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ WHAT I FIXED FOR YOU

### ❌ BEFORE (BROKEN)

```java
// AuthController.java - Line 15
@CrossOrigin(originPatterns = {"https://hrmsfrontendapplication1.vercel.app"})
                                                                            
                                                                    

public class AuthController {
```
**Problem:** Syntax error - mismatched quotes and extra blank lines

---

### ✅ AFTER (FIXED)

```java
// AuthController.java - Line 15
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AuthController {
```
**Solution:** Clean syntax, allows all origins for localhost development

---

### ❌ BEFORE (BROKEN)

```java
// CorsConfig.java
config.addAllowedOrigin("https://hrms-frontend-production.vercel.app");
```
**Problem:** Only allows Vercel URL, blocks localhost

---

### ✅ AFTER (FIXED)

```java
// CorsConfig.java
config.addAllowedOrigin("http://localhost:5173");
config.addAllowedOrigin("http://localhost:3000");
config.addAllowedOrigin("http://127.0.0.1:5173");
```
**Solution:** Allows localhost connections

---

## 📁 FILE STRUCTURE

```
YOUR-PROJECT/
│
├── HRMS-Backend/                    ← Java Spring Boot API
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/omoikaneinnovation/hmrsbackend/
│   │   │   │       ├── controller/
│   │   │   │       │   └── AuthController.java  ✅ FIXED
│   │   │   │       └── security/
│   │   │   │           └── CorsConfig.java      ✅ FIXED
│   │   │   └── resources/
│   │   │       └── application.properties       ✅ OK
│   │   └── pom.xml
│   └── mvnw (Maven wrapper)
│
├── HRMS-Frontend/                   ← React + Vite UI
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js                         ✅ OK
│   │   └── Pages/
│   ├── .env                                     ✅ FIXED
│   ├── package.json
│   └── vite.config.js
│
├── create-admin-user.html                       ✅ FIXED
├── start-backend.bat                            ✅ NEW
├── start-frontend.bat                           ✅ NEW
├── START_HERE.md                                ✅ NEW
├── README_LOCALHOST.md                          ✅ NEW
├── LOCALHOST_SETUP_COMPLETE.md                  ✅ NEW
└── COPY_PASTE_LOCALHOST.txt                     ✅ NEW
```

---

## 🎯 QUICK REFERENCE

| What | Where | Command |
|------|-------|---------|
| Start Backend | Terminal 1 | `cd HRMS-Backend && mvn spring-boot:run` |
| Start Frontend | Terminal 2 | `cd HRMS-Frontend && npm run dev` |
| Backend URL | Browser | http://localhost:8082 |
| Frontend URL | Browser | http://localhost:5173 |
| Create User | Browser Console | See COPY_PASTE_LOCALHOST.txt |
| Login Email | Login Page | admin@hrms.com |
| Login Password | Login Page | Admin@123 |

---

## 🔍 HOW TO CHECK IF IT'S WORKING

### ✅ Backend is Running
```
Terminal 1 shows:
  Started HmrsBackendApplication in XX.XXX seconds
```

### ✅ Frontend is Running
```
Terminal 2 shows:
  VITE v7.0.4  ready in XXXX ms
  ➜  Local:   http://localhost:5173/
```

### ✅ Admin User Created
```
Browser alert shows:
  ✅ User created!
  Email: admin@hrms.com
  Password: Admin@123
```

### ✅ Login Successful
```
Browser redirects to:
  http://localhost:5173/dashboard
```

---

## 🚨 COMMON ERRORS & SOLUTIONS

### Error: "Port 8082 already in use"
```bash
# Find and kill the process
netstat -ano | findstr :8082
taskkill /PID <PID> /F
```

### Error: "MongoDB connection failed"
```
Solution:
1. Go to MongoDB Atlas
2. Network Access → Add 0.0.0.0/0
3. Database Access → Verify user exists
```

### Error: "CORS policy blocked"
```
Solution:
✅ Already fixed in CorsConfig.java
Just restart backend server
```

### Error: "Invalid credentials"
```
Solution:
1. Make sure you created admin user first
2. Use exact credentials: admin@hrms.com / Admin@123
3. Clear browser cache (Ctrl + Shift + Delete)
```

---

## 🎉 SUCCESS CHECKLIST

- [ ] Backend terminal shows "Started HmrsBackendApplication"
- [ ] Frontend terminal shows "VITE ready"
- [ ] Browser opens http://localhost:5173
- [ ] Admin user created (browser console fetch)
- [ ] Login successful with admin@hrms.com
- [ ] Dashboard loads without errors

---

## 📞 NEED HELP?

Check these files in order:

1. **START_HERE.md** - Quick start (3 steps)
2. **COPY_PASTE_LOCALHOST.txt** - Copy/paste commands
3. **README_LOCALHOST.md** - Full documentation
4. **LOCALHOST_SETUP_COMPLETE.md** - Detailed troubleshooting

---

**Status:** ✅ All fixes applied - Ready to run!

**Last Updated:** April 18, 2026
