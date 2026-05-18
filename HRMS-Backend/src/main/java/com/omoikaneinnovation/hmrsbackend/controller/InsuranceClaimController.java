package com.omoikaneinnovation.hmrsbackend.controller;

import com.omoikaneinnovation.hmrsbackend.model.InsuranceClaim;
import com.omoikaneinnovation.hmrsbackend.service.InsuranceClaimService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/insurance")
@CrossOrigin(originPatterns = {"http://localhost:*", "https://*.ngrok-free.dev"})
public class InsuranceClaimController {

    private final InsuranceClaimService service;

    public InsuranceClaimController(InsuranceClaimService service){
        this.service = service;
    }

  @PostMapping("/create")
public InsuranceClaim createClaim(@RequestBody InsuranceClaim claim) {
    try {
        return service.createClaim(claim);
    } catch (Exception e) {
        e.printStackTrace();
        throw e;
    }
}

    @GetMapping("/all")
    public List<InsuranceClaim> getAllClaims(){
        return service.getAllClaims();
    }

   @PutMapping("/status/{id}")
    public InsuranceClaim updateStatus(@PathVariable String id, @RequestParam String status){
        return service.updateStatus(id,status);
    }

    @PutMapping("/amount/{id}")
public InsuranceClaim updateAmount(@PathVariable String id, @RequestParam double amount){
    return service.updateApprovedAmount(id, amount);
}

}