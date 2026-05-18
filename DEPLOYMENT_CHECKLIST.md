# ✅ Deployment Checklist - Release Offer Letter Feature

## 📋 Pre-Deployment Checklist

### Backend Setup

- [ ] **1. Verify MongoDB Connection**
  ```bash
  # Check if MongoDB is running
  mongosh
  show dbs
  ```

- [ ] **2. Build Backend**
  ```bash
  cd HRMS-Backend
  mvn clean install
  ```

- [ ] **3. Check for Compilation Errors**
  - Ensure all 4 new files compile successfully
  - No missing imports or dependencies

- [ ] **4. Verify CORS Configuration**
  - Check `OfferLetterTemplateController.java`
  - Ensure your frontend URL is in `@CrossOrigin`

- [ ] **5. Start Backend Server**
  ```bash
  mvn spring-boot:run
  ```

- [ ] **6. Test Backend Endpoints**
  ```bash
  # Test GET all templates (should return empty array initially)
  curl http://localhost:8080/api/offer-templates/all
  ```

---

### Frontend Setup

- [ ] **1. Install Dependencies**
  ```bash
  cd HRMS-Frontend
  npm install pdf-lib pdfjs-dist
  ```

- [ ] **2. Add PDF.js Worker File**
  ```bash
  cd public
  # Download worker file
  curl -O https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js
  ```

- [ ] **3. Verify File Structure**
  ```
  HRMS-Frontend/
  ├── public/
  │   └── pdf.worker.min.js ✅
  ├── src/
  │   ├── Pages/Recruitment/
  │   │   ├── ReleaseOfferLetterModal.jsx ✅
  │   │   ├── ReleaseOfferLetterModal.css ✅
  │   │   └── Recruitment.jsx (modified) ✅
  │   └── api/
  │       └── recruitmentApi.js (modified) ✅
  ```

- [ ] **4. Check for Compilation Errors**
  ```bash
  npm run build
  ```

- [ ] **5. Start Frontend Server**
  ```bash
  npm start
  ```

- [ ] **6. Verify Frontend Loads**
  - Open http://localhost:3000 (or your port)
  - Navigate to Recruitment page
  - No console errors

---

## 🧪 Testing Checklist

### Basic Functionality Tests

- [ ] **1. Button Visibility**
  - Set a candidate status to "Selected"
  - Verify "📄 Release Offer Letter" button appears
  - Button should be green with gradient

- [ ] **2. Modal Opens**
  - Click "Release Offer Letter" button
  - Modal should open with 3 tabs
  - No console errors

- [ ] **3. Upload Tab**
  - [ ] Fill in template name
  - [ ] Fill in company name
  - [ ] Select a PDF file
  - [ ] Click "Upload Template"
  - [ ] Verify success message
  - [ ] Check if template appears in grid

- [ ] **4. Preview Tab**
  - [ ] Select an uploaded template
  - [ ] Verify PDF renders as images
  - [ ] Check all pages render
  - [ ] Verify page numbers show

- [ ] **5. Edit Tab**
  - [ ] Fill in candidate name
  - [ ] Fill in position
  - [ ] Fill in CTC
  - [ ] Fill in other fields
  - [ ] Click "Update Preview"
  - [ ] Verify live preview updates

- [ ] **6. Download**
  - [ ] Click "Download Final PDF"
  - [ ] Verify PDF downloads
  - [ ] Open downloaded PDF
  - [ ] Check if placeholders are replaced
  - [ ] Verify data is correct

---

### Advanced Tests

- [ ] **7. Multiple Templates**
  - Upload 3 different templates
  - Verify all show in grid
  - Select each one
  - Verify correct template loads

- [ ] **8. Template Selection**
  - Upload a template
  - Close modal
  - Reopen modal
  - Verify template is still available

- [ ] **9. Error Handling**
  - Try uploading non-PDF file
  - Verify error message shows
  - Try uploading without template name
  - Verify validation works

- [ ] **10. Real-time Preview**
  - Edit candidate name
  - Click "Update Preview"
  - Verify name updates in preview
  - Edit CTC
  - Click "Update Preview"
  - Verify CTC updates

---

### Database Tests

- [ ] **11. MongoDB Storage**
  ```bash
  mongosh
  use hrms_db  # or your database name
  db.offer_letter_templates.find().pretty()
  ```
  - Verify template is stored
  - Check templateData field exists
  - Verify metadata is correct

- [ ] **12. Template Retrieval**
  - Restart backend
  - Reopen modal
  - Verify templates still load
  - Verify preview still works

---

### Browser Compatibility

- [ ] **13. Chrome**
  - Test all features
  - Check console for errors
  - Verify PDF renders

