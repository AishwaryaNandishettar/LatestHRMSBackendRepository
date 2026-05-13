package com.omoikaneinnovation.hmrsbackend.repository;

import com.omoikaneinnovation.hmrsbackend.model.Resignation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ResignationRepository extends MongoRepository<Resignation, String> {
    List<Resignation> findByEmpId(String empId);
    
    // ✅ GET RESIGNATIONS FOR MANAGER APPROVAL (PENDING ONLY)
    List<Resignation> findByManagerNameAndStatus(String managerName, String status);

    // ✅ GET ALL RESIGNATIONS FOR A MANAGER (ALL STATUSES - for tracking table)
    List<Resignation> findByManagerName(String managerName);
    
    // ✅ GET RESIGNATIONS FOR HR APPROVAL
    List<Resignation> findByStatus(String status);
}