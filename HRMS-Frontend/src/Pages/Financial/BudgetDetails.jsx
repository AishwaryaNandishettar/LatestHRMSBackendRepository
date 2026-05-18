import React from "react";
import "./financialDetails.css";

const data = [
  { quarter: "Q1", budget: 200000, actual: 180000 },
  { quarter: "Q2", budget: 240000, actual: 210000 },
  { quarter: "Q3", budget: 230000, actual: 200000 },
  { quarter: "Q4", budget: 260000, actual: 240000 }
];

export default function BudgetDetails() {
  return (
    <div className="fd-page">
       <button onClick={() => window.history.back()}>
      ← Back
    </button>
      <h2>Budget vs Actual</h2>

      <table>
        <thead>
          <tr>
            <th>Quarter</th>
            <th>Budget</th>
            <th>Actual</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item, i) => (
            <tr key={i}>
              <td>{item.quarter}</td>
              <td>₹{item.budget}</td>
              <td>₹{item.actual}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}