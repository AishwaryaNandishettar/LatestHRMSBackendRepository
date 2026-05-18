# 🔐 FIX: "Invalid email or password" Error

## ❌ PROBLEM

Login shows: **"Invalid email or password"**

This means:
1. User doesn't exist in database, OR
2. Password is wrong, OR
3. Backend can't connect to MongoDB

---

## ✅ SOLUTION 1: CREATE NEW ADMIN USER

Since you're getting "Invalid email or password", let's create a fresh admin user.

### STEP 1: Open Your Vercel App
https://hrmsbackendfullrenderingapplication.vercel.app

### STEP 2: Open Browser Console
Press `F12` key → Click **Console** tab

### STEP 3: Create Admin User
Copy and paste this ENTIRE code:

```javascript
fetch('https://newhmrsfullybackendapplication.onrender.com/api/auth/register', {
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
  console.log('✅ Response:', d);
  if (d.email) {
    alert('✅ Admin user created!\n\nEmail: admin@hrms.com\nPassword: Admin@123\n\nYou can now login!');
  } else {
    alert('⚠️ User might already exist or there was an error.\n\nTry logging in with:\nEmail: admin@hrms.com\nPassword: Admin@123');
  }
})
.catch(e => {
  console.error('❌ Error:', e);
  alert('❌ Error creating user: ' + e.message + '\n\nBackend might not be responding.');
});
```

### STEP 4: Press Enter

### STEP 5: Login with New User
- Email: `admin@hrms.com`
- Password: `Admin@123`

**✅ Should work!**

---

## ✅ SOLUTION 2: TEST BACKEND CONNECTION

Let's verify backend is working:

### Test 1: Check Backend URL
Open in browser: https://newhmrsfullybackendapplication.onrender.com

**Expected:** "Whitelabel Error Page" (this is good!)

**If you see error or nothing:** Backend is not running

### Test 2: Test Login API
Open console (F12) and run:

```javascript
fetch('https://newhmrsfullybackendapplication.onrender.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'Aishwarya@company.com',
    password: 'admin123'
  })
})
.then(r => r.json())
.then(d => {
  console.log('✅ Response:', d);
  if (d.token) {
    alert('✅ Login successful! Backend is working!');
  } else {
    alert('❌ Login failed: ' + (d.message || 'Invalid credentials'));
  }
})
.catch(e => {
  console.error('❌ Error:', e);
  alert('❌ Backend error: ' + e.message);
});
```

**If you get token:** Backend is working, just wrong credentials
**If you get error:** Backend has issues

---

## ✅ SOLUTION 3: CHECK VERCEL ENVIRONMENT VARIABLES

Make sure Vercel has the correct backend URL:

### STEP 1: Go to Vercel Settings
1. Go to: https://vercel.com/dashboard
2. Click: `hrmsbackendfullrenderingapplication`
3. Click: **Settings** → **Environment Variables**

### STEP 2: Check These Variables

**Should have:**
```
VITE_API_BASE_URL=https://newhmrsfullybackendapplication.onrender.com
VITE_TURN_USERNAME=51e40078dfabc57d54164c2f
VITE_TURN_CREDENTIAL=KJnavaquyonnUlkx
```

**If wrong or missing:**
- Delete old variables
- Add new ones
- Redeploy Vercel (without cache)

---

## ✅ SOLUTION 4: CHECK RENDER ENVIRONMENT VARIABLES

Make sure Render has all 4 variables:

### STEP 1: Go to Render Settings
1. Go to: https://dashboard.render.com
2. Click: `newhmrsfullybackendapplication`
3. Click: **Environment** tab

### STEP 2: Verify These 4 Variables

```
MONGODB_URI=mongodb+srv://hrms_user:yWkztlbtsW7RGube@cluster0.aexpf8t.mongodb.net/Data_base_hrms?retryWrites=true&w=majority&appName=Cluster0

SPRING_MAIL_USERNAME=aishushettar95@gmail.com

SPRING_MAIL_PASSWORD=bbfskhrhtnujkokk

JWT_SECRET=MyFixedSecretKey123456
```

**If any are missing or wrong:**
- Fix them
- Render will auto-redeploy

---

## 🎯 MOST LIKELY SOLUTION

**The user `Aishwarya@company.com` with password `admin123` doesn't exist in the database.**

**Quick Fix:**
1. Create new admin user using the console code (Solution 1)
2. Login with: `admin@hrms.com` / `Admin@123`

---

## 📋 TROUBLESHOOTING CHECKLIST

- [ ] Backend is live (check Render URL)
- [ ] Vercel environment variables are set
- [ ] Render environment variables are set (all 4)
- [ ] Created admin user using console
- [ ] Tried login with new credentials

---

## 🆘 IF STILL NOT WORKING

### Check Network Tab

1. Open: https://hrmsbackendfullrenderingapplication.vercel.app
2. Press: F12
3. Click: **Network** tab
4. Try to login
5. Look for: `/api/auth/login` request
6. Click on it
7. Check:
   - **Request URL:** Should be `https://newhmrsfullybackendapplication.onrender.com/api/auth/login`
   - **Status:** 401 = wrong credentials, 500 = backend error
   - **Response:** Check error message

### Check Console Tab

1. Press: F12
2. Click: **Console** tab
3. Try to login
4. Look for errors

**Common errors:**
- CORS error → Backend CORS not configured
- Network error → Backend not responding
- 401 error → Wrong credentials

---

## 💡 WHY IT WORKED YESTERDAY BUT NOT TODAY

**Possible reasons:**

1. **Render free tier spins down after inactivity**
   - First request takes 50+ seconds to wake up
   - Try waiting 1 minute and login again

2. **MongoDB Atlas IP whitelist changed**
   - Check MongoDB Atlas → Network Access
   - Should have `0.0.0.0/0` (allow all IPs)

3. **Environment variables were changed**
   - Check Render environment variables
   - Check Vercel environment variables

4. **User was deleted from database**
   - Create new admin user (Solution 1)

---

## 🎯 RECOMMENDED ACTION NOW

**Do this in order:**

1. ✅ **Create new admin user** (Solution 1)
2. ✅ **Try login** with `admin@hrms.com` / `Admin@123`
3. ✅ **If works:** Problem solved!
4. ❌ **If doesn't work:** Check backend URL (Solution 2)

---

**🔑 MOST LIKELY: User doesn't exist. Create new admin user using console code!**
