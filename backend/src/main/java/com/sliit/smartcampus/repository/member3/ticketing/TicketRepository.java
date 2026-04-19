package com.sliit.smartcampus.repository.member3.ticketing;

import com.sliit.smartcampus.model.member3.ticketing.Ticket;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends MongoRepository<Ticket, String> {

    List<Ticket> findByReportedByOrderByCreatedAtDesc(String reportedBy);

    List<Ticket> findByStatus(Ticket.TicketStatus status);
}
