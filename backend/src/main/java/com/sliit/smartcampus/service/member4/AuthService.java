package com.sliit.smartcampus.service.member4;

import org.springframework.context.annotation.Lazy;
import com.sliit.smartcampus.exception.BadRequestException;
import com.sliit.smartcampus.model.member4.User;
import com.sliit.smartcampus.model.member4.User.Role;
import com.sliit.smartcampus.repository.member4.UserRepository;
import com.sliit.smartcampus.security.JwtTokenProvider;
import com.sliit.smartcampus.controller.member4.AuthController.RegisterRequest;
import com.sliit.smartcampus.controller.member4.AuthController.LoginRequest;
import com.sliit.smartcampus.controller.member4.AuthController.AuthResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.http.ResponseEntity;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@Service
public class AuthService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider,
                       EmailService emailService,
                       @Lazy AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.emailService = emailService;
        this.authenticationManager = authenticationManager;
    }

    private String generateOtp() {
        return String.format("%06d", new Random().nextInt(999999));
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email already registered");
        }

        String otp = generateOtp();

        User user = User.builder()
                .fullName(request.firstname() + " " + request.lastName())
                .email(request.email())
                .tempEmail(request.tempEmail())
                .phone(request.phoneNumber())
                .password(passwordEncoder.encode(request.password()))
                .role(request.role() != null ? request.role() : Role.USER)
                .year(request.year())
                .semester(request.semester())
                .isVerified(false)
                .enabled(false) // Wait until OTP verify
                .verifyCode(otp)
                .verifyCodeExpiry(LocalDateTime.now().plusMinutes(10))
                .lastOtpSentAt(LocalDateTime.now())
                .otpResendCount(1)
                .build();

        userRepository.save(user);
        
        emailService.sendEmail(
            user.getEmail(), 
            "Verify your UniSphere Account", 
            "Your verification code is: " + otp
        );

        return new AuthResponse(true, "Registration successful. Please verify OTP.", user.getRole().name());
    }

    public AuthResponse login(LoginRequest request, HttpServletResponse response) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (!user.isVerified()) {
            return new AuthResponse(false, "Account not verified. Please verify OTP first.", null);
        }

        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        String accessToken = jwtTokenProvider.generateToken(auth);
        
        // Use the same for refresh token logic for now to keep it simple
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("type", "refresh");
        String refreshToken = jwtTokenProvider.generateToken(extraClaims, user);

        user.setRefreshToken(refreshToken);
        userRepository.save(user);

        setCookie(response, "ACCESS", accessToken, 15 * 60); // 15 mins
        setCookie(response, "accessToken", accessToken, 15 * 60); // Alias for frontend
        setCookie(response, "REFRESH", refreshToken, 7 * 24 * 60 * 60); // 7 days

        return new AuthResponse(true, "Login successful", user.getRole().name());
    }

    public AuthResponse verifyCode(String email, String code) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isVerified()) {
            return new AuthResponse(false, "Account is already verified", null);
        }

        if (user.getVerifyCode() == null || !user.getVerifyCode().equals(code)) {
            return new AuthResponse(false, "Invalid verification code", null);
        }

        if (user.getVerifyCodeExpiry() != null && user.getVerifyCodeExpiry().isBefore(LocalDateTime.now())) {
            return new AuthResponse(false, "Verification code expired", null);
        }

        user.setVerified(true);
        user.setEnabled(true);
        user.setVerifyCode(null);
        user.setVerifyCodeExpiry(null);
        userRepository.save(user);

        return new AuthResponse(true, "Account verified successfully", user.getRole().name());
    }

    public AuthResponse resendOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isVerified()) {
            return new AuthResponse(false, "Account already verified", null);
        }

        String otp = generateOtp();
        user.setVerifyCode(otp);
        user.setVerifyCodeExpiry(LocalDateTime.now().plusMinutes(10));
        user.setLastOtpSentAt(LocalDateTime.now());
        
        Integer count = user.getOtpResendCount();
        user.setOtpResendCount((count != null ? count : 0) + 1);
        
        userRepository.save(user);

        emailService.sendEmail(
            user.getEmail(), 
            "UniSphere Account Verification (Resend)", 
            "Your new verification code is: " + otp
        );

        return new AuthResponse(true, "OTP resent to email", null);
    }

    public ResponseEntity<?> refresh(String refreshToken, HttpServletResponse response) {
        try {
            String email = jwtTokenProvider.extractUsername(refreshToken);
            User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

            if (jwtTokenProvider.isTokenValid(refreshToken, user) && refreshToken.equals(user.getRefreshToken())) {
                String newAccessToken = jwtTokenProvider.generateToken(
                    new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities())
                );
                
                Map<String, Object> extraClaims = new HashMap<>();
                extraClaims.put("type", "refresh");
                String newRefreshToken = jwtTokenProvider.generateToken(extraClaims, user);

                user.setRefreshToken(newRefreshToken);
                userRepository.save(user);

                setCookie(response, "ACCESS", newAccessToken, 15 * 60);
                setCookie(response, "accessToken", newAccessToken, 15 * 60);
                setCookie(response, "REFRESH", newRefreshToken, 7 * 24 * 60 * 60);

                return ResponseEntity.ok(Map.of("success", true));
            } else {
                return ResponseEntity.status(403).body(Map.of("message", "Invalid refresh token"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(403).body(Map.of("message", "Invalid refresh token"));
        }
    }

    public void logout(HttpServletResponse response) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            Optional<User> userOpt = userRepository.findByEmail(auth.getName());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                user.setRefreshToken(null);
                userRepository.save(user);
            }
        }
        
        // Clear cookies
        setCookie(response, "ACCESS", "", 0);
        setCookie(response, "accessToken", "", 0);
        setCookie(response, "REFRESH", "", 0);
        setCookie(response, "userEmail", "", 0);
    }

    public boolean isPhoneAvailable(String phone) {
        if (phone == null || phone.isBlank()) return true;
        // Simplified check, add to Repo if required
        return userRepository.findAll().stream().noneMatch(u -> phone.equals(u.getPhone()));
    }

    public Map<String, Object> getCurrentUserContext() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Authentication is required");
        }

        User user = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new AccessDeniedException("Authenticated user not found"));

        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", user.getId());
        userMap.put("email", user.getEmail());
        userMap.put("role", user.getRole().name());
        userMap.put("fullName", user.getFullName());

        return Map.of(
            "user", userMap,
            "authenticated", true
        );
    }

    public Map<String, String> processOAuthLogin(String email, String fullName,
                                                   String provider, String providerId) {
        // Enforce SLIIT student email validation for Google login
        if (email == null || !email.matches("^it[0-9]{8}@my\\.sliit\\.lk$")) {
            throw new BadRequestException("Only SLIIT student emails (it********@my.sliit.lk) are allowed.");
        }

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = User.builder()
                    .fullName(fullName)
                    .email(email)
                    .role(Role.USER)
                    .isVerified(true) // OAuth users are pre-verified
                    .enabled(true)
                    .oauthProvider(provider)
                    .oauthProviderId(providerId)
                    .build();
            return userRepository.save(newUser);
        });

        String token = jwtTokenProvider.generateToken(
                Map.of("role", user.getRole().name()),
                user
        );

        return Map.of("token", token, "email", email, "role", user.getRole().name());
    }

    private void setCookie(HttpServletResponse response, String name, String value, int maxAge) {
        Cookie cookie = new Cookie(name, value);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(maxAge);
        response.addCookie(cookie);
    }
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }
}
