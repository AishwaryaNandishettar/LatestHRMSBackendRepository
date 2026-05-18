import React, { useEffect, useState } from "react";
import { getReports } from "../../api/ReportsApi";
import "./ReportDetails.css";

export default function DepartmentDetails() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getReports();
      const depts = res.data.departmentDistribution || [];
      setData(depts);
    } catch (err) {
      console.error(err);
      // Fallback data
      setData([
        { name: "Engineering", value: 80 },
        { name: "HR", value: 20 },
        { name: "Marketing", value: 40 },
        { name: "Finance", value: 30 },
        { name: "Sales", value: 50 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const totalEmployees = data.reduce((sum, dept) => sum + dept.value, 0);

  if (loading) {
    return <div className="rd-page"><p>Loading...</p></div>;
  }

  return (
    <div className="rd-page">
      <h2>Department Distribution</h2>
             {/* ✅ ADD THIS */}
    <button onClick={() => window.history.back()}>
      ← Back
    </button>
      <table>
        <thead>
          <tr>
            <th>Department</th>
            <th>Employees</th>
            <th>Percentage</th>
          </tr>
        </thead>

        <tbody>
          {data
            .sort((a, b) => b.value - a.value)
            .map((dept, i) => {
              const percentage = totalEmployees > 0 
                ? ((dept.value / totalEmployees) * 100).toFixed(1) 
                : 0;

              return (
                <tr key={i}>
                  <td>{dept.name}</td>
                  <td>{dept.value}</td>
                  <td>
                    <div className="percentage-bar">
                      <div 
                        className="percentage-fill" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                      <span>{percentage}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>

      <div className="rd-summary">
        <div className="summary-card">
          <h4>Total Employees</h4>
          <p>{totalEmployees}</p>
        </div>
        <div className="summary-card">
          <h4>Total Departments</h4>
          <p>{data.length}</p>
        </div>
        <div className="summary-card">
          <h4>Largest Department</h4>
          <p>{data.length > 0 ? data.sort((a, b) => b.value - a.value)[0].name : "N/A"}</p>
        </div>
      </div>
    </div>
  );
}
