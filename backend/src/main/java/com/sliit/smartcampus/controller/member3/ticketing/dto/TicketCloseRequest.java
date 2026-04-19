package com.sliit.smartcampus.controller.member3.ticketing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record TicketCloseRequest(
        @NotBlank(message = "closedBy is required")
        @Pattern(regexp = "^[a-zA-Z0-9_-]{3,60}$", message = "closedBy must be 3-60 chars using letters, numbers, _ or -")
        String closedBy
) {}