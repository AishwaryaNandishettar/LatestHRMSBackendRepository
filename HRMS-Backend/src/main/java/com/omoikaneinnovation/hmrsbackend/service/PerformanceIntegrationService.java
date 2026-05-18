package com.omoikaneinnovation.hmrsbackend.service;

import com.omoikaneinnovation.hmrsbackend.model.Performance;
import com.omoikaneinnovation.hmrsbackend.repository.PerformanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class PerformanceIntegrationService {

    @Autowired
    private PerformanceRepository performanceRepository;

    /**
     * Get performance rating for an employee
     * @param employeeId Employee ID
     * @return Performance rating (0-5 scale)
     */
    public Double getPerformanceRating(String employeeId) {
        try {
            Optional<Performance> perfOpt = performanceRepository.findByEmployeeId(employeeId);
            
            if (perfOpt.isPresent()) {
                Performance perf = perfOpt.get();
                return perf.getOverallScore();
            }
            
            return 3.0; // Default average rating
        } catch (Exception e) {
            System.err.println("Error fetching performance rating: " + e.getMessage());
            return 3.0; // Default
        }
    }

    /**
     * Calculate performance bonus based on rating
     * @param rating Performance rating (0-5)
     * @param basicSalary Basic salary
     * @return Performance bonus amount
     */
    public Double calculatePerformanceBonus(Double rating, Double basicSalary) {
        if (rating == null || basicSalary == null) {
            return 0.0;
        }
        
        // Performance bonus rules
        if (rating >= 4.5) {
            return basicSalary * 0.25; // 25% of basic for outstanding performance
        } else if (rating >= 4.0) {
            return basicSalary * 0.20; // 20% of basic for excellent performance
        } else if (rating >= 3.5) {
            return basicSalary * 0.15; // 15% of basic for very good performance
        } else if (rating >= 3.0) {
            return basicSalary * 0.10; // 10% of basic for good performance
        } else if (rating >= 2.5) {
            return basicSalary * 0.05; // 5% of basic for average performance
        } else {
            return 0.0; // No bonus for below average
        }
    }
}
