package com.sliit.smartcampus.model.member3.ticketing;

import com.fasterxml.jackson.annotation.JsonCreator;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tickets_member3")
public class Ticket {

    @Id
    private String id;

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 120, message = "Title must be between 3 and 120 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 2000, message = "Description must be between 10 and 2000 characters")
    private String description;

    @NotBlank(message = "Category is required")
    @Size(min = 2, max = 60, message = "Category must be between 2 and 60 characters")
    private String category;

    @NotNull(message = "Priority is required")
    @Builder.Default
    private TicketPriority priority = TicketPriority.MEDIUM;

    @NotNull(message = "Status is required")
    @Builder.Default
    private TicketStatus status = TicketStatus.OPEN;

    @NotBlank(message = "Reporter user ID is required")
    @Pattern(regexp = "^[a-zA-Z0-9_-]{3,60}$", message = "reportedBy must be 3-60 chars using letters, numbers, _ or -")
    @Indexed
    private String reportedBy;

    @Pattern(regexp = "^$|^[a-zA-Z0-9_-]{3,60}$", message = "assignedTo must be empty or 3-60 chars using letters, numbers, _ or -")
    @Indexed
    private String assignedTo;

    private UserSnapshot assignedTechnician;

    @Size(max = 4000, message = "resolutionNotes must not exceed 4000 characters")
    private String resolutionNotes;

    @Pattern(regexp = "^$|^[a-zA-Z0-9_-]{3,60}$", message = "resolvedBy must be empty or 3-60 chars using letters, numbers, _ or -")
    private String resolvedBy;

    private LocalDateTime resolvedAt;

    @Pattern(regexp = "^$|^[a-zA-Z0-9_-]{3,60}$", message = "closedBy must be empty or 3-60 chars using letters, numbers, _ or -")
    private String closedBy;

    private LocalDateTime closedAt;

    @Size(max = 2000, message = "rejectionReason must not exceed 2000 characters")
    private String rejectionReason;

    @Pattern(regexp = "^$|^[a-zA-Z0-9_-]{3,60}$", message = "rejectedBy must be empty or 3-60 chars using letters, numbers, _ or -")
    private String rejectedBy;

    private LocalDateTime rejectedAt;

    @CreatedDate
    @Indexed
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum TicketStatus {
        OPEN,
        IN_PROGRESS,
        RESOLVED,
        CLOSED,
        REJECTED;

        @JsonCreator
        public static TicketStatus from(String value) {
            return value == null ? null : TicketStatus.valueOf(value.trim().toUpperCase());
        }
    }

    public enum TicketPriority {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL;

        @JsonCreator
        public static TicketPriority from(String value) {
            return value == null ? null : TicketPriority.valueOf(value.trim().toUpperCase());
        }
    }
}
