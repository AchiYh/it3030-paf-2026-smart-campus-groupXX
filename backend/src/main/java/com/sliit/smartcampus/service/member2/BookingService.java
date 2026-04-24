package com.sliit.smartcampus.service.member2;

import com.sliit.smartcampus.dto.member2.BookingRequestDTO;
import com.sliit.smartcampus.dto.member2.BookingResponseDTO;
import com.sliit.smartcampus.exception.BadRequestException;
import com.sliit.smartcampus.exception.ConflictException;
import com.sliit.smartcampus.exception.ResourceNotFoundException;
import com.sliit.smartcampus.model.member2.Booking;
import com.sliit.smartcampus.model.member2.BookingStatus;
import com.sliit.smartcampus.repository.member2.BookingRepository;
import com.sliit.smartcampus.model.member4.User;
import com.sliit.smartcampus.model.member4.Notification.NotificationType;
import com.sliit.smartcampus.repository.member4.UserRepository;
import com.sliit.smartcampus.service.member4.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final EquipmentService equipmentService;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public BookingService(BookingRepository bookingRepository, 
                          EquipmentService equipmentService,
                          NotificationService notificationService,
                          UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.equipmentService = equipmentService;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    @Transactional
    public BookingResponseDTO createBooking(BookingRequestDTO request) {
        validateBookingTimes(request.startTime(), request.endTime());
        
        // For Equipment, skip conflict checking (no time conflicts)
        // For other resources, check for conflicts
        if (request.resourceType() == null || !"Equipment".equals(request.resourceType())) {
            checkForConflicts(request);
        }
        
        // Determine attendees vs quantity
        int finalAttendees = request.attendees() != null ? request.attendees() : 1;
        int finalQuantity = request.quantity() != null ? request.quantity() : 1;
        
        // For equipment, use quantity as attendees
        if (request.resourceType() != null && "Equipment".equals(request.resourceType())) {
            finalAttendees = finalQuantity;
        }

        Booking booking = Booking.builder()
                .resourceId(request.resourceId())
                .resourceName(request.resourceName())
                .resourceType(request.resourceType())
                .userEmail(request.userEmail())
                .date(request.date())
                .startTime(request.startTime())
                .endTime(request.endTime())
                .purpose(request.purpose())
                .attendees(finalAttendees)
                .quantity(finalQuantity)
                .status(BookingStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Booking saved = bookingRepository.save(booking);

        // Notify Admins about new booking
        List<User> admins = userRepository.findByRole(User.Role.ADMIN);
        for (User admin : admins) {
            notificationService.createNotification(
                admin.getId(),
                "New Booking Request",
                "User " + request.userEmail() + " requested " + request.resourceName(),
                NotificationType.BOOKING,
                saved.getId(),
                "BOOKING"
            );
        }

        return BookingResponseDTO.fromBooking(saved);
    }

    public List<BookingResponseDTO> getMyBookings(String email) {
        return bookingRepository.findByUserEmail(email).stream()
                .map(BookingResponseDTO::fromBooking)
                .collect(Collectors.toList());
    }

    // NEW: Get all bookings for admin
    public List<BookingResponseDTO> getAllBookings() {
        return bookingRepository.findAll().stream()
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

        // Skip conflict check for Equipment
        if (booking.getResourceType() == null || !"Equipment".equals(booking.getResourceType())) {
            checkForConflicts(request, id);
        }

        // For equipment, adjust stock based on quantity change – TEMPORARILY DISABLED
        if (booking.getResourceType() != null && "Equipment".equals(booking.getResourceType())) {
            int oldQuantity = booking.getQuantity();
            int newQuantity = request.quantity() != null ? request.quantity() : 1;
            if (newQuantity != oldQuantity) {
                // Stock adjustment disabled
                // if (newQuantity > oldQuantity) {
                //     equipmentService.decrementAvailableCount(booking.getResourceId(), newQuantity - oldQuantity);
                // } else {
                //     equipmentService.incrementAvailableCount(booking.getResourceId(), oldQuantity - newQuantity);
                // }
            }
            booking.setQuantity(newQuantity);
            booking.setAttendees(newQuantity);
        } else {
            booking.setAttendees(request.attendees());
        }

        booking.setResourceId(request.resourceId());
        booking.setResourceName(request.resourceName());
        booking.setDate(request.date());
        booking.setStartTime(request.startTime());
        booking.setEndTime(request.endTime());
        booking.setPurpose(request.purpose());
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

        // Increment equipment stock back if equipment – TEMPORARILY DISABLED
        // if ("Equipment".equals(booking.getResourceType())) {
        //     equipmentService.incrementAvailableCount(booking.getResourceId(), booking.getQuantity());
        // }

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
        booking.setUpdatedAt(LocalDateTime.now());  // ← ADDED: Update timestamp
        Booking cancelled = bookingRepository.save(booking);

        // Increment equipment stock back if equipment – TEMPORARILY DISABLED
        // if ("Equipment".equals(booking.getResourceType())) {
        //     equipmentService.incrementAvailableCount(booking.getResourceId(), booking.getQuantity());
        // }

        return BookingResponseDTO.fromBooking(cancelled);
    }

    // NEW: Cancel a PENDING booking (soft delete – moves to CANCELLED status)
    @Transactional
    public BookingResponseDTO cancelPendingBooking(String id, String currentUserEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        if (!booking.getUserEmail().equals(currentUserEmail)) {
            throw new BadRequestException("You can only cancel your own bookings");
        }
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only PENDING bookings can be cancelled this way");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setUpdatedAt(LocalDateTime.now());
        Booking cancelled = bookingRepository.save(booking);
        return BookingResponseDTO.fromBooking(cancelled);
    }

    @Transactional
    public BookingResponseDTO approveBooking(String id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only PENDING bookings can be approved");
        }

        booking.setStatus(BookingStatus.APPROVED);
        booking.setUpdatedAt(LocalDateTime.now());  // ← ADDED: Update timestamp when approved
        Booking approved = bookingRepository.save(booking);
        
        // Notify User
        userRepository.findByEmail(approved.getUserEmail()).ifPresent(user -> {
            notificationService.createNotification(
                user.getId(),
                "Booking Approved ✅",
                "Your booking for " + approved.getResourceName() + " has been approved.",
                NotificationType.BOOKING,
                approved.getId(),
                "BOOKING"
            );
        });

        return BookingResponseDTO.fromBooking(approved);
    }

    @Transactional
    public BookingResponseDTO rejectBooking(String id, String reason) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only PENDING bookings can be rejected");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectReason(reason);
        booking.setUpdatedAt(LocalDateTime.now());  // ← ADDED: Update timestamp when rejected
        Booking rejected = bookingRepository.save(booking);

        // Notify User
        userRepository.findByEmail(rejected.getUserEmail()).ifPresent(user -> {
            notificationService.createNotification(
                user.getId(),
                "Booking Rejected ❌",
                "Reason: " + reason,
                NotificationType.BOOKING,
                rejected.getId(),
                "BOOKING"
            );
        });

        return BookingResponseDTO.fromBooking(rejected);
    }

    // ---------- Private helper methods ----------
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