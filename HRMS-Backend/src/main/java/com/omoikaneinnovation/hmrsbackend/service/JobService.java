package com.omoikaneinnovation.hmrsbackend.service;

import com.omoikaneinnovation.hmrsbackend.model.Job;
import com.omoikaneinnovation.hmrsbackend.repository.JobRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobService {

    private final JobRepository repo;

    public JobService(JobRepository repo) {
        this.repo = repo;
    }

    // CREATE
    public Job createJob(Job job) {
        // Auto-generate jobId if not provided
        if (job.getJobId() == null || job.getJobId().isEmpty()) {
            long count = repo.count() + 1;
            job.setJobId(String.format("JOB-%03d", count)); // JOB-001, JOB-002, ...
        }
        return repo.save(job);
    }

    // GET ALL
    public List<Job> getAllJobs() {
        return repo.findAll();
    }

    // UPDATE STATUS
    public Job updateStatus(String id, String status) {
        Job job = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        job.setStatus(status);
        return repo.save(job);
    }

    // FULL UPDATE — status, interview level, selection level, dates
    public Job updateJob(String id, Job updates) {
        Job job = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (updates.getStatus() != null)         job.setStatus(updates.getStatus());
        if (updates.getInterviewLevel() != null)  job.setInterviewLevel(updates.getInterviewLevel());
        if (updates.getSelectionLevel() != null)  job.setSelectionLevel(updates.getSelectionLevel());
        if (updates.getAppliedDate() != null)     job.setAppliedDate(updates.getAppliedDate());
        if (updates.getL1InterviewDate() != null) job.setL1InterviewDate(updates.getL1InterviewDate());
        if (updates.getL2InterviewDate() != null) job.setL2InterviewDate(updates.getL2InterviewDate());
        if (updates.getOfferDate() != null)       job.setOfferDate(updates.getOfferDate());
        if (updates.getOnboardingDate() != null)  job.setOnboardingDate(updates.getOnboardingDate());

        // ✅ VALIDATION LOGIC (ADD THIS)
if ("Interview Stage".equalsIgnoreCase(updates.getStatus())) {
    if (updates.getInterviewLevel() == null || updates.getInterviewLevel().isEmpty()) {
        throw new RuntimeException("Interview Level (L1/L2) is required for Interview Stage");
    }
}

if ("Selected".equalsIgnoreCase(updates.getStatus())) {
    if (updates.getSelectionLevel() == null || updates.getSelectionLevel().isEmpty()) {
        throw new RuntimeException("Selection Level (L1 Selected / L2 Selected) is required");
    }
}
        return repo.save(job);
    }
    public void deleteJob(String id) {
    repo.deleteById(id);
}
}