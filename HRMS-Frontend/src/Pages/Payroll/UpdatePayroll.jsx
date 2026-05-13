import React, { useEffect, useState } from "react";
import { getAllEmployees } from "../../api/employeeApi";
import { createPayrollBatch, getPayrollData, calculateAllSalaries, calculateAndApplySalary } from "../../api/payrollApi";
import "./UpdatePayroll.css";
import { useNavigate, useLocation } from "react-router-dom";
import SalaryCalculationModal from "./SalaryCalculationModal";

const UpdatePayroll = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [employees, setEmployees] = useState([]);
  const [payrollData, setPayrollData] = useState({});
  const [mode, setMode] = useState("EDIT");
  // Auto-generate current month in format "Month-YYYY" e.g. "April-2026"
  const [month] = useState(() => {
    const now = new Date();
    const monthName = now.toLocaleString('en-US', { month: 'long' });
    return `${monthName}-${now.getFullYear()}`;
  });
  const [saving, setSaving] = useState(false);
  
  // NEW: Salary calculation modal state
  const [showCalcModal, setShowCalcModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  // NEW: Bulk calculation state
  const [bulkCalculating, setBulkCalculating] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkResults, setBulkResults] = useState([]);

  // ✅ FIX: Load BOTH employees AND existing payroll, then merge
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("🔄 Starting to load employees and payroll...");
        
        // Fetch both in parallel
        const [empRes, payrollRes] = await Promise.all([
          getAllEmployees(),
          getPayrollData()
        ]);

        console.log("📦 Raw empRes:", empRes);
        console.log("📦 Raw payrollRes:", payrollRes);

        // getAllEmployees returns full response object, so extract data
        let empList = [];
        
        if (Array.isArray(empRes?.data)) {
          empList = empRes.data;
          console.log("✅ Extracted from empRes.data (array)");
        } else if (Array.isArray(empRes?.data?.content)) {
          empList = empRes.data.content;
          console.log("✅ Extracted from empRes.data.content (array)");
        } else if (Array.isArray(empRes)) {
          empList = empRes;
          console.log("✅ empRes is already an array");
        } else {
          console.warn("⚠️ Could not extract employee array from:", empRes);
          empList = [];
        }

        const existingPayroll = Array.isArray(payrollRes?.data) ? payrollRes.data : [];

        console.log("✅ Loaded employees:", empList.length);
        console.log("✅ Loaded payroll records:", existingPayroll.length);
        console.log("📋 Employee list:", empList);

        setEmployees(empList);

        // Build a map of existing payroll by employeeId for quick lookup
        const payrollMap = {};
        existingPayroll.forEach(p => {
          const id = p.employeeId || p.empId;
          if (id) payrollMap[id] = p;
        });

        const initial = {};
        empList.forEach((emp) => {
          // ✅ Use existing payroll values if available, otherwise default to 0
          const existing = payrollMap[emp.employeeId] || {};

          const empId = emp.employeeId || emp.id || emp.empId;
          if (!empId) {
            console.warn("⚠️ Employee has no ID:", emp);
            return;
          }

          initial[empId] = {
            companyName: existing.companyName || "OMOIKANE INNOVATIONS PVT LTD",
            empName: emp.fullName || emp.name || existing.empName,
            department: emp.department || existing.department,
             bankAccountNumber: emp.bankAccountNumber || existing.bankAccountNumber || "",
  pfMemberId: emp.pfMemberId || existing.pfMemberId || "",
  uan: emp.uan || existing.uan || "",
  ifsc: emp.ifsc || existing.ifsc || "",
            doj: emp.doj || emp.joiningDate || existing.doj || "",
            birthDate: emp.dob || emp.birthDate || existing.birthDate || "",
            isActive: (emp.status || "").toUpperCase() === "ACTIVE" || emp.isActive === true,
            reportManager: emp.manager || existing.reportManager || "",
            gratuity: existing.gratuity ?? 0,

            // ✅ PRESERVE existing payroll values — don't reset to 0
            esi:            existing.esi            ?? 0,
            pf:             existing.pf             ?? 0,
            tax:            existing.tax            ?? 0,
            incentive:      existing.incentive      ?? 0,
            allowance:      existing.allowance      ?? 0,
            bonus:          existing.bonus          ?? 0,
            variableSalary: existing.variableSalary ?? 0,
            basic:          existing.basic          ?? 0,
            hra:            existing.hra            ?? 0,
            deduction:      existing.deduction      ?? 0,
            gross:          existing.gross          ?? 0,
            net:            existing.net            ?? 0,
            conveyance:     existing.conveyance     ?? 0,
            professionalTax:existing.professionalTax?? 0,
            lopDeduction:   existing.lopDeduction   ?? 0,
            otherDeduction: existing.otherDeduction ?? 0,
            workingDays:    existing.workingDays    ?? 30,
            paidDays:       existing.paidDays       ?? 30,
            lopDays:        existing.lopDays        ?? 0,
          };
        });

        console.log("📊 Payroll data keys:", Object.keys(initial).length);
        setPayrollData(initial);
      } catch (err) {
        console.error("❌ Load error:", err);
      }
    };

    loadData();
  }, []);

  // If navigated from PayrollTable with a specific employee, pre-fill that employee
  useEffect(() => {
    if (location.state?.employee) {
      const emp = location.state.employee;
      setPayrollData((prev) => ({
        ...prev,
        [emp.employeeId]: {
          ...prev[emp.employeeId],
          empName: emp.empName,
          department: emp.department,
          bankAccountNumber:
  emp.bankAccountNumber ||
  prev[emp.employeeId]?.bankAccountNumber ||
  "",

pfMemberId:
  emp.pfMemberId ||
  prev[emp.employeeId]?.pfMemberId ||
  "",

uan:
  emp.uan ||
  prev[emp.employeeId]?.uan ||
  "",

ifsc:
  emp.ifsc ||
  prev[emp.employeeId]?.ifsc ||
  "",
          basic:          emp.basic          ?? prev[emp.employeeId]?.basic          ?? 0,
          hra:            emp.hra            ?? prev[emp.employeeId]?.hra            ?? 0,
          allowance:      emp.allowance      ?? prev[emp.employeeId]?.allowance      ?? 0,
          bonus:          emp.bonus          ?? prev[emp.employeeId]?.bonus          ?? 0,
          variableSalary: emp.variableSalary ?? prev[emp.employeeId]?.variableSalary ?? 0,  // ✅ NEW
          incentive:      emp.incentive      ?? prev[emp.employeeId]?.incentive      ?? 0,
          pf:             emp.pf             ?? prev[emp.employeeId]?.pf             ?? 0,
          esi:            emp.esi            ?? prev[emp.employeeId]?.esi            ?? 0,
          tax:            emp.tax            ?? prev[emp.employeeId]?.tax            ?? 0,
          deduction:      emp.deduction      ?? prev[emp.employeeId]?.deduction      ?? 0,
          gross:          emp.gross          ?? prev[emp.employeeId]?.gross          ?? 0,
          net:            emp.net            ?? prev[emp.employeeId]?.net            ?? 0,
          conveyance:     emp.conveyance     ?? prev[emp.employeeId]?.conveyance     ?? 0,
          professionalTax:emp.professionalTax?? prev[emp.employeeId]?.professionalTax?? 0,
          lopDeduction:   emp.lopDeduction   ?? prev[emp.employeeId]?.lopDeduction   ?? 0,
          otherDeduction: emp.otherDeduction ?? prev[emp.employeeId]?.otherDeduction ?? 0,
          workingDays:    emp.workingDays    ?? prev[emp.employeeId]?.workingDays    ?? 30,
          paidDays:       emp.paidDays       ?? prev[emp.employeeId]?.paidDays       ?? 30,
          lopDays:        emp.lopDays        ?? prev[emp.employeeId]?.lopDays        ?? 0,
          reportManager:  emp.reportManager  || prev[emp.employeeId]?.reportManager  || "",
          gratuity: emp.gratuity ?? prev[emp.employeeId]?.gratuity ?? 0,
        }
      }));
      setMode("EDIT");
    }
  }, [location.state]);

  // ---------------- CALCULATION ----------------
 const updateField = (id, field, value) => {

  const numericFields = [
    "esi","pf","tax","incentive","allowance",
    "bonus","variableSalary","basic","hra","deduction",  // ✅ Added variableSalary
    "conveyance",
    "professionalTax",
    "lopDeduction",
    "otherDeduction",
    "workingDays",
    "paidDays",
    "lopDays"
  ];

  const updated = {
    ...payrollData[id],
    [field]: numericFields.includes(field)
      ? Number(value || 0)
      : value,
  };

  // ✅ AUTO CALC AFTER updated exists
  updated.workingDays = 30;
  updated.lopDays = Number(updated.lopDays || 0);
  updated.paidDays = updated.workingDays - updated.lopDays;

  const gross =
    Number(updated.basic || 0) +
    Number(updated.hra || 0) +
    Number(updated.allowance || 0) +
    Number(updated.bonus || 0) +
    Number(updated.variableSalary || 0) +  // ✅ Include variable salary in gross
    Number(updated.incentive || 0) +
    Number(updated.conveyance || 0);

  const deductions =
    Number(updated.pf || 0) +
    Number(updated.tax || 0) +
    Number(updated.esi || 0) +
    Number(updated.deduction || 0) +
    Number(updated.professionalTax || 0) +
    Number(updated.lopDeduction || 0) +
    Number(updated.otherDeduction || 0);

  // ✅ SAVE CALCULATED VALUES BACK TO STATE
  updated.gross = gross;
  updated.net = gross - deductions;

  setPayrollData({
    ...payrollData,
    [id]: updated,
  });
};
  // ---------------- SAVE ----------------
