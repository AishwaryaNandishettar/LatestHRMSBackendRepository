package com.omoikaneinnovation.hmrsbackend.controller;

import com.omoikaneinnovation.hmrsbackend.dto.LoginRequest;
import com.omoikaneinnovation.hmrsbackend.dto.LoginResponse;
import com.omoikaneinnovation.hmrsbackend.model.User;
import com.omoikaneinnovation.hmrsbackend.model.Employee;
import com.omoikaneinnovation.hmrsbackend.security.JwtUtil;
import com.omoikaneinnovation.hmrsbackend.service.AuthService;
import com.omoikaneinnovation.hmrsbackend.service.EmailService;
import com.omoikaneinnovation.hmrsbackend.repository.EmployeeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.omoikaneinnovation.hmrsbackend.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import com.omoikaneinnovation.hmrsbackend.dto.ChangePasswordRequest;
import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5176", "http://127.0.0.1:5173", "http://127.0.0.1:5176", "https://hrmsbackendfullrenderingapplication.vercel.app", "https://hrmsbackendfrontendapp.vercel.app", "https://hrmsbackendapplication.vercel.app"})
@RestController
@RequestMapping("/api/auth")

public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;
    private final EmployeeRepository employeeRepository;
    private final UserRepository repo;
    private final BCryptPasswordEncoder encoder;
    private final EmailService emailService; // ✅ ADD THIS

    public AuthController(AuthService authService, JwtUtil jwtUtil, EmployeeRepository employeeRepository, 
                          UserRepository repo, BCryptPasswordEncoder encoder, EmailService emailService) {
        this.authService = authService;
        this.jwtUtil = jwtUtil;
        this.employeeRepository = employeeRepository;
        this.repo = repo;
        this.encoder = encoder;
        this.emailService = emailService; // ✅ ADD THIS
    }

    // REGISTER USER
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {

        User savedUser = authService.register(user);

        return ResponseEntity.ok(savedUser);
    }

    // LOGIN USER
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
  // 🔥 ADD THIS HERE
    System.out.println("EMAIL: " + request.getEmail());
    System.out.println("PASSWORD INPUT: " + request.getPassword());
        // Debug log
        System.out.println("Login attempt for email: " + request.getEmail());

        User user = authService.authenticate(
                request.getEmail(),
                request.getPassword()
        );
        System.out.println("USER FOUND: " + (user != null));

        if (user == null) {
            System.out.println("Login failed for email: " + request.getEmail());
            return ResponseEntity.status(401).body("Invalid credentials");
        }

        System.out.println("Login successful for: " + user.getEmail());

       String role = user.getRole() != null ? user.getRole() : "EMPLOYEE";

String token = jwtUtil.generateToken(
        user.getEmail(),
        role
);

        // ✅ FETCH EMPLOYEE DATA
        Employee emp = employeeRepository.findByEmail(user.getEmail()).orElse(null);

        LoginResponse res = new LoginResponse();
        res.id = user.getId();  // ✅ ADD MongoDB _id
        // ✅ Use Employee fullName if available, otherwise User name
        res.name = emp != null ? emp.getFullName() : user.getName();
        res.email = user.getEmail();
        res.role = role;
        res.token = token;
        res.companyId = user.getCompanyId(); // ✅ Company ID
        res.department = user.getDepartment(); // ✅ Department
        res.managerEmail = user.getManagerEmail(); // ✅ Manager Email
        // ✅ SET EMPLOYEE ID
        res.empId = emp != null ? emp.getEmployeeId() : user.getEmployeeId();
        res.employeeId = emp != null ? emp.getEmployeeId() : user.getEmployeeId();

        System.out.println("🔥 LOGIN RESPONSE: id=" + res.id + ", empId=" + res.empId + ", name=" + res.name);

        return ResponseEntity.ok(res);
    }

    // REFRESH TOKEN
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestHeader("Authorization") String authHeader) {
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Invalid authorization header");
        }

        String token = authHeader.substring(7);
        
        try {
            // Even if token is expired, we can still extract the email if it's not too old
            String email = jwtUtil.extractEmail(token);
            String role = jwtUtil.extractRole(token);
            
            // Generate a new token
            String newToken = jwtUtil.generateToken(email, role);
            
            LoginResponse res = new LoginResponse();
            res.email = email;
            res.role = role;
            res.token = newToken;
            
            return ResponseEntity.ok(res);
            
        } catch (Exception e) {
            System.out.println("Token refresh failed: " + e.getMessage());
            return ResponseEntity.status(401).body("Token refresh failed. Please login again.");
        }

        
    }

    @PostMapping("/change-password")
public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest req) {

    authService.changePassword(req.getEmail(), req.getOldPassword(), req.getNewPassword());

    return ResponseEntity.ok("Password changed successfully");
}
@PostMapping("/fix-password")
public String fixPassword() {

    User user = repo.findByEmail("Aishmanager@omoi.com").get();

    user.setPassword(encoder.encode("admin123"));
    repo.save(user);

    return "Password reset to admin123";
}

