package com.sliit.smartcampus.controller.member4;

import com.sliit.smartcampus.service.member4.AuthService;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody RegisterRequest request) {
        Map<String, String> response = authService.register(
                request.fullName(), request.email(), request.password()
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest request) {
        Map<String, String> response = authService.login(request.email(), request.password());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/oauth2/callback")
    public ResponseEntity<Map<String, String>> oauthCallback(@RequestBody OAuthRequest request) {
        Map<String, String> response = authService.processOAuthLogin(
                request.email(), request.fullName(), request.provider(), request.providerId()
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> me() {
        return ResponseEntity.ok(authService.getCurrentUserProfile());
    }

    // ── Request Records ─────────────────────────────────────────

    public record RegisterRequest(
            @NotBlank String fullName,
            @Email @NotBlank String email,
            @Size(min = 6) @NotBlank String password
    ) {}

    public record LoginRequest(
            @Email @NotBlank String email,
            @NotBlank String password
    ) {}

    public record OAuthRequest(
            String email,
            String fullName,
            String provider,
            String providerId
    ) {}
}
