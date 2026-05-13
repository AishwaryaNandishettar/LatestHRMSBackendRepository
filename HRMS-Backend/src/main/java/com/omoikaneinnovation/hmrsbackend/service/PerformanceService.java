package com.omoikaneinnovation.hmrsbackend.service;

import com.omoikaneinnovation.hmrsbackend.model.*;
import com.omoikaneinnovation.hmrsbackend.repository.EmployeeRepository;
import com.omoikaneinnovation.hmrsbackend.repository.PerformanceRepository;
import com.omoikaneinnovation.hmrsbackend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PerformanceService {

    private final PerformanceRepository repo;
    private final EmployeeRepository employeeRepo;
    private final UserRepository userRepo;

    public PerformanceService(PerformanceRepository repo, EmployeeRepository employeeRepo, UserRepository userRepo) {
        this.repo = repo;
        this.employeeRepo = employeeRepo;
        this.userRepo = userRepo;
    }

    public Performance getByEmployeeId(String empId) {
        return repo.findByEmployeeId(empId).orElse(null);
    }

    public List<Performance> getAll() {
        return repo.findAll();
    }

    // ── GET PERFORMANCE BY MANAGER (only team members) ──
    public List<Performance> getPerformanceByManager(String managerEmail) {
        // Get all team members under this manager
        List<User> team = userRepo.findByManagerEmail(managerEmail);
        
        // Extract their employee IDs
        List<String> teamEmpIds = team.stream()
                .map(User::getEmployeeId)
                .filter(id -> id != null && !id.isBlank())
                .collect(Collectors.toList());
        
        // Get performance records for team members
        return repo.findByEmployeeIdIn(teamEmpIds);
    }

    public Performance save(Performance performance) {
        // upsert: if record exists for this employeeId, update it
        repo.findByEmployeeId(performance.getEmployeeId())
            .ifPresent(existing -> performance.setId(existing.getId()));
        return repo.save(performance);
    }

    /**
     * Seed sample performance data — scoped to the logged-in user's context:
     * - Manager: seeds only their direct team members
     * - Admin/HR: seeds first 3 active employees
     * - Employee: seeds only their own record
     */
    public String seedSampleData(String callerEmail, String callerRole) {
        try {
            System.out.println("=== SEED DATA CALLED ===");
            System.out.println("Caller Email: " + callerEmail);
            System.out.println("Caller Role: " + callerRole);
            
            List<Employee> candidates;

            if ("MANAGER".equalsIgnoreCase(callerRole)) {
                // Manager: seed only their direct reports (from User collection)
                System.out.println("Manager role detected - finding team members...");
                List<User> team = userRepo.findByManagerEmail(callerEmail);
                System.out.println("Found " + team.size() + " team members in User collection");
                
                candidates = new java.util.ArrayList<>();
                for (User u : team) {
                    System.out.println("  Team member: " + u.getEmail() + " (employeeId: " + u.getEmployeeId() + ")");
                    
                    // Try to find Employee record by email
                    Optional<Employee> empByEmail = employeeRepo.findByEmail(u.getEmail());
                    if (empByEmail.isPresent()) {
                        System.out.println("    Found in Employee collection");
                        candidates.add(empByEmail.get());
                    } else if (u.getEmployeeId() != null && !u.getEmployeeId().isBlank()) {
                        // Fall back: create a minimal Employee-like record from User data
                        System.out.println("    Not in Employee collection, using User data");
                        Employee synth = new Employee();
                        synth.setEmployeeId(u.getEmployeeId());
                        synth.setFullName(u.getName() != null ? u.getName() : u.getEmail());
                        synth.setEmail(u.getEmail());
                        candidates.add(synth);
                    } else {
                        System.out.println("    Skipping - no employeeId in User record");
                    }
                }
                System.out.println("Manager " + callerEmail + " seeding for " + candidates.size() + " team members");
            } else if ("EMPLOYEE".equalsIgnoreCase(callerRole)) {
                // Employee: seed only their own record
                System.out.println("Employee role detected - finding own record...");
                candidates = new java.util.ArrayList<>();
                Optional<Employee> empByEmail = employeeRepo.findByEmail(callerEmail);
                if (empByEmail.isPresent()) {
                    System.out.println("Found employee in Employee collection");
                    candidates.add(empByEmail.get());
                } else {
                    // Fall back to User record
                    System.out.println("Not found in Employee collection, checking User collection...");
                    Optional<User> userOpt = userRepo.findByEmail(callerEmail);
                    if (userOpt.isPresent() && userOpt.get().getEmployeeId() != null) {
                        System.out.println("Found in User collection with employeeId: " + userOpt.get().getEmployeeId());
                        Employee synth = new Employee();
                        synth.setEmployeeId(userOpt.get().getEmployeeId());
                        synth.setFullName(userOpt.get().getName() != null ? userOpt.get().getName() : callerEmail);
                        synth.setEmail(callerEmail);
                        candidates.add(synth);
                    } else {
                        System.out.println("Not found in User collection or no employeeId");
                    }
                }
            } else {
                // Admin/HR: seed first 3 active employees
                System.out.println("Admin/HR role detected - finding active employees...");
                candidates = employeeRepo.findAll().stream()
                        .filter(e -> "ACTIVE".equalsIgnoreCase(e.getStatus()))
                        .limit(3)
                        .collect(Collectors.toList());
                System.out.println("Found " + candidates.size() + " active employees");
            }

            System.out.println("Total candidates for seeding: " + candidates.size());

            if (candidates.isEmpty()) {
                String msg = "No matching employees found to seed performance data for " + callerEmail;
                System.out.println(msg);
                return msg;
            }

            int seeded = 0;
            StringBuilder details = new StringBuilder();
            for (Employee emp : candidates) {
                String empId = emp.getEmployeeId();
                String empName = emp.getFullName();
                System.out.println("Processing employee: " + empName + " with ID: " + empId);

                if (empId == null || empId.isBlank()) {
                    System.out.println("  ❌ Skipping - no employeeId");
                    continue;
                }

                // Check if performance record already exists
                Optional<Performance> existing = repo.findByEmployeeId(empId);
                if (existing.isPresent()) {
                    System.out.println("  ⚠️ Performance record already exists for " + empId);
                    continue;
                }

                Performance perf = createSamplePerformance(empId, empName);
                Performance saved = repo.save(perf);
                seeded++;
                System.out.println("  ✅ Created performance record with ID: " + saved.getId());
                details.append(empName).append(" (").append(empId).append("), ");
            }

            String result = "Seeded performance data for " + seeded + " employee(s): " + 
                           (details.length() > 0 ? details.substring(0, details.length() - 2) : "none");
            System.out.println("=== SEEDING COMPLETE ===");
            System.out.println(result);
            return result;

        } catch (Exception e) {
            System.err.println("❌ Error during seeding: " + e.getMessage());
            e.printStackTrace();
            return "Error during seeding: " + e.getMessage();
        }
    }

    /** Legacy overload — seeds first 3 active employees (admin use) */
    public String seedSampleData() {
        return seedSampleData("", "ADMIN");
    }

    public String debugEmployeeData() {
        try {
            List<Employee> employees = employeeRepo.findAll();
            StringBuilder debug = new StringBuilder();
            debug.append("Total employees: ").append(employees.size()).append("\n");
            
            for (Employee emp : employees) {
                debug.append("Employee: ").append(emp.getFullName())
                     .append(", ID: ").append(emp.getEmployeeId())
                     .append(", Status: ").append(emp.getStatus())
                     .append("\n");
            }
            
            return debug.toString();
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    private Performance createSamplePerformance(String empId, String empName) {
        Performance perf = new Performance();
        perf.setEmployeeId(empId);
        
        // Generate realistic overall score (3.2 to 4.8)
        double overallScore = 3.2 + (Math.random() * 1.6);
        perf.setOverallScore(overallScore);

        // Monthly ratings (last 6 months)
        perf.setMonthlyRatings(Arrays.asList(
            new MonthlyRating("2024-07", 3.8 + (Math.random() * 0.8)),
            new MonthlyRating("2024-08", 3.9 + (Math.random() * 0.7)),
            new MonthlyRating("2024-09", 4.0 + (Math.random() * 0.6)),
            new MonthlyRating("2024-10", 3.7 + (Math.random() * 0.9)),
            new MonthlyRating("2024-11", 4.1 + (Math.random() * 0.5)),
            new MonthlyRating("2024-12", overallScore)
        ));

        // Performance parameters
        perf.setParameters(Arrays.asList(
            new Parameter("Technical Skills", 25, 3.5 + (Math.random() * 1.5)),
            new Parameter("Communication", 20, 3.8 + (Math.random() * 1.2)),
            new Parameter("Teamwork", 20, 4.0 + (Math.random() * 1.0)),
            new Parameter("Problem Solving", 15, 3.6 + (Math.random() * 1.4)),
            new Parameter("Leadership", 10, 3.2 + (Math.random() * 1.8)),
            new Parameter("Time Management", 10, 4.2 + (Math.random() * 0.8))
        ));

        // Manager reviews
        perf.setReviews(Arrays.asList(
            new Review("Manager", "Q3 2024", 4.0 + (Math.random() * 0.8), 
                      empName + " consistently delivers quality work and shows great potential for growth."),
            new Review("HR", "Q4 2024", 3.8 + (Math.random() * 0.9), 
                      "Strong team player with excellent communication skills. Areas for improvement: leadership initiatives."),
            new Review("Manager", "Q4 2024", overallScore, 
                      "Exceeded expectations in most areas. Recommended for advanced training programs.")
        ));

        return perf;
    }
}