    package com.omoikaneinnovation.hmrsbackend.security;

    import com.omoikaneinnovation.hmrsbackend.model.User;
    import com.omoikaneinnovation.hmrsbackend.repository.UserRepository;
    import org.springframework.security.core.userdetails.*;
    import org.springframework.stereotype.Service;

    @Service
    public class UserDetailsServiceImpl implements UserDetailsService {

        private final UserRepository repo;

        public UserDetailsServiceImpl(UserRepository repo) {
            this.repo = repo;
        }

        @Override
        public UserDetails loadUserByUsername(String email)
                throws UsernameNotFoundException {

            User user = repo.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));

            // ✅ Ensure role is uppercase for Spring Security
            String role = user.getRole() != null ? user.getRole().toUpperCase() : "EMPLOYEE";
            
            System.out.println("🔍 UserDetailsService: Loading user: " + email + ", Role: " + role);

            // 🔴 DO NOT add ROLE_ here
            // Spring will convert ADMIN → ROLE_ADMIN
            return org.springframework.security.core.userdetails.User
                    .withUsername(user.getEmail())
                    .password(user.getPassword())
                    .roles(role)   // ADMIN / HR / EMPLOYEE / MANAGER
                    .build();
        }
    }
