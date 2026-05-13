# 🔧 Troubleshooting - Preview Not Showing Issue

## 🎯 Problem Summary

You're experiencing these issues:
1. **Preview Tab**: Not showing Hero FinCorp PDF template (shows "No preview available")
2. **Edit Tab - Live Preview**: Not showing the PDF with changes
3. **Backend**: Saving data incorrectly (all fields concatenated)
4. **Downloaded PDF**: Working correctly ✅ (shows Hero FinCorp template with data)

---

## 🔍 Root Cause Analysis

### **Issue 1: Preview Not Rendering**

**Symptoms:**
- Preview tab shows "No preview available"
- Live preview in Edit tab is empty
- Console shows no errors (or shows PDF.js errors)

**Possible Causes:**
1. PDF.js worker not loading correctly
2. Base64 conversion issue
3. PDF rendering failing silently
4. Browser compatibility issue

**Solution:**
I've added extensive logging to help diagnose the issue. Follow these steps:

---

## 🚀 Step-by-Step Fix

### **Step 1: Check Browser Console**

1. Open your browser (Chrome/Edge)
2. Press `F12` to open Developer Tools
3. Click "Console" tab
4. Click "Release Offer Letter" button
5. Upload Hero FinCorp template
6. Look for these logs:

```
Expected logs:
=== Loading Template Preview ===
Template ID: 6a0096d92ba292439b9db446
Preview response: { hasData: true, hasPdfBase64: true, base64Length: 245678, status: "success" }
Converting base64 to ArrayBuffer...
ArrayBuffer created, size: 184258
Rendering PDF pages...
=== renderPdfToImages called ===
PDF data type: ArrayBuffer
PDF data size: 184258
PDF.js library loaded
Uint8Array created, length: 184258
Loading PDF document...
PDF loaded successfully!
Number of pages: 2
Rendering page 1/2...
Page 1 viewport: { width: 595, height: 842 }
Page 1 rendered successfully, data URL length: 123456
Rendering page 2/2...
Page 2 viewport: { width: 595, height: 842 }
Page 2 rendered successfully, data URL length: 123456
=== All pages rendered successfully ===
Total images: 2
PDF rendered successfully!
Number of pages: 2
```

**If you see errors**, copy them and I'll help fix them.

---

### **Step 2: Check PDF Worker**

The PDF.js library needs a worker file to render PDFs.

**Check if worker exists:**
1. Open: `e:\HRMSProject\HRMS-Frontend\public\pdf.worker.min.js`
2. File should exist and be ~500KB

**If file is missing:**
1. Download from: https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js
2. Save to: `e:\HRMSProject\HRMS-Frontend\public\pdf.worker.min.js`

---

### **Step 3: Verify Backend Response**

**Test the API directly:**

1. Open browser
2. Go to: `http://localhost:8080/api/offer-templates-simple/all`
3. You should see:
```json
[
  {
    "id": "6a0096d92ba292439b9db446",
    "templateName": "Hero Fincorp Template",
    "companyName": "Hero Fincorp",
    "uploadedBy": "Admin",
    "uploadedAt": "2026-05-10T14:37:31.942Z",
    "description": "standard company of hero Fincorp template",
    "isActive": true
  }
]
```

4. Copy the `id` value
5. Go to: `http://localhost:8080/api/offer-templates-simple/preview/[PASTE_ID_HERE]`
6. You should see:
```json
{
  "status": "success",
  "templateName": "Hero Fincorp Template",
  "companyName": "Hero Fincorp",
  "pdfBase64": "JVBERi0xLjQKJeLjz9MKMyAwIG9iago8PC9UeXBlL..." (very long string)
}
```

**If you don't see `pdfBase64`**, the backend is not returning the PDF data correctly.

---

### **Step 4: Check Network Tab**

1. Open Developer Tools (F12)
2. Click "Network" tab
3. Click "Release Offer Letter" button
4. Upload template
5. Look for request to `/api/offer-templates-simple/preview/[ID]`
6. Click on it
7. Check "Response" tab
8. You should see JSON with `pdfBase64` field

**If response is empty or error:**
- Backend is not working correctly
- Check backend console logs

---

### **Step 5: Test PDF Rendering Manually**

Open browser console and run this test:

