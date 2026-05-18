import React from "react";
import "./CashFlow.css";

const data = [
  { month: "Jan", inflow: 5000, outflow: 3500, net: 1500 },
  { month: "Feb", inflow: 6500, outflow: 4200, net: 2300 },
  { month: "Mar", inflow: 7200, outflow: 5000, net: 2200 },
  { month: "Apr", inflow: 8000, outflow: 5600, net: 2400 },
  { month: "May", inflow: 9000, outflow: 6200, net: 2800 }
];

export default function CashFlowDetails() {
  return (
    <div className="cf-page">
 <button onClick={() => window.history.back()}>
      ← Back
    </button>
      <h2>Cash Flow Analysis</h2>

      {/* SUMMARY CARD */}
      <div className="cf-card">
        <h4>Overview</h4>
        <p>Total Inflow: ₹36,700</p>
        <p>Total Outflow: ₹24,500</p>
        <p><b>Net Balance: ₹12,200</b></p>
      </div>

      {/* TABLE ONLY */}
      <div className="cf-card">
        <h4>Detailed Breakdown</h4>

        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Inflow</th>
              <th>Outflow</th>
              <th>Net</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, i) => (
              <tr key={i}>
                <td>{item.month}</td>
                <td>₹{item.inflow}</td>
                <td>₹{item.outflow}</td>
                <td style={{ color: item.net > 0 ? "green" : "red" }}>
                  ₹{item.net}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}