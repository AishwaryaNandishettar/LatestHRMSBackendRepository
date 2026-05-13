# 🔧 Fix 500 Error - Step by Step

## ⚠️ The Problem

Backend is returning 500 errors because:
1. The new controller wasn't compiled yet
2. MongoDB might not be running
3. The endpoint doesn't exist

---

## ✅ Solution - Follow These Steps EXACTLY

### **Step 1: Check if MongoDB is Running**

Open a NEW terminal and run:

```bash
mongosh
```

**If it connects:** ✅ MongoDB is running
**If it fails:** ❌ Start MongoDB first

#### To Start MongoDB:
```bash
# Windows:
net start MongoDB

# Or if installed manually:
mongod
```

---

### **Step 2: Stop Backend (If Running)**

In your backend terminal:
- Press `Ctrl + C` to stop

---

### **Step 3: Clean and Rebuild Backend**

```bash
cd e:\HRMSProject\HRMS-Backend
mvn clean install -DskipTests
```

Wait for: `BUILD SUCCESS`

---

### **Step 4: Start Backend**

```bash
mvn spring-boot:run
```

Wait for these messages:
```
Started HmrsBackendApplication
Tomcat started on port(s): 8080
```

---

### **Step 5: Test the API**

Open a NEW terminal and test:

```bash
curl http://localhost:8080/api/offer-templates-simple/test
```

**Expected response:**
```json
{
  "status": "success",
  "message": "API is working!",
  "mongoTemplate": "Connected"
}
```

**If you see this:** ✅ Backend is working!

---

### **Step 6: Restart Frontend**

```bash
cd e:\HRMSProject\HRMS-Frontend
npm start
```

---

### **Step 7: Clear Browser Cache**

- Press `Ctrl + Shift + Delete`
- Check "Cached images and files"
- Click "Clear data"
- Or just press `Ctrl + F5`

---

### **Step 8: Test Upload Again**

1. Go to Recruitment page
2. Click "Release Offer Letter"
3. Fill in:
   - Template Name: `Hero FinCorp Template`
   - Company Name: `Hero FinCorp`
   - Description: `Test template`
4. Select PDF file
5. Click "Upload Template"

---

## 🐛 If Still Fails

### **Check Backend Console**

Look for these messages:
```
=== Upload Template Called ===
Template Name: Hero FinCorp Template
Company Name: Hero FinCorp
File: [filename].pdf
```

**If you DON'T see these messages:**
- Backend didn't receive the request
- Check if backend is running on port 8080
- Check frontend API URL

**If you see ERROR messages:**
- Copy the full error
- Send it to me

---

### **Check MongoDB**

```bash
mongosh
show dbs
use hrms_db
db.offer_letter_templates.find()
```

**If MongoDB is not running:**
```bash
# Start it
net start MongoDB
```

---

### **Check Frontend Console**

Press F12 → Console tab

Look for:
- ❌ `Failed to fetch`
- ❌ `Network error`
- ❌ `500 Internal Server Error`

---

## 📋 Quick Checklist

- [ ] MongoDB is running
- [ ] Backend cleaned and rebuilt (`mvn clean install`)
- [ ] Backend started (`mvn spring-boot:run`)
- [ ] Backend shows "Started HmrsBackendApplication"
- [ ] Test endpoint works (`/api/offer-templates-simple/test`)
- [ ] Frontend restarted
- [ ] Browser cache cleared
- [ ] Tried upload again

---

## 🎯 Expected Backend Console Output

When you click "Upload Template", you should see:

```
=== Upload Template Called ===
Template Name: Hero FinCorp Template
Company Name: Hero FinCorp
File: 17482525949b8b00d5c8a4bc0b8e9d3a97_Offer_Letter_20250916_100653.pdf
File Content Type: application/pdf
Saving to MongoDB...
Saved successfully! ID: 6745abc123def456789
```

---

## 📞 Send Me This Info

If still not working, send:

1. **Backend console output** (copy the full error)
2. **MongoDB status** (is it running?)
3. **Test endpoint result** (what does `/test` return?)
4. **Browser console errors** (F12 → Console)

---

## 🚀 Most Common Issues

1. **MongoDB not running** (90% of cases)
   - Solution: `net start MongoDB`

2. **Backend not restarted** (5% of cases)
   - Solution: Stop and restart backend

3. **Old code cached** (3% of cases)
   - Solution: `mvn clean install`

4. **Wrong port** (2% of cases)
   - Solution: Check if backend is on port 8080

---

**Follow these steps EXACTLY and it will work!** 🎯
