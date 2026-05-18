# 👤 HOW TO CREATE ADMIN USER

## 📍 WHERE TO ADD THE FETCH CODE

You asked: "where to add this fetch code exactly tell me"

**Answer: In the BROWSER CONSOLE, not in any file!**

---

## 🎯 STEP-BY-STEP INSTRUCTIONS

### STEP 1: Start Your Application

**For Localhost:**
1. Start backend: `cd HRMS-Backend && mvn spring-boot:run`
2. Start frontend: `cd HRMS-Frontend && npm run dev`
3. Open browser: `http://localhost:5173`

**For Production:**
1. Just open: `https://hrmsbackendfrontendapp.vercel.app`

---

### STEP 2: Open Browser Console

**Method 1: Keyboard Shortcut**
- Press `F12` key

**Method 2: Right Click**
- Right-click anywhere on the page
- Click "Inspect" or "Inspect Element"
- Click on "Console" tab

**Method 3: Menu**
- Chrome: Menu → More Tools → Developer Tools → Console
- Firefox: Menu → Web Developer → Web Console
- Edge: Menu → More Tools → Developer Tools → Console

---

### STEP 3: Paste the Code

**For Localhost (http://localhost:5173):**
```javascript
fetch('http://localhost:8082/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Admin User',
    email: 'admin@hrms.com',
    password: 'Admin@123',
    role: 'ADMIN'
  })
})
.then(r => r.json())
.then(d => {
  console.log('✅ User created:', d);
  alert('✅ Admin user created successfully!\n\nEmail: admin@hrms.com\nPassword: Admin@123\n\nYou can now login!');
})
.catch(e => {
  console.error('❌ Error:', e);
  alert('❌ Error: ' + e.message + '\n\nThe user might already exist or backend is not responding.');
});
```

**For Production (https://hrmsbackendfrontendapp.vercel.app):**
```javascript
fetch('https://hrms-backend-final-ixpy.onrender.com/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Admin User',
    email: 'admin@hrms.com',
    password: 'Admin@123',
    role: 'ADMIN'
  })
})
.then(r => r.json())
.then(d => {
  console.log('✅ User created:', d);
  alert('✅ Admin user created successfully!\n\nEmail: admin@hrms.com\nPassword: Admin@123\n\nYou can now login!');
})
.catch(e => {
  console.error('❌ Error:', e);
  alert('❌ Error: ' + e.message + '\n\nThe user might already exist or backend is not responding.');
});
```

---

### STEP 4: Press Enter

After pasting the code, press `Enter` key.

---

### STEP 5: Check Result

**Success:**
- You'll see an alert: "✅ Admin user created successfully!"
- Console will show: `✅ User created: {name: "Admin User", email: "admin@hrms.com", ...}`

**Error:**
- Alert will show error message
- Check if backend is running
- Check if MongoDB is connected

---

### STEP 6: Login

Now you can login with:
- **Email**: `admin@hrms.com`
- **Password**: `Admin@123`

---

## 🖼️ VISUAL GUIDE

```
┌─────────────────────────────────────────┐
│  HRMS Login Page                        │
│  ┌───────────────────────────────────┐  │
│  │ Email: [                        ] │  │
│  │ Password: [                     ] │  │
│  │ [Login Button]                    │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Press F12 ↓                            │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Developer Tools                 │   │
│  │ ┌─────────────────────────────┐ │   │
│  │ │ Console                     │ │   │
│  │ │ > fetch('http://...         │ │   │
│  │ │   Paste code here ←         │ │   │
│  │ │   Press Enter ←             │ │   │
│  │ └─────────────────────────────┘ │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## ❓ FREQUENTLY ASKED QUESTIONS

### Q: Do I need to create a new file?
**A:** No! Just paste in browser console.

### Q: Which browser should I use?
**A:** Any modern browser (Chrome, Firefox, Edge, Safari).

### Q: Can I create multiple admin users?
**A:** Yes, just change the email in the code.

### Q: What if I get "user already exists" error?
**A:** That's fine! It means the user was already created. Just login.

### Q: Can I create users with different roles?
**A:** Yes! Change `role: 'ADMIN'` to `role: 'HR'` or `role: 'EMPLOYEE'`

---

## 🔧 TROUBLESHOOTING

### Error: "Failed to fetch"
- **Cause**: Backend is not running
- **Solution**: Start backend server first

### Error: "CORS policy"
- **Cause**: Backend CORS not configured
- **Solution**: Already fixed! Just push code to GitHub

### Error: "Network error"
- **Cause**: Wrong backend URL
- **Solution**: Check if backend URL is correct in fetch code

### Error: "User already exists"
- **Cause**: User was already created
- **Solution**: Just login with existing credentials

---

## 📝 ALTERNATIVE METHOD: Use HTML File

If you prefer, you can also use the `create-admin-user.html` file:

1. Open `create-admin-user.html` in browser
2. Update the backend URL if needed
3. Click "Create Admin User" button

---

## ✅ SUCCESS CHECKLIST

- [ ] Backend is running
- [ ] Frontend is open in browser
- [ ] Pressed F12 to open console
- [ ] Pasted the fetch code
- [ ] Pressed Enter
- [ ] Saw success alert
- [ ] Can login with admin@hrms.com

---

**🎉 That's it! The fetch code goes in the BROWSER CONSOLE, not in any file!**
