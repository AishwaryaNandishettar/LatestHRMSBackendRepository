package com.omoikaneinnovation.hmrsbackend.service;

import com.omoikaneinnovation.hmrsbackend.dto.EmailRequest;
import com.omoikaneinnovation.hmrsbackend.model.Meeting;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class MeetingEmailService {

    private final EmailService emailService;

    @Value("${meeting.email.from-name:HRMS Meeting System}")
    private String fromName;

    @Value("${meeting.email.from-address}")
    private String fromAddress;

    @Value("${meeting.email.base-url:https://meet.omoikaneinnovations.com}")
    private String meetingBaseUrl;

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter
            .ofPattern("EEEE, MMMM d, yyyy 'at' h:mm a");

    /**
     * Send meeting invitation emails
     */
    public void sendMeetingInvitation(Meeting meeting) {
        try {
            log.info("Sending meeting invitation for: {} to {} participants",
                    meeting.getTitle(), meeting.getParticipantEmails().size());

            Map<String, Object> templateVariables = createMeetingTemplateVariables(meeting);
            templateVariables.put("isInvitation", true);

            EmailRequest emailRequest = EmailRequest.builder()
                    .toList(meeting.getParticipantEmails())
                    .subject("ðŸ“… Meeting Invitation: " + meeting.getTitle())
                    .templateName("meeting-invitation")
                    .templateVariables(templateVariables)
                    .emailType(EmailRequest.EmailType.MEETING_INVITATION)
                    .meetingId(meeting.getId())
                    .scheduledTime(Instant.now()) // Send immediately
                    .build();

            emailService.queueEmail(emailRequest);

        } catch (Exception e) {
            log.error("Failed to send meeting invitation for meeting {}: {}", meeting.getId(), e.getMessage(), e);
        }
    }

    /**
     * Send meeting update emails
     */
    public void sendMeetingUpdate(Meeting meeting, String updateReason) {
        try {
            log.info("Sending meeting update for: {} to {} participants",
                    meeting.getTitle(), meeting.getParticipantEmails().size());

            Map<String, Object> templateVariables = createMeetingTemplateVariables(meeting);
            templateVariables.put("isUpdate", true);
            templateVariables.put("updateReason", updateReason);

            EmailRequest emailRequest = EmailRequest.builder()
                    .toList(meeting.getParticipantEmails())
                    .subject("ðŸ“ Meeting Updated: " + meeting.getTitle())
                    .templateName("meeting-invitation") // Reuse invitation template with update flag
                    .templateVariables(templateVariables)
                    .emailType(EmailRequest.EmailType.MEETING_UPDATE)
                    .meetingId(meeting.getId())
                    .scheduledTime(Instant.now()) // Send immediately
                    .build();

            emailService.queueEmail(emailRequest);

        } catch (Exception e) {
            log.error("Failed to send meeting update for meeting {}: {}", meeting.getId(), e.getMessage(), e);
        }
    }

    /**
     * Send meeting cancellation emails
     */
    public void sendMeetingCancellation(Meeting meeting, String cancellationReason) {
        try {
            log.info("Sending meeting cancellation for: {} to {} participants",
                    meeting.getTitle(), meeting.getParticipantEmails().size());

            // Cancel any pending reminder emails
            emailService.cancelQueuedEmails(meeting.getId());

            Map<String, Object> templateVariables = createMeetingTemplateVariables(meeting);
            templateVariables.put("cancellationReason", cancellationReason);
            templateVariables.put("cancellationTime", formatDateTime(Instant.now()));
            templateVariables.put("rescheduleNote",
                    "The organizer will contact you if this meeting needs to be rescheduled.");

            EmailRequest emailRequest = EmailRequest.builder()
                    .toList(meeting.getParticipantEmails())
                    .subject("âŒ Meeting Cancelled: " + meeting.getTitle())
                    .templateName("meeting-cancellation")
                    .templateVariables(templateVariables)
                    .emailType(EmailRequest.EmailType.MEETING_CANCELLATION)
                    .meetingId(meeting.getId())
                    .scheduledTime(Instant.now()) // Send immediately
                    .build();

            emailService.queueEmail(emailRequest);

        } catch (Exception e) {
            log.error("Failed to send meeting cancellation for meeting {}: {}", meeting.getId(), e.getMessage(), e);
        }
    }

    /**
     * Schedule meeting reminder emails
     */
    public void scheduleMeetingReminders(Meeting meeting) {
        try {
            log.info("Scheduling reminders for meeting: {}", meeting.getTitle());

            // Schedule 24-hour reminder
            scheduleReminder(meeting, 24 * 60, "24 hours", EmailRequest.EmailType.MEETING_REMINDER_24H);

            // Schedule 1-hour reminder
            scheduleReminder(meeting, 60, "1 hour", EmailRequest.EmailType.MEETING_REMINDER_1H);

            // Schedule 15-minute reminder
            scheduleReminder(meeting, 15, "15 minutes", EmailRequest.EmailType.MEETING_REMINDER_15M);

        } catch (Exception e) {
            log.error("Failed to schedule reminders for meeting {}: {}", meeting.getId(), e.getMessage(), e);
        }
    }

    /**
     * Schedule individual reminder
     */
    private void scheduleReminder(Meeting meeting, int minutesBefore, String timeText,
            EmailRequest.EmailType emailType) {
        Instant reminderTime = meeting.getStartTime().minusSeconds(minutesBefore * 60L);

        // Don't schedule reminders for past times
        if (reminderTime.isBefore(Instant.now())) {
            log.debug("Skipping {} reminder for meeting {} - time has passed", timeText, meeting.getId());
            return;
        }

        Map<String, Object> templateVariables = createMeetingTemplateVariables(meeting);
        templateVariables.put("reminderText", "Your meeting starts in " + timeText);
        templateVariables.put("timeUntilMeeting", timeText);

        EmailRequest emailRequest = EmailRequest.builder()
                .toList(meeting.getParticipantEmails())
                .subject("â° Reminder: " + meeting.getTitle() + " starts in " + timeText)
                .templateName("meeting-reminder")
                .templateVariables(templateVariables)
                .emailType(emailType)
                .meetingId(meeting.getId())
                .scheduledTime(reminderTime)
                .build();

        emailService.queueEmail(emailRequest);
        log.debug("Scheduled {} reminder for meeting {} at {}", timeText, meeting.getId(), reminderTime);
    }

    /**
     * Create template variables for meeting emails
     */
    private Map<String, Object> createMeetingTemplateVariables(Meeting meeting) {
        Map<String, Object> variables = new HashMap<>();

        variables.put("meetingTitle", meeting.getTitle());
        variables.put("startTime", formatDateTime(meeting.getStartTime()));
        variables.put("endTime", formatTime(meeting.getEndTime()));
        variables.put("duration", calculateDuration(meeting.getStartTime(), meeting.getEndTime()));
        variables.put("organizerEmail", meeting.getCreatedByEmail());
        variables.put("organizerName", extractNameFromEmail(meeting.getCreatedByEmail()));
        variables.put("description", meeting.getDescription());
        variables.put("remarks", meeting.getRemarks()); // âœ… ADD REMARKS
        variables.put("meetingLink", generateMeetingLink(meeting));

        // Filter out the organizer from participants list for display
        List<String> otherParticipants = meeting.getParticipantEmails().stream()
                .filter(email -> !email.equals(meeting.getCreatedByEmail()))
                .toList();
        variables.put("participants", otherParticipants);

        return variables;
    }

    /**
     * Format date and time for display
     */
    private String formatDateTime(Instant instant) {
        return instant.atZone(ZoneId.systemDefault()).format(DATE_TIME_FORMATTER);
    }

    /**
     * Format time only for display
     */
    private String formatTime(Instant instant) {
        return instant.atZone(ZoneId.systemDefault()).format(DateTimeFormatter.ofPattern("h:mm a"));
    }

    /**
     * Calculate meeting duration
     */
    private String calculateDuration(Instant start, Instant end) {
        Duration duration = Duration.between(start, end);
        long hours = duration.toHours();
        long minutes = duration.toMinutesPart();

        if (hours > 0) {
            return hours + " hour" + (hours > 1 ? "s" : "") +
                    (minutes > 0 ? " " + minutes + " minute" + (minutes > 1 ? "s" : "") : "");
        } else {
            return minutes + " minute" + (minutes > 1 ? "s" : "");
        }
    }

    /**
     * Extract name from email address
     */
    private String extractNameFromEmail(String email) {
        if (email == null || !email.contains("@")) {
            return email;
        }

        String localPart = email.substring(0, email.indexOf("@"));
        // Convert dots and underscores to spaces
        String name = localPart.replace(".", " ").replace("_", " ");

        // Capitalize first letter of each word
        String[] words = name.split(" ");
        StringBuilder result = new StringBuilder();

        for (String word : words) {
            if (!word.isEmpty()) {
                if (result.length() > 0) {
                    result.append(" ");
                }
                result.append(word.substring(0, 1).toUpperCase())
                        .append(word.substring(1).toLowerCase());
            }
        }

        return result.toString();
    }

    /**
     * Generate meeting link (placeholder - implement based on your meeting system)
     */
    private String generateMeetingLink(Meeting meeting) {
        // This is a placeholder - replace with your actual meeting link generation
        // logic. The app should route /join-meeting/{id} for now.
        return meetingBaseUrl + "/join-meeting/" + meeting.getId();
    }
}