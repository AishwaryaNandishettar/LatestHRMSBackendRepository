package com.omoikaneinnovation.hmrsbackend.controller;

import com.omoikaneinnovation.hmrsbackend.model.LeaveRequest;
import com.omoikaneinnovation.hmrsbackend.service.LeaveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leave")
public class LeaveController {

    @Autowired
    private LeaveService leaveService;

    @PostMapping("/apply")
    public String applyLeave(@RequestBody LeaveRequest request){

        return leaveService.applyLeave(request);
    }

    @GetMapping("/my/{userId}")
    public List<LeaveRequest> myLeaves(@PathVariable String userId){

        return leaveService.myLeaves(userId);
    }

   


    @GetMapping("/all")
public List<LeaveRequest> getAllLeaves() {
    return leaveService.getAllLeaves();
}  
@GetMapping("/manager-leaves")
public List<LeaveRequest> getManagerLeaves(@RequestParam String managerEmail) {
    return leaveService.getLeavesByManager(managerEmail);
}

@PutMapping("/{id}/status")
public LeaveRequest updateStatus(
        @PathVariable String id,
        @RequestParam String status
) {
    return leaveService.updateLeaveStatusById(id, status);
}
}