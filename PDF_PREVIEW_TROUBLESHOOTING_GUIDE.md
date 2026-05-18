# PDF Preview Troubleshooting Guide

## Issues Fixed

### ✅ 1. CSS Text Visibility Issues
**Problem**: Text not visible in upload form and edit fields
**Solution**: Enhanced CSS with stronger color declarations and webkit compatibility

**Changes Made**:
- Added `#ffffff` background (instead of `white`)
- Added `-webkit-appearance: none !important`
- Added `text-shadow: none !important`
- Added `font-weight: 500 !important`
- Stronger color declarations for all input states

### ✅ 2. PDF Rendering Improvements
**Problem**: PDF preview not showing Hero FinCorp template
**Solution**: Enhanced error handling and debugging

**Changes Made**:
- Better PDF.js worker path handling with fallbacks
- Enhanced error logging with specific error types
- PDF validation (header check)
- Timeout protection (30 seconds)
- Progress tracking for large PDFs
- Canvas optimization with white background

## Testing Steps

### Step 1: Test CSS Fixes
1. Open the Offer Letter modal
2. Go to "Upload Template" tab
3. Check if you can see text clearly when typing in:
   - Template Name field
   - Company Name field
   - Description field
4. Go to "Edit Fields" tab
5. Check if you can see text when typing in candidate fields

### Step 2: Test PDF Preview
1. Open: `http://localhost:3000/test-pdf-rendering.html`
2. Click "Run Full Test" button
3. Check console logs for detailed debugging info
4. If test passes, the issue is in the React component
5. If test fails, check the specific error messages

### Step 3: Check Browser Console
When testing the actual modal:
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Upload Hero FinCorp template
4. Look for these log messages:
   ```
   === Loading Template Preview ===
   Template ID: [ID]
   Preview response: [response details]
   Converting base64 to ArrayBuffer...
   PDF header check: %PDF
   === renderPdfToImages called ===
   PDF.js library loaded successfully
   PDF loaded successfully!
   Number of pages: [number]
   ```

### Step 4: Common Error Solutions

#### Error: "PDF.js worker failed to load"
**Solution**: 
- Check if `/pdf.worker.min.js` exists in public folder
- Try using CDN fallback (already implemented)

#### Error: "Invalid PDF format - missing PDF header"
**Solution**:
- Backend is not returning valid PDF data
- Check backend logs for template retrieval

#### Error: "PDF rendering timeout"
**Solution**:
- PDF file is too large or complex
- Try with a smaller/simpler PDF template

#### Error: "No PDF data received from server"
**Solution**:
- Backend API issue
- Check network tab in browser dev tools
- Verify template ID exists in database

## Backend Verification

### Check Template in Database
```sql
-- Check if template exists
SELECT id, template_name, company_name, uploaded_at 
FROM offer_letter_templates 
WHERE id = 'YOUR_TEMPLATE_ID';

-- Check if PDF data exists
SELECT id, template_name, 
       LENGTH(pdf_data) as pdf_size_bytes,
       SUBSTRING(pdf_data, 1, 10) as pdf_header
FROM offer_letter_templates 
WHERE id = 'YOUR_TEMPLATE_ID';
```

### Test Backend API Directly
```bash
# Test template list
curl http://localhost:8080/api/offer-templates-simple

# Test specific template preview
curl http://localhost:8080/api/offer-templates-simple/preview/YOUR_TEMPLATE_ID
```

## Expected Behavior

### ✅ Working Preview Should Show:
1. **Upload Tab**: Clear, visible text in all input fields
2. **Preview Tab**: Hero FinCorp template pages displayed as images
3. **Edit Tab**: 
   - Clear, visible text in all edit fields
   - Live preview showing Hero FinCorp template on the right
   - Changes reflected when clicking "Update Preview"

### ✅ Console Logs Should Show:
```
=== Loading Template Preview ===
Template ID: 6a0096d92ba292439b9db446
Preview response: {hasData: true, hasPdfBase64: true, base64Length: 123456}
Converting base64 to ArrayBuffer...
ArrayBuffer created, size: 89234 bytes
PDF header check: %PDF
=== renderPdfToImages called ===
PDF.js library loaded successfully
PDF.js version: 3.11.174
PDF loaded successfully!
Number of pages: 2
Page 1 rendered successfully
Page 2 rendered successfully
=== All pages rendered successfully ===
```

## Next Steps

1. **Test the CSS fixes** - Check if text is now visible in input fields
2. **Run the test page** - Visit `/test-pdf-rendering.html` and run full test
3. **Check console logs** - Look for specific error messages
4. **Report results** - Let me know which step fails and what error messages you see

The fixes should resolve both the text visibility and PDF preview issues. The enhanced error handling will help identify exactly where the problem occurs if it persists.