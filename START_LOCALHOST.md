# 🚀 QUICK START - LOCALHOST

## ⚡ FASTEST WAY TO START

### 1️⃣ START BACKEND (Terminal 1)

```bash
cd HRMS-Backend
mvn spring-boot:run
```

Wait for: `Started HmrsBackendApplication`

---

### 2️⃣ START FRONTEND (Terminal 2 - New Window)

```bash
cd HRMS-Frontend
npm run dev
```

Open browser: `http://localhost:5173`

---

### 3️⃣ CREATE ADMIN USER (Browser Console)

1. Press `F12` in browser
2. Go to **Console** tab
3. Paste and press Enter:

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
.then(d => alert('✅ User created!\n\nEmail: admin@hrms.com\nPassword: Admin@123'))
.catch(e => alert('❌ Error: ' + e.message));
```

---

### 4️⃣ LOGIN

- **Email:** `admin@hrms.com`
- **Password:** `Admin@123`

---

## ✅ DONE!

Your HRMS is now running on localhost! 🎉

**Need help?** Check `LOCALHOST_SETUP_COMPLETE.md` for detailed troubleshooting.
