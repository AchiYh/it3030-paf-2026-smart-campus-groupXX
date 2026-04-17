package com.sliit.smartcampus.service.member3.ticketing;

import com.sliit.smartcampus.controller.member3.ticketing.dto.CommentCreateRequest;
import com.sliit.smartcampus.controller.member3.ticketing.dto.CommentUpdateRequest;
import com.sliit.smartcampus.exception.BadRequestException;
import com.sliit.smartcampus.exception.ResourceNotFoundException;
import com.sliit.smartcampus.model.member3.ticketing.Comment;
import com.sliit.smartcampus.model.member4.User;
import com.sliit.smartcampus.repository.member3.ticketing.CommentRepository;
import com.sliit.smartcampus.repository.member3.ticketing.TicketRepository;
import com.sliit.smartcampus.repository.member4.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public CommentService(
            CommentRepository commentRepository,
            TicketRepository ticketRepository,
            UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    public List<Comment> getCommentsByTicket(String ticketId) {
        ensureTicketExists(ticketId);
        User currentUser = getCurrentUser();

        List<Comment> comments = commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
        if (isPrivileged(currentUser)) {
            return comments;
        }

        return comments.stream()
                .filter(comment -> comment.getVisibility() == Comment.Visibility.PUBLIC
                        || isOwner(comment, currentUser))
                .collect(Collectors.toList());
    }

    public Comment addComment(String ticketId, CommentCreateRequest request) {
        ensureTicketExists(ticketId);
        User currentUser = getCurrentUser();

        validatePrivilegedCommentFields(request.visibility(), request.pinned(), currentUser);

        Comment comment = Comment.builder()
                .ticketId(ticketId)
                .content(request.content().trim())
                .authorId(resolveAuthorId(currentUser))
                .visibility(request.visibility())
                .pinned(Boolean.TRUE.equals(request.pinned()))
                .build();

        return commentRepository.save(comment);
    }

    public Comment updateComment(String ticketId, String commentId, CommentUpdateRequest request) {
        ensureTicketExists(ticketId);
        User currentUser = getCurrentUser();
        Comment comment = getCommentByIdAndTicket(commentId, ticketId);

        boolean privileged = isPrivileged(currentUser);
        if (!privileged && !isOwner(comment, currentUser)) {
            throw new AccessDeniedException("You are not authorized to update this comment");
        }

        if (!privileged) {
            if (request.visibility() != comment.getVisibility()) {
                throw new AccessDeniedException("Only ADMIN or TECHNICIAN can change comment visibility");
            }
            if (Boolean.TRUE.equals(request.pinned()) != Boolean.TRUE.equals(comment.getPinned())) {
                throw new AccessDeniedException("Only ADMIN or TECHNICIAN can pin/unpin comments");
            }
        }

        comment.setContent(request.content().trim());
        comment.setVisibility(request.visibility());
        comment.setPinned(Boolean.TRUE.equals(request.pinned()));

        return commentRepository.save(comment);
    }

    public void deleteComment(String ticketId, String commentId) {
        ensureTicketExists(ticketId);
        User currentUser = getCurrentUser();
        Comment comment = getCommentByIdAndTicket(commentId, ticketId);

        if (!isPrivileged(currentUser) && !isOwner(comment, currentUser)) {
            throw new AccessDeniedException("You are not authorized to delete this comment");
        }

        commentRepository.deleteById(commentId);
    }

    private void validatePrivilegedCommentFields(Comment.Visibility visibility, Boolean pinned, User currentUser) {
        if (!isPrivileged(currentUser)) {
            if (visibility == Comment.Visibility.INTERNAL) {
                throw new AccessDeniedException("Only ADMIN or TECHNICIAN can create INTERNAL comments");
            }
            if (Boolean.TRUE.equals(pinned)) {
                throw new AccessDeniedException("Only ADMIN or TECHNICIAN can pin comments");
            }
        }
    }

    private Comment getCommentByIdAndTicket(String commentId, String ticketId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));

        if (!ticketId.equals(comment.getTicketId())) {
            throw new BadRequestException("Comment does not belong to the specified ticket");
        }
        return comment;
    }

    private void ensureTicketExists(String ticketId) {
        ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", ticketId));
    }

    private boolean isPrivileged(User user) {
        return user.getRole() == User.Role.ADMIN || user.getRole() == User.Role.TECHNICIAN;
    }

    private boolean isOwner(Comment comment, User user) {
        String authorId = comment.getAuthorId();
        if (!StringUtils.hasText(authorId)) {
            return false;
        }
        return authorId.equals(user.getId()) || authorId.equalsIgnoreCase(user.getEmail());
    }

    private String resolveAuthorId(User user) {
        if (StringUtils.hasText(user.getId())) {
            return user.getId();
        }
        return user.getEmail();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Authentication is required");
        }

        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AccessDeniedException("Authenticated user not found"));
    }
}