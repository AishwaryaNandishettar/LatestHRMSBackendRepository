package com.omoikaneinnovation.hmrsbackend.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.omoikaneinnovation.hmrsbackend.model.User;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
        List<User> findByEmailContainingIgnoreCase(String email);
            User findByEmployeeId(String employeeId);
             // ✅ ADD THIS LINE (ONLY THIS)
    List<User> findByManagerEmail(String managerEmail);
}
