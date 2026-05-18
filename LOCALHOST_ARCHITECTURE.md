# 🏗️ LOCALHOST ARCHITECTURE

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      YOUR COMPUTER                          │
│                                                             │
│  ┌──────────────┐         ┌──────────────┐                │
│  │  Terminal 1  │         │  Terminal 2  │                │
│  │              │         │              │                │
│  │   Backend    │         │   Frontend   │                │
│  │   Server     │         │   Server     │                │
│  │              │         │              │                │
│  │   Port:      │◄────────┤   Port:      │                │
│  │   8082       │  Proxy  │   5176       │                │
│  └──────┬───────┘         └──────▲───────┘                │
│         │                        │                         │
│         │                        │                         │
│         │                  ┌─────┴──────┐                 │
│         │                  │  Browser   │                 │
│         │                  │            │                 │
│         │                  │  localhost │                 │
│         │                  │  :5176     │                 │
│         │                  └────────────┘                 │
│         │                                                  │
│         │                                                  │
│         ▼                                                  │
│  ┌──────────────────────────────────────┐                │
│  │         MongoDB Atlas                │                │
│  │         (Cloud Database)             │                │
│  │                                      │                │
│  │  cluster0.aexpf8t.mongodb.net       │                │
│  └──────────────────────────────────────┘                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Details

### 🔧 Backend Server (Spring Boot)
- **Port:** 8082
- **Technology:** Java 21 + Spring Boot
- **Location:** `HRMS-Backend/`
- **Start Command:** `mvn spring-boot:run`
- **Endpoints:** `/api/auth/*`, `/api/employee/*`, etc.
- **CORS:** Configured to allow localhost:5176

### 🎨 Frontend Server (React + Vite)
- **Port:** 5176
- **Technology:** React + Vite
- **Location:** `HRMS-Frontend/`
- **Start Command:** `npm run dev`
- **Proxy:** Forwards `/api/*` requests to backend (8082)
- **Environment:** `.env` file with `VITE_API_BASE_URL=http://localhost:8082`

### 🗄️ Database (MongoDB Atlas)
- **Type:** Cloud Database
- **Connection:** Configured in `application.properties`
- **Database Name:** `Data_base_hrms`
- **Collections:** users, employees, attendance, etc.

---

## Request Flow

### Example: User Login

```
1. User enters credentials in browser (localhost:5176)
   ↓
2. Frontend sends POST request to /api/auth/login
   ↓
3. Vite proxy forwards request to backend (localhost:8082)
   ↓
4. Backend validates credentials against MongoDB Atlas
   ↓
5. Backend generates JWT token
   ↓
6. Backend sends response back to frontend
   ↓
7. Frontend stores token and redirects to dashboard
```

---

## Port Configuration

| Component | Port | Configured In |
|-----------|------|---------------|
| Backend | 8082 | `application.properties` |
| Frontend | 5176 | `vite.config.js` |
| MongoDB | 27017 | Atlas Cloud (remote) |

---

## CORS Configuration

### Backend allows these origins:
- `http://localhost:5173` (default Vite port)
- `http://localhost:5176` (configured Vite port)
- `http://127.0.0.1:5173`
- `http://127.0.0.1:5176`
- `https://hrmsbackendfullrenderingapplication.vercel.app` (production)

### Configured in:
1. **AuthController.java** - `@CrossOrigin` annotation
2. **SecurityConfig.java** - `corsConfigurationSource()` method
3. **WebConfig.java** - `addCorsMappings()` method

---

