package com.omoikaneinnovation.hmrsbackend.service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.*;
import java.util.Optional;
import org.springframework.stereotype.Service;
import com.omoikaneinnovation.hmrsbackend.model.LeaveRequest;
import com.omoikaneinnovation.hmrsbackend.model.Attendance;
import com.omoikaneinnovation.hmrsbackend.repository.AttendanceRepository;
import com.omoikaneinnovation.hmrsbackend.repository.LeaveRepository;
import com.omoikaneinnovation.hmrsbackend.repository.UserRepository;
import com.omoikaneinnovation.hmrsbackend.dto.HomeResponse;
import com.omoikaneinnovation.hmrsbackend.model.Event;
import com.omoikaneinnovation.hmrsbackend.model.Salary;
import com.omoikaneinnovation.hmrsbackend.model.User;
import com.omoikaneinnovation.hmrsbackend.repository.EventRepository;
import com.omoikaneinnovation.hmrsbackend.repository.SalaryRepository;

import lombok.RequiredArgsConstructor;
import com.omoikaneinnovation.hmrsbackend.repository.CompanySettingsRepository;

@Service
@RequiredArgsConstructor
public class HomeService {

    private final SalaryRepository salaryRepository;
    private final EventRepository eventRepository;
    private final LeaveRepository leaveRepository;
    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;
    private final CompanySettingsRepository companySettingsRepository;

    /* =====================================================
       ENTRY METHOD CALLED FROM CONTROLLER (FIX)
    ===================================================== */
    public HomeResponse buildEmployeeHome(User user, String role) {
        return getHomeData(user.getId(), role);
    }


