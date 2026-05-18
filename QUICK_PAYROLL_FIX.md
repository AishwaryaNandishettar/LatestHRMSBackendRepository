# Quick Fix: Payroll Auto-Calculate Error

## The Error
```
Failed to calculate salary: No static resource api/payroll/calculate
```

## Quick Diagnosis

### Step 1: Is Backend Running?
```bash
# Check if backend is running
curl http://localhost:8080/api/payroll

# If you get connection refused, backend is NOT running
# If you get JSON response, backend IS running
```

### Step 2: Check Backend Port
The error suggests the frontend is trying to reach the backend but can't find the endpoint.

**Check your backend console** - it should show:
```
Tomcat started on port(s): 8080 (http)
```

**Check your frontend .env file:**
```
VITE_API_BASE_URL=http://localhost:8080
```

### Step 3: Test the Endpoint Directly

Open a new terminal and run:
```bash
curl -X POST http://localhost:8080/api/payroll/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "OM00103",
    "month": "May-2026",
    "includeAttendance": true,
    "includeLeave": true,
    "includePerformance": true
  }'
```

**Expected Response:**
```json
{
  "employeeId": "OM00103",
  "empName": "Adhviti",
  "grossSalary": 75000,
  "netSalary": 65000,
  ...
}
```

**If you get 404 or "No static resource":**
- Backend is running but endpoint is not registered
- Check if SalaryCalculationService is properly autowired
- Check backend console for startup errors

## Common Issues & Solutions

### Issue 1: Backend Not Running
**Solution:**
```bash
cd HRMS-Backend
mvn clean install
mvn spring-boot:run
```

### Issue 2: Wrong Port
**Frontend expects:** `http://localhost:8080`
**Backend running on:** `http://localhost:8082` (wrong!)

**Solution:** Update `application.properties`:
```properties
server.port=8080
```

### Issue 3: CORS Error
**Error in browser console:** "CORS policy blocked"

**Solution:** Already configured in PayrollController:
```java
@CrossOrigin
```

### Issue 4: Missing Dependencies
**Error in backend console:** "Could not autowire SalaryCalculationService"

**Solution:** Check if all integration services exist:
- AttendanceIntegrationService.java ✅
- LeaveIntegrationService.java ✅
- PerformanceIntegrationService.java ✅

### Issue 5: Frontend API Call Issue
**Check browser DevTools → Network tab**

Look for the request to `/api/payroll/calculate`:
- **Status 404**: Endpoint doesn't exist (backend issue)
- **Status 500**: Server error (check backend logs)
- **Status 403**: Permission denied (check security config)
- **Failed to fetch**: Backend not running

## Immediate Action Plan

1. **Start Backend** (if not running)
   ```bash
   cd HRMS-Backend
   mvn spring-boot:run
   ```

2. **Check Backend Console** for errors

3. **Test Endpoint** using curl (see Step 3 above)

4. **Check Frontend** browser console for errors

5. **Verify .env** file has correct backend URL

## Still Not Working?

### Check Backend Logs
Look for these errors:
```
Error creating bean 'salaryCalculationService'
Could not autowire field
NoSuchBeanDefinitionException
```

### Check Frontend Console
Look for these errors:
```
Failed to fetch
Network Error
CORS policy
404 Not Found
```

### Restart Everything
```bash
# Stop backend (Ctrl+C)
# Stop frontend (Ctrl+C)

# Start backend
cd HRMS-Backend
mvn clean spring-boot:run

# Start frontend (in new terminal)
cd HRMS-Frontend
npm run dev
```

## Need More Help?

1. Share the **exact error message** from:
   - Backend console
   - Frontend browser console
   - Network tab in DevTools

2. Confirm:
   - Backend port: `____`
   - Frontend port: `____`
   - VITE_API_BASE_URL: `____`

3. Test the curl command and share the response

---

**Next:** Once this is fixed, we'll implement:
1. ✅ Bulk Auto-Calculate (calculate all employees at once)
2. ✅ Variable Salary Column
3. ✅ Payroll Reports (Excel/PDF export)

See `PAYROLL_ENHANCEMENTS_GUIDE.md` for details!
