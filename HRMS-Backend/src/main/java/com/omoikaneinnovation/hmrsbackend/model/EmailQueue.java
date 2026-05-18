package com.omoikaneinnovation.hmrsbackend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;
import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * Email queue model for storing pending and failed emails
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "email_queue")
public class EmailQueue {

    @Id
    private String id;
    
    private List<String> recipients;
    private String subject;
    private String templateName;
    private Map<String, Object> templateVariables;
    private String emailType;
    private String meetingId;
    
    @Builder.Default
    private EmailStatus status = EmailStatus.PENDING;
    
    @Builder.Default
    private int retryCount = 0;
    
    @Builder.Default
    private int maxRetries = 3;
    
    private Instant createdAt;
    private Instant updatedAt;
    private Instant scheduledAt;
    private Instant lastAttemptAt;
    private Instant sentAt;
    private String errorMessage;

    /**
     * Email status enumeration
     */
    public enum EmailStatus {
        PENDING,
        PROCESSING,
        SENT,
        FAILED,
        CANCELLED
    }
}
