package com.omoikaneinnovation.hmrsbackend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String employeeName;
    private String email;
    private String password; // 🔐 hashed
    private String role;
    private boolean active; // existing field
    
private String employeeId;
     private String managerId;   // 🔥 IMPORTANT ADD THIS
private String phone;
private String department;
private String designation;
private String location;
private String joiningDate;
private String totalExp;
private String currentExp;
private String pf;
private String uan;
private String esic;
private String status;
private String employmentType;
private String managerName;
private String hrName;
private String companyId;

// ✅ OTP fields for password reset
private String resetOtp;
private Long otpExpiryTime; // timestamp in milliseconds

 // getters & setters
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
    private String managerEmail;

public String getManagerEmail() {
    return managerEmail;
}

public void setManagerEmail(String managerEmail) {
    this.managerEmail = managerEmail;
}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

     public String getName() { return employeeName; }
public void setName(String name) { this.employeeName = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

   public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public String getPhone() { return phone; }
public void setPhone(String phone) { this.phone = phone; }

public String getDepartment() { return department; }
public void setDepartment(String department) { this.department = department; }

public String getDesignation() { return designation; }
public void setDesignation(String designation) { this.designation = designation; }

public String getLocation() { return location; }
public void setLocation(String location) { this.location = location; }

public String getJoiningDate() { return joiningDate; }
public void setJoiningDate(String joiningDate) { this.joiningDate = joiningDate; }

public String getTotalExp() { return totalExp; }
public void setTotalExp(String totalExp) { this.totalExp = totalExp; }

public String getCurrentExp() { return currentExp; }
public void setCurrentExp(String currentExp) { this.currentExp = currentExp; }

public String getEmployeeId() { return employeeId; }
public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

public String getManagerId() { return managerId; }
public void setManagerId(String managerId) { this.managerId = managerId; }

public String getPf() { return pf; }
public void setPf(String pf) { this.pf = pf; }

public String getUan() { return uan; }
public void setUan(String uan) { this.uan = uan; }

public String getEsic() { return esic; }
public void setEsic(String esic) { this.esic = esic; }

public String getEmploymentType() { return employmentType; }
public void setEmploymentType(String employmentType) { this.employmentType = employmentType; }

public String getManagerName() { return managerName; }
public void setManagerName(String managerName) { this.managerName = managerName; }

public String getHrName() { return hrName; }
public void setHrName(String hrName) { this.hrName = hrName; }

public String getCompanyId() {
    return companyId;
}

public void setCompanyId(String companyId) {
    this.companyId = companyId;
}

// ✅ OTP getters and setters
public String getResetOtp() { return resetOtp; }
public void setResetOtp(String resetOtp) { this.resetOtp = resetOtp; }

public Long getOtpExpiryTime() { return otpExpiryTime; }
public void setOtpExpiryTime(Long otpExpiryTime) { this.otpExpiryTime = otpExpiryTime; }
}

