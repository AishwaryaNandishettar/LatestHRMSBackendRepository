# Performance Menu Fix - Employee Sidebar

## Issue
The Performance menu item was only visible to `admin` and `hr` roles, but employees couldn't access their own performance data.

## Solution
Updated `HRMS-Frontend/src/Components/Sidebar.jsx` to make the Performance menu item visible to **all users** (admin, manager, and employee).

## Changes Made

### Before:
```jsx
{/* ✅ NEW: PERFORMANCE (Admin + HR) */}
{(role === "admin" || role === "hr") && (
  <li>
    <NavLink to="/performance">
      <FaChartLine />
      {isOpen && <span>Performance</span>}
    </NavLink>
  </li>
)}
```

### After:
```jsx
{/* ✅ PERFORMANCE (All users can view performance) */}
<li>
  <NavLink to="/performance">
    <FaChartLine />
    {isOpen && <span>Performance</span>}
  </NavLink>
</li>
```

## Result
✅ **All users** (admin, manager, employee) can now see the "Performance" menu item in the sidebar
✅ **Employees** can access their own performance data and manager feedback
✅ **Admin/Manager** can still access the full performance tracking system
✅ **Role-based content** is handled within the Performance page itself

## Verification
- The Performance route (`/performance`) was already properly configured in `App.jsx`
- The Performance component already handles role-based display logic
- No additional changes needed - employees will see their own performance data while admin/managers see the full tracking system

## Navigation Path
Sidebar → Performance → Employee sees "My Performance Summary" with manager feedback