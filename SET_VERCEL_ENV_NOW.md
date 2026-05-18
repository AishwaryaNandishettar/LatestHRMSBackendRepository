# 🚨 SET VERCEL ENVIRONMENT VARIABLE NOW

## ❌ THE PROBLEM

Your `.env` file has `http://localhost:8082` but Vercel needs the production URL.

The `.env.production` file can't be pushed to GitHub (it's in .gitignore).

**Solution: Set environment variables directly in Vercel dashboard.**

---

## ✅ DO THIS NOW (3 MINUTES)

### STEP 1: Go to Vercel Dashboard
https://vercel.com/dashboard

### STEP 2: Click on Your Project
Click: `hrmsbackendapplication`

### STEP 3: Go to Settings
Click: **Settings** tab (top menu)

### STEP 4: Go to Environment Variables
Click: **Environment Variables** (left sidebar)

### STEP 5: Add These 3 Variables

**Variable 1:**
- Click: **Add New**
- Key: `VITE_API_BASE_URL`
- Value: `https://newhmrsfullybackendapplication.onrender.com`
- Environment: Check **Production**, **Preview**, **Development** (all 3)
- Click: **Save**

**Variable 2:**
- Click: **Add New**
- Key: `VITE_TURN_USERNAME`
- Value: `51e40078dfabc57d54164c2f`
- Environment: Check all 3
- Click: **Save**

**Variable 3:**
- Click: **Add New**
- Key: `VITE_TURN_CREDENTIAL`
- Value: `KJnavaquyonnUlkx`
- Environment: Check all 3
- Click: **Save**

### STEP 6: Redeploy (IMPORTANT!)

1. Click: **Deployments** tab
2. Find: Latest deployment
3. Click: **...** (three dots)
4. Click: **Redeploy**
5. **UNCHECK** "Use existing Build Cache"
6. Click: **Redeploy** button
7. Wait 2-3 minutes

---

## 🧪 TEST AFTER REDEPLOYMENT

### Open Your App
https://hrmsbackendapplication.vercel.app

### Press F12 (Console)

### Type This:
```javascript
console.log(import.meta.env.VITE_API_BASE_URL)
```

**Expected:** `https://newhmrsfullybackendapplication.onrender.com`

**If you see this:** ✅ Environment variable is set!

**If you see `undefined` or `http://localhost:8082`:** ❌ Variable not set or not redeployed

---

## 🔐 THEN TRY LOGIN

1. Email: `Aishwarya@company.com`
2. Password: `admin123`
3. Click: **Login**

**✅ Should work now!**

---

## 📸 VISUAL GUIDE

```
Vercel Dashboard
  └─ hrmsbackendapplication
      └─ Settings
          └─ Environment Variables
              └─ Add New
                  ├─ VITE_API_BASE_URL = https://newhmrsfullybackendapplication.onrender.com
                  ├─ VITE_TURN_USERNAME = 51e40078dfabc57d54164c2f
                  └─ VITE_TURN_CREDENTIAL = KJnavaquyonnUlkx
              └─ Save
      └─ Deployments
          └─ Redeploy (without cache)
```

---

## 🆘 IF STILL NOT WORKING

### Check Network Tab

1. Open: https://hrmsbackendapplication.vercel.app
2. Press: F12
3. Click: **Network** tab
4. Try login
5. Look for: `/api/auth/login` request
6. Check: **Request URL**

**Should be:** `https://newhmrsfullybackendapplication.onrender.com/api/auth/login`

**If it's:** `http://localhost:8082/api/auth/login` → Environment variable not working

---

## 📋 QUICK CHECKLIST

- [ ] Go to Vercel Settings
- [ ] Click Environment Variables
- [ ] Add VITE_API_BASE_URL with Render URL
- [ ] Add VITE_TURN_USERNAME
- [ ] Add VITE_TURN_CREDENTIAL
- [ ] Save all 3 variables
- [ ] Go to Deployments
- [ ] Redeploy WITHOUT cache
- [ ] Wait for deployment
- [ ] Test in console
- [ ] Try login

---

**🎯 THIS WILL FIX THE LOGIN ISSUE!**

The problem is that Vercel is using the .env file which has localhost URL.
Setting environment variables in Vercel dashboard will override this.
