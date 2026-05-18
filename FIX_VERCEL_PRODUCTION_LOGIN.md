# 🔧 FIX: Production Login Not Working (Localhost Works Fine)

## ✅ CONFIRMED

- ✅ **Localhost works:** http://localhost:5176/
- ✅ **User exists in database:** Aishwarya@company.com / admin123
- ✅ **Backend is live:** https://newhmrsfullybackendapplication.onrender.com
- ❌ **Production login fails:** "Invalid email or password"

## 🔍 ROOT CAUSE

Since localhost works but production doesn't, the issue is:

**Vercel frontend is NOT connecting to the Render backend.**

The frontend is probably still trying to connect to `localhost:8082` instead of the Render URL.

---

## ✅ SOLUTION: FIX VERCEL ENVIRONMENT VARIABLE

### STEP 1: Go to Vercel Dashboard

1. Go to: https://vercel.com/dashboard
2. Find your project: `hrmsbackendfullrenderingapplication`
3. Click on it

### STEP 2: Go to Settings

1. Click: **Settings** tab (top menu)
2. Click: **Environment Variables** (left sidebar)

### STEP 3: Check Current Variables

Look for: `VITE_API_BASE_URL`

**If it exists:**
- Check the value
- If it's `http://localhost:8082` → **WRONG!**
- If it's empty or undefined → **WRONG!**

**If it doesn't exist:**
- You need to add it

### STEP 4: Delete Old Variable (if exists)

1. Find: `VITE_API_BASE_URL`
2. Click: **...** (three dots)
3. Click: **Delete**
4. Confirm deletion

### STEP 5: Add Correct Variable

1. Click: **Add New** button
2. Fill in:
   - **Key:** `VITE_API_BASE_URL`
   - **Value:** `https://newhmrsfullybackendapplication.onrender.com`
   - **Environment:** Check **ALL** (Production, Preview, Development)
3. Click: **Save**

### STEP 6: Add TURN Credentials (if missing)

**Variable 1:**
- Key: `VITE_TURN_USERNAME`
- Value: `51e40078dfabc57d54164c2f`
- Environment: ALL
- Click: **Save**

**Variable 2:**
- Key: `VITE_TURN_CREDENTIAL`
- Value: `KJnavaquyonnUlkx`
- Environment: ALL
- Click: **Save**

### STEP 7: CRITICAL - Redeploy WITHOUT Cache

1. Go to: **Deployments** tab
2. Find: Latest deployment
3. Click: **...** (three dots)
4. Click: **Redeploy**
5. **IMPORTANT:** **UNCHECK** "Use existing Build Cache"
6. Click: **Redeploy** button
7. Wait 2-3 minutes

---

## 🧪 TEST AFTER REDEPLOYMENT

### Test 1: Check Environment Variable

1. Open: https://hrmsbackendfullrenderingapplication.vercel.app
2. Press: `F12` (open console)
3. Type: `console.log(import.meta.env.VITE_API_BASE_URL)`
4. Press: Enter

**Expected:** `https://newhmrsfullybackendapplication.onrender.com`

**If you see:**
- `undefined` → Variable not set or not redeployed
- `http://localhost:8082` → Wrong value, need to fix
- Correct URL → ✅ Good! Try login

### Test 2: Check Network Request

1. Open: https://hrmsbackendfullrenderingapplication.vercel.app
2. Press: `F12`
3. Click: **Network** tab
4. Try to login with: `Aishwarya@company.com` / `admin123`
5. Look for: `/api/auth/login` request
6. Click on it
7. Check: **Request URL**

**Should be:** `https://newhmrsfullybackendapplication.onrender.com/api/auth/login`

**If it's:** `http://localhost:8082/api/auth/login` → Environment variable not working

### Test 3: Try Login

1. Open: https://hrmsbackendfullrenderingapplication.vercel.app
2. Email: `Aishwarya@company.com`
3. Password: `admin123`
4. Click: **Login**

**✅ Should work now!**

---

## 📋 COMPLETE ENVIRONMENT VARIABLES

### Vercel (Frontend) - 3 Variables:

```
VITE_API_BASE_URL=https://newhmrsfullybackendapplication.onrender.com
VITE_TURN_USERNAME=51e40078dfabc57d54164c2f
VITE_TURN_CREDENTIAL=KJnavaquyonnUlkx
```

### Render (Backend) - 4 Variables:

```
MONGODB_URI=mongodb+srv://hrms_user:yWkztlbtsW7RGube@cluster0.aexpf8t.mongodb.net/Data_base_hrms?retryWrites=true&w=majority&appName=Cluster0
SPRING_MAIL_USERNAME=aishushettar95@gmail.com
SPRING_MAIL_PASSWORD=bbfskhrhtnujkokk
JWT_SECRET=MyFixedSecretKey123456
```

---

## 🎯 WHY LOCALHOST WORKS BUT PRODUCTION DOESN'T

**Localhost:**
```
Frontend (.env): VITE_API_BASE_URL=http://localhost:8082
Backend: Running on localhost:8082
✅ They connect!
```

**Production (BEFORE FIX):**
```
Frontend: VITE_API_BASE_URL not set or wrong
Frontend tries: http://localhost:8082 (doesn't exist in production!)
Backend: Running on https://newhmrsfullybackendapplication.onrender.com
❌ They DON'T connect!
```

**Production (AFTER FIX):**
```
Frontend: VITE_API_BASE_URL=https://newhmrsfullybackendapplication.onrender.com
Backend: Running on https://newhmrsfullybackendapplication.onrender.com
✅ They connect!
```

---

## 🆘 IF STILL NOT WORKING AFTER REDEPLOYMENT

### Option 1: Check Vercel Build Logs

1. Go to: Vercel → Deployments
2. Click on: Latest deployment
3. Click: **Build Logs**
4. Look for: Environment variables being loaded
5. Should see: `VITE_API_BASE_URL` with correct value

### Option 2: Test Backend Directly

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
    alert('✅ Backend works! Issue is in frontend environment variable.');
  } else {
    alert('❌ Backend error: ' + JSON.stringify(d));
  }
})
.catch(e => {
  console.error('❌ Error:', e);
  alert('❌ Backend not responding: ' + e.message);
});
```

**If this works:** Backend is fine, issue is Vercel environment variable
**If this fails:** Backend has issues

### Option 3: Clear Browser Cache

1. Open: https://hrmsbackendfullrenderingapplication.vercel.app
2. Press: `Ctrl + Shift + Delete`
3. Clear: Cache and cookies
4. Close browser
5. Open browser again
6. Try login

---

## 📞 SUMMARY

**Problem:** Localhost works, production doesn't

**Root Cause:** Vercel environment variable not set or wrong

**Solution:**
1. Set `VITE_API_BASE_URL` in Vercel to Render backend URL
2. Redeploy Vercel WITHOUT cache
3. Test environment variable in console
4. Try login

**After fix:** Production will work just like localhost!

---

**🔑 KEY: Environment variables must be set in Vercel AND you must redeploy WITHOUT cache for them to take effect!**
