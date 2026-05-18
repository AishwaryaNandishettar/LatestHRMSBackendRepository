# 🚀 COMPLETE CLOUD DEPLOYMENT GUIDE

## 🎯 GOAL
Deploy your HRMS application so everyone in your organization can access it via a URL like:
- **Frontend:** `https://your-hrms.vercel.app`
- **Backend:** `https://your-hrms-backend.onrender.com`

---

## 📋 WHAT YOU'LL GET

After deployment, you can share the URL with your team:
- ✅ They click the link
- ✅ They login with username/password you provide
- ✅ Everything works (database, features, etc.)

---

## 🏗️ DEPLOYMENT ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                    CLOUD DEPLOYMENT                          │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│   VERCEL         │────────▶│   RENDER         │────────▶│   MONGODB        │
│   (Frontend)     │         │   (Backend)      │         │   (Atlas)        │
│                  │         │                  │         │                  │
│  React + Vite    │         │  Spring Boot     │         │  Database        │
│  FREE TIER       │         │  FREE TIER       │         │  FREE TIER       │
└──────────────────┘         └──────────────────┘         └──────────────────┘
```

---

## ✅ PREREQUISITES (ALREADY DONE)

- ✅ MongoDB Atlas database configured
- ✅ Code fixes applied (CORS, etc.)
- ✅ Dockerfile created
- ✅ Application working on localhost

---

## 🚀 PART 1: DEPLOY BACKEND TO RENDER

### STEP 1: Push Code to GitHub

1. **Open Terminal** in your project root folder

2. **Initialize Git** (if not already done):
```bash
git init
git add .
git commit -m "Ready for deployment"
```

3. **Create GitHub Repository:**
   - Go to https://github.com/new
   - Repository name: `hrms-application`
   - Make it **Private** (recommended for company projects)
   - Click "Create repository"

4. **Push to GitHub:**
```bash
git remote add origin https://github.com/YOUR_USERNAME/hrms-application.git
git branch -M main
git push -u origin main
```

---

### STEP 2: Deploy Backend on Render

1. **Go to Render:** https://render.com/
2. **Sign up/Login** (use GitHub account - it's easier)
3. **Click "New +"** → Select **"Web Service"**
4. **Connect GitHub repository:**
   - Click "Connect account" if needed
   - Select your `hrms-application` repository
5. **Configure the service:**

```
Name: hrms-backend
Region: Choose closest to you (e.g., Singapore, Frankfurt)
Branch: main
Root Directory: HRMS-Backend
Runtime: Docker
Instance Type: Free
```

6. **Add Environment Variables:**

Click "Advanced" → "Add Environment Variable" and add these:

```
MONGODB_URI = mongodb+srv://hrms_user:yWkztlbtsW7RGube@cluster0.aexpf8t.mongodb.net/Data_base_hrms?retryWrites=true&w=majority

SPRING_MAIL_USERNAME = aishushettar95@gmail.com

SPRING_MAIL_PASSWORD = bbfskhrhtnujkokk

JWT_SECRET = MyFixedSecretKey123456

PORT = 8080
```

7. **Click "Create Web Service"**

8. **Wait 5-10 minutes** for deployment

9. **Copy your backend URL** (will look like):
```
https://hrms-backend-xxxx.onrender.com
```

---

## 🎨 PART 2: DEPLOY FRONTEND TO VERCEL

### STEP 1: Update Frontend Environment Variables

1. **Create `.env.production` file** in `HRMS-Frontend` folder:

```bash
cd HRMS-Frontend
```

Create file `.env.production` with this content:

```env
VITE_API_BASE_URL=https://hrms-backend-xxxx.onrender.com
VITE_TURN_USERNAME=51e40078dfabc57d54164c2f
VITE_TURN_CREDENTIAL=KJnavaquyonnUlkx
```

**⚠️ IMPORTANT:** Replace `https://hrms-backend-xxxx.onrender.com` with your actual Render backend URL from Part 1, Step 9.

2. **Commit the changes:**

```bash
git add .
git commit -m "Add production environment variables"
git push
```

---

### STEP 2: Deploy Frontend on Vercel

1. **Go to Vercel:** https://vercel.com/
2. **Sign up/Login** (use GitHub account)
3. **Click "Add New..."** → **"Project"**
4. **Import your GitHub repository:**
   - Select `hrms-application`
   - Click "Import"
5. **Configure the project:**

