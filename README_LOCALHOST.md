# 🏠 HRMS Application - Localhost Setup

> **Status:** ✅ Fully Configured - Ready to Run!

This guide will help you run the HRMS Full-Stack Application on your local machine.

---

## 📚 Quick Navigation

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **[START_LOCALHOST_NOW.md](START_LOCALHOST_NOW.md)** | 🚀 Simple 3-step guide | **START HERE** - Quick setup |
| **[LOCALHOST_QUICK_START.txt](LOCALHOST_QUICK_START.txt)** | 📋 Copy-paste commands | Need commands only |
| **[LOCALHOST_CHECKLIST.md](LOCALHOST_CHECKLIST.md)** | ✅ Step-by-step checklist | Prefer structured approach |
| **[LOCALHOST_SETUP_COMPLETE.md](LOCALHOST_SETUP_COMPLETE.md)** | 📖 Detailed guide | Need full documentation |
| **[LOCALHOST_ARCHITECTURE.md](LOCALHOST_ARCHITECTURE.md)** | 🏗️ System architecture | Want to understand system |

---

## ⚡ Quick Start (3 Steps)

### 1️⃣ Start Backend
```bash
cd HRMS-Backend
mvn spring-boot:run
```
Wait for: `Started HmrsBackendApplication`

### 2️⃣ Start Frontend
```bash
cd HRMS-Frontend
npm run dev
```
Wait for: `Local: http://localhost:5176/`

### 3️⃣ Open Browser
```
http://localhost:5176
```

**That's it!** 🎉

---

## 🔐 Default Credentials

Create admin user via browser console (F12):

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
}).then(r => r.json()).then(d => alert('✅ User created!\n\nEmail: admin@hrms.com\nPassword: Admin@123'));
```

**Login with:**
- Email: `admin@hrms.com`
- Password: `Admin@123`

---

## 🎯 System Overview

```
┌─────────────────────────────────────────┐
│         YOUR LOCALHOST SETUP            │
├─────────────────────────────────────────┤
│                                         │
│  Backend (Spring Boot)                  │
│  → Port: 8082                           │
│  → URL: http://localhost:8082           │
│                                         │
│  Frontend (React + Vite)                │
│  → Port: 5176                           │
│  → URL: http://localhost:5176           │
│                                         │
│  Database (MongoDB Atlas)               │
│  → Cloud-hosted                         │
│  → Already configured                   │
│                                         │
└─────────────────────────────────────────┘
```

---

## ✅ What's Already Configured

- ✅ **Frontend `.env`** → Points to `http://localhost:8082`
- ✅ **CORS Settings** → Allows localhost origins
- ✅ **MongoDB Atlas** → Connection string configured
- ✅ **JWT Secret** → Configured for authentication
- ✅ **Email Service** → Gmail SMTP configured
- ✅ **Vite Proxy** → Forwards API requests to backend

**You don't need to configure anything!** Just start the servers.

---

## 📋 Prerequisites

Make sure you have these installed:

- ✅ **Java 21** - For backend
- ✅ **Maven** - For building backend
- ✅ **Node.js** - For frontend
- ✅ **npm** - For frontend dependencies

Check versions:
```bash
java -version    # Should show Java 21
mvn -version     # Should show Maven 3.x
node -version    # Should show Node 16+
npm -version     # Should show npm 8+
```

---

## 🔧 Troubleshooting

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
# Check what's using the port
netstat -ano | findstr :8082
netstat -ano | findstr :5176

# Kill the process
taskkill /PID <PID> /F
```

### CORS errors?
1. Make sure backend is on port 8082
2. Make sure frontend is on port 5176
3. Clear browser cache (Ctrl+Shift+Delete)
4. Restart both servers

### Login not working?
1. Check browser console (F12) for errors
2. Check Network tab for API calls
3. Create admin user again via console
4. Check backend terminal for error logs

---

## 📁 Project Structure

```
HRMS-Application/
│
├── HRMS-Backend/              # Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/          # Java source code
│   │   │   └── resources/     # Configuration files
│   │   └── test/              # Test files
│   ├── pom.xml                # Maven dependencies
│   └── mvnw                   # Maven wrapper
│
├── HRMS-Frontend/             # React Frontend
│   ├── src/
│   │   ├── Pages/             # React pages
│   │   ├── Components/        # React components
│   │   └── api/               # API services
│   ├── .env                   # Environment variables
│   ├── vite.config.js         # Vite configuration
│   └── package.json           # npm dependencies
│
└── Documentation/             # Setup guides
    ├── START_LOCALHOST_NOW.md
    ├── LOCALHOST_QUICK_START.txt
    ├── LOCALHOST_CHECKLIST.md
    ├── LOCALHOST_SETUP_COMPLETE.md
    └── LOCALHOST_ARCHITECTURE.md
