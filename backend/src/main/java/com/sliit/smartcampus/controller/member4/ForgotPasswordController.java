package com.sliit.smartcampus.controller.member4;

import com.sliit.smartcampus.service.member4.AuthService;
import com.sliit.smartcampus.model.member4.User;
import com.sliit.smartcampus.model.member4.ForgotPassword;
import com.sliit.smartcampus.repository.member4.UserRepository;
import com.sliit.smartcampus.repository.member4.ForgotPasswordRepository;
import com.sliit.smartcampus.service.member4.EmailService;
import com.sliit.smartcampus.security.JwtTokenProvider;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@RestController
@RequestMapping("/forgotpass")
@RequiredArgsConstructor
public class ForgotPasswordController {

    private final UserRepository userRepository;
    private final ForgotPasswordRepository forgotRepo;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/send-otp")
    public ResponseEntity<Map<String, Object>> sendOtp(@RequestBody Map<String, String> request, HttpServletResponse response) {
        String email = request.get("email");
        User user = userRepository.findByEmail(email).orElse(null);
        
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "User not found with this email"));
        }

        ForgotPassword fp = forgotRepo.findByUser(user).orElse(new ForgotPassword());
        int otp = new Random().nextInt(900000) + 100000;

        fp.setUser(user);
        fp.setOtp(otp);
        fp.setExpirationTime(LocalDateTime.now().plusMinutes(5));
        fp.setResendCount(0);
        fp.setLastSentAt(LocalDateTime.now());

        forgotRepo.save(fp);

        emailService.sendEmail(email, "Reset Password OTP", "Your password reset OTP is: " + otp);
        
        setCookie(response, "forgotEmail", email, 10 * 60);

        return ResponseEntity.ok(Map.of("success", true, "message", "OTP sent successfully"));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<Map<String, Object>> resendOtp(HttpServletRequest request) {
        String email = getCookie(request, "forgotEmail");
        if (email == null) return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email not found in session"));

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body(Map.of("success", false, "message", "User not found"));

        ForgotPassword fp = forgotRepo.findByUser(user).orElseThrow(() -> new RuntimeException("OTP not requested"));

        if (fp.getResendCount() >= 3) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Max resend limit reached"));
        }

        int otp = new Random().nextInt(900000) + 100000;
        fp.setOtp(otp);
        fp.setExpirationTime(LocalDateTime.now().plusMinutes(5));
        fp.setResendCount(fp.getResendCount() + 1);
        fp.setLastSentAt(LocalDateTime.now());

        forgotRepo.save(fp);

        emailService.sendEmail(email, "Resend OTP", "Your new password reset OTP is: " + otp);

        return ResponseEntity.ok(Map.of("success", true, "message", "OTP resent successfully"));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, Object>> verifyOtp(@RequestBody Map<String, String> request, HttpServletRequest httpRequest, HttpServletResponse response) {
        String email = getCookie(httpRequest, "forgotEmail");
        if (email == null) return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email not found in session"));

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body(Map.of("success", false, "message", "User not found"));

        ForgotPassword fp = forgotRepo.findByUser(user).orElse(null);
        if (fp == null) return ResponseEntity.badRequest().body(Map.of("success", false, "message", "No OTP request found"));

        String otpStr = request.get("otp");
        if (otpStr == null || !otpStr.equals(String.valueOf(fp.getOtp()))) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid OTP"));
        }

        if (fp.getExpirationTime().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "OTP expired"));
        }

        // Generate a temporary verify token or just use the cookie state
        setCookie(response, "forgotVerified", "true", 5 * 60);

        return ResponseEntity.ok(Map.of("success", true, "message", "OTP verified successfully"));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(@RequestBody Map<String, String> request, HttpServletRequest httpRequest, HttpServletResponse response) {
        String email = getCookie(httpRequest, "forgotEmail");
        String verified = getCookie(httpRequest, "forgotVerified");

        if (email == null || !"true".equals(verified)) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Unauthorized. Please verify OTP first."));
        }

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body(Map.of("success", false, "message", "User not found"));

        String password = request.get("password");
        String repeatPassword = request.get("repeatPassword");

        if (password == null || !password.equals(repeatPassword)) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Passwords do not match"));
        }

        user.setPassword(passwordEncoder.encode(password));
        userRepository.save(user);

        forgotRepo.findByUser(user).ifPresent(forgotRepo::delete);
        
        // Clear cookies
        setCookie(response, "forgotEmail", "", 0);
        setCookie(response, "forgotVerified", "", 0);

        return ResponseEntity.ok(Map.of("success", true, "message", "Password changed successfully"));
    }

    private void setCookie(HttpServletResponse response, String name, String value, int maxAge) {
        Cookie cookie = new Cookie(name, value);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(maxAge);
        response.addCookie(cookie);
    }

    private String getCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return null;
        for (Cookie c : request.getCookies()) {
            if (name.equals(c.getName())) return c.getValue();
        }
        return null;
    }
}
