import React from "react";
import "./financialDetails.css";

const data = [
  { month: "Jan", revenue: 3000, expense: 2000, profit: 1000, loss: 500 },
  { month: "Feb", revenue: 4200, expense: 2800, profit: 1400, loss: 600 },
  { month: "Mar", revenue: 5000, expense: 3400, profit: 1600, loss: 700 },
  { month: "Apr", revenue: 3800, expense: 2600, profit: 1200, loss: 400 },
  { month: "May", revenue: 6200, expense: 4300, profit: 1900, loss: 800 }
];

export default function RevenueExpense() {
  return (
    <div className="fd-page">
       <button onClick={() => window.history.back()}>
      ← Back
    </button>
      <h2>Revenue & Expense Details</h2>

      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Revenue</th>
            <th>Expense</th>
            <th>Profit</th>
            <th>Loss</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item, i) => (
            <tr key={i}>
              <td>{item.month}</td>
              <td>${item.revenue}</td>
              <td>${item.expense}</td>
              <td>${item.profit}</td>
              <td>${item.loss}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}