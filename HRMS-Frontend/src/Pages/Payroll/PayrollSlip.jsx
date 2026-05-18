import React from "react";
import "./Payroll.css";

const PayrollSlip = ({ data }) => {
  if (!data) return null;

  const {
    empName,
    department,
    employeeId,
    month,
    doj,
    gross,
    net,
    pf,
    tax,
    esi,
    allowance,
    bonus,
    basic,
    hra,
    workingDays,
    paidDays,
    lopDays,
    conveyance,
    lopDeduction,
    professionalTax,
    otherDeduction,
    // ✅ ADD MISSING FIELDS
    bankAccountNumber,
    pfMemberId,
    uan,
    ifsc
  } = data;

  // ✅ FIX: ADD THESE (missing before)
  const finalWorkingDays = workingDays || 30;
  const finalLopDays = lopDays || 0;
  const finalPaidDays = paidDays || (finalWorkingDays - finalLopDays);

  const numberToWords = (num) => {
    if (!num) return "";

    const a = ["", "One", "Two", "Three", "Four", "Five", "Six",
      "Seven", "Eight", "Nine", "Ten", "Eleven",
      "Twelve", "Thirteen", "Fourteen", "Fifteen",
      "Sixteen", "Seventeen", "Eighteen", "Nineteen"
    ];

    const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty"];

    if (num < 20) return a[num];

    if (num < 100)
      return b[Math.floor(num / 10)] + " " + a[num % 10];

    if (num < 1000)
      return a[Math.floor(num / 100)] + " Hundred " + numberToWords(num % 100);

    if (num < 100000)
      return numberToWords(Math.floor(num / 1000)) + " Thousand " + numberToWords(num % 1000);

    if (num < 10000000)
      return numberToWords(Math.floor(num / 100000)) + " Lakh " + numberToWords(num % 100000);

    return num;
  };

  return (
    <div className="a4-wrapper">
      <div className="salary-slip" id="payslip">

        {/* HEADER */}
        <div className="company-header">
          <div className="logo-box">LOGO</div>

          <div className="company-info">
            <h2>{data.companyName || "OMOKANE INNOVATIONS PVT LTD"}</h2>
            <p>Engineering & Technology Solutions</p>
            <p>Address | Phone | Email | Website</p>
          </div>
        </div>

        <div className="divider"></div>

        <h3 className="slip-title">Salary Slip</h3>
        <p className="slip-month">Month: {month}</p>

        {/* EMPLOYEE INFO */}
        <div className="section-box">
          <div className="section-title blue-title">Employee Information</div>

          <div className="grid-2">
            <div>
              <div className="row"><span>Name</span><span>{empName}</span></div>
              <div className="row"><span>Designation</span><span>{department}</span></div>
              <div className="row"><span>DOJ</span><span>{doj || "-"}</span></div>
            </div>

            <div>
              <div className="row"><span>Employee ID</span><span>{employeeId}</span></div>
              <div className="row"><span>Department</span><span>{department}</span></div>
            </div>
          </div>
        </div>

        {/* ✅ NEW: BANK & STATUTORY DETAILS */}
        <div className="section-box">
          <div className="section-title blue-title">Bank & Statutory Details</div>

          <div className="grid-2">
            <div>
              <div className="row"><span>Bank Account No.</span><span>{bankAccountNumber || "N/A"}</span></div>
              <div className="row"><span>IFSC Code</span><span>{ifsc || "N/A"}</span></div>
            </div>

            <div>
              <div className="row"><span>UAN</span><span>{uan || "N/A"}</span></div>
              <div className="row"><span>PF Member ID</span><span>{pfMemberId || "N/A"}</span></div>
            </div>
          </div>
        </div>

        {/* Attendance + Earnings */}
        <div className="dual-box">

          <div className="section-box">
            <div className="section-title blue-title">Attendance</div>

            <div className="row"><span>Working Days</span><span>{finalWorkingDays}</span></div>
            <div className="row"><span>Paid Days</span><span>{finalPaidDays}</span></div>
            <div className="row"><span>LOP Days</span><span>{finalLopDays}</span></div>
          </div>

          <div className="section-box">
            <div className="section-title blue-title">Earnings</div>

            <div className="row"><span>Basic</span><span>{basic}</span></div>
            <div className="row"><span>HRA</span><span>{hra}</span></div>
            <div className="row"><span>Conveyance</span><span>{conveyance}</span></div>
            <div className="row"><span>Allowance</span><span>{allowance}</span></div>
            <div className="row"><span>LOP Deduction</span><span>{lopDeduction}</span></div>
          </div>

        </div>

        {/* Deductions BELOW */}
        <div className="section-box">
          <div className="section-title red-title">Deductions</div>

          <div className="row"><span>PF</span><span>{pf}</span></div>
          <div className="row"><span>Professional Tax</span><span>{professionalTax}</span></div>
          <div className="row"><span>TDS</span><span>{tax}</span></div>
          <div className="row"><span>Other</span><span>{otherDeduction}</span></div>
        </div>

        {/* NET SALARY */}
        <div className="net-salary">
          Net Salary: ₹ {net || 0}
          <br />
          In Words: {numberToWords(net)} Only
        </div>

        {/* FOOTER */}
        <div className="footer">
          <span>Employer Signature: __________</span>
          <span>Date: __________</span>
        </div>

        <p className="note">
          This is a system-generated payslip and does not require a signature.
        </p>

      </div>
    </div>
  );
};

export default PayrollSlip;