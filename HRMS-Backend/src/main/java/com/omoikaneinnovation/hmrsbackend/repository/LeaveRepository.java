package com.omoikaneinnovation.hmrsbackend.repository;

import com.omoikaneinnovation.hmrsbackend.model.LeaveRequest;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface LeaveRepository extends MongoRepository<LeaveRequest, String> {

    List<LeaveRequest> findByUserId(String userId);

    List<LeaveRequest> findByUserIdAndStartDateStartingWith(String userId, String month);

    List<LeaveRequest> findByManagerEmail(String managerEmail); // ✅ correct
}