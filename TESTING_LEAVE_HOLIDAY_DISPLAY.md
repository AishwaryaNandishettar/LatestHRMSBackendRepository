# Testing Guide: Leave and Holiday Display

## 🧪 Quick Test Setup

### Step 1: Add Test Data to MongoDB

#### Add Test Holidays:
```javascript
// Connect to MongoDB and run:
db.events.insertMany([
  {
    title: "Labor Day",
    date: "2026-05-01",
    type: "Holiday",
    description: "International Workers' Day",
    createdBy: "admin"
  },
  {
    title: "Independence Day",
    date: "2026-07-04",
    type: "Holiday",
    description: "National Holiday",
    createdBy: "admin"
  },
  {
    title: "Christmas",
    date: "2026-12-25",
    type: "Holiday",
    description: "Public Holiday",
    createdBy: "admin"
  },
  {
    title: "New Year",
    date: "2027-01-01",
    type: "Holiday",
    description: "New Year's Day",
    createdBy: "admin"
  }
])
```

#### Add Test Leaves (Currently Active):
```javascript
// Get today's date and create leaves
const today = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

db.leave_requests.insertMany([
  {
    userId: "USER_ID_1", // Replace with actual user ID from db.users
    employeeName: "John Doe",
    leaveType: "Sick Leave",
    startDate: today,
    endDate: tomorrow,
    status: "Approved",
    reason: "Medical checkup"
  },
  {
    userId: "USER_ID_2", // Replace with actual user ID
    employeeName: "Jane Smith",
    leaveType: "Casual Leave",
    startDate: today,
    endDate: today,
    status: "Approved",
    reason: "Personal work"
  },
  {
    userId: "USER_ID_3", // Replace with actual user ID
    employeeName: "Bob Johnson",
    leaveType: "Annual Leave",
    startDate: today,
    endDate: new Date(Date.now() + 172800000).toISOString().split('T')[0], // 2 days
    status: "Approved",
    reason: "Vacation"
  }
])
```

### Step 2: Verify User Data
```javascript
// Make sure users exist with proper departments
db.users.find({}, { name: 1, email: 1, department: 1, role: 1 })

// If needed, update user departments
db.users.updateMany(
  { department: { $exists: false } },
  { $set: { department: "IT" } }
)
```

### Step 3: Test Different Roles

#### Test as Admin:
1. Login with admin credentials
2. Navigate to Home page
3. **Expected**: See all employees on leave (all 3 test leaves)
4. **Expected**: See all upcoming holidays (4 holidays)

#### Test as Manager:
1. Login with manager credentials
2. Navigate to Home page
3. **Expected**: See only team members (same department) on leave
4. **Expected**: See all upcoming holidays

#### Test as Employee:
1. Login with employee credentials
2. Navigate to Home page
3. **Expected**: See only own leave (if on leave today)
4. **Expected**: See all upcoming holidays

### Step 4: Test Empty States

#### Test No Leaves:
```javascript
// Remove all approved leaves for today
db.leave_requests.updateMany(
  { status: "Approved" },
  { $set: { status: "Pending" } }
)
```
**Expected**: "Everyone is present today!" message

#### Test No Holidays:
```javascript
// Remove all future holidays
db.events.deleteMany({ type: "Holiday" })
```
**Expected**: "No upcoming holidays" message

## 🔍 What to Verify

### Leave Display Section:
- ✅ Section appears below KPI cards
- ✅ Shows "🏖️ Who's on Leave Today" header
- ✅ Shows count badge (e.g., "2 people")
- ✅ Each card shows:
  - Employee avatar (colored circle with initials)
  - Employee name
  - Leave dates (e.g., "Apr 29 - May 2")
  - Leave type badge (e.g., "Sick Leave")
- ✅ Cards have hover effect (shadow and lift)
- ✅ If more than 6 people, shows "View all X employees on leave →" link
- ✅ Empty state shows when no one is on leave

### Holiday Display Section:
- ✅ Section appears below leave section
- ✅ Shows "🎉 Upcoming Holidays" header
- ✅ Each holiday card shows:
  - Calendar-style date box (day + month)
  - Holiday title
  - Holiday description
  - Day of week (e.g., "Monday")