```javascript
// Test PDF.js loading
import('pdfjs-dist').then(pdfjsLib => {
  console.log('PDF.js loaded:', pdfjsLib);
  console.log('Worker:', pdfjsLib.GlobalWorkerOptions.workerSrc);
});

// Test rendering
async function testPdfRendering() {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
  
  // Get template from API
  const response = await fetch('http://localhost:8080/api/offer-templates-simple/preview/6a0096d92ba292439b9db446');
  const data = await response.json();
  
  console.log('Got response:', data);
  
  // Convert base64 to ArrayBuffer
  const base64 = data.pdfBase64;
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  console.log('ArrayBuffer created:', bytes.buffer);
  
  // Load PDF
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
  console.log('PDF loaded, pages:', pdf.numPages);
  
  // Render first page
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 1.5 });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  document.body.appendChild(canvas);
  
  await page.render({ 
    canvasContext: canvas.getContext('2d'), 
    viewport 
  }).promise;
  
  console.log('Page rendered!');
}

testPdfRendering();
```

---

## 🐛 Common Issues & Solutions

### **Issue 1: "PDF.js worker not found"**

**Error:**
```
Uncaught Error: Setting up fake worker failed: "Cannot read properties of undefined (reading 'WorkerMessageHandler')".
```

**Solution:**
1. Check if `pdf.worker.min.js` exists in `public` folder
2. Verify worker path in `pdfUtils.js`:
```javascript
_pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
```
3. Restart frontend server

---

### **Issue 2: "Invalid PDF structure"**

**Error:**
```
Error: Invalid PDF structure
```

**Solution:**
1. PDF file is corrupted
2. Re-upload Hero FinCorp template
3. Verify file is valid PDF (open in Adobe Reader)

---

### **Issue 3: "Base64 decode failed"**

**Error:**
```
DOMException: Failed to execute 'atob' on 'Window': The string to be decoded is not correctly encoded.
```

**Solution:**
1. Backend is not encoding PDF correctly
2. Check backend logs for errors
3. Verify MongoDB is storing binary data correctly

---

### **Issue 4: "Canvas rendering failed"**

**Error:**
```
Error: Canvas rendering failed
```

**Solution:**
1. Browser doesn't support canvas
2. Try different browser (Chrome recommended)
3. Check browser console for WebGL errors

---

## 📊 Backend Data Issue

### **Problem:**
Backend is saving data like this:
```
preview_id6a00982c2ba292439b9db448candidateName"Aishwarya"candidateEmail"aishushettar95@gmail.com"position...
```

This is **incorrect**. It should be:
```json
{
  "_id": "6a00982c2ba292439b9db448",
  "candidateName": "Aishwarya",
  "candidateEmail": "aishushettar95@gmail.com",
  "position": "Frontend Developer",
  ...
}
```

### **Solution:**

Check the `saveOfferLetter` API endpoint in backend. It should save data as JSON object, not concatenated string.

**File to check:** `OfferLetterController.java` or similar

**Expected code:**
```java
@PostMapping("/save")
public ResponseEntity<Map<String, Object>> saveOfferLetter(@RequestBody Map<String, Object> data) {
    // Save as JSON object
    mongoTemplate.save(data, "offer_letters");
    return ResponseEntity.ok(Map.of("status", "success"));
}
```

---

## 🎯 Quick Checklist

- [ ] Browser console shows no errors
- [ ] `pdf.worker.min.js` exists in `public` folder
- [ ] Backend API returns `pdfBase64` in response
- [ ] Network tab shows successful API call
- [ ] PDF.js library is loaded
- [ ] ArrayBuffer is created correctly
- [ ] PDF document loads successfully
- [ ] Pages render to canvas
- [ ] Images are added to state

---

## 🚀 Next Steps

1. **Run the application**
2. **Open browser console** (F12)
3. **Click "Release Offer Letter"**
4. **Upload Hero FinCorp template**
5. **Check console logs**
6. **Copy any errors** and share with me

I've added extensive logging to help diagnose the issue. The logs will tell us exactly where the problem is.

---

## 📞 If Still Not Working

Share these details:
1. **Browser console logs** (copy all logs)
2. **Network tab** (screenshot of API response)
3. **Backend console logs** (if any errors)
4. **Browser version** (Chrome/Edge/Firefox)

---

**Status**: 🔧 Troubleshooting in progress  
**Next**: Check browser console logs and share results
