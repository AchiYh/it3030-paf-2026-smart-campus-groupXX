package com.sliit.smartcampus.model.member2;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "bookings")
public class Booking {
    @Id
    private String id;

    @Indexed
    private String resourceId;

    private String resourceName;

    @Indexed
    private String userEmail;

    private LocalDate date;

    private LocalTime startTime;

    private LocalTime endTime;

    private String purpose;

    private Integer attendees;

    private BookingStatus status;

    private String rejectReason;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // ========== NEW FIELDS FOR EQUIPMENT ==========
    
    private String resourceType;  // "Lecture Halls", "Labs", "Meeting Rooms", "Equipment"
    
    private Integer quantity;     // For equipment bookings (how many units)
}
