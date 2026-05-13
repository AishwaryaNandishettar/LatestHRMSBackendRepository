package com.omoikaneinnovation.hmrsbackend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.omoikaneinnovation.hmrsbackend.service.EmailService;

@RestController
@RequestMapping("/test")
public class TestMailController {

    @Autowired
    private EmailService emailService;

    @GetMapping("/mail")
    public String testMail() {

        String email = "aishushettar95@gmail.com";

        String link = "http://localhost:3000/login?email=" + email;

       emailService.sendInviteEmail(
        email,
        link,
        "123456",
        "Temp@123"
);

        return "Invite Mail Sent";
    }
}