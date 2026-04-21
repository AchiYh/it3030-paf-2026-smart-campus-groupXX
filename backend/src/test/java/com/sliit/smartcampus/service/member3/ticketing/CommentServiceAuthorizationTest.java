package com.sliit.smartcampus.service.member3.ticketing;

import com.sliit.smartcampus.controller.member3.ticketing.dto.CommentCreateRequest;
import com.sliit.smartcampus.controller.member3.ticketing.dto.CommentUpdateRequest;
import com.sliit.smartcampus.model.member3.ticketing.Comment;
import com.sliit.smartcampus.model.member3.ticketing.Ticket;
import com.sliit.smartcampus.model.member4.User;
import com.sliit.smartcampus.repository.member3.ticketing.CommentRepository;
import com.sliit.smartcampus.repository.member3.ticketing.TicketRepository;
import com.sliit.smartcampus.repository.member4.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
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
class CommentServiceAuthorizationTest {

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private UserRepository userRepository;

    private CommentService commentService;

    @BeforeEach
    void setUp() {
        commentService = new CommentService(commentRepository, ticketRepository, userRepository);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void addComment_deniesInternalCommentForRegularUser() {
        User user = user("u1", "u1@mail.com", User.Role.USER);
        authenticateAs(user.getEmail());
        mockCurrentUser(user);
        mockTicketExists("t1");

        AccessDeniedException ex = assertThrows(
                AccessDeniedException.class,
                () -> commentService.addComment("t1", new CommentCreateRequest("internal note", Comment.Visibility.INTERNAL, false))
        );

        assertTrue(ex.getMessage().contains("Only ADMIN or TECHNICIAN"));
        verify(commentRepository, never()).save(any());
    }

    @Test
    void updateComment_allowsOwnerToEditOwnComment() {
        User user = user("u1", "u1@mail.com", User.Role.USER);
        authenticateAs(user.getEmail());
        mockCurrentUser(user);
        mockTicketExists("t1");

        Comment existing = Comment.builder()
                .id("c1")
                .ticketId("t1")
                .authorId("u1")
                .content("old")
                .visibility(Comment.Visibility.PUBLIC)
                .pinned(false)
                .build();

        when(commentRepository.findById("c1")).thenReturn(Optional.of(existing));
        when(commentRepository.save(any(Comment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Comment updated = commentService.updateComment(
                "t1",
                "c1",
                new CommentUpdateRequest("new content", Comment.Visibility.PUBLIC, false)
        );

        assertEquals("new content", updated.getContent());
        verify(commentRepository).save(existing);
    }

    @Test
    void updateComment_deniesNonOwnerRegularUser() {
        User user = user("u2", "u2@mail.com", User.Role.USER);
        authenticateAs(user.getEmail());
        mockCurrentUser(user);
        mockTicketExists("t1");

        Comment existing = Comment.builder()
                .id("c1")
                .ticketId("t1")
                .authorId("u1")
                .content("old")
                .visibility(Comment.Visibility.PUBLIC)
                .pinned(false)
                .build();

        when(commentRepository.findById("c1")).thenReturn(Optional.of(existing));

        AccessDeniedException ex = assertThrows(
                AccessDeniedException.class,
                () -> commentService.updateComment(
                        "t1",
                        "c1",
                        new CommentUpdateRequest("attempt", Comment.Visibility.PUBLIC, false)
                )
        );

        assertTrue(ex.getMessage().contains("not authorized"));
        verify(commentRepository, never()).save(any());
    }

    @Test
        void updateComment_allowsAdminToEditOwnCommentAndChangeVisibilityAndPin() {
        User admin = user("a1", "admin@mail.com", User.Role.ADMIN);
        authenticateAs(admin.getEmail());
        mockCurrentUser(admin);
        mockTicketExists("t1");

        Comment existing = Comment.builder()
                .id("c1")
                .ticketId("t1")
                                .authorId("a1")
                .content("old")
                .visibility(Comment.Visibility.PUBLIC)
                .pinned(false)
                .build();

        when(commentRepository.findById("c1")).thenReturn(Optional.of(existing));
        when(commentRepository.save(any(Comment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Comment updated = commentService.updateComment(
                "t1",
                "c1",
                new CommentUpdateRequest("moderated", Comment.Visibility.INTERNAL, true)
        );

        assertEquals(Comment.Visibility.INTERNAL, updated.getVisibility());
        assertEquals(true, updated.getPinned());
        verify(commentRepository).save(existing);
    }

    @Test
    void updateComment_deniesAdminEditingAnotherUsersComment() {
        User admin = user("a1", "admin@mail.com", User.Role.ADMIN);
        authenticateAs(admin.getEmail());
        mockCurrentUser(admin);
        mockTicketExists("t1");

        Comment existing = Comment.builder()
                .id("c1")
                .ticketId("t1")
                .authorId("u1")
                .content("old")
                .visibility(Comment.Visibility.PUBLIC)
                .pinned(false)
                .build();

        when(commentRepository.findById("c1")).thenReturn(Optional.of(existing));

        AccessDeniedException ex = assertThrows(
                AccessDeniedException.class,
                () -> commentService.updateComment(
                        "t1",
                        "c1",
                        new CommentUpdateRequest("moderated", Comment.Visibility.INTERNAL, true)
                )
        );

        assertTrue(ex.getMessage().contains("not authorized"));
        verify(commentRepository, never()).save(any());
    }

    @Test
    void deleteComment_deniesNonOwnerRegularUser() {
        User user = user("u2", "u2@mail.com", User.Role.USER);
        authenticateAs(user.getEmail());
        mockCurrentUser(user);
        mockTicketExists("t1");

        Comment existing = Comment.builder()
                .id("c1")
                .ticketId("t1")
                .authorId("u1")
                .content("old")
                .visibility(Comment.Visibility.PUBLIC)
                .pinned(false)
                .build();

        when(commentRepository.findById("c1")).thenReturn(Optional.of(existing));

        assertThrows(AccessDeniedException.class, () -> commentService.deleteComment("t1", "c1"));
        verify(commentRepository, never()).deleteById(any());
    }

        @Test
        void deleteComment_deniesAdminDeletingAnotherUsersComment() {
                User admin = user("a1", "admin@mail.com", User.Role.ADMIN);
                authenticateAs(admin.getEmail());
                mockCurrentUser(admin);
                mockTicketExists("t1");

                Comment existing = Comment.builder()
                                .id("c1")
                                .ticketId("t1")
                                .authorId("u1")
                                .content("old")
                                .visibility(Comment.Visibility.PUBLIC)
                                .pinned(false)
                                .build();

                when(commentRepository.findById("c1")).thenReturn(Optional.of(existing));

                assertThrows(AccessDeniedException.class, () -> commentService.deleteComment("t1", "c1"));
                verify(commentRepository, never()).deleteById(any());
        }

    @Test
    void getComments_hidesInternalCommentsForRegularUserUnlessOwner() {
        User user = user("u1", "u1@mail.com", User.Role.USER);
        authenticateAs(user.getEmail());
        mockCurrentUser(user);
        mockTicketExists("t1");

        Comment publicComment = Comment.builder()
                .id("c1")
                .ticketId("t1")
                .authorId("u2")
                .visibility(Comment.Visibility.PUBLIC)
                .content("public")
                .build();

        Comment internalForeign = Comment.builder()
                .id("c2")
                .ticketId("t1")
                .authorId("u2")
                .visibility(Comment.Visibility.INTERNAL)
                .content("internal-foreign")
                .build();

        Comment internalOwn = Comment.builder()
                .id("c3")
                .ticketId("t1")
                .authorId("u1")
                .visibility(Comment.Visibility.INTERNAL)
                .content("internal-own")
                .build();

        when(commentRepository.findByTicketIdOrderByCreatedAtAsc("t1"))
                .thenReturn(List.of(publicComment, internalForeign, internalOwn));

        List<Comment> visible = commentService.getCommentsByTicket("t1");

        assertEquals(2, visible.size());
        assertTrue(visible.stream().anyMatch(c -> "c1".equals(c.getId())));
        assertTrue(visible.stream().anyMatch(c -> "c3".equals(c.getId())));
    }

    private void mockTicketExists(String ticketId) {
        when(ticketRepository.findById(ticketId)).thenReturn(Optional.of(Ticket.builder().id(ticketId).build()));
    }

    private void mockCurrentUser(User user) {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
    }

    private void authenticateAs(String email) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(email, null, List.of())
        );
    }

    private User user(String id, String email, User.Role role) {
        return User.builder()
                .id(id)
                .email(email)
                .role(role)
                .enabled(true)
                .build();
    }
}