    /* =====================================================
       INTERNAL LOGIC
    ===================================================== */
    public HomeResponse getHomeData(String userId, String role) {
        System.out.println("🔍 HomeService: Processing userId: " + userId + ", role: " + role);

        Salary salary = salaryRepository.findByUserId(userId);
        if (salary == null) {
            System.out.println("🔍 HomeService: No salary found, creating empty salary");
            salary = new Salary();
            salary.setEarnings(List.of());
            salary.setDeductions(List.of());
        }


List<LeaveRequest> leaveList;

if (role.equalsIgnoreCase("ADMIN") || role.equalsIgnoreCase("HR")) {
    // Admin/HR sees all employees on leave
    leaveList = leaveRepository.findAll();
} 
else if (role.equalsIgnoreCase("MANAGER")) {
    // Manager sees only their team members on leave
    User manager = userRepository.findById(userId).orElse(null);
    if (manager != null && manager.getDepartment() != null) {
        // Get all users in the same department
        List<User> teamMembers = userRepository.findAll().stream()
            .filter(u -> manager.getDepartment().equals(u.getDepartment()))
            .collect(Collectors.toList());
        
        List<String> teamUserIds = teamMembers.stream()
            .map(User::getId)
            .collect(Collectors.toList());
        
        // Get leaves for team members only
        leaveList = leaveRepository.findAll().stream()
            .filter(l -> teamUserIds.contains(l.getUserId()))
            .collect(Collectors.toList());
    } else {
        leaveList = leaveRepository.findAll();
    }
} 
else {
    // Employee sees only their own leaves
    leaveList = leaveRepository.findByUserId(userId);
}

// ✅ Filter for employees currently on leave (today's date falls between start and end date)
java.time.LocalDate today = java.time.LocalDate.now();

System.out.println("🔍 HomeService: Today's date is: " + today);
System.out.println("🔍 HomeService: Total leaves to check: " + leaveList.size());

List<Map<String, Object>> leaveUsers = leaveList.stream()
    .filter(l -> {
        System.out.println("🔍 Checking leave - Status: " + l.getStatus() + 
                          ", Start: " + l.getStartDate() + 
                          ", End: " + l.getEndDate() + 
                          ", Type: " + l.getLeaveType());
        
        if (l.getStatus() == null || !l.getStatus().trim().equalsIgnoreCase("Approved")) {
            System.out.println("   ❌ Filtered out - Status not Approved");
            return false;
        }
        
        try {
            // Parse dates and check if today falls within leave period
            java.time.LocalDate startDate = java.time.LocalDate.parse(l.getStartDate());
            java.time.LocalDate endDate = java.time.LocalDate.parse(l.getEndDate());
            
            boolean isOnLeaveToday = !today.isBefore(startDate) && !today.isAfter(endDate);
            
            System.out.println("   📅 Start: " + startDate + ", End: " + endDate + 
                             ", Today: " + today + ", On leave today: " + isOnLeaveToday);
            
            if (!isOnLeaveToday) {
                System.out.println("   ❌ Filtered out - Not on leave today");
            } else {
                System.out.println("   ✅ INCLUDED - Employee is on leave today!");
            }
            
            return isOnLeaveToday;
        } catch (Exception e) {
            System.err.println("   ⚠️ Date parsing error for leave: " + e.getMessage());
            return false;
        }
    })
    .map(l -> {
        Map<String, Object> map = new HashMap<>();
        User u = userRepository.findById(l.getUserId()).orElse(null);
        
        // Try multiple name sources in order of preference
        String displayName = null;
        if (u != null && u.getName() != null && !u.getName().isEmpty() 
            && !u.getName().equals(u.getEmployeeId())) {
            displayName = u.getName();
        } else if (l.getEmployeeName() != null && !l.getEmployeeName().isEmpty()) {
            displayName = l.getEmployeeName();
        } else if (u != null && u.getEmail() != null) {
            // Use email prefix as fallback
            displayName = u.getEmail().split("@")[0];
        } else {
            displayName = l.getUserId();
        }
        
        map.put("name", displayName);
        map.put("startDate", l.getStartDate());
        map.put("endDate", l.getEndDate());
        map.put("leaveType", l.getLeaveType());
        map.put("department", u != null ? u.getDepartment() : "N/A");
        
        System.out.println("   ✅ Added to leaveUsers: " + displayName);
        return map;
    })
    .collect(Collectors.toList());

System.out.println("🔍 HomeService: Final leaveUsers count: " + leaveUsers.size());

        /* ===== MAP SALARY ITEMS ===== */
        List<HomeResponse.Item> earnings =
                salary.getEarnings()
                      .stream()
                      .map(i -> new HomeResponse.Item(i.getName(), i.getAmount()))
                      .collect(Collectors.toList());

        List<HomeResponse.Item> deductions =
                salary.getDeductions()
                      .stream()
                      .map(i -> new HomeResponse.Item(i.getName(), i.getAmount()))
                      .collect(Collectors.toList());

        HomeResponse.Salary salaryDto = new HomeResponse.Salary();
        salaryDto.setEarnings(earnings);
        salaryDto.setDeductions(deductions);

        /* ===== MAP EVENTS ===== */
        List<HomeResponse.Event> events =
                eventRepository.findAll()
                        .stream()
                       .map(e -> new HomeResponse.Event(
                           e.getId(),
                           e.getTitle(),
                           e.getDate() != null ? e.getDate().split("T")[0] : null,
                           e.getType(),
                           e.getDescription()
                       ))
                        .collect(Collectors.toList());

        System.out.println("🔍 HomeService: Found " + events.size() + " events");

        /* ===== STATS WITH EMPLOYEE COUNT ===== */
        HomeResponse.Stats stats = new HomeResponse.Stats();
        stats.setTotalDays(21);
        stats.setAvgHours(8.4);
        stats.setLeaves(2);
        
        // ✅ Calculate accurate attendance percentage for current month
        // Works for ALL roles: employee, manager, admin, hr
        java.time.LocalDate now = java.time.LocalDate.now();
        int year = now.getYear();
        int month = now.getMonthValue();
        
        // ── Load company weekly off days (configurable per company) ──
        String companyId = userRepository.findById(userId).map(User::getCompanyId).orElse(null);
        java.util.List<String> weeklyOffDays;
        if (companyId != null) {
            weeklyOffDays = companySettingsRepository.findByCompanyId(companyId)
                .map(s -> s.getWeeklyOffDays() != null ? s.getWeeklyOffDays() : java.util.Arrays.asList("SATURDAY","SUNDAY"))
                .orElse(java.util.Arrays.asList("SATURDAY","SUNDAY"));
        } else {
            // Fallback: try first settings doc, else default Sat+Sun
            weeklyOffDays = companySettingsRepository.findAll().stream().findFirst()
                .map(s -> s.getWeeklyOffDays() != null ? s.getWeeklyOffDays() : java.util.Arrays.asList("SATURDAY","SUNDAY"))
                .orElse(java.util.Arrays.asList("SATURDAY","SUNDAY"));
        }
        final java.util.List<String> finalWeeklyOffDays = weeklyOffDays;
        System.out.println("📅 Weekly off days for company " + companyId + ": " + finalWeeklyOffDays);
        
        // Get all holiday dates from events collection for this month
        java.util.Set<String> holidayDates = eventRepository.findAll().stream()
            .filter(e -> "Holiday".equalsIgnoreCase(e.getType()) && e.getDate() != null)
            .map(e -> e.getDate().length() >= 10 ? e.getDate().substring(0, 10) : e.getDate())
            .collect(java.util.stream.Collectors.toSet());
        
        // Count working days in current month up to today (exclude weekly offs + holidays)
        int workingDays = 0;
        java.time.LocalDate today2 = java.time.LocalDate.now();
        for (int d = 1; d <= today2.getDayOfMonth(); d++) {
            java.time.LocalDate date = java.time.LocalDate.of(year, month, d);
            String dayName = date.getDayOfWeek().name(); // e.g. "SATURDAY"
            if (finalWeeklyOffDays.contains(dayName)) continue;
            if (holidayDates.contains(date.toString())) continue;
            workingDays++;
        }
        
        // Get this user's attendance records for current month
        String userEmailForStats = userRepository.findById(userId).map(User::getEmail).orElse(userId);
        List<Attendance> myAttendance = attendanceRepository.findByUserId(userEmailForStats);
        if (myAttendance.isEmpty() && !userId.equals(userEmailForStats)) {
            myAttendance = attendanceRepository.findByUserId(userId);
        }
        String monthPrefix = String.format("%04d-%02d", year, month);
        java.util.Set<String> checkedInDates = myAttendance.stream()
            .filter(a -> a.getDate() != null && a.getDate().startsWith(monthPrefix))
            .filter(a -> a.getCheckIn() != null && !a.getCheckIn().equals("-"))
            .map(Attendance::getDate)
            .collect(java.util.stream.Collectors.toSet());
        
        // Get approved leave dates for this user this month
        List<LeaveRequest> myLeaves = leaveRepository.findByUserId(userId);
        java.util.Set<String> approvedLeaveDates = new java.util.HashSet<>();
        for (LeaveRequest lr : myLeaves) {
            if (!"Approved".equalsIgnoreCase(lr.getStatus())) continue;
            if (lr.getStartDate() == null || lr.getEndDate() == null) continue;
            try {
                java.time.LocalDate start = java.time.LocalDate.parse(lr.getStartDate());
                java.time.LocalDate end = java.time.LocalDate.parse(lr.getEndDate());
                java.time.LocalDate cur = start;
                while (!cur.isAfter(end)) {
                    if (cur.getYear() == year && cur.getMonthValue() == month) {
                        approvedLeaveDates.add(cur.toString());
                    }
                    cur = cur.plusDays(1);
                }
            } catch (Exception ignored) {}
        }
        
        int checkedInDays = checkedInDates.size();
        int approvedLeaveDays = (int) approvedLeaveDates.stream()
            .filter(d -> {
                try {
                    java.time.LocalDate ld = java.time.LocalDate.parse(d);
                    String dayName = ld.getDayOfWeek().name();
                    if (finalWeeklyOffDays.contains(dayName)) return false;
                    if (holidayDates.contains(d)) return false;
                    return true;
                } catch (Exception e) { return false; }
            }).count();
        int absentDays = Math.max(0, workingDays - checkedInDays - approvedLeaveDays);
        double attendancePct = workingDays > 0
            ? Math.round((checkedInDays * 100.0 / workingDays) * 10.0) / 10.0
            : 0.0;
        
        stats.setWorkingDays(workingDays);
        stats.setCheckedInDays(checkedInDays);
        stats.setApprovedLeaveDays(approvedLeaveDays);
        stats.setAbsentDays(absentDays);
        stats.setAttendancePercentage(attendancePct);
        stats.setPresentDays(checkedInDays);
        stats.setLeaveTaken(approvedLeaveDays);
        
        System.out.println("📊 Attendance stats for " + userEmailForStats + 
            ": workingDays=" + workingDays + 
            ", checkedIn=" + checkedInDays + 
            ", leaves=" + approvedLeaveDays + 
            ", absent=" + absentDays + 
            ", pct=" + attendancePct + "%");
        
        // Add employee counts for admin/HR roles
        if (role.equalsIgnoreCase("ADMIN") || role.equalsIgnoreCase("HR") || role.equalsIgnoreCase("MANAGER")) {
            System.out.println("🔍 HomeService: Admin/HR role detected, fetching employee counts");
            List<User> allUsers = userRepository.findAll();
            long totalEmployees = allUsers.size();
            long activeEmployees = allUsers.stream()
                .filter(u -> "ACTIVE".equalsIgnoreCase(u.getStatus()))
                .count();
            
            System.out.println("🔍 HomeService: Total users: " + totalEmployees + ", Active: " + activeEmployees);
            
            stats.setTotalEmployees((int) totalEmployees);
            stats.setActiveEmployees((int) activeEmployees);
            
            // ✅ Add leave pending count for admin
            List<LeaveRequest> allLeaves = leaveRepository.findAll();
            long leavePending = allLeaves.stream()
                .filter(l -> "Pending".equalsIgnoreCase(l.getStatus()))
                .count();
            stats.setLeavePending((int) leavePending);
            System.out.println("🔍 HomeService: Pending leaves: " + leavePending);
            
            // ✅ Add payroll total for admin
            List<Salary> allSalaries = salaryRepository.findAll();
            double payrollTotal = allSalaries.stream()
                .mapToDouble(s -> {
                    double totalEarnings = s.getEarnings() != null ? 
                        s.getEarnings().stream().mapToDouble(Salary.Item::getAmount).sum() : 0;
                    double totalDeductions = s.getDeductions() != null ? 
                        s.getDeductions().stream().mapToDouble(Salary.Item::getAmount).sum() : 0;
                    return totalEarnings - totalDeductions;
                })
                .sum();
            stats.setPayrollTotal(payrollTotal);
            System.out.println("🔍 HomeService: Payroll total: " + payrollTotal);
        } else {
            System.out.println("🔍 HomeService: Employee role, skipping employee counts");
        }

        // Resolve the user's email for attendance lookup (attendance stores email as userId)
        String userEmail = userRepository.findById(userId)
            .map(User::getEmail)
            .orElse(userId);

        List<Map<String, Object>> attendanceGraph = buildAttendanceGraph(userId, userEmail, role);
        List<Map<String, Object>> leaveGraph = buildLeaveGraph(userId, role);

        System.out.println("🔍 HomeService: Built attendance graph with " + attendanceGraph.size() + " entries");
        System.out.println("🔍 HomeService: Built leave graph with " + leaveGraph.size() + " entries");

        HomeResponse response = new HomeResponse();
        response.setStats(stats);
        response.setSalary(salaryDto);
        response.setEvents(events);
        response.setAttendanceGraph(attendanceGraph);
        response.setLeaveGraph(leaveGraph);
        response.setLeaveUsers(leaveUsers);
        response.setWeeklyOffDays(finalWeeklyOffDays);

        System.out.println("🔍 HomeService: Response created successfully");
        return response;
    }

