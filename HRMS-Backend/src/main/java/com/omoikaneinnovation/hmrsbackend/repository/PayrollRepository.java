package com.omoikaneinnovation.hmrsbackend.repository;

import com.omoikaneinnovation.hmrsbackend.model.Payroll;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface PayrollRepository extends MongoRepository<Payroll, String> {

    List<Payroll> findByEmpCode(String empCode);

    Optional<Payroll> findByEmployeeId(String employeeId);
    
    // ✅ ADD THIS (safe, no impact on existing logic)
    Payroll findTopByEmployeeIdOrderByUpdatedAtDesc(String employeeId);
    
    // ✅ NEW: Find payroll by employeeId AND month (prevents data conflicts)
    Payroll findByEmployeeIdAndMonth(String employeeId, String month);
    
    // ✅ NEW: Find all payroll by month (for bulk operations)
    List<Payroll> findByMonth(String month);
    
}