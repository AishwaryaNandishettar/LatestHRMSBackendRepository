import { useState, useEffect, useContext, useCallback } from "react";
import styles from "./Performance.module.css";
import { getPerformanceByEmployee, seedPerformanceData, savePerformance, debugEmployeeData, getMyTeam, getMyEmployeeId } from "../api/performanceApi";
import { getAllEmployees } from "../api/employeeApi";
import { AuthContext } from "../Context/Authcontext";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { FaStar, FaChartBar, FaRocket, FaUser, FaSync, FaDatabase, FaEdit, FaSave } from "react-icons/fa";

/* ── helpers ── */
const getBand = (score) => {
  if (score >= 4.5) return "Outstanding";
  if (score >= 4.0) return "Exceeds Expectations";
  if (score >= 3.5) return "Meets Expectations";
  if (score >= 2.5) return "Needs Improvement";
  return "Unsatisfactory";
};

const getBandColor = (score) => {
  if (score >= 4.5) return "#16a34a";
  if (score >= 4.0) return "#2563eb";
  if (score >= 3.5) return "#f59e0b";
  return "#ef4444";
};

const StarRating = ({ value }) => {
  const full  = Math.floor(value);
  const half  = value - full >= 0.5;
  return (
    <span style={{ color: "#f59e0b", fontSize: 14 }}>
      {"★".repeat(full)}
      {half ? "½" : ""}
      {"☆".repeat(5 - full - (half ? 1 : 0))}
      <span style={{ color: "#6b7280", marginLeft: 4, fontSize: 12 }}>
        {value.toFixed(1)}
      </span>
    </span>
  );
};

/* ── empty state ── */
const EmptyState = ({ name }) => (
  <div style={{
    textAlign: "center", padding: "60px 20px",
    background: "#fff", borderRadius: 14,
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)"
  }}>
    <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
    <h3 style={{ color: "#374151", marginBottom: 8 }}>No Performance Data</h3>
    <p style={{ color: "#9ca3af", fontSize: 14 }}>
      No performance record found for <strong>{name}</strong>.<br />
      Records are created automatically when the backend seeds data.
    </p>
  </div>
);

/* ── loading skeleton ── */
const Skeleton = () => (
  <div style={{ padding: 24 }}>
    {[1, 2, 3].map(i => (
      <div key={i} style={{
        height: 80, background: "#e5e7eb", borderRadius: 12,
        marginBottom: 16, animation: "pulse 1.5s infinite"
      }} />
    ))}
  </div>
);

