# 🚀 RENDER DEPLOYMENT - BACKEND (FIXED)

## ❌ Problem

Render was trying to deploy the backend as a Node.js app instead of a Java/Docker app, causing this error:
```
npm error enoent Could not read package.json
```

## ✅ Solution

I've created a `render.yaml` file that tells Render this is a Docker-based Java application.

---

## 📋 DEPLOYMENT STEPS

### **STEP 1: Push Changes to GitHub**

The `render.yaml` file has been created. Push it to GitHub:

```bash
git add HRMS-Backend/render.yaml
git commit -m "Add Render configuration for Docker deployment"
git push origin main
```

---

### **STEP 2: Configure Render Service**

#### Option A: Create New Service (Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name:** `hrms-backend-final` (or any name)
   - **Region:** Choose closest to you
   - **Branch:** `main`
   - **Root Directory:** `HRMS-Backend`
   - **Runtime:** **Docker** ⚠️ IMPORTANT!
   - **Dockerfile Path:** `./Dockerfile`
   - **Docker Build Context Directory:** `.`

#### Option B: Update Existing Service

1. Go to your existing Render service
2. Click **"Settings"**
3. Scroll to **"Build & Deploy"**
4. Change **"Runtime"** to **"Docker"**
5. Set **"Dockerfile Path"** to `./Dockerfile`
6. Set **"Root Directory"** to `HRMS-Backend`
7. Click **"Save Changes"**

---

### **STEP 3: Set Environment Variables**

In Render Dashboard → Your Service → **Environment**:

Add these variables:

```
MONGODB_URI=mongodb+srv://aishwaryanandishettar:Aishwarya%4012@cluster0.aexpf8t.mongodb.net/Data_base_hrms?retryWrites=true&w=majority&appName=Cluster0

SPRING_MAIL_USERNAME=aishushettar95@gmail.com

SPRING_MAIL_PASSWORD=bbfskhrhtnujkokk

JWT_SECRET=MyFixedSecretKey123456

PORT=8080
```

**⚠️ IMPORTANT:**
- No quotes around values
- No spaces
- Copy exactly as shown
- The `%40` in MongoDB URI is the encoded `@` symbol

---

### **STEP 4: Deploy**

1. Click **"Manual Deploy"** → **"Deploy latest commit"**
2. Wait for build to complete (5-10 minutes)
3. Check logs for success message:
   ```
   Started HmrsBackendApplication
   Tomcat started on port(s): 8080 (http)
   ```

---

## ✅ Verify Deployment

Once deployed, your backend will be at:
```
https://your-service-name.onrender.com
```

Test it:
```
https://your-service-name.onrender.com/api/auth/login
```

Should return: `{"timestamp":"...","status":405,"error":"Method Not Allowed"...}`

This is correct! It means the backend is running.

---

## 🔧 Render Configuration Explained

### render.yaml
```yaml
services:
  - type: web                    # Web service
    name: hrms-backend           # Service name
    runtime: docker              # Use Docker (not Node.js!)
    dockerfilePath: ./Dockerfile # Path to Dockerfile
    envVars:                     # Environment variables
      - key: MONGODB_URI
        sync: false              # Set manually in dashboard
      - key: SPRING_MAIL_USERNAME
        sync: false
      - key: SPRING_MAIL_PASSWORD
        sync: false
      - key: JWT_SECRET
        value: MyFixedSecretKey123456
      - key: PORT
        value: 8080
```

### Dockerfile (Already Exists)
```dockerfile
# Stage 1: Build with Maven
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run with Java
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/hmrs-backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-Dserver.port=${PORT:-8080}", "-jar", "app.jar"]
```

---

## 🎯 Key Points

1. **Runtime MUST be Docker** - Not Node.js, not Java
2. **Root Directory** - Set to `HRMS-Backend`
3. **Dockerfile Path** - `./Dockerfile` (relative to root directory)
4. **Port** - Render uses port 8080 (configured in Dockerfile)
5. **Environment Variables** - Set in Render Dashboard, not in code

---

## 🆘 Troubleshooting

### Build fails with "npm error"
**Cause:** Render thinks this is a Node.js project

**Solution:**
1. Make sure `render.yaml` is in `HRMS-Backend/` folder
2. Set Runtime to **Docker** in Render settings
3. Set Root Directory to `HRMS-Backend`
4. Redeploy

### Build fails with "Maven error"
**Cause:** Maven build issue

**Solution:**
1. Check logs for specific error
2. Make sure all Java files compile locally first
3. Check `pom.xml` for issues
4. Try `mvn clean install` locally

### MongoDB connection error
**Cause:** Wrong connection string or MongoDB Atlas not accessible

**Solution:**
1. Verify MongoDB URI in environment variables
2. Make sure `%40` is used instead of `@` in password
3. Check MongoDB Atlas network access (allow all IPs: 0.0.0.0/0)
4. Test connection string locally first

### Service starts but crashes immediately
**Cause:** Missing environment variables or wrong configuration

**Solution:**
1. Check all environment variables are set
2. Check logs for specific error
3. Verify MongoDB connection
4. Check email credentials

---

## 📝 Deployment Checklist

- [ ] `render.yaml` created in `HRMS-Backend/` folder
- [ ] Changes pushed to GitHub
- [ ] Render service created or updated
- [ ] Runtime set to **Docker**
- [ ] Root Directory set to `HRMS-Backend`
- [ ] Dockerfile Path set to `./Dockerfile`
- [ ] All environment variables added
- [ ] MongoDB URI has `%40` instead of `@`
- [ ] Manual deploy triggered
- [ ] Build completes successfully
- [ ] Service shows "Live"
- [ ] Backend URL accessible
- [ ] Test endpoint returns response

---

## 🔗 Next Steps

After backend is deployed:

1. **Get Backend URL** - Copy from Render dashboard
2. **Update Frontend** - Set `VITE_API_BASE_URL` in Vercel
3. **Update CORS** - Add Vercel URL to backend CORS config
4. **Test Login** - Try logging in from frontend

---

## 📞 Still Having Issues?

If deployment still fails:

1. **Check Render Logs** - Look for specific error messages
2. **Verify GitHub** - Make sure `render.yaml` is pushed
3. **Check Settings** - Runtime must be Docker
4. **Test Locally** - Make sure backend runs on localhost first
5. **Environment Variables** - Double-check all values

---

## ✅ Success Indicators

**Build Logs:**
```
==> Cloning from https://github.com/...
==> Building Docker image
==> Successfully built
==> Deploying...
==> Your service is live 🎉
```

**Application Logs:**
```
Started HmrsBackendApplication in X.XXX seconds
Tomcat started on port(s): 8080 (http)
```

**Service Status:**
- Green dot next to service name
- Status shows "Live"
- URL is accessible

---

## 🎉 You're Done!

Once you see "Your service is live", your backend is deployed and ready to use!

Copy the backend URL and use it in your frontend configuration.
