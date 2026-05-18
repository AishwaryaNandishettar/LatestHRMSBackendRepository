import { FaEye, FaEdit, FaDownload } from "react-icons/fa";

const PayrollRow = ({ record, onViewPayslip, onProfileView,onEditPayroll,onDownloadPayslip,onProcessPayroll,onStatusChange }) => {
  const deductionTotal = Object.values(record.deductions || {}).reduce(
    (sum, v) => sum + v,
    0
  );

  return (
    <tr>
      <td className="emp-cell">
    <img
      src={
        record.employee?.avatar ||
        record.image ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          record.fullName || record.name || "User"
        )}`
      }
      alt={record.fullName || record.name || "User"}
      className="emp-avatar"
      style={{ cursor: "pointer" }}
      onClick={() => onProfileView(record)}
    />

    <div
      className="emp-info"
      style={{ cursor: "pointer" }}
      onClick={() => onProfileView(record)}
    >
     <strong>
  {record.empName || record.fullName || record.employee?.name || record.name || "N/A"}
</strong>
     <div className="emp-role">
  {record.department || record.dept || "N/A"}
</div>
    </div>
  </td>

  {/* ✅ SEPARATE COLUMNS */}
  <td>{record.employeeId || record.empId}</td>
  <td>{record.department}</td>

      {/* GROSS */}
      <td>₹{(record.gross || record.grossPay || record.salary || 0)}</td>

      {/* DEDUCTIONS */}
      <td className="danger">
        ₹{deductionTotal.toLocaleString()}
      </td>

      {/* NET PAY */}
      <td>
        <span className="badge success">
         ₹{(record.net || record.netPay || record.salary || 0)}
        </span>
      </td>
{/* ✅ STATUS COLUMN (ONLY ACTIVE/INACTIVE) */}
<td>
  <span className={`badge ${(record.status || "").toUpperCase() === "ACTIVE" ? "success" : ""}`}>
    {(record.status || "INACTIVE").toUpperCase()}
  </span>
</td>

{/* ✅ PAYROLL MONTH */}
<td>
  {record.month ? (
    <span style={{
      background: '#eff6ff', color: '#1d4ed8',
      padding: '3px 8px', borderRadius: '12px',
      fontSize: '12px', fontWeight: '600'
    }}>
      {record.month}
    </span>
  ) : '-'}
</td>

{/* ✅ INITIATED DATE */}
<td>
  {record.initiatedDate ? (
    <span style={{ fontSize: '12px', color: '#374151', fontWeight: '500' }}>
      📅 {record.initiatedDate}
    </span>
  ) : record.updatedAt ? (
    <span style={{ fontSize: '12px', color: '#64748b' }}>
      📅 {new Date(record.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
    </span>
  ) : '-'}
</td>

  {/* ✅ PAYROLL STATUS COLUMN (DROPDOWN) */}
 <td>
  {record.salaryStatus === "CREDITED" ? (
    <span className="credited-badge">Credited ✅</span>
  ) : record.payrollStatus === "PROCESSING" ? (
    <span className="processing-loader"></span>
  ) : onStatusChange ? (   // ✅ ONLY ADMIN WILL SEE DROPDOWN
    <select
      value={record.payrollStatus || "INITIATED"}
      onChange={(e) => onStatusChange(record, e.target.value)}
      className="status-dropdown"
    >
      <option value="INITIATED">Initiated</option>
      <option value="PROCESSING">Processing</option>
    </select>
  ) : (   // ✅ EMPLOYEE WILL SEE TEXT ONLY
    <span>{record.payrollStatus || "INITIATED"}</span>
  )}
</td>
      {/* ACTIONS */}
      <td>
        <div className="actions-cell">
          <button
            className="icon-btn view"
            title="View Payslip"
            onClick={() => onViewPayslip(record)}
          >
            <FaEye />
          </button>
{onEditPayroll && (
  <button
    className="icon-btn edit"
    title="Edit Salary"
    onClick={() => onEditPayroll(record)}
  >
    <FaEdit />
  </button>
)}

         <button
  className="icon-btn download"
  title="Download Payslip"
  onClick={() => {
  onViewPayslip(record);   // open modal first
  setTimeout(() => {
    onDownloadPayslip();
  }, 1000);
}}
>
  <FaDownload />
</button>




        </div>
      </td>
    </tr>
  );
};

export default PayrollRow;
