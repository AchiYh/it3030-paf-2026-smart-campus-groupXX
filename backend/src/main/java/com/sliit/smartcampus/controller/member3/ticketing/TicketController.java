package com.sliit.smartcampus.controller.member3.ticketing;

import com.sliit.smartcampus.model.member3.ticketing.Ticket;
import com.sliit.smartcampus.model.member3.ticketing.Attachment;
import com.sliit.smartcampus.model.member3.ticketing.Comment;
import com.sliit.smartcampus.controller.member3.ticketing.dto.TicketCreateRequest;
import com.sliit.smartcampus.controller.member3.ticketing.dto.TicketAssignmentRequest;
import com.sliit.smartcampus.controller.member3.ticketing.dto.TicketResolveRequest;
import com.sliit.smartcampus.controller.member3.ticketing.dto.TicketCloseRequest;
import com.sliit.smartcampus.controller.member3.ticketing.dto.TicketRejectRequest;
import com.sliit.smartcampus.controller.member3.ticketing.dto.CommentCreateRequest;
import com.sliit.smartcampus.controller.member3.ticketing.dto.CommentUpdateRequest;
import com.sliit.smartcampus.service.member3.ticketing.CommentService;
import com.sliit.smartcampus.service.member3.ticketing.ImageUploadService;
import com.sliit.smartcampus.service.member3.ticketing.TicketService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/member3/tickets")
@Validated
public class TicketController {

    private final TicketService ticketService;
    private final ImageUploadService imageUploadService;
    private final CommentService commentService;

    public TicketController(
            TicketService ticketService,
            ImageUploadService imageUploadService,
            CommentService commentService) {
        this.ticketService = ticketService;
        this.imageUploadService = imageUploadService;
        this.commentService = commentService;
    }

    @PostMapping
    public ResponseEntity<Ticket> createTicket(@Valid @RequestBody TicketCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.createTicket(request));
    }

    @GetMapping
    public ResponseEntity<List<Ticket>> getAllTickets(
            @RequestParam(required = false) Ticket.TicketStatus status,
            @RequestParam(required = false) Ticket.TicketPriority priority,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String reportedBy,
            @RequestParam(required = false) String assignedTo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime createdFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime createdTo) {
        return ResponseEntity.ok(ticketService.getTickets(
                status,
                priority,
                category,
                reportedBy,
                assignedTo,
                createdFrom,
                createdTo));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicketById(@PathVariable String id) {
        return ResponseEntity.ok(ticketService.getTicketByIdForCurrentUser(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Ticket> updateTicket(@PathVariable String id, @RequestBody Ticket ticket) {
        return ResponseEntity.ok(ticketService.updateTicket(id, ticket));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Ticket> updateTicketStatus(
            @PathVariable String id,
            @RequestParam Ticket.TicketStatus status) {
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, status));
    }

    @PatchMapping("/{id}/assign-technician")
    public ResponseEntity<Ticket> assignTechnician(
            @PathVariable String id,
            @Valid @RequestBody TicketAssignmentRequest request) {
        return ResponseEntity.ok(ticketService.assignTechnician(id, request.technicianId()));
    }

    @PatchMapping("/{id}/resolve")
    public ResponseEntity<Ticket> resolveTicket(
            @PathVariable String id,
            @Valid @RequestBody TicketResolveRequest request) {
        return ResponseEntity.ok(ticketService.resolveTicket(id, request));
    }

    @PatchMapping("/{id}/close")
    public ResponseEntity<Ticket> closeTicket(
            @PathVariable String id,
            @Valid @RequestBody TicketCloseRequest request) {
        return ResponseEntity.ok(ticketService.closeTicket(id, request));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<Ticket> rejectTicket(
            @PathVariable String id,
            @Valid @RequestBody TicketRejectRequest request) {
        return ResponseEntity.ok(ticketService.rejectTicket(id, request));
    }

    @PostMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Attachment> uploadTicketImage(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file,
            @RequestParam("uploadedBy")
            @Pattern(regexp = "^[a-zA-Z0-9_-]{3,60}$", message = "uploadedBy must be 3-60 chars using letters, numbers, _ or -")
            String uploadedBy) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(imageUploadService.uploadTicketImage(id, uploadedBy, file));
    }

    @DeleteMapping("/{ticketId}/attachments/{attachmentId}")
    public ResponseEntity<Void> deleteAttachment(
            @PathVariable String ticketId,
            @PathVariable String attachmentId) {
        imageUploadService.deleteAttachment(ticketId, attachmentId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{ticketId}/comments")
    public ResponseEntity<List<Comment>> getComments(@PathVariable String ticketId) {
        return ResponseEntity.ok(commentService.getCommentsByTicket(ticketId));
    }

    @PostMapping("/{ticketId}/comments")
    public ResponseEntity<Comment> addComment(
            @PathVariable String ticketId,
            @Valid @RequestBody CommentCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(commentService.addComment(ticketId, request));
    }

    @PutMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<Comment> updateComment(
            @PathVariable String ticketId,
            @PathVariable String commentId,
            @Valid @RequestBody CommentUpdateRequest request) {
        return ResponseEntity.ok(commentService.updateComment(ticketId, commentId, request));
    }

    @DeleteMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String ticketId,
            @PathVariable String commentId) {
        commentService.deleteComment(ticketId, commentId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable String id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }
}
