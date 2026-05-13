package com.omoikaneinnovation.hmrsbackend.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AttendanceDTO {
    private String id;
    private String userId;
    private String managerId;
    private String managerEmail;
    private String empId;              // proper employee ID like OMOI123
    private String name;
    private String department;
    private String reportingManager;   // reporting manager name
    private String date;
    private String checkIn;
    private String checkOut;
    private int workedMinutes;
    private String locationIn;
    private String locationOut;
    private String status;
    private String attendanceType;
    private String late;
    private String earlyLeave;
    private String tos;
}
