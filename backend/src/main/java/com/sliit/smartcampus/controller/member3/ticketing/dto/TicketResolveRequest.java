package com.sliit.smartcampus.controller.member3.ticketing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record TicketResolveRequest(
        @NotBlank(message = "Resolution notes are required")
        @Size(max = 4000, message = "resolutionNotes must not exceed 4000 characters")
        String resolutionNotes,

        @NotBlank(message = "resolvedBy is required")
        @Pattern(regexp = "^[a-zA-Z0-9_-]{3,60}$", message = "resolvedBy must be 3-60 chars using letters, numbers, _ or -")
        String resolvedBy
) {}