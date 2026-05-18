import React from "react";
import "./financialDetails.css";

const data = [
  { month: "Jan", cost: 20000 },
  { month: "Feb", cost: 24000 },
  { month: "Mar", cost: 30000 },
  { month: "Apr", cost: 36000 },
  { month: "May", cost: 42000 }
];

export default function PayrollDetails() {
  return (
    <div className="fd-page">
       <button onClick={() => window.history.back()}>
      ← Back
    </button>
      <h2>Payroll Details</h2>

      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Payroll Cost</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item, i) => (
            <tr key={i}>
              <td>{item.month}</td>
              <td>₹{item.cost}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}