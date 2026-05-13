package com.omoikaneinnovation.hmrsbackend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
   
    @Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "resignations")
public class Resignation {

    @Id
    private String id;

    private String empId;
    private String empName;
    private String department;
    private String doj;  // ✅ Date of Joining
    private String tenure;  // ✅ Tenure

    private String managerName;  // ✅ Manager email

    private String reason;
    private String remarks;

    private String resignationDate;
    private String lastWorkingDay;

    private String status; 
    // PENDING_MANAGER, PENDING_HR, APPROVED, REJECTED

    private String approvedByManager;  // ✅ Manager who approved
    private String approvedByHR;  // ✅ HR who approved
    private String rejectionReason;  // ✅ Reason for rejection

    // getters + setters
}