    private List<Map<String, Object>> buildAttendanceGraph(String userId, String userEmail, String role) {

        // For admin/HR/manager: show all attendance data aggregated
        // For employee: show only their own attendance
        List<Attendance> list;
        if (role.equalsIgnoreCase("ADMIN") || role.equalsIgnoreCase("HR")) {
            list = new ArrayList<>(attendanceRepository.findAll());
        } else {
            // Attendance records store userId as email. Try both the raw userId and email.
            list = new ArrayList<>(attendanceRepository.findByUserId(userEmail));
            if (list.isEmpty() && !userId.equals(userEmail)) {
                list.addAll(attendanceRepository.findByUserId(userId));
            }
        }

        Map<String, Map<String, Integer>> monthly = new HashMap<>();

        for (Attendance a : list) {

           if (a.getDate() == null) continue;
           String month = a.getDate().substring(0, 7);

            monthly.putIfAbsent(month, new HashMap<>());

            Map<String, Integer> m = monthly.get(month);

            m.put("present", m.getOrDefault("present", 0));
            m.put("leave", m.getOrDefault("leave", 0));
            m.put("absent", m.getOrDefault("absent", 0));

            if (a.getCheckIn() != null && !a.getCheckIn().equals("-")) {
                m.put("present", m.get("present") + 1);
            } else {
                m.put("absent", m.get("absent") + 1);
            }
        }

        List<Map<String, Object>> result = new ArrayList<>();

        for (String month : monthly.keySet()) {

            Map<String, Integer> m = monthly.get(month);

            Map<String, Object> obj = new HashMap<>();
            obj.put("month", month);
            obj.put("present", m.get("present"));
            obj.put("leave", m.get("leave"));
            obj.put("absent", m.get("absent"));

            result.add(obj);
        }

        return result;
    }
    
