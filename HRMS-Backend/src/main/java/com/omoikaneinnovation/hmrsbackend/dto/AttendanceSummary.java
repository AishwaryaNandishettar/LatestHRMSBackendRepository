package com.omoikaneinnovation.hmrsbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceSummary {
    private String employeeId;
    private String month;
    private Integer totalWorkingDays;
    private Integer presentDays;
    private Integer absentDays;
    private Integer halfDays;
    private Integer lateArrivals;
    private Integer earlyDepartures;
    private Double attendancePercentage;
    private Integer totalWorkedMinutes;
    private Integer overtimeMinutes;
}
