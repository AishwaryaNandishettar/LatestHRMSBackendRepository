import React, { useEffect, useState } from "react";
import { getReports } from "../../api/ReportsApi";
import "./ReportDetails.css";

export default function EmployeeGrowthDetails() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getReports();
      const trends = res.data.monthlyTrends || [];
      setData(trends);
    } catch (err) {
      console.error(err);
      // Fallback data
      setData([
        { month: "Jan", employees: 50, hires: 5, exits: 2 },
        { month: "Feb", employees: 55, hires: 8, exits: 3 },
        { month: "Mar", employees: 60, hires: 6, exits: 1 },
        { month: "Apr", employees: 65, hires: 10, exits: 4 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="rd-page"><p>Loading...</p></div>;
  }

  return (
    <div className="rd-page">
      <h2>Employee Growth Trend</h2>
             {/* ✅ ADD THIS */}
    <button onClick={() => window.history.back()}>
      ← Back
    </button>
      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Total Employees</th>
            <th>Growth</th>
            <th>Growth %</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item, i) => {
            const prevEmployees = i > 0 ? data[i - 1].employees : item.employees;
            const growth = item.employees - prevEmployees;
            const growthPercent = prevEmployees > 0 
              ? ((growth / prevEmployees) * 100).toFixed(1) 
              : 0;

            return (
              <tr key={i}>
                <td>{item.month}</td>
                <td>{item.employees}</td>
                <td className={growth >= 0 ? "positive" : "negative"}>
                  {growth >= 0 ? "+" : ""}{growth}
                </td>
                <td className={growth >= 0 ? "positive" : "negative"}>
                  {growth >= 0 ? "+" : ""}{growthPercent}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="rd-summary">
        <div className="summary-card">
          <h4>Starting Count</h4>
          <p>{data.length > 0 ? data[0].employees : 0}</p>
        </div>
        <div className="summary-card">
          <h4>Current Count</h4>
          <p>{data.length > 0 ? data[data.length - 1].employees : 0}</p>
        </div>
        <div className="summary-card">
          <h4>Total Growth</h4>
          <p className="positive">
            +{data.length > 0 ? data[data.length - 1].employees - data[0].employees : 0}
          </p>
        </div>
      </div>
    </div>
  );
}
