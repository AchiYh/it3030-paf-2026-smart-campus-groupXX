package com.sliit.smartcampus.dto.member2;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;

public record BookingRequestDTO(
        @NotBlank(message = "Resource ID is required")
        String resourceId,

        @NotBlank(message = "Resource name is required")
        String resourceName,

        // NEW: Resource type (Lecture Halls, Labs, Meeting Rooms, Equipment)
        String resourceType,

        @NotBlank(message = "User email is required")
        String userEmail,

        @NotNull(message = "Date is required")
        @FutureOrPresent(message = "Booking date must be today or in the future")
        @JsonFormat(pattern = "yyyy-MM-dd")
        LocalDate date,

        @NotNull(message = "Start time is required")
        @JsonFormat(pattern = "HH:mm")
        LocalTime startTime,

        @NotNull(message = "End time is required")
        @JsonFormat(pattern = "HH:mm")
        LocalTime endTime,

        @NotBlank(message = "Purpose is required")
        @Size(min = 3, max = 500, message = "Purpose must be between 3 and 500 characters")
        String purpose,

        @NotNull(message = "Attendee count is required")
        @Min(value = 1, message = "Attendees must be at least 1")
        Integer attendees,

        // NEW: Quantity for equipment bookings
        @Min(value = 1, message = "Quantity must be at least 1")
        Integer quantity
) {}
