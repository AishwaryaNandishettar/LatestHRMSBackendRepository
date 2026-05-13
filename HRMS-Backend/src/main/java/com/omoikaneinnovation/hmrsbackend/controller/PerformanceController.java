package com.omoikaneinnovation.hmrsbackend.controller;

import com.omoikaneinnovation.hmrsbackend.model.Employee;
import com.omoikaneinnovation.hmrsbackend.model.Performance;
import com.omoikaneinnovation.hmrsbackend.model.User;
import com.omoikaneinnovation.hmrsbackend.repository.EmployeeRepository;
import com.omoikaneinnovation.hmrsbackend.repository.UserRepository;
import com.omoikaneinnovation.hmrsbackend.service.PerformanceService;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/performance")
@CrossOrigin(originPatterns = {"http://localhost:*", "http://127.0.0.1:*", "https://*.vercel.app", "https://*.ngrok-free.dev"})
public class PerformanceController {

    private final PerformanceService service;
    private final UserRepository userRepo;
    private final EmployeeRepository employeeRepo;

    public PerformanceController(PerformanceService service, UserRepository userRepo, EmployeeRepository employeeRepo) {
        this.service = service;
        this.userRepo = userRepo;
        this.employeeRepo = employeeRepo;
    }

    /** GET all performance records (admin sees all, manager sees only team) */
    @GetMapping
    public ResponseEntity<List<Performance>> getAll(Authentication auth) {
        String userEmail = auth != null ? auth.getName() : "";
        boolean isAdmin = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        
        if (isAdmin) {
            return ResponseEntity.ok(service.getAll());
        } else {
            // Manager: only see team members' performance
            return ResponseEntity.ok(service.getPerformanceByManager(userEmail));
        }
    }

    /**
     * GET /my-team — Returns the manager's team members as Employee-like objects.
     * Uses the User collection (which has managerEmail set) to find team members,
     * then enriches with Employee data (employeeId, designation, department).
     */
    @GetMapping("/my-team")
    public ResponseEntity<List<Map<String, Object>>> getMyTeam(Authentication auth) {
        if (auth == null) return ResponseEntity.ok(Collections.emptyList());

        String managerEmail = auth.getName();

        // Get team members from User collection (managerEmail is reliably set here)
        List<User> teamUsers = userRepo.findByManagerEmail(managerEmail);

        List<Map<String, Object>> result = new ArrayList<>();
        for (User u : teamUsers) {
            Map<String, Object> member = new HashMap<>();
            member.put("email", u.getEmail());
            member.put("fullName", u.getName() != null ? u.getName() : u.getEmail());

            // Try to enrich with Employee record (for employeeId, department, designation)
            Optional<Employee> empOpt = employeeRepo.findByEmail(u.getEmail());
            if (empOpt.isPresent()) {
                Employee emp = empOpt.get();
                member.put("employeeId", emp.getEmployeeId() != null ? emp.getEmployeeId() : u.getEmployeeId());
                member.put("department", emp.getDepartment() != null ? emp.getDepartment() : u.getDepartment());
                member.put("designation", emp.getDesignation() != null ? emp.getDesignation() : u.getDesignation());
                member.put("status", emp.getStatus() != null ? emp.getStatus() : "ACTIVE");
            } else {
                // Fall back to User fields
                member.put("employeeId", u.getEmployeeId() != null ? u.getEmployeeId() : "");
                member.put("department", u.getDepartment() != null ? u.getDepartment() : "");
                member.put("designation", u.getDesignation() != null ? u.getDesignation() : "");
                member.put("status", "ACTIVE");
            }
            result.add(member);
        }

        return ResponseEntity.ok(result);
    }

    /**
     * GET /my-employee-id — Returns the logged-in employee's employeeId.
     * Looks up from Employee collection by email, falls back to User.employeeId.
     */
    @GetMapping("/my-employee-id")
    public ResponseEntity<Map<String, String>> getMyEmployeeId(Authentication auth) {
        if (auth == null) return ResponseEntity.ok(Map.of("employeeId", ""));

        String email = auth.getName();
        Map<String, String> result = new HashMap<>();

        // Try Employee collection first
        Optional<Employee> empOpt = employeeRepo.findByEmail(email);
        if (empOpt.isPresent() && empOpt.get().getEmployeeId() != null) {
            result.put("employeeId", empOpt.get().getEmployeeId());
            return ResponseEntity.ok(result);
        }

        // Fall back to User collection
        Optional<User> userOpt = userRepo.findByEmail(email);
        if (userOpt.isPresent() && userOpt.get().getEmployeeId() != null) {
            result.put("employeeId", userOpt.get().getEmployeeId());
            return ResponseEntity.ok(result);
        }

        result.put("employeeId", "");
        return ResponseEntity.ok(result);
    }

    /** GET performance for a specific employee */
    @GetMapping("/{employeeId}")
    public ResponseEntity<?> getPerformance(@PathVariable String employeeId) {
        Performance p = service.getByEmployeeId(employeeId);
        if (p == null) return ResponseEntity.ok(null);
        return ResponseEntity.ok(p);
    }

    /** POST / upsert a performance record */
    @PostMapping
    public ResponseEntity<Performance> save(@RequestBody Performance performance) {
        return ResponseEntity.ok(service.save(performance));
    }

    /** POST /seed - Create sample performance data scoped to the caller's role */
    @PostMapping("/seed")
    public ResponseEntity<String> seedSampleData(Authentication auth) {
        String callerEmail = auth != null ? auth.getName() : "";
        // Determine role from DB for reliability
        String callerRole = "ADMIN";
        Optional<User> callerOpt = userRepo.findByEmail(callerEmail);
        if (callerOpt.isPresent()) {
            String role = callerOpt.get().getRole();
            if (role != null) callerRole = role.toUpperCase();
        }
        String result = service.seedSampleData(callerEmail, callerRole);
        return ResponseEntity.ok(result);
    }

    /** GET /debug - Debug employee data */
    @GetMapping("/debug")
    public ResponseEntity<String> debugEmployeeData() {
        String result = service.debugEmployeeData();
        return ResponseEntity.ok(result);
    }
}