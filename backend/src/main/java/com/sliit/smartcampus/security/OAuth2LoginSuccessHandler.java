package com.sliit.smartcampus.security;

import com.sliit.smartcampus.service.member4.AuthService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import jakarta.servlet.http.Cookie;

import java.io.IOException;
import java.util.Map;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final AuthService authService;

    public OAuth2LoginSuccessHandler(AuthService authService) {
        this.authService = authService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                         Authentication authentication) throws IOException, ServletException {
        
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String providerId = oAuth2User.getAttribute("sub"); // Google subject ID
        
        try {
            Map<String, String> tokenData = authService.processOAuthLogin(email, name, "google", providerId);
            String token = tokenData.get("token");
            
            // Set cookies for frontend
            setCookie(response, "ACCESS", token, 15 * 60);
            setCookie(response, "accessToken", token, 15 * 60);
            setCookie(response, "userEmail", email, 7 * 24 * 60 * 60);

            // Redirect to frontend with the token
            String targetUrl = "http://localhost:5173/oauth2/redirect?token=" + token;
            getRedirectStrategy().sendRedirect(request, response, targetUrl);
        } catch (Exception e) {
            // Redirect to login with error message
            String targetUrl = "http://localhost:5173/login?oauthError=" + java.net.URLEncoder.encode(e.getMessage(), "UTF-8");
            getRedirectStrategy().sendRedirect(request, response, targetUrl);
        }
    }

    private void setCookie(HttpServletResponse response, String name, String value, int maxAge) {
        Cookie cookie = new Cookie(name, value);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(maxAge);
        response.addCookie(cookie);
    }
}
