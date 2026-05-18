# 🏗️ HRMS APPLICATION ARCHITECTURE

## 📊 SYSTEM OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│                     HRMS FULL-STACK APPLICATION                 │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│                  │         │                  │         │                  │
│    FRONTEND      │ ◄─────► │     BACKEND      │ ◄─────► │    DATABASE      │
│   (React+Vite)   │  HTTP   │  (Spring Boot)   │  JDBC   │  (MongoDB Atlas) │
│                  │         │                  │         │                  │
└──────────────────┘         └──────────────────┘         └──────────────────┘
```

---

## 🏠 LOCALHOST ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          YOUR COMPUTER                                  │
│                                                                         │
│  ┌─────────────────────┐              ┌─────────────────────┐          │
│  │   BROWSER           │              │   TERMINAL 1        │          │
│  │   localhost:5173    │              │   Backend Server    │          │
│  │                     │              │   Port: 8082        │          │
│  │  ┌───────────────┐  │              │                     │          │
│  │  │ Login Page    │  │              │  mvn spring-boot:run│          │
│  │  │               │  │              │                     │          │
│  │  │ [Email    ]   │  │   HTTP       │  ┌──────────────┐  │          │
│  │  │ [Password ]   │──┼──Request────►│  │ Spring Boot  │  │          │
│  │  │ [Login]       │  │              │  │ Application  │  │          │
│  │  │               │  │◄─Response────┼──│              │  │          │
│  │  └───────────────┘  │              │  └──────────────┘  │          │
│  │                     │              │                     │          │
│  │  React App          │              │  Java 21 + Maven    │          │
│  │  Vite Dev Server    │              │                     │          │
│  └─────────────────────┘              └─────────────────────┘          │
│           ▲                                      │                      │
│           │                                      │                      │
│  ┌────────┴────────────┐                        │                      │
│  │   TERMINAL 2        │                        │                      │
│  │   Frontend Server   │                        │                      │
│  │   npm run dev       │                        │                      │
│  └─────────────────────┘                        │                      │
│                                                  │                      │
└──────────────────────────────────────────────────┼──────────────────────┘
                                                   │
                                                   │ MongoDB Connection
                                                   ▼
                                    ┌──────────────────────────┐
                                    │   MONGODB ATLAS (Cloud)  │
                                    │   Database: Data_base_hrms│
                                    │   User: hrms_user        │
                                    └──────────────────────────┘
```

---

## ☁️ CLOUD DEPLOYMENT ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              INTERNET                                   │
│                                                                         │
│  ┌─────────────────────┐              ┌─────────────────────┐          │
│  │   VERCEL            │              │   RENDER.COM        │          │
│  │   (Frontend Host)   │              │   (Backend Host)    │          │
│  │                     │              │                     │          │
│  │  ┌───────────────┐  │              │  ┌──────────────┐  │          │
│  │  │ React App     │  │   HTTPS      │  │ Docker       │  │          │
│  │  │ (Built)       │  │──Request────►│  │ Container    │  │          │
│  │  │               │  │              │  │              │  │          │
│  │  │ Static Files  │  │◄─Response────┼──│ Spring Boot  │  │          │
│  │  │ HTML/CSS/JS   │  │              │  │ App          │  │          │
│  │  └───────────────┘  │              │  └──────────────┘  │          │
│  │                     │              │                     │          │
│  │  URL:               │              │  URL:               │          │
│  │  hrmsbackendfrontend│              │  hrms-backend-final │          │
│  │  app.vercel.app     │              │  -ixpy.onrender.com │          │
│  └─────────────────────┘              └─────────────────────┘          │
│                                                  │                      │
└──────────────────────────────────────────────────┼──────────────────────┘
                                                   │
                                                   │ MongoDB Connection
                                                   ▼
                                    ┌──────────────────────────┐
                                    │   MONGODB ATLAS (Cloud)  │
                                    │   Database: Data_base_hrms│
                                    │   User: hrms_user        │
                                    └──────────────────────────┘
