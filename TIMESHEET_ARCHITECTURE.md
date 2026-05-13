# 🏗️ Timesheet System Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          EMPLOYEE BROWSER                                   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ Timesheet.jsx Component                                              │  │
│  │                                                                      │  │
│  │  1. Display timesheet data                                          │  │
│  │  2. Show KPI metrics (Present, Absent, Employees, Avg Hours)       │  │
│  │  3. Filter by month, department, etc.                              │  │
│  │  4. [NEW] "📤 Submit Timesheet" button                             │  │
│  │                                                                      │  │
│  │  onClick → handleSubmitTimesheet()                                  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    ↓                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ timesheetApi.js                                                      │  │
│  │                                                                      │  │
│  │  [NEW] submitTimesheet(timesheetData)                               │  │
│  │  → POST /api/timesheet/submit                                       │  │
│  │  → Send JSON with timesheet details                                 │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
                    HTTP POST /api/timesheet/submit
                    Content-Type: application/json
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SPRING BOOT BACKEND                                   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ TimesheetController.java                                             │  │
│  │                                                                      │  │
│  │  [NEW] @PostMapping("/submit")                                      │  │
│  │  public Map<String, Object> submitTimesheet(                        │  │
│  │      @RequestBody Map<String, Object> req)                         │  │
│  │  {                                                                   │  │
│  │      return service.submitTimesheet(req);                           │  │
│  │  }                                                                   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    ↓                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ TimesheetService.java                                                │  │
│  │                                                                      │  │
│  │  [NEW] public Map<String, Object> submitTimesheet(                  │  │
│  │      Map<String, Object> req)                                       │  │
│  │  {                                                                   │  │
│  │      1. Extract userId, month, attendance data                      │  │
│  │      2. For each day (1-31):                                        │  │
│  │         - Create Attendance object                                  │  │
│  │         - Set userId, date, checkIn, checkOut                       │  │
│  │         - repo.save(attendance)  ← Save to MongoDB                  │  │
│  │      3. Return success/error response                               │  │
│  │  }                                                                   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    ↓                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ AttendanceRepository.java                                            │  │
│  │                                                                      │  │
│  │  repo.save(attendance)                                              │  │
│  │  → Spring Data MongoDB                                              │  │
│  │  → Saves to MongoDB collection                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                        MONGODB ATLAS CLOUD                                   │
│                                                                              │
│  Organization: Aishwarya's Org - 20...                                      │
│  Project: Project 0                                                         │
│  Cluster: Cluster0                                                          │
│  Database: Data_base_hrms                                                   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ Collection: attendance                                               │  │
│  │                                                                      │  │
│  │  Document 1:                                                        │  │
│  │  {                                                                   │  │
│  │    "_id": ObjectId("..."),                                          │  │
│  │    "userId": "employee@example.com",                                │  │
│  │    "date": "2026-05-01",                                            │  │
│  │    "checkIn": "09:00",                                              │  │
│  │    "checkOut": "17:00",                                             │  │
│  │    "duration": 480                                                  │  │
│  │  }                                                                   │  │
│  │                                                                      │  │
│  │  Document 2:                                                        │  │
│  │  {                                                                   │  │
│  │    "_id": ObjectId("..."),                                          │  │
│  │    "userId": "employee@example.com",                                │  │
│  │    "date": "2026-05-02",                                            │  │
│  │    "checkIn": "09:00",                                              │  │
│  │    "checkOut": "17:00",                                             │  │
│  │    "duration": 480                                                  │  │
│  │  }                                                                   │  │
│  │                                                                      │  │
│  │  ... (31 documents total, one per day)                              │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ✅ Data successfully saved to MongoDB!                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Sequence

```
SEQUENCE DIAGRAM:

Employee                Frontend              Backend              MongoDB
   │                       │                    │                    │
   │ 1. Click Submit       │                    │                    │
   │──────────────────────→│                    │                    │
   │                       │ 2. POST /submit    │                    │
   │                       │───────────────────→│                    │
   │                       │                    │ 3. Extract data    │
   │                       │                    │ 4. Create records  │
   │                       │                    │ 5. Save to DB      │
   │                       │                    │───────────────────→│
   │                       │                    │                    │ 6. Insert
   │                       │                    │                    │    31 docs
   │                       │                    │←───────────────────│
   │                       │ 7. Response OK     │                    │
   │                       │←───────────────────│                    │
   │ 8. Success Alert      │                    │                    │
   │←──────────────────────│                    │                    │
   │                       │                    │                    │
```

