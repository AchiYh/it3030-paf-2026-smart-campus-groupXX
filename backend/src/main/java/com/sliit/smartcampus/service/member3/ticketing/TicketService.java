package com.sliit.smartcampus.service.member3.ticketing;

import com.sliit.smartcampus.controller.member3.ticketing.dto.TicketCreateRequest;
import com.sliit.smartcampus.exception.ResourceNotFoundException;
import com.sliit.smartcampus.model.member3.ticketing.Ticket;
import com.sliit.smartcampus.repository.member3.ticketing.TicketRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;

    public TicketService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    public Ticket createTicket(TicketCreateRequest request) {
        Ticket ticket = Ticket.builder()
                .title(request.title())
                .description(request.description())
                .category(request.category())
                .priority(request.priority())
                .status(Ticket.TicketStatus.OPEN)
                .reportedBy(request.reportedBy())
                .assignedTo(request.assignedTo())
                .build();

        return ticketRepository.save(ticket);
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public Ticket getTicketById(String id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", id));
    }

    public Ticket updateTicket(String id, Ticket ticketRequest) {
        Ticket existingTicket = getTicketById(id);

        existingTicket.setTitle(ticketRequest.getTitle());
        existingTicket.setDescription(ticketRequest.getDescription());
        existingTicket.setCategory(ticketRequest.getCategory());
        existingTicket.setPriority(ticketRequest.getPriority());
        existingTicket.setAssignedTo(ticketRequest.getAssignedTo());
        existingTicket.setReportedBy(ticketRequest.getReportedBy());

        if (ticketRequest.getStatus() != null) {
            existingTicket.setStatus(ticketRequest.getStatus());
        }

        return ticketRepository.save(existingTicket);
    }

    public Ticket updateTicketStatus(String id, Ticket.TicketStatus status) {
        Ticket ticket = getTicketById(id);
        ticket.setStatus(status);
        return ticketRepository.save(ticket);
    }

    public void deleteTicket(String id) {
        getTicketById(id);
        ticketRepository.deleteById(id);
    }
}
