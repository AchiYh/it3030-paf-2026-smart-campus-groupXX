package com.sliit.smartcampus.controller.member3.ticketing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record TicketRejectRequest(
        @NotBlank(message = "Rejection reason is required")
        @Size(min = 5, max = 2000, message = "reason must be between 5 and 2000 characters")
        String reason,

        @NotBlank(message = "rejectedBy is required")
        @Pattern(regexp = "^[a-zA-Z0-9_-]{3,60}$", message = "rejectedBy must be 3-60 chars using letters, numbers, _ or -")
        String rejectedBy
) {}
