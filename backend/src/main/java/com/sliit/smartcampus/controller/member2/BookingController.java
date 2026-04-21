package com.sliit.smartcampus.controller.member2;

import com.sliit.smartcampus.dto.member2.BookingRequestDTO;
import com.sliit.smartcampus.dto.member2.BookingResponseDTO;
import com.sliit.smartcampus.exception.BadRequestException;
import com.sliit.smartcampus.service.member2.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<BookingResponseDTO> createBooking(@Valid @RequestBody BookingRequestDTO bookingRequest) {
        BookingResponseDTO created = bookingService.createBooking(bookingRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/my/{email}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<BookingResponseDTO>> getMyBookings(@PathVariable String email) {
        List<BookingResponseDTO> bookings = bookingService.getMyBookings(email);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<BookingResponseDTO> getBookingById(@PathVariable String id) {
        BookingResponseDTO booking = bookingService.getBookingById(id);
        return ResponseEntity.ok(booking);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<BookingResponseDTO> updateBooking(
            @PathVariable String id,
            @Valid @RequestBody BookingRequestDTO bookingRequest,
            Authentication authentication
    ) {
        String currentUserEmail = authentication.getName();
        BookingResponseDTO updatedBooking = bookingService.updateBooking(id, bookingRequest, currentUserEmail);
        return ResponseEntity.ok(updatedBooking);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> deleteBooking(
            @PathVariable String id,
            Authentication authentication
    ) {
        String currentUserEmail = authentication.getName();
        bookingService.deleteBooking(id, currentUserEmail);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/cancel")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<BookingResponseDTO> cancelBooking(@PathVariable String id) {
        BookingResponseDTO cancelled = bookingService.cancelBooking(id);
        return ResponseEntity.ok(cancelled);
    }

    // ----- Admin endpoints for approve/reject -----
    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponseDTO> approveBooking(@PathVariable String id) {
        BookingResponseDTO approved = bookingService.approveBooking(id);
        return ResponseEntity.ok(approved);
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponseDTO> rejectBooking(@PathVariable String id, @RequestBody Map<String, String> payload) {
        String reason = payload.get("reason");
        if (reason == null || reason.isBlank()) {
            throw new BadRequestException("Rejection reason is required");
        }
        BookingResponseDTO rejected = bookingService.rejectBooking(id, reason);
        return ResponseEntity.ok(rejected);
    }
}