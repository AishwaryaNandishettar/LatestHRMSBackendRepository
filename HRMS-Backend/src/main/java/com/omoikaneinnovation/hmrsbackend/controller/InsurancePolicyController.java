package com.omoikaneinnovation.hmrsbackend.controller;
import org.springframework.web.bind.annotation.*;
import com.omoikaneinnovation.hmrsbackend.model.InsurancePolicy;
import com.omoikaneinnovation.hmrsbackend.repository.InsurancePolicyRepository; // ✅ ADD THIS
import java.util.List;
@RestController
@RequestMapping("/api/policy")
@CrossOrigin("*")
public class InsurancePolicyController {

    private final InsurancePolicyRepository policyRepo;

    public InsurancePolicyController(InsurancePolicyRepository policyRepo) {
        this.policyRepo = policyRepo;
    }

    @GetMapping("/plans/{companyId}")
    public List<InsurancePolicy> getPlans(@PathVariable String companyId){
        return policyRepo.findAll()
                .stream()
                .filter(p -> p.getCompanyId().equals(companyId))
                .toList();
    }
}