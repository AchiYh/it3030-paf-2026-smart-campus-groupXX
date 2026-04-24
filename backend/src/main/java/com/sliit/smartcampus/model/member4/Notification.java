package com.sliit.smartcampus.model.member4;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    private String userId;

    private String title;

    private String message;

    private NotificationType type;

    private boolean read;

    private String referenceId;  // ID of related entity (booking, ticket, etc.)

    private String referenceType; // "BOOKING", "TICKET", etc.

    @CreatedDate
    private LocalDateTime createdAt;

    public enum NotificationType {
        INFO,
        SUCCESS,
        WARNING,
        ERROR,
        BOOKING,
        TICKET
    }
}
