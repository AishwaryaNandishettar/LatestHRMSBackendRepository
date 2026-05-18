import React from "react";
import PayrollRow from "./PayrollRow";
import payslipData from "../../Data/PaySlipData";
import "./Payroll.css";

const PayrollTable = ({ data, onViewPayslip, onProfileView , onEditPayroll, onDownloadPayslip,onProcessPayroll,onStatusChange}) => {
  // ✅ GRAND TOTAL CALCULATION (based on table data only)
const totalGross = data.reduce(
  (sum, emp) => sum + (emp.gross || emp.grossPay || emp.salary || 0),
  0
);

const totalDeductions = data.reduce(
  (sum, emp) =>
    sum + ((emp.tax || 0) + (emp.pf || 0) + (emp.insurance || 0)),
  0
);

const totalNet = data.reduce(
  (sum, emp) => sum + (emp.net || emp.netPay || 0),
  0
);
  return (
    <div className="payroll-table-wrapper">
      <table className="payroll-table">
        <thead>
          <tr>
            <th>Employee Name</th>
            <th>Employee ID</th>
            <th>Department</th>
            <th>Gross Pay</th>
            <th>Deductions</th>
            <th>Net Pay</th>
            <th>Status</th>
            <th>Payroll Month</th>
            <th>Initiated Date</th>
            <th>Payroll Status</th>
            <th style={{ textAlign: "right" }}>Actions</th>
           
            
          
          </tr>
        </thead>

       <tbody>
  {!data || data.length === 0 ? (
    <tr>
      <td colSpan="9" className="empty-row">
        No payroll records found
      </td>
    </tr>
  ) : (
    <>
      {/* ✅ ROWS */}
      {data.map((record) => (
        <PayrollRow
          key={record.employeeId || record.empId || record.empCode}
          record={record}
          onViewPayslip={onViewPayslip}
          onProfileView={onProfileView}
          onEditPayroll={onEditPayroll}
          onDownloadPayslip={onDownloadPayslip}
          onProcessPayroll={onProcessPayroll}
          onStatusChange={onStatusChange}
        />
      ))}

      {/* ✅ GRAND TOTAL ROW */}
      {(() => {
        const tdStyle = {
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
          padding: '14px 12px',
          color: '#ffffff',
          fontWeight: '700',
          fontSize: '14px',
          borderTop: '3px solid #1d4ed8',
        };
        return (
          <tr>
            <td style={{ ...tdStyle, textTransform: 'uppercase', letterSpacing: '0.5px' }}>💰 Grand Total</td>
            <td style={tdStyle}></td>
            <td style={tdStyle}></td>
            <td style={{ ...tdStyle }}>₹ {totalGross.toLocaleString('en-IN')}</td>
            <td style={{ ...tdStyle, color: '#fca5a5' }}>₹ {totalDeductions.toLocaleString('en-IN')}</td>
            <td style={{ ...tdStyle, color: '#86efac' }}>₹ {totalNet.toLocaleString('en-IN')}</td>
            <td style={tdStyle}></td>
            <td style={tdStyle}></td>
            <td style={tdStyle}></td>
            <td style={tdStyle}></td>
            <td style={tdStyle}></td>
          </tr>
        );
      })()}
    </>
  )}
</tbody>
      </table>

      <div className="table-footer">
        Showing <strong>{data.length}</strong> records
      </div>
    </div>
  );
};

export default PayrollTable;
