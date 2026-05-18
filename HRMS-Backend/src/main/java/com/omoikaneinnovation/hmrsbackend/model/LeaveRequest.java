package com.omoikaneinnovation.hmrsbackend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "leave_requests")
public class LeaveRequest {

    @Id
    private String id;

    private String userId;
    private String leaveType;
    private String startDate;
    private String endDate;
    private String reason;
    private String status; // PENDING, APPROVED, REJECTED
    private String employeeName;

   private String managerEmail;

   public String getManagerEmail() {
    return managerEmail;
}

public void setManagerEmail(String managerEmail) {
    this.managerEmail = managerEmail;
}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getLeaveType() { return leaveType; }
    public void setLeaveType(String leaveType) { this.leaveType = leaveType; }

    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }

    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

   public String getEmployeeName() { return employeeName; }
public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }
}