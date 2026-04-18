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
