package com.sliit.smartcampus.service.member3.ticketing;

import com.sliit.smartcampus.controller.member3.ticketing.dto.TicketCloseRequest;
import com.sliit.smartcampus.controller.member3.ticketing.dto.TicketResolveRequest;
import com.sliit.smartcampus.exception.BadRequestException;
import com.sliit.smartcampus.model.member3.ticketing.Ticket;
import com.sliit.smartcampus.repository.member3.ticketing.TicketRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoTemplate;

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

    private TicketService ticketService;

    @BeforeEach
    void setUp() {
        ticketService = new TicketService(ticketRepository, mongoTemplate);
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
}
