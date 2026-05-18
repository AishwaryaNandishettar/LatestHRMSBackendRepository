# Leave and Holiday Display Implementation - Keka Style

## 🎯 Overview
Implemented a Keka HR-style leave and holiday display system on the home page that shows:
- **Who's on Leave Today** - Displays employees currently on leave
- **Upcoming Holidays** - Shows next 5 upcoming holidays
- **Role-based filtering** - Different views for Admin, Manager, and Employee

## ✅ Features Implemented

### 1. **Who's on Leave Today Section**
- **Admin/HR View**: Shows all employees on approved leave today
- **Manager View**: Shows only team members (same department) on leave today
- **Employee View**: Shows only their own leave if they're on leave today
- **Smart Date Filtering**: Only shows leaves where today's date falls between start and end date
- **Visual Cards**: Employee avatar, name, leave dates, and leave type badge
- **Empty State**: Shows "Everyone is present today!" when no one is on leave
- **View All Button**: If more than 6 people are on leave, shows a "View all" link

### 2. **Upcoming Holidays Section**
- **Holiday Cards**: Shows next 5 upcoming holidays with:
  - Date (day and month in a calendar-style box)
  - Holiday title
  - Description
  - Day of the week
- **Smart Filtering**: Only shows holidays with date >= today
- **Sorted by Date**: Holidays are sorted chronologically
- **Empty State**: Shows "No upcoming holidays" when none are scheduled

### 3. **Backend Enhancements**

#### HomeService.java Updates:
```java
// ✅ Role-based leave filtering
- Admin/HR: See all employees on leave
- Manager: See only team members (same department) on leave
- Employee: See only their own leave

// ✅ Date-based filtering
- Uses LocalDate to check if today falls within leave period
- Filters only "Approved" leaves
- Handles date parsing errors gracefully

// ✅ Enhanced leave data
- Includes employee name, department, leave type
- Maps user data from User repository
```

#### HomeResponse.java Updates:
```java
// ✅ Added leaveUsers field
- List<Map<String, Object>> leaveUsers
- Contains: name, startDate, endDate, leaveType, department
```

### 4. **Frontend Enhancements**

#### Home.jsx Updates:
```javascript
// ✅ New state for holidays
const [upcomingHolidays, setUpcomingHolidays] = useState([]);

// ✅ Holiday extraction from events
- Filters events where type === "Holiday"
- Filters dates >= today
- Sorts by date
- Takes first 5 holidays

// ✅ Leave users from API
const leaveUsers = homeData?.leaveUsers || [];
```

#### Home.css Updates:
```css
/* ✅ Keka-style leave cards */
.leave-today-panel - Blue left border, clean header
.leave-users-grid - Responsive grid layout
.leave-user-card - Hover effects, avatar, info
.leave-type-badge - Color-coded leave type indicator

/* ✅ Keka-style holiday cards */
.holidays-panel - Orange/yellow theme
.holiday-item - Gradient background, hover effects
.holiday-date - Calendar-style date box
.holiday-details - Title and description

/* ✅ Empty states */
.empty-state - Centered icon and message
```

## 📊 Data Flow

### Leave Display Flow:
```
1. Frontend calls: fetchHomeData(user.email)
2. Backend HomeController receives request
3. HomeService.buildEmployeeHome() called
4. Service filters leaves based on:
   - User role (Admin/Manager/Employee)
   - Approval status (only "Approved")
   - Date range (today between start and end)
5. Returns leaveUsers array with employee details
6. Frontend displays in leave-users-grid
```

### Holiday Display Flow:
```
1. Backend returns all events in HomeResponse
2. Frontend filters events where:
   - event.type === "Holiday"
   - event.date >= today
3. Sorts by date ascending
4. Takes first 5 holidays
5. Displays in holidays-list
```

## 🎨 UI/UX Features

