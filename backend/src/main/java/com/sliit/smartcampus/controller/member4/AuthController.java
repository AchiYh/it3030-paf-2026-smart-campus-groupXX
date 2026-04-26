package com.sliit.smartcampus.controller.member4;

import com.sliit.smartcampus.model.member4.User;
import com.sliit.smartcampus.service.member4.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request, HttpServletResponse response) {
        AuthResponse res = authService.register(request);
        
        Cookie cookie = new Cookie("userEmail", request.email());
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(30 * 60);
        response.addCookie(cookie);

        return ResponseEntity.ok(res);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        return ResponseEntity.ok(authService.login(request, response));
    }

    @PostMapping("/verify-code")
    public ResponseEntity<AuthResponse> verifyCode(@RequestBody VerifyCodeRequest request, HttpServletRequest httpRequest) {
        String email = getCookie(httpRequest, "userEmail");
        if (email == null) {
            return ResponseEntity.badRequest().body(new AuthResponse(false, "Email not found in session", null));
        }
        return ResponseEntity.ok(authService.verifyCode(email, request.verifyCode()));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<AuthResponse> resendOtp(HttpServletRequest request) {
        String email = getCookie(request, "userEmail");
        if (email == null) {
            return ResponseEntity.badRequest().body(new AuthResponse(false, "Email not found", null));
        }
        return ResponseEntity.ok(authService.resendOtp(email));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = getCookie(request, "REFRESH");
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.status(401).body(Map.of("message", "No refresh token"));
        }
        return authService.refresh(refreshToken, response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletResponse response) {
        authService.logout(response);
        return ResponseEntity.ok(Map.of("message", "Logout successful"));
    }

    @PostMapping("/check-phone")
    public ResponseEntity<Map<String, Boolean>> checkPhone(@RequestBody Map<String, String> body) {
        String phone = body.get("phoneNumber");
        boolean available = authService.isPhoneAvailable(phone);
        return ResponseEntity.ok(Map.of("available", available));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me() {
        return ResponseEntity.ok(authService.getCurrentUserContext());
    }

    private String getCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return null;
        for (Cookie c : request.getCookies()) {
            if (name.equals(c.getName())) {
                return c.getValue();
            }
        }
        return null;
    }
    // ── Request Records ─────────────────────────────────────────

    public record RegisterRequest(
            @NotBlank String firstname,
            @NotBlank String lastName,
            @Email @NotBlank String email,
            @Email @NotBlank String tempEmail,
            String phoneNumber,
            String year,
            String semester,
            @NotBlank String password
    ) {}

    public record LoginRequest(
            @Email @NotBlank String email,
            @NotBlank String password
    ) {}

    public record VerifyCodeRequest(
            @NotBlank String verifyCode
    ) {}

    public record AuthResponse(
            boolean success,
            String message,
            String role
    ) {}
}
