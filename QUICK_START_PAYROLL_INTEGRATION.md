# 🚀 Quick Start: Real-Time Payroll Calculation

## ⚡ 5-Minute Setup Guide

### **Step 1: Restart Backend** (2 minutes)

```bash
cd HRMS-Backend
mvn clean install
mvn spring-boot:run
```

Wait for: `Started HmrsBackendApplication`

### **Step 2: Restart Frontend** (1 minute)

```bash
cd HRMS-Frontend
npm install  # Only if new dependencies
npm run dev
```

Wait for: `Local: http://localhost:5173`

### **Step 3: Test the Feature** (2 minutes)

1. **Login as Admin**
   - Go to http://localhost:5173
   - Login with admin credentials

2. **Navigate to Update Payroll**
   - Click "Payroll" in sidebar
   - Click "Update Payroll" button

3. **Click Auto Calculate**
   - Find any employee row
   - Click "🔄 Auto Calculate" button
   - Modal opens with calculation options

4. **Calculate Salary**
   - Keep all checkboxes checked
   - Click "🔄 Calculate Salary"
   - View detailed breakdown

5. **Apply to Payroll**
   - Review the results
   - Click "✅ Apply to Payroll"
   - Done! Salary updated in database

---

## 📋 What You Get

### **Automatic Calculations:**
- ✅ Attendance Bonus (based on attendance %)
- ✅ Performance Bonus (based on rating)
- ✅ Overtime Pay (1.5x hourly rate)
- ✅ LOP Deduction (unpaid leave days)
- ✅ Late Deduction (₹100 per late arrival)

### **Real-Time Integration:**
- ✅ Pulls data from Attendance module
- ✅ Pulls data from Leave module
- ✅ Pulls data from Performance module
- ✅ Calculates instantly

### **User-Friendly UI:**
- ✅ Modal-based interface
- ✅ Detailed breakdown
- ✅ Preview before applying
- ✅ One-click apply

---

## 🎯 Key Features

### **1. Attendance Bonus Rules**
```
98%+ attendance → ₹2,000 bonus
95-98% attendance → ₹1,500 bonus
90-95% attendance → ₹1,000 bonus
85-90% attendance → ₹500 bonus
Below 85% → No bonus
```

### **2. Performance Bonus Rules**
```
4.5+ rating → 25% of basic salary
4.0-4.5 rating → 20% of basic salary
3.5-4.0 rating → 15% of basic salary
3.0-3.5 rating → 10% of basic salary
2.5-3.0 rating → 5% of basic salary
Below 2.5 → No bonus
```

### **3. Deduction Rules**
```
LOP Deduction = Unpaid Leave Days × Daily Salary
Late Deduction = Late Arrivals × ₹100
```

---

## 🔧 API Endpoints (For Testing)

### **Calculate Single Employee**
```bash
POST http://localhost:8080/api/payroll/calculate
Content-Type: application/json

{
  "employeeId": "EMP001",
  "month": "May-2026",
  "includeAttendance": true,
  "includeLeave": true,
  "includePerformance": true
}
```

### **Calculate All Employees**
```bash
POST http://localhost:8080/api/payroll/calculate-all?month=May-2026
```

### **Calculate and Apply**
```bash
POST http://localhost:8080/api/payroll/calculate-and-apply
Content-Type: application/json

{
  "employeeId": "EMP001",
  "month": "May-2026",
  "includeAttendance": true,
  "includeLeave": true,
  "includePerformance": true
}
```

---

## 📝 Files Added/Modified

### **New Backend Files:**
1. `SalaryCalculationRequest.java` - Request DTO
2. `SalaryCalculationResult.java` - Response DTO
3. `AttendanceSummary.java` - Attendance data DTO
4. `LeaveSummary.java` - Leave data DTO
5. `AttendanceIntegrationService.java` - Attendance integration
6. `LeaveIntegrationService.java` - Leave integration
7. `PerformanceIntegrationService.java` - Performance integration
8. `SalaryCalculationService.java` - Main calculation engine

### **Modified Backend Files:**
1. `PayrollController.java` - Added 4 new endpoints

### **New Frontend Files:**
1. `SalaryCalculationModal.jsx` - Calculation modal UI
2. `SalaryCalculationModal.css` - Modal styles

### **Modified Frontend Files:**
1. `payrollApi.js` - Added 4 new API functions
2. `UpdatePayroll.jsx` - Added auto-calculate button & modal

---

## ✅ Verification Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can login as admin
- [ ] Can navigate to Update Payroll
- [ ] Can see "Auto Calculate" button
- [ ] Modal opens when button clicked
- [ ] Can calculate salary
- [ ] Can see detailed breakdown
- [ ] Can apply to payroll
- [ ] Database updates successfully

---

## 🐛 Common Issues

### **Issue: Button not visible**
**Fix:** Clear browser cache and refresh

### **Issue: Modal doesn't open**
**Fix:** Check browser console for errors

### **Issue: Calculation returns zeros**
**Fix:** Ensure attendance/leave/performance data exists

### **Issue: Backend error 500**
**Fix:** Check backend logs for stack trace

---

## 📞 Need Help?

1. Check `PAYROLL_INTEGRATION_GUIDE.md` for detailed documentation
2. Review backend logs: `HRMS-Backend/logs/`
3. Check browser console for frontend errors
4. Test API endpoints directly using Postman/curl

---

## 🎉 Success!

If you can calculate and apply salary successfully, the integration is working perfectly!

**Next Steps:**
- Test with different employees
- Test with different months
- Customize bonus rules (see main guide)
- Add more features (see Phase 2 enhancements)

---

**Enjoy your new real-time payroll calculation system! 🚀**
