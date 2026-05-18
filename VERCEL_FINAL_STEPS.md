# 🎯 VERCEL FINAL STEPS - UPDATE ENVIRONMENT VARIABLE

## ✅ What Just Happened

1. ✅ **Render backend is LIVE**: `https://hmrsbackend-latest-deploy.onrender.com`
2. ✅ **Code pushed to GitHub** with updated backend URL
3. ⚠️ **Need to update Vercel environment variable manually**

---

## 🚀 STEP-BY-STEP: UPDATE VERCEL ENVIRONMENT VARIABLE

### **Step 1: Go to Vercel Dashboard**
1. Open: https://vercel.com/dashboard
2. Click on your project: **hrms-frontend-production**

### **Step 2: Update Environment Variable**
1. Click **"Settings"** (left sidebar)
2. Click **"Environment Variables"** (left sidebar)
3. Find the variable: **`VITE_API_BASE_URL`**
4. Click the **three dots (•••)** next to it
5. Click **"Edit"**
6. Change the value to:
   ```
   https://hmrsbackend-latest-deploy.onrender.com
   ```
7. Make sure it's applied to: **Production, Preview, Development** (all three checkboxes)
8. Click **"Save"**

### **Step 3: Redeploy**

**Option A: Automatic (Recommended)**
- Vercel will automatically redeploy when it detects the GitHub push
- Wait 1-2 minutes and check the "Deployments" tab

**Option B: Manual Redeploy**
1. Go to **"Deployments"** tab
2. Click the **three dots (•••)** on the latest deployment
3. Click **"Redeploy"**
4. **IMPORTANT**: Uncheck "Use existing Build Cache"
5. Click **"Redeploy"**

---

## 🔍 VERIFY DEPLOYMENT

### **1. Check Vercel Deployment Status**
- Go to: https://vercel.com/dashboard
- Click on your project
- Wait for status to show: **"Ready"** ✅

### **2. Test Your Live Site**
1. Visit: https://hrms-frontend-production-git-main-aishwarya-omoikane.vercel.app
2. Try to **login**
3. Check if **data loads** (dashboard, employees, etc.)

### **3. Check Browser Console**
1. Press **F12** to open Developer Tools
2. Go to **"Console"** tab
3. Look for any errors (should be none)
4. Check **"Network"** tab
5. Verify API calls go to: `https://hmrsbackend-latest-deploy.onrender.com`

---

## 📋 ENVIRONMENT VARIABLES CHECKLIST

Make sure these are set in Vercel:

| Variable | Value | Applied To |
|----------|-------|------------|
| `VITE_API_BASE_URL` | `https://hmrsbackend-latest-deploy.onrender.com` | Production, Preview, Development |
| `VITE_TURN_USERNAME` | `51e40078dfabc57d54164c2f` | Production, Preview, Development |
| `VITE_TURN_CREDENTIAL` | `KJnavaquyonnUlkx` | Production, Preview, Development |

---

## 🐛 TROUBLESHOOTING

### **Issue 1: "Failed to fetch" or "Network Error"**

**Cause**: Backend URL is wrong or backend is down

**Solution**:
1. Check if backend is running: https://hmrsbackend-latest-deploy.onrender.com
2. Verify environment variable in Vercel matches the backend URL
3. Check CORS settings in backend (should allow your Vercel domain)

### **Issue 2: "401 Unauthorized" on Login**

**Cause**: JWT token or authentication issue

**Solution**:
1. Clear browser cache and cookies
2. Try login again
3. Check backend logs on Render for authentication errors

### **Issue 3: Build Still Failing**

**Cause**: Cache or dependency issues

**Solution**:
```bash
cd HRMS-Frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
git add package-lock.json
git commit -m "Rebuild dependencies"
git push
```

### **Issue 4: "CORS Error" in Browser Console**

**Cause**: Backend not allowing Vercel domain

**Solution**: Check backend CORS configuration allows:
- `https://hrms-frontend-production-git-main-aishwarya-omoikane.vercel.app`
- `https://hrms-frontend-production.vercel.app`
- Or use `*` for all origins (not recommended for production)

---

## ✅ SUCCESS CHECKLIST

- [ ] Vercel environment variable updated to: `https://hmrsbackend-latest-deploy.onrender.com`
- [ ] Vercel deployment status shows: **"Ready"** ✅
- [ ] Frontend site loads without errors
- [ ] Login works successfully
- [ ] Dashboard data loads from backend
- [ ] No CORS errors in browser console
- [ ] API calls go to correct backend URL

---

## 🎉 AFTER SUCCESSFUL DEPLOYMENT

### **Your Live URLs:**
- **Frontend**: https://hrms-frontend-production-git-main-aishwarya-omoikane.vercel.app
- **Backend**: https://hmrsbackend-latest-deploy.onrender.com

### **Test These Features:**
1. ✅ Login/Logout
2. ✅ Dashboard loads
3. ✅ Employee list loads
4. ✅ Add/Edit employee
5. ✅ Attendance tracking
6. ✅ Leave management
7. ✅ Payroll
8. ✅ Reports
9. ✅ Tasks
10. ✅ Helpdesk

---

## 📞 NEED HELP?

If you still face issues:
1. Share the **Vercel build logs**
2. Share the **browser console errors**
3. Check **Render backend logs**
4. Verify **network requests** in browser DevTools

---

**Last Updated**: April 28, 2026  
**Status**: ✅ Code pushed, waiting for Vercel environment variable update
