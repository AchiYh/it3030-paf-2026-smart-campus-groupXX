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

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
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
                .sorted(Comparator.comparing(user -> String.valueOf(user.getFullName()).toLowerCase()))
                .map(user -> new TechnicianOptionResponse(
                        user.getId(),
                        user.getFullName(),
                        user.getEmail(),
                        user.getSpecialization(),
                        user.getPhone(),
                        user.getProfilePicture()))
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
