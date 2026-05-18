package com.omoikaneinnovation.hmrsbackend.service;

import com.omoikaneinnovation.hmrsbackend.model.Payroll;
import com.omoikaneinnovation.hmrsbackend.model.Employee;
import com.omoikaneinnovation.hmrsbackend.repository.PayrollRepository;
import com.omoikaneinnovation.hmrsbackend.repository.EmployeeRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PayrollService {

    private final PayrollRepository repo;
    private final EmployeeRepository employeeRepo;
    

    public PayrollService(PayrollRepository repo, EmployeeRepository employeeRepo) {
        this.repo = repo;
        this.employeeRepo = employeeRepo;
    }

    public Payroll createPayroll(Payroll p){
        return repo.save(p);
    }

    public List<Payroll> getAll(){
        List<Payroll> payrolls = repo.findAll();
        
        // ✅ Enhance payroll data with Employee bank details if missing
        for (Payroll payroll : payrolls) {
            // Skip records with null employeeId (old/invalid data)
            if (payroll.getEmployeeId() == null || payroll.getEmployeeId().isEmpty()) {
                continue;
            }
            
            // If bank details are missing in payroll, get them from Employee
            if ((payroll.getBankAccountNumber() == null || payroll.getBankAccountNumber().isEmpty()) ||
                (payroll.getPfMemberId() == null || payroll.getPfMemberId().isEmpty()) ||
                (payroll.getUan() == null || payroll.getUan().isEmpty()) ||
                (payroll.getIfsc() == null || payroll.getIfsc().isEmpty())) {
                
                // Find employee by employeeId
                Optional<Employee> employeeOpt = employeeRepo.findByEmployeeId(payroll.getEmployeeId());
                if (employeeOpt.isPresent()) {
                    Employee employee = employeeOpt.get();
                    
                    // Fill missing bank details from Employee
                    if (payroll.getBankAccountNumber() == null || payroll.getBankAccountNumber().isEmpty()) {
                        payroll.setBankAccountNumber(employee.getBankAccountNumber());
                    }
                    if (payroll.getPfMemberId() == null || payroll.getPfMemberId().isEmpty()) {
                        payroll.setPfMemberId(employee.getPfMemberId());
                    }
                    if (payroll.getUan() == null || payroll.getUan().isEmpty()) {
                        payroll.setUan(employee.getUan());
                    }
                    if (payroll.getIfsc() == null || payroll.getIfsc().isEmpty()) {
                        payroll.setIfsc(employee.getIfsc());
                    }
                }
            }
        }
        
        // Return only records with valid employeeId
        return payrolls.stream()
            .filter(p -> p.getEmployeeId() != null && !p.getEmployeeId().isEmpty())
            .collect(java.util.stream.Collectors.toList());
    }

    public List<Payroll> getEmployeePayroll(String empCode){
        return repo.findByEmpCode(empCode);
    }

    public Payroll updatePayroll(String empId, Payroll p){
        p.setEmployeeId(empId);
        return repo.save(p);
    }

    public Payroll processPayroll(String employeeId) {

Payroll payroll = repo.findTopByEmployeeIdOrderByUpdatedAtDesc(employeeId);

if (payroll == null) {
    payroll = repo.findByEmpCode(employeeId).stream().findFirst().orElse(null);
}

    payroll.setPayrollStatus("PROCESSING");
    repo.save(payroll);

    try {
        Thread.sleep(2000);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }

    // ✅ PRESERVE existing gross and net values — don't hardcode to 15000/12000
    // Only update status, not the salary values
    payroll.setPayrollStatus("SUCCESSFUL");
    payroll.setSalaryStatus("CREDITED");

    return repo.save(payroll);
}

    // ✅ FIXED: Proper upsert — update existing records, don't reset to 0
    public List<Payroll> saveAll(List<Payroll> payrollList) {

        List<Payroll> toSave = new java.util.ArrayList<>();

        for (Payroll incoming : payrollList) {
            // ✅ NEW: Try to find existing record by employeeId AND month (prevents data conflicts)
            String month = incoming.getMonth();
            String employeeId = incoming.getEmployeeId();
            
            Payroll existing = null;
            
            // If month is provided, search by month (most accurate)
            if (month != null && !month.isEmpty()) {
                existing = repo.findByEmployeeIdAndMonth(employeeId, month);
            }
            
            // Fallback: search by most recent record
            if (existing == null) {
                existing = repo.findTopByEmployeeIdOrderByUpdatedAtDesc(employeeId);
            }

            java.util.Optional<Payroll> existingOpt = java.util.Optional.ofNullable(existing);

            if (existingOpt.isPresent()) {
                Payroll existingData = existingOpt.get();

                // ✅ PRESERVE the MongoDB ID to update the same record
                incoming.setId(existingData.getId());

                // ✅ PRESERVE status fields if not provided
                if (incoming.getPayrollStatus() == null) {
                    incoming.setPayrollStatus(existingData.getPayrollStatus());
                }
                if (incoming.getSalaryStatus() == null) {
                    incoming.setSalaryStatus(existingData.getSalaryStatus());
                }

                // ✅ PRESERVE initiated dates
                if (existingData.getInitiatedAt() != null) {
                    incoming.setInitiatedAt(existingData.getInitiatedAt());
                    incoming.setInitiatedDate(existingData.getInitiatedDate());
                } else {
                    long now = System.currentTimeMillis();
                    incoming.setInitiatedAt(now);
                    incoming.setInitiatedDate(formatDate(now));
                }
                
                System.out.println("🔄 UPDATING EXISTING PAYROLL: empId=" + employeeId + 
                                 ", month=" + month + 
                                 ", id=" + existingData.getId() +
                                 ", basic=" + incoming.getBasic() + 
                                 ", net=" + incoming.getNet());
            } else {
                // New record
                incoming.setPayrollStatus("INITIATED");
                long now = System.currentTimeMillis();
                incoming.setInitiatedAt(now);
                incoming.setInitiatedDate(formatDate(now));
                
                System.out.println("✨ CREATING NEW PAYROLL: empId=" + employeeId + 
                                 ", month=" + month +
                                 ", basic=" + incoming.getBasic() + 
                                 ", net=" + incoming.getNet());
            }
            
            // Ensure status is uppercase
            String statusValue = (incoming.getStatus() != null) ? incoming.getStatus().toUpperCase() : "ACTIVE";
            incoming.setStatus(statusValue);
            incoming.setRecordStatus(statusValue);
            incoming.setUpdatedAt(System.currentTimeMillis());

            System.out.println("🔥 UPSERTING PAYROLL: empId=" + incoming.getEmployeeId() + 
                             ", basic=" + incoming.getBasic() + 
                             ", net=" + incoming.getNet());

            toSave.add(incoming);
        }

        List<Payroll> saved = repo.saveAll(toSave);
        System.out.println("✅ PAYROLL BATCH SAVED: " + saved.size() + " records");
        return saved;
    }

    // Helper: format timestamp to readable date
    private String formatDate(long timestamp) {
        java.time.LocalDate date = java.time.Instant.ofEpochMilli(timestamp)
            .atZone(java.time.ZoneId.systemDefault())
            .toLocalDate();
        return date.format(java.time.format.DateTimeFormatter.ofPattern("dd MMM yyyy"));
    }

    public List<Payroll> processAllPayroll() {

    List<Payroll> list = repo.findAll();

    // Step 1: set PROCESSING
    list.forEach(p -> p.setPayrollStatus("PROCESSING"));
    repo.saveAll(list);

    try {
        Thread.sleep(2000);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }

    // Step 2: set SUCCESSFUL + CREDITED (preserve existing gross/net values)
    list.forEach(p -> {
        // ✅ PRESERVE existing gross and net values — don't hardcode
        p.setPayrollStatus("SUCCESSFUL");
        p.setSalaryStatus("CREDITED");
    });

    return repo.saveAll(list);
}
}