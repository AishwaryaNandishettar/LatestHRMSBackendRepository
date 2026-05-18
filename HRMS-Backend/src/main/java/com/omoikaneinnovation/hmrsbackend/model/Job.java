package com.omoikaneinnovation.hmrsbackend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "jobs")
public class Job {

    @Id
    private String id;

    private String jobId; // Auto-generated unique ID e.g. JOB-001

    private String jobTitle;
    private String postedDate;
    private String department;
    private String experience;
    private double salary;
    private String description;
    private String status; // Open / Closed / Interview Stage
private int applicants;
private String location;
private String jobType;       // Full-time / Part-time / Contract / Internship
private String workMode;      // On-site / Remote / Hybrid
private String noticePeriod;  // Immediate / 15 days / 30 days / 60 days / 90 days
private String designation;
private String ctc;
private String pf;
private String uan;
private String esic;

// ── HIRING PIPELINE DATES ──
private String appliedDate;       // Date candidate applied
private String l1InterviewDate;   // L1 interview scheduled date
private String l2InterviewDate;   // L2 interview scheduled date
private String offerDate;         // Offer letter sent date
private String onboardingDate;    // Joining / onboarding date

// ── INTERVIEW LEVEL ──
private String interviewLevel;    // L1 / L2 (when status = Interview Stage)
private String selectionLevel;    // L1 Selected / L2 Selected (when status = Selected)

    // Constructors
    public Job() {}

    public Job(String jobTitle, String department, String experience, double salary, String description, String status) {
        this.jobTitle = jobTitle;
        this.department = department;
        this.experience = experience;
        this.salary = salary;
        this.description = description;
        this.status = status;
    }

    // Getters & Setters
    public String getId() { return id; }
    public void setId(String id) {
    this.id = id;
}

public String getJobId() { return jobId; }
public void setJobId(String jobId) { this.jobId = jobId; }

public int getApplicants() {
    return applicants;
}

public void setApplicants(int applicants) {
    this.applicants = applicants;
}

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }

    public double getSalary() { return salary; }
    public void setSalary(double salary) { this.salary = salary; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    // POSTED DATE
public String getPostedDate() {
    return postedDate;
}

public void setPostedDate(String postedDate) {
    this.postedDate = postedDate;
}

// LOCATION
public String getLocation() { return location; }
public void setLocation(String location) { this.location = location; }

// JOB TYPE
public String getJobType() { return jobType; }
public void setJobType(String jobType) { this.jobType = jobType; }

// WORK MODE
public String getWorkMode() { return workMode; }
public void setWorkMode(String workMode) { this.workMode = workMode; }

// NOTICE PERIOD
public String getNoticePeriod() { return noticePeriod; }
public void setNoticePeriod(String noticePeriod) { this.noticePeriod = noticePeriod; }

// DESIGNATION
public String getDesignation() {
    return designation;
}

public void setDesignation(String designation) {
    this.designation = designation;
}

// CTC
public String getCtc() {
    return ctc;
}

public void setCtc(String ctc) {
    this.ctc = ctc;
}

// PF - PROVIDENT FUND
public String getPf() {
    return pf;
}

public void setPf(String pf) {
    this.pf = pf;
}

// UAN - UNIVERSAL ACCOUNT NUMBER
public String getUan() {
    return uan;
}

public void setUan(String uan) {
    this.uan = uan;
}

// ESIC - EMPLOYEES' STATE INSURANCE CODE
public String getEsic() {
    return esic;
}

public void setEsic(String esic) {
    this.esic = esic;
}

// ── HIRING PIPELINE DATES ──
public String getAppliedDate() { return appliedDate; }
public void setAppliedDate(String appliedDate) { this.appliedDate = appliedDate; }

public String getL1InterviewDate() { return l1InterviewDate; }
public void setL1InterviewDate(String l1InterviewDate) { this.l1InterviewDate = l1InterviewDate; }

public String getL2InterviewDate() { return l2InterviewDate; }
public void setL2InterviewDate(String l2InterviewDate) { this.l2InterviewDate = l2InterviewDate; }

public String getOfferDate() { return offerDate; }
public void setOfferDate(String offerDate) { this.offerDate = offerDate; }

public String getOnboardingDate() { return onboardingDate; }
public void setOnboardingDate(String onboardingDate) { this.onboardingDate = onboardingDate; }

// ── INTERVIEW / SELECTION LEVEL ──
public String getInterviewLevel() { return interviewLevel; }
public void setInterviewLevel(String interviewLevel) { this.interviewLevel = interviewLevel; }

public String getSelectionLevel() { return selectionLevel; }
public void setSelectionLevel(String selectionLevel) { this.selectionLevel = selectionLevel; }
}