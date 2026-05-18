# 🖱️ RENDER DEPLOYMENT - CLICK BY CLICK GUIDE

## 🎯 GOAL

Fix the "npm error" by configuring Render to use Docker instead of Node.js.

---

## 📋 BEFORE YOU START

### 1. Push Changes to GitHub

Open terminal and run:

```bash
git add .
git commit -m "Fix Render deployment - Add Docker configuration"
git push origin main
```

Wait for push to complete, then proceed.

---

## 🖱️ RENDER DASHBOARD STEPS

### **STEP 1: Open Render Dashboard**

1. Go to: **https://dashboard.render.com/**
2. Log in if needed
3. You should see your services list

---

### **STEP 2: Find Your Backend Service**

**Option A: If you have an existing service**
- Look for your backend service in the list
- Click on the service name
- Go to **STEP 3**

**Option B: If you need to create a new service**
- Click the blue **"New +"** button (top right)
- Select **"Web Service"**
- Click **"Connect a repository"** or select your GitHub account
- Find and select your repository: `HRMSBackend`
- Click **"Connect"**
- Go to **STEP 3**

---

### **STEP 3: Configure Service Settings**

You'll see a configuration page. Fill in these fields:

#### **Name**
```
hrms-backend-final
```
(or any name you prefer)

#### **Region**
```
Oregon (US West)
```
(or choose closest to you)

#### **Branch**
```
main
```

#### **Root Directory** ⚠️ IMPORTANT
```
HRMS-Backend
```
**Type exactly as shown - case sensitive!**

#### **Runtime** ⚠️ MOST IMPORTANT
Click the dropdown and select:
```
Docker
```
**NOT Node.js, NOT Java - must be Docker!**

#### **Dockerfile Path**
```
./Dockerfile
```
**Include the dot and slash!**

#### **Docker Build Context Directory**
```
.
```
**Just a single dot!**

#### **Docker Command**
```
(leave empty)
```

#### **Instance Type**
```
Free
```

#### **Auto-Deploy**
```
Yes
```
(toggle should be ON/blue)

---

### **STEP 4: Add Environment Variables**

Scroll down to **"Environment Variables"** section.

Click **"Add Environment Variable"** button 5 times and add these:

#### Variable 1
- **Key:** `MONGODB_URI`
- **Value:** 
  ```
  mongodb+srv://aishwaryanandishettar:Aishwarya%4012@cluster0.aexpf8t.mongodb.net/Data_base_hrms?retryWrites=true&w=majority&appName=Cluster0
  ```

#### Variable 2
- **Key:** `SPRING_MAIL_USERNAME`
- **Value:** 
  ```
  aishushettar95@gmail.com
  ```

#### Variable 3
- **Key:** `SPRING_MAIL_PASSWORD`
- **Value:** 
  ```
  bbfskhrhtnujkokk
  ```

#### Variable 4
- **Key:** `JWT_SECRET`
- **Value:** 
  ```
  MyFixedSecretKey123456
  ```

#### Variable 5
- **Key:** `PORT`
- **Value:** 
  ```
  8080
  ```

**⚠️ IMPORTANT:**
- No quotes around any values
- No spaces before or after
- Copy exactly as shown
- Notice `%40` in MongoDB URI (this is correct!)

---

### **STEP 5: Create/Update Service**

**If creating new service:**
- Scroll to bottom
- Click the blue **"Create Web Service"** button
- Wait for deployment to start

**If updating existing service:**
- Click **"Save Changes"** button
- Then click **"Manual Deploy"** at the top
- Select **"Deploy latest commit"**

---

### **STEP 6: Monitor Deployment**

You'll be taken to the **Logs** page.

#### ✅ What You Want to See:

```
==> Cloning from https://github.com/AishwaryaNandishettar/HRMSBackend
==> Checking out commit...
==> Using Dockerfile at ./Dockerfile
==> Building Docker image
Step 1/10 : FROM maven:3.9-eclipse-temurin-21 AS build
...
Step 10/10 : ENTRYPOINT ["java", "-Dserver.port=${PORT:-8080}", "-jar", "app.jar"]
Successfully built
==> Deploying...
==> Your service is live 🎉
```

Then in application logs:
```
Started HmrsBackendApplication in 15.234 seconds
Tomcat started on port(s): 8080 (http)
```

#### ❌ What You DON'T Want to See:

```
==> Using Node.js version 22.22.0
npm error code ENOENT
npm error path /opt/render/project/src/HRMS-Backend/package.json
```

**If you see this:** Runtime is still Node.js! Go back to settings and change it to Docker.

---

### **STEP 7: Verify Deployment**

Once you see "Your service is live 🎉":

1. **Check Service Status:**
   - Top of page should show green dot
   - Status: "Live"

2. **Copy Backend URL:**
   - Look for URL like: `https://hrms-backend-final-xxxx.onrender.com`
   - Click the copy icon
   - Save this URL - you'll need it for frontend

3. **Test Backend:**
   - Open new browser tab
   - Go to: `https://your-backend-url.onrender.com/api/auth/login`
   - Should see: `{"timestamp":"...","status":405,"error":"Method Not Allowed"...}`
   - This is correct! It means backend is running.

---

## 🔄 IF YOU NEED TO UPDATE SETTINGS

### After Service is Created:

1. **Go to Service Dashboard:**
   - Click on your service name in services list

2. **Click "Settings" (left sidebar)**

3. **Scroll to "Build & Deploy" section**

4. **Update These Fields:**
   - Runtime: **Docker**
   - Root Directory: `HRMS-Backend`
   - Dockerfile Path: `./Dockerfile`

5. **Click "Save Changes"**

6. **Click "Manual Deploy" (top of page)**

7. **Select "Deploy latest commit"**

---

## 🎯 CRITICAL CHECKPOINTS

Before clicking "Create Web Service" or "Save Changes", verify:

- [ ] Runtime = **Docker** (not Node.js, not Java)
- [ ] Root Directory = `HRMS-Backend` (exact spelling)
- [ ] Dockerfile Path = `./Dockerfile` (with dot and slash)
- [ ] All 5 environment variables added
- [ ] MongoDB URI has `%40` (not `@`)
- [ ] No quotes around any values
- [ ] No extra spaces in any values

---

## 🆘 TROUBLESHOOTING

### Issue: Can't find "Docker" in Runtime dropdown

**Solution:**
- Make sure you're on the correct page
- Try refreshing the page
- If still not there, you might need to verify your account
- Contact Render support

### Issue: "Dockerfile not found" error

**Solution:**
- Check Root Directory is exactly: `HRMS-Backend`
- Check Dockerfile Path is exactly: `./Dockerfile`
- Verify Dockerfile exists in GitHub at `HRMS-Backend/Dockerfile`
- Make sure you pushed latest changes to GitHub

### Issue: Build succeeds but app crashes

**Solution:**
- Click "Logs" tab
- Look for error messages
- Common causes:
  - Missing environment variables
  - Wrong MongoDB URI
  - MongoDB Atlas network access not configured

### Issue: Still seeing "npm error"

**Solution:**
- Runtime is still Node.js
- Go to Settings → Build & Deploy
- Change Runtime to Docker
- Save and redeploy

---

## 📊 SETTINGS SUMMARY

Here's what your final settings should look like:

```
┌─────────────────────────────────────────┐
│         RENDER SERVICE SETTINGS         │
├─────────────────────────────────────────┤
│ Name: hrms-backend-final                │
│ Region: Oregon (US West)                │
│ Branch: main                            │
│ Root Directory: HRMS-Backend            │
│ Runtime: Docker                         │
│ Dockerfile Path: ./Dockerfile           │
│ Docker Build Context: .                 │
│ Instance Type: Free                     │
│ Auto-Deploy: Yes                        │
├─────────────────────────────────────────┤
│         ENVIRONMENT VARIABLES           │
├─────────────────────────────────────────┤
│ MONGODB_URI: mongodb+srv://...          │
│ SPRING_MAIL_USERNAME: aishushettar...   │
│ SPRING_MAIL_PASSWORD: bbfskhrhtnujkokk  │
│ JWT_SECRET: MyFixedSecretKey123456      │
│ PORT: 8080                              │
└─────────────────────────────────────────┘
```

---

## ✅ SUCCESS CHECKLIST

- [ ] Pushed changes to GitHub
- [ ] Opened Render dashboard
- [ ] Found/created backend service
- [ ] Set Runtime to **Docker**
- [ ] Set Root Directory to `HRMS-Backend`
- [ ] Set Dockerfile Path to `./Dockerfile`
- [ ] Added all 5 environment variables
- [ ] Clicked "Create Web Service" or "Save Changes"
- [ ] Deployment started
- [ ] Build logs show "Building Docker image"
- [ ] Build completed successfully
- [ ] Application logs show "Started HmrsBackendApplication"
- [ ] Service status shows "Live" with green dot
- [ ] Copied backend URL
- [ ] Tested backend URL in browser

---

## 🎉 NEXT STEPS AFTER SUCCESS

1. **Save Backend URL** - You'll need it for frontend

2. **Update Frontend (Vercel):**
   - Go to Vercel dashboard
   - Open your frontend project
   - Settings → Environment Variables
   - Add/Update: `VITE_API_BASE_URL` = `<your-render-backend-url>`
   - Redeploy frontend

3. **Test Full Application:**
   - Open frontend URL
   - Try to login
   - Check browser console for errors
   - Verify features work

4. **Create Admin User:**
   - Open browser console (F12)
   - Run the fetch command from documentation
   - Login with created credentials

---

## 📞 STILL STUCK?

If you followed all steps and it's still not working:

1. **Take Screenshots:**
   - Your Render settings page
   - The error in logs
   - Environment variables page

2. **Check These:**
   - Is `render.yaml` in GitHub at `HRMS-Backend/render.yaml`?
   - Is `Dockerfile` in GitHub at `HRMS-Backend/Dockerfile`?
   - Did you push latest changes?
   - Is Runtime definitely set to Docker?

3. **Try Clean Deploy:**
   - Delete the service
   - Create new service from scratch
   - Follow this guide exactly

---

## 💡 FINAL TIPS

1. **Be Patient** - First deploy takes 5-10 minutes
2. **Watch the Logs** - They tell you exactly what's happening
3. **Runtime = Docker** - This is the most important setting
4. **Test Locally First** - Makes debugging easier
5. **Free Tier Sleeps** - First request after inactivity takes 30-60 seconds

---

## 🎯 YOU'VE GOT THIS!

Follow each step carefully, and your backend will be deployed successfully!

**The key is: Runtime must be Docker!** 🐳
