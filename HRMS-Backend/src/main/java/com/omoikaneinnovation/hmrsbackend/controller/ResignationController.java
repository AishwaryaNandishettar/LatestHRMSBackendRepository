package com.omoikaneinnovation.hmrsbackend.controller;

import com.omoikaneinnovation.hmrsbackend.model.Resignation;
import com.omoikaneinnovation.hmrsbackend.service.ResignationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resignation")
@CrossOrigin("*")
public class ResignationController {

    private final ResignationService service;

    public ResignationController(ResignationService service) {
        this.service = service;
    }

    @PostMapping("/submit")
    public Resignation submit(@RequestBody Resignation r) {
        return service.submit(r);
    }

    @GetMapping("/{empId}")
    public List<Resignation> getByEmp(@PathVariable String empId) {
        return service.getByEmp(empId);
    }

    @PutMapping("/status/{id}")
    public Resignation update(@PathVariable String id, @RequestParam String status) {
        return service.updateStatus(id, status);
    }

    // ✅ GET ALL RESIGNATIONS (FOR ADMIN)
    @GetMapping("/all")
    public List<Resignation> getAll() {
        return service.getAll();
    }

    // ✅ GET RESIGNATIONS FOR MANAGER APPROVAL (PENDING ONLY)
    @GetMapping("/pending-manager")
    public List<Resignation> getPendingForManager(@RequestParam String managerEmail) {
        return service.getPendingForManager(managerEmail);
    }

    // ✅ GET ALL RESIGNATIONS FOR A MANAGER (ALL STATUSES - for tracking table)
    @GetMapping("/by-manager")
    public List<Resignation> getAllByManager(@RequestParam String managerEmail) {
        return service.getAllByManager(managerEmail);
    }

    // ✅ GET RESIGNATIONS FOR HR APPROVAL
    @GetMapping("/pending-hr")
    public List<Resignation> getPendingForHR() {
        return service.getPendingForHR();
    }

    // ✅ MANAGER/ADMIN APPROVES RESIGNATION
    @PostMapping("/approve/{id}")
    public Resignation approveResignation(@PathVariable String id, @RequestParam String approverName) {
        return service.approveResignation(id, approverName);
    }

    // ✅ MANAGER/ADMIN REJECTS RESIGNATION
    @PostMapping("/reject/{id}")
    public Resignation rejectResignation(@PathVariable String id, @RequestParam String rejectionReason) {
        return service.rejectResignation(id, rejectionReason);
    }
}