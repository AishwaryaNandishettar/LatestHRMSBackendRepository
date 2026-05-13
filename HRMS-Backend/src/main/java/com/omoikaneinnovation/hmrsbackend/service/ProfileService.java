package com.omoikaneinnovation.hmrsbackend.service;

import com.omoikaneinnovation.hmrsbackend.dto.ProfileResponse;
import com.omoikaneinnovation.hmrsbackend.model.User;
import com.omoikaneinnovation.hmrsbackend.model.Employee;
import com.omoikaneinnovation.hmrsbackend.repository.UserRepository;
import com.omoikaneinnovation.hmrsbackend.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ProfileService {

    @Autowired
    private UserRepository userRepo;
    
    @Autowired
    private EmployeeRepository employeeRepo;

    public ProfileResponse getMyProfile(String empId) {

        User emp = userRepo.findByEmployeeId(empId);

        if (emp == null) {
            throw new RuntimeException("Employee not found");
        }

        // ✅ Get Employee data for correct name
        Employee employee = employeeRepo.findByEmployeeId(empId).orElse(null);

        User manager = null;

        if (emp.getManagerId() != null) {
            manager = userRepo.findByEmployeeId(emp.getManagerId());
        }

        ProfileResponse res = new ProfileResponse();

        res.setEmployeeId(emp.getEmployeeId());
        // ✅ Use Employee fullName if available, otherwise User name
        res.setName(employee != null ? employee.getFullName() : emp.getName());
        res.setDepartment(emp.getDepartment());

        res.setManagerId(emp.getManagerId());

        res.setManagerName(
                manager != null ? manager.getName() : "Not Assigned"
        );

        return res;
    }
}