    private List<Map<String, Object>> buildLeaveGraph(String userId, String role) {

       List<LeaveRequest> leaves;

        if (role.equalsIgnoreCase("ADMIN") || role.equalsIgnoreCase("HR") || role.equalsIgnoreCase("MANAGER")) {
            leaves = leaveRepository.findAll();
        } 
        else {
            leaves = leaveRepository.findByUserId(userId);
        }

        Map<String, Map<String, Integer>> data = new LinkedHashMap<>();

        for (LeaveRequest l : leaves) {

            if (l.getStartDate() == null) continue;
            String month = l.getStartDate().substring(0, 7);

            data.putIfAbsent(month, new HashMap<>());

            Map<String, Integer> m = data.get(month);

            m.put("approved", m.getOrDefault("approved", 0));
            m.put("pending", m.getOrDefault("pending", 0));
            m.put("rejected", m.getOrDefault("rejected", 0));

           String status = l.getStatus();

            if (status.equalsIgnoreCase("Approved")) {
                m.put("approved", m.getOrDefault("approved", 0) + 1);
            } else if (status.equalsIgnoreCase("Pending")) {
                m.put("pending", m.getOrDefault("pending", 0) + 1);
            } else {
                m.put("rejected", m.getOrDefault("rejected", 0) + 1);
            }
        }

        List<Map<String, Object>> result = new ArrayList<>();

        for (String month : data.keySet()) {
            Map<String, Object> obj = new HashMap<>();
            obj.put("month", month);
            obj.putAll(data.get(month));
            result.add(obj);
        }

        return result;
    }
}

