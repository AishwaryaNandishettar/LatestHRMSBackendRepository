package com.omoikaneinnovation.hmrsbackend.service;

import com.omoikaneinnovation.hmrsbackend.dto.EmailRequest;
import com.omoikaneinnovation.hmrsbackend.model.EmailQueue;
import com.omoikaneinnovation.hmrsbackend.repository.EmailQueueRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    private final EmailQueueRepository emailQueueRepository;

    @Value("${meeting.email.from-name:HRMS Meeting System}")
    private String fromName;

    @Value("${meeting.email.from-address}")
    private String fromAddress;

    @Value("${meeting.email.reply-to:noreply@omoikaneinnovations.com}")
    private String replyToAddress;

    /**
     * Queue email for asynchronous sending
     */
    public void queueEmail(EmailRequest emailRequest) {
        try {
            EmailQueue emailQueue = EmailQueue.builder()
                    .recipients(emailRequest.getToList() != null ? emailRequest.getToList() : List.of(emailRequest.getTo()))
                    .subject(emailRequest.getSubject())
                    .templateName(emailRequest.getTemplateName())
                    .templateVariables(emailRequest.getTemplateVariables())
                    .emailType(emailRequest.getEmailType().name())
                    .meetingId(emailRequest.getMeetingId())
                    .status(EmailQueue.EmailStatus.PENDING)
                    .retryCount(0)
                    .maxRetries(3)
                    .createdAt(Instant.now())
                    .scheduledAt(emailRequest.getScheduledTime() != null ? emailRequest.getScheduledTime() : Instant.now())
                    .build();

            emailQueueRepository.save(emailQueue);
            log.info("Email queued successfully for recipients: {}, type: {}", 
                    emailQueue.getRecipients(), emailQueue.getEmailType());

        } catch (Exception e) {
            log.error("Failed to queue email: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to queue email", e);
        }
    }

    /**
     * Send email immediately (for urgent notifications)
     */
    @Async("emailTaskExecutor")
    public CompletableFuture<Boolean> sendEmailImmediately(EmailRequest emailRequest) {
        try {
            List<String> recipients = emailRequest.getToList() != null ? 
                    emailRequest.getToList() : List.of(emailRequest.getTo());

            for (String recipient : recipients) {
                sendSingleEmail(recipient, emailRequest.getSubject(), 
                        emailRequest.getTemplateName(), emailRequest.getTemplateVariables());
            }

            log.info("Email sent immediately to {} recipients, type: {}", 
                    recipients.size(), emailRequest.getEmailType());
            return CompletableFuture.completedFuture(true);

        } catch (Exception e) {
            log.error("Failed to send email immediately: {}", e.getMessage(), e);
            return CompletableFuture.completedFuture(false);
        }
    }

    /**
     * Process queued emails (called by scheduler)
     */
    @Async("emailTaskExecutor")
    public CompletableFuture<Void> processQueuedEmails() {
        try {
            List<EmailQueue> pendingEmails = emailQueueRepository.findPendingEmailsReadyToSend(Instant.now());
            
            log.info("Processing {} queued emails", pendingEmails.size());

            for (EmailQueue emailQueue : pendingEmails) {
                processEmailQueue(emailQueue);
            }

        } catch (Exception e) {
            log.error("Error processing queued emails: {}", e.getMessage(), e);
        }
        
        return CompletableFuture.completedFuture(null);
    }

    /**
     * Process individual email from queue
     */
    private void processEmailQueue(EmailQueue emailQueue) {
        try {
            // Update status to processing
            emailQueue.setStatus(EmailQueue.EmailStatus.PROCESSING);
            emailQueue.setLastAttemptAt(Instant.now());
            emailQueueRepository.save(emailQueue);

            // Send emails to all recipients
            boolean allSent = true;
            for (String recipient : emailQueue.getRecipients()) {
                try {
                    sendSingleEmail(recipient, emailQueue.getSubject(), 
                            emailQueue.getTemplateName(), emailQueue.getTemplateVariables());
                } catch (Exception e) {
                    log.error("Failed to send email to {}: {}", recipient, e.getMessage());
                    allSent = false;
                }
            }

            if (allSent) {
                // Mark as sent
                emailQueue.setStatus(EmailQueue.EmailStatus.SENT);
                emailQueue.setSentAt(Instant.now());
                log.info("Email queue {} processed successfully", emailQueue.getId());
            } else {
                // Mark as failed for retry
                handleEmailFailure(emailQueue, "Failed to send to some recipients");
            }

            emailQueueRepository.save(emailQueue);

        } catch (Exception e) {
            log.error("Error processing email queue {}: {}", emailQueue.getId(), e.getMessage(), e);
            handleEmailFailure(emailQueue, e.getMessage());
        }
    }

    /**
     * Handle email sending failure
     */
    private void handleEmailFailure(EmailQueue emailQueue, String errorMessage) {
        emailQueue.setRetryCount(emailQueue.getRetryCount() + 1);
        emailQueue.setErrorMessage(errorMessage);
        emailQueue.setLastAttemptAt(Instant.now());

        if (emailQueue.getRetryCount() >= emailQueue.getMaxRetries()) {
            emailQueue.setStatus(EmailQueue.EmailStatus.FAILED);
            log.error("Email queue {} failed permanently after {} retries", 
                    emailQueue.getId(), emailQueue.getRetryCount());
        } else {
            emailQueue.setStatus(EmailQueue.EmailStatus.PENDING);
            // Schedule retry with exponential backoff
            long delayMinutes = (long) Math.pow(2, emailQueue.getRetryCount()) * 5; // 5, 10, 20 minutes
            emailQueue.setScheduledAt(Instant.now().plusSeconds(delayMinutes * 60));
            log.warn("Email queue {} will be retried in {} minutes (attempt {})", 
                    emailQueue.getId(), delayMinutes, emailQueue.getRetryCount() + 1);
        }

        emailQueueRepository.save(emailQueue);
    }

    /**
     * Send single email using template
     */
    private void sendSingleEmail(String to, String subject, String templateName, Map<String, Object> variables) 
            throws MessagingException {
        
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            // Set email properties
            helper.setFrom(fromAddress, fromName);
            helper.setTo(to);
            helper.setReplyTo(replyToAddress);
            helper.setSubject(subject);

            // Process template
            Context context = new Context();
            if (variables != null) {
                context.setVariables(variables);
            }
            
            String htmlContent = templateEngine.process("email/" + templateName, context);
            helper.setText(htmlContent, true);

            // Send email
            mailSender.send(message);
            log.debug("Email sent successfully to: {}", to);
            
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage(), e);
            throw new MessagingException("Failed to send email", e);
        }
    }

    /**
     * Cancel queued emails for a meeting
     */
    public void cancelQueuedEmails(String meetingId) {
        try {
            List<EmailQueue> queuedEmails = emailQueueRepository.findByMeetingId(meetingId);
            
            for (EmailQueue email : queuedEmails) {
                if (email.getStatus() == EmailQueue.EmailStatus.PENDING) {
                    email.setStatus(EmailQueue.EmailStatus.CANCELLED);
                    emailQueueRepository.save(email);
                }
            }
            
            log.info("Cancelled {} queued emails for meeting: {}", queuedEmails.size(), meetingId);
            
        } catch (Exception e) {
            log.error("Failed to cancel queued emails for meeting {}: {}", meetingId, e.getMessage(), e);
        }
    }

    /**
     * Get email queue statistics
     */
    public Map<String, Long> getEmailQueueStats() {
        return Map.of(
                "pending", emailQueueRepository.countByStatus(EmailQueue.EmailStatus.PENDING),
                "processing", emailQueueRepository.countByStatus(EmailQueue.EmailStatus.PROCESSING),
                "sent", emailQueueRepository.countByStatus(EmailQueue.EmailStatus.SENT),
                "failed", emailQueueRepository.countByStatus(EmailQueue.EmailStatus.FAILED),
                "cancelled", emailQueueRepository.countByStatus(EmailQueue.EmailStatus.CANCELLED)
        );
    }

    /**
     * Legacy method for OTP emails (backward compatibility)
     */
    public void sendOtp(String email, String otp) {
        try {
            Map<String, Object> variables = Map.of(
                    "otp", otp,
                    "email", email
            );

            EmailRequest emailRequest = EmailRequest.builder()
                    .to(email)
                    .subject("Your OTP Code - HRMS")
                    .templateName("otp-email") // You'll need to create this template
                    .templateVariables(variables)
                    .emailType(EmailRequest.EmailType.MEETING_INVITATION) // Reusing enum
                    .scheduledTime(Instant.now())
                    .build();

            // Send immediately for OTP
            sendEmailImmediately(emailRequest);
            
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", email, e.getMessage(), e);
            // Fallback to simple email
            sendSimpleOtpEmail(email, otp);
        }
    }

    /**
     * Legacy method for invite emails (backward compatibility)
     */
    public void sendInviteEmail(String email, String link, String otp,String password) {
        try {
            Map<String, Object> variables = Map.of(
                    "email", email,
                    "inviteLink", link,
                    "otp", otp,
                     "password", password
            );

            EmailRequest emailRequest = EmailRequest.builder()
                    .to(email)
                    .subject("HRMS Invitation - Welcome!")
                    .templateName("invite-email") // You'll need to create this template
                    .templateVariables(variables)
                    .emailType(EmailRequest.EmailType.MEETING_INVITATION) // Reusing enum
                    .scheduledTime(Instant.now())
                    .build();

            // Send immediately for invites
            sendEmailImmediately(emailRequest);
            
        } catch (Exception e) {
            log.error("Failed to send invite email to {}: {}", email, e.getMessage(), e);
            // Fallback to simple email
            sendSimpleInviteEmail(email, link, otp);
        }
    }

    /**
     * Fallback method for simple OTP email
     */
    private void sendSimpleOtpEmail(String email, String otp) {
        try {
            sendSingleEmail(email, "Your OTP Code - HRMS", "simple-otp", 
                    Map.of("otp", otp, "email", email));
        } catch (Exception e) {
            log.error("Failed to send simple OTP email: {}", e.getMessage(), e);
        }
    }

    /**
     * Fallback method for simple invite email
     */
    private void sendSimpleInviteEmail(String email, String link, String otp) {
        try {
            sendSingleEmail(email, "HRMS Invitation - Welcome!", "simple-invite", 
                    Map.of("email", email, "inviteLink", link, "otp", otp));
        } catch (Exception e) {
            log.error("Failed to send simple invite email: {}", e.getMessage(), e);
        }
    }
}