## Component Interaction

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Timesheet.jsx                                                              │
│  ├─ State: records, fromMonth, toMonth, role, etc.                         │
│  ├─ useEffect: Load timesheet data on mount                                │
│  ├─ handleSubmitTimesheet()  ← NEW                                         │
│  │  └─ Calls: submitTimesheet(timesheetData)                               │
│  └─ Render: Table + Submit Button  ← NEW                                   │
│                                                                              │
│  timesheetApi.js                                                            │
│  ├─ getTimesheet(month)                                                    │
│  ├─ submitTimesheet(timesheetData)  ← NEW                                  │
│  └─ approveTimesheet(empId, month)                                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
                            HTTP REST API
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BACKEND LAYER                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  TimesheetController                                                        │
│  ├─ GET /api/timesheet/monthly                                             │
│  ├─ POST /api/timesheet/submit  ← NEW                                      │
│  └─ PUT /api/timesheet/approve                                             │
│                                                                              │
│  TimesheetService                                                           │
│  ├─ getMonthlySummary(month)                                               │
│  ├─ submitTimesheet(req)  ← NEW                                            │
│  └─ approve(empId, month)                                                  │
│                                                                              │
│  AttendanceRepository (Spring Data MongoDB)                                │
│  ├─ findByUserIdAndDateStartingWith()                                      │
│  ├─ save(attendance)  ← Used by submitTimesheet()                          │
│  └─ Other query methods                                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
                            MongoDB Driver
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATABASE LAYER                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  MongoDB Atlas Cloud                                                        │
│  └─ Data_base_hrms                                                         │
│     └─ attendance collection                                               │
│        └─ Documents (31 per submission)                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Request/Response Flow

```
REQUEST (Frontend → Backend):
┌─────────────────────────────────────────────────────────────────────────────┐
│ POST /api/timesheet/submit                                                  │
│ Content-Type: application/json                                              │
│                                                                              │
│ {                                                                            │
│   "userId": "employee@example.com",                                         │
│   "month": "2026-05",                                                       │
│   "present": 20,                                                            │
│   "leave": 1,                                                               │
│   "lop": 0,                                                                 │
│   "halfDay": 0,                                                             │
│   "late": 1,                                                                │
│   "wfh": 2,                                                                 │
│   "field": 0,                                                               │
│   "avgHours": 8.5                                                           │
│ }                                                                            │
└─────────────────────────────────────────────────────────────────────────────┘

PROCESSING (Backend):
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. Receive request in TimesheetController                                   │
│ 2. Call TimesheetService.submitTimesheet(req)                               │
│ 3. Extract userId and month from request                                    │
│ 4. Loop through days 1-31:                                                  │
│    - Create Attendance object                                               │
│    - Set userId, date (2026-05-01, 2026-05-02, etc.)                       │
│    - Set checkIn: "09:00", checkOut: "17:00"                               │
│    - Call repo.save(attendance)                                             │
│ 5. Build response object                                                    │
│ 6. Return response                                                          │
└─────────────────────────────────────────────────────────────────────────────┘

RESPONSE (Backend → Frontend):
┌─────────────────────────────────────────────────────────────────────────────┐
│ HTTP 200 OK                                                                  │
│ Content-Type: application/json                                              │
│                                                                              │
│ {                                                                            │
│   "success": true,                                                          │
│   "message": "Timesheet submitted successfully for 2026-05",                │
│   "userId": "employee@example.com",                                         │
│   "month": "2026-05"                                                        │
│ }                                                                            │
└─────────────────────────────────────────────────────────────────────────────┘

FRONTEND HANDLING:
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. Receive response                                                         │
│ 2. Check response.success                                                   │
│ 3. If true:                                                                 │
│    - Show success alert                                                     │
│    - Refresh timesheet data                                                 │
│ 4. If false:                                                                │
│    - Show error alert with message                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Database Schema

```
MongoDB Collection: attendance

Document Structure:
{
  "_id": ObjectId,                    // Auto-generated by MongoDB
  "userId": String,                   // Employee email
  "date": String,                     // Format: YYYY-MM-DD
  "checkIn": String,                  // Format: HH:MM (e.g., "09:00")
  "checkOut": String,                 // Format: HH:MM (e.g., "17:00")
  "duration": Number,                 // Minutes worked
  "status": String,                   // "present", "absent", "leave", etc.
  "createdAt": Date,                  // Auto-generated
  "updatedAt": Date                   // Auto-generated
}

Example Documents (after submission):
[
  {
    "_id": ObjectId("507f1f77bcf86cd799439011"),
    "userId": "employee@example.com",
    "date": "2026-05-01",
    "checkIn": "09:00",
    "checkOut": "17:00",
    "duration": 480,
    "status": "present"
  },
  {
    "_id": ObjectId("507f1f77bcf86cd799439012"),
    "userId": "employee@example.com",
    "date": "2026-05-02",
    "checkIn": "09:00",
    "checkOut": "17:00",
    "duration": 480,
    "status": "present"
  },
  ...
]

Indexes (for performance):
- userId (for quick employee lookup)
- date (for date range queries)
- userId + date (compound index for efficient filtering)
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ERROR SCENARIOS                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 1. Missing userId                                                           │
│    → Backend catches exception                                              │
│    → Returns: { "success": false, "message": "..." }                        │
│    → Frontend shows error alert                                             │
│                                                                              │
│ 2. MongoDB connection error                                                 │
│    → repo.save() throws exception                                           │
│    → Caught in try-catch block                                              │
│    → Returns error response                                                 │
│    → Frontend shows error alert                                             │
│                                                                              │
│ 3. Network error (Frontend)                                                 │
│    → API call fails                                                         │
│    → Caught in catch block                                                  │
│    → Shows error alert with error message                                   │
│                                                                              │
│ 4. Invalid data format                                                      │
│    → Type casting fails                                                     │
│    → Exception caught                                                       │
│    → Returns error response                                                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

**Architecture Status**: ✅ Complete and functional
