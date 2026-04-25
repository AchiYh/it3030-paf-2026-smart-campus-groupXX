package com.sliit.smartcampus.model.member4;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "security_logs")
public class SecurityLog {
    @Id
    private String id;
    private String userEmail;
    private String action; // LOGIN, LOGOUT, USER_CREATED, ROLE_CHANGED, PROFILE_UPDATED
    private String details;
    private String ipAddress;
    private LocalDateTime timestamp;
}
