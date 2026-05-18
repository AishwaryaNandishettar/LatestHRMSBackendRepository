package com.omoikaneinnovation.hmrsbackend.model;
import lombok.*;
import lombok.Data;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimesheetSummary {

    private String empId;
    private String empName;
    private String department;
    private String reportingManager;
    private String month;

    private int present;
    private int leave;
    private int lop;
    private int halfDay;
    private int late;
    private int wfh;
    private int field;

    private double avgHours;
    private String approval;

    // getters setters
}