export default function Performance() {
  const { user } = useContext(AuthContext);

  const role = (user?.role || "employee").toLowerCase();
  const isAdmin   = role === "admin" || role === "hr";
  const isManager = role === "manager";
  const isEmployee = !isAdmin && !isManager;

  /* ── state ── */
  const [employees, setEmployees]       = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [perfData, setPerfData]         = useState(null);
  const [loading, setLoading]           = useState(false);
  const [empLoading, setEmpLoading]     = useState(true);
  const [showParams, setShowParams]     = useState(false);
  const [lastRefresh, setLastRefresh]   = useState(null);
  const [seeding, setSeeding]           = useState(false);
  const [allPerformanceData, setAllPerformanceData] = useState([]); // Store all performance records
  
  // Manager feedback form state
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    quarter: "",
    rating: 4.0,
    comments: ""
  });
  const [savingFeedback, setSavingFeedback] = useState(false);

  /* ── derived ── */
  const monthlyRatings = perfData?.monthlyRatings || [];
  const overallScore   = perfData?.overallScore   || 0;
  const parameters     = perfData?.parameters     || [];
  const reviews        = perfData?.reviews        || [];
  const promotionReady = overallScore >= 4.5;

  const selectedEmp = isEmployee
    ? { fullName: user?.name || user?.email, employeeId: selectedEmpId, designation: "", department: "" }
    : employees.find(e => (e.employeeId || e.id) === selectedEmpId);

  /* ── load employees ── */
  useEffect(() => {
    const load = async () => {
      setEmpLoading(true);
      try {
        if (isEmployee) {
          // Employee: get their correct employeeId from the backend
          // (avoids using MongoDB _id as fallback)
          const res = await getMyEmployeeId();
          const empId = res?.employeeId || user?.employeeId || user?.empId || "";
          setSelectedEmpId(empId);
          setEmployees([]); // employees list not needed for employee view
        } else if (isManager) {
          // Manager: use the dedicated /my-team endpoint which uses User collection
          // (User collection has managerEmail reliably set)
          const team = await getMyTeam();
          const teamList = Array.isArray(team) ? team : [];
          setEmployees(teamList);
          if (teamList.length > 0) {
            setSelectedEmpId(teamList[0].employeeId || "");
          }
        } else {
          // Admin/HR: get all active employees
          const res = await getAllEmployees();
          const list = Array.isArray(res) ? res : (res?.data || []);
          const active = list.filter(e => (e.status || "").toLowerCase() === "active");
          setEmployees(active);
          if (active.length > 0) {
            setSelectedEmpId(active[0].employeeId || active[0].id || "");
          }
        }
        
        // Load all performance data for the tracking table
        if (!isEmployee) {
          try {
            const allPerf = await getAllPerformance();
            setAllPerformanceData(Array.isArray(allPerf) ? allPerf : []);
          } catch (e) {
            console.error("Failed to load all performance data:", e);
            setAllPerformanceData([]);
          }
        }
      } catch (e) {
        console.error("Failed to load employees:", e);
      } finally {
        setEmpLoading(false);
      }
    };
    load();
  }, [user]);

  /* ── load performance data when employee changes ── */
  const loadPerformance = useCallback(async (empId) => {
    if (!empId) return;
    setLoading(true);
    setPerfData(null);
    try {
      const data = await getPerformanceByEmployee(empId);
      setPerfData(data);
      setLastRefresh(new Date());
    } catch (e) {
      console.error("Performance fetch error:", e);
      setPerfData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedEmpId) loadPerformance(selectedEmpId);
  }, [selectedEmpId, loadPerformance]);

  /* ── debug employee data ── */
  const handleDebugData = async () => {
    try {
      const result = await debugEmployeeData();
      console.log("Employee Debug Data:", result);
      alert("Employee Debug Data (check console):\n" + result);
    } catch (e) {
      console.error("Debug failed:", e);
      alert("Debug failed: " + e.message);
    }
  };

  /* ── seed sample data ── */
  const handleSeedData = async () => {
    setSeeding(true);
    try {
      const result = await seedPerformanceData();
      alert("✅ " + result);
      // Refresh current employee's data
      if (selectedEmpId) loadPerformance(selectedEmpId);
      // Reload all performance data for tracking table
      if (!isEmployee) {
        const allPerf = await getAllPerformance();
        setAllPerformanceData(Array.isArray(allPerf) ? allPerf : []);
      }
    } catch (e) {
      console.error("Seeding failed:", e);
      const errorMsg = e.response?.data?.message || e.response?.data || e.message || "Unknown error occurred";
      alert("❌ Failed to seed data: " + errorMsg);
    } finally {
      setSeeding(false);
    }
  };

  /* ── manager feedback ── */
  const handleSaveFeedback = async () => {
    if (!selectedEmpId || !feedbackData.quarter || !feedbackData.comments.trim()) {
      alert("Please fill in all feedback fields");
      return;
    }

    setSavingFeedback(true);
    try {
      // Create new review
      const newReview = {
        reviewer: "Manager",
        quarter: feedbackData.quarter,
        rating: feedbackData.rating,
        comments: feedbackData.comments
      };

      // Update performance record with new review
      const updatedPerf = {
        ...perfData,
        reviews: [...(perfData?.reviews || []), newReview]
      };

      await savePerformance(updatedPerf);
      alert("✅ Feedback saved successfully!");
      
      // Reset form and refresh data
      setFeedbackData({ quarter: "", rating: 4.0, comments: "" });
      setShowFeedbackForm(false);
      loadPerformance(selectedEmpId);
    } catch (e) {
      console.error("Failed to save feedback:", e);
      alert("❌ Failed to save feedback: " + (e.response?.data || e.message));
    } finally {
      setSavingFeedback(false);
    }
  };

  /* ── radar chart data ── */
  const radarData = parameters.map(p => ({
    subject: p.name,
    score: p.score,
    fullMark: 5,
  }));

  /* ── weighted score ── */
  const weightedScore = parameters.length > 0
    ? parameters.reduce((sum, p) => sum + (p.score * p.weight) / 100, 0)
    : 0;

  if (empLoading) return <Skeleton />;

  return (
    <div className={styles.container}>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <h2 className={styles.title}>
          {isEmployee ? "My Performance" : isManager ? "Team Performance Management" : "Employee Performance Overview"}
        </h2>
        <div style={{ display: "flex", gap: 10 }}>
          {(isAdmin || isManager) && (
            <>
              <button
                className={styles.viewBtn}
                style={{ marginBottom: 0, display: "flex", alignItems: "center", gap: 6, background: "#16a34a" }}
                onClick={handleSeedData}
                disabled={seeding}
              >
                <FaDatabase style={{ fontSize: 12 }} />
                {seeding ? "Seeding..." : "Seed Data"}
              </button>
              <button
                className={styles.viewBtn}
                style={{ marginBottom: 0, display: "flex", alignItems: "center", gap: 6, background: "#f59e0b" }}
                onClick={handleDebugData}
              >
                🐛 Debug
              </button>
            </>
          )}
          {isManager && selectedEmpId && perfData && (
            <button
              className={styles.viewBtn}
              style={{ marginBottom: 0, display: "flex", alignItems: "center", gap: 6, background: "#f59e0b" }}
              onClick={() => setShowFeedbackForm(true)}
            >
              <FaEdit style={{ fontSize: 12 }} />
              Give Feedback
            </button>
          )}
          <button
            className={styles.viewBtn}
            style={{ marginBottom: 0, display: "flex", alignItems: "center", gap: 6 }}
            onClick={() => loadPerformance(selectedEmpId)}
            disabled={loading}
          >
            <FaSync style={{ fontSize: 12 }} />
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {lastRefresh && (
        <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 16 }}>
          Last updated: {lastRefresh.toLocaleTimeString()}
        </p>
      )}

      {/* ── KPI Row — hidden for employee role ── */}
      {!isEmployee && (
      <div className={styles.kpiRow}>

        {/* Overall Rating */}
        <div className={`${styles.kpiCard} ${styles.blue}`}>
          <div>
            <p className={styles.kpiTitle}>Overall Rating</p>
            <div className={styles.kpiValue}>
              {loading ? "—" : `${overallScore.toFixed(1)} / 5`}
            </div>
          </div>
          <FaStar className={styles.kpiIcon} />
        </div>

        {/* Performance Band */}
        <div className={`${styles.kpiCard} ${styles.green}`}>
          <div>
            <p className={styles.kpiTitle}>Performance Band</p>
            <div className={styles.kpiValue} style={{ fontSize: 16 }}>
              {loading ? "—" : getBand(overallScore)}
            </div>
          </div>
          <FaChartBar className={styles.kpiIcon} />
        </div>

        {/* Promotion Status */}
        <div className={`${styles.kpiCard} ${styles.red}`}>
          <div>
            <p className={styles.kpiTitle}>Promotion Status</p>
            <div className={styles.kpiValue}>
              {loading ? "—" : (promotionReady ? "✅ Ready" : "⏳ Not Yet")}
            </div>
          </div>
          <FaRocket className={styles.kpiIcon} />
        </div>

        {/* Employee Selector */}
        <div className={`${styles.kpiCard} ${styles.blueLight}`}>
          <div style={{ flex: 1 }}>
            <p className={styles.kpiTitle}>
              {isEmployee ? "My Performance" : isManager ? "Select Team Member" : "Select Employee"}
            </p>
            {isEmployee ? (
              <div className={styles.kpiValue} style={{ fontSize: 15 }}>
                {user?.name || selectedEmpId}
              </div>
            ) : (
              <select
                className={styles.empFilter}
                value={selectedEmpId}
                onChange={e => setSelectedEmpId(e.target.value)}
              >
                {employees.map(emp => (
                  <option
                    key={emp.employeeId || emp.id}
                    value={emp.employeeId || emp.id}
                  >
                    {emp.fullName || emp.name} — {emp.designation || emp.department || ""}
                  </option>
                ))}
              </select>
            )}
          </div>
          <FaUser className={styles.kpiIcon} />
        </div>
      </div>
      )}

      {/* ── No data state ── */}
      {!loading && !perfData && (
        <EmptyState name={selectedEmp?.fullName || user?.name || selectedEmpId} />
      )}

      {loading && <Skeleton />}

      {/* ── Admin/Manager: Team Performance Tracking (Always Show) ── */}
      {(isAdmin || isManager) && employees.length > 0 && (
        <div className={styles.card}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600, color: "#111827" }}>
            {isManager ? "Team Performance Tracking" : "Performance Tracking - All Employees"}
          </h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Employee</th>
                <th style={{ textAlign: "left" }}>Department</th>
                <th style={{ textAlign: "left" }}>Designation</th>
                <th>Overall Score</th>
                <th>Performance Band</th>
                <th>Last Review</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, i) => {
                const eid = emp.employeeId || emp.id;
                const isSelected = eid === selectedEmpId;
                
                // Mock performance data for display (in real app, you'd fetch all performance records)
                const mockScore = 3.2 + (Math.random() * 1.6);
                const mockBand = getBand(mockScore);
                const mockLastReview = ["Q3 2024", "Q4 2024", "Nov 2024"][Math.floor(Math.random() * 3)];
                
                return (
                  <tr key={i} style={{ background: isSelected ? "#eff6ff" : undefined }}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: "50%",
                          background: "linear-gradient(135deg,#3b82f6,#2563eb)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#fff", fontWeight: 700, fontSize: 12, flexShrink: 0
                        }}>
                          {(emp.fullName || "?")[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: isSelected ? 600 : 400, fontSize: 14 }}>
                            {emp.fullName}
                          </div>
                          <div style={{ fontSize: 11, color: "#6b7280" }}>
                            ID: {emp.employeeId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{emp.department || "—"}</td>
                    <td>{emp.designation || "—"}</td>
                    <td style={{ textAlign: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                        <StarRating value={mockScore} />
                      </div>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span style={{
                        display: "inline-block", padding: "4px 12px",
                        borderRadius: 20, fontSize: 12, fontWeight: 600,
                        background: getBandColor(mockScore) + "20",
                        color: getBandColor(mockScore)
                      }}>
                        {mockBand}
                      </span>
                    </td>
                    <td style={{ textAlign: "center", fontSize: 13, color: "#6b7280" }}>
                      {mockLastReview}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        onClick={() => setSelectedEmpId(eid)}
                        style={{
                          background: isSelected ? "#2563eb" : "#f1f5f9",
                          color: isSelected ? "#fff" : "#374151",
                          border: "none", borderRadius: 6,
                          padding: "5px 12px", fontSize: 12,
                          cursor: "pointer", fontWeight: 500
                        }}
                      >
                        {isSelected ? "Viewing" : "View Details"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && perfData && (
        <>
          {/* ── Employee Info Banner ── */}
          {selectedEmp && (
            <div style={{
              background: "#fff", borderRadius: 12, padding: "14px 20px",
              marginBottom: 20, display: "flex", alignItems: "center", gap: 16,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                background: "linear-gradient(135deg,#3b82f6,#2563eb)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 700, fontSize: 18, flexShrink: 0
              }}>
                {(selectedEmp.fullName || "?")[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: "#111827", fontSize: 15 }}>
                  {selectedEmp.fullName}
                </div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  {selectedEmp.designation} · {selectedEmp.department} · ID: {selectedEmp.employeeId}
                </div>
              </div>
              <div style={{ marginLeft: "auto", textAlign: "right" }}>
                <div style={{
                  display: "inline-block", padding: "4px 12px",
                  borderRadius: 20, fontSize: 12, fontWeight: 600,
                  background: getBandColor(overallScore) + "20",
                  color: getBandColor(overallScore)
                }}>
                  {getBand(overallScore)}
                </div>
              </div>
            </div>
          )}

          {/* ── Monthly Trend Chart ── */}
          <div className={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#111827" }}>
                Monthly Performance Trend
              </h3>
              <span style={{ fontSize: 12, color: "#9ca3af" }}>
                {monthlyRatings.length} months of data
              </span>
            </div>
            {monthlyRatings.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={monthlyRatings} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} tickFormatter={v => v.toFixed(1)} />
                  <Tooltip
                    formatter={(v) => [`${v.toFixed(1)} / 5`, "Rating"]}
                    contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="rating"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 5, fill: "#2563eb", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: "#9ca3af", textAlign: "center", padding: 40 }}>No monthly data available</p>
            )}
          </div>

          {/* ── Parameters + Radar ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>

            {/* Parameters Table */}
            <div className={styles.card} style={{ marginBottom: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#111827" }}>
                  Performance Parameters
                </h3>
                <button
                  className={styles.viewBtn}
                  style={{ marginBottom: 0, padding: "6px 12px", fontSize: 12 }}
                  onClick={() => setShowParams(p => !p)}
                >
                  {showParams ? "Hide" : "Show Details"}
                </button>
              </div>

              {showParams && parameters.length > 0 ? (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left" }}>Parameter</th>
                      <th>Weight</th>
                      <th>Score</th>
                      <th>Weighted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parameters.map((p, i) => (
                      <tr key={i}>
                        <td>{p.name}</td>
                        <td style={{ textAlign: "center" }}>{p.weight}%</td>
                        <td style={{ textAlign: "center" }}>
                          <StarRating value={p.score} />
                        </td>
                        <td style={{ textAlign: "center", fontWeight: 600, color: "#2563eb" }}>
                          {((p.score * p.weight) / 100).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr style={{ background: "#f8fafc", fontWeight: 700 }}>
                      <td colSpan={3} style={{ textAlign: "right", paddingRight: 12 }}>
                        Weighted Total
                      </td>
                      <td style={{ textAlign: "center", color: "#2563eb" }}>
                        {weightedScore.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: "20px 0", color: "#9ca3af", fontSize: 13, textAlign: "center" }}>
                  {parameters.length === 0
                    ? "No parameter data available"
                    : "Click 'Show Details' to view parameters"}
                </div>
              )}
            </div>

            {/* Radar Chart */}
            <div className={styles.card} style={{ marginBottom: 0 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 600, color: "#111827" }}>
                Skills Radar
              </h3>
              {radarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#2563eb"
                      fill="#2563eb"
                      fillOpacity={0.25}
                    />
                    <Tooltip formatter={v => [`${v.toFixed(1)} / 5`, "Score"]} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <p style={{ color: "#9ca3af", textAlign: "center", padding: 40 }}>No parameter data</p>
              )}
            </div>
          </div>

          {/* ── Reviews ── */}
          <div className={styles.card}>
            <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600, color: "#111827" }}>
              Performance Reviews
            </h3>
            {reviews.length > 0 ? (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left" }}>Reviewer</th>
                    <th>Quarter</th>
                    <th>Rating</th>
                    <th style={{ textAlign: "left" }}>Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((r, i) => (
                    <tr key={i}>
                      <td>
                        <span style={{
                          display: "inline-block", padding: "2px 8px",
                          borderRadius: 12, fontSize: 11, fontWeight: 600,
                          background: r.reviewer === "Manager" ? "#dbeafe"
                            : r.reviewer === "HR" ? "#dcfce7" : "#fef9c3",
                          color: r.reviewer === "Manager" ? "#1d4ed8"
                            : r.reviewer === "HR" ? "#15803d" : "#854d0e"
                        }}>
                          {r.reviewer}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>{r.quarter}</td>
                      <td style={{ textAlign: "center" }}>
                        <StarRating value={r.rating} />
                      </td>
                      <td style={{ color: "#4b5563" }}>{r.comments}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: "#9ca3af", textAlign: "center", padding: 20 }}>No reviews available</p>
            )}
          </div>

          {/* ── Employee: My Performance Summary ── */}
          {isEmployee && perfData && (
            <div className={styles.card}>
              <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600, color: "#111827" }}>
                My Performance Summary
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div>
                  <h4 style={{ margin: "0 0 12px", fontSize: 14, color: "#6b7280" }}>Current Performance</h4>
                  <div style={{ padding: 16, background: "#f8fafc", borderRadius: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span>Overall Rating:</span>
                      <StarRating value={overallScore} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span>Performance Band:</span>
                      <span style={{
                        padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600,
                        background: getBandColor(overallScore) + "20",
                        color: getBandColor(overallScore)
                      }}>
                        {getBand(overallScore)}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Promotion Ready:</span>
                      <span style={{ color: promotionReady ? "#16a34a" : "#f59e0b" }}>
                        {promotionReady ? "✅ Yes" : "⏳ Not Yet"}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 style={{ margin: "0 0 12px", fontSize: 14, color: "#6b7280" }}>Recent Feedback</h4>
                  <div style={{ padding: 16, background: "#f8fafc", borderRadius: 8 }}>
                    {reviews.length > 0 ? (
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                          Latest Review ({reviews[reviews.length - 1].quarter})
                        </div>
                        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
                          By: {reviews[reviews.length - 1].reviewer}
                        </div>
                        <div style={{ fontSize: 13, lineHeight: 1.4 }}>
                          "{reviews[reviews.length - 1].comments}"
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: 13, color: "#9ca3af" }}>
                        No recent feedback available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Admin/Manager: All Employees Summary ── */}
          {(isAdmin || isManager) && employees.length > 0 && (
            <div className={styles.card}>
              <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600, color: "#111827" }}>
                Team Overview — Active Employees
              </h3>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left" }}>Employee</th>
                    <th style={{ textAlign: "left" }}>Department</th>
                    <th style={{ textAlign: "left" }}>Designation</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp, i) => {
                    const eid = emp.employeeId || emp.id;
                    const isSelected = eid === selectedEmpId;
                    return (
                      <tr key={i} style={{ background: isSelected ? "#eff6ff" : undefined }}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{
                              width: 30, height: 30, borderRadius: "50%",
                              background: "linear-gradient(135deg,#3b82f6,#2563eb)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: "#fff", fontWeight: 700, fontSize: 12, flexShrink: 0
                            }}>
                              {(emp.fullName || "?")[0].toUpperCase()}
                            </div>
                            <span style={{ fontWeight: isSelected ? 600 : 400 }}>
                              {emp.fullName}
                            </span>
                          </div>
                        </td>
                        <td>{emp.department || "—"}</td>
                        <td>{emp.designation || "—"}</td>
                        <td style={{ textAlign: "center" }}>
                          <button
                            onClick={() => setSelectedEmpId(eid)}
                            style={{
                              background: isSelected ? "#2563eb" : "#f1f5f9",
                              color: isSelected ? "#fff" : "#374151",
                              border: "none", borderRadius: 6,
                              padding: "5px 12px", fontSize: 12,
                              cursor: "pointer", fontWeight: 500
                            }}
                          >
                            {isSelected ? "Viewing" : "View"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── Manager Feedback Form Modal ── */}
      {showFeedbackForm && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "#fff", borderRadius: 12, padding: 24, width: "90%", maxWidth: 500,
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
          }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 600, color: "#111827" }}>
              Give Performance Feedback
            </h3>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500, color: "#374151" }}>
                Employee: {selectedEmp?.fullName}
              </label>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500, color: "#374151" }}>
                Quarter/Period
              </label>
              <input
                type="text"
                placeholder="e.g., Q1 2024, Dec 2024"
                value={feedbackData.quarter}
                onChange={(e) => setFeedbackData(prev => ({ ...prev, quarter: e.target.value }))}
                style={{
                  width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6,
                  fontSize: 14, outline: "none"
                }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500, color: "#374151" }}>
                Rating: {feedbackData.rating.toFixed(1)} / 5
              </label>
              <input
                type="range"
                min="1"
                max="5"
                step="0.1"
                value={feedbackData.rating}
                onChange={(e) => setFeedbackData(prev => ({ ...prev, rating: parseFloat(e.target.value) }))}
                style={{ width: "100%" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                <span>Poor</span>
                <span>Average</span>
                <span>Excellent</span>
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500, color: "#374151" }}>
                Comments
              </label>
              <textarea
                placeholder="Provide detailed feedback on performance, strengths, and areas for improvement..."
                value={feedbackData.comments}
                onChange={(e) => setFeedbackData(prev => ({ ...prev, comments: e.target.value }))}
                rows={4}
                style={{
                  width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6,
                  fontSize: 14, outline: "none", resize: "vertical"
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowFeedbackForm(false)}
                style={{
                  padding: "8px 16px", border: "1px solid #d1d5db", borderRadius: 6,
                  background: "#fff", color: "#374151", fontSize: 14, cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFeedback}
                disabled={savingFeedback}
                style={{
                  padding: "8px 16px", border: "none", borderRadius: 6,
                  background: "#2563eb", color: "#fff", fontSize: 14, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6
                }}
              >
                <FaSave style={{ fontSize: 12 }} />
                {savingFeedback ? "Saving..." : "Save Feedback"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
