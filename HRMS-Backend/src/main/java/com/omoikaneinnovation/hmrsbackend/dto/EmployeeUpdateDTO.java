package com.omoikaneinnovation.hmrsbackend.dto;

public class EmployeeUpdateDTO {
    private String fullName;
    private String employeeId;
    private String department;
    private String designation;
    private String email;
    private String location;
    private String manager;
    private String managerEmail;
    private String dob;
    private String doj;
    private String exitDate;
    private String status;

    // Statutory / bank fields
    private String bankAccountNumber;
    private String ifsc;
    private String uan;
    private String pfMemberId;
    private String pf;
    private String esic;
    private String designationChanged;
    private String designationChangedDate;

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getManager() { return manager; }
    public void setManager(String manager) { this.manager = manager; }

    public String getManagerEmail() { return managerEmail; }
    public void setManagerEmail(String managerEmail) { this.managerEmail = managerEmail; }

    public String getDob() { return dob; }
    public void setDob(String dob) { this.dob = dob; }

    public String getDoj() { return doj; }
    public void setDoj(String doj) { this.doj = doj; }

    public String getExitDate() { return exitDate; }
    public void setExitDate(String exitDate) { this.exitDate = exitDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

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
