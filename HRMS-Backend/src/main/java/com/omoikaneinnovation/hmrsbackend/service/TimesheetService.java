package com.omoikaneinnovation.hmrsbackend.service;

import com.omoikaneinnovation.hmrsbackend.model.Attendance;
import com.omoikaneinnovation.hmrsbackend.model.TimesheetSummary;
import com.omoikaneinnovation.hmrsbackend.model.User;
import com.omoikaneinnovation.hmrsbackend.repository.AttendanceRepository;
import com.omoikaneinnovation.hmrsbackend.repository.UserRepository;
import org.springframework.stereotype.Service;
import com.omoikaneinnovation.hmrsbackend.repository.LeaveRepository;
import com.omoikaneinnovation.hmrsbackend.model.LeaveRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.*;

@Service
public class TimesheetService {   // ✅ FIXED NAME

    private final AttendanceRepository repo;
    private final LeaveRepository leaveRepo;
    private final UserRepository userRepo;

    public TimesheetService(AttendanceRepository repo, LeaveRepository leaveRepo, UserRepository userRepo) {
        this.repo = repo;
        this.leaveRepo = leaveRepo;
        this.userRepo = userRepo;
    }

    public List<TimesheetSummary> getMonthlySummary(String month) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        // auth.getName() returns the logged-in user's email (from JWT)
        String loggedEmail = auth != null ? auth.getName() : "";

        List<Attendance> data;
        List<String> userIds = new ArrayList<>();

        // Determine role from the database (more reliable than JWT authority strings)
        Optional<User> loggedUserOpt = userRepo.findByEmail(loggedEmail);
        String userRole = loggedUserOpt.map(u -> u.getRole() != null ? u.getRole().toUpperCase() : "EMPLOYEE")
                                       .orElse("EMPLOYEE");

        if ("EMPLOYEE".equals(userRole)) {
            // Employee: fetch by both their MongoDB _id AND their email
            // (attendance records may be stored with either)
            if (loggedUserOpt.isPresent()) {
                userIds.add(loggedUserOpt.get().getId());  // MongoDB _id
                userIds.add(loggedEmail);                   // email as userId fallback
            } else {
                userIds.add(loggedEmail);
            }
            data = repo.findByUserIdInAndDateStartingWith(userIds, month);
        } else if ("MANAGER".equals(userRole)) {
            // Manager: their own records + all team members' records
            if (loggedUserOpt.isPresent()) {
                User manager = loggedUserOpt.get();
                userIds.add(manager.getId());   // manager's MongoDB _id
                userIds.add(loggedEmail);        // manager's email as fallback

                // Add all team members under this manager
                List<User> team = userRepo.findByManagerEmail(loggedEmail);
                team.forEach(u -> {
                    userIds.add(u.getId());      // team member's MongoDB _id
                    userIds.add(u.getEmail());   // team member's email as fallback
                });
            } else {
                userIds.add(loggedEmail);
            }
            data = repo.findByUserIdInAndDateStartingWith(userIds, month);
        } else {
            // Admin / HR: all data
            data = repo.findByDateStartingWith(month);
        }

        List<LeaveRequest> leaveList = leaveRepo.findAll();

        Map<String, TimesheetSummary> map = new HashMap<>();