const savePayroll = async () => {
  setSaving(true);

  const payload = Object.keys(payrollData).map((id) => {
    const d = payrollData[id];

    const gross =
      Number(d.basic || 0) +
      Number(d.hra || 0) +
      Number(d.allowance || 0) +
      Number(d.bonus || 0) +
      Number(d.variableSalary || 0) +  // ✅ Include variable salary
      Number(d.incentive || 0) +
      Number(d.conveyance || 0);

    const deductions =
      Number(d.pf || 0) +
      Number(d.esi || 0) +
      Number(d.tax || 0) +
      Number(d.deduction || 0) +
      Number(d.professionalTax || 0) +
      Number(d.lopDeduction || 0) +
      Number(d.otherDeduction || 0);

    const net = gross - deductions;

    return {
      companyName: d.companyName,
      employeeId: id,
      empName: d.empName,
      department: d.department,
      bankAccountNumber: d.bankAccountNumber || "",
pfMemberId: d.pfMemberId || "",
uan: d.uan || "",
ifsc: d.ifsc || "",
      month,
      status: d.isActive ? "ACTIVE" : "INACTIVE",
      updatedAt: Date.now(),
      birthDate: d.birthDate,
      isActive: d.isActive,
      basic:          Number(d.basic          || 0),
      hra:            Number(d.hra            || 0),
      allowance:      Number(d.allowance      || 0),
      bonus:          Number(d.bonus          || 0),
      variableSalary: Number(d.variableSalary || 0),  // ✅ Include variable salary
      incentive:      Number(d.incentive      || 0),
      pf:             Number(d.pf             || 0),
      esi:            Number(d.esi            || 0),
      tax:            Number(d.tax            || 0),
      deduction:      Number(d.deduction      || 0),
      gross,
      net,
      conveyance:     Number(d.conveyance     || 0),
      professionalTax:Number(d.professionalTax|| 0),
      lopDeduction:   Number(d.lopDeduction   || 0),
      otherDeduction: Number(d.otherDeduction || 0),
      workingDays:    Number(d.workingDays    || 30),
      paidDays:       Number(d.paidDays       || 30),
      lopDays:        Number(d.lopDays        || 0),
      reportManager:  d.reportManager || "",
      gratuity: Number(d.gratuity || 0)
    };
  });

  try {
    await createPayrollBatch(payload);
    alert("✅ Payroll Saved Successfully!");
    navigate("/payroll", { state: { refresh: Date.now() } });
  } catch (err) {
    console.error("❌ SAVE FAILED:", err.response?.data || err.message);
    alert("❌ Failed to save: " + (err.response?.data?.message || err.message));
  } finally {
    setSaving(false);
  }
};

  // NEW: Handle auto-calculate for single employee
  const handleAutoCalculate = (id) => {
    const empData = payrollData[id];
    const employee = {
      employeeId: id,
      empId: id,
      empName: empData.empName,
      department: empData.department,
    };
    setSelectedEmployee(employee);
    setShowCalcModal(true);
  };

  // NEW: Handle bulk calculate for all employees
  const handleBulkCalculate = async () => {
    setBulkCalculating(true);
    setShowBulkModal(true);
    setBulkResults([]);

    try {
      const response = await calculateAllSalaries(month);
      const results = response.data;
      
      setBulkResults(results);
      
      // Show success message
      alert(`✅ Successfully calculated salaries for ${results.length} employees!`);
      
      // Reload payroll data to show updated values
      await handleCalculationSuccess();
    } catch (error) {
      console.error("Bulk calculation error:", error);
      alert("Failed to calculate salaries: " + (error.response?.data?.message || error.message));
    } finally {
      setBulkCalculating(false);
    }
  };

  // NEW: Apply bulk calculation results
  const handleApplyBulkResults = async () => {
    try {
      // Apply each result
      for (const result of bulkResults) {
        await calculateAndApplySalary({
          employeeId: result.employeeId,
          month: month,
          includeAttendance: true,
          includeLeave: true,
          includePerformance: true,
        });
      }
      
      alert("✅ All salaries applied successfully!");
      setShowBulkModal(false);
      await handleCalculationSuccess();
    } catch (error) {
      console.error("Apply bulk error:", error);
      alert("Failed to apply salaries: " + (error.response?.data?.message || error.message));
    }
  };

  // NEW: Handle calculation success
  const handleCalculationSuccess = async () => {
    // Reload payroll data
    try {
      const [empRes, payrollRes] = await Promise.all([
        getAllEmployees(),
        getPayrollData()
      ]);

      // getAllEmployees returns full response object, so extract data
      const empList = Array.isArray(empRes?.data) 
        ? empRes.data 
        : Array.isArray(empRes?.data?.content) 
        ? empRes.data.content 
        : Array.isArray(empRes) 
        ? empRes 
        : [];

      const existingPayroll = Array.isArray(payrollRes?.data) ? payrollRes.data : [];

      console.log("✅ Reloaded employees:", empList.length);
      console.log("✅ Reloaded payroll records:", existingPayroll.length);

      setEmployees(empList);

      const payrollMap = {};
      existingPayroll.forEach(p => {
        const id = p.employeeId || p.empId;
        if (id) payrollMap[id] = p;
      });

      const initial = {};
      empList.forEach((emp) => {
        const existing = payrollMap[emp.employeeId] || {};

        const empId = emp.employeeId || emp.id || emp.empId;
        if (!empId) return; // skip invalid

        initial[empId] = {
          companyName: existing.companyName || "OMOIKANE INNOVATIONS PVT LTD",
          empName:
            emp.fullName ||
            emp.name ||
            emp.empName ||
            existing.empName ||
            "N/A",
          department: emp.department || existing.department,
          doj: emp.doj || emp.joiningDate || existing.doj || "",
          birthDate: emp.dob || emp.birthDate || existing.birthDate || "",
          isActive: (emp.status || "").toUpperCase() === "ACTIVE" || emp.isActive === true,
          reportManager: emp.manager || existing.reportManager || "",
          esi:            existing.esi            ?? 0,
          pf:             existing.pf             ?? 0,
          tax:            existing.tax            ?? 0,
          incentive:      existing.incentive      ?? 0,
          allowance:      existing.allowance      ?? 0,
          bonus:          existing.bonus          ?? 0,
          variableSalary: existing.variableSalary ?? 0,  // ✅ NEW: Variable salary
          basic:          existing.basic          ?? 0,
          hra:            existing.hra            ?? 0,
          deduction:      existing.deduction      ?? 0,
          gross:          existing.gross          ?? 0,
          net:            existing.net            ?? 0,
          conveyance:     existing.conveyance     ?? 0,
          professionalTax:existing.professionalTax?? 0,
          lopDeduction:   existing.lopDeduction   ?? 0,
          otherDeduction: existing.otherDeduction ?? 0,
          workingDays:    existing.workingDays    ?? 30,
          paidDays:       existing.paidDays       ?? 30,
          lopDays:        existing.lopDays        ?? 0,
        };
      });

      setPayrollData(initial);
    } catch (err) {
      console.error("❌ Reload error:", err);
    }
  };

  return (
    <div className="update-payroll-container">

      {/* HEADER ACTIONS */}
      <div className="actions" style={{ marginBottom: 15 }}>
        <button className="btn-primary" onClick={() => setMode("EDIT")}>
          Edit Mode
        </button>

        <button onClick={() => setMode("REVIEW")}>
          Review Mode
        </button>

        <button
          className="btn-calculate-all"
          onClick={handleBulkCalculate}
          disabled={bulkCalculating || saving}
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "6px",
            cursor: bulkCalculating ? "not-allowed" : "pointer",
            fontWeight: "600",
            opacity: bulkCalculating ? 0.7 : 1
          }}
        >
          {bulkCalculating ? "⏳ Calculating All..." : "🔄 Calculate All Salaries"}
        </button>

        <button
          className="btn-primary"
          onClick={savePayroll}
          disabled={saving}
          style={{ opacity: saving ? 0.7 : 1, cursor: saving ? "not-allowed" : "pointer" }}
        >
          {saving ? "⏳ Saving..." : "Save Payroll"}
        </button>

        <button
          className="btn-danger"
          onClick={() => navigate("/payroll")}
          disabled={saving}
        >
          Cancel
        </button>
      </div>

      {/* FULL TABLE */}
      <div className="table-wrapper">
        <table className="table full-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Emp ID</th>
              <th>Name</th>
              <th>Dept</th>
              <th>DOJ</th>
              <th>Birth Date</th>
