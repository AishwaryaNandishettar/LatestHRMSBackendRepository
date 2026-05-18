package com.omoikaneinnovation.hmrsbackend.security;

import org.springframework.lang.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    public WebSocketAuthInterceptor(JwtUtil jwtUtil,
                                    UserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    public Message<?> preSend(
            @NonNull Message<?> message,
            @NonNull MessageChannel channel
    ) {

        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {

          String authHeader = accessor.getFirstNativeHeader("Authorization");

// ✅ Fallback for SockJS (VERY IMPORTANT)
if (authHeader == null) {
    List<String> tokenList = accessor.getNativeHeader("token");
    if (tokenList != null && !tokenList.isEmpty()) {
        authHeader = "Bearer " + tokenList.get(0);
    }
}
            
            System.out.println("🔐 WebSocket CONNECT - Auth header: " + (authHeader != null ? "Present" : "Missing"));

            if (authHeader != null && authHeader.startsWith("Bearer ")) {

                String token = authHeader.substring(7);
                
                try {
                    String email = jwtUtil.extractUsername(token);
                    String role = jwtUtil.extractRole(token);
                    
                    System.out.println("🔐 WebSocket Auth - Email: " + email + ", Role: " + role);

                    UserDetails userDetails =
                            userDetailsService.loadUserByUsername(email);

                    if (jwtUtil.validateToken(token, userDetails)) {

                        System.out.println("✅ WebSocket Auth SUCCESS - Setting user principal: " + email);

                        // ✅ CRITICAL: Use email as principal for user-specific subscriptions
                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(
                                        email.trim().toLowerCase(), // Normalize email for consistency
                                        null,
                                        List.of(
                                                new SimpleGrantedAuthority("ROLE_" + role)
                                        )
                                );

                        accessor.setUser(authentication);
                    } else {
                        System.out.println("❌ WebSocket Auth FAILED - Invalid token");
                        // Don't throw exception, just log and continue without authentication
                    }
                } catch (io.jsonwebtoken.ExpiredJwtException e) {
                    System.out.println("❌ WebSocket Auth FAILED - Token expired: " + e.getMessage());
                    // Don't throw exception, just log and continue without authentication
                } catch (Exception e) {
                    System.out.println("❌ WebSocket Auth FAILED - Token error: " + e.getMessage());
                    // Don't throw exception, just log and continue without authentication
                }
            } else {
                System.out.println("❌ WebSocket Auth FAILED - No Bearer token");
            }
        }

        return message;
    }
}