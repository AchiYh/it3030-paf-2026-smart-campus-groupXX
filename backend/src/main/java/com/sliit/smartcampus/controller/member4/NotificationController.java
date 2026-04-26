package com.sliit.smartcampus.controller.member4;

import com.sliit.smartcampus.model.member4.Notification;
import com.sliit.smartcampus.model.member4.User;
import com.sliit.smartcampus.repository.member4.UserRepository;
import com.sliit.smartcampus.service.member4.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationController(NotificationService notificationService, UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    private String getUserId(java.security.Principal principal) {
        String email = principal.getName();
        return userRepository.findByEmail(email)
                .map(User::getId)
                .orElse(email); // Fallback to email if user not found, though should not happen
    }

    @GetMapping("/my")
    public ResponseEntity<List<Notification>> getMyNotifications(java.security.Principal principal) {
        String userId = getUserId(principal);
        return ResponseEntity.ok(notificationService.getNotificationsByUser(userId));
    }

    @GetMapping("/my/unread/count")
    public ResponseEntity<Map<String, Long>> getMyUnreadCount(java.security.Principal principal) {
        String userId = getUserId(principal);
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable String id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @PatchMapping("/my/read-all")
    public ResponseEntity<Void> markAllAsRead(java.security.Principal principal) {
        String userId = getUserId(principal);
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable String id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }
}