## Environment Variables

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:8082
VITE_TURN_USERNAME=51e40078dfabc57d54164c2f
VITE_TURN_CREDENTIAL=KJnavaquyonnUlkx
```

### Backend (application.properties)
```
server.port=8082
spring.data.mongodb.uri=${MONGODB_URI:mongodb://localhost:27017/Data_base_hrms}
spring.mail.username=${SPRING_MAIL_USERNAME:aishushettar95@gmail.com}
spring.mail.password=${SPRING_MAIL_PASSWORD:bbfskhrhtnujkokk}
jwt.secret=${JWT_SECRET:MyFixedSecretKey123456}
```

---

## File Structure

```
project-root/
│
├── HRMS-Backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/omoikaneinnovation/hmrsbackend/
│   │   │   │       ├── controller/
│   │   │   │       │   └── AuthController.java ✅
│   │   │   │       ├── security/
│   │   │   │       │   └── SecurityConfig.java ✅
│   │   │   │       └── config/
│   │   │   │           └── WebConfig.java ✅
│   │   │   └── resources/
│   │   │       └── application.properties ✅
│   │   └── pom.xml
│   └── mvnw
│
├── HRMS-Frontend/
│   ├── src/
│   │   ├── Pages/
│   │   ├── Components/
│   │   └── api/
│   ├── .env ✅
│   ├── vite.config.js ✅
│   └── package.json
│
└── Documentation/
    ├── START_LOCALHOST_NOW.md ⭐
    ├── LOCALHOST_SETUP_COMPLETE.md
    ├── LOCALHOST_QUICK_START.txt
    └── LOCALHOST_CHECKLIST.md
```

---

## Security Features

### Authentication
- JWT-based authentication
- Token expiration: 24 hours
- Role-based access control (ADMIN, HR, EMPLOYEE)

### CORS
- Configured for localhost development
- Allows credentials
- Supports preflight requests (OPTIONS)

### Password
- Hashed using BCrypt
- Never stored in plain text

---

## Development Workflow

```
┌─────────────────────────────────────────────────────────┐
│                    DEVELOPMENT CYCLE                    │
└─────────────────────────────────────────────────────────┘

1. Start Backend (Terminal 1)
   cd HRMS-Backend
   mvn spring-boot:run
   
2. Start Frontend (Terminal 2)
   cd HRMS-Frontend
   npm run dev
   
3. Open Browser
   http://localhost:5176
   
4. Make Changes
   - Edit code in your IDE
   - Frontend: Hot reload (automatic)
   - Backend: Restart server (manual)
   
5. Test Changes
   - Check browser console for errors
   - Check backend terminal for logs
   - Test functionality in UI
   
6. Debug if needed
   - Backend logs in Terminal 1
   - Frontend logs in browser console
   - Network tab for API calls
```

---

## Common Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh token

### Employee
- `GET /api/employee/all` - Get all employees
- `POST /api/employee/create` - Create employee
- `GET /api/employee/{id}` - Get employee by ID

### Attendance
- `POST /api/attendance/checkin` - Check in
- `POST /api/attendance/checkout` - Check out
- `GET /api/attendance/employee/{id}` - Get attendance records

---

## Monitoring & Debugging

### Backend Logs (Terminal 1)
```
✅ Good: "Started HmrsBackendApplication"
✅ Good: "Tomcat started on port(s): 8082"
❌ Bad: "Port 8082 is already in use"
❌ Bad: "Failed to connect to MongoDB"
```

### Frontend Logs (Terminal 2)
```
✅ Good: "Local: http://localhost:5176/"
✅ Good: "ready in XXX ms"
❌ Bad: "Port 5176 is already in use"
❌ Bad: "Failed to compile"
```

### Browser Console (F12)
```
✅ Good: No errors
✅ Good: "Login successful"
❌ Bad: "CORS policy blocked"
❌ Bad: "Network Error"
❌ Bad: "401 Unauthorized"
```

---

## Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Port in use | Kill process: `taskkill /PID <PID> /F` |
| CORS error | Check both servers are running on correct ports |
| Login fails | Create admin user via browser console |
| Backend won't start | Run `mvn clean install` |
| Frontend won't start | Run `npm install` |
| MongoDB error | Check internet connection (Atlas is cloud) |

---

## Success Indicators

✅ **Backend Running:**
- Terminal shows "Started HmrsBackendApplication"
- No error messages
- Can access http://localhost:8082 (shows Whitelabel Error Page - this is normal)

✅ **Frontend Running:**
- Terminal shows "Local: http://localhost:5176/"
- No error messages
- Can access http://localhost:5176 (shows login page)

✅ **System Working:**
- Login page loads
- No CORS errors in console
- Can create admin user
- Can login successfully
- Dashboard loads after login

---

## 🎯 Ready to Start?

See **`START_LOCALHOST_NOW.md`** for the simple 3-step guide!