```

---

## 🔄 REQUEST FLOW

### Localhost Login Flow:
```
1. User opens browser → http://localhost:5173
2. React app loads from Vite dev server
3. User enters credentials and clicks Login
4. Frontend sends POST request → http://localhost:8082/api/auth/login
5. Backend validates credentials against MongoDB
6. Backend generates JWT token
7. Backend sends response with token
8. Frontend stores token and redirects to dashboard
```

### Cloud Login Flow:
```
1. User opens browser → https://hrmsbackendfrontendapp.vercel.app
2. React app loads from Vercel CDN
3. User enters credentials and clicks Login
4. Frontend sends POST request → https://hrms-backend-final-ixpy.onrender.com/api/auth/login
5. Backend validates credentials against MongoDB
6. Backend generates JWT token
7. Backend sends response with token
8. Frontend stores token and redirects to dashboard
```

---

## 🔐 SECURITY FLOW

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Browser    │         │   Backend    │         │   MongoDB    │
└──────┬───────┘         └──────┬───────┘         └──────┬───────┘
       │                        │                        │
       │ 1. Login Request       │                        │
       │ (email + password)     │                        │
       ├───────────────────────►│                        │
       │                        │ 2. Query User          │
       │                        ├───────────────────────►│
       │                        │                        │
       │                        │ 3. User Data           │
       │                        │◄───────────────────────┤
       │                        │                        │
       │                        │ 4. Validate Password   │
       │                        │    (BCrypt)            │
       │                        │                        │
       │                        │ 5. Generate JWT        │
       │                        │    (with secret key)   │
       │                        │                        │
       │ 6. Response            │                        │
       │    (token + user data) │                        │
       │◄───────────────────────┤                        │
       │                        │                        │
       │ 7. Store Token         │                        │
       │    (localStorage)      │                        │
       │                        │                        │
       │ 8. Future Requests     │                        │
       │    (with token header) │                        │
       ├───────────────────────►│                        │
       │                        │ 9. Verify JWT          │
       │                        │                        │
       │ 10. Protected Data     │                        │
       │◄───────────────────────┤                        │
       │                        │                        │
```

---

## 🌐 CORS CONFIGURATION

```
┌─────────────────────────────────────────────────────────────┐
│                    CORS ALLOWED ORIGINS                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Localhost Development:                                     │
│  ✅ http://localhost:5173                                   │
│  ✅ http://localhost:5176                                   │
│  ✅ http://127.0.0.1:5173                                   │
│  ✅ http://127.0.0.1:5176                                   │
│                                                             │
│  Production Deployment:                                     │
│  ✅ https://hrmsbackendfullrenderingapplication.vercel.app │
│  ✅ https://hrmsbackendfrontendapp.vercel.app              │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Configured in:
- SecurityConfig.java (Spring Security CORS)
- WebConfig.java (Global CORS)
- AuthController.java (@CrossOrigin annotation)
```

---

## 📦 DEPLOYMENT PROCESS

### Render Backend Deployment:
```
1. Push code to GitHub
   ↓
2. Render detects changes
   ↓
3. Render pulls latest code
   ↓
4. Render builds Docker image
   ├─ FROM maven:3.9-eclipse-temurin-21
   ├─ COPY pom.xml and src
   ├─ RUN mvn clean package
   └─ FROM eclipse-temurin:21-jre-alpine
   ↓
5. Render starts container
   ├─ Loads environment variables
   ├─ Connects to MongoDB
   └─ Starts on port 10000
   ↓
6. Backend is live! ✅
```

### Vercel Frontend Deployment:
```
1. Push code to GitHub
   ↓
2. Vercel detects changes
   ↓
3. Vercel pulls latest code
   ↓
4. Vercel builds React app
   ├─ npm install
   ├─ npm run build
   └─ Generates static files
   ↓
5. Vercel deploys to CDN
   ├─ Loads environment variables
   └─ Serves static files
   ↓
6. Frontend is live! ✅
```

---

## 🔧 ENVIRONMENT VARIABLES FLOW