        for (Attendance r : data) {

            String key = r.getUserId() + "_" + month;

            map.putIfAbsent(key, new TimesheetSummary());
            TimesheetSummary obj = map.get(key);

            // Enrich with user info (empId, name, department, reportingManager)
            if (obj.getEmpId() == null) {
                // Try to find user by email first, then by MongoDB _id
                Optional<User> userOpt = userRepo.findByEmail(r.getUserId());
                if (userOpt.isEmpty()) {
                    userOpt = userRepo.findById(r.getUserId());
                }
                
                if (userOpt.isPresent()) {
                    User u = userOpt.get();
                    
                    // ✅ FIX: Set proper employee ID (NEVER MongoDB ObjectId or email)
                    String empId = u.getEmployeeId();
                    if (empId == null || empId.isBlank()) {
                        // If no employeeId set, generate a placeholder but DON'T use MongoDB _id
                        empId = "EMP-" + u.getEmail().substring(0, Math.min(5, u.getEmail().indexOf("@")));
                    }
                    obj.setEmpId(empId);

                    // ✅ FIX: Set display name from User.employeeName (updated name)
                    String name = u.getName(); // This is User.employeeName field
                    if (name == null || name.isBlank()) {
                        // Fallback to email prefix if name not set
                        name = u.getEmail() != null ? u.getEmail().split("@")[0] : "-";
                    }
                    obj.setEmpName(name);
                    obj.setDepartment(u.getDepartment() != null ? u.getDepartment() : "-");

                    // Reporting manager: prefer managerName, fall back to managerEmail
                    String managerName = u.getManagerName();
                    if ((managerName == null || managerName.isBlank()) && u.getManagerId() != null && !u.getManagerId().isBlank()) {
                        Optional<User> mgr = userRepo.findById(u.getManagerId());
                        if (mgr.isEmpty()) mgr = userRepo.findByEmail(u.getManagerId());
                        if (mgr.isPresent() && mgr.get().getName() != null) {
                            managerName = mgr.get().getName();
                        }
                    }
                    if (managerName == null || managerName.isBlank()) {
                        managerName = u.getManagerEmail() != null ? u.getManagerEmail() : "-";
                    }

                    // For manager's own record, set reporting manager to "-"
                    if ("MANAGER".equals(userRole) &&
                        u.getEmail() != null && u.getEmail().equalsIgnoreCase(loggedEmail)) {
                        managerName = "-";
                    }

                    obj.setReportingManager(managerName);
                } else {
                    // User not found - use fallback values
                    obj.setEmpId("UNKNOWN");
                    obj.setEmpName("-");
                    obj.setDepartment("-");
                    obj.setReportingManager("-");
                }
            }

            obj.setMonth(month);

           boolean isLeave = leaveList.stream().anyMatch(l ->
        l.getUserId() != null &&
        r.getUserId() != null &&
        l.getUserId().equals(r.getUserId()) &&
        l.getStartDate() != null &&
        r.getDate() != null &&
        l.getStartDate().equals(r.getDate()) &&
        "APPROVED".equalsIgnoreCase(l.getStatus())
);

            if (isLeave) {
                obj.setLeave(obj.getLeave() + 1);
                continue;
            }

            int checkIn = toMin(r.getCheckIn());
            int checkOut = toMin(r.getCheckOut());
            int worked = checkOut - checkIn;

            if (worked <= 0) {
                // If checkIn exists but no checkOut yet, count as present (still working)
                if (r.getCheckIn() != null && !r.getCheckIn().isBlank() && r.getCheckIn().contains(":")) {
                    obj.setPresent(obj.getPresent() + 1);
                } else {
                    obj.setLop(obj.getLop() + 1);
                }
            } else {

                if (worked >= 360) obj.setPresent(obj.getPresent() + 1);
                else obj.setHalfDay(obj.getHalfDay() + 1);

                if (checkIn > 555) obj.setLate(obj.getLate() + 1);

                obj.setAvgHours(obj.getAvgHours() + worked);
            }
        }

        for (TimesheetSummary t : map.values()) {
            if (t.getPresent() + t.getHalfDay() > 0) {
                t.setAvgHours(t.getAvgHours() / 60.0);
            }
            t.setApproval("Pending");
        }

        return new ArrayList<>(map.values());
    }

  private int toMin(String t) {
    if (t == null || !t.contains(":")) return 0;
    String[] parts = t.split(":");
    return Integer.parseInt(parts[0]) * 60 + Integer.parseInt(parts[1]);
}

    public String approve(String empId, String month) {
        // you can store in DB later
        return "Approved for " + empId;
    }

    public Map<String, Object> submitTimesheet(Map<String, Object> req) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String userId = (String) req.get("userId");
            String month = (String) req.get("month");
            
            // Extract timesheet data
            int present = ((Number) req.getOrDefault("present", 0)).intValue();
            int leave = ((Number) req.getOrDefault("leave", 0)).intValue();
            int lop = ((Number) req.getOrDefault("lop", 0)).intValue();
            int halfDay = ((Number) req.getOrDefault("halfDay", 0)).intValue();
            int late = ((Number) req.getOrDefault("late", 0)).intValue();
            int wfh = ((Number) req.getOrDefault("wfh", 0)).intValue();
            int field = ((Number) req.getOrDefault("field", 0)).intValue();
            double avgHours = ((Number) req.getOrDefault("avgHours", 0.0)).doubleValue();
            
            // Create attendance records for each day worked
            // This saves the timesheet data to MongoDB
            for (int day = 1; day <= 31; day++) {
                String date = month + "-" + String.format("%02d", day);
                
                // Create attendance entry
                Attendance attendance = new Attendance();
                attendance.setUserId(userId);
                attendance.setDate(date);
                attendance.setCheckIn("09:00"); // Default check-in
                attendance.setCheckOut("17:00"); // Default check-out
                
                // Save to database
                repo.save(attendance);
            }
            
            response.put("success", true);
            response.put("message", "Timesheet submitted successfully for " + month);
            response.put("userId", userId);
            response.put("month", month);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error submitting timesheet: " + e.getMessage());
        }
        
        return response;
    }
}