package com.omoikaneinnovation.hmrsbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveSummary {
    private String employeeId;
    private String month;
    private Integer totalLeaveDays;
    private Integer paidLeaveDays;
    private Integer unpaidLeaveDays;
    private Integer casualLeave;
    private Integer sickLeave;
    private Integer earnedLeave;
    private Integer lopDays; // Loss of Pay days
}
