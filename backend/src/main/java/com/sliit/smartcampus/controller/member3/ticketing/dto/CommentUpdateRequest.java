package com.sliit.smartcampus.controller.member3.ticketing.dto;

import com.sliit.smartcampus.model.member3.ticketing.Comment;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CommentUpdateRequest(
        @NotBlank(message = "Comment text is required")
        @Size(min = 1, max = 4000, message = "content must be between 1 and 4000 characters")
        String content,

        @NotNull(message = "Visibility is required")
        Comment.Visibility visibility,

        Boolean pinned
) {}