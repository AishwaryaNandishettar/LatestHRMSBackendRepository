# Implementation Checklist

## Code Changes ✅ COMPLETE

### Frontend Changes
- [x] Removed "📤 Submit Timesheet" button from Timesheet.jsx
- [x] Updated filtering logic for employees (show only own data)
- [x] Updated filtering logic for managers (show own + team data)
- [x] Verified no errors in component

### Backend Changes
- [x] Enhanced TimesheetService.getMonthlySummary() to fetch team members
- [x] Added email-based lookup for team members
- [x] Added setManagerEmail() method to User.java
- [x] Verified all methods compile correctly

---

## MongoDB Setup - TODO

### Step 1: Set Mahesh's Manager
```javascript
db.users.updateOne(
  { email: "mahesh@gmail.com" },
  { $set: { managerEmail: "Padmanabhmanager@omoi.com" } }
)
```
- [ ] Execute in MongoDB Atlas
- [ ] Verify: `db.users.findOne({ email: "mahesh@gmail.com" })`

### Step 2: Set Mahesh's Employees' Manager
```javascript
db.users.updateMany(
  { managerEmail: "mahesh@gmail.com" },
  { $set: { managerEmail: "mahesh@gmail.com" } }
)
```
- [ ] Execute in MongoDB Atlas
- [ ] Verify: `db.users.find({ managerEmail: "mahesh@gmail.com" })`

### Step 3: Verify Hierarchy
```javascript
// Padmanabhmanager's direct reports
db.users.find({ managerEmail: "Padmanabhmanager@omoi.com" })

// Mahesh's direct reports
db.users.find({ managerEmail: "mahesh@gmail.com" })
```
- [ ] Padmanabhmanager has Mahesh as direct report
- [ ] Mahesh has employees as direct reports

---

## Testing - TODO

### Test 1: Employee View
- [ ] Log in as employee (e.g., employee1@gmail.com)
- [ ] Go to Timesheet page
- [ ] Verify: NO "Submit Timesheet" button
- [ ] Verify: Only see own timesheet
- [ ] Verify: No action buttons

### Test 2: Manager View (Mahesh)
- [ ] Log in as mahesh@gmail.com
- [ ] Go to Timesheet page
- [ ] Verify: See own timesheet
- [ ] Verify: See employees' timesheet
- [ ] Verify: Can approve/reject employees' timesheets

### Test 3: Top Manager View (Padmanabhmanager)
- [ ] Log in as Padmanabhmanager@omoi.com
- [ ] Go to Timesheet page
- [ ] Verify: See own timesheet
- [ ] Verify: See Mahesh's timesheet
- [ ] Verify: See Mahesh's employees' timesheet
- [ ] Verify: Can approve/reject all timesheets

### Test 4: Admin View
- [ ] Log in as admin
- [ ] Go to Timesheet page
- [ ] Verify: See all employees' timesheet
- [ ] Verify: Can approve/reject all timesheets

---

## Browser Testing - TODO

### Clear Cache
- [ ] Press Ctrl+Shift+Delete
- [ ] Clear all cache
- [ ] Close and reopen browser

### Check Console
- [ ] Press F12 to open DevTools
- [ ] Go to Console tab
- [ ] Verify: No error messages
- [ ] Verify: No warnings

### Check Network
- [ ] Go to Network tab
- [ ] Reload page
- [ ] Verify: All API calls return 200 status
- [ ] Verify: `/api/timesheet/monthly` returns correct data

---

## Backend Testing - TODO

### Check Logs
- [ ] Start backend server
- [ ] Check logs for errors
- [ ] Verify: No exceptions
- [ ] Verify: No warnings

### Test API Endpoints
- [ ] Test: GET /api/timesheet/monthly?month=2026-05 (as employee)
- [ ] Test: GET /api/timesheet/monthly?month=2026-05 (as manager)
- [ ] Test: GET /api/timesheet/monthly?month=2026-05 (as admin)
- [ ] Verify: Correct data returned for each role

---

## Deployment - TODO

### Before Deploying
- [ ] All tests pass
- [ ] No console errors
- [ ] No backend errors
- [ ] MongoDB setup complete

### Deploy Frontend
- [ ] Build: `npm run build`
- [ ] Deploy to Vercel/hosting
- [ ] Verify: No build errors

### Deploy Backend
- [ ] Build: `mvn clean package`
- [ ] Deploy to Render/hosting
- [ ] Verify: No deployment errors

### Post-Deployment
- [ ] Test in production
- [ ] Verify: All features work
- [ ] Monitor logs for errors

---

## Documentation - TODO

- [ ] Share QUICK_REFERENCE_TIMESHEET.md with team
- [ ] Share TIMESHEET_HIERARCHY_DIAGRAM.md with team
- [ ] Share SETUP_MANAGER_HIERARCHY.md with team
- [ ] Document any custom changes made

---

## Rollback Plan (If Needed)

If something goes wrong:

1. **Frontend Rollback**
   - Revert Timesheet.jsx to previous version
   - Redeploy frontend

2. **Backend Rollback**
   - Revert TimesheetService.java to previous version
   - Revert User.java to previous version
   - Rebuild and redeploy backend

3. **MongoDB Rollback**
   - Remove managerEmail field from users
   - Or restore from backup

---

## Success Criteria ✅

- [x] Code changes complete
- [ ] MongoDB setup complete
- [ ] All tests pass
- [ ] No console errors
- [ ] No backend errors
- [ ] Employee sees no submit button
- [ ] Manager sees team members' data
- [ ] Admin sees all data
- [ ] Hierarchy works correctly
- [ ] Deployed to production

---

## Notes

- All code changes are backward compatible
- No database migrations needed (just field updates)
- No breaking changes to API
- Existing functionality preserved

---

## Support

For issues during implementation:
1. Check MongoDB setup (managerEmail field)
2. Verify attendance records exist
3. Clear browser cache
4. Check browser console for errors
5. Check backend logs for errors
6. Review TIMESHEET_HIERARCHY_DIAGRAM.md for data flow

---

## Done! ✅

Code is ready. Just need to:
1. Update MongoDB
2. Test thoroughly
3. Deploy to production