- [ ] **14. Firefox**
  - Test all features
  - Check console for errors
  - Verify PDF renders

- [ ] **15. Edge**
  - Test all features
  - Check console for errors
  - Verify PDF renders

- [ ] **16. Safari** (if available)
  - Test all features
  - Check console for errors
  - Verify PDF renders

---

### Mobile Responsiveness

- [ ] **17. Mobile View (Chrome DevTools)**
  - Open DevTools
  - Toggle device toolbar
  - Test on iPhone 12 Pro
  - Test on iPad
  - Verify layout adapts

- [ ] **18. Touch Interactions**
  - Verify buttons are touch-friendly
  - Verify scrolling works
  - Verify form inputs work

---

### Performance Tests

- [ ] **19. Large PDF (10+ pages)**
  - Upload large PDF
  - Verify preview renders
  - Check loading time
  - Verify no crashes

- [ ] **20. Multiple Uploads**
  - Upload 5 templates
  - Verify all load
  - Check memory usage
  - Verify no slowdown

---

## 🚀 Production Deployment Checklist

### Pre-Production

- [ ] **1. Environment Variables**
  - Set production MongoDB URL
  - Set production API URL
  - Set CORS for production domain

- [ ] **2. Build Optimization**
  ```bash
  # Frontend
  npm run build
  
  # Backend
  mvn clean package -DskipTests
  ```

- [ ] **3. Security Review**
  - [ ] File upload size limit set
  - [ ] CORS configured correctly
  - [ ] Authentication enabled (if applicable)
  - [ ] Authorization checks in place

- [ ] **4. Database Backup**
  ```bash
  mongodump --db hrms_db --out backup/
  ```

---

### Deployment

- [ ] **5. Deploy Backend**
  - Upload JAR to server
  - Start application
  - Verify health check

- [ ] **6. Deploy Frontend**
  - Upload build folder
  - Configure web server
  - Verify static files serve

- [ ] **7. Verify Production URLs**
  - Test API endpoints
  - Test frontend loads
  - Test modal opens

---

### Post-Deployment

- [ ] **8. Smoke Tests**
  - Upload a template
  - Preview template
  - Edit fields
  - Download PDF

- [ ] **9. Monitor Logs**
  - Check backend logs for errors
  - Check browser console
  - Monitor MongoDB logs

- [ ] **10. User Acceptance Testing**
  - Have HR team test
  - Gather feedback
  - Fix any issues

---

## 📊 Success Criteria

### Must Have (Critical)
- ✅ Upload PDF template works
- ✅ Preview shows PDF correctly
- ✅ Edit fields update preview
- ✅ Download generates correct PDF
- ✅ No console errors
- ✅ No backend errors

### Should Have (Important)
- ✅ Multiple templates supported
- ✅ Template selection works
- ✅ Real-time preview updates
- ✅ Mobile responsive
- ✅ Error messages show

### Nice to Have (Optional)
- ⭕ Email integration
- ⭕ Digital signature
- ⭕ Bulk generation
- ⭕ Template library

---

## 🐛 Common Issues & Solutions

### Issue 1: "pdf.worker.min.js not found"
**Solution:**
```bash
cd HRMS-Frontend/public
curl -O https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js
```

### Issue 2: "Cannot read property 'getDocument' of undefined"
**Solution:**
```bash
npm install pdfjs-dist
```

### Issue 3: CORS errors
**Solution:**
- Check `OfferLetterTemplateController.java`
- Add your frontend URL to `@CrossOrigin`

### Issue 4: MongoDB connection failed
**Solution:**
```bash
# Check if MongoDB is running
mongosh
# If not, start it
mongod
```

### Issue 5: PDF preview blank
**Solution:**
- Check browser console for errors
- Verify PDF file is not corrupted
- Try a different PDF

---

## 📞 Rollback Plan

If deployment fails:

1. **Stop Services**
   ```bash
   # Stop backend
   pkill -f spring-boot
   
   # Stop frontend
   pkill -f node
   ```

2. **Restore Database**
   ```bash
   mongorestore --db hrms_db backup/hrms_db/
   ```

3. **Revert Code**
   ```bash
   git revert HEAD
   git push
   ```

4. **Redeploy Previous Version**
   - Deploy previous JAR
   - Deploy previous build

---

## ✅ Final Sign-Off

- [ ] All tests passed
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Security reviewed
- [ ] Documentation complete
- [ ] Team trained
- [ ] Backup created
- [ ] Rollback plan ready

---

## 🎉 Deployment Complete!

Once all checkboxes are ticked, the feature is ready for production use!

**Deployed By:** _________________

**Date:** _________________

**Version:** 1.0.0

**Status:** ✅ READY FOR PRODUCTION
