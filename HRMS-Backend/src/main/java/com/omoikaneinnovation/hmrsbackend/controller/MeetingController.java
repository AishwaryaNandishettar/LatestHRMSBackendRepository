package com.omoikaneinnovation.hmrsbackend.controller;

import com.omoikaneinnovation.hmrsbackend.model.Meeting;
import com.omoikaneinnovation.hmrsbackend.repository.MeetingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import com.omoikaneinnovation.hmrsbackend.service.MeetingEmailService;
import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/meetings")
@CrossOrigin(originPatterns = { "http://localhost:*", "https://*.ngrok-free.dev" })
public class MeetingController {

    private final MeetingRepository meetingRepository;
    private final MeetingEmailService meetingEmailService;

    public MeetingController(MeetingRepository meetingRepository,
            MeetingEmailService meetingEmailService) {
        this.meetingRepository = meetingRepository;
        this.meetingEmailService = meetingEmailService;
    }

    @PostMapping
    public ResponseEntity<Meeting> createMeeting(@RequestBody Meeting meeting, Principal principal) {
        String email = principal != null ? principal.getName() : null;
        if (email == null) {
            return ResponseEntity.status(401).build();
        }

        meeting.setCreatedByEmail(email);
        meeting.setCreatedAt(Instant.now());
        Meeting saved = meetingRepository.save(meeting);
        meetingEmailService.sendMeetingInvitation(saved);
        meetingEmailService.scheduleMeetingReminders(saved);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/user")
    public ResponseEntity<List<Meeting>> getMeetingsForUser(@RequestParam(required = false) String email,
            Principal principal) {
        String currentEmail = email;
        if (currentEmail == null && principal != null) {
            currentEmail = principal.getName();
        }

        if (currentEmail == null) {
            return ResponseEntity.status(400).build();
        }

        List<Meeting> meetings = meetingRepository.findAllMeetingsForUser(currentEmail);
        return ResponseEntity.ok(meetings);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Meeting> getMeetingById(@PathVariable String id, Principal principal) {
        String email = principal != null ? principal.getName() : null;
        if (email == null) {
            return ResponseEntity.status(401).build();
        }

        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));

        if (!meeting.getCreatedByEmail().equalsIgnoreCase(email)
                && (meeting.getParticipantEmails() == null || meeting.getParticipantEmails().stream()
                        .noneMatch(participant -> participant.equalsIgnoreCase(email)))) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(meeting);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Meeting> updateMeeting(@PathVariable String id,
            @RequestBody Meeting meeting,
            Principal principal) {
        String email = principal != null ? principal.getName() : null;
        if (email == null) {
            return ResponseEntity.status(401).build();
        }

        Meeting existing = meetingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));

        if (!existing.getCreatedByEmail().equals(email)
                && (existing.getParticipantEmails() == null || !existing.getParticipantEmails().contains(email))) {
            return ResponseEntity.status(403).build();
        }

        existing.setTitle(meeting.getTitle());
        existing.setDescription(meeting.getDescription());
        existing.setParticipantEmails(meeting.getParticipantEmails());
        existing.setRemarks(meeting.getRemarks());
        existing.setStartTime(meeting.getStartTime());
        existing.setEndTime(meeting.getEndTime());
        existing.setStatus(meeting.getStatus());
        existing.setRepeat(meeting.getRepeat());
        existing.setRepeatUntil(meeting.getRepeatUntil());
        existing.setRepeatCount(meeting.getRepeatCount());
        existing.setDaysOfWeek(meeting.getDaysOfWeek());
        existing.setCreatedByEmail(existing.getCreatedByEmail());
        existing.setCreatedAt(existing.getCreatedAt());

        Meeting updated = meetingRepository.save(existing);

        if ("Cancelled".equalsIgnoreCase(updated.getStatus())) {
            meetingEmailService.sendMeetingCancellation(updated, "The meeting has been cancelled.");
        } else {
            meetingEmailService.sendMeetingUpdate(updated, "Meeting details have changed");
            meetingEmailService.scheduleMeetingReminders(updated);
        }

        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMeeting(@PathVariable String id,
            Principal principal) {
        String email = principal != null ? principal.getName() : null;
        if (email == null) {
            return ResponseEntity.status(401).build();
        }

        Meeting existing = meetingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));

        if (!existing.getCreatedByEmail().equals(email)
                && (existing.getParticipantEmails() == null || !existing.getParticipantEmails().contains(email))) {
            return ResponseEntity.status(403).build();
        }

        meetingRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}