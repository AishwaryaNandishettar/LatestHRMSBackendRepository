package com.omoikaneinnovation.hmrsbackend.service;

import com.omoikaneinnovation.hmrsbackend.dto.AttendanceSummary;
import com.omoikaneinnovation.hmrsbackend.model.Attendance;
import com.omoikaneinnovation.hmrsbackend.repository.AttendanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AttendanceIntegrationService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    /**
     * Get monthly attendance summary for an employee
     * @param employeeId Employee ID
     * @param month Month in format "May-2026"
     * @return AttendanceSummary
     */
    public AttendanceSummary getMonthlyAttendance(String employeeId, String month) {
        try {
            // Parse month (e.g., "May-2026" -> 2026-05)
            String[] parts = month.split("-");
            String monthName = parts[0];
            int year = Integer.parseInt(parts[1]);
            
            DateTimeFormatter inputFormatter = DateTimeFormatter.ofPattern("MMMM-yyyy");
            YearMonth yearMonth = YearMonth.parse(month, inputFormatter);
            
            int totalWorkingDays = yearMonth.lengthOfMonth(); // Simplified: all days are working days
            
            // Get all attendance records for this employee in this month
            List<Attendance> attendanceList = attendanceRepository.findByUserId(employeeId);
            
            // Filter by month
            List<Attendance> monthlyAttendance = attendanceList.stream()
                .filter(att -> {
                    if (att.getDate() == null) return false;
                    try {
                        LocalDate attDate = LocalDate.parse(att.getDate());
                        return attDate.getYear() == year && 
                               attDate.getMonth().toString().equalsIgnoreCase(monthName);
                    } catch (Exception e) {
                        return false;
                    }
                })
                .collect(Collectors.toList());
            
            int presentDays = monthlyAttendance.size();
            int absentDays = totalWorkingDays - presentDays;
            
            // Calculate late arrivals (check-in after 10:00 AM)
            int lateArrivals = (int) monthlyAttendance.stream()
                .filter(att -> {
                    if (att.getCheckIn() == null) return false;
                    try {
                        String[] timeParts = att.getCheckIn().split(":");
                        int hour = Integer.parseInt(timeParts[0]);
                        return hour >= 10; // Late if after 10 AM
                    } catch (Exception e) {
                        return false;
                    }
                })
                .count();
            
            // Calculate total worked minutes
            int totalWorkedMinutes = monthlyAttendance.stream()
                .mapToInt(Attendance::getWorkedMinutes)
                .sum();
            
            // Calculate overtime (if worked more than 8 hours per day)
            int expectedMinutes = presentDays * 8 * 60; // 8 hours per day
            int overtimeMinutes = Math.max(0, totalWorkedMinutes - expectedMinutes);
            
            double attendancePercentage = totalWorkingDays > 0 
                ? (presentDays * 100.0) / totalWorkingDays 
                : 0.0;
            
            return AttendanceSummary.builder()
                .employeeId(employeeId)
                .month(month)
                .totalWorkingDays(totalWorkingDays)
                .presentDays(presentDays)
                .absentDays(absentDays)
                .halfDays(0) // Can be enhanced later
                .lateArrivals(lateArrivals)
                .earlyDepartures(0) // Can be enhanced later
                .attendancePercentage(Math.round(attendancePercentage * 100.0) / 100.0)
                .totalWorkedMinutes(totalWorkedMinutes)
                .overtimeMinutes(overtimeMinutes)
                .build();
                
        } catch (Exception e) {
            System.err.println("Error calculating attendance summary: " + e.getMessage());
            // Return default summary
            return AttendanceSummary.builder()
                .employeeId(employeeId)
                .month(month)
                .totalWorkingDays(30)
                .presentDays(0)
                .absentDays(30)
                .attendancePercentage(0.0)
                .build();
        }
    }

    /**
     * Calculate attendance bonus based on attendance percentage
     * @param summary AttendanceSummary
     * @return Bonus amount
     */
    public Double calculateAttendanceBonus(AttendanceSummary summary) {
        if (summary == null || summary.getAttendancePercentage() == null) {
            return 0.0;
        }
        
        double percentage = summary.getAttendancePercentage();
        
        // Bonus rules
        if (percentage >= 98.0) {
            return 2000.0; // Excellent attendance
        } else if (percentage >= 95.0) {
            return 1500.0; // Very good attendance
        } else if (percentage >= 90.0) {
            return 1000.0; // Good attendance
        } else if (percentage >= 85.0) {
            return 500.0; // Average attendance
        } else {
            return 0.0; // Below average
        }
    }

    /**
     * Calculate late arrival deduction
     * @param summary AttendanceSummary
     * @return Deduction amount
     */
    public Double calculateLateDeduction(AttendanceSummary summary) {
        if (summary == null || summary.getLateArrivals() == null) {
            return 0.0;
        }
        
        // Deduct ₹100 per late arrival
        return summary.getLateArrivals() * 100.0;
    }

    /**
     * Calculate overtime pay
     * @param summary AttendanceSummary
     * @param hourlyRate Hourly rate
     * @return Overtime pay amount
     */
    public Double calculateOvertimePay(AttendanceSummary summary, Double hourlyRate) {
        if (summary == null || summary.getOvertimeMinutes() == null || hourlyRate == null) {
            return 0.0;
        }
        
        // Overtime rate is 1.5x normal rate
        double overtimeHours = summary.getOvertimeMinutes() / 60.0;
        return overtimeHours * hourlyRate * 1.5;
    }
}
