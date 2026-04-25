package com.sliit.smartcampus.service.member3.ticketing;

import com.sliit.smartcampus.controller.member3.ticketing.dto.TicketCreateRequest;
import com.sliit.smartcampus.controller.member3.ticketing.dto.TicketResolveRequest;
import com.sliit.smartcampus.controller.member3.ticketing.dto.TicketCloseRequest;
import com.sliit.smartcampus.controller.member3.ticketing.dto.TicketRejectRequest;
import com.sliit.smartcampus.exception.BadRequestException;
import com.sliit.smartcampus.exception.ResourceNotFoundException;
import com.sliit.smartcampus.model.member3.ticketing.Ticket;
import com.sliit.smartcampus.model.member3.ticketing.UserSnapshot;
import com.sliit.smartcampus.model.member4.User;
import com.sliit.smartcampus.model.member4.Notification.NotificationType;
import com.sliit.smartcampus.repository.member3.ticketing.TicketRepository;
import com.sliit.smartcampus.repository.member4.UserRepository;
import com.sliit.smartcampus.service.member4.NotificationService;
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

    private static final List<Ticket.TicketStatus> ACTIVE_ASSIGNMENT_STATUSES = List.of(
            Ticket.TicketStatus.OPEN,
            Ticket.TicketStatus.IN_PROGRESS,
        Ticket.TicketStatus.OVERDUE,
            Ticket.TicketStatus.RESOLVED
    );

    private static final List<Ticket.TicketStatus> OVERDUE_CANDIDATE_STATUSES = List.of(
        Ticket.TicketStatus.OPEN,
        Ticket.TicketStatus.IN_PROGRESS
    );

    private final TicketRepository ticketRepository;
    private final MongoTemplate mongoTemplate;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public TicketService(TicketRepository ticketRepository, 
                         MongoTemplate mongoTemplate, 
                         UserRepository userRepository,
                         NotificationService notificationService) {
        this.ticketRepository = ticketRepository;
        this.mongoTemplate = mongoTemplate;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public Ticket createTicket(TicketCreateRequest request) {
        UserSnapshot assignedTechnician = resolveTechnicianSnapshot(request.assignedTo());
        LocalDateTime dueAt = calculateDueDate(request.priority());
        Ticket ticket = Ticket.builder()
                .title(request.title())
                .description(request.description())
                .category(request.category())
                .priority(request.priority())
                .status(Ticket.TicketStatus.OPEN)
                .reportedBy(request.reportedBy())
                .assignedTo(request.assignedTo())
                .assignedTechnician(assignedTechnician)
                .dueAt(dueAt)
                .build();

        Ticket saved = ticketRepository.save(ticket);

        // Notify Admins
        List<User> admins = userRepository.findByRole(User.Role.ADMIN);
        for (User admin : admins) {
            notificationService.createNotification(
                admin.getId(),
                "New Ticket Created",
                "Ticket #" + saved.getId() + ": " + saved.getTitle(),
                NotificationType.TICKET,
                saved.getId(),
                "TICKET"
            );
        }

        return saved;
    }

    public List<Ticket> getTickets(
            Ticket.TicketStatus status,
            Ticket.TicketPriority priority,
            String category,
            String reportedBy,
            String assignedTo,
            LocalDateTime createdFrom,
            LocalDateTime createdTo) {

        User currentUser = getCurrentUser();
        refreshOverdueTickets();

        List<Criteria> criteria = new ArrayList<>();

        if (currentUser.getRole() == User.Role.USER) {
            criteria.add(buildTicketOwnerCriteria(currentUser));
        } else if (currentUser.getRole() == User.Role.TECHNICIAN) {
            criteria.add(buildTechnicianAssignmentCriteria(currentUser));
        }

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
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", id));
        return refreshOverdueStatus(ticket);
    }

    public Ticket getTicketByIdForCurrentUser(String id) {
        Ticket ticket = getTicketById(id);
        User currentUser = getCurrentUser();

        if (currentUser.getRole() == User.Role.USER && !isTicketOwner(ticket, currentUser)) {
            throw new AccessDeniedException("You are not authorized to view this ticket");
        }

        if (currentUser.getRole() == User.Role.TECHNICIAN && !isTicketAssignedToTechnician(ticket, currentUser)) {
            throw new AccessDeniedException("You are not authorized to view this ticket");
        }

        return ticket;
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
        UserSnapshot assignedTechnician = resolveTechnicianSnapshot(technicianId);

        if (ticket.getStatus() == Ticket.TicketStatus.CLOSED
                || ticket.getStatus() == Ticket.TicketStatus.REJECTED) {
            throw new BadRequestException("Closed or rejected tickets cannot be assigned to a technician");
        }

        if (technicianId != null && technicianId.equals(ticket.getAssignedTo())) {
            if (ticket.getAssignedTechnician() == null && assignedTechnician != null) {
                ticket.setAssignedTechnician(assignedTechnician);
                return ticketRepository.save(ticket);
            }
            return ticket;
        }

        if (assignedTechnician != null
                && ticketRepository.existsByAssignedToAndStatusInAndIdNot(
                assignedTechnician.getId(), ACTIVE_ASSIGNMENT_STATUSES, ticket.getId())) {
            throw new BadRequestException("Technician is already assigned to another active ticket");
        }

        ticket.setAssignedTo(assignedTechnician == null ? null : assignedTechnician.getId());
        ticket.setAssignedTechnician(assignedTechnician);

        if (ticket.getStatus() == Ticket.TicketStatus.OPEN) {
            ticket.setStatus(Ticket.TicketStatus.IN_PROGRESS);
        }

        Ticket saved = ticketRepository.save(ticket);
        
        // Notify Technician
        if (assignedTechnician != null) {
            notificationService.createNotification(
                assignedTechnician.getId(),
                "New Ticket Assigned",
                "You have been assigned to Ticket: " + saved.getTitle(),
                NotificationType.TICKET,
                saved.getId(),
                "TICKET"
            );
        }

        return saved;
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

        Ticket saved = ticketRepository.save(ticket);

        // Notify User
        userRepository.findByEmail(saved.getReportedBy()).ifPresent(user -> {
            notificationService.createNotification(
                user.getId(),
                "Ticket Rejected ❌",
                "Your ticket was rejected. Reason: " + request.reason(),
                NotificationType.TICKET,
                saved.getId(),
                "TICKET"
            );
        });

        return saved;
    }

    public Ticket resolveTicket(String id, TicketResolveRequest request) {
        Ticket ticket = getTicketById(id);
        User currentUser = getCurrentUser();

        if (currentUser.getRole() != User.Role.TECHNICIAN) {
            throw new AccessDeniedException("Only technicians can resolve tickets");
        }

        validateStatusTransition(ticket.getStatus(), Ticket.TicketStatus.RESOLVED);
        ticket.setStatus(Ticket.TicketStatus.RESOLVED);
        ticket.setResolutionNotes(request.resolutionNotes().trim());
        ticket.setResolvedBy(request.resolvedBy().trim());
        ticket.setResolvedAt(LocalDateTime.now());

        Ticket saved = ticketRepository.save(ticket);
        
        // Notify User
        userRepository.findByEmail(saved.getReportedBy()).ifPresent(user -> {
            notificationService.createNotification(
                user.getId(),
                "Ticket Resolved ✅",
                "Your ticket has been resolved. Note: " + request.resolutionNotes(),
                NotificationType.TICKET,
                saved.getId(),
                "TICKET"
            );
        });

        return saved;
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
                || status == Ticket.TicketStatus.OVERDUE
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
                || nextStatus == Ticket.TicketStatus.OVERDUE
                || nextStatus == Ticket.TicketStatus.REJECTED;
            case IN_PROGRESS -> nextStatus == Ticket.TicketStatus.RESOLVED
                || nextStatus == Ticket.TicketStatus.OVERDUE
                || nextStatus == Ticket.TicketStatus.REJECTED;
            case OVERDUE -> nextStatus == Ticket.TicketStatus.RESOLVED
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

    private Criteria buildTicketOwnerCriteria(User user) {
        List<Criteria> ownerCriteria = new ArrayList<>();

        if (StringUtils.hasText(user.getId())) {
            ownerCriteria.add(Criteria.where("reportedBy").is(user.getId()));
        }

        if (StringUtils.hasText(user.getEmail())) {
            ownerCriteria.add(Criteria.where("reportedBy").is(user.getEmail()));

            String emailPrefix = user.getEmail().contains("@")
                    ? user.getEmail().substring(0, user.getEmail().indexOf('@'))
                    : user.getEmail();
            if (StringUtils.hasText(emailPrefix)) {
                ownerCriteria.add(Criteria.where("reportedBy").is(emailPrefix));
            }
        }

        if (ownerCriteria.isEmpty()) {
            return Criteria.where("reportedBy").is("__no_owner__");
        }

        return new Criteria().orOperator(ownerCriteria.toArray(new Criteria[0]));
    }

    private Criteria buildTechnicianAssignmentCriteria(User user) {
        List<Criteria> technicianCriteria = new ArrayList<>();

        if (StringUtils.hasText(user.getId())) {
            technicianCriteria.add(Criteria.where("assignedTo").is(user.getId()));
        }

        if (technicianCriteria.isEmpty()) {
            return Criteria.where("assignedTo").is("__no_assignment__");
        }

        return new Criteria().orOperator(technicianCriteria.toArray(new Criteria[0]));
    }

    private boolean isTicketAssignedToTechnician(Ticket ticket, User user) {
        if (ticket == null || user == null || !StringUtils.hasText(ticket.getAssignedTo()) || !StringUtils.hasText(user.getId())) {
            return false;
        }

        return ticket.getAssignedTo().equalsIgnoreCase(user.getId());
    }

    private UserSnapshot resolveTechnicianSnapshot(String technicianId) {
        if (!StringUtils.hasText(technicianId)) {
            return null;
        }

        User technician = userRepository.findById(technicianId.trim())
                .orElseThrow(() -> new BadRequestException("Technician not found"));

        if (technician.getRole() != User.Role.TECHNICIAN) {
            throw new BadRequestException("Selected user is not a technician");
        }

        return UserSnapshot.builder()
                .id(technician.getId())
                .fullName(technician.getFullName())
                .email(technician.getEmail())
                .role(technician.getRole().name())
                .phone(technician.getPhone())
                .specialization(technician.getSpecialization())
                .profilePicture(technician.getProfilePicture())
                .build();
    }

    private LocalDateTime calculateDueDate(Ticket.TicketPriority priority) {
        int days = switch (priority) {
            case CRITICAL -> 1;
            case HIGH -> 2;
            case MEDIUM -> 3;
            case LOW -> 5;
        };
        return LocalDateTime.now().plusDays(days);
    }

    private void refreshOverdueTickets() {
        Query overdueQuery = new Query();
        overdueQuery.addCriteria(Criteria.where("dueAt").lt(LocalDateTime.now()));
        overdueQuery.addCriteria(Criteria.where("status").in(OVERDUE_CANDIDATE_STATUSES));

        List<Ticket> overdueCandidates = mongoTemplate.find(overdueQuery, Ticket.class);
        if (overdueCandidates.isEmpty()) {
            return;
        }

        overdueCandidates.forEach(ticket -> ticket.setStatus(Ticket.TicketStatus.OVERDUE));
        ticketRepository.saveAll(overdueCandidates);
    }

    private Ticket refreshOverdueStatus(Ticket ticket) {
        if (ticket == null) {
            return null;
        }

        if (ticket.getDueAt() != null
                && ticket.getDueAt().isBefore(LocalDateTime.now())
                && OVERDUE_CANDIDATE_STATUSES.contains(ticket.getStatus())) {
            ticket.setStatus(Ticket.TicketStatus.OVERDUE);
            return ticketRepository.save(ticket);
        }

        return ticket;
    }
}
