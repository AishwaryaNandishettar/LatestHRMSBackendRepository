# Performance Seeding Troubleshooting Guide

## Issue: "Failed to seed data: [object Object]"

### What I've Added to Debug:

1. **🐛 Debug Button** - Orange "Debug" button next to "Seed Data"
2. **Enhanced Error Handling** - Better error messages in frontend
3. **Backend Logging** - Console logs to track seeding process
4. **Debug Endpoint** - `/api/performance/debug` to check employee data

### How to Troubleshoot:

#### Step 1: Check Employee Data
1. **Click the orange "🐛 Debug" button**
2. **Check the alert popup** - shows employee data
3. **Check browser console** - detailed employee information

#### Step 2: Look for Common Issues
The debug will show:
- **Total employees count**
- **Each employee's name, ID, and status**
- **Which employees have `employeeId` set**
- **Which employees have `status = "ACTIVE"`**

#### Step 3: Common Problems & Solutions

**Problem 1: No Active Employees**
```
Total employees: 5
Employee: John Doe, ID: null, Status: INVITED
Employee: Jane Smith, ID: null, Status: PENDING
```
**Solution:** Change employee status to "ACTIVE" in database

**Problem 2: Missing Employee IDs**
```
Employee: John Doe, ID: null, Status: ACTIVE
Employee: Jane Smith, ID: null, Status: ACTIVE
```
**Solution:** Set `employeeId` field (like "EMP001", "EMP002") in Employee records

**Problem 3: Backend Connection Issue**
```
Debug failed: Network Error
```
**Solution:** Check if backend is running on correct port

#### Step 4: Manual Fix (if needed)

If employees don't have proper `employeeId` values, you can:

1. **Update Employee records** in database:
```sql
UPDATE employees SET employeeId = 'EMP001' WHERE fullName = 'John Doe';
UPDATE employees SET employeeId = 'EMP002' WHERE fullName = 'Jane Smith';
UPDATE employees SET status = 'ACTIVE' WHERE status != 'ACTIVE';
```

2. **Or create employees with proper IDs** through the admin interface

### Expected Debug Output (Success):
```
Total employees: 3
Employee: Adhviti Sharma, ID: EMP001, Status: ACTIVE
Employee: Mahesh Kumar, ID: EMP002, Status: ACTIVE  
Employee: Priya Patel, ID: EMP003, Status: ACTIVE
```

### Expected Seeding Success:
```
✅ Seeded performance data for 3 employees: [Adhviti Sharma, Mahesh Kumar, Priya Patel]
```

### Backend Logs to Check:
Look for these in backend console:
```
Found 3 total employees
Found 3 active employees
Processing employee: Adhviti Sharma with ID: EMP001
Created performance record for Adhviti Sharma
Seeding result: Seeded performance data for 3 employees: [Adhviti Sharma, Mahesh Kumar, Priya Patel]
```

### Next Steps:
1. **Click Debug button** to see what employee data exists
2. **Fix any missing employeeId or status issues**
3. **Try Seed Data again**
4. **Check backend console** for detailed logs

The debug feature will help identify exactly what's wrong with the employee data!