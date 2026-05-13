package com.omoikaneinnovation.hmrsbackend.controller;

import com.omoikaneinnovation.hmrsbackend.model.TimesheetSummary;
import com.omoikaneinnovation.hmrsbackend.service.TimesheetService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
@RestController
@RequestMapping("/api/timesheet")
@CrossOrigin
public class TimesheetController {   // ✅ FIXED

    private final TimesheetService service;

    public TimesheetController(TimesheetService service) {  // ✅ MATCHING
        this.service = service;
    }

    @GetMapping("/monthly")
    public List<TimesheetSummary> getMonthly(@RequestParam String month) {
        return service.getMonthlySummary(month);
    }

    @PostMapping("/submit")
    public Map<String, Object> submitTimesheet(@RequestBody Map<String, Object> req) {
        return service.submitTimesheet(req);
    }

    @PutMapping("/approve")
    public String approve(@RequestBody Map<String, String> req) {
        String empId = req.get("empId");
        String month = req.get("month");

        return service.approve(empId, month);
    }
}