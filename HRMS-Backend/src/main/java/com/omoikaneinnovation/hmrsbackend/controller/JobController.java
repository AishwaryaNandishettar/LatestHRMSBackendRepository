package com.omoikaneinnovation.hmrsbackend.controller;

import com.omoikaneinnovation.hmrsbackend.model.Job;
import com.omoikaneinnovation.hmrsbackend.service.JobService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(originPatterns = {"http://localhost:*", "https://*.ngrok-free.dev"})
public class JobController {

    private final JobService service;

    public JobController(JobService service) {
        this.service = service;
    }

    // CREATE JOB
    @PostMapping("/create")
    public Job createJob(@RequestBody Job job) {
        return service.createJob(job);
    }

    // GET ALL JOBS
    @GetMapping("/all")
    public List<Job> getAllJobs() {
        return service.getAllJobs();
    }

    // UPDATE STATUS
    @PutMapping("/status/{id}")
    public Job updateStatus(@PathVariable String id,
                            @RequestParam String status) {
        return service.updateStatus(id, status);
    }

    // FULL UPDATE (status + level + dates)
    @PutMapping("/update/{id}")
    public Job updateJob(@PathVariable String id, @RequestBody Job updates) {
        return service.updateJob(id, updates);
    }

    @DeleteMapping("/{id}")
    public void deleteJob(@PathVariable String id) {
        service.deleteJob(id);
    }
}