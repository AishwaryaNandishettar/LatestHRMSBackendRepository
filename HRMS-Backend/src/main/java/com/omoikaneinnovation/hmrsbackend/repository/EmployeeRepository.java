package com.omoikaneinnovation.hmrsbackend.repository;

import com.omoikaneinnovation.hmrsbackend.model.Employee;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;   // ✅ ADD THIS IMPORT
import java.util.List;  // ✅ REQUIRED

public interface EmployeeRepository extends MongoRepository<Employee, String> {

    boolean existsByEmail(String email);
    Optional<Employee> findByEmail(String email);
    Optional<Employee> findByEmployeeId(String employeeId);
    Optional<Employee> findByUserId(String userId);
    List<Employee> findByCompanyId(String companyId); // ✅ ADD THIS LINE
}