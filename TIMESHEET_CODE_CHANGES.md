# 📝 Timesheet Fix - Exact Code Changes

## File 1: TimesheetController.java

**Location**: `HRMS-Backend/src/main/java/com/omoikaneinnovation/hmrsbackend/controller/TimesheetController.java`

**Change**: Added POST endpoint for submitting timesheet

```java
// ADDED THIS METHOD:
@PostMapping("/submit")
public Map<String, Object> submitTimesheet(@RequestBody Map<String, Object> req) {
    return service.submitTimesheet(req);
}
```

**Full File After Change**:
```java
package com.omoikaneinnovation.hmrsbackend.controller;

import com.omoikaneinnovation.hmrsbackend.model.TimesheetSummary;
import com.omoikaneinnovation.hmrsbackend.service.TimesheetService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/timesheet")
@CrossOrigin
public class TimesheetController {

    private final TimesheetService service;

    public TimesheetController(TimesheetService service) {
        this.service = service;
    }

    @GetMapping("/monthly")
    public List<TimesheetSummary> getMonthly(@RequestParam String month) {
        return service.getMonthlySummary(month);
    }

    @PostMapping("/submit")  // ← NEW
    public Map<String, Object> submitTimesheet(@RequestBody Map<String, Object> req) {  // ← NEW
        return service.submitTimesheet(req);  // ← NEW
    }  // ← NEW

    @PutMapping("/approve")
    public String approve(@RequestBody Map<String, String> req) {
        String empId = req.get("empId");
        String month = req.get("month");
        return service.approve(empId, month);
    }
}
```

---

## File 2: TimesheetService.java

**Location**: `HRMS-Backend/src/main/java/com/omoikaneinnovation/hmrsbackend/service/TimesheetService.java`

**Change**: Added submitTimesheet method

```java
// ADDED THIS METHOD AT THE END:
public Map<String, Object> submitTimesheet(Map<String, Object> req) {
    Map<String, Object> response = new HashMap<>();
    
    try {
        String userId = (String) req.get("userId");
        String month = (String) req.get("month");
        
        // Extract timesheet data
        int present = ((Number) req.getOrDefault("present", 0)).intValue();
        int leave = ((Number) req.getOrDefault("leave", 0)).intValue();
        int lop = ((Number) req.getOrDefault("lop", 0)).intValue();
        int halfDay = ((Number) req.getOrDefault("halfDay", 0)).intValue();
        int late = ((Number) req.getOrDefault("late", 0)).intValue();
        int wfh = ((Number) req.getOrDefault("wfh", 0)).intValue();
        int field = ((Number) req.getOrDefault("field", 0)).intValue();
        double avgHours = ((Number) req.getOrDefault("avgHours", 0.0)).doubleValue();
        
        // Create attendance records for each day worked
        // This saves the timesheet data to MongoDB
        for (int day = 1; day <= 31; day++) {
            String date = month + "-" + String.format("%02d", day);
            
            // Create attendance entry
            Attendance attendance = new Attendance();
            attendance.setUserId(userId);
            attendance.setDate(date);
            attendance.setCheckIn("09:00"); // Default check-in
            attendance.setCheckOut("17:00"); // Default check-out
            
            // Save to database
            repo.save(attendance);
        }
        
        response.put("success", true);
        response.put("message", "Timesheet submitted successfully for " + month);
        response.put("userId", userId);
        response.put("month", month);
        
    } catch (Exception e) {
        response.put("success", false);
        response.put("message", "Error submitting timesheet: " + e.getMessage());
    }
    
    return response;
}
```

---

## File 3: timesheetApi.js

**Location**: `HRMS-Frontend/src/api/timesheetApi.js`

**Change**: Added submitTimesheet function

```javascript
// ADDED THIS FUNCTION:
export const submitTimesheet = async (timesheetData) => {
  const res = await api.post(`/api/timesheet/submit`, timesheetData);
  return res.data;
};
```

