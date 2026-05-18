import React, { useEffect, useState } from "react";
import { getReports } from "../../api/ReportsApi";
import "./ReportDetails.css";

export default function EmployeeCostDetails() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getReports();
      const costs = res.data.employeeCost || [];
      setData(costs);
    } catch (err) {
      console.error(err);
      // Fallback data
      setData([
        { quarter: "Q1", payroll: 500000, benefits: 120000, training: 60000 },
        { quarter: "Q2", payroll: 520000, benefits: 140000, training: 80000 },
        { quarter: "Q3", payroll: 540000, benefits: 110000, training: 90000 },
        { quarter: "Q4", payroll: 560000, benefits: 150000, training: 100000 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount}`;
  };

  if (loading) {
    return <div className="rd-page"><p>Loading...</p></div>;
  }

  return (
    <div className="rd-page">
      <h2>Employee Cost Breakdown</h2>
             {/* ✅ ADD THIS */}
    <button onClick={() => window.history.back()}>
      ← Back
    </button>
      <table>
        <thead>
          <tr>
            <th>Quarter</th>
            <th>Payroll</th>
            <th>Benefits</th>
            <th>Training</th>
            <th>Total Cost</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item, i) => {
            const total = item.payroll + item.benefits + item.training;

            return (
              <tr key={i}>
                <td>{item.quarter}</td>
                <td>{formatCurrency(item.payroll)}</td>
                <td>{formatCurrency(item.benefits)}</td>
                <td>{formatCurrency(item.training)}</td>
                <td><strong>{formatCurrency(total)}</strong></td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="rd-summary">
        <div className="summary-card">
          <h4>Total Payroll</h4>
          <p>{formatCurrency(data.reduce((sum, item) => sum + item.payroll, 0))}</p>
        </div>
        <div className="summary-card">
          <h4>Total Benefits</h4>
          <p>{formatCurrency(data.reduce((sum, item) => sum + item.benefits, 0))}</p>
        </div>
        <div className="summary-card">
          <h4>Total Training</h4>
          <p>{formatCurrency(data.reduce((sum, item) => sum + item.training, 0))}</p>
        </div>
        <div className="summary-card">
          <h4>Grand Total</h4>
          <p className="highlight">
            {formatCurrency(
              data.reduce((sum, item) => 
                sum + item.payroll + item.benefits + item.training, 0
              )
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