```
Framework Preset: Vite
Root Directory: HRMS-Frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

6. **Add Environment Variables:**

Click "Environment Variables" and add:

```
VITE_API_BASE_URL = https://hrms-backend-xxxx.onrender.com
VITE_TURN_USERNAME = 51e40078dfabc57d54164c2f
VITE_TURN_CREDENTIAL = KJnavaquyonnUlkx
```

**⚠️ IMPORTANT:** Use your actual Render backend URL!

7. **Click "Deploy"**

8. **Wait 2-3 minutes** for deployment

9. **Copy your frontend URL** (will look like):
```
https://hrms-application.vercel.app
```

---

## 🎉 PART 3: TEST YOUR DEPLOYMENT

### STEP 1: Create Admin User

1. **Open your frontend URL** in browser:
```
https://hrms-application.vercel.app
```

2. **Press F12** → Console tab

3. **Paste this code** (replace with your actual backend URL):

```javascript
fetch('https://hrms-backend-xxxx.onrender.com/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Admin User',
    email: 'admin@company.com',
    password: 'Admin@123',
    role: 'ADMIN'
  })
})
.then(r => r.json())
.then(d => alert('✅ Admin created!\n\nEmail: admin@company.com\nPassword: Admin@123'))
.catch(e => alert('❌ Error: ' + e.message));
```

4. **Press Enter** and wait for success message

---

### STEP 2: Login and Test

1. **Login with:**
   - Email: `admin@company.com`
   - Password: `Admin@123`

2. **Test features:**
   - ✅ Dashboard loads
   - ✅ Can create employees
   - ✅ Can view reports
   - ✅ All features work

---

## 👥 PART 4: SHARE WITH YOUR TEAM

### Create User Accounts for Your Team

You can create accounts in two ways:

#### Option A: Using Admin Panel (Recommended)
1. Login as admin
2. Go to "Employees" or "Users" section
3. Click "Add Employee"
4. Fill in details and create account

#### Option B: Using Browser Console
Use the same fetch code from Part 3, Step 1, but change:
- `name`: Employee's full name
- `email`: Employee's email
- `password`: Temporary password (they can change later)
- `role`: `EMPLOYEE`, `HR`, or `ADMIN`

---

### Share Access with Team

Send this to your team members:

```
🎉 Welcome to HRMS!

Access the system here:
https://hrms-application.vercel.app

Your login credentials:
Email: [their-email@company.com]
Password: [temporary-password]

Please change your password after first login.
```

---

## 📊 DEPLOYMENT SUMMARY

| Component | Platform | URL | Status |
|-----------|----------|-----|--------|
| Backend | Render | https://hrms-backend-xxxx.onrender.com | ✅ |
| Frontend | Vercel | https://hrms-application.vercel.app | ✅ |
| Database | MongoDB Atlas | cluster0.aexpf8t.mongodb.net | ✅ |

---

## 🔧 IMPORTANT NOTES

### Free Tier Limitations

**Render Free Tier:**
- ⚠️ Backend sleeps after 15 minutes of inactivity
- ⚠️ First request after sleep takes 30-60 seconds to wake up
- ✅ Unlimited requests when active
- ✅ 750 hours/month free

**Vercel Free Tier:**
- ✅ Always active (no sleep)
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month

**MongoDB Atlas Free Tier:**
- ✅ 512MB storage
- ✅ Shared cluster
- ✅ Perfect for small teams

---

## 🐛 TROUBLESHOOTING

### Backend not responding?
- **Cause:** Render free tier sleeps after inactivity
- **Solution:** Wait 30-60 seconds for first request to wake it up

### CORS errors?
- **Cause:** Backend URL not updated in frontend
- **Solution:** Check `.env.production` has correct backend URL

### Login not working?
- **Cause:** Admin user not created
- **Solution:** Run the fetch code from Part 3, Step 1

### Database connection failed?
- **Cause:** MongoDB Atlas network access
- **Solution:** 
  1. Go to MongoDB Atlas
  2. Network Access → Add `0.0.0.0/0`

---

## 🔄 UPDATING YOUR DEPLOYMENT

When you make code changes:

1. **Commit and push to GitHub:**
```bash
git add .
git commit -m "Your changes"
git push
```

2. **Automatic deployment:**
   - Render will auto-deploy backend (takes 5-10 minutes)
   - Vercel will auto-deploy frontend (takes 2-3 minutes)

---

## 🎯 NEXT STEPS

1. ✅ Deploy backend to Render
2. ✅ Deploy frontend to Vercel
3. ✅ Create admin user
4. ✅ Test all features
5. ✅ Create accounts for team members
6. ✅ Share URL with team

---

## 📞 NEED HELP?

If you get stuck:
1. Check the error message in browser console (F12)
2. Check Render logs (click on your service → Logs tab)
3. Verify all environment variables are set correctly
4. Make sure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)

---

**Ready to deploy? Start with Part 1! 🚀**
