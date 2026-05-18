package com.omoikaneinnovation.hmrsbackend.service;

import com.omoikaneinnovation.hmrsbackend.model.Resignation;
import com.omoikaneinnovation.hmrsbackend.repository.ResignationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResignationService {

    private final ResignationRepository repo;

    public ResignationService(ResignationRepository repo) {
        this.repo = repo;
    }

    public Resignation submit(Resignation r) {
        r.setStatus("PENDING_MANAGER");
        return repo.save(r);
    }

    public List<Resignation> getByEmp(String empId) {
        return repo.findByEmpId(empId);
    }

    public Resignation updateStatus(String id, String status) {
        Resignation r = repo.findById(id).orElseThrow();
        r.setStatus(status);
        return repo.save(r);
    }

    // ✅ GET ALL RESIGNATIONS (FOR ADMIN)
    public List<Resignation> getAll() {
        return repo.findAll();
    }

    // ✅ GET RESIGNATIONS FOR MANAGER APPROVAL (PENDING ONLY)
    public List<Resignation> getPendingForManager(String managerEmail) {
        return repo.findByManagerNameAndStatus(managerEmail, "PENDING_MANAGER");
    }

    // ✅ GET ALL RESIGNATIONS FOR A MANAGER (ALL STATUSES - for tracking table)
    public List<Resignation> getAllByManager(String managerEmail) {
        return repo.findByManagerName(managerEmail);
    }

    // ✅ GET RESIGNATIONS FOR HR APPROVAL
    public List<Resignation> getPendingForHR() {
        return repo.findByStatus("PENDING_HR");
    }

    // ✅ MANAGER APPROVES RESIGNATION
    public Resignation approveResignation(String id, String approverName) {
        Resignation r = repo.findById(id).orElseThrow();
        
        // If manager is approving, move to PENDING_HR
        if (r.getStatus().equals("PENDING_MANAGER")) {
            r.setStatus("PENDING_HR");
            r.setApprovedByManager(approverName);
        }
        // If HR is approving, mark as APPROVED
        else if (r.getStatus().equals("PENDING_HR")) {
            r.setStatus("APPROVED");
            r.setApprovedByHR(approverName);
        }
        
        return repo.save(r);
    }

    // ✅ MANAGER/HR REJECTS RESIGNATION
    public Resignation rejectResignation(String id, String rejectionReason) {
        Resignation r = repo.findById(id).orElseThrow();
        r.setStatus("REJECTED");
        r.setRejectionReason(rejectionReason);
        return repo.save(r);
    }
}