package com.omoikaneinnovation.hmrsbackend.service;

import com.omoikaneinnovation.hmrsbackend.model.User;
import com.omoikaneinnovation.hmrsbackend.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AdminSetupService {

    private final UserRepository repo;
    private final BCryptPasswordEncoder encoder;

    public AdminSetupService(UserRepository repo,
                             BCryptPasswordEncoder encoder) {
        this.repo = repo;
        this.encoder = encoder;
    }

    public void createAdminIfNotExists() {

        if (repo.findByEmail("admin@omoi.com").isPresent()) {
            return;
        }

        User admin = new User();
        admin.setName("System Admin");
        admin.setEmail("admin@omoi.com");
        admin.setPassword(encoder.encode("Admin@123")); // one-time password
        admin.setRole("ADMIN"); // ✅ Fixed: uppercase role

        repo.save(admin);

        System.out.println("=================================");
        System.out.println(" ADMIN CREATED ");
        System.out.println(" Email: admin@omoi.com");
        System.out.println(" Password: Admin@123");
        System.out.println("=================================");
    }
}
