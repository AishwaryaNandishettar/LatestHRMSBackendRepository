package com.omoikaneinnovation.hmrsbackend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import org.springframework.data.mongodb.core.index.Indexed;

@Document(collection = "employees")
public class Employee {

    @Id
    private String id;
     @Indexed(unique = true)
    private String employeeId;
    private String fullName;
    private String email;
    private String department;
    private String designation;
    private String joiningDate;
    private String doj;  // ✅ ADD THIS (alias for joiningDate)
private String dob;
    private String userId;
    private String companyId;
    private String status; // INVITED, ACTIVE, DISABLED
    private Instant createdAt = Instant.now();
    private String managerEmail;
    private String manager;  // ✅ ADD THIS (manager name)
    private String location;  // ✅ ADD THIS (work location)
    private String exitDate;  // ✅ ADD THIS (exit date)
    private String image;  // ✅ ADD THIS (profile image)
    private String tenure;  // ✅ ADD THIS (tenure in years)
    private String ctc;  // ✅ ADD THIS (cost to company)
    private String hikeValue;  // ✅ ADD THIS (hike value)
    private String hikePercent;  // ✅ ADD THIS (hike percentage)
    private String hikeYear;  // ✅ ADD THIS (hike year)
    private String incrementLetter;  // ✅ ADD THIS (increment letter status)

    // ── New statutory / bank fields ──
    private String bankAccountNumber;
    private String ifsc;
    private String uan;
    private String pfMemberId;
    private String pf;
    private String esic;
    private String designationChanged;
    private String designationChangedDate;


    public String getManagerEmail() {
    return managerEmail;
}

public void setManagerEmail(String managerEmail) {
    this.managerEmail = managerEmail;
}

    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }

    public String getEmployeeId() {
        return employeeId;
    }
    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public String getFullName() {
        return fullName;
    }
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

public String getCompanyId() {
    return companyId;
}

public void setCompanyId(String companyId) {
    this.companyId = companyId;
}
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }

    public String getDepartment() {
        return department;
    }
    public void setDepartment(String department) {
        this.department = department;
    }

    public String getDesignation() {
        return designation;
    }
    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public String getJoiningDate() {
        return joiningDate;
    }
    public void setJoiningDate(String joiningDate) {
        this.joiningDate = joiningDate;
    }

    public String getDob() {
    return dob;
}

public void setDob(String dob) {
    this.dob = dob;
}

    public String getUserId() {
        return userId;
    }
    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    // ✅ ADD GETTERS AND SETTERS FOR NEW FIELDS
    public String getDoj() {
        return doj != null ? doj : joiningDate;  // Fallback to joiningDate
    }
    public void setDoj(String doj) {
        this.doj = doj;
    }

    public String getManager() {
        return manager;
    }
    public void setManager(String manager) {
        this.manager = manager;
    }

    public String getLocation() {
        return location;
    }
    public void setLocation(String location) {
        this.location = location;
    }

    public String getExitDate() {
        return exitDate;
    }
    public void setExitDate(String exitDate) {
        this.exitDate = exitDate;
    }

    public String getImage() {
        return image;
    }
    public void setImage(String image) {
        this.image = image;
    }

    public String getTenure() {
        return tenure;
    }
    public void setTenure(String tenure) {
        this.tenure = tenure;
    }

    public String getCtc() {
        return ctc;
    }
    public void setCtc(String ctc) {
        this.ctc = ctc;
    }

    public String getHikeValue() {
        return hikeValue;
    }
    public void setHikeValue(String hikeValue) {
        this.hikeValue = hikeValue;
    }

    public String getHikePercent() {
        return hikePercent;
    }
    public void setHikePercent(String hikePercent) {
        this.hikePercent = hikePercent;
    }

    public String getHikeYear() {
        return hikeYear;
    }
    public void setHikeYear(String hikeYear) {
        this.hikeYear = hikeYear;
    }

    public String getIncrementLetter() {
        return incrementLetter;
    }
    public void setIncrementLetter(String incrementLetter) {
        this.incrementLetter = incrementLetter;
    }

    // ── New statutory / bank fields ──
    public String getBankAccountNumber() { return bankAccountNumber; }
    public void setBankAccountNumber(String bankAccountNumber) { this.bankAccountNumber = bankAccountNumber; }

    public String getIfsc() { return ifsc; }
    public void setIfsc(String ifsc) { this.ifsc = ifsc; }

    public String getUan() { return uan; }
    public void setUan(String uan) { this.uan = uan; }

    public String getPfMemberId() { return pfMemberId; }
    public void setPfMemberId(String pfMemberId) { this.pfMemberId = pfMemberId; }

    public String getPf() { return pf; }
    public void setPf(String pf) { this.pf = pf; }

    public String getEsic() { return esic; }
    public void setEsic(String esic) { this.esic = esic; }

    public String getDesignationChanged() { return designationChanged; }
    public void setDesignationChanged(String designationChanged) { this.designationChanged = designationChanged; }

    public String getDesignationChangedDate() { return designationChangedDate; }
    public void setDesignationChangedDate(String designationChangedDate) { this.designationChangedDate = designationChangedDate; }
}