```

---

## 🌐 Ports & URLs

| Component | Port | URL | Status |
|-----------|------|-----|--------|
| Backend | 8082 | http://localhost:8082 | ✅ Configured |
| Frontend | 5176 | http://localhost:5176 | ✅ Configured |
| MongoDB | 27017 | Atlas Cloud | ✅ Connected |

---

## 🔒 Security Features

- **JWT Authentication** - Token-based auth with 24-hour expiration
- **Role-Based Access** - ADMIN, HR, EMPLOYEE roles
- **Password Hashing** - BCrypt encryption
- **CORS Protection** - Configured for localhost
- **Secure Headers** - Spring Security configured

---

## 🚀 Features

- ✅ User Authentication & Authorization
- ✅ Employee Management
- ✅ Attendance Tracking
- ✅ Leave Management
- ✅ Payroll Processing
- ✅ Performance Reviews
- ✅ Recruitment Management
- ✅ Real-time Chat
- ✅ Video Calling
- ✅ Reports & Analytics

---

## 📊 Tech Stack

### Backend
- Java 21
- Spring Boot 3.x
- Spring Security
- MongoDB
- JWT Authentication
- Maven

### Frontend
- React 18
- Vite
- Axios
- React Router
- WebRTC (for video calls)

### Database
- MongoDB Atlas (Cloud)

---

## 🎓 Learning Resources

### Backend
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Security](https://spring.io/projects/spring-security)
- [MongoDB Java Driver](https://www.mongodb.com/docs/drivers/java/)

### Frontend
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Axios Documentation](https://axios-http.com/)

---

## 🆘 Getting Help

### Check Logs

**Backend Logs (Terminal 1):**
- Look for error messages
- Check MongoDB connection status
- Verify port 8082 is active

**Frontend Logs (Terminal 2):**
- Look for compilation errors
- Check if port 5176 is active
- Verify environment variables loaded

**Browser Console (F12):**
- Check for JavaScript errors
- Look for CORS errors
- Monitor Network tab for API calls

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Port in use | Another process using port | Kill process or use different port |
| CORS error | Servers on wrong ports | Verify ports 8082 and 5176 |
| Login fails | Wrong credentials | Create new admin user |
| MongoDB error | Connection issue | Check internet connection |
| Build fails | Missing dependencies | Run `mvn clean install` or `npm install` |

---

## 📝 Development Workflow

1. **Start Backend** - Terminal 1
2. **Start Frontend** - Terminal 2
3. **Open Browser** - http://localhost:5176
4. **Make Changes** - Edit code in IDE
5. **Test** - Frontend hot-reloads, backend needs restart
6. **Debug** - Check logs in terminals and browser console

---

## ✨ Tips

- **Keep both terminals open** - Backend and frontend must run together
- **Backend first** - Always start backend before frontend
- **Clear cache** - If things don't work, clear browser cache
- **Check ports** - Make sure 8082 and 5176 are free
- **MongoDB Atlas** - Requires internet connection
- **Hot reload** - Frontend changes reflect immediately
- **Backend restart** - Backend changes need server restart

---

## 🎯 Success Checklist

- [ ] Java 21 installed
- [ ] Maven installed
- [ ] Node.js installed
- [ ] Backend starts successfully (port 8082)
- [ ] Frontend starts successfully (port 5176)
- [ ] Login page loads in browser
- [ ] No CORS errors in console
- [ ] Can create admin user
- [ ] Can login successfully
- [ ] Dashboard loads after login

---

## 📞 Support

If you're still having issues after following all guides:

1. **Check all documentation** - Read the guides in order
2. **Verify prerequisites** - Make sure all tools are installed
3. **Check logs** - Backend terminal, frontend terminal, browser console
4. **Try clean install** - Delete `node_modules`, `.m2` cache, rebuild
5. **Restart everything** - Close all terminals, restart servers

---

## 🎉 You're Ready!

Everything is configured and ready to go. Just follow the **[START_LOCALHOST_NOW.md](START_LOCALHOST_NOW.md)** guide and you'll be up and running in minutes!

**Happy Coding!** 💻✨
