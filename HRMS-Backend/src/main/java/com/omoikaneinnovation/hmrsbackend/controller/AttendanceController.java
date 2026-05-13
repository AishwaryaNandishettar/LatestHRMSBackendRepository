package com.omoikaneinnovation.hmrsbackend.controller;
import com.omoikaneinnovation.hmrsbackend.dto.AttendanceDTO;
import com.omoikaneinnovation.hmrsbackend.model.Attendance;
import com.omoikaneinnovation.hmrsbackend.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @PostMapping("/checkin")
    public String checkIn(@RequestBody Map<String,String> payload){
        String userId = payload.get("userId");
        return attendanceService.checkIn(userId, payload);
    }

    @PostMapping("/checkout")
    public String checkOut(@RequestBody Map<String,String> payload){
        String userId = payload.get("userId");
        String date = payload.get("date");
        
        return attendanceService.checkOut(userId, date, payload);
    }



@GetMapping("/manager")
public List<AttendanceDTO> getManagerAttendance(@RequestParam String email) {
    return attendanceService.getManagerAttendance(email);
}

@GetMapping("/attendance/{userId}")
public List<Attendance> getByUser(@PathVariable String userId) {
    return attendanceService.getByUserId(userId);
}

    @GetMapping("/my/{userId}")
    public List<AttendanceDTO> myAttendance(@PathVariable String userId){

        return attendanceService.getMyAttendance(userId);
    }

    @GetMapping("/all")
    public List<AttendanceDTO> getAllAttendance() {
        return attendanceService.getAllAttendance();
    }
}