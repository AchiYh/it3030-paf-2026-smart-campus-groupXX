package com.sliit.smartcampus.model.member3.ticketing;

import com.fasterxml.jackson.annotation.JsonCreator;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
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
@Document(collection = "ticket_comments_member3")
public class Comment {

    @Id
    private String id;

    @NotBlank(message = "Ticket ID is required")
    @Indexed
    private String ticketId;

    @NotBlank(message = "Comment text is required")
    @Size(min = 1, max = 4000, message = "content must be between 1 and 4000 characters")
    private String content;

    @NotBlank(message = "Author user ID is required")
    @Pattern(regexp = "^[a-zA-Z0-9_-]{3,60}$", message = "authorId must be 3-60 chars using letters, numbers, _ or -")
    private String authorId;

    @NotNull(message = "Visibility is required")
    @Builder.Default
    private Visibility visibility = Visibility.PUBLIC;

    @NotNull(message = "Pinned flag is required")
    @Builder.Default
    private Boolean pinned = Boolean.FALSE;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum Visibility {
        PUBLIC,
        INTERNAL;

        @JsonCreator
        public static Visibility from(String value) {
            return value == null ? null : Visibility.valueOf(value.trim().toUpperCase());
        }
    }
}
