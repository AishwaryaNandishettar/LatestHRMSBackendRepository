# Performance Management System - Testing Guide

## What's Implemented

✅ **Complete Performance Management System** with:
- **Performance tracking table** for admin/manager to view all employees
- **Individual performance details** with charts and metrics
- **Employee self-view** of their own performance and manager feedback
- **Sample data seeding** for testing

## Features

### For Admin/Manager:
1. **Performance Tracking Table** - View all employees' performance at a glance
2. **Individual Employee Details** - Click "View Details" to see comprehensive performance data
3. **Seed Sample Data** - Green "Seed Data" button to create test performance records
4. **Team Overview** - Summary table of all active employees

### For Employees:
1. **My Performance Summary** - Personal performance dashboard
2. **Manager Feedback** - View recent reviews and comments from managers
3. **Performance Metrics** - Overall score, performance band, promotion readiness
4. **Skill Radar Chart** - Visual representation of different skill areas

## How to Test

### Step 1: Seed Sample Data (Admin Only)
1. Login as Admin/Manager
2. Go to Performance page
3. Click the green **"Seed Data"** button
4. This creates performance records for the first 3 active employees

### Step 2: View Performance Tracking Table
- Admin/Manager will see a **"Performance Tracking - All Employees"** table
- Shows: Employee name, department, overall score, performance band, last review
- Click **"View Details"** to see individual employee performance

### Step 3: Employee View
1. Login as an employee (who has performance data)
2. Go to Performance page
3. See **"My Performance Summary"** with:
   - Current performance metrics
   - Recent manager feedback
   - Performance charts and trends

## Sample Data Created

The seeding creates realistic performance data including:
- **Overall scores** (3.2 to 4.8 out of 5)
- **Monthly performance trends** (last 6 months)
- **Skill parameters** (Technical Skills, Communication, Teamwork, etc.)
- **Manager reviews** with actual feedback comments
- **Performance bands** (Outstanding, Exceeds Expectations, etc.)

## Performance Bands

- **4.5+ = Outstanding** (Green)
- **4.0+ = Exceeds Expectations** (Blue) 
- **3.5+ = Meets Expectations** (Yellow)
- **2.5+ = Needs Improvement** (Orange)
- **Below 2.5 = Unsatisfactory** (Red)

## API Endpoints

- `GET /api/performance` - Get all performance records
- `GET /api/performance/{employeeId}` - Get specific employee performance
- `POST /api/performance` - Save/update performance record
- `POST /api/performance/seed` - Create sample data for testing

## Notes

- Performance data is linked to **Employee.employeeId** (like EMP001, EMP002)
- Only **active employees** get sample performance data
- Existing performance records are not overwritten when seeding
- Charts and visualizations use Recharts library
- Responsive design works on desktop and mobile