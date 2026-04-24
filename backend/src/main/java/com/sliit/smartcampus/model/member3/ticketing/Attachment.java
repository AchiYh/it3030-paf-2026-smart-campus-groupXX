package com.sliit.smartcampus.model.member3.ticketing;

import com.fasterxml.jackson.annotation.JsonCreator;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "ticket_attachments_member3")
public class Attachment {

    @Id
    private String id;

    @NotBlank(message = "Ticket ID is required")
    @Indexed
    private String ticketId;

    @NotBlank(message = "File name is required")
    @Size(min = 1, max = 255, message = "fileName must be between 1 and 255 characters")
    private String fileName;

    @NotBlank(message = "Storage URL is required")
    @Size(max = 1000, message = "storageUrl must not exceed 1000 characters")
    private String storageUrl;

    @NotBlank(message = "MIME type is required")
    @Pattern(regexp = "^[a-zA-Z0-9!#$&^_.+-]+/[a-zA-Z0-9!#$&^_.+-]+$", message = "mimeType must be a valid type/subtype")
    private String mimeType;

    @NotNull(message = "File size is required")
    @Positive(message = "fileSizeBytes must be greater than 0")
    private Long fileSizeBytes;

    @NotBlank(message = "Uploader user ID is required")
    @Pattern(regexp = "^[a-zA-Z0-9_-]{3,60}$", message = "uploadedBy must be 3-60 chars using letters, numbers, _ or -")
    private String uploadedBy;

    @NotNull(message = "Attachment type is required")
    @Builder.Default
    private AttachmentType type = AttachmentType.OTHER;

    @CreatedDate
    private LocalDateTime createdAt;

    public enum AttachmentType {
        IMAGE,
        DOCUMENT,
        LOG,
        OTHER;

        @JsonCreator
        public static AttachmentType from(String value) {
            return value == null ? null : AttachmentType.valueOf(value.trim().toUpperCase());
        }
    }
}