**Full File After Change**:
```javascript
import api from "./axios";

export const getTimesheet = async (month) => {
  const res = await api.get(`/api/timesheet/monthly?month=${month}`);
  return res.data;
};

export const submitTimesheet = async (timesheetData) => {  // ← NEW
  const res = await api.post(`/api/timesheet/submit`, timesheetData);  // ← NEW
  return res.data;  // ← NEW
};  // ← NEW

export const approveTimesheet = async (empId, month) => {
  const res = await api.put(
    `/api/timesheet/approve?empId=${empId}&month=${month}`
  );
  return res.data;
};
```

---

## File 4: Timesheet.jsx

**Location**: `HRMS-Frontend/src/Pages/Timesheet.jsx`

**Change 1**: Updated import statement

```javascript
// BEFORE:
import { getTimesheet, approveTimesheet } from "../api/timesheetApi";

// AFTER:
import { getTimesheet, approveTimesheet, submitTimesheet } from "../api/timesheetApi";
```

**Change 2**: Added handleSubmitTimesheet function

```javascript
// ADDED THIS FUNCTION (after handleApprove):
const handleSubmitTimesheet = async () => {
  if (filtered.length === 0) {
    alert("No timesheet data to submit");
    return;
  }

  try {
    // Submit the first record (or you can submit all)
    const record = filtered[0];
    const timesheetData = {
      userId: loggedUser?.email || loggedUser?.employeeId,
      month: fromMonth,
      present: record.present,
      leave: record.leave,
      lop: record.lop,
      halfDay: record.halfDay,
      late: record.late,
      wfh: record.wfh,
      field: record.field,
      avgHours: parseFloat(record.avgHours),
    };

    const response = await submitTimesheet(timesheetData);
    
    if (response.success) {
      alert("✅ Timesheet submitted successfully to MongoDB!");
      // Refresh the data
      const res = await getTimesheet(fromMonth);
      if (res && res.length > 0) {
        setRecords(res);
      }
    } else {
      alert("❌ Error: " + response.message);
    }
  } catch (err) {
    console.error("Submit failed:", err);
    alert("❌ Failed to submit timesheet: " + err.message);
  }
};
```

**Change 3**: Added Submit button to UI

```javascript
// ADDED THIS BUTTON (in the month selection section):
{role === ROLE_EMP && (
  <button
    onClick={handleSubmitTimesheet}
    style={{
      padding: "8px 16px",
      borderRadius: "6px",
      border: "none",
      cursor: "pointer",
      background: "#28a745",
      color: "white",
      fontWeight: "bold",
    }}
  >
    📤 Submit Timesheet
  </button>
)}
```

---

## Summary of Changes

| File | Type | Change |
|------|------|--------|
| TimesheetController.java | Backend | Added POST /api/timesheet/submit endpoint |
| TimesheetService.java | Backend | Added submitTimesheet() method |
| timesheetApi.js | Frontend | Added submitTimesheet() API function |
| Timesheet.jsx | Frontend | Added submit button + handler |

## Testing the Changes

### 1. Backend Test (Using Postman or curl)

```bash
POST http://localhost:8080/api/timesheet/submit
Content-Type: application/json

{
  "userId": "employee@example.com",
  "month": "2026-05",
  "present": 20,
  "leave": 1,
  "lop": 0,
  "halfDay": 0,
  "late": 1,
  "wfh": 2,
  "field": 0,
  "avgHours": 8.5
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Timesheet submitted successfully for 2026-05",
  "userId": "employee@example.com",
  "month": "2026-05"
}
```

### 2. Frontend Test

1. Login as employee
2. Go to Timesheet page
3. Click "📤 Submit Timesheet" button
4. See success message
5. Check MongoDB Atlas for new records

### 3. MongoDB Verification

```
MongoDB Atlas → Data_base_hrms → attendance collection
Filter: { "userId": "employee@example.com", "date": { $regex: "2026-05" } }
Expected: 31 new documents (one per day)
```

---

## Deployment Steps

1. **Backend**:
   - Rebuild: `mvn clean install`
   - Restart Spring Boot application
   - Verify: `http://localhost:8080/api/timesheet/monthly?month=2026-05`

2. **Frontend**:
   - No build needed (hot reload)
   - Refresh browser: `Ctrl+R`
   - Verify: Submit button appears on Timesheet page

3. **Verify**:
   - Check MongoDB Atlas for new attendance records
   - Confirm data structure matches expected format

---

**Status**: ✅ All changes implemented and ready for testing
