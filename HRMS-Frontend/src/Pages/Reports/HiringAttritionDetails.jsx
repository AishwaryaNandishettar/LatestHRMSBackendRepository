import React, { useEffect, useState } from "react";
import { getReports } from "../../api/ReportsApi";
import "./ReportDetails.css";


export default function HiringAttritionDetails() {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getReports();
       console.log("API DATA:", res.data);
      const trends = res.data.monthlyTrends || [];
      setData(trends);
    } catch (err) {
       console.error("FULL ERROR:", err);
      // Fallback data
      setData([
        { month: "Jan", hires: 5, exits: 2, employees: 50 },
        { month: "Feb", hires: 8, exits: 3, employees: 55 },
        { month: "Mar", hires: 6, exits: 1, employees: 60 },
        { month: "Apr", hires: 10, exits: 4, employees: 65 },
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
      <h2>Hiring vs Attrition Details</h2>

          {/* ✅ ADD THIS */}
    <button onClick={() => window.history.back()}>
      ← Back
    </button>
      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Hires</th>
            <th>Exits</th>
            <th>Net Change</th>
            <th>Total Employees</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item, i) => (
            <tr key={i}>
              <td>{item.month}</td>
              <td className="positive">{item.hires}</td>
              <td className="negative">{item.exits}</td>
              <td className={item.hires - item.exits >= 0 ? "positive" : "negative"}>
                {item.hires - item.exits >= 0 ? "+" : ""}{item.hires - item.exits}
              </td>
              <td>{item.employees}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="rd-summary">
        <div className="summary-card">
          <h4>Total Hires</h4>
          <p>{data.reduce((sum, item) => sum + item.hires, 0)}</p>
        </div>
        <div className="summary-card">
          <h4>Total Exits</h4>
          <p>{data.reduce((sum, item) => sum + item.exits, 0)}</p>
        </div>
        <div className="summary-card">
          <h4>Net Growth</h4>
          <p>{data.reduce((sum, item) => sum + (item.hires - item.exits), 0)}</p>
        </div>
      </div>
    </div>
  );
}
