# 🔧 FIX VERCEL BUILD ERROR

## ❌ ERROR

```
npm error enoent ENOENT: no such file or directory, open '/vercel/path0/package.json'
npm error enoent This is related to npm not being able to find a file.
Error: Command "npm run build" exited with 254
```

## 🔍 ROOT CAUSE

Vercel is looking for `package.json` in the wrong directory. Your frontend is in `HRMS-Frontend` folder, but Vercel is looking in the root.

---

## ✅ SOLUTION: UPDATE VERCEL PROJECT SETTINGS

### STEP 1: Go to Vercel Project Settings

1. Go to: https://vercel.com/dashboard
2. Click on: `hrmsbackendapplication`
3. Click: **Settings** tab

### STEP 2: Update Root Directory

1. In Settings, find: **General** section (left sidebar)
2. Scroll down to: **Root Directory**
3. Click: **Edit** button
4. Change from: `.` (root)
5. Change to: `HRMS-Frontend`
6. Click: **Save**

### STEP 3: Update Build Settings (if needed)

Still in Settings:

1. Scroll to: **Build & Development Settings**
2. Make sure these are set:

**Framework Preset:** `Vite`

**Build Command:** `npm run build` (or leave default)

**Output Directory:** `dist` (or leave default)

**Install Command:** `npm install` (or leave default)

3. Click: **Save** if you made changes

### STEP 4: Redeploy

1. Go to: **Deployments** tab
2. Click: **Redeploy** on latest deployment
3. Wait for deployment to complete

---

## 📋 CORRECT SETTINGS

```
┌─────────────────────────────────────────────────────────────┐
│  Vercel Project Settings                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Root Directory:                                            │
│  HRMS-Frontend                                              │
│                                                             │
│  Framework Preset:                                          │
│  Vite                                                       │
│                                                             │
│  Build Command:                                             │
│  npm run build                                              │
│                                                             │
│  Output Directory:                                          │
│  dist                                                       │
│                                                             │
│  Install Command:                                           │
│  npm install                                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 ALTERNATIVE: CREATE NEW VERCEL PROJECT

If updating settings doesn't work, create a new project:

### STEP 1: Delete Old Project (Optional)

1. Go to: https://vercel.com/dashboard
2. Click on: `hrmsbackendapplication`
3. Click: **Settings** → **General**
4. Scroll to bottom: **Delete Project**

### STEP 2: Create New Project

1. Go to: https://vercel.com/new
2. Click: **Import Git Repository**
3. Select your GitHub repo: `HRMSBackend`
4. Click: **Import**

### STEP 3: Configure Project

**Project Name:** `hrmsbackendapplication` (or any name)

**Framework Preset:** `Vite`

**Root Directory:** Click **Edit** → Select `HRMS-Frontend`

**Build Command:** `npm run build` (default)

**Output Directory:** `dist` (default)

### STEP 4: Add Environment Variables

Click: **Environment Variables** (expand section)

Add these 3 variables:

**Variable 1:**
- Key: `VITE_API_BASE_URL`
- Value: `https://newhmrsfullybackendapplication.onrender.com`

**Variable 2:**
- Key: `VITE_TURN_USERNAME`
- Value: `51e40078dfabc57d54164c2f`

**Variable 3:**
- Key: `VITE_TURN_CREDENTIAL`
- Value: `KJnavaquyonnUlkx`

### STEP 5: Deploy

Click: **Deploy**

Wait for deployment to complete (2-3 minutes)

---

## ✅ AFTER FIX

Your Vercel project should:
- ✅ Build successfully
- ✅ Deploy without errors
- ✅ Be accessible at your Vercel URL
- ✅ Connect to Render backend

---

## 🆘 IF STILL NOT WORKING

**Tell me:**
1. Did you set Root Directory to `HRMS-Frontend`?
2. What error do you see now?
3. Screenshot of Vercel Settings → General → Root Directory?

---

**🎯 KEY FIX: Set Root Directory to `HRMS-Frontend` in Vercel Settings!**
