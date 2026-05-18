package com.omoikaneinnovation.hmrsbackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.mail.internet.MimeMessage;

@Service
public class OfferLetterEmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOfferLetter(
            String to,
            String subject,
            String candidateName,
            MultipartFile file
    ) throws Exception {

        MimeMessage message = mailSender.createMimeMessage();

        MimeMessageHelper helper =
                new MimeMessageHelper(message, true);

        helper.setTo(to);

        helper.setSubject(subject);

        helper.setText(
                "Dear " + candidateName +
                ",\n\nPlease find attached your offer letter.\n\nRegards,\nHR Team"
        );

        helper.addAttachment(
                file.getOriginalFilename(),
                new ByteArrayResource(file.getBytes())
        );

        mailSender.send(message);
    }
}