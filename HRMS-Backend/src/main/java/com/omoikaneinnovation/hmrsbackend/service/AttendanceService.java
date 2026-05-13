    package com.omoikaneinnovation.hmrsbackend.service;

    import com.omoikaneinnovation.hmrsbackend.dto.AttendanceDTO;
    import com.omoikaneinnovation.hmrsbackend.model.Attendance;
    import com.omoikaneinnovation.hmrsbackend.model.Employee;
    import com.omoikaneinnovation.hmrsbackend.model.User;
    import com.omoikaneinnovation.hmrsbackend.repository.AttendanceRepository;
    import com.omoikaneinnovation.hmrsbackend.repository.EmployeeRepository;
    import com.omoikaneinnovation.hmrsbackend.repository.UserRepository;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.web.client.RestTemplate;
    import org.springframework.stereotype.Service;
    import org.springframework.scheduling.annotation.Scheduled;
    import java.time.Duration;
    import java.time.LocalDate;
    import java.time.LocalTime;
    import java.util.List;
    import java.util.Optional;
    import java.util.stream.Collectors;
    import java.util.Map;
    import java.util.HashMap;
    import java.util.ArrayList;

    @Service
    public class AttendanceService {

        @Autowired
        private AttendanceRepository attendanceRepo;

        @Autowired
        private UserRepository userRepo;

        @Autowired
        private EmployeeRepository employeeRepo;

       @Autowired
private RestTemplate restTemplate;

        public String checkIn(String userId) {
            return checkIn(userId, null);
        }

        public String checkIn(String userId, Map<String, String> payload) {
            String today = LocalDate.now().toString();
            String date = (payload != null && payload.get("date") != null) ? payload.get("date") : today;

            // Normalize userId: if it looks like an email, find the user and get their ID
            String normalizedUserId = userId;
            if (userId != null && userId.contains("@")) {
                Optional<User> userOpt = userRepo.findByEmail(userId);
                if (userOpt.isPresent()) {
                    normalizedUserId = userOpt.get().getId();
                }
            }

            Attendance existing = attendanceRepo.findByUserIdAndDate(normalizedUserId, date);

            if (existing != null) {
                return "Already checked in for this date";
            }

            Attendance attendance = new Attendance();
            attendance.setUserId(normalizedUserId);
            attendance.setDate(date);
            attendance.setCheckIn(LocalTime.now().toString());

            // Set additional fields from payload
            if (payload != null) {
                attendance.setEmpId(payload.get("empId"));
                attendance.setName(payload.get("name"));
                attendance.setDepartment(payload.get("department"));
                attendance.setLocationIn(payload.get("locationIn"));
                attendance.setReportingManager(payload.get("reportingManager"));
                attendance.setManagerId(payload.get("managerId"));
                attendance.setManagerEmail(payload.get("managerEmail"));
                attendance.setTos(payload.get("tos"));
                attendance.setAttendanceType(payload.get("attendanceType") != null ? payload.get("attendanceType") : "Office");
                attendance.setStatus(payload.get("status") != null ? payload.get("status") : "Pending Approval");
                
                // Calculate late status
                String checkInTime = attendance.getCheckIn();
                if (checkInTime != null) {
                    int hour = Integer.parseInt(checkInTime.split(":")[0]);
                    attendance.setLate(hour > 9 ? "Yes" : "No");
                }
            }

            attendanceRepo.save(attendance);
            return "Check-in successful";
        }

        public String checkOut(String userId, String date) {
            return checkOut(userId, date, null);
        }

        public String checkOut(String userId, String date, Map<String, String> payload) {

            // Normalize userId: if it looks like an email, find the user and get their ID
            String normalizedUserId = userId;
            if (userId != null && userId.contains("@")) {
                Optional<User> userOpt = userRepo.findByEmail(userId);
                if (userOpt.isPresent()) {
                    normalizedUserId = userOpt.get().getId();
                }
            }

            // Use the passed date if provided, otherwise fall back to today
            String lookupDate = (date != null && !date.isBlank()) ? date : LocalDate.now().toString();

            Attendance attendance =
                    attendanceRepo.findByUserIdAndDate(normalizedUserId, lookupDate);

            if (attendance == null) {
                return "Check-in not found";
            }

            String checkOutTime = LocalTime.now().toString();
            attendance.setCheckOut(checkOutTime);

            LocalTime in = LocalTime.parse(attendance.getCheckIn());
            LocalTime out = LocalTime.parse(checkOutTime);

            int minutes = (int) Duration.between(in, out).toMinutes();
            attendance.setWorkedMinutes(minutes);

            // Calculate early leave (before 18:00)
            int outHour = out.getHour();
            attendance.setEarlyLeave(outHour < 18 ? "Yes" : "No");
            attendance.setStatus("Pending Approval");

            // Update location out if provided
            if (payload != null && payload.get("locationOut") != null) {
                attendance.setLocationOut(payload.get("locationOut"));
            }

            attendanceRepo.save(attendance);

            return "Check-out successful";
        }

     public List<AttendanceDTO> getManagerAttendance(String managerEmail) {

    // Get all users under this manager
    List<User> team = userRepo.findByManagerEmail(managerEmail);

    List<String> userIds = new ArrayList<>();
    team.forEach(u -> userIds.add(u.getId()));

    // Also include the manager's own records
    Optional<User> managerOpt = userRepo.findByEmail(managerEmail);
    if (managerOpt.isPresent()) {
        User manager = managerOpt.get();
        String managerId = manager.getId();
        if (!userIds.contains(managerId)) {
            userIds.add(managerId);
        }
    }

    // If no userIds found, return empty list
    if (userIds.isEmpty()) {
        return new ArrayList<>();
    }

    List<Attendance> records = attendanceRepo.findByUserIdIn(userIds);

    // Enrich each record with proper employee details
    return records.stream()
            .map(att -> {
                AttendanceDTO dto = enrichAttendance(att);
                
                // If this is the manager's own record, ensure it has the manager's details
                if (managerOpt.isPresent() && att.getUserId().equals(managerOpt.get().getId())) {
                    User manager = managerOpt.get();
                    // Always use manager's details for their own record
                    dto.setName(manager.getName() != null ? manager.getName() : manager.getEmail());
                    dto.setEmpId(manager.getEmployeeId() != null ? manager.getEmployeeId() : "MGR-" + manager.getId().substring(0, 6));
                    dto.setDepartment(manager.getDepartment() != null ? manager.getDepartment() : "Management");
                    dto.setReportingManager("-"); // Manager has no reporting manager
                }
                
                return dto;
            })
            .collect(Collectors.toList());
}
        public List<AttendanceDTO> getMyAttendance(String userId) {

    if (userId == null || userId.isBlank()) {
        return List.of();
    }

    List<Attendance> records = attendanceRepo.findByUserId(userId);

    return records.stream()
            .map(this::enrichAttendance)
            .collect(Collectors.toList());
}

public List<Attendance> getByUserId(String userId) {
    return attendanceRepo.findByUserId(userId);
}

public Attendance getByUserIdAndDate(String userId, String date) {
    return attendanceRepo.findByUserIdAndDate(userId, date);
}

        public List<AttendanceDTO> getAllAttendance() {
            List<Attendance> records = attendanceRepo.findAll();
            return records.stream().map(r -> enrichAttendance(r)).collect(Collectors.toList());
        }

        /**
         * Enrich an Attendance record with user info (empId, name, dept, reportingManager)
         * Resolution order for empId:
         *   1. user.employeeId (set on User document)
         *   2. employee.employeeId (from Employee collection, linked by userId)
         *   3. employee.employeeId (from Employee collection, linked by email)
         *   4. raw userId as last resort
         */
       private AttendanceDTO enrichAttendance(Attendance a) {
    AttendanceDTO dto = new AttendanceDTO();
    dto.setId(a.getId());
    dto.setUserId(a.getUserId());
    dto.setDate(a.getDate());
    dto.setCheckIn(a.getCheckIn());
    dto.setCheckOut(a.getCheckOut());
    dto.setWorkedMinutes(a.getWorkedMinutes());
    
    // Use stored fields if available, otherwise enrich from User/Employee
    dto.setEmpId(a.getEmpId());
    dto.setName(a.getName());
    dto.setDepartment(a.getDepartment());
    dto.setReportingManager(a.getReportingManager());
    dto.setManagerId(a.getManagerId());
    dto.setManagerEmail(a.getManagerEmail());
    dto.setLocationIn(a.getLocationIn());
    dto.setLocationOut(a.getLocationOut());
    dto.setStatus(a.getStatus());
    dto.setAttendanceType(a.getAttendanceType());
    dto.setLate(a.getLate());
    dto.setEarlyLeave(a.getEarlyLeave());
    dto.setTos(a.getTos());

    // Enrich missing fields from User/Employee if needed
    if ((dto.getEmpId() == null || dto.getName() == null) && a.getUserId() != null) {
        Optional<User> userOpt = Optional.empty();

        if (a.getUserId() != null && !a.getUserId().isBlank()) {
            userOpt = userRepo.findById(a.getUserId());

            if (userOpt.isEmpty()) {
                userOpt = userRepo.findByEmail(a.getUserId());
            }

            if (userOpt.isEmpty()) {
                userOpt = userRepo.findAll().stream()
                        .filter(u -> a.getUserId().equals(u.getEmployeeId()))
                        .findFirst();
            }
        }

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            if (dto.getManagerId() == null || dto.getManagerId().isEmpty()) {
                dto.setManagerId(user.getManagerEmail() != null ? user.getManagerEmail() : "-");
            }

            if (dto.getManagerEmail() == null || dto.getManagerEmail().isEmpty()) {
                dto.setManagerEmail(user.getManagerEmail() != null ? user.getManagerEmail() : "-");
            }

            // Resolve display name
            if (dto.getName() == null || dto.getName().isEmpty()) {
                String resolvedName = user.getName();
                if (resolvedName == null || resolvedName.isBlank()) {
                    resolvedName = user.getEmail() != null
                        ? user.getEmail().split("@")[0]
                        : "-";
                }
                if (resolvedName == null || resolvedName.isBlank() || resolvedName.equals(user.getEmail())) {
                    resolvedName = user.getEmail() != null
                        ? user.getEmail().split("@")[0]
                        : "-";
                    if (!resolvedName.isEmpty() && !resolvedName.equals("-")) {
                        resolvedName = Character.toUpperCase(resolvedName.charAt(0)) + resolvedName.substring(1);
                    }
                }
                dto.setName(resolvedName);
            }

            if (dto.getDepartment() == null || dto.getDepartment().isEmpty()) {
                dto.setDepartment(user.getDepartment() != null ? user.getDepartment() : "-");
            }

            // Resolve reporting manager
            if (dto.getReportingManager() == null || dto.getReportingManager().isEmpty()) {
                String reportingManager = user.getManagerName();
                if ((reportingManager == null || reportingManager.isBlank()) && user.getManagerId() != null && !user.getManagerId().isBlank()) {
                    Optional<User> managerOpt = userRepo.findById(user.getManagerId());
                    if (managerOpt.isEmpty()) {
                        managerOpt = userRepo.findByEmail(user.getManagerId());
                    }
                    if (managerOpt.isPresent() && managerOpt.get().getName() != null) {
                        reportingManager = managerOpt.get().getName();
                    }
                }
                if (reportingManager == null || reportingManager.isBlank()) {
                    reportingManager = user.getManagerEmail() != null ? user.getManagerEmail() : "-";
                }
                dto.setReportingManager(reportingManager);
            }

            // Resolve empId
            if (dto.getEmpId() == null || dto.getEmpId().isEmpty()) {
                String resolvedEmpId = user.getEmployeeId();

                if (resolvedEmpId == null || resolvedEmpId.isBlank()) {
                    resolvedEmpId = user.getEmployeeId() != null
                        ? user.getEmployeeId()
                        : user.getId();
                }

                if (resolvedEmpId == null || resolvedEmpId.isBlank()) {
                    Optional<Employee> empByUserId = employeeRepo.findByUserId(a.getUserId());
                    if (empByUserId.isPresent()) {
                        resolvedEmpId = empByUserId.get().getEmployeeId();
                    }
                }

                if (resolvedEmpId == null || resolvedEmpId.isBlank()) {
                    Optional<Employee> empByEmail = employeeRepo.findByEmail(user.getEmail());
                    if (empByEmail.isPresent()) {
                        resolvedEmpId = empByEmail.get().getEmployeeId();
                    }
                }

                if (resolvedEmpId == null || resolvedEmpId.isBlank()) {
                    String rawId = user.getId() != null ? user.getId() : "";
                    resolvedEmpId = "EMP" + rawId.replaceAll("[^a-zA-Z0-9]", "").toUpperCase()
                        .substring(Math.max(0, rawId.length() - 6));
                }
                dto.setEmpId(resolvedEmpId);
            }
        } else {
            if (dto.getEmpId() == null || dto.getEmpId().isEmpty()) {
                dto.setEmpId(a.getUserId());
            }
            if (dto.getName() == null || dto.getName().isEmpty()) {
                dto.setName("-");
            }
            if (dto.getDepartment() == null || dto.getDepartment().isEmpty()) {
                dto.setDepartment("-");
            }
            if (dto.getReportingManager() == null || dto.getReportingManager().isEmpty()) {
                dto.setReportingManager("-");
            }
            if (dto.getManagerId() == null || dto.getManagerId().isEmpty()) {
                dto.setManagerId("-");
            }
        }
    }

    // Set defaults for null fields
    if (dto.getEmpId() == null) dto.setEmpId("-");
    if (dto.getName() == null) dto.setName("-");
    if (dto.getDepartment() == null) dto.setDepartment("-");
    if (dto.getReportingManager() == null) dto.setReportingManager("-");
    if (dto.getManagerId() == null) dto.setManagerId("-");
    if (dto.getManagerEmail() == null) dto.setManagerEmail("-");
    if (dto.getLocationIn() == null) dto.setLocationIn("-");
    if (dto.getLocationOut() == null) dto.setLocationOut("-");
    if (dto.getStatus() == null) dto.setStatus("Pending Approval");
    if (dto.getAttendanceType() == null) dto.setAttendanceType("Office");
    if (dto.getLate() == null) dto.setLate("No");
    if (dto.getEarlyLeave() == null) dto.setEarlyLeave("-");
    if (dto.getTos() == null) dto.setTos("-");

    return dto;
}

@Scheduled(cron = "0 59 23 * * *")
public void checkMissedCheckouts() {

    String today = LocalDate.now().toString();

    List<Attendance> records = attendanceRepo.findAll();

    for (Attendance a : records) {

        // only today records
        if (!today.equals(a.getDate())) continue;

        // already checked-in but NOT checked-out
       if (a.getCheckIn() != null && a.getCheckOut() == null) {

    Map<String, Object> notification = new HashMap<>();

    notification.put("message", "User " + a.getUserId() + " missed checkout today");
    notification.put("type", "warning");
    notification.put("userId", a.getUserId());
    notification.put("date", today);

    try {
    restTemplate.postForObject(
        "http://localhost:8082/api/notifications",
        notification,
        String.class
    );
} catch (Exception e) {
    System.out.println("Notification service not available");
}
}
    }
}
    }
