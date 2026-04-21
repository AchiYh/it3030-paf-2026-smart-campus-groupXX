package com.sliit.smartcampus.service.member3.ticketing;

import com.sliit.smartcampus.controller.member3.ticketing.dto.TicketCloseRequest;
import com.sliit.smartcampus.controller.member3.ticketing.dto.TicketResolveRequest;
import com.sliit.smartcampus.exception.BadRequestException;
import com.sliit.smartcampus.model.member3.ticketing.Ticket;
import com.sliit.smartcampus.model.member4.User;
import com.sliit.smartcampus.repository.member3.ticketing.TicketRepository;
import com.sliit.smartcampus.repository.member4.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TicketServiceStatusTransitionTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private MongoTemplate mongoTemplate;

    @Mock
    private UserRepository userRepository;

    private TicketService ticketService;

    @BeforeEach
    void setUp() {
        ticketService = new TicketService(ticketRepository, mongoTemplate, userRepository);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void updateTicketStatus_allowsOpenToInProgress() {
        Ticket ticket = Ticket.builder().id("t1").status(Ticket.TicketStatus.OPEN).build();
        when(ticketRepository.findById("t1")).thenReturn(Optional.of(ticket));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Ticket updated = ticketService.updateTicketStatus("t1", Ticket.TicketStatus.IN_PROGRESS);

        assertEquals(Ticket.TicketStatus.IN_PROGRESS, updated.getStatus());
        verify(ticketRepository).save(ticket);
    }

    @Test
    void updateTicketStatus_rejectsClosedViaGenericEndpoint() {
        BadRequestException ex = assertThrows(
                BadRequestException.class,
                () -> ticketService.updateTicketStatus("t1", Ticket.TicketStatus.CLOSED)
        );

        assertTrue(ex.getMessage().contains("/resolve, /close, and /reject"));
        verify(ticketRepository, never()).findById(any());
    }

    @Test
    void resolveTicket_succeedsFromInProgress() {
        Ticket ticket = Ticket.builder().id("t1").status(Ticket.TicketStatus.IN_PROGRESS).build();
        when(ticketRepository.findById("t1")).thenReturn(Optional.of(ticket));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Ticket resolved = ticketService.resolveTicket("t1", new TicketResolveRequest("Issue fixed", "tech_001"));

        assertEquals(Ticket.TicketStatus.RESOLVED, resolved.getStatus());
        assertEquals("Issue fixed", resolved.getResolutionNotes());
        assertEquals("tech_001", resolved.getResolvedBy());
        verify(ticketRepository).save(ticket);
    }

    @Test
    void resolveTicket_failsFromOpenState() {
        Ticket ticket = Ticket.builder().id("t1").status(Ticket.TicketStatus.OPEN).build();
        when(ticketRepository.findById("t1")).thenReturn(Optional.of(ticket));

        BadRequestException ex = assertThrows(
                BadRequestException.class,
                () -> ticketService.resolveTicket("t1", new TicketResolveRequest("Issue fixed", "tech_001"))
        );

        assertTrue(ex.getMessage().contains("Invalid ticket status transition"));
        verify(ticketRepository, never()).save(any());
    }

    @Test
    void closeTicket_requiresResolutionNotes() {
        Ticket ticket = Ticket.builder()
                .id("t1")
                .status(Ticket.TicketStatus.RESOLVED)
                .resolutionNotes("   ")
                .build();
        when(ticketRepository.findById("t1")).thenReturn(Optional.of(ticket));

        BadRequestException ex = assertThrows(
                BadRequestException.class,
                () -> ticketService.closeTicket("t1", new TicketCloseRequest("admin_001"))
        );

        assertEquals("Resolution notes are required before closing a ticket", ex.getMessage());
        verify(ticketRepository, never()).save(any());
    }

    @Test
    void updateTicket_rejectsNonOpenStatus() {
    Ticket ticket = Ticket.builder()
        .id("t1")
        .status(Ticket.TicketStatus.REJECTED)
            .reportedBy("reporter")
        .build();

        User user = User.builder().id("u1").email("reporter@example.com").role(User.Role.USER).enabled(true).build();

        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken("reporter@example.com", null, List.of())
        );

    when(ticketRepository.findById("t1")).thenReturn(Optional.of(ticket));
        when(userRepository.findByEmail("reporter@example.com")).thenReturn(Optional.of(user));

    BadRequestException ex = assertThrows(
        BadRequestException.class,
        () -> ticketService.updateTicket(
            "t1",
            Ticket.builder()
                .title("Updated")
                .description("Updated description")
                .category("Facilities")
                .priority(Ticket.TicketPriority.MEDIUM)
                .reportedBy("reporter")
                .status(Ticket.TicketStatus.REJECTED)
                .build())
    );

    assertEquals("Tickets can only be updated when status is OPEN", ex.getMessage());
    verify(ticketRepository, never()).save(any());
    }

    @Test
    void deleteTicket_allowsRejectedStatus() {
    Ticket ticket = Ticket.builder()
        .id("t1")
        .status(Ticket.TicketStatus.REJECTED)
            .reportedBy("reporter")
        .build();

        User user = User.builder().id("u1").email("reporter@example.com").role(User.Role.USER).enabled(true).build();

        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken("reporter@example.com", null, List.of())
        );

    when(ticketRepository.findById("t1")).thenReturn(Optional.of(ticket));
        when(userRepository.findByEmail("reporter@example.com")).thenReturn(Optional.of(user));

    ticketService.deleteTicket("t1");

    verify(ticketRepository).deleteById("t1");
    }

    @Test
    void deleteTicket_rejectsInProgressStatus() {
    Ticket ticket = Ticket.builder()
        .id("t1")
        .status(Ticket.TicketStatus.IN_PROGRESS)
            .reportedBy("reporter")
        .build();

        User user = User.builder().id("u1").email("reporter@example.com").role(User.Role.USER).enabled(true).build();

        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken("reporter@example.com", null, List.of())
        );

    when(ticketRepository.findById("t1")).thenReturn(Optional.of(ticket));
        when(userRepository.findByEmail("reporter@example.com")).thenReturn(Optional.of(user));

    BadRequestException ex = assertThrows(
        BadRequestException.class,
        () -> ticketService.deleteTicket("t1")
    );

    assertEquals("Tickets can only be deleted when status is OPEN or REJECTED", ex.getMessage());
    verify(ticketRepository, never()).deleteById(any());
    }

    @Test
    void updateTicket_deniesAdminForNonOwnerTicket() {
    Ticket ticket = Ticket.builder()
        .id("t1")
        .status(Ticket.TicketStatus.OPEN)
        .reportedBy("reporter")
        .build();

    User admin = User.builder().id("admin-1").email("admin@mail.com").role(User.Role.ADMIN).enabled(true).build();

    SecurityContextHolder.getContext().setAuthentication(
        new UsernamePasswordAuthenticationToken("admin@mail.com", null, List.of())
    );

    when(ticketRepository.findById("t1")).thenReturn(Optional.of(ticket));
    when(userRepository.findByEmail("admin@mail.com")).thenReturn(Optional.of(admin));

    assertThrows(
        org.springframework.security.access.AccessDeniedException.class,
        () -> ticketService.updateTicket(
            "t1",
            Ticket.builder()
                .title("Updated")
                .description("Updated description")
                .category("Facilities")
                .priority(Ticket.TicketPriority.MEDIUM)
                .reportedBy("reporter")
                .status(Ticket.TicketStatus.OPEN)
                .build())
    );
    }
}
