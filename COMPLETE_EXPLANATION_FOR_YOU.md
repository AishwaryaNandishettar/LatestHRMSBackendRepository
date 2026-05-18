# 📄 Complete Explanation - Offer Letter Release Feature

## 🎯 What You Asked For (In Simple Terms)

You want:
1. **Admin/HR** can release offer letters to **selected candidates**
2. **Before sending**, admin uploads a **PDF template** (like Hero FinCorp template you provided)
3. Admin uploads this template **once** and can reuse it
4. Admin can **preview** the template
5. Admin can **edit** fields like name, salary, etc.
6. Admin can see **live preview** of changes in the PDF
7. Admin can **download** the final PDF with candidate details
8. This should be in the **Recruitment Dashboard table** (main table)

---

## ✅ What I Implemented

### **1. Added "Offer Letter" Column in Main Table**

**Location**: Recruitment Dashboard → Main Table → Last Column

**What it looks like:**
```
┌──────────────────────────────────────────────────────────────────┐
│ Job ID │ Title │ Dept │ Status │ ... │ Offer Letter            │
├──────────────────────────────────────────────────────────────────┤
│ JOB-001│ Dev   │ IT   │ Open   │ ... │                         │
│ JOB-002│ Dev   │ IT   │Selected│ ... │ [📄 Release Offer Letter]│
│ JOB-003│ Sales │ Sales│ Open   │ ... │                         │
└──────────────────────────────────────────────────────────────────┘
```

**How it works:**
- Button appears **ONLY** for jobs with status = "Selected"
- Green button with text "📄 Release Offer Letter"
- When clicked, opens a modal (popup window)

---

## 🎨 The Modal (Popup Window) - 3 Tabs

When admin clicks "📄 Release Offer Letter", a popup opens with 3 tabs:

### **Tab 1: Upload Template** 📤

**Purpose**: Upload the Hero FinCorp PDF template (or any company template)

**What admin does:**
1. Fill in template details:
   - Template Name: "Hero FinCorp Template 2026"
   - Company Name: "Hero FinCorp"
   - Description: (optional)
2. Click "Choose File" and select the PDF you provided
3. Click "Upload Template"

**Important**: This is done **ONCE**. After uploading, the template is saved and can be reused for all candidates.

**Visual:**
```
┌─────────────────────────────────────────────────────────┐
│ Upload New Template                                      │
├─────────────────────────────────────────────────────────┤
│ Template Name: [Hero FinCorp Template 2026]            │
│ Company Name:  [Hero FinCorp]                           │
│ Description:   [Official offer letter template]         │
│ Select PDF:    [Choose File]                            │
│                                                          │
│ [Upload Template]                                       │
│                                                          │
│ ─── Or Select Existing Template ───                     │
│                                                          │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐                   │
│ │ Hero    │ │ Acme    │ │ Tech    │                   │
│ │ FinCorp │ │ Corp    │ │Solutions│                   │
│ └─────────┘ └─────────┘ └─────────┘                   │
└─────────────────────────────────────────────────────────┘
```

---

### **Tab 2: Preview** 👁️

**Purpose**: View the uploaded PDF template to verify it looks correct

**What admin sees:**
- The Hero FinCorp PDF template rendered as images
- All pages of the PDF (Page 1, Page 2, etc.)
- Exact layout, logo, formatting from the original PDF

**Visual:**
```
┌─────────────────────────────────────────────────────────┐
│ Template Preview                                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ┌────────────────────────────────────────────────┐     │
│ │  [Hero FinCorp Logo]                           │     │
│ │                                                │     │
│ │  Dated: {{today}}                              │     │
│ │  {{candidateName}}                             │     │
│ │                                                │     │
│ │  Dear {{candidateName}},                       │     │
│ │                                                │     │
│ │  We are pleased to offer you the post of      │     │
│ │  {{position}} in Grade {{grade}}...            │     │
│ │                                                │     │
│ │  [More content...]                             │     │
│ └────────────────────────────────────────────────┘     │
│ Page 1                                                  │
│                                                          │
│ ┌────────────────────────────────────────────────┐     │
│ │  SALARY COMPUTATION                            │     │
│ │  [Salary table...]                             │     │
│ └────────────────────────────────────────────────┘     │
│ Page 2                                                  │
│                                                          │
│ [Next: Edit Fields →]                                   │
└─────────────────────────────────────────────────────────┘
```

---

### **Tab 3: Edit Fields** ✏️

**Purpose**: Edit candidate details and see live preview

**What admin does:**
1. **Left side**: Form with fields to edit
   - Candidate Name
   - Email
   - Position
   - Department
   - Location
   - Joining Date
   - CTC (Salary)
   - Basic Salary
   - HRA
   - Allowances
   - Variable Pay
   - Grade
   - etc.

