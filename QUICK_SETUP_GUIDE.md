# 🚀 Quick Setup Guide - Release Offer Letter Feature

## ⚡ 5-Minute Setup

### Step 1: Install Frontend Dependencies
```bash
cd HRMS-Frontend
npm install pdf-lib pdfjs-dist
```

### Step 2: Add PDF.js Worker File
Download `pdf.worker.min.js` and place it in `HRMS-Frontend/public/` folder.

**Download Link:** https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js

Or create it manually:
```bash
cd HRMS-Frontend/public
curl -O https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js
```

### Step 3: Restart Backend
```bash
cd HRMS-Backend
mvn clean install
mvn spring-boot:run
```

### Step 4: Restart Frontend
```bash
cd HRMS-Frontend
npm start
```

---

## ✅ Verify Installation

### 1. Check Backend
Open: http://localhost:8080/api/offer-templates/all

Expected: `[]` (empty array, no templates yet)

### 2. Check Frontend
1. Navigate to Recruitment page
2. Set a candidate status to "Selected"
3. Click "📄 Release Offer Letter" button
4. Modal should open with 3 tabs

---

## 🎯 First Test

### Upload Your First Template

1. **Prepare a PDF Template:**
   - Create a simple PDF with placeholders like:
     - `{{candidateName}}`
     - `{{position}}`
     - `{{ctc}}`
   - Or use any existing company offer letter template

2. **Upload:**
   - Click "Release Offer Letter"
   - Go to "Upload Template" tab
   - Fill in:
     - Template Name: "Test Template"
     - Company Name: "Test Company"
   - Select your PDF file
   - Click "Upload Template"

3. **Preview:**
   - System automatically shows preview
   - You should see your PDF rendered as images

4. **Edit:**
   - Go to "Edit Fields" tab
   - Fill in candidate details
   - Click "Update Preview"
   - Check if preview updates

5. **Download:**
   - Click "Download Final PDF"
   - Open downloaded PDF
   - Verify placeholders are replaced

---

## 🐛 Common Issues

### Issue: "pdf.worker.min.js not found"
**Fix:** Download the worker file and place in `/public` folder

### Issue: "Cannot read property 'getDocument' of undefined"
**Fix:** Ensure `pdfjs-dist` is installed: `npm install pdfjs-dist`

### Issue: Backend 404 errors
**Fix:** Ensure backend is running on port 8080

### Issue: CORS errors
**Fix:** Backend already configured for localhost:3000, localhost:5173, and Vercel

---

## 📝 Sample PDF Template

Create a simple Word document with this content, then save as PDF:

```
OFFER LETTER

Dear {{candidateName}},

We are pleased to offer you the position of {{position}} at {{companyName}}.

Position: {{position}}
Department: {{department}}
Location: {{location}}
Joining Date: {{joiningDate}}
CTC: {{ctc}}

Terms:
- Probation Period: {{probationPeriod}}
- Notice Period: {{noticePeriod}}

This offer is valid until: {{offerValidUntil}}

Sincerely,
HR Department
```

---

## 🎉 You're All Set!

The feature is now ready to use. Check the full documentation in `RELEASE_OFFER_LETTER_IMPLEMENTATION.md` for detailed information.

---

## 📞 Need Help?

1. Check browser console for errors
2. Check backend logs
3. Verify MongoDB is running
4. Review `RELEASE_OFFER_LETTER_IMPLEMENTATION.md`
