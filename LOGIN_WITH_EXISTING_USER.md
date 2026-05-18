# 🔐 LOGIN WITH EXISTING USER

## ✅ YOU ALREADY HAVE AN ADMIN USER!

**Email:** `Aishwarya@company.com`  
**Password:** `admin123`

---

## 🎯 OPTION 1: LOGIN ON LOCALHOST

### Step 1: Start Backend
Open Terminal 1:
```bash
cd HRMS-Backend
set MONGODB_URI=mongodb+srv://hrms_user:yWkztlbtsW7RGube@cluster0.aexpf8t.mongodb.net/Data_base_hrms?retryWrites=true&w=majority&appName=Cluster0
set SPRING_MAIL_USERNAME=aishushettar95@gmail.com
set SPRING_MAIL_PASSWORD=bbfskhrhtnujkokk
set JWT_SECRET=MyFixedSecretKey123456
mvn spring-boot:run
```

**Wait for:** `Tomcat started on port(s): 8082`

### Step 2: Start Frontend
Open Terminal 2:
```bash
cd HRMS-Frontend
npm run dev
```

**Wait for:** `Local: http://localhost:5173/`

### Step 3: Login
1. Open browser: `http://localhost:5173`
2. Enter credentials:
   - **Email:** `Aishwarya@company.com`
   - **Password:** `admin123`
3. Click **Login**

**✅ You should be logged in!**

---

## 🎯 OPTION 2: LOGIN ON PRODUCTION (VERCEL)

### ⚠️ IMPORTANT: Backend Must Be Fixed First!

The Render backend is currently broken (npm error). You need to fix it first.

### Step 1: Fix Render Backend
1. Go to: https://dashboard.render.com
2. Click on: `hrms-backend-final`
3. Click: **Settings** tab
4. Find: **Environment** dropdown
5. Change from: `Node` → `Docker`
6. Scroll down and click: **Save Changes**
7. Go to top of page
8. Click: **Manual Deploy** → **Deploy latest commit**
9. **WAIT 10-15 MINUTES** for deployment to complete

### Step 2: Check Backend is Live
Open browser: `https://hrms-backend-final-ixpy.onrender.com`

**Expected:** "Whitelabel Error Page" (this means it's working!)

### Step 3: Update Vercel Environment Variable
1. Go to: https://vercel.com/dashboard
2. Click on: `hrmsbackendfrontendapp`
3. Click: **Settings** → **Environment Variables**
4. Find: `VITE_API_BASE_URL`
5. Click **Edit**
6. Change value to: `https://hrms-backend-final-ixpy.onrender.com`
7. Click **Save**
8. Go to: **Deployments** tab
9. Click **Redeploy** on latest deployment

### Step 4: Login
1. Open: `https://hrmsbackendfrontendapp.vercel.app`
2. Enter credentials:
   - **Email:** `Aishwarya@company.com`
   - **Password:** `admin123`
3. Click **Login**

**✅ You should be logged in!**

---

## 🐛 IF LOGIN STILL NOT WORKING

### Check 1: Is Backend Running?

**For Localhost:**
Open browser: `http://localhost:8082`
- **Should see:** "Whitelabel Error Page" ✅
- **If not:** Backend is not running - start it (see Step 1 above)

**For Production:**
Open browser: `https://hrms-backend-final-ixpy.onrender.com`
- **Should see:** "Whitelabel Error Page" ✅
- **If not:** Backend deployment failed - check Render logs

### Check 2: Check Browser Console

1. Open login page
2. Press `F12` key
3. Click **Console** tab
4. Try to login
5. Look for errors:

**Common Errors:**

**Error:** `CORS policy blocked`
- **Cause:** Backend CORS not configured
- **Solution:** Already fixed in code! Pull latest from GitHub and redeploy

**Error:** `Failed to fetch` or `Network error`
- **Cause:** Backend is not running or wrong URL
- **Solution:** Check backend is running (see Check 1)

**Error:** `401 Unauthorized` or `Invalid credentials`
- **Cause:** Wrong email or password
- **Solution:** Make sure you're using `Aishwarya@company.com` and `admin123`

**Error:** `500 Internal Server Error`
- **Cause:** Backend error (maybe MongoDB connection issue)
- **Solution:** Check backend logs

### Check 3: Verify MongoDB Connection

The backend needs to connect to MongoDB. Make sure:
- MongoDB Atlas is accessible
- IP whitelist includes `0.0.0.0/0` (allow all IPs)
- User `hrms_user` has correct permissions

### Check 4: Check Network Tab

1. Press `F12`
2. Click **Network** tab
3. Try to login
4. Look for request to `/api/auth/login`
5. Click on it
6. Check **Response** tab

**If Status 200:** Login successful - check if token is being stored
**If Status 401:** Wrong credentials
**If Status 500:** Backend error
**If Status 0 or failed:** Backend not reachable

---

## 🎯 RECOMMENDED: START WITH LOCALHOST

I recommend testing on localhost first because:
- ✅ Faster to test
- ✅ Easier to debug
- ✅ No deployment wait time
- ✅ Can see backend logs directly

Once it works on localhost, then deploy to production.

---

## 📋 QUICK CHECKLIST

Before trying to login:

**For Localhost:**
- [ ] Backend running on port 8082
- [ ] Frontend running on port 5173
- [ ] Environment variables set in backend terminal
- [ ] No errors in backend terminal
- [ ] Browser console shows no CORS errors

**For Production:**
- [ ] Render backend deployed successfully (Docker environment)
- [ ] Render backend is accessible (check URL)
- [ ] Vercel frontend deployed
- [ ] Vercel environment variable points to Render backend
- [ ] No CORS errors in browser console

---

## 🔑 YOUR CREDENTIALS

**Email:** `Aishwarya@company.com`  
**Password:** `admin123`  
**Role:** ADMIN

---

## 🆘 STILL NOT WORKING?

**Tell me:**
1. Are you trying localhost or production?
2. What happens when you click Login? (any error message?)
3. What do you see in browser console (F12)?
4. Is backend running? (check the backend URL in browser)

**I'll help you debug!**

---

## 📞 QUICK TEST

**Test if backend is working:**

Open browser console (F12) and run:

**For Localhost:**
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
.then(d => console.log('✅ Login successful:', d))
.catch(e => console.error('❌ Login failed:', e));
```

**For Production:**
```javascript
fetch('https://hrms-backend-final-ixpy.onrender.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'Aishwarya@company.com',
    password: 'admin123'
  })
})
.then(r => r.json())
.then(d => console.log('✅ Login successful:', d))
.catch(e => console.error('❌ Login failed:', e));
```

**If this works:** Backend is fine, issue is in frontend
**If this fails:** Backend is not working or not reachable

---

**🎯 START WITH LOCALHOST - IT'S THE EASIEST WAY TO TEST!**
