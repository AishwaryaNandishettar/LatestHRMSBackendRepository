package com.omoikaneinnovation.hmrsbackend.repository;

import com.omoikaneinnovation.hmrsbackend.model.Performance;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface PerformanceRepository extends MongoRepository<Performance, String> {
    Optional<Performance> findByEmployeeId(String employeeId);
    
    List<Performance> findByEmployeeIdIn(List<String> employeeIds);
}