package com.sliit.smartcampus.service.member2;

import com.sliit.smartcampus.dto.member2.BookingRequestDTO;
import com.sliit.smartcampus.dto.member2.BookingResponseDTO;
import com.sliit.smartcampus.exception.BadRequestException;
import com.sliit.smartcampus.exception.ConflictException;
import com.sliit.smartcampus.exception.ResourceNotFoundException;
import com.sliit.smartcampus.model.member2.Booking;
import com.sliit.smartcampus.model.member2.BookingStatus;
import com.sliit.smartcampus.repository.member2.BookingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;

    public BookingService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    @Transactional
    public BookingResponseDTO createBooking(BookingRequestDTO request) {
        validateBookingTimes(request.startTime(), request.endTime());
        checkForConflicts(request);

        Booking booking = Booking.builder()
                .resourceId(request.resourceId())
                .resourceName(request.resourceName())
                .userEmail(request.userEmail())
                .date(request.date())
                .startTime(request.startTime())
                .endTime(request.endTime())
                .purpose(request.purpose())
                .attendees(request.attendees())
                .status(BookingStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Booking saved = bookingRepository.save(booking);
        return BookingResponseDTO.fromBooking(saved);
    }

    public List<BookingResponseDTO> getMyBookings(String email) {
        return bookingRepository.findByUserEmail(email).stream()
                .map(BookingResponseDTO::fromBooking)
                .collect(Collectors.toList());
    }

    public BookingResponseDTO getBookingById(String id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        return BookingResponseDTO.fromBooking(booking);
    }

    @Transactional
    public BookingResponseDTO updateBooking(String id, BookingRequestDTO request, String currentUserEmail) {
        validateBookingTimes(request.startTime(), request.endTime());

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        if (!booking.getUserEmail().equals(currentUserEmail)) {
            throw new BadRequestException("Only the booking owner can update this booking");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only PENDING bookings can be edited");
        }

        checkForConflicts(request, id);

        booking.setResourceId(request.resourceId());
        booking.setResourceName(request.resourceName());
        booking.setDate(request.date());
        booking.setStartTime(request.startTime());
        booking.setEndTime(request.endTime());
        booking.setPurpose(request.purpose());
        booking.setAttendees(request.attendees());
        booking.setUpdatedAt(LocalDateTime.now());

        Booking updated = bookingRepository.save(booking);
        return BookingResponseDTO.fromBooking(updated);
    }

    @Transactional
    public void deleteBooking(String id, String currentUserEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        if (!booking.getUserEmail().equals(currentUserEmail)) {
            throw new BadRequestException("Only the booking owner can delete this booking");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only PENDING bookings can be deleted");
        }

        bookingRepository.delete(booking);
    }

    @Transactional
    public BookingResponseDTO cancelBooking(String id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new BadRequestException("Only APPROVED bookings can be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        Booking cancelled = bookingRepository.save(booking);
        return BookingResponseDTO.fromBooking(cancelled);
    }


    private void checkForConflicts(BookingRequestDTO request, String excludedBookingId) {
        List<Booking> existingBookings;
        if (excludedBookingId == null) {
            existingBookings = bookingRepository.findByResourceIdAndDate(request.resourceId(), request.date());
        } else {
            existingBookings = bookingRepository.findByResourceIdAndDateAndIdNot(request.resourceId(), request.date(), excludedBookingId);
        }

        for (Booking existing : existingBookings) {
            if (existing.getStatus() != BookingStatus.PENDING && existing.getStatus() != BookingStatus.APPROVED) {
                continue;
            }

            boolean overlaps = existing.getStartTime().isBefore(request.endTime())
                    && existing.getEndTime().isAfter(request.startTime());

            if (overlaps) {
                throw new ConflictException("Booking conflict detected for resource " + request.resourceId()
                        + " on " + request.date() + " between " + request.startTime() + " and " + request.endTime());
            }
        }
    }

    private void validateBookingTimes(LocalTime startTime, LocalTime endTime) {
        if (!endTime.isAfter(startTime)) {
            throw new BadRequestException("End time must be after start time");
        }
    }

    private void checkForConflicts(BookingRequestDTO request) {
        List<Booking> existingBookings = bookingRepository.findByResourceIdAndDate(request.resourceId(), request.date());
        for (Booking existing : existingBookings) {
            if (existing.getStatus() != BookingStatus.PENDING && existing.getStatus() != BookingStatus.APPROVED) {
                continue;
            }

            boolean overlaps = existing.getStartTime().isBefore(request.endTime())
                    && existing.getEndTime().isAfter(request.startTime());

            if (overlaps) {
                throw new ConflictException("Booking conflict detected for resource " + request.resourceId()
                        + " on " + request.date() + " between " + request.startTime() + " and " + request.endTime());
            }
        }
    }
}
