package com.omoikaneinnovation.hmrsbackend.dto;

import java.util.List;
import lombok.Data;
import lombok.AllArgsConstructor;
    import com.omoikaneinnovation.hmrsbackend.dto.HomeResponse;
import com.omoikaneinnovation.hmrsbackend.dto.HomeResponse.Salary;
import com.omoikaneinnovation.hmrsbackend.dto.HomeResponse.Stats;
import com.omoikaneinnovation.hmrsbackend.dto.HomeResponse.Event;
import lombok.NoArgsConstructor;
import java.util.Map;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class HomeResponse {

    private Stats stats;
   private com.omoikaneinnovation.hmrsbackend.dto.HomeResponse.Salary salary;
    private List<Event> events;
    //List<Map<String, Object>> attendanceGraph
    private List<Map<String, Object>> attendanceGraph;
private List<Map<String, Object>> leaveGraph;
private List<Map<String, Object>> leaveUsers;
// ✅ Weekly off days configured by admin (e.g. ["SATURDAY","SUNDAY"])
private List<String> weeklyOffDays;

public List<Map<String, Object>> getLeaveUsers() {
    return leaveUsers;
}

public void setLeaveUsers(List<Map<String, Object>> leaveUsers) {
    this.leaveUsers = leaveUsers;
}
    /* ================= STATS ================= */
  @Data
@AllArgsConstructor
@NoArgsConstructor
public static class Stats {

    // ✅ existing fields (keep as-is)
    private int presentDays;
    private double avgHours;
    private int leaveTaken;

    // ✅ ADD THESE (for service compatibility)
    private int totalDays;
    private int leaves;
    
    // ✅ NEW: Employee count fields for admin dashboard
    private int totalEmployees;
    private int activeEmployees;
    
    // ✅ NEW: Leave and Payroll KPI fields
    private int leavePending;
    private double payrollTotal;

    // ✅ NEW: Accurate attendance fields (working days aware)
    private int workingDays;        // total working days this month (excl. weekends + holidays)
    private int checkedInDays;      // days user actually checked in
    private int absentDays;         // working days with no check-in and no approved leave
    private int approvedLeaveDays;  // approved leave days this month
    private double attendancePercentage; // (checkedInDays / workingDays) * 100
}
    /* ================= SALARY ================= */
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Salary {
        private List<Item> earnings;
        private List<Item> deductions;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Item {
        private String name;
        private double amount;
    }

    /* ================= EVENTS ================= */
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Event {
        private String id;
        private String title;
        private String date;
        private String type;
        private String description;
    }
}