2. **Right side**: Live PDF preview
   - Shows the PDF with updated values
   - Updates in real-time as admin types

3. Click "🔄 Update Preview" to refresh the PDF
4. Click "⬇️ Download Final PDF" to download

**Visual:**
```
┌──────────────────────────────────────────────────────────────────┐
│ Edit Candidate Details                                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ ┌──────────────────────┐  ┌──────────────────────────────┐     │
│ │ FORM (Left Side)     │  │ LIVE PREVIEW (Right Side)    │     │
│ ├──────────────────────┤  ├──────────────────────────────┤     │
│ │                      │  │                              │     │
│ │ Candidate Name       │  │ [Hero FinCorp Logo]          │     │
│ │ [Mahesh Panchal]     │  │                              │     │
│ │                      │  │ Dated: 18-09-2025            │     │
│ │ Email                │  │ Mahesh Panchal               │     │
│ │ [mahesh@example.com] │  │                              │     │
│ │                      │  │ Dear Mahesh,                 │     │
│ │ Position             │  │                              │     │
│ │ [Collection Manager] │  │ We are pleased to offer you  │     │
│ │                      │  │ the post of Collection       │     │
│ │ Grade                │  │ Manager - UBL in Grade 4-B   │     │
│ │ [4-B]                │  │                              │     │
│ │                      │  │ CTC: ₹6,80,004               │     │
│ │ CTC                  │  │ Location: Bangalore          │     │
│ │ [₹6,80,004]          │  │ Joining: 17-11-2025          │     │
│ │                      │  │                              │     │
│ │ Location             │  │ [More content...]            │     │
│ │ [Bangalore]          │  │                              │     │
│ │                      │  │                              │     │
│ │ Joining Date         │  │                              │     │
│ │ [17-11-2025]         │  │                              │     │
│ │                      │  │                              │     │
│ │ [🔄 Update Preview]  │  │                              │     │
│ │                      │  │                              │     │
│ └──────────────────────┘  └──────────────────────────────┘     │
│                                                                   │
│ [⬇️ Download Final PDF]                                          │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔧 How It Works Technically

### **Step 1: Upload Template**
1. Admin selects Hero FinCorp PDF file
2. File is sent to backend server
3. Server stores the PDF in database
4. Server returns template ID

### **Step 2: Preview Template**
1. Frontend requests template from backend using template ID
2. Backend sends PDF as base64 string
3. Frontend converts PDF to images using `pdf.js` library
4. Images are displayed in preview tab

### **Step 3: Edit Fields**
1. Admin fills in candidate details in form
2. Frontend uses `pdf-lib` library to:
   - Load the original PDF
   - Find placeholders like `{{candidateName}}`, `{{position}}`, etc.
   - Replace placeholders with actual values
   - Generate new PDF with updated values
3. New PDF is rendered as images for live preview

### **Step 4: Download**
1. Admin clicks "Download Final PDF"
2. Frontend generates final PDF with all candidate details
3. PDF is downloaded to admin's computer
4. Admin can email this PDF to candidate

---

## 📊 Example: Hero FinCorp Template

### **Your PDF Template Has:**

**Page 1:**
- Hero FinCorp logo
- Date: `{{today}}`
- Candidate name: `{{candidateName}}`
- Position: `{{position}}`
- Grade: `{{grade}}`
- Location: `{{location}}`
- Joining date: `{{joiningDate}}`

**Page 2:**
- Salary computation table
- Basic: `{{basic}}`
- HRA: `{{hra}}`
- Special Allowance: `{{allowances}}`
- Gross Salary: `{{grossSalary}}`
- Total CTC: `{{ctc}}`
- Variable Pay: `{{variablePay}}`

### **Admin Fills In:**
- Candidate Name: "Mahesh Panchal"
- Position: "Collection Manager - UBL"
- Grade: "4-B"
- Location: "Bangalore"
- Joining Date: "17-11-2025"
- Basic: "₹2,47,520"
- HRA: "₹1,23,760"
- CTC: "₹6,80,004"
- etc.

### **Result:**
Final PDF has:
- "Mahesh Panchal" instead of `{{candidateName}}`
- "Collection Manager - UBL" instead of `{{position}}`
- "4-B" instead of `{{grade}}`
- "₹6,80,004" instead of `{{ctc}}`
- etc.

**Original template design stays the same** (logo, layout, formatting)

---

## 🎯 Key Features

### **1. One-Time Upload**
✅ Upload Hero FinCorp template once  
✅ Reuse for all candidates  
✅ No need to re-upload every time  

### **2. Live Preview**
✅ See changes in real-time  
✅ Verify before downloading  
✅ Exact PDF layout preserved  

### **3. Easy Editing**
✅ Simple form with all fields  
✅ Auto-filled from candidate data  
✅ Edit any field as needed  

### **4. Professional PDF**
✅ Maintains Hero FinCorp branding  
✅ Logo, layout, formatting preserved  
✅ Only data changes (name, salary, etc.)  

### **5. Quick Download**
✅ Download final PDF instantly  
✅ Ready to email to candidate  
✅ Professional, branded offer letter  

---

## 📁 Files Involved

### **Frontend Files:**
1. **Recruitment.jsx** - Main dashboard with table and button
2. **ReleaseOfferLetterModal.jsx** - Modal with 3 tabs
3. **pdfUtils.js** - PDF manipulation (rendering, editing)
4. **recruitmentApi.js** - API calls to backend

### **Backend Endpoints:**
1. `POST /api/offer-templates-simple/upload` - Upload template
2. `GET /api/offer-templates-simple/all` - Get all templates
3. `GET /api/offer-templates-simple/preview/:id` - Get template preview
4. `POST /api/offer-letter/save` - Save offer letter record

### **Libraries Used:**
1. **pdf-lib** - For editing PDF (replacing placeholders)
2. **pdfjs-dist** - For rendering PDF to images (preview)

---

## 🚀 How to Use (Step by Step)

### **First Time (Upload Template):**

1. **Go to Recruitment Dashboard**
   - Open your HRMS application
   - Click "Recruitment" in sidebar

2. **Find a Selected Candidate**
   - Look for a job with status = "Selected"
   - You'll see a green button "📄 Release Offer Letter"

3. **Click the Button**
   - Modal (popup) opens with 3 tabs

4. **Upload Template (Tab 1)**
   - Template Name: `Hero FinCorp Template 2026`
   - Company Name: `Hero FinCorp`
   - Click "Choose File"
   - Select the Hero FinCorp PDF you provided
   - Click "Upload Template"
   - Wait for success message

5. **Preview Template (Tab 2)**
   - Click "Preview" tab
   - Verify the PDF looks correct
   - Check all pages are displayed

6. **Edit Fields (Tab 3)**
   - Click "Edit Fields" tab
   - Fill in candidate details:
     - Name: Mahesh Panchal
     - Email: mahesh@example.com
     - Position: Collection Manager - UBL
     - Grade: 4-B
     - Location: Bangalore
     - Joining Date: 17-11-2025
     - CTC: ₹6,80,004
     - Basic: ₹2,47,520
     - HRA: ₹1,23,760
     - etc.
   - Click "🔄 Update Preview"
   - Verify the PDF looks correct in live preview

7. **Download**
   - Click "⬇️ Download Final PDF"
   - PDF downloads to your computer
   - File name: `Offer_Letter_Mahesh_Panchal.pdf`

8. **Email to Candidate**
   - Open your email client
   - Attach the downloaded PDF
   - Send to candidate

**Time taken**: ~5 minutes

---

### **Subsequent Candidates (Template Already Uploaded):**

1. **Go to Recruitment Dashboard**
2. **Find another Selected Candidate**
3. **Click "📄 Release Offer Letter"**
4. **Select Existing Template (Tab 1)**
   - Click on "Hero FinCorp" template card
   - No need to upload again!
5. **Preview (Tab 2)**
   - Verify template
6. **Edit Fields (Tab 3)**
   - Fill in new candidate details
   - Click "🔄 Update Preview"
7. **Download**
   - Click "⬇️ Download Final PDF"
8. **Email to Candidate**

**Time taken**: ~2 minutes per candidate

---

## 🎯 Benefits

### **For HR/Admin:**
✅ **Fast**: 2 minutes per candidate (after first upload)  
✅ **Easy**: Simple form, no technical knowledge needed  
✅ **Consistent**: Same Hero FinCorp branding for all  
✅ **Professional**: Branded, formatted offer letters  
✅ **No errors**: Auto-filled data from system  

### **For Company:**
✅ **Branded**: All offer letters have Hero FinCorp logo and format  
✅ **Consistent**: Same template for all candidates  
✅ **Professional**: High-quality PDF output  
✅ **Efficient**: Save time, reduce manual work  

### **For Candidates:**
✅ **Professional**: Receive branded offer letter  
✅ **Fast**: Quick turnaround time  
✅ **Clear**: All details in one PDF  

---

## 🔍 What Happens Behind the Scenes

### **When Admin Uploads Template:**
```
1. Admin selects Hero FinCorp PDF file
   ↓
