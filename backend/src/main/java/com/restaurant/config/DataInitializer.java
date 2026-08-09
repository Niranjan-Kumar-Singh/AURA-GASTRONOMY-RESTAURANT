package com.restaurant.config;

import com.restaurant.entity.User;
import com.restaurant.enums.Role;
import com.restaurant.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        log.info("Resetting & Enforcing Standard Enterprise Demo Staff Accounts...");

        upsertStaff("admin@aura.com", "admin123", "Alexander Wright", Role.ADMIN);
        upsertStaff("owner@aura.com", "owner123", "Victor Vance", Role.RESTAURANT_OWNER);
        upsertStaff("manager@aura.com", "manager123", "Sophia Martinez", Role.MANAGER);
        upsertStaff("chef@aura.com", "chef123", "Marco Pierre", Role.CHEF);
        upsertStaff("waiter@aura.com", "waiter123", "Lucas Rossi", Role.WAITER);
        upsertStaff("cashier@aura.com", "cashier123", "Elena Rostova", Role.CASHIER);
        upsertStaff("staff@aura.com", "staff123", "Staff General Account", Role.ADMIN);

        log.info("Demo Staff Accounts Seeding Complete!");
    }

    private void upsertStaff(String email, String rawPassword, String fullName, Role role) {
        User user = userRepository.findByEmail(email)
            .orElseGet(() -> User.builder().email(email).build());

        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setFullName(fullName);
        user.setRole(role);
        user.setActive(true);

        userRepository.save(user);
        log.info("Enforced Demo Staff Account: {} / Password: {}", email, rawPassword);
    }
}
