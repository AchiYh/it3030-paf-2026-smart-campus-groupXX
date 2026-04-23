package com.sliit.smartcampus.controller.member4;

import com.sliit.smartcampus.model.member4.Notification;
import com.sliit.smartcampus.service.member4.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/my")
    public ResponseEntity<List<Notification>> getMyNotifications(java.security.Principal principal) {
        // Here we assume principal.getName() returns the user's email or ID. 
        // In this implementation, the Jwt returns the email as the subject.
        String userEmail = principal.getName();
        return ResponseEntity.ok(notificationService.getNotificationsByUser(userEmail));
    }

    @GetMapping("/my/unread/count")
    public ResponseEntity<Map<String, Long>> getMyUnreadCount(java.security.Principal principal) {
        long count = notificationService.getUnreadCount(principal.getName());
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable String id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @PatchMapping("/my/read-all")
    public ResponseEntity<Void> markAllAsRead(java.security.Principal principal) {
        notificationService.markAllAsRead(principal.getName());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable String id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }
}
