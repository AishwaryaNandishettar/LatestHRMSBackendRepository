package com.omoikaneinnovation.hmrsbackend.service;

import com.omoikaneinnovation.hmrsbackend.repository.LeaveRepository;
import com.omoikaneinnovation.hmrsbackend.model.LeaveRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LeaveService {

    @Autowired
    private LeaveRepository leaveRepository;

 public String applyLeave(LeaveRequest request){

    System.out.println("USER ID BEFORE SAVE 👉 " + request.getUserId());

    if(request.getUserId() == null || request.getUserId().isEmpty()){
        throw new RuntimeException("UserId is missing!");
    }

    request.setStatus("PENDING");

    if(request.getEmployeeName() == null){
        request.setEmployeeName("Unknown");
    }

    leaveRepository.save(request);

    return "Leave Applied Successfully";
}

   public List<LeaveRequest> myLeaves(String userId){
    List<LeaveRequest> all = leaveRepository.findAll();

    return all.stream()
        .filter(l -> userId.equals(String.valueOf(l.getUserId())))
        .toList();
}
    public String updateLeaveStatus(String leaveId, String status){

        LeaveRequest leave = leaveRepository.findById(leaveId).orElse(null);

        if(leave == null){
            return "Leave not found";
        }

        leave.setStatus(status);

        leaveRepository.save(leave);

        return "Leave status updated";
    }

public List<LeaveRequest> getLeavesByManager(String managerEmail) {
    return leaveRepository.findByManagerEmail(managerEmail);
}
    public List<LeaveRequest> getAllLeaves() {
        return leaveRepository.findAll();
    }

    public LeaveRequest updateLeaveStatusById(String id, String status) {
        LeaveRequest leave = leaveRepository.findById(id).orElseThrow();
        leave.setStatus(status);
        return leaveRepository.save(leave);
    }
}