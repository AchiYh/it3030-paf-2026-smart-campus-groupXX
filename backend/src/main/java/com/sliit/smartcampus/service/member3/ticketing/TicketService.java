package com.sliit.smartcampus.service.member3.ticketing;

import com.sliit.smartcampus.controller.member3.ticketing.dto.TicketCreateRequest;
import com.sliit.smartcampus.controller.member3.ticketing.dto.TicketResolveRequest;
import com.sliit.smartcampus.controller.member3.ticketing.dto.TicketCloseRequest;
import com.sliit.smartcampus.controller.member3.ticketing.dto.TicketRejectRequest;
import com.sliit.smartcampus.exception.BadRequestException;
import com.sliit.smartcampus.exception.ResourceNotFoundException;
import com.sliit.smartcampus.model.member3.ticketing.Ticket;
import com.sliit.smartcampus.model.member4.User;
import com.sliit.smartcampus.repository.member3.ticketing.TicketRepository;
import com.sliit.smartcampus.repository.member4.UserRepository;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final MongoTemplate mongoTemplate;
    private final UserRepository userRepository;

    public TicketService(TicketRepository ticketRepository, MongoTemplate mongoTemplate, UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.mongoTemplate = mongoTemplate;
        this.userRepository = userRepository;
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
        User currentUser = getCurrentUser();

        if (!isTicketOwner(existingTicket, currentUser)) {
            throw new AccessDeniedException("Only ticket owner can update this ticket");
        }

        if (existingTicket.getStatus() != Ticket.TicketStatus.OPEN) {
            throw new BadRequestException("Tickets can only be updated when status is OPEN");
        }

        existingTicket.setTitle(ticketRequest.getTitle());
        existingTicket.setDescription(ticketRequest.getDescription());
        existingTicket.setCategory(ticketRequest.getCategory());
        existingTicket.setPriority(ticketRequest.getPriority());
        existingTicket.setAssignedTo(ticketRequest.getAssignedTo());
        existingTicket.setReportedBy(ticketRequest.getReportedBy());

        if (ticketRequest.getStatus() != null && ticketRequest.getStatus() != existingTicket.getStatus()) {
            throw new BadRequestException("Ticket status cannot be changed from the edit form");
        }

        return ticketRepository.save(existingTicket);
    }

    public Ticket updateTicketStatus(String id, Ticket.TicketStatus status) {
        ensureStatusChangeAllowedInGenericUpdate(status);
        Ticket ticket = getTicketById(id);
        validateStatusTransition(ticket.getStatus(), status);
        ticket.setStatus(status);
        return ticketRepository.save(ticket);
    }

    public Ticket assignTechnician(String id, String technicianId) {
        Ticket ticket = getTicketById(id);

        if (ticket.getStatus() == Ticket.TicketStatus.CLOSED
                || ticket.getStatus() == Ticket.TicketStatus.REJECTED) {
            throw new BadRequestException("Closed or rejected tickets cannot be assigned to a technician");
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

    public Ticket rejectTicket(String id, TicketRejectRequest request) {
        Ticket ticket = getTicketById(id);

        if (ticket.getStatus() == Ticket.TicketStatus.CLOSED) {
            throw new BadRequestException("Closed tickets cannot be rejected");
        }

        if (ticket.getStatus() == Ticket.TicketStatus.REJECTED) {
            throw new BadRequestException("Ticket is already rejected");
        }

        validateStatusTransition(ticket.getStatus(), Ticket.TicketStatus.REJECTED);
        ticket.setStatus(Ticket.TicketStatus.REJECTED);
        ticket.setRejectionReason(request.reason().trim());
        ticket.setRejectedBy(request.rejectedBy().trim());
        ticket.setRejectedAt(LocalDateTime.now());
        ticket.setClosedBy(null);
        ticket.setClosedAt(null);

        return ticketRepository.save(ticket);
    }

    public Ticket resolveTicket(String id, TicketResolveRequest request) {
        Ticket ticket = getTicketById(id);

        validateStatusTransition(ticket.getStatus(), Ticket.TicketStatus.RESOLVED);
        ticket.setStatus(Ticket.TicketStatus.RESOLVED);
        ticket.setResolutionNotes(request.resolutionNotes().trim());
        ticket.setResolvedBy(request.resolvedBy().trim());
        ticket.setResolvedAt(LocalDateTime.now());

        return ticketRepository.save(ticket);
    }

    public Ticket closeTicket(String id, TicketCloseRequest request) {
        Ticket ticket = getTicketById(id);

        if (ticket.getStatus() != Ticket.TicketStatus.RESOLVED) {
            throw new BadRequestException("Ticket must be in RESOLVED state before closing");
        }

        if (!StringUtils.hasText(ticket.getResolutionNotes())) {
            throw new BadRequestException("Resolution notes are required before closing a ticket");
        }

        validateStatusTransition(ticket.getStatus(), Ticket.TicketStatus.CLOSED);
        ticket.setStatus(Ticket.TicketStatus.CLOSED);
        ticket.setClosedBy(request.closedBy().trim());
        ticket.setClosedAt(LocalDateTime.now());

        return ticketRepository.save(ticket);
    }

    private void ensureStatusChangeAllowedInGenericUpdate(Ticket.TicketStatus status) {
        if (status == Ticket.TicketStatus.RESOLVED
                || status == Ticket.TicketStatus.CLOSED
                || status == Ticket.TicketStatus.REJECTED) {
            throw new BadRequestException(
                    "Use /resolve, /close, and /reject endpoints for workflow status updates");
        }
    }

    private void validateStatusTransition(Ticket.TicketStatus currentStatus, Ticket.TicketStatus nextStatus) {
        if (currentStatus == null || nextStatus == null || currentStatus == nextStatus) {
            return;
        }

        boolean allowed = switch (currentStatus) {
            case OPEN -> nextStatus == Ticket.TicketStatus.IN_PROGRESS
                || nextStatus == Ticket.TicketStatus.REJECTED;
            case IN_PROGRESS -> nextStatus == Ticket.TicketStatus.RESOLVED
                || nextStatus == Ticket.TicketStatus.REJECTED;
            case RESOLVED -> nextStatus == Ticket.TicketStatus.CLOSED
                || nextStatus == Ticket.TicketStatus.REJECTED;
            case CLOSED, REJECTED -> false;
        };

        if (!allowed) {
            throw new BadRequestException(String.format(
                    "Invalid ticket status transition from %s to %s",
                    currentStatus,
                    nextStatus));
        }
    }

    public void deleteTicket(String id) {
        Ticket existingTicket = getTicketById(id);
        User currentUser = getCurrentUser();

        if (!isTicketOwner(existingTicket, currentUser)) {
            throw new AccessDeniedException("Only ticket owner can delete this ticket");
        }

        if (existingTicket.getStatus() != Ticket.TicketStatus.OPEN
                && existingTicket.getStatus() != Ticket.TicketStatus.REJECTED) {
            throw new BadRequestException("Tickets can only be deleted when status is OPEN or REJECTED");
        }

        ticketRepository.deleteById(id);
    }

    private boolean isTicketOwner(Ticket ticket, User user) {
        String reporter = ticket.getReportedBy();
        if (!StringUtils.hasText(reporter)) {
            return false;
        }

        String email = user.getEmail();
        String emailPrefix = email != null && email.contains("@") ? email.substring(0, email.indexOf('@')) : email;

        return reporter.equalsIgnoreCase(String.valueOf(user.getId()))
                || reporter.equalsIgnoreCase(email)
                || reporter.equalsIgnoreCase(emailPrefix);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Authentication is required");
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new AccessDeniedException("Authenticated user not found"));
    }
}
