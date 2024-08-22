package com.example.beaver_bargains.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.backend.url}")
    private String backendUrl;

    public void sendVerificationEmail(String destination, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(destination);
        message.setSubject("BeaverBargains Account Verification");
        message.setText(
                "Thank you for signing up for BeaverBargains!\n\nPlease click the link to verify your email: "
                        + backendUrl + "/api/users/verify-email?token=" + token);
        mailSender.send(message);
    }
}