<th>Status</th>
              <th>Report Manager</th>
              <th>Bank Account No</th>
<th>PF Member ID</th>
<th>UAN</th>
<th>IFSC</th>
              <th>ESI</th>
              <th>PF</th>
              <th>Tax</th>
              <th>Incentive</th>
              <th>Allowance</th>
              <th>Bonus</th>
              <th>Variable Salary</th>
              <th>Basic</th>
              <th>HRA</th>
              <th>Deduction</th>
              <th>Gross Pay</th>
              <th>Net Pay</th>
              <th>Conveyance</th>
<th>Prof Tax</th>
<th>LOP Ded</th>
<th>Other Ded</th>

<th>Working Days</th>
<th>Paid Days</th>
<th>LOP Days</th>
<th>Gratuity</th>
<th>🧮 Auto Calculate</th>
            </tr>
          </thead>

          <tbody>
  {Object.keys(payrollData).map((id) => {
    const d = payrollData[id];

    return (
      <tr key={id}>
        <td>
  <input
    value={d.companyName}
    disabled={mode === "REVIEW"}
    onChange={(e) => updateField(id, "companyName", e.target.value)}
  />
</td>
        <td>{id}</td>
        <td>{d.empName}</td>
        <td>{d.department}</td>
        <td>{d.doj}</td>

        <td>{d.birthDate}</td>
        <td>{d.isActive ? "Active" : "Inactive"}</td>

        <td>
          <input
            value={d.reportManager}
            disabled={mode === "REVIEW"}
            onChange={(e) => updateField(id, "reportManager", e.target.value)}
          />
        </td>
<td>
  <input
    value={d.bankAccountNumber || ""}
    disabled={true}
  />
</td>

<td>
  <input
    value={d.pfMemberId || ""}
    disabled={true}
  />
</td>

<td>
  <input
    value={d.uan || ""}
    disabled={true}
  />
</td>

<td>
  <input
    value={d.ifsc || ""}
    disabled={true}
  />
</td>
        <td>
          <input
            value={d.esi}
            disabled={mode === "REVIEW"}
            onChange={(e) => updateField(id, "esi", e.target.value)}
          />
        </td>

        <td>
          <input
            value={d.pf}
            disabled={mode === "REVIEW"}
            onChange={(e) => updateField(id, "pf", e.target.value)}
          />
        </td>

        <td>
          <input
            value={d.tax}
            disabled={mode === "REVIEW"}
            onChange={(e) => updateField(id, "tax", e.target.value)}
          />
        </td>

        <td>
          <input
            value={d.incentive}
            disabled={mode === "REVIEW"}
            onChange={(e) => updateField(id, "incentive", e.target.value)}
          />
        </td>

        <td>
          <input
            value={d.allowance}
            disabled={mode === "REVIEW"}
            onChange={(e) => updateField(id, "allowance", e.target.value)}
          />
        </td>

        <td>
          <input
            value={d.bonus}
            disabled={mode === "REVIEW"}
            onChange={(e) => updateField(id, "bonus", e.target.value)}
          />
        </td>

        <td>
          <input
            value={d.variableSalary}
            disabled={mode === "REVIEW"}
            onChange={(e) => updateField(id, "variableSalary", e.target.value)}
            style={{
              background: "#f0f9ff",
              borderColor: "#0ea5e9",
              color: "#0c4a6e"
            }}
            placeholder="0"
            title="Variable Salary - Changes monthly (bonuses, incentives, etc.)"
          />
        </td>

        <td>
          <input
            value={d.basic}
            disabled={mode === "REVIEW"}
            onChange={(e) => updateField(id, "basic", e.target.value)}
          />
        </td>

        <td>
          <input
            value={d.hra}
            disabled={mode === "REVIEW"}
            onChange={(e) => updateField(id, "hra", e.target.value)}
          />
        </td>

        <td>
          <input
            value={d.deduction}
            disabled={mode === "REVIEW"}
            onChange={(e) => updateField(id, "deduction", e.target.value)}
          />
        </td>

        <td>{d.gross}</td>
        <td>{d.net}</td>
        <td>
  <input
    value={d.conveyance}
    disabled={mode === "REVIEW"}
    onChange={(e) => updateField(id, "conveyance", e.target.value)}
  />
</td>

<td>
  <input
    value={d.professionalTax}
    disabled={mode === "REVIEW"}
    onChange={(e) => updateField(id, "professionalTax", e.target.value)}
  />
</td>

<td>
  <input
    value={d.lopDeduction}
    disabled={mode === "REVIEW"}
    onChange={(e) => updateField(id, "lopDeduction", e.target.value)}
  />
</td>

<td>
  <input
    value={d.otherDeduction}
    disabled={mode === "REVIEW"}
    onChange={(e) => updateField(id, "otherDeduction", e.target.value)}
  />
</td>

<td>
  <input
    value={d.workingDays}
    disabled={mode === "REVIEW"}
    onChange={(e) => updateField(id, "workingDays", e.target.value)}
  />
</td>

<td>
  <input
    value={d.paidDays}
    disabled={mode === "REVIEW"}
    onChange={(e) => updateField(id, "paidDays", e.target.value)}
  />
</td>

<td>
  <input
    value={d.lopDays}
    disabled={mode === "REVIEW"}
    onChange={(e) => updateField(id, "lopDays", e.target.value)}
  />
</td>
<td>
  <input
    value={d.gratuity || 0}
    disabled={true}   // ❗ keep disabled for now
    style={{
      background: "#fef9c3",
      borderColor: "#facc15",
      color: "#854d0e"
    }}
    title="Gratuity - Only applicable during employee exit"
  />
</td>
<td>
  <button
    className="btn-auto-calc"
    onClick={() => handleAutoCalculate(id)}
    title="Calculate salary with real-time data"
    style={{
      padding: "8px 12px",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "600",
      whiteSpace: "nowrap"
    }}
  >
    🔄 Auto Calculate
  </button>
</td>





      </tr>
    );
  })}
