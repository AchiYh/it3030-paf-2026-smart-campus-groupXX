package com.sliit.smartcampus.controller.member4;

import com.sliit.smartcampus.exception.BadRequestException;
import com.sliit.smartcampus.model.member4.User;
import com.sliit.smartcampus.repository.member4.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;
import java.util.Map;

import com.sliit.smartcampus.dto.member4.UserUpdateDto;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/user")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/me")
    public ResponseEntity<User> getMe(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(user);
    }

    @PutMapping("/update-profile-field")
    public ResponseEntity<Map<String, Object>> updateProfileField(
            @AuthenticationPrincipal User user,
            @RequestBody UserUpdateDto dto
    ) {
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Unauthorized"));
        }

        User existingUser = userRepository.findById(user.getId()).orElse(null);
        if (existingUser == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "User not found"));
        }

        String field = dto.getField();
        String value = dto.getValue();

        switch (field) {
            case "phoneNumber":
            case "phone":
                existingUser.setPhone(value);
                break;
            case "year":
                existingUser.setYear(value);
                break;
            case "semester":
                existingUser.setSemester(value);
                break;
            case "fullName":
            case "firstName":
                existingUser.setFullName(value);
                break;
            case "tempEmail":
                existingUser.setTempEmail(value);
                break;
            default:
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Field " + field + " is not editable or unknown"));
        }

        userRepository.save(existingUser);

        return ResponseEntity.ok(Map.of("success", true, "message", "Profile updated successfully"));
    }

    @PostMapping("/upload-profile-image")
    public ResponseEntity<Map<String, String>> uploadProfileImage(
            @AuthenticationPrincipal User user,
            @RequestParam("file") MultipartFile file
    ) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        try {
            String uploadDir = "uploads/profile/";
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath);
            String imageUrl = "/api/user/image/" + fileName; 
            User existingUser = userRepository.findById(user.getId()).orElse(null);
            if (existingUser != null) {
                existingUser.setProfilePicture(imageUrl);
                userRepository.save(existingUser);
            }
            return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/image/{fileName:.+}")
    public ResponseEntity<byte[]> getImage(@PathVariable String fileName) {
        try {
            Path filePath = Paths.get("uploads/profile/").resolve(fileName);
            byte[] image = Files.readAllBytes(filePath);
            return ResponseEntity.ok().body(image);
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/update-password")
    public ResponseEntity<Map<String, String>> updatePassword(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> payload
    ) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        User existingUser = userRepository.findById(user.getId()).orElse(null);
        if (existingUser == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
        }

        String currentPassword = payload.get("current");
        String newPassword = payload.get("new");

        if (!passwordEncoder.matches(currentPassword, existingUser.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Current password does not match"));
        }

        existingUser.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(existingUser);

        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }

    @DeleteMapping("/me")
    public ResponseEntity<Map<String, String>> deleteMe(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        userRepository.deleteById(user.getId());
        return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/technicians")
    @PreAuthorize("hasAnyRole('ADMIN','TECHNICIAN')")
    public ResponseEntity<List<TechnicianOptionResponse>> getTechnicians() {
        List<TechnicianOptionResponse> technicians = userRepository.findByRole(User.Role.TECHNICIAN)
                .stream()
                .sorted(Comparator.comparing((User u) -> String.valueOf(u.getFullName()).toLowerCase()))
                .map((User u) -> new TechnicianOptionResponse(
                        u.getId(),
                        u.getFullName(),
                        u.getEmail(),
                        u.getSpecialization(),
                        u.getPhone(),
                        u.getProfilePicture()))
                .toList();
        return ResponseEntity.ok(technicians);
    }

    @PatchMapping("/admin/{userId}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateUserRole(@PathVariable String userId, @RequestBody Map<String, String> payload) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        User.Role newRole = User.Role.valueOf(payload.get("role"));
        user.setRole(newRole);
        return ResponseEntity.ok(userRepository.save(user));
    }

    @DeleteMapping("/admin/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> adminDeleteUser(@PathVariable String userId) {
        userRepository.deleteById(userId);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully by Admin"));
    }

    @PostMapping("/admin/technicians")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> createTechnician(@RequestBody Map<String, String> payload) {
        String fullName = payload.get("fullName");
        String email = payload.get("email");
        String password = payload.get("password");
        String phone = payload.get("phone");
        String specialization = payload.get("specialization");
        String profilePicture = payload.get("profilePicture");

        if (fullName == null || fullName.isBlank() || email == null || email.isBlank() || password == null || password.isBlank()) {
            throw new BadRequestException("Full name, email, and password are required");
        }

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email already registered");
        }

        User technician = User.builder()
                .fullName(fullName.trim())
                .email(email.trim())
                .password(passwordEncoder.encode(password))
                .role(User.Role.TECHNICIAN)
                .enabled(true)
            .phone(phone == null ? null : phone.trim())
            .specialization(specialization == null ? null : specialization.trim())
            .profilePicture(profilePicture == null ? null : profilePicture.trim())
                .build();

        return ResponseEntity.ok(userRepository.save(technician));
    }

    public record TechnicianOptionResponse(
            String id,
            String fullName,
            String email,
            String specialization,
            String phone,
            String profilePicture
    ) {}
}
