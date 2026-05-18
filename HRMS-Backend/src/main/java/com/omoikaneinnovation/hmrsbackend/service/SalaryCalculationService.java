package com.omoikaneinnovation.hmrsbackend.service;

import com.omoikaneinnovation.hmrsbackend.dto.*;
import com.omoikaneinnovation.hmrsbackend.model.Payroll;
import com.omoikaneinnovation.hmrsbackend.model.User;
import com.omoikaneinnovation.hmrsbackend.repository.PayrollRepository;
import com.omoikaneinnovation.hmrsbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SalaryCalculationService {

    @Autowired
    private PayrollRepository payrollRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AttendanceIntegrationService attendanceService;

    @Autowired
    private LeaveIntegrationService leaveService;

    @Autowired
    private PerformanceIntegrationService performanceService;

    /**
     * Calculate salary for a single employee with real-time data
     * @param request SalaryCalculationRequest
     * @return SalaryCalculationResult
     */
    public SalaryCalculationResult calculateSalary(SalaryCalculationRequest request) {
        String employeeId = request.getEmployeeId();
        String month = request.getMonth();

        // Get existing payroll record (for base salary components)
        Optional<Payroll> payrollOpt = payrollRepository.findByEmployeeId(employeeId);
        Payroll existingPayroll = payrollOpt.orElse(new Payroll());

        // Get employee details
        User user = userRepository.findByEmployeeId(employeeId);

        // Initialize base salary components from existing payroll
        Double basic = existingPayroll.getBasic() != null ? existingPayroll.getBasic() : 0.0;
        Double hra = existingPayroll.getHra() != null ? existingPayroll.getHra() : 0.0;
        Double allowance = existingPayroll.getAllowance() != null ? existingPayroll.getAllowance() : 0.0;
        Double bonus = existingPayroll.getBonus() != null ? existingPayroll.getBonus() : 0.0;
        Double incentive = existingPayroll.getIncentive() != null ? existingPayroll.getIncentive() : 0.0;
        Double conveyance = 0.0; // Default

        // Initialize deductions from existing payroll
        Double pf = existingPayroll.getPf() != null ? existingPayroll.getPf() : 0.0;
        Double esi = existingPayroll.getEsi() != null ? existingPayroll.getEsi() : 0.0;
        Double tax = existingPayroll.getTax() != null ? existingPayroll.getTax() : 0.0;
        Double professionalTax = 0.0; // Default
        Double deduction = existingPayroll.getDeduction() != null ? existingPayroll.getDeduction() : 0.0;
        Double otherDeduction = 0.0;

        // Real-time calculated components
        Double attendanceBonus = 0.0;
        Double performanceBonus = 0.0;
        Double overtimePay = 0.0;
        Double lopDeduction = 0.0;
        Double lateDeduction = 0.0;

        // Attendance data
        AttendanceSummary attendanceSummary = null;
        Integer totalWorkingDays = 30;
        Integer presentDays = 30;
        Integer absentDays = 0;
        Integer leaveDays = 0;
        Integer lopDays = 0;
        Double attendancePercentage = 100.0;

        // Performance data
        Double performanceRating = 3.0;

        // Calculate attendance-based components
        if (Boolean.TRUE.equals(request.getIncludeAttendance())) {
            attendanceSummary = attendanceService.getMonthlyAttendance(employeeId, month);
            
            if (attendanceSummary != null) {
                totalWorkingDays = attendanceSummary.getTotalWorkingDays();
                presentDays = attendanceSummary.getPresentDays();
                absentDays = attendanceSummary.getAbsentDays();
                attendancePercentage = attendanceSummary.getAttendancePercentage();
                
                // Calculate attendance bonus
                attendanceBonus = attendanceService.calculateAttendanceBonus(attendanceSummary);
                
                // Calculate late deduction
                lateDeduction = attendanceService.calculateLateDeduction(attendanceSummary);
                
                // Calculate overtime pay
                Double hourlyRate = basic / (totalWorkingDays * 8.0); // Assuming 8 hours per day
                overtimePay = attendanceService.calculateOvertimePay(attendanceSummary, hourlyRate);
            }
        }

        // Calculate leave-based deductions
        if (Boolean.TRUE.equals(request.getIncludeLeave())) {
            LeaveSummary leaveSummary = leaveService.getMonthlyLeaves(employeeId, month);
            
            if (leaveSummary != null) {
                leaveDays = leaveSummary.getTotalLeaveDays();
                lopDays = leaveSummary.getLopDays();
                
                // Calculate LOP deduction
                Double dailySalary = basic / totalWorkingDays;
                lopDeduction = leaveService.calculateLOPDeduction(leaveSummary, dailySalary);
            }
        }

        // Calculate performance bonus
        if (Boolean.TRUE.equals(request.getIncludePerformance())) {
            performanceRating = performanceService.getPerformanceRating(employeeId);
            performanceBonus = performanceService.calculatePerformanceBonus(performanceRating, basic);
        }

        // Calculate totals
        Double grossSalary = basic + hra + allowance + bonus + incentive + conveyance 
                           + attendanceBonus + performanceBonus + overtimePay;

        Double totalDeductions = pf + esi + tax + professionalTax + deduction 
                               + lopDeduction + lateDeduction + otherDeduction;

        Double netSalary = grossSalary - totalDeductions;

        // Create breakdown map
        Map<String, Object> breakdown = new HashMap<>();
        breakdown.put("earnings", Map.of(
            "basic", basic,
            "hra", hra,
            "allowance", allowance,
            "bonus", bonus,
            "incentive", incentive,
            "conveyance", conveyance,
            "attendanceBonus", attendanceBonus,
            "performanceBonus", performanceBonus,
            "overtimePay", overtimePay
        ));
        breakdown.put("deductions", Map.of(
            "pf", pf,
            "esi", esi,
            "tax", tax,
            "professionalTax", professionalTax,
            "deduction", deduction,
            "lopDeduction", lopDeduction,
            "lateDeduction", lateDeduction,
            "otherDeduction", otherDeduction
        ));
        breakdown.put("attendance", attendanceSummary);

        // Build result
        return SalaryCalculationResult.builder()
            .employeeId(employeeId)
            .empName(user != null ? user.getName() : existingPayroll.getEmpCode())
            .department(user != null ? user.getDepartment() : existingPayroll.getDepartment())
            .month(month)
            // Earnings
            .basic(basic)
            .hra(hra)
            .allowance(allowance)
            .bonus(bonus)
            .incentive(incentive)
            .conveyance(conveyance)
            .attendanceBonus(attendanceBonus)
            .performanceBonus(performanceBonus)
            .overtimePay(overtimePay)
            // Deductions
            .pf(pf)
            .esi(esi)
            .tax(tax)
            .professionalTax(professionalTax)
            .deduction(deduction)
            .lopDeduction(lopDeduction)
            .lateDeduction(lateDeduction)
            .otherDeduction(otherDeduction)
            // Totals
            .grossSalary(grossSalary)
            .totalDeductions(totalDeductions)
            .netSalary(netSalary)
            // Attendance
            .totalWorkingDays(totalWorkingDays)
            .presentDays(presentDays)
            .absentDays(absentDays)
            .leaveDays(leaveDays)
            .lopDays(lopDays)
            .attendancePercentage(attendancePercentage)
            // Performance
            .performanceRating(performanceRating)
            // Metadata
            .calculationMode("AUTO")
            .calculatedAt(System.currentTimeMillis())
            .breakdown(breakdown)
            .build();
    }

    /**
     * Calculate salary for all employees
     * @param month Month in format "May-2026"
     * @return List of SalaryCalculationResult
     */
    public List<SalaryCalculationResult> calculateBulkSalary(String month) {
        List<Payroll> allPayroll = payrollRepository.findAll();
        List<SalaryCalculationResult> results = new ArrayList<>();

        for (Payroll payroll : allPayroll) {
            try {
                SalaryCalculationRequest request = SalaryCalculationRequest.builder()
                    .employeeId(payroll.getEmployeeId())
                    .month(month)
                    .includeAttendance(true)
                    .includeLeave(true)
                    .includePerformance(true)
                    .build();

                SalaryCalculationResult result = calculateSalary(request);
                results.add(result);
            } catch (Exception e) {
                System.err.println("Error calculating salary for employee " + 
                                 payroll.getEmployeeId() + ": " + e.getMessage());
            }
        }

        return results;
    }

    /**
     * Apply calculated salary to payroll record (update database)
     * @param result SalaryCalculationResult
     * @return Updated Payroll
     */
    public Payroll applySalaryCalculation(SalaryCalculationResult result) {
        // ✅ NEW: Search by employeeId AND month (prevents data conflicts)
        String month = result.getMonth();
        String employeeId = result.getEmployeeId();
        
        Payroll payroll = null;
        
        // Try to find by month first (most accurate)
        if (month != null && !month.isEmpty()) {
            payroll = payrollRepository.findByEmployeeIdAndMonth(employeeId, month);
        }
        
        // Fallback: search by employeeId
        if (payroll == null) {
            Optional<Payroll> payrollOpt = payrollRepository.findByEmployeeId(employeeId);
            payroll = payrollOpt.orElse(new Payroll());
        }

        // Update with calculated values
        payroll.setEmployeeId(employeeId);
        payroll.setMonth(month);
        
        // Update earnings
        payroll.setBasic(result.getBasic());
        payroll.setHra(result.getHra());
        payroll.setAllowance(result.getAllowance());
        payroll.setBonus(result.getBonus() + result.getAttendanceBonus() + result.getPerformanceBonus());
        payroll.setIncentive(result.getIncentive());
        
        // Update deductions
        payroll.setPf(result.getPf());
        payroll.setEsi(result.getEsi());
        payroll.setTax(result.getTax());
        payroll.setDeduction(result.getDeduction() + result.getLateDeduction() + result.getOtherDeduction());
        
        // Update totals
        payroll.setGross(result.getGrossSalary());
        payroll.setNet(result.getNetSalary());
        
        // Update attendance data
        payroll.setWorkingDays(result.getTotalWorkingDays());
        payroll.setPaidDays(result.getPresentDays());
        payroll.setLopDays(result.getLopDays());
        
        // Update metadata
        payroll.setUpdatedAt(System.currentTimeMillis());
        
        System.out.println("✅ APPLIED SALARY CALCULATION: empId=" + employeeId + 
                         ", month=" + month +
                         ", gross=" + result.getGrossSalary() + 
                         ", net=" + result.getNetSalary());
        
        return payrollRepository.save(payroll);
    }
}