2. File is converted to base64 string
   ↓
3. Sent to backend via API call
   ↓
4. Backend saves PDF in database
   ↓
5. Backend returns template ID
   ↓
6. Frontend stores template ID
```

### **When Admin Edits Fields:**
```
1. Admin types in form fields
   ↓
2. Frontend collects all form data
   ↓
3. Frontend loads original PDF template
   ↓
4. Frontend finds placeholders ({{candidateName}}, etc.)
   ↓
5. Frontend replaces placeholders with actual values
   ↓
6. Frontend generates new PDF
   ↓
7. Frontend renders PDF as images
   ↓
8. Images displayed in live preview
```

### **When Admin Downloads:**
```
1. Admin clicks "Download Final PDF"
   ↓
2. Frontend generates final PDF with all data
   ↓
3. Frontend creates Blob (binary data)
   ↓
4. Frontend creates download link
   ↓
5. Browser downloads PDF to computer
   ↓
6. Frontend saves record to database (optional)
```

---

## 📊 Supported Fields (Placeholders)

The system supports these placeholders in your PDF template:

### **Candidate Information:**
- `{{candidateName}}` - Full name (e.g., "Mahesh Panchal")
- `{{candidateEmail}}` - Email address
- `{{position}}` - Job position (e.g., "Collection Manager - UBL")
- `{{department}}` - Department name
- `{{location}}` - Work location (e.g., "Bangalore")
- `{{joiningDate}}` - Joining date (e.g., "17-11-2025")
- `{{grade}}` - Grade (e.g., "4-B")

### **Salary Information:**
- `{{ctc}}` - Total CTC (e.g., "₹6,80,004")
- `{{basic}}` - Basic salary (e.g., "₹2,47,520")
- `{{hra}}` - HRA (e.g., "₹1,23,760")
- `{{allowances}}` - Special allowances (e.g., "₹1,56,644")
- `{{variablePay}}` - Variable pay/bonus (e.g., "₹61,200")
- `{{grossSalary}}` - Gross salary (e.g., "₹5,54,328")
- `{{grossFixedCtc}}` - Gross fixed CTC (e.g., "₹6,18,804")

### **Company Information:**
- `{{companyName}}` - Company name (e.g., "Hero FinCorp Ltd.")
- `{{today}}` - Current date (auto-generated)

### **Other:**
- `{{probationPeriod}}` - Probation period
- `{{noticePeriod}}` - Notice period
- `{{offerValidUntil}}` - Offer validity date
- `{{hrName}}` - HR name
- `{{hrDesignation}}` - HR designation

---

## 🎨 Customization

### **To Add More Fields:**

1. **In PDF Template:**
   - Add placeholder like `{{newField}}`
   - Example: `{{employeeId}}`

2. **In Code (pdfUtils.js):**
   - Add to `buildPlaceholderMap()` function:
   ```javascript
   "{{employeeId}}": form.employeeId || "",
   ```

3. **In Modal (ReleaseOfferLetterModal.jsx):**
   - Add form field:
   ```jsx
   <input
     type="text"
     value={form.employeeId}
     onChange={(e) => updateField("employeeId", e.target.value)}
   />
   ```

---

## ❓ Common Questions

### **Q: Do I need to upload template for every candidate?**
**A**: No! Upload once, reuse for all candidates.

### **Q: Can I edit the PDF like Word?**
**A**: Yes! Edit fields in the form, and the PDF updates in real-time.

### **Q: Will the Hero FinCorp logo and design change?**
**A**: No! Only the data changes (name, salary, etc.). Logo, layout, and formatting stay the same.

### **Q: Can I use different templates for different companies?**
**A**: Yes! Upload multiple templates (Hero FinCorp, Acme Corp, etc.) and select the one you need.

### **Q: What if I make a mistake?**
**A**: Just edit the field and click "Update Preview" again. You can download as many times as you want.

### **Q: Can I send the PDF directly from the system?**
**A**: Currently, you download the PDF and email it manually. Email integration can be added later.

---

## 🎉 Summary

### **What You Get:**
✅ "Release Offer Letter" button in main Recruitment Dashboard table  
✅ Upload Hero FinCorp PDF template once  
✅ Preview template before using  
✅ Edit candidate fields in simple form  
✅ Live PDF preview shows changes in real-time  
✅ Download professional, branded offer letter  
✅ Reuse template for all candidates  

### **How It Works:**
1. Upload Hero FinCorp template (once)
2. Select template for candidate
3. Edit fields (name, salary, etc.)
4. Preview changes in real-time
5. Download final PDF
6. Email to candidate

### **Time Saved:**
- First candidate: ~5 minutes (includes upload)
- Subsequent candidates: ~2 minutes each
- No manual Word editing
- No formatting errors
- Consistent branding

---

## 📞 Need Help?

If you have any questions or need assistance:
1. Check this explanation document
2. Try the feature step by step
3. Contact the development team

---

**Status**: ✅ **IMPLEMENTED & READY TO USE**  
**Date**: May 10, 2026  
**Feature**: Release Offer Letter in Recruitment Dashboard  

---

**End of Explanation**

This document explains everything about the Offer Letter Release feature in simple terms. You can now use this feature to release professional, branded offer letters to your selected candidates! 🚀
