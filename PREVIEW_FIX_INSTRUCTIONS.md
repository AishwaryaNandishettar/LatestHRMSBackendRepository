# 🔧 Preview Fix - Step by Step Instructions

## 🎯 Problem

The PDF preview is not showing in the modal, but the download is working correctly.

---

## ✅ What I Did

### **1. Added Extensive Logging**
I've added detailed console logs to help diagnose the issue:
- `ReleaseOfferLetterModal.jsx` - Added logs in `loadTemplatePreview()`
- `pdfUtils.js` - Added logs in `renderPdfToImages()`

### **2. Created Test Page**
I've created a test page to verify PDF rendering works:
- `HRMS-Frontend/public/test-pdf-rendering.html`

### **3. Created Troubleshooting Guide**
- `TROUBLESHOOTING_PREVIEW_ISSUE.md` - Complete troubleshooting guide

---

## 🚀 How to Fix

### **Step 1: Test PDF Rendering**

1. **Start your backend** (if not running):
   ```bash
   cd e:\HRMSProject\HRMS-Backend
   mvn spring-boot:run
   ```

2. **Start your frontend** (if not running):
   ```bash
   cd e:\HRMSProject\HRMS-Frontend
   npm run dev
   ```

3. **Open test page**:
   - Go to: `http://localhost:5176/test-pdf-rendering.html`
   - Click "Run Full Test" button
   - Watch the logs

4. **Check results**:
   - ✅ If all tests pass: PDF rendering works, issue is in the modal
   - ❌ If tests fail: Note which step fails and the error message

---

### **Step 2: Check Browser Console**

1. **Open your application**:
   - Go to: `http://localhost:5176/recruitment`

2. **Open Developer Tools**:
   - Press `F12`
   - Click "Console" tab

3. **Click "Release Offer Letter"** button

4. **Upload Hero FinCorp template**

5. **Watch console logs**:
   - You should see detailed logs like:
   ```
   === Loading Template Preview ===
   Template ID: 6a0096d92ba292439b9db446
   Preview response: { hasData: true, hasPdfBase64: true, ... }
   Converting base64 to ArrayBuffer...
   ArrayBuffer created, size: 184258
   Rendering PDF pages...
   === renderPdfToImages called ===
   PDF data type: ArrayBuffer
   PDF data size: 184258
   PDF.js library loaded
   ...
   ```

6. **Copy any errors** and share with me

---

### **Step 3: Verify Backend**

1. **Check backend is running**:
   - Go to: `http://localhost:8080/api/offer-templates-simple/test`
   - Should see: `{"status":"success","message":"API is working!","mongoTemplate":"Connected"}`

2. **Check templates exist**:
   - Go to: `http://localhost:8080/api/offer-templates-simple/all`
   - Should see list of templates

3. **Check template preview**:
   - Copy template ID from step 2
   - Go to: `http://localhost:8080/api/offer-templates-simple/preview/[PASTE_ID]`
   - Should see JSON with `pdfBase64` field

---

### **Step 4: Common Fixes**

#### **Fix 1: PDF Worker Not Found**

**Symptom**: Console shows "PDF.js worker not found"

**Solution**:
1. Check if file exists: `e:\HRMSProject\HRMS-Frontend\public\pdf.worker.min.js`
2. If missing, download from: https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js
3. Save to `public` folder
4. Restart frontend server

---

#### **Fix 2: CORS Error**

**Symptom**: Console shows "CORS policy" error

**Solution**:
1. Backend should have `@CrossOrigin(origins = "*")` annotation
2. Check `SecurityConfig.java` has:
   ```java
   .requestMatchers("/api/offer-templates-simple/**").permitAll()
   ```
3. Restart backend

---

#### **Fix 3: Base64 Decode Error**

**Symptom**: Console shows "Failed to execute 'atob'"

**Solution**:
1. Backend is not encoding PDF correctly
2. Check backend logs for errors
3. Re-upload Hero FinCorp template

---

#### **Fix 4: MongoDB Not Connected**

**Symptom**: Backend logs show "MongoDB not configured"

**Solution**:
1. Check `application.properties`:
   ```properties
   spring.data.mongodb.uri=mongodb://localhost:27017/hrms_db
   ```
2. Start MongoDB:
   ```bash
   mongod
   ```
3. Restart backend

---

## 📊 Expected Behavior

### **Preview Tab:**
- Should show Hero FinCorp PDF rendered as images
- Page 1: Offer letter with logo, text
- Page 2: Salary table

### **Edit Tab - Live Preview:**
- Left side: Form with fields
- Right side: PDF preview
- When you type in form, PDF should update (after clicking "Update Preview")

### **Download:**
- Should download PDF with Hero FinCorp branding
- Should have candidate details filled in
- Should be print-ready quality

---

## 🐛 If Still Not Working

### **Share These Details:**

1. **Browser Console Logs**:
   - Copy all logs from console
   - Include any errors (red text)

2. **Test Page Results**:
   - Run test page
   - Copy all logs
   - Note which step fails

3. **Backend Logs**:
   - Check backend console
   - Copy any errors

4. **Network Tab**:
   - Open Developer Tools
   - Click "Network" tab
   - Click "Release Offer Letter"
   - Upload template
   - Find request to `/api/offer-templates-simple/preview/[ID]`
   - Click on it
   - Copy "Response" tab content

5. **Browser Info**:
   - Browser name and version
   - Operating system

---

## 📞 Quick Checklist

Before asking for help, verify:

- [ ] Backend is running (`http://localhost:8080/api/offer-templates-simple/test` works)
- [ ] Frontend is running (`http://localhost:5176` works)
- [ ] MongoDB is running
- [ ] `pdf.worker.min.js` exists in `public` folder
- [ ] Browser console shows no CORS errors
- [ ] Test page works (`http://localhost:5176/test-pdf-rendering.html`)
- [ ] Backend API returns `pdfBase64` in response
- [ ] Template is uploaded successfully

---

## 🎯 Next Steps

1. **Run test page**: `http://localhost:5176/test-pdf-rendering.html`
2. **Check console logs**: Look for errors
3. **Verify backend**: Check API responses
4. **Share results**: Copy logs and share with me

---

**Files Modified:**
- ✅ `ReleaseOfferLetterModal.jsx` - Added logging
- ✅ `pdfUtils.js` - Added logging

**Files Created:**
- ✅ `test-pdf-rendering.html` - Test page
- ✅ `TROUBLESHOOTING_PREVIEW_ISSUE.md` - Troubleshooting guide
- ✅ `PREVIEW_FIX_INSTRUCTIONS.md` - This file

---

**Status**: 🔧 Debugging in progress  
**Next**: Run test page and share console logs
