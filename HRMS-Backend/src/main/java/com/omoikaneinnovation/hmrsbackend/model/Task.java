package com.omoikaneinnovation.hmrsbackend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "tasks")
public class Task {

    @Id
    private String id;

    private String title;
    private String description;

    private String assignee;    // employee EMAIL
    private String assignedBy;  // manager/admin EMAIL
    private String assigneeName; // display name (optional)
    private String assigneeId;   // employee ID (e.g. OMOI123)

    private String priority;    // HIGH, MEDIUM, LOW
    private String status;      // ASSIGNED, ACCEPTED, IN_PROGRESS, SUBMITTED, COMPLETED, REJECTED

    private int progress;       // 0–100

    private String remarks;
    private String rejectReason;

    private Date dueDate;

    private List<String> history = new ArrayList<>();

    private Date createdAt;
    private Date updatedAt;
}
