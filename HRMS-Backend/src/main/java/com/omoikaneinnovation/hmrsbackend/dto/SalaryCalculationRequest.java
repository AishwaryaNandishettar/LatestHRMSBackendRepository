package com.omoikaneinnovation.hmrsbackend.dto;
import lombok.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
@Getter
@Setter
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalaryCalculationRequest {
    private String employeeId;
    private String month; // Format: "May-2026"
    private Boolean includeAttendance;
    private Boolean includeLeave;
    private Boolean includePerformance;
}
