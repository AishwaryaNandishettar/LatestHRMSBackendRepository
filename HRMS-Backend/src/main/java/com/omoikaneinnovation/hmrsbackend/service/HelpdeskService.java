package com.omoikaneinnovation.hmrsbackend.service;

import com.omoikaneinnovation.hmrsbackend.model.HelpdeskTicket;
import com.omoikaneinnovation.hmrsbackend.repository.HelpdeskRepository;
import com.omoikaneinnovation.hmrsbackend.dto.EmailRequest;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class HelpdeskService {

    private final HelpdeskRepository repo;
    private final EmailService emailService;

    public HelpdeskService(HelpdeskRepository repo, EmailService emailService) {
        this.repo = repo;
        this.emailService = emailService;
    }

    public HelpdeskTicket create(HelpdeskTicket t) {

        t.setStatus("Open");
        t.setResolvedBy("-");
        t.setResolvedDate("-");
        t.setDate(LocalDate.now().toString());

        HelpdeskTicket saved = repo.save(t);

        // 🔥 Async email trigger
        sendTicketEmail(saved);

        return saved;
    }

    public List<HelpdeskTicket> getAll() {
        return repo.findAll();
    }

    public List<HelpdeskTicket> getByUser(String email) {
        return repo.findByRaisedBy(email);
    }

    public void delete(String id) {
        repo.deleteById(id);
    }

    public HelpdeskTicket updateStatus(String id, String status, String resolver) {
        HelpdeskTicket t = repo.findById(id).orElseThrow();

        t.setStatus(status);
        t.setResolvedBy(resolver);

        if (status.equals("Resolved")) {
            t.setResolvedDate(LocalDate.now().toString());
        }

        return repo.save(t);
    }

    /* ================= EMAIL ================= */

    @Async
    public void sendTicketEmail(HelpdeskTicket t) {
        try {

            Map<String, Object> variables = Map.of(
                    "ticketId", t.getId(),
                    "issue", t.getIssue(),
                    "raisedBy", t.getRaisedBy(),
                    "date", t.getDate()
            );

            EmailRequest emailRequest = EmailRequest.builder()
                    .to("mahesh.pnchal756@gmail.com")
                    .subject("🚨 New Helpdesk Ticket Raised")
                    .templateName("helpdesk-ticket")
                    .templateVariables(variables)
                    .emailType(EmailRequest.EmailType.MEETING_INVITATION)
                    .scheduledTime(Instant.now())
                    .build();

            emailService.sendEmailImmediately(emailRequest);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}