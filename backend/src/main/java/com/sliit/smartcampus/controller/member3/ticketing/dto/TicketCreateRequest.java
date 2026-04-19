package com.sliit.smartcampus.controller.member3.ticketing.dto;

import com.sliit.smartcampus.model.member3.ticketing.Ticket;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record TicketCreateRequest(
        @NotBlank(message = "Title is required")
        @Size(min = 3, max = 120, message = "Title must be between 3 and 120 characters")
        String title,

        @NotBlank(message = "Description is required")
        @Size(min = 10, max = 2000, message = "Description must be between 10 and 2000 characters")
        String description,

        @NotBlank(message = "Category is required")
        @Size(min = 2, max = 60, message = "Category must be between 2 and 60 characters")
        String category,

        @NotNull(message = "Priority is required")
        Ticket.TicketPriority priority,

        @NotBlank(message = "Reporter user ID is required")
        @Pattern(regexp = "^[a-zA-Z0-9_-]{3,60}$", message = "reportedBy must be 3-60 chars using letters, numbers, _ or -")
        String reportedBy,

        @Pattern(regexp = "^$|^[a-zA-Z0-9_-]{3,60}$", message = "assignedTo must be empty or 3-60 chars using letters, numbers, _ or -")
        String assignedTo
) {}