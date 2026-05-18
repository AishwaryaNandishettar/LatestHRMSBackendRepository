# ✅ DEPLOYMENT CHECKLIST - STEP BY STEP

## 🎯 GOAL
Get a URL like `https://your-hrms.vercel.app` that your team can access

---

## 📝 CHECKLIST

### ☐ STEP 1: PUSH TO GITHUB (5 minutes)

```bash
git init
git add .
git commit -m "Ready for deployment"
```

Go to https://github.com/new
- Create repository: `hrms-application`
- Make it Private

```bash
git remote add origin https://github.com/YOUR_USERNAME/hrms-application.git
git branch -M main
git push -u origin main
```

---

### ☐ STEP 2: DEPLOY BACKEND TO RENDER (10 minutes)

1. Go to https://render.com/
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your `hrms-application` repository
5. Configure:
   - Name: `hrms-backend`
   - Root Directory: `HRMS-Backend`
   - Runtime: `Docker`
   - Instance Type: `Free`

6. Add Environment Variables:
```
MONGODB_URI = mongodb+srv://hrms_user:yWkztlbtsW7RGube@cluster0.aexpf8t.mongodb.net/Data_base_hrms?retryWrites=true&w=majority
SPRING_MAIL_USERNAME = aishushettar95@gmail.com
SPRING_MAIL_PASSWORD = bbfskhrhtnujkokk
JWT_SECRET = MyFixedSecretKey123456
PORT = 8080
```

7. Click "Create Web Service"
8. **COPY YOUR BACKEND URL** (e.g., `https://hrms-backend-xxxx.onrender.com`)

---

### ☐ STEP 3: UPDATE FRONTEND CONFIG (2 minutes)

Create file `HRMS-Frontend/.env.production`:

```env
VITE_API_BASE_URL=https://hrms-backend-xxxx.onrender.com
VITE_TURN_USERNAME=51e40078dfabc57d54164c2f
VITE_TURN_CREDENTIAL=KJnavaquyonnUlkx
```

**⚠️ REPLACE** `https://hrms-backend-xxxx.onrender.com` with your actual Render URL!

Push to GitHub:
```bash
git add .
git commit -m "Add production config"
git push
```

---

### ☐ STEP 4: DEPLOY FRONTEND TO VERCEL (5 minutes)

1. Go to https://vercel.com/
2. Sign up with GitHub
3. Click "Add New..." → "Project"
4. Import `hrms-application`
5. Configure:
   - Framework: `Vite`
   - Root Directory: `HRMS-Frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

6. Add Environment Variables:
```
VITE_API_BASE_URL = https://hrms-backend-xxxx.onrender.com
VITE_TURN_USERNAME = 51e40078dfabc57d54164c2f
VITE_TURN_CREDENTIAL = KJnavaquyonnUlkx
```

7. Click "Deploy"
8. **COPY YOUR FRONTEND URL** (e.g., `https://hrms-application.vercel.app`)

---

### ☐ STEP 5: CREATE ADMIN USER (1 minute)

1. Open your frontend URL: `https://hrms-application.vercel.app`
2. Press F12 → Console
3. Paste this (replace with your backend URL):

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
.then(d => alert('✅ Admin created!'))
.catch(e => alert('❌ Error: ' + e.message));
```

---

### ☐ STEP 6: TEST LOGIN (1 minute)

Login with:
- Email: `admin@company.com`
- Password: `Admin@123`

Test that everything works!

---

### ☐ STEP 7: SHARE WITH TEAM

Send this to your team:

```
🎉 Access HRMS here:
https://hrms-application.vercel.app

Your credentials:
Email: [their-email]
Password: [their-password]
```

---

## ✅ DONE!

Your HRMS is now live and accessible to everyone! 🎉

---

## 📊 YOUR DEPLOYMENT URLS

| What | URL |
|------|-----|
| Frontend (Share this!) | https://hrms-application.vercel.app |
| Backend API | https://hrms-backend-xxxx.onrender.com |
| Database | MongoDB Atlas (already configured) |

---

## ⚠️ IMPORTANT NOTES

1. **First load may be slow** - Render free tier sleeps after 15 minutes of inactivity. First request takes 30-60 seconds to wake up.

2. **Always use HTTPS URLs** - Both Render and Vercel provide HTTPS automatically.

3. **Keep your credentials safe** - Don't share admin password publicly.

---

**Need detailed help? Check `DEPLOY_TO_CLOUD_COMPLETE.md`**
