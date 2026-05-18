package com.omoikaneinnovation.hmrsbackend.controller;

import com.omoikaneinnovation.hmrsbackend.model.Task;
import com.omoikaneinnovation.hmrsbackend.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@CrossOrigin(originPatterns = {"http://localhost:*", "http://127.0.0.1:*", "https://*.vercel.app"})
public class TaskController {

    private final TaskService service;

    // ── CREATE (manager / admin) ──
    @PostMapping
    public Task createTask(@RequestBody Task task, Authentication auth) {
        task.setAssignedBy(auth.getName());
        return service.createTask(task);
    }

    // ── GET ALL (admin sees everything, manager sees only team tasks) ──
    @GetMapping
    public List<Task> getAllTasks(Authentication auth) {
        String userEmail = auth != null ? auth.getName() : "";
        boolean isAdmin = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        
        if (isAdmin) {
            return service.getAllTasks();
        } else {
            // Manager: only see tasks assigned to their team members
            return service.getTasksByManager(userEmail);
        }
    }

    // ── GET MY TASKS (employee sees only assigned to them) ──
    @GetMapping("/my")
    public List<Task> getMyTasks(Authentication auth) {
        return service.getTasksByAssignee(auth.getName());
    }

    // ── UPDATE (generic) ──
    @PutMapping("/{id}")
    public Task updateTask(@PathVariable String id, @RequestBody Task task) {
        return service.updateTask(id, task);
    }

    // ── ACCEPT ──
    @PutMapping("/{id}/accept")
    public Task acceptTask(@PathVariable String id) {
        return service.changeStatus(id, "ACCEPTED", "Task Accepted");
    }

    // ── REJECT (employee rejects assignment) ──
    @PutMapping("/{id}/reject")
    public Task rejectTask(@PathVariable String id, @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.getOrDefault("rejectReason", "") : "";
        return service.rejectTask(id, reason);
    }

    // ── SUBMIT (employee submits for approval) ──
    @PutMapping("/{id}/submit")
    public Task submitTask(@PathVariable String id) {
        return service.changeStatus(id, "SUBMITTED", "Task Submitted for Approval");
    }

    // ── UPDATE PROGRESS ──
    @PutMapping("/{id}/progress")
    public Task updateProgress(@PathVariable String id, @RequestBody Map<String, Integer> body) {
        int progress = body.getOrDefault("progress", 0);
        return service.updateProgress(id, progress);
    }

    // ── APPROVE (manager / admin) ──
    @PutMapping("/{id}/approve")
    public Task approveTask(@PathVariable String id) {
        return service.changeStatus(id, "COMPLETED", "Task Approved & Completed");
    }

    // ── REJECT SUBMISSION (manager sends back) ──
    @PutMapping("/{id}/reject-submission")
    public Task rejectSubmission(@PathVariable String id, @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.getOrDefault("rejectReason", "Needs revision") : "Needs revision";
        return service.rejectSubmission(id, reason);
    }
}
