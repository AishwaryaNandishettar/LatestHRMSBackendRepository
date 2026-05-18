package com.omoikaneinnovation.hmrsbackend.controller;

import com.omoikaneinnovation.hmrsbackend.dto.HomeResponse;
import com.omoikaneinnovation.hmrsbackend.model.User;
import com.omoikaneinnovation.hmrsbackend.repository.UserRepository;
import com.omoikaneinnovation.hmrsbackend.service.HomeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;
import java.util.List;
@RestController
@RequestMapping("/api/home")
@CrossOrigin(originPatterns = {"http://localhost:*", "http://127.0.0.1:*", "https://*.vercel.app", "https://*.ngrok-free.dev"})
public class HomeController {

    private final UserRepository userRepo;
    private final HomeService homeService;

    public HomeController(
            UserRepository userRepo,
            HomeService homeService
    ) {
        this.userRepo = userRepo;
        this.homeService = homeService;
    }

  @GetMapping("/me")
public ResponseEntity<HomeResponse> getMyHome(@RequestParam String email) {
    
    System.out.println("🔍 HomeController: Received request for email: " + email);
    
    try {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        System.out.println("🔍 HomeController: Found user: " + user.getEmail() + ", Role: " + user.getRole());
        
        String role = user.getRole();
        
        HomeResponse response = homeService.buildEmployeeHome(user, role);
        
        System.out.println("🔍 HomeController: Built response with stats: " + 
            (response.getStats() != null ? "Present" : "Null"));
        
        return ResponseEntity.ok(response);
        
    } catch (Exception e) {
        System.err.println("❌ HomeController Error: " + e.getMessage());
        e.printStackTrace();
        throw e;
    }
}
@GetMapping
public ResponseEntity<HomeResponse> getHome(@RequestParam String email) {

    System.out.println("🔍 Dashboard API called for: " + email);

    try {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String role = user.getRole();

        // 🔥 MAIN LINE (IMPORTANT)
        HomeResponse response = homeService.buildEmployeeHome(user, role);

        return ResponseEntity.ok(response);

    } catch (Exception e) {
        System.err.println("❌ Dashboard error: " + e.getMessage());
        throw e;
    }
}
}
