package com.omoikaneinnovation.hmrsbackend.config;

import com.omoikaneinnovation.hmrsbackend.model.*;
import com.omoikaneinnovation.hmrsbackend.repository.EmployeeRepository;
import com.omoikaneinnovation.hmrsbackend.repository.PerformanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Seeds performance data for active employees on startup.
 * Only runs if the performance collection is empty.
 */
@Component
@Order(2)
@RequiredArgsConstructor
public class PerformanceDataSeeder implements CommandLineRunner {

    private final PerformanceRepository performanceRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    public void run(String... args) {
        if (performanceRepository.count() > 0) return;

        // Seed for every active employee found in DB
        List<Employee> employees = employeeRepository.findAll();

        for (Employee emp : employees) {
            String status = emp.getStatus() == null ? "" : emp.getStatus().toLowerCase();
            if (!status.equals("active")) continue;

            String empId = emp.getEmployeeId();
            String name  = emp.getFullName() == null ? "Employee" : emp.getFullName();

            Performance p = buildPerformance(empId, name);
            performanceRepository.save(p);
            System.out.println("[PerformanceDataSeeder] Seeded performance for: " + name + " (" + empId + ")");
        }

        // Fallback: if no active employees found, seed for known employees
        if (performanceRepository.count() == 0) {
            performanceRepository.save(buildPerformance("EMP-MAHESH",  "Mahesh P"));
            performanceRepository.save(buildPerformance("EMP-ADHVITI", "Adhviti"));
            System.out.println("[PerformanceDataSeeder] Seeded fallback performance records.");
        }
    }

    private Performance buildPerformance(String empId, String name) {
        // Vary data slightly per employee so charts look different
        double base = 3.5 + (Math.abs(empId.hashCode()) % 15) / 10.0;

        List<MonthlyRating> monthly = List.of(
            new MonthlyRating("Jan", round(base - 0.3)),
            new MonthlyRating("Feb", round(base + 0.1)),
            new MonthlyRating("Mar", round(base + 0.3)),
            new MonthlyRating("Apr", round(base + 0.5)),
            new MonthlyRating("May", round(base + 0.2)),
            new MonthlyRating("Jun", round(base + 0.6))
        );

        double overall = monthly.stream()
            .mapToDouble(MonthlyRating::getRating)
            .average()
            .orElse(4.0);

        List<Parameter> params = List.of(
            new Parameter("Technical Skills",  25, round(base + 0.3)),
            new Parameter("Productivity",      20, round(base + 0.5)),
            new Parameter("Quality of Work",   15, round(base + 0.1)),
            new Parameter("Collaboration",     10, round(base + 0.4)),
            new Parameter("Communication",     10, round(base)),
            new Parameter("Innovation",        10, round(base - 0.1)),
            new Parameter("Leadership",        10, round(base + 0.2))
        );

        List<Review> reviews = List.of(
            new Review("Manager", "Q1", round(base + 0.2), "Strong collaboration and on-time delivery"),
            new Review("HR",      "Q2", round(base + 0.5), "Consistent performance growth observed"),
            new Review("Self",    "Q2", round(base + 0.3), "Improved technical ownership and initiative")
        );

        Performance p = new Performance();
        p.setEmployeeId(empId);
        p.setOverallScore(round(overall));
        p.setMonthlyRatings(monthly);
        p.setParameters(params);
        p.setReviews(reviews);
        return p;
    }

    private double round(double v) {
        double clamped = Math.min(5.0, Math.max(1.0, v));
        return Math.round(clamped * 10.0) / 10.0;
    }
}