// ✅ FORGOT PASSWORD - Send OTP
@PostMapping("/forgot-password")
public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
    try {
        String email = request.get("email");
        
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body("Email is required");
        }

        // Check if user exists
        User user = repo.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("Email not found");
        }

        // Generate OTP (4-digit)
        String otp = String.format("%04d", (int)(Math.random() * 10000));
        
        System.out.println("========================================");
        System.out.println("✅ FORGOT PASSWORD REQUEST");
        System.out.println("  Email: " + email);
        System.out.println("  Generated OTP: [" + otp + "]");
        System.out.println("  OTP length: " + otp.length());
        
        // ✅ Store OTP separately (not as password)
        String hashedOtp = encoder.encode(otp);
        user.setResetOtp(hashedOtp);
        long expiryTime = System.currentTimeMillis() + (10 * 60 * 1000); // 10 minutes
        user.setOtpExpiryTime(expiryTime);
        repo.save(user);

        System.out.println("  Hashed OTP stored: " + hashedOtp.substring(0, 20) + "...");
        System.out.println("  Expiry time: " + expiryTime);
        System.out.println("  User saved successfully");
        System.out.println("========================================");

        // ✅ Send OTP via email
        try {
            emailService.sendOtp(email, otp);
            System.out.println("✅ OTP email sent successfully to: " + email);
        } catch (Exception e) {
            System.err.println("❌ Failed to send OTP email: " + e.getMessage());
            e.printStackTrace();
            // Continue even if email fails - for testing
        }

        // Return success message (don't include OTP in production)
        Map<String, String> response = new HashMap<>();
        response.put("message", "OTP sent to " + email);
        
        return ResponseEntity.ok(response);
        
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(500).body("Error sending OTP: " + e.getMessage());
    }
}

// ✅ RESET PASSWORD with OTP
@PostMapping("/reset-password")
public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
    try {
        String email = request.get("email");
        String otp = request.get("otp");
        String newPassword = request.get("newPassword");
        
        System.out.println("🔍 Reset password request:");
        System.out.println("  Email: " + email);
        System.out.println("  OTP received: [" + otp + "]");
        System.out.println("  OTP length: " + (otp != null ? otp.length() : 0));
        
        if (email == null || otp == null || newPassword == null) {
            return ResponseEntity.badRequest().body("Email, OTP, and new password are required");
        }

        // ✅ Trim whitespace from OTP
        otp = otp.trim();
        System.out.println("  OTP after trim: [" + otp + "]");

        // Find user
        User user = repo.findByEmail(email).orElse(null);
        if (user == null) {
            System.out.println("❌ User not found");
            return ResponseEntity.badRequest().body("User not found");
        }

        System.out.println("  User found: " + user.getEmail());
        System.out.println("  User resetOtp exists: " + (user.getResetOtp() != null));
        System.out.println("  User otpExpiryTime: " + user.getOtpExpiryTime());

        // ✅ Check if OTP exists
        if (user.getResetOtp() == null || user.getResetOtp().isEmpty()) {
            System.out.println("❌ No OTP found for user");
            return ResponseEntity.badRequest().body("No OTP found. Please request a new OTP.");
        }

        // ✅ Check OTP expiry
        if (user.getOtpExpiryTime() == null) {
            System.out.println("❌ No OTP expiry time set");
            return ResponseEntity.badRequest().body("Invalid OTP state. Please request a new OTP.");
        }

        long currentTime = System.currentTimeMillis();
        System.out.println("  Current time: " + currentTime);
        System.out.println("  Expiry time: " + user.getOtpExpiryTime());
        System.out.println("  Time remaining: " + ((user.getOtpExpiryTime() - currentTime) / 1000) + " seconds");

        if (currentTime > user.getOtpExpiryTime()) {
            System.out.println("❌ OTP expired");
            user.setResetOtp(null);
            user.setOtpExpiryTime(null);
            repo.save(user);
            return ResponseEntity.badRequest().body("OTP expired. Please request a new OTP.");
        }

        // ✅ Verify OTP
        System.out.println("  Verifying OTP...");
        boolean otpMatches = encoder.matches(otp, user.getResetOtp());
        System.out.println("  OTP Match: " + otpMatches);
        
        if (!otpMatches) {
            System.out.println("❌ Invalid OTP - OTP does not match");
            return ResponseEntity.badRequest().body("Invalid OTP");
        }

        // ✅ Set new password
        System.out.println("  Setting new password...");
        user.setPassword(encoder.encode(newPassword));
        
        // ✅ Clear OTP fields
        user.setResetOtp(null);
        user.setOtpExpiryTime(null);
        
        repo.save(user);

        System.out.println("✅ Password reset successfully for: " + email);
        return ResponseEntity.ok("Password reset successfully");
        
    } catch (Exception e) {
        System.err.println("❌ Error resetting password: " + e.getMessage());
        e.printStackTrace();
        return ResponseEntity.status(500).body("Error resetting password: " + e.getMessage());
    }
}

}