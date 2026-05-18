package com.omoikaneinnovation.hmrsbackend.controller;

import com.omoikaneinnovation.hmrsbackend.dto.EmployeeDTO;
import com.omoikaneinnovation.hmrsbackend.dto.EmployeeUpdateDTO;
import com.omoikaneinnovation.hmrsbackend.dto.ParticipantDTO;
import com.omoikaneinnovation.hmrsbackend.model.User;
import com.omoikaneinnovation.hmrsbackend.repository.UserRepository;
import com.omoikaneinnovation.hmrsbackend.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import com.omoikaneinnovation.hmrsbackend.model.Employee;
import java.security.Principal;


@RestController
@RequestMapping("/api/employee")
@CrossOrigin(originPatterns = {"http://localhost:*", "http://127.0.0.1:*", "https://*.vercel.app", "https://*.ngrok-free.dev"})
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;
    
    @Autowired
    private UserRepository userRepository;

   @PostMapping("/create")
public ResponseEntity<User> createEmployee(@RequestBody EmployeeDTO dto, Principal principal) {

    String email = principal.getName();
    User admin = userRepository.findByEmail(email).orElseThrow();

    User employee = employeeService.createEmployee(
        dto.getName(),
        dto.getEmail(),
        dto.getPassword(),
        admin.getCompanyId() // ✅ PASS THIS
    );

    return ResponseEntity.ok(employee);
}

    @PutMapping("/update/{employeeId}")
    public ResponseEntity<?> updateEmployee(@PathVariable String employeeId, @RequestBody EmployeeUpdateDTO dto) {
        try {
            Employee updatedEmployee = employeeService.updateEmployee(employeeId, dto);
            return ResponseEntity.ok(updatedEmployee);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update employee: " + e.getMessage());
        }
    }

   @GetMapping("/all")
public ResponseEntity<?> getAllEmployees(Principal principal) {

    try {
        // Get the logged-in user's company ID
        if (principal == null) {
            System.out.println("⚠ No user logged in, returning empty list");
            return ResponseEntity.ok(new ArrayList<>());
        }

        String email = principal.getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found: " + email));

        String companyId = user.getCompanyId();
        System.out.println("✅ Fetching employees for company: " + companyId);

        List<Employee> employees = employeeService.getAllEmployees(companyId);
        System.out.println("✅ Found " + employees.size() + " employees");

        return ResponseEntity.ok(employees);
    } catch (Exception e) {
        System.err.println("❌ Error fetching employees: " + e.getMessage());
        e.printStackTrace();
        return ResponseEntity.ok(new ArrayList<>());
    }
}

  @GetMapping("/birthdays/current-month")
public List<Employee> getBirthdays() {
    return employeeService.getCurrentMonthBirthdays();
}  

 /**
     * Get all employees formatted as User objects for frontend compatibility
     */
    @GetMapping("/as-users")
  public ResponseEntity<List<User>> getEmployeesAsUsers(Principal principal) {

    String email = principal.getName();
    User user = userRepository.findByEmail(email).orElseThrow();

    List<Employee> employees = employeeService.getAllEmployees(user.getCompanyId());
        List<User> userList = new ArrayList<>();
        
        for (Employee emp : employees) {
           User empUser = new User();
empUser.setId(emp.getId());
empUser.setName(emp.getFullName());
empUser.setEmail(emp.getEmail());
empUser.setDepartment(emp.getDepartment());
empUser.setDesignation(emp.getDesignation());
empUser.setRole("EMPLOYEE");
empUser.setActive("ACTIVE".equals(emp.getStatus()) || "INVITED".equals(emp.getStatus()));

userList.add(empUser);
        }
        
        return ResponseEntity.ok(userList);
    }

    /**
     * Get all participants (users and employees) for meeting invitations
     */
   @GetMapping("/participants")
public ResponseEntity<List<ParticipantDTO>> getAllParticipants(Principal principal) {
        String email = principal.getName();
User user = userRepository.findByEmail(email).orElseThrow();
        List<ParticipantDTO> participants = new ArrayList<>();
        
        // Get all employees as participants
       List<Employee> employees = employeeService.getAllEmployees(user.getCompanyId());
        for (Employee emp : employees) {
            ParticipantDTO participant = ParticipantDTO.builder()
                    .id(emp.getId())
                    .name(emp.getFullName())
                    .email(emp.getEmail())
                    .department(emp.getDepartment())
                    .designation(emp.getDesignation())
                    .type("EMPLOYEE")
                    .active("ACTIVE".equals(emp.getStatus()) || "INVITED".equals(emp.getStatus()))
                    .build();
            participants.add(participant);
        }
        
        return ResponseEntity.ok(participants);
    }

    /**
     * Search participants by name, email, or department
     */
    @GetMapping("/participants/search")
   public ResponseEntity<List<ParticipantDTO>> searchParticipants(
        @RequestParam(name = "query", defaultValue = "") String query,
        Principal principal)
         {
            String email = principal.getName();
User user = userRepository.findByEmail(email).orElseThrow();
        
        List<ParticipantDTO> participants = new ArrayList<>();
        String queryLower = query.toLowerCase().trim();
        
        // Get all employees and filter
        List<Employee> employees = employeeService.getAllEmployees(user.getCompanyId());
        
        for (Employee emp : employees) {
            // Check if employee matches search query
            if (emp.getFullName().toLowerCase().contains(queryLower) ||
                emp.getEmail().toLowerCase().contains(queryLower) ||
                (emp.getDepartment() != null && emp.getDepartment().toLowerCase().contains(queryLower))) {
                
                ParticipantDTO participant = ParticipantDTO.builder()
                        .id(emp.getId())
                        .name(emp.getFullName())
                        .email(emp.getEmail())
                        .department(emp.getDepartment())
                        .designation(emp.getDesignation())
                        .type("EMPLOYEE")
                        .active("ACTIVE".equals(emp.getStatus()) || "INVITED".equals(emp.getStatus()))
                        .build();
                participants.add(participant);
            }
        }
        
        return ResponseEntity.ok(participants);
    }
    
    /**
     * Update user role (ADMIN only)
     * POST /api/employee/update-role
     * Body: { "email": "user@example.com", "role": "MANAGER" }
     */
    @PostMapping("/update-role")
    public ResponseEntity<?> updateUserRole(@RequestBody java.util.Map<String, String> request) {
        try {
            String email = request.get("email");
            String newRole = request.get("role");
            
            if (email == null || newRole == null) {
                return ResponseEntity.badRequest().body("Email and role are required");
            }
            
            // Validate role
            if (!newRole.matches("ADMIN|HR|MANAGER|EMPLOYEE")) {
                return ResponseEntity.badRequest().body("Invalid role. Must be one of: ADMIN, HR, MANAGER, EMPLOYEE");
            }
            
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
            
            String oldRole = user.getRole();
            user.setRole(newRole.toUpperCase());
            userRepository.save(user);
            
            return ResponseEntity.ok(java.util.Map.of(
                "message", "Role updated successfully",
                "email", email,
                "oldRole", oldRole,
                "newRole", newRole.toUpperCase()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update role: " + e.getMessage());
        }
    }
}