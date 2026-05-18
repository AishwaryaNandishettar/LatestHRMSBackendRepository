package com.omoikaneinnovation.hmrsbackend.service;

import com.omoikaneinnovation.hmrsbackend.dto.LeaveSummary;
import com.omoikaneinnovation.hmrsbackend.model.LeaveRequest;
import com.omoikaneinnovation.hmrsbackend.repository.LeaveRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LeaveIntegrationService {

    @Autowired
    private LeaveRepository leaveRepository;

    /**
     * Get monthly leave summary for an employee
     * @param employeeId Employee ID
     * @param month Month in format "May-2026"
     * @return LeaveSummary
     */
    public LeaveSummary getMonthlyLeaves(String employeeId, String month) {
        try {
            // Parse month
            String[] parts = month.split("-");
            String monthName = parts[0];
            int year = Integer.parseInt(parts[1]);
            
            // Get all approved leave requests for this employee
            List<LeaveRequest> allLeaves = leaveRepository.findByUserId(employeeId);
            
            // Filter approved leaves that fall in this month
            List<LeaveRequest> monthlyLeaves = allLeaves.stream()
                .filter(leave -> "APPROVED".equalsIgnoreCase(leave.getStatus()))
                .filter(leave -> isLeaveInMonth(leave, monthName, year))
                .collect(Collectors.toList());
            
            int casualLeave = 0;
            int sickLeave = 0;
            int earnedLeave = 0;
            int unpaidLeave = 0;
            int totalDays = 0;
            
            for (LeaveRequest leave : monthlyLeaves) {
                int days = calculateLeaveDays(leave, monthName, year);
                totalDays += days;
                
                String leaveType = leave.getLeaveType();
                if (leaveType != null) {
                    if (leaveType.toLowerCase().contains("casual")) {
                        casualLeave += days;
                    } else if (leaveType.toLowerCase().contains("sick")) {
                        sickLeave += days;
                    } else if (leaveType.toLowerCase().contains("earned")) {
                        earnedLeave += days;
                    } else if (leaveType.toLowerCase().contains("unpaid") || 
                               leaveType.toLowerCase().contains("lop")) {
                        unpaidLeave += days;
                    }
                }
            }
            
            int paidLeave = casualLeave + sickLeave + earnedLeave;
            
            return LeaveSummary.builder()
                .employeeId(employeeId)
                .month(month)
                .totalLeaveDays(totalDays)
                .paidLeaveDays(paidLeave)
                .unpaidLeaveDays(unpaidLeave)
                .casualLeave(casualLeave)
                .sickLeave(sickLeave)
                .earnedLeave(earnedLeave)
                .lopDays(unpaidLeave)
                .build();
                
        } catch (Exception e) {
            System.err.println("Error calculating leave summary: " + e.getMessage());
            return LeaveSummary.builder()
                .employeeId(employeeId)
                .month(month)
                .totalLeaveDays(0)
                .paidLeaveDays(0)
                .unpaidLeaveDays(0)
                .lopDays(0)
                .build();
        }
    }

    /**
     * Check if leave falls in the given month
     */
    private boolean isLeaveInMonth(LeaveRequest leave, String monthName, int year) {
        try {
            LocalDate startDate = LocalDate.parse(leave.getStartDate());
            LocalDate endDate = LocalDate.parse(leave.getEndDate());
            
            // Check if any part of the leave falls in this month
            LocalDate monthStart = LocalDate.of(year, 
                java.time.Month.valueOf(monthName.toUpperCase()), 1);
            LocalDate monthEnd = monthStart.plusMonths(1).minusDays(1);
            
            return !(endDate.isBefore(monthStart) || startDate.isAfter(monthEnd));
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Calculate number of leave days in the given month
     */
    private int calculateLeaveDays(LeaveRequest leave, String monthName, int year) {
        try {
            LocalDate startDate = LocalDate.parse(leave.getStartDate());
            LocalDate endDate = LocalDate.parse(leave.getEndDate());
            
            LocalDate monthStart = LocalDate.of(year, 
                java.time.Month.valueOf(monthName.toUpperCase()), 1);
            LocalDate monthEnd = monthStart.plusMonths(1).minusDays(1);
            
            // Adjust dates to month boundaries
            LocalDate effectiveStart = startDate.isBefore(monthStart) ? monthStart : startDate;
            LocalDate effectiveEnd = endDate.isAfter(monthEnd) ? monthEnd : endDate;
            
            return (int) ChronoUnit.DAYS.between(effectiveStart, effectiveEnd) + 1;
        } catch (Exception e) {
            return 0;
        }
    }

    /**
     * Calculate LOP (Loss of Pay) deduction
     * @param summary LeaveSummary
     * @param dailySalary Daily salary amount
     * @return LOP deduction amount
     */
    public Double calculateLOPDeduction(LeaveSummary summary, Double dailySalary) {
        if (summary == null || summary.getLopDays() == null || dailySalary == null) {
            return 0.0;
        }
        
        return summary.getLopDays() * dailySalary;
    }
}
