package com.sliit.smartcampus.controller.member3.ticketing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record TicketAssignmentRequest(
        @NotBlank(message = "Technician ID is required")
        @Pattern(regexp = "^[a-zA-Z0-9_-]{3,60}$", message = "technicianId must be 3-60 chars using letters, numbers, _ or -")
        String technicianId
) {}