```
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Spring Boot)                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  application.properties:                                    │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ server.port=8082                                      │ │
│  │ spring.data.mongodb.uri=${MONGODB_URI}               │ │
│  │ spring.mail.username=${SPRING_MAIL_USERNAME}         │ │
│  │ spring.mail.password=${SPRING_MAIL_PASSWORD}         │ │
│  │ jwt.secret=${JWT_SECRET}                             │ │
│  └───────────────────────────────────────────────────────┘ │
│                          ▲                                  │
│                          │                                  │
│  Environment Variables:  │                                  │
│  ┌───────────────────────┴───────────────────────────────┐ │
│  │ MONGODB_URI=mongodb+srv://...                        │ │
│  │ SPRING_MAIL_USERNAME=aishushettar95@gmail.com        │ │
│  │ SPRING_MAIL_PASSWORD=bbfskhrhtnujkokk                │ │
│  │ JWT_SECRET=MyFixedSecretKey123456                    │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React+Vite)                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  .env file:                                                 │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ VITE_API_BASE_URL=http://localhost:8082              │ │
│  │ VITE_TURN_USERNAME=51e40078dfabc57d54164c2f          │ │
│  │ VITE_TURN_CREDENTIAL=KJnavaquyonnUlkx                │ │
│  └───────────────────────────────────────────────────────┘ │
│                          │                                  │
│                          ▼                                  │
│  Used in code as:                                           │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ import.meta.env.VITE_API_BASE_URL                    │ │
│  │ import.meta.env.VITE_TURN_USERNAME                   │ │
│  │ import.meta.env.VITE_TURN_CREDENTIAL                 │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 PORT CONFIGURATION

```
┌──────────────────────────────────────────────────────────┐
│                    PORT MAPPING                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  LOCALHOST:                                              │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Frontend:  5173  (Vite default)                    │ │
│  │ Backend:   8082  (configured in application.props) │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  CLOUD (Render):                                         │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Backend:   10000 (Render assigns dynamically)      │ │
│  │            Exposed via PORT environment variable   │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  CLOUD (Vercel):                                         │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Frontend:  443   (HTTPS)                           │ │
│  │            Managed by Vercel CDN                   │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 📊 DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                    USER AUTHENTICATION                      │
└─────────────────────────────────────────────────────────────┘

Browser                Frontend              Backend              Database
  │                      │                     │                    │
  │  1. Open App         │                     │                    │
  ├─────────────────────►│                     │                    │
  │                      │                     │                    │
  │  2. Login Form       │                     │                    │
  │◄─────────────────────┤                     │                    │
  │                      │                     │                    │
  │  3. Submit           │                     │                    │
  │  (email+password)    │                     │                    │
  ├─────────────────────►│                     │                    │
  │                      │  4. POST /api/auth/login                │
  │                      ├────────────────────►│                    │
  │                      │                     │  5. Find User      │
  │                      │                     ├───────────────────►│
  │                      │                     │                    │
  │                      │                     │  6. User Data      │
  │                      │                     │◄───────────────────┤
  │                      │                     │                    │
  │                      │                     │  7. Validate       │
  │                      │                     │     Password       │
  │                      │                     │                    │
  │                      │                     │  8. Generate JWT   │
  │                      │                     │                    │
  │                      │  9. Response        │                    │
  │                      │  {token, user}      │                    │
  │                      │◄────────────────────┤                    │
  │                      │                     │                    │
  │                      │ 10. Store Token     │                    │
  │                      │     in localStorage │                    │
  │                      │                     │                    │
  │ 11. Dashboard        │                     │                    │
  │◄─────────────────────┤                     │                    │
  │                      │                     │                    │
```

---

## 🎉 SUCCESS INDICATORS

```
┌─────────────────────────────────────────────────────────────┐
│                    LOCALHOST SUCCESS                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Terminal 1 (Backend):                                      │
│  ✅ Started HmrsBackendApplication in X.XXX seconds        │
│  ✅ Tomcat started on port(s): 8082 (http)                 │
│                                                             │
│  Terminal 2 (Frontend):                                     │
│  ✅ VITE v5.x.x ready in XXX ms                            │
│  ✅ Local: http://localhost:5173/                          │
│                                                             │
│  Browser:                                                   │
│  ✅ Login page loads                                        │
│  ✅ No CORS errors in console                              │
│  ✅ Can create admin user                                  │
│  ✅ Can login successfully                                 │
│  ✅ Dashboard loads                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    CLOUD SUCCESS                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Render Logs:                                               │
│  ✅ ==> Build successful                                   │
│  ✅ Started HmrsBackendApplication                         │
│  ✅ Tomcat started on port(s): 10000 (http)                │
│                                                             │
│  Vercel Logs:                                               │
│  ✅ Build Completed                                        │
│  ✅ Deployment Ready                                       │
│                                                             │
│  Browser:                                                   │
│  ✅ Frontend loads from Vercel                             │
│  ✅ Backend responds from Render                           │
│  ✅ No CORS errors                                         │
│  ✅ Can create admin user                                  │
│  ✅ Can login successfully                                 │
│  ✅ Dashboard loads                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

**This visual guide shows how all components work together!**
