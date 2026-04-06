package com.sliit.smartcampus.service.member4;

import org.springframework.context.annotation.Lazy;
import com.sliit.smartcampus.exception.BadRequestException;
import com.sliit.smartcampus.model.member4.User;
import com.sliit.smartcampus.model.member4.User.Role;
import com.sliit.smartcampus.repository.member4.UserRepository;
import com.sliit.smartcampus.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class AuthService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider,
                       @Lazy AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.authenticationManager = authenticationManager;
    }

    /**
     * Register a new user with email/password
     */
    public Map<String, String> register(String fullName, String email, String password) {
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email already registered");
        }

        User user = User.builder()
                .fullName(fullName)
                .email(email)
                .password(passwordEncoder.encode(password))
                .role(Role.USER)
                .enabled(true)
                .build();

        userRepository.save(user);

        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
        );

        String token = jwtTokenProvider.generateToken(auth);
        return Map.of("token", token, "email", email, "role", user.getRole().name());
    }

    /**
     * Login with email/password
     */
    public Map<String, String> login(String email, String password) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
        );

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        String token = jwtTokenProvider.generateToken(auth);
        return Map.of("token", token, "email", email, "role", user.getRole().name());
    }

    /**
     * Process OAuth2 login/registration
     */
    public Map<String, String> processOAuthLogin(String email, String fullName,
                                                   String provider, String providerId) {
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = User.builder()
                    .fullName(fullName)
                    .email(email)
                    .role(Role.USER)
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

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }
}