</tbody>
        </table>
      </div>

      {/* NEW: Salary Calculation Modal */}
      {selectedEmployee && (
        <SalaryCalculationModal
          open={showCalcModal}
          onClose={() => {
            setShowCalcModal(false);
            setSelectedEmployee(null);
          }}
          employee={selectedEmployee}
          month={month}
          onSuccess={handleCalculationSuccess}
        />
      )}

      {/* NEW: Bulk Calculation Results Modal */}
      {showBulkModal && (
        <div className="modal-overlay" onClick={() => setShowBulkModal(false)}>
          <div className="bulk-results-modal" onClick={(e) => e.stopPropagation()} style={{
            background: "white",
            borderRadius: "16px",
            padding: "30px",
            maxWidth: "900px",
            width: "90%",
            maxHeight: "80vh",
            overflow: "auto",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, fontSize: "24px", color: "#333" }}>
                🔄 Bulk Salary Calculation Results
              </h2>
              <button
                onClick={() => setShowBulkModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "32px",
                  cursor: "pointer",
                  color: "#666"
                }}
              >
                ×
              </button>
            </div>

            {bulkCalculating ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <div style={{ fontSize: "48px", marginBottom: "20px" }}>⏳</div>
                <h3>Calculating salaries for all employees...</h3>
                <p style={{ color: "#666" }}>This may take a few moments</p>
              </div>
            ) : bulkResults.length > 0 ? (
              <>
                <div style={{
                  background: "#e7f3ff",
                  padding: "15px",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  borderLeft: "4px solid #2196F3"
                }}>
                  <strong>✅ Successfully calculated {bulkResults.length} salaries</strong>
                  <p style={{ margin: "5px 0 0 0", fontSize: "14px", color: "#666" }}>
                    Review the results below and click "Apply All" to save to payroll
                  </p>
                </div>

                <div style={{ maxHeight: "400px", overflow: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead style={{ position: "sticky", top: 0, background: "#f8f9fa" }}>
                      <tr>
                        <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Employee</th>
                        <th style={{ padding: "12px", textAlign: "right", borderBottom: "2px solid #dee2e6" }}>Gross</th>
                        <th style={{ padding: "12px", textAlign: "right", borderBottom: "2px solid #dee2e6" }}>Deductions</th>
                        <th style={{ padding: "12px", textAlign: "right", borderBottom: "2px solid #dee2e6" }}>Net Pay</th>
                        <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid #dee2e6" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulkResults.map((result, index) => (
                        <tr key={index} style={{ borderBottom: "1px solid #dee2e6" }}>
                          <td style={{ padding: "12px" }}>
                            <div style={{ fontWeight: "600" }}>{result.empName}</div>
                            <div style={{ fontSize: "12px", color: "#666" }}>{result.employeeId}</div>
                          </td>
                          <td style={{ padding: "12px", textAlign: "right", color: "#16a34a", fontWeight: "600" }}>
                            ₹ {result.grossSalary?.toLocaleString('en-IN')}
                          </td>
                          <td style={{ padding: "12px", textAlign: "right", color: "#dc2626", fontWeight: "600" }}>
                            ₹ {result.totalDeductions?.toLocaleString('en-IN')}
                          </td>
                          <td style={{ padding: "12px", textAlign: "right", fontSize: "16px", fontWeight: "700", color: "#2563eb" }}>
                            ₹ {result.netSalary?.toLocaleString('en-IN')}
                          </td>
                          <td style={{ padding: "12px", textAlign: "center" }}>
                            <span style={{
                              padding: "4px 12px",
                              borderRadius: "12px",
                              fontSize: "12px",
                              fontWeight: "600",
                              background: "#dcfce7",
                              color: "#15803d"
                            }}>
                              ✓ Calculated
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{
                  marginTop: "20px",
                  padding: "15px",
                  background: "#f8f9fa",
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <div>
                    <div style={{ fontSize: "14px", color: "#666" }}>Total Net Payroll</div>
                    <div style={{ fontSize: "24px", fontWeight: "700", color: "#2563eb" }}>
                      ₹ {bulkResults.reduce((sum, r) => sum + (r.netSalary || 0), 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => setShowBulkModal(false)}
                      style={{
                        padding: "12px 24px",
                        background: "#f1f5f9",
                        color: "#334155",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "600"
                      }}
                    >
                      Close
                    </button>
                    <button
                      onClick={handleApplyBulkResults}
                      style={{
                        padding: "12px 24px",
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "600"
                      }}
                    >
                      ✅ Apply All to Payroll
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                No results to display
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdatePayroll;