    package com.omoikaneinnovation.hmrsbackend.service;

    import com.omoikaneinnovation.hmrsbackend.model.User;
    import com.omoikaneinnovation.hmrsbackend.repository.UserRepository;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
    import org.springframework.stereotype.Service;
    import java.util.List;
    import java.util.Optional;
    import java.time.LocalDate;

    import com.omoikaneinnovation.hmrsbackend.model.Employee;

    @Service
    public class EmployeeService {

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private BCryptPasswordEncoder passwordEncoder;


    @Autowired
    private com.omoikaneinnovation.hmrsbackend.repository.EmployeeRepository employeeRepo;

    public List<Employee> getAllEmployees(String companyId) {
    // First try to get employees by companyId
    List<Employee> employees = employeeRepo.findByCompanyId(companyId);
    
    // If no employees found by companyId, return all employees (fallback)
    // This handles cases where companyId wasn't set on existing employees
    if (employees.isEmpty()) {
        System.out.println("⚠ No employees found for companyId: " + companyId + ", returning all employees");
        employees = employeeRepo.findAll();
    }
    
    return employees;
}
       public User createEmployee(String name, String email, String password, String companyId) {

    User user = new User();
    user.setName(name);
    user.setEmail(email);
    user.setPassword(passwordEncoder.encode(password));
    user.setRole("EMPLOYEE");
    user.setActive(true);
   // ✅ ADD THIS (VERY IMPORTANT)
    user.setCompanyId(companyId); // ✅ USE PARAM


    User savedUser = userRepository.save(user);

    Employee emp = new Employee();
    emp.setFullName(name);
    emp.setEmail(email);
    emp.setStatus("ACTIVE");
     // ✅ now this will NOT be null
    emp.setCompanyId(savedUser.getCompanyId());

    emp.setDepartment("IT");
    emp.setDesignation("Employee");

    employeeRepo.save(emp);

    return savedUser;
}
      public List<Employee> getCurrentMonthBirthdays() {
    int currentMonth = LocalDate.now().getMonthValue();

    return employeeRepo.findAll().stream()
            .filter(emp -> {
                if (emp.getDob() == null) return false;
                return LocalDate.parse(emp.getDob()).getMonthValue() == currentMonth;
            })
            .toList();
    }

    public Employee updateEmployee(String employeeId, com.omoikaneinnovation.hmrsbackend.dto.EmployeeUpdateDTO dto) {
        Optional<Employee> employeeOpt = employeeRepo.findByEmployeeId(employeeId);
        if (employeeOpt.isEmpty()) {
            throw new RuntimeException("Employee not found with ID: " + employeeId);
        }

        Employee employee = employeeOpt.get();

        // Update fields if provided
        if (dto.getFullName() != null && !dto.getFullName().trim().isEmpty()) {
            employee.setFullName(dto.getFullName());
            
            // ✅ FIX: Sync name to User table
            Optional<User> userOpt = userRepository.findByEmail(employee.getEmail());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                user.setName(dto.getFullName());
                userRepository.save(user);
                System.out.println("✅ Synced employee name to User table: " + dto.getFullName());
            }
        }
        if (dto.getDepartment() != null && !dto.getDepartment().trim().isEmpty()) {
            employee.setDepartment(dto.getDepartment());
            
            // ✅ FIX: Sync department to User table
            Optional<User> userOpt = userRepository.findByEmail(employee.getEmail());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                user.setDepartment(dto.getDepartment());
                userRepository.save(user);
            }
        }
        if (dto.getDesignation() != null && !dto.getDesignation().trim().isEmpty()) {
            employee.setDesignation(dto.getDesignation());
            
            // ✅ FIX: Sync designation to User table
            Optional<User> userOpt = userRepository.findByEmail(employee.getEmail());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                user.setDesignation(dto.getDesignation());
                userRepository.save(user);
            }
        }
        if (dto.getEmail() != null && !dto.getEmail().trim().isEmpty()) {
            employee.setEmail(dto.getEmail());
        }

        // Statutory / bank fields (allow empty string to clear a value)
        if (dto.getBankAccountNumber() != null) employee.setBankAccountNumber(dto.getBankAccountNumber());
        if (dto.getIfsc() != null) employee.setIfsc(dto.getIfsc());
        if (dto.getUan() != null) employee.setUan(dto.getUan());
        if (dto.getPfMemberId() != null) employee.setPfMemberId(dto.getPfMemberId());
        if (dto.getPf() != null) employee.setPf(dto.getPf());
        if (dto.getEsic() != null) employee.setEsic(dto.getEsic());
        if (dto.getDesignationChanged() != null) employee.setDesignationChanged(dto.getDesignationChanged());
        if (dto.getDesignationChangedDate() != null) employee.setDesignationChangedDate(dto.getDesignationChangedDate());

        // New fields
        if (dto.getLocation() != null) employee.setLocation(dto.getLocation());
        if (dto.getManager() != null) employee.setManager(dto.getManager());
        if (dto.getManagerEmail() != null) employee.setManagerEmail(dto.getManagerEmail());
        if (dto.getDob() != null && !dto.getDob().trim().isEmpty()) employee.setDob(dto.getDob());
        if (dto.getDoj() != null && !dto.getDoj().trim().isEmpty()) employee.setDoj(dto.getDoj());
        if (dto.getExitDate() != null) employee.setExitDate(dto.getExitDate());
        if (dto.getStatus() != null && !dto.getStatus().trim().isEmpty()) employee.setStatus(dto.getStatus());

        return employeeRepo.save(employee);
    }
    }