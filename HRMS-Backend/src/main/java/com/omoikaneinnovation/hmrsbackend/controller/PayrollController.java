package com.omoikaneinnovation.hmrsbackend.controller;

import com.omoikaneinnovation.hmrsbackend.dto.SalaryCalculationRequest;
import com.omoikaneinnovation.hmrsbackend.dto.SalaryCalculationResult;
import com.omoikaneinnovation.hmrsbackend.model.Payroll;
import com.omoikaneinnovation.hmrsbackend.service.PayrollService;
import com.omoikaneinnovation.hmrsbackend.service.SalaryCalculationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payroll")
@CrossOrigin
public class PayrollController {

    private final PayrollService service;
    
    @Autowired
    private SalaryCalculationService calculationService;

    public PayrollController(PayrollService service){
        this.service = service;
    }

    @PostMapping("/create")
    public Payroll create(@RequestBody Payroll p){
        return service.createPayroll(p);
    }

    @GetMapping
    public List<Payroll> getAll(){
        return service.getAll();
    }

    @GetMapping("/employee/{empCode}")
    public List<Payroll> getEmployeePayroll(@PathVariable String empCode){
        return service.getEmployeePayroll(empCode);
    }

    @PutMapping("/update/{empId}")
    public Payroll update(@PathVariable String empId, @RequestBody Payroll p) {
        return service.updatePayroll(empId, p);
    }

    @PutMapping("/update-all")
    public List<Payroll> updateAll(@RequestBody List<Payroll> payrollList) {
        return service.saveAll(payrollList);
    }

     @PostMapping("/batch")
public List<Payroll> saveBatch(@RequestBody List<Payroll> list) {
    return service.saveAll(list); // ✅ CORRECT
}
@PutMapping("/process/{empId}")
public Payroll process(@PathVariable String empId) {
    return service.processPayroll(empId);
}
@PutMapping("/process-all")
public List<Payroll> processAll() {
    return service.processAllPayroll();
}

// ==================== NEW: REAL-TIME SALARY CALCULATION ENDPOINTS ====================

/**
 * Calculate salary for a single employee with real-time data
 * POST /api/payroll/calculate
 */
@PostMapping("/calculate")
public SalaryCalculationResult calculateSalary(@RequestBody SalaryCalculationRequest request) {
    return calculationService.calculateSalary(request);
}

/**
 * Calculate salary for all employees
 * POST /api/payroll/calculate-all
 */
@PostMapping("/calculate-all")
public List<SalaryCalculationResult> calculateAllSalaries(@RequestParam String month) {
    return calculationService.calculateBulkSalary(month);
}

/**
 * Calculate and apply salary (save to database)
 * POST /api/payroll/calculate-and-apply
 */
@PostMapping("/calculate-and-apply")
public Payroll calculateAndApply(@RequestBody SalaryCalculationRequest request) {
    SalaryCalculationResult result = calculationService.calculateSalary(request);
    return calculationService.applySalaryCalculation(result);
}

/**
 * Preview salary calculation without saving
 * POST /api/payroll/preview
 */
@PostMapping("/preview")
public SalaryCalculationResult previewCalculation(@RequestBody SalaryCalculationRequest request) {
    return calculationService.calculateSalary(request);
}
}
