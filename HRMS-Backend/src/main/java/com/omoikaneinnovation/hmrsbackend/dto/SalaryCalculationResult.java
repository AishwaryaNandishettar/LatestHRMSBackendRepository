package com.omoikaneinnovation.hmrsbackend.dto;
import lombok.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
@Getter
@Setter
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalaryCalculationResult {
    private String employeeId;
    private String empName;
    private String department;
    private String month;
    
    // Earnings
    private Double basic;
    private Double hra;
    private Double allowance;
    private Double bonus;
    private Double incentive;
    private Double conveyance;
    private Double attendanceBonus;
    private Double performanceBonus;
    private Double overtimePay;
    
    // Deductions
    private Double pf;
    private Double esi;
    private Double tax;
    private Double professionalTax;
    private Double deduction;
    private Double lopDeduction;
    private Double lateDeduction;
    private Double otherDeduction;
    
    // Totals
    private Double grossSalary;
    private Double totalDeductions;
    private Double netSalary;
    
    // Attendance Data
    private Integer totalWorkingDays;
    private Integer presentDays;
    private Integer absentDays;
    private Integer leaveDays;
    private Integer lopDays;
    private Double attendancePercentage;
    
    // Performance Data
    private Double performanceRating;
    
    // Calculation Metadata
    private String calculationMode; // AUTO / MANUAL
    private Long calculatedAt;
    private Map<String, Object> breakdown; // Detailed breakdown
}
