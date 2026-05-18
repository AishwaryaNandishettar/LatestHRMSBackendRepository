# 🔧 LOGIN NOT WORKING - STEP BY STEP FIX

## ❌ PROBLEM: "Nothing is logging in"

You're trying to login but it's not working. Let's fix this step by step.

---

## 🎯 STEP 1: FIRST, CREATE THE ADMIN USER

**The admin user doesn't exist yet! You need to create it first.**

### For Localhost (http://localhost:5173):

**1.1** Make sure backend is running:
```bash
cd HRMS-Backend
mvn spring-boot:run
```
Wait until you see: `Tomcat started on port(s): 8082`

**1.2** Make sure frontend is running:
```bash
cd HRMS-Frontend
npm run dev
```
Wait until you see: `Local: http://localhost:5173/`

**1.3** Open browser and go to: `http://localhost:5173`

**1.4** Press `F12` key (opens Developer Tools)

**1.5** Click on **"Console"** tab

**1.6** Copy and paste this ENTIRE code:
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
  alert('✅ Admin user created!\n\nEmail: admin@hrms.com\nPassword: Admin@123');
})
.catch(e => {
  console.error('❌ Error:', e);
  alert('❌ Error: ' + e.message);
});
```

**1.7** Press `Enter` key

**1.8** You should see an alert: "✅ Admin user created!"

**1.9** Now you can login with:
- Email: `admin@hrms.com`
- Password: `Admin@123`

---

### For Production (https://hrmsbackendfrontendapp.vercel.app):

**IMPORTANT: First fix Render backend!**

The backend is NOT working because Render is using Node.js instead of Docker.

**You MUST do this first:**

1. Go to: https://dashboard.render.com
2. Click on: `hrms-backend-final`
3. Click: **Settings** tab
4. Find: **Environment** setting
5. Change from: `Node` → `Docker`
6. Click: **Save Changes**
7. Click: **Manual Deploy** → **Deploy latest commit**
8. Wait 10 minutes for deployment

**After backend is deployed, then create admin user:**

**1.1** Open: https://hrmsbackendfrontendapp.vercel.app

**1.2** Press `F12` key

**1.3** Click on **"Console"** tab

**1.4** Copy and paste this code:
```javascript
fetch('https://hrms-backend-final-ixpy.onrender.com/api/auth/register', {
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
  alert('✅ Admin user created!\n\nEmail: admin@hrms.com\nPassword: Admin@123');
})
.catch(e => {
  console.error('❌ Error:', e);
  alert('❌ Error: ' + e.message);
});
```

**1.5** Press `Enter`

**1.6** Now login with:
- Email: `admin@hrms.com`
- Password: `Admin@123`

---

## 🎯 STEP 2: IF STILL NOT WORKING

### Check 1: Is Backend Running?

**For Localhost:**
Open browser and go to: `http://localhost:8082`

**Expected:** You should see "Whitelabel Error Page" (this is GOOD!)

**If you see:** "This site can't be reached" → Backend is NOT running!

**Solution:** Start backend:
```bash
cd HRMS-Backend
set MONGODB_URI=mongodb+srv://hrms_user:yWkztlbtsW7RGube@cluster0.aexpf8t.mongodb.net/Data_base_hrms?retryWrites=true&w=majority&appName=Cluster0
set SPRING_MAIL_USERNAME=aishushettar95@gmail.com
set SPRING_MAIL_PASSWORD=bbfskhrhtnujkokk
set JWT_SECRET=MyFixedSecretKey123456
mvn spring-boot:run
```

**For Production:**
Open browser and go to: `https://hrms-backend-final-ixpy.onrender.com`

**Expected:** You should see "Whitelabel Error Page" (this is GOOD!)

**If you see:** Error or nothing → Backend is NOT deployed correctly!

**Solution:** Fix Render deployment (see above)

---

### Check 2: Check Browser Console for Errors

**2.1** Open your login page

**2.2** Press `F12`

**2.3** Click on **"Console"** tab

**2.4** Try to login

**2.5** Look for errors:

**If you see:** `CORS policy` error
- **Solution:** Code is already fixed! Pull latest from GitHub

**If you see:** `Failed to fetch` or `Network error`
- **Solution:** Backend is not running (see Check 1)

**If you see:** `401 Unauthorized` or `Invalid credentials`
- **Solution:** User doesn't exist or wrong password (create user first)

---

### Check 3: Check Network Tab

**3.1** Press `F12`

**3.2** Click on **"Network"** tab

**3.3** Try to login

**3.4** Look for request to `/api/auth/login`

**3.5** Click on it and check:
- **Status:** Should be `200 OK`
- **Response:** Should have `token` and user data

**If Status is 401:** Wrong credentials or user doesn't exist
**If Status is 500:** Backend error (check backend logs)
**If Status is 0 or failed:** Backend not reachable

---

## 🎯 STEP 3: RECOMMENDED SOLUTION

**I recommend starting with LOCALHOST first!**

### Quick Localhost Setup (5 minutes):

**Terminal 1:**
```bash
cd HRMS-Backend
set MONGODB_URI=mongodb+srv://hrms_user:yWkztlbtsW7RGube@cluster0.aexpf8t.mongodb.net/Data_base_hrms?retryWrites=true&w=majority&appName=Cluster0
set SPRING_MAIL_USERNAME=aishushettar95@gmail.com
set SPRING_MAIL_PASSWORD=bbfskhrhtnujkokk
set JWT_SECRET=MyFixedSecretKey123456
mvn spring-boot:run
```

**Terminal 2:**
```bash
cd HRMS-Frontend
npm run dev
```

**Browser:**
1. Go to: `http://localhost:5173`
2. Press F12 → Console
3. Paste the admin user creation code (from Step 1.6 above)
4. Press Enter
5. Login with `admin@hrms.com` / `Admin@123`

---

## 📋 CHECKLIST

Before trying to login, make sure:

- [ ] Backend is running (check `http://localhost:8082` or Render URL)
- [ ] Frontend is running (check `http://localhost:5173` or Vercel URL)
- [ ] Admin user is created (using console fetch code)
- [ ] No CORS errors in browser console
- [ ] Using correct credentials: `admin@hrms.com` / `Admin@123`

---

## 🆘 STILL NOT WORKING?

**Tell me:**
1. Are you trying localhost or production?
2. What error do you see in browser console (F12)?
3. Is backend running? (check the URL in browser)
4. Did you create the admin user using the fetch code?

**I'll help you debug further!**

---

## 📞 QUICK COMMANDS

**Check if backend is running (localhost):**
```bash
curl http://localhost:8082
```

**Check if backend is running (production):**
```bash
curl https://hrms-backend-final-ixpy.onrender.com
```

**Check backend logs (localhost):**
Look at the terminal where you ran `mvn spring-boot:run`

**Check backend logs (production):**
Go to Render dashboard → hrms-backend-final → Logs

---

**🎯 MOST COMMON ISSUE: You haven't created the admin user yet!**

**Use the fetch code in browser console to create it first, then login!**
