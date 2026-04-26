package com.sliit.smartcampus.service.member4;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("careers.lankads@gmail.com");
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            
            // Log to console for development testing
            System.out.println("========================================");
            System.out.println("EMAIL SENT TO: " + to);
            System.out.println("SUBJECT: " + subject);
            System.out.println("CONTENT: " + text);
            System.out.println("========================================");

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + to + ": " + e.getMessage());
            // We ignore errors here in case SMTP is not configured yet
        }
    }
}