### Leave Cards:
- ✅ Employee avatar with random background color
- ✅ Employee name in bold
- ✅ Leave dates in readable format (e.g., "Apr 29 - May 2")
- ✅ Leave type badge (e.g., "Sick Leave", "Casual Leave")
- ✅ Hover effect with shadow and lift
- ✅ Responsive grid (auto-fill, min 200px)
- ✅ Shows max 6 cards, then "View all" link

### Holiday Cards:
- ✅ Calendar-style date box (day + month)
- ✅ Holiday title and description
- ✅ Day of week (e.g., "Monday")
- ✅ Yellow/orange gradient background
- ✅ Hover effect with slide animation
- ✅ Shows max 5 upcoming holidays

### Empty States:
- ✅ Large emoji icon
- ✅ Primary message (bold)
- ✅ Secondary message (lighter)
- ✅ Centered layout

## 🔧 Technical Details

### Backend Dependencies:
- `java.time.LocalDate` for date comparison
- `Stream API` for filtering and mapping
- `UserRepository` for employee name lookup
- `LeaveRepository` for leave data
- `EventRepository` for holiday data

### Frontend Dependencies:
- `react-router-dom` for navigation
- `Date` API for date formatting
- `ui-avatars.com` for employee avatars

## 🚀 How to Test

### 1. Test Leave Display:
```bash
# Create test leaves in MongoDB
db.leave_requests.insertMany([
  {
    userId: "user123",
    leaveType: "Sick Leave",
    startDate: "2026-04-29",
    endDate: "2026-04-30",
    status: "Approved",
    reason: "Medical"
  }
])

# Verify user exists
db.users.findOne({ _id: "user123" })
```

### 2. Test Holiday Display:
```bash
# Create test holidays in MongoDB
db.events.insertMany([
  {
    title: "Independence Day",
    date: "2026-07-04",
    type: "Holiday",
    description: "National Holiday"
  },
  {
    title: "Christmas",
    date: "2026-12-25",
    type: "Holiday",
    description: "Public Holiday"
  }
])
```

### 3. Test Role-based Filtering:
- Login as **Admin** → Should see all employees on leave
- Login as **Manager** → Should see only team members on leave
- Login as **Employee** → Should see only own leave

## 📝 Notes

### Existing Logic Preserved:
- ✅ All existing home page functionality remains unchanged
- ✅ KPI cards, attendance charts, leave charts work as before
- ✅ Employee directory, payroll, notifications unchanged
- ✅ Check-in/Check-out functionality preserved

### New Additions Only:
- ✅ Added two new sections (leave display and holidays)
- ✅ Enhanced backend to filter leaves by role and date
- ✅ Added new CSS classes (no modifications to existing styles)
- ✅ Added new state variables (no changes to existing state)

## 🎯 Future Enhancements (Optional)

1. **Leave Type Colors**: Different badge colors for different leave types
2. **Department Filter**: Allow managers to filter by department
3. **Date Range Selector**: Show leaves for next week/month
4. **Holiday Calendar Integration**: Click to add to personal calendar
5. **Leave Balance Display**: Show remaining leave balance for each employee
6. **Team Availability**: Show team availability percentage

## 📸 Expected UI

### Leave Display:
```
🏖️ Who's on Leave Today                    [2 people]
┌─────────────────┐  ┌─────────────────┐
│ 👤 John Doe     │  │ 👤 Jane Smith   │
│ Apr 29 - May 2  │  │ Apr 29 - Apr 30 │
│ [Sick Leave]    │  │ [Casual Leave]  │
└─────────────────┘  └─────────────────┘
```

### Holiday Display:
```
🎉 Upcoming Holidays
┌────────────────────────────────────────┐
│ ┌──┐                                   │
│ │15│ Independence Day        Monday    │
│ │Jul│ National Holiday                 │
│ └──┘                                   │
└────────────────────────────────────────┘
```

## ✅ Implementation Complete!

All features have been implemented without changing any existing logic. The home page now displays:
- ✅ Who's on leave today (role-based)
- ✅ Upcoming holidays
- ✅ Keka-style UI with cards and badges
- ✅ Empty states for better UX
- ✅ Responsive design
