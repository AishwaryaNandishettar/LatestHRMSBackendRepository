package com.omoikaneinnovation.hmrsbackend.model;
import lombok.Data;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@Builder
@AllArgsConstructor
@Document(collection = "payroll")
public class Payroll {

    @Id
    private String id;

    private String employeeId;
    private String employeeName; // ✅ OPTIONAL BUT IMPORTANT
    private String empCode;
    private String empName;  // ✅ NEW: Employee name from frontend
    private String companyName;  // ✅ NEW: Company name
    private String department;
    private String reportManager;  // ✅ NEW: Report manager
    private String birthDate;
    
    // Salary Components
    private Double basic;
    private Double hra;
    private Double allowance;
    private Double incentive;
    private Double bonus;
    private Double variableSalary;  // ✅ Variable salary component
    private Double conveyance;  // ✅ NEW: Conveyance allowance
    
    // Deductions
    private Double tax;
    private Double pf;
    private Double esi;
    private Double insurance;
    private Double deduction;
    private Double professionalTax;  // ✅ NEW: Professional tax
    private Double lopDeduction;  // ✅ NEW: LOP deduction
    private Double otherDeduction;  // ✅ NEW: Other deductions
    
    // Calculated Fields
    private Double gross;
    private Double net;
    
    // Attendance
    private int workingDays;
    private int paidDays;
    private int lopDays;
    
    // Bank & Statutory Details
    private String bankAccountNumber;  // ✅ NEW: Bank account number
    private String pfMemberId;         // ✅ NEW: PF member ID
    private String uan;                // ✅ NEW: UAN number
    private String ifsc;               // ✅ NEW: IFSC code
    
    // Gratuity
    private Double gratuity;  // ✅ NEW: Gratuity
    
    // Status & Dates
    private String month;      // 2026-04
    private Long updatedAt;    // timestamp when last updated
    private Long initiatedAt;  // timestamp when payroll was first initiated
    private String initiatedDate; // human-readable: "29 Apr 2026"
    private Boolean isActive;
    private String recordStatus;   // ACTIVE / INACTIVE ✅ (for filtering)
    private String payrollStatus;  // INITIATED / PROCESSING / SUCCESSFUL ✅
    private String status; // INITIATED, PROCESSING, SUCCESSFUL
    private String salaryStatus; // PENDING / CREDITED

    // Getters and Setters for primitive types
    public int getWorkingDays() { return workingDays; }
    public void setWorkingDays(int workingDays) { this.workingDays = workingDays; }

    public int getPaidDays() { return paidDays; }
    public void setPaidDays(int paidDays) { this.paidDays = paidDays; }

    public int getLopDays() { return lopDays; }
    public void setLopDays(int lopDays) { this.lopDays = lopDays; }
}