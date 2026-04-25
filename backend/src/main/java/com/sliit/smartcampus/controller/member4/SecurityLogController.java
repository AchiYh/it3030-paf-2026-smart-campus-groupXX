package com.sliit.smartcampus.controller.member4;

import com.sliit.smartcampus.model.member4.SecurityLog;
import com.sliit.smartcampus.repository.member4.SecurityLogRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/user/admin/logs")
public class SecurityLogController {

    private final SecurityLogRepository securityLogRepository;

    public SecurityLogController(SecurityLogRepository securityLogRepository) {
        this.securityLogRepository = securityLogRepository;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SecurityLog>> getRecentLogs() {
        return ResponseEntity.ok(securityLogRepository.findTop20ByOrderByTimestampDesc());
    }
}
