package com.sliit.smartcampus.service.member3.ticketing;

import com.sliit.smartcampus.controller.member3.ticketing.dto.TicketCreateRequest;
import com.sliit.smartcampus.exception.BadRequestException;
import com.sliit.smartcampus.exception.ResourceNotFoundException;
import com.sliit.smartcampus.model.member3.ticketing.Ticket;
import com.sliit.smartcampus.repository.member3.ticketing.TicketRepository;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final MongoTemplate mongoTemplate;

    public TicketService(TicketRepository ticketRepository, MongoTemplate mongoTemplate) {
        this.ticketRepository = ticketRepository;
        this.mongoTemplate = mongoTemplate;
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

    public List<Ticket> getTickets(
            Ticket.TicketStatus status,
            Ticket.TicketPriority priority,
            String category,
            String reportedBy,
            String assignedTo,
            LocalDateTime createdFrom,
            LocalDateTime createdTo) {

        List<Criteria> criteria = new ArrayList<>();

        if (status != null) {
            criteria.add(Criteria.where("status").is(status));
        }

        if (priority != null) {
            criteria.add(Criteria.where("priority").is(priority));
        }

        if (StringUtils.hasText(category)) {
            criteria.add(Criteria.where("category").is(category.trim()));
        }

        if (StringUtils.hasText(reportedBy)) {
            criteria.add(Criteria.where("reportedBy").is(reportedBy.trim()));
        }

        if (StringUtils.hasText(assignedTo)) {
            criteria.add(Criteria.where("assignedTo").is(assignedTo.trim()));
        }

        if (createdFrom != null && createdTo != null) {
            criteria.add(Criteria.where("createdAt").gte(createdFrom).lte(createdTo));
        } else if (createdFrom != null) {
            criteria.add(Criteria.where("createdAt").gte(createdFrom));
        } else if (createdTo != null) {
            criteria.add(Criteria.where("createdAt").lte(createdTo));
        }

        Query query = new Query();
        if (!criteria.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteria.toArray(new Criteria[0])));
        }
        query.with(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));

        return mongoTemplate.find(query, Ticket.class);
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
            validateStatusTransition(existingTicket.getStatus(), ticketRequest.getStatus());
            existingTicket.setStatus(ticketRequest.getStatus());
        }

        return ticketRepository.save(existingTicket);
    }

    public Ticket updateTicketStatus(String id, Ticket.TicketStatus status) {
        Ticket ticket = getTicketById(id);
        validateStatusTransition(ticket.getStatus(), status);
        ticket.setStatus(status);
        return ticketRepository.save(ticket);
    }

    public Ticket assignTechnician(String id, String technicianId) {
        Ticket ticket = getTicketById(id);

        if (ticket.getStatus() == Ticket.TicketStatus.CLOSED) {
            throw new BadRequestException("Closed tickets cannot be assigned to a technician");
        }

        if (technicianId != null && technicianId.equals(ticket.getAssignedTo())) {
            return ticket;
        }

        ticket.setAssignedTo(technicianId);

        if (ticket.getStatus() == Ticket.TicketStatus.OPEN) {
            ticket.setStatus(Ticket.TicketStatus.IN_PROGRESS);
        }

        return ticketRepository.save(ticket);
    }

    private void validateStatusTransition(Ticket.TicketStatus currentStatus, Ticket.TicketStatus nextStatus) {
        if (currentStatus == null || nextStatus == null || currentStatus == nextStatus) {
            return;
        }

        boolean allowed = switch (currentStatus) {
            case OPEN -> nextStatus == Ticket.TicketStatus.IN_PROGRESS
                    || nextStatus == Ticket.TicketStatus.RESOLVED
                    || nextStatus == Ticket.TicketStatus.CLOSED;
            case IN_PROGRESS -> nextStatus == Ticket.TicketStatus.RESOLVED
                    || nextStatus == Ticket.TicketStatus.CLOSED;
            case RESOLVED -> nextStatus == Ticket.TicketStatus.CLOSED;
            case CLOSED -> false;
        };

        if (!allowed) {
            throw new BadRequestException(String.format(
                    "Invalid ticket status transition from %s to %s",
                    currentStatus,
                    nextStatus));
        }
    }

    public void deleteTicket(String id) {
        getTicketById(id);
        ticketRepository.deleteById(id);
    }
}