- ✅ Yellow/orange gradient background
- ✅ Cards have hover effect (slide right)
- ✅ Shows max 5 holidays
- ✅ Holidays are sorted by date (earliest first)
- ✅ Empty state shows when no holidays

### Role-Based Filtering:
- ✅ Admin sees all employees on leave
- ✅ Manager sees only team members on leave
- ✅ Employee sees only own leave
- ✅ All roles see all holidays

## 🐛 Troubleshooting

### Issue: No leaves showing
**Check:**
1. Leaves have `status: "Approved"`
2. Leave dates include today (startDate <= today <= endDate)
3. User IDs in leave_requests match user IDs in users collection
4. Backend console shows: "🔍 HomeService: Built response with stats: Present"

### Issue: No holidays showing
**Check:**
1. Events have `type: "Holiday"`
2. Event dates are in the future (>= today)
3. Event dates are valid ISO format (YYYY-MM-DD)
4. Backend returns events in HomeResponse

### Issue: Wrong employees showing for manager
**Check:**
1. Manager has `department` field set
2. Team members have same `department` value
3. Backend logs show: "Manager sees only their team members on leave"

### Issue: UI not displaying correctly
**Check:**
1. Home.css has all new classes (leave-today-panel, holidays-panel, etc.)
2. Browser cache cleared (Ctrl+Shift+R)
3. No console errors in browser DevTools
4. React components rendered without errors

## 📊 Expected API Response

### Sample HomeResponse:
```json
{
  "stats": {
    "presentDays": 20,
    "avgHours": 8.4,
    "leaveTaken": 2,
    "totalDays": 21,
    "leaves": 2,
    "totalEmployees": 50,
    "activeEmployees": 48,
    "leavePending": 5,
    "payrollTotal": 250000
  },
  "leaveUsers": [
    {
      "name": "John Doe",
      "startDate": "2026-04-29",
      "endDate": "2026-04-30",
      "leaveType": "Sick Leave",
      "department": "IT"
    },
    {
      "name": "Jane Smith",
      "startDate": "2026-04-29",
      "endDate": "2026-04-29",
      "leaveType": "Casual Leave",
      "department": "HR"
    }
  ],
  "events": [
    {
      "id": "evt1",
      "title": "Labor Day",
      "date": "2026-05-01",
      "type": "Holiday",
      "description": "International Workers' Day"
    },
    {
      "id": "evt2",
      "title": "Independence Day",
      "date": "2026-07-04",
      "type": "Holiday",
      "description": "National Holiday"
    }
  ],
  "attendanceGraph": [...],
  "leaveGraph": [...],
  "salary": {...}
}
```

## ✅ Success Criteria

- [ ] Leave section displays on home page
- [ ] Holiday section displays on home page
- [ ] Admin sees all employees on leave
- [ ] Manager sees only team members on leave
- [ ] Employee sees only own leave
- [ ] All roles see all holidays
- [ ] Empty states work correctly
- [ ] UI matches Keka-style design
- [ ] No console errors
- [ ] No backend errors
- [ ] Responsive design works on mobile
- [ ] Hover effects work smoothly
- [ ] Date formatting is correct
- [ ] Leave type badges display correctly
- [ ] "View all" link works (navigates to /leave)

## 🚀 Quick MongoDB Commands

### View all leaves:
```javascript
db.leave_requests.find().pretty()
```

### View all holidays:
```javascript
db.events.find({ type: "Holiday" }).pretty()
```

### View all users:
```javascript
db.users.find({}, { name: 1, email: 1, department: 1, role: 1 }).pretty()
```

### Count leaves by status:
```javascript
db.leave_requests.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])
```

### Find leaves for today:
```javascript
const today = new Date().toISOString().split('T')[0];
db.leave_requests.find({
  status: "Approved",
  startDate: { $lte: today },
  endDate: { $gte: today }
}).pretty()
```

## 📞 Support

If you encounter any issues:
1. Check backend logs for errors
2. Check browser console for frontend errors
3. Verify MongoDB data is correct
4. Clear browser cache and reload
5. Restart backend server if needed

Happy Testing! 🎉
