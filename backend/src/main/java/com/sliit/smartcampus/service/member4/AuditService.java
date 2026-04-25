package com.sliit.smartcampus.service.member4;

import com.sliit.smartcampus.model.member4.SecurityLog;
import com.sliit.smartcampus.repository.member4.SecurityLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuditService {

    private final SecurityLogRepository securityLogRepository;

    public AuditService(SecurityLogRepository securityLogRepository) {
        this.securityLogRepository = securityLogRepository;
    }

    public void log(String email, String action, String details) {
        SecurityLog log = SecurityLog.builder()
                .userEmail(email)
                .action(action)
                .details(details)
                .timestamp(LocalDateTime.now())
                .build();
        securityLogRepository.save(log);
    }
}
