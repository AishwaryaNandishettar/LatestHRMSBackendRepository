package com.omoikaneinnovation.hmrsbackend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private static final String SECRET =
            "hmrs-super-secret-key-which-must-be-at-least-32-characters";

        // Default expiry (6 months)
    private static final long EXPIRATION_MS = 180L * 24 * 60 * 60 * 1000; // ~180 days
   // private final String SECRET_KEY = "mysecretkey123";
    private final Key key = Keys.hmacShaKeyFor(SECRET.getBytes());


  

    // ===============================
    // Generate Token (default expiry)
    // ===============================
    public String generateToken(String email, String role) {

        return Jwts.builder()
                .setSubject(email)
                .claim("role", role.toUpperCase())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_MS))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }
    public String extractEmail(String token) {
    return extractAllClaims(token).getSubject();
}

private Claims extractAllClaims(String token) {
    return Jwts.parserBuilder()
            .setSigningKey(key) // ✅ SAME KEY USED FOR SIGNING
            .build()
            .parseClaimsJws(token)
            .getBody();
}

    // ======================================
    // Generate Token with Custom Expiry
    // ======================================
    public String generateToken(String email, String role, long customExpiryMillis) {

        return Jwts.builder()
                .setSubject(email)
                .claim("role", role.toUpperCase())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + customExpiryMillis))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // ======================================
    // Backward compatibility
    // ======================================
    public String generateToken(String email) {
        return generateToken(email, "EMPLOYEE");
    }

    // ======================================
    // Extract Email from Token
    // ======================================
    public String extractUsername(String token) {
        return getClaims(token).getSubject();
    }

    // ======================================
    // Extract Role from Token
    // ======================================
    public String extractRole(String token) {
        return getClaims(token).get("role", String.class);
    }

    // ======================================
    // Validate Token
    // ======================================
    public boolean validateToken(String token, UserDetails userDetails) {

        try {

            String username = extractUsername(token);

            return username.equals(userDetails.getUsername())
                    && !isTokenExpired(token);

        } catch (Exception e) {

            return false;
        }
    }

    // ======================================
    // Check Token Expiry
    // ======================================
    private boolean isTokenExpired(String token) {
        return getClaims(token).getExpiration().before(new Date());
    }

    // ======================================
    // Get All Claims
    // ======================================
    public Claims getClaims(String token) {

        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // ======================================
    // Validate Token (Simple Check)
    // ======================================
    public boolean isValid(String token) {

        try {

            getClaims(token);

            return true;

        } catch (JwtException | IllegalArgumentException e) {

            return false;
        }
    }
}