import { useState } from "react";
import { calculateSalary, calculateAndApplySalary } from "../../api/payrollApi";
import "./SalaryCalculationModal.css";

const SalaryCalculationModal = ({ open, onClose, employee, month, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [includeAttendance, setIncludeAttendance] = useState(true);
  const [includeLeave, setIncludeLeave] = useState(true);
  const [includePerformance, setIncludePerformance] = useState(true);

  if (!open) return null;

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const request = {
        employeeId: employee.employeeId || employee.empId,
        month: month,
        includeAttendance,
        includeLeave,
        includePerformance,
      };

      const response = await calculateSalary(request);
      setResult(response.data);
    } catch (error) {
      console.error("Calculation error:", error);
      alert("Failed to calculate salary: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!result) return;

    setLoading(true);
    try {
      const request = {
        employeeId: employee.employeeId || employee.empId,
        month: month,
        includeAttendance,
        includeLeave,
        includePerformance,
      };

      await calculateAndApplySalary(request);
      alert("✅ Salary calculated and applied successfully!");
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      console.error("Apply error:", error);
      alert("Failed to apply salary: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="salary-calc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🧮 Real-Time Salary Calculator</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Employee Info */}
          <div className="employee-info">
            <h3>{employee.empName || employee.fullName}</h3>
            <p>Employee ID: {employee.employeeId || employee.empId}</p>
            <p>Department: {employee.department}</p>
            <p>Month: {month}</p>
          </div>

          {/* Calculation Options */}
          <div className="calc-options">
            <h4>Include in Calculation:</h4>
            <label>
              <input
                type="checkbox"
                checked={includeAttendance}
                onChange={(e) => setIncludeAttendance(e.target.checked)}
              />
              <span>Attendance Data (Bonus, Late Deductions, Overtime)</span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={includeLeave}
                onChange={(e) => setIncludeLeave(e.target.checked)}
              />
              <span>Leave Data (LOP Deductions)</span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={includePerformance}
                onChange={(e) => setIncludePerformance(e.target.checked)}
              />
              <span>Performance Data (Performance Bonus)</span>
            </label>
          </div>

          {/* Calculate Button */}
          {!result && (
            <button
              className="btn-calculate"
              onClick={handleCalculate}
              disabled={loading}
            >
              {loading ? "⏳ Calculating..." : "🔄 Calculate Salary"}
            </button>
          )}

          {/* Results */}
          {result && (
            <div className="calc-results">
              <h3>📊 Calculation Results</h3>

              {/* Earnings Section */}
              <div className="result-section earnings">
                <h4>💰 Earnings</h4>
                <div className="result-row">
                  <span>Basic Salary:</span>
                  <span>₹ {result.basic?.toLocaleString('en-IN')}</span>
                </div>
                <div className="result-row">
                  <span>HRA:</span>
                  <span>₹ {result.hra?.toLocaleString('en-IN')}</span>
                </div>
                <div className="result-row">
                  <span>Allowance:</span>
                  <span>₹ {result.allowance?.toLocaleString('en-IN')}</span>
                </div>
                <div className="result-row">
                  <span>Bonus:</span>
                  <span>₹ {result.bonus?.toLocaleString('en-IN')}</span>
                </div>
                <div className="result-row">
                  <span>Incentive:</span>
                  <span>₹ {result.incentive?.toLocaleString('en-IN')}</span>
                </div>
                {result.attendanceBonus > 0 && (
                  <div className="result-row highlight">
                    <span>🎯 Attendance Bonus:</span>
                    <span>₹ {result.attendanceBonus?.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {result.performanceBonus > 0 && (
                  <div className="result-row highlight">
                    <span>⭐ Performance Bonus:</span>
                    <span>₹ {result.performanceBonus?.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {result.overtimePay > 0 && (
                  <div className="result-row highlight">
                    <span>⏰ Overtime Pay:</span>
                    <span>₹ {result.overtimePay?.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="result-row total">
                  <span><strong>Gross Salary:</strong></span>
                  <span><strong>₹ {result.grossSalary?.toLocaleString('en-IN')}</strong></span>
                </div>
              </div>

              {/* Deductions Section */}
              <div className="result-section deductions">
                <h4>📉 Deductions</h4>
                <div className="result-row">
                  <span>PF:</span>
                  <span>₹ {result.pf?.toLocaleString('en-IN')}</span>
                </div>
                <div className="result-row">
                  <span>ESI:</span>
                  <span>₹ {result.esi?.toLocaleString('en-IN')}</span>
                </div>
                <div className="result-row">
                  <span>Tax:</span>
                  <span>₹ {result.tax?.toLocaleString('en-IN')}</span>
                </div>
                <div className="result-row">
                  <span>Professional Tax:</span>
                  <span>₹ {result.professionalTax?.toLocaleString('en-IN')}</span>
                </div>
                {result.lopDeduction > 0 && (
                  <div className="result-row highlight-red">
                    <span>⚠️ LOP Deduction:</span>
                    <span>₹ {result.lopDeduction?.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {result.lateDeduction > 0 && (
                  <div className="result-row highlight-red">
                    <span>⏱️ Late Deduction:</span>
                    <span>₹ {result.lateDeduction?.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="result-row total">
                  <span><strong>Total Deductions:</strong></span>
                  <span><strong>₹ {result.totalDeductions?.toLocaleString('en-IN')}</strong></span>
                </div>
              </div>

              {/* Net Salary */}
              <div className="net-salary">
                <h3>Net Salary</h3>
                <div className="net-amount">₹ {result.netSalary?.toLocaleString('en-IN')}</div>
              </div>

              {/* Attendance Summary */}
              {includeAttendance && (
                <div className="attendance-summary">
                  <h4>📅 Attendance Summary</h4>
                  <div className="summary-grid">
                    <div className="summary-item">
                      <span>Working Days:</span>
                      <span>{result.totalWorkingDays}</span>
                    </div>
                    <div className="summary-item">
                      <span>Present Days:</span>
                      <span>{result.presentDays}</span>
                    </div>
                    <div className="summary-item">
                      <span>Absent Days:</span>
                      <span>{result.absentDays}</span>
                    </div>
                    <div className="summary-item">
                      <span>Attendance %:</span>
                      <span>{result.attendancePercentage?.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Performance Summary */}
              {includePerformance && result.performanceRating && (
                <div className="performance-summary">
                  <h4>⭐ Performance Rating</h4>
                  <div className="rating-display">
                    {result.performanceRating?.toFixed(1)} / 5.0
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="modal-actions">
                <button
                  className="btn-recalculate"
                  onClick={() => setResult(null)}
                >
                  🔄 Recalculate
                </button>
                <button
                  className="btn-apply"
                  onClick={handleApply}
                  disabled={loading}
                >
                  {loading ? "⏳ Applying..." : "✅ Apply to Payroll"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalaryCalculationModal;
