# 🎯 RENDER SETTINGS - EXACT CONFIGURATION

## 🚨 THE PROBLEM

Render was trying to build your Java backend as a Node.js app, causing this error:
```
npm error enoent Could not read package.json
```

## ✅ THE SOLUTION

Configure Render to use **Docker** instead of Node.js.

---

## 📋 STEP-BY-STEP CONFIGURATION

### **STEP 1: Push render.yaml to GitHub**

First, push the changes:

```bash
git add .
git commit -m "Add Render Docker configuration"
git push origin main
```

---

### **STEP 2: Go to Render Dashboard**

1. Open: https://dashboard.render.com/
2. Find your backend service (or create new one)
3. Click on the service name

---

### **STEP 3: Update Service Settings**

Click **"Settings"** in the left sidebar, then configure:

#### **General Settings**

| Setting | Value |
|---------|-------|
| **Name** | `hrms-backend-final` (or your choice) |
| **Region** | Choose closest to you |
| **Branch** | `main` |

#### **Build & Deploy Settings** ⚠️ MOST IMPORTANT

| Setting | Value |
|---------|-------|
| **Root Directory** | `HRMS-Backend` |
| **Runtime** | **Docker** ⚠️ |
| **Dockerfile Path** | `./Dockerfile` |
| **Docker Build Context Directory** | `.` |
| **Docker Command** | (leave empty) |

#### **Instance Settings**

| Setting | Value |
|---------|-------|
| **Instance Type** | Free |
| **Auto-Deploy** | Yes |

---

### **STEP 4: Environment Variables**

Click **"Environment"** in the left sidebar, then add:

#### Variable 1: MONGODB_URI
```
mongodb+srv://aishwaryanandishettar:Aishwarya%4012@cluster0.aexpf8t.mongodb.net/Data_base_hrms?retryWrites=true&w=majority&appName=Cluster0
```

#### Variable 2: SPRING_MAIL_USERNAME
```
aishushettar95@gmail.com
```

#### Variable 3: SPRING_MAIL_PASSWORD
```
bbfskhrhtnujkokk
```

#### Variable 4: JWT_SECRET
```
MyFixedSecretKey123456
```

#### Variable 5: PORT
```
8080
```

**⚠️ IMPORTANT:**
- Click **"Add Environment Variable"** for each one
- No quotes around values
- No spaces before or after
- Copy exactly as shown

---

### **STEP 5: Deploy**

1. Click **"Manual Deploy"** at the top
2. Select **"Deploy latest commit"**
3. Wait for build (5-10 minutes)

---

## 🔍 WHAT TO LOOK FOR IN LOGS

### ✅ Good Signs (Build Success)

```
==> Cloning from https://github.com/...
==> Using Dockerfile at ./Dockerfile
==> Building Docker image
Step 1/10 : FROM maven:3.9-eclipse-temurin-21 AS build
...
Successfully built
==> Deploying...
==> Your service is live 🎉
```

### ✅ Good Signs (Application Running)

```
Started HmrsBackendApplication in 15.234 seconds
Tomcat started on port(s): 8080 (http)
```

### ❌ Bad Signs (Wrong Configuration)

```
==> Using Node.js version 22.22.0
npm error code ENOENT
npm error path /opt/render/project/src/HRMS-Backend/package.json
```

**If you see this:** Runtime is still set to Node.js, not Docker!

---

## 🎯 CRITICAL SETTINGS CHECKLIST

Before deploying, verify these settings:

- [ ] **Root Directory** = `HRMS-Backend` (exact spelling, case-sensitive)
- [ ] **Runtime** = `Docker` (NOT Node.js, NOT Java)
- [ ] **Dockerfile Path** = `./Dockerfile` (with the dot and slash)
- [ ] **All 5 environment variables** added
- [ ] **MongoDB URI** has `%40` instead of `@` in password
- [ ] **render.yaml** pushed to GitHub in `HRMS-Backend/` folder

---

## 🔄 IF YOU NEED TO START OVER

### Delete and Recreate Service

1. **Delete Old Service:**
   - Go to service settings
   - Scroll to bottom
   - Click "Delete Service"
   - Confirm deletion

2. **Create New Service:**
   - Click "New +" → "Web Service"
   - Connect GitHub repository
   - Select your repository
   - Configure as shown above
   - Deploy

---

## 📊 RENDER CONFIGURATION COMPARISON

### ❌ WRONG (What Render was doing)

```
Runtime: Node.js
Build Command: npm run build
Start Command: npm start
Root Directory: HRMS-Backend
```

**Result:** Looking for package.json → Error!

### ✅ CORRECT (What it should be)

```
Runtime: Docker
Dockerfile Path: ./Dockerfile
Root Directory: HRMS-Backend
Docker Build Context: .
```

**Result:** Uses Dockerfile → Builds with Maven → Success!

---

## 🎓 UNDERSTANDING THE CONFIGURATION

### Why Docker?

Your backend is a **Java Spring Boot** application, not Node.js. It needs:
- Java 21 runtime
- Maven to build
- JAR file to run

Docker provides all of this through the Dockerfile.

### What does render.yaml do?

Tells Render:
- "This is a Docker-based service"
- "Use the Dockerfile to build"
- "Here are the environment variables needed"

### What does Dockerfile do?

1. **Stage 1 (Build):**
   - Uses Maven image
   - Copies source code
   - Runs `mvn clean package`
   - Creates JAR file

2. **Stage 2 (Run):**
   - Uses Java runtime image
   - Copies JAR file
   - Exposes port 8080
   - Runs the application

---

## 🆘 TROUBLESHOOTING

### Issue: Still seeing "npm error"

**Cause:** Runtime is still Node.js

**Solution:**
1. Go to Settings → Build & Deploy
2. Change Runtime to **Docker**
3. Save changes
4. Redeploy

### Issue: "Dockerfile not found"

**Cause:** Wrong Dockerfile path or root directory

**Solution:**
1. Verify Root Directory = `HRMS-Backend`
2. Verify Dockerfile Path = `./Dockerfile`
3. Check GitHub - Dockerfile exists in HRMS-Backend folder
4. Redeploy

### Issue: Build succeeds but app crashes

**Cause:** Missing environment variables or wrong values

**Solution:**
1. Check all 5 environment variables are set
2. Verify MongoDB URI has `%40` not `@`
3. Check logs for specific error
4. Test MongoDB connection from Atlas dashboard

### Issue: "Port already in use"

**Cause:** Multiple instances running

**Solution:**
1. This shouldn't happen on Render
2. Check if you have multiple services
3. Delete duplicate services

---

## 📞 GETTING HELP

If you're still stuck:

1. **Check Render Logs:**
   - Click "Logs" tab
   - Look for error messages
   - Copy full error text

2. **Verify GitHub:**
   - Check `HRMS-Backend/render.yaml` exists
   - Check `HRMS-Backend/Dockerfile` exists
   - Make sure latest commit is pushed

3. **Check Settings:**
   - Screenshot your Render settings
   - Compare with this guide
   - Make sure Runtime = Docker

4. **Test Locally:**
   - Run `docker build -t test .` in HRMS-Backend folder
   - If it fails locally, fix that first
   - If it works locally, issue is in Render config

---

## ✅ SUCCESS CHECKLIST

- [ ] render.yaml created and pushed to GitHub
- [ ] Render service settings updated
- [ ] Runtime changed to Docker
- [ ] Root Directory set to HRMS-Backend
- [ ] Dockerfile Path set to ./Dockerfile
- [ ] All 5 environment variables added
- [ ] MongoDB URI uses %40 for @ symbol
- [ ] Manual deploy triggered
- [ ] Build logs show "Building Docker image"
- [ ] Build completes successfully
- [ ] Application logs show "Started HmrsBackendApplication"
- [ ] Service status shows "Live" with green dot
- [ ] Backend URL is accessible

---

## 🎉 NEXT STEPS AFTER SUCCESS

Once backend is deployed:

1. **Copy Backend URL** from Render dashboard
2. **Update Frontend** in Vercel:
   - Add environment variable: `VITE_API_BASE_URL=<your-render-url>`
3. **Update CORS** in backend (if needed):
   - Add Vercel URL to allowed origins
4. **Test** the full application

---

## 📚 REFERENCE LINKS

- [Render Docker Deployment](https://render.com/docs/docker)
- [Render Environment Variables](https://render.com/docs/environment-variables)
- [Render Build & Deploy](https://render.com/docs/deploys)
- [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)

---

## 💡 PRO TIPS

1. **Always use Docker for Java apps** - More reliable than buildpacks
2. **Test Dockerfile locally first** - Saves time debugging on Render
3. **Use render.yaml** - Makes configuration reproducible
4. **Monitor logs** - First place to check when issues occur
5. **Free tier sleeps** - First request after inactivity takes 30-60 seconds

---

## 🎯 FINAL REMINDER

**The key setting that fixes your error:**

```
Runtime: Docker (NOT Node.js)
```

Everything else follows from this!
