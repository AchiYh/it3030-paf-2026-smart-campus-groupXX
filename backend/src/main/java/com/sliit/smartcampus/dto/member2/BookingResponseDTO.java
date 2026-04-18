package com.sliit.smartcampus.dto.member2;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.sliit.smartcampus.model.member2.Booking;
import com.sliit.smartcampus.model.member2.BookingStatus;

import java.time.LocalDate;
import java.time.LocalTime;

public record BookingResponseDTO(
        String id,
        String resourceId,
        String resourceName,
        String userEmail,
        @JsonFormat(pattern = "yyyy-MM-dd")
        LocalDate date,
        @JsonFormat(pattern = "HH:mm")
        LocalTime startTime,
        @JsonFormat(pattern = "HH:mm")
        LocalTime endTime,
        String purpose,
        Integer attendees,
        BookingStatus status,
        String rejectReason
) {
    public static BookingResponseDTO fromBooking(Booking booking) {
        return new BookingResponseDTO(
                booking.getId(),
                booking.getResourceId(),
                booking.getResourceName(),
                booking.getUserEmail(),
                booking.getDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getPurpose(),
                booking.getAttendees(),
                booking.getStatus(),
                booking.getRejectReason()
        );
    }
}
