package com.sliit.smartcampus.repository.member2;

import com.sliit.smartcampus.model.member2.Booking;
import com.sliit.smartcampus.model.member2.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByUserEmail(String userEmail);

    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByResourceIdAndDate(String resourceId, LocalDate date);

    List<Booking> findByResourceIdAndDateAndIdNot(String resourceId, LocalDate date, String id);
}
