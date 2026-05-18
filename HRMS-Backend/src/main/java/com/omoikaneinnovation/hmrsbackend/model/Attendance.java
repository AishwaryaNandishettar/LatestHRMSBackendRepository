package com.omoikaneinnovation.hmrsbackend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "attendance")
public class Attendance {

    @Id
    private String id;

    private String userId;
    private String empId;
    private String name;
    private String department;
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
    private String reportingManager;
    private String managerId;
    private String managerEmail;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getEmpId() { return empId; }
    public void setEmpId(String empId) { this.empId = empId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getCheckIn() { return checkIn; }
    public void setCheckIn(String checkIn) { this.checkIn = checkIn; }

    public String getCheckOut() { return checkOut; }
    public void setCheckOut(String checkOut) { this.checkOut = checkOut; }

    public int getWorkedMinutes() { return workedMinutes; }
    public void setWorkedMinutes(int workedMinutes) { this.workedMinutes = workedMinutes; }

    public String getLocationIn() { return locationIn; }
    public void setLocationIn(String locationIn) { this.locationIn = locationIn; }

    public String getLocationOut() { return locationOut; }
    public void setLocationOut(String locationOut) { this.locationOut = locationOut; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAttendanceType() { return attendanceType; }
    public void setAttendanceType(String attendanceType) { this.attendanceType = attendanceType; }

    public String getLate() { return late; }
    public void setLate(String late) { this.late = late; }

    public String getEarlyLeave() { return earlyLeave; }
    public void setEarlyLeave(String earlyLeave) { this.earlyLeave = earlyLeave; }

    public String getTos() { return tos; }
    public void setTos(String tos) { this.tos = tos; }

    public String getReportingManager() { return reportingManager; }
    public void setReportingManager(String reportingManager) { this.reportingManager = reportingManager; }

    public String getManagerId() { return managerId; }
    public void setManagerId(String managerId) { this.managerId = managerId; }

    public String getManagerEmail() { return managerEmail; }
    public void setManagerEmail(String managerEmail) { this.managerEmail = managerEmail; }
}
