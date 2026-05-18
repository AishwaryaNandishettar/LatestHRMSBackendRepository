import PayrollSlip from "./PayrollSlip";
import "./Payroll.css";

const ViewPayslipModal = ({ open, onClose, data }) => {
  if (!open || !data) return null;

  return (
    <div className="payslip-backdrop">
      <div className="payslip-modal large">
        <div className="payslip-header">
          <h3>{data.empName || data.fullName || data.employee?.name} – Payslip</h3>
          <button onClick={onClose} className="close-btn" title="Close">
            ×
          </button>
        </div>

        <div className="payslip-body">
          <PayrollSlip data={data} />
        </div>
      </div>
    </div>
  );
};

export default ViewPayslipModal;
