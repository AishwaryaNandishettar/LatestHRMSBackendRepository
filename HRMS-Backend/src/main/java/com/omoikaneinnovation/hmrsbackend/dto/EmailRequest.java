package com.omoikaneinnovation.hmrsbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.*;
import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * DTO for email requests
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailRequest {

    private String to;
    private List<String> toList;
    private String subject;
    private String templateName;
    private Map<String, Object> templateVariables;
    private EmailType emailType;
    private String meetingId;
    private Instant scheduledTime;

    /**
     * Email type enumeration
     */
    public enum EmailType {
        MEETING_INVITATION,
        MEETING_UPDATE,
        MEETING_REMINDER_24H,
        MEETING_REMINDER_1H,
        MEETING_REMINDER_15M,
        MEETING_CANCELLATION,
        MEETING_RESCHEDULED,
        GENERAL
    }
}
