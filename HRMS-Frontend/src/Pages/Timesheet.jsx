import React, { useEffect, useState, useRef } from "react";
import styles from "./Timesheet.module.css";
import { getTimesheet, approveTimesheet, submitTimesheet } from "../api/timesheetApi";

/* ── Export helpers ── */
const exportToCSV = (data, cols, filename) => {
  const header = cols.map((c) => c.label).join(",");
  const rows = data.map((r) =>
    cols.map((c) => `"${r[c.key] ?? ""}"`).join(",")
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename + ".csv";
  a.click();
  URL.revokeObjectURL(url);
};

const exportToExcel = (data, cols, filename) => {
  // Build a simple HTML table that Excel can open
  const header = `<tr>${cols.map((c) => `<th>${c.label}</th>`).join("")}</tr>`;
  const rows = data
    .map(
      (r) =>
        `<tr>${cols.map((c) => `<td>${r[c.key] ?? ""}</td>`).join("")}</tr>`
    )
    .join("");
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office"
    xmlns:x="urn:schemas-microsoft-com:office:excel"
    xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="UTF-8"></head>
    <body><table>${header}${rows}</table></body></html>`;
  const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename + ".xls";
  a.click();
  URL.revokeObjectURL(url);
};

const ROLE_EMP = "employee";
const ROLE_MGR = "manager";
const ROLE_ADMIN = "admin";

/* ================= GET LOGGED USER (supports both storage keys) ================= */
const getLoggedUser = () => {
  try {
    const u =
      JSON.parse(localStorage.getItem("loggedUser")) ||
      JSON.parse(localStorage.getItem("user")) ||
      {};
    return {
      ...u,
      role: (u.role || "").toLowerCase(),
    };
  } catch {
    return {};
  }
};

export default function TimesheetManager() {
  const loggedUser = getLoggedUser();
  const normalizeRole = (r) => (r || "").trim().toLowerCase();

  const [role, setRole] = useState(normalizeRole(loggedUser?.role));

  const [records, setRecords] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);
  const [filterText, setFilterText] = useState("");
  const [filters, setFilters] = useState({});
  const popupRef = useRef();
  const [kpiFilter, setKpiFilter] = useState("ALL");

  const [rejectPopup, setRejectPopup] = useState({
    visible: false,
    empId: null,
    month: null,
  });

  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportRef = useRef();

  // Dual calendar for from/to month selection
  const [fromMonth, setFromMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [toMonth, setToMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  useEffect(() => {
    const user = getLoggedUser();
    setRole(normalizeRole(user?.role));
  }, []);

  useEffect(() => {
    const load = async () => {
      const res = await getTimesheet(fromMonth);

      if (!res || res.length === 0) {
        // No data from backend — show empty table for all roles
        // (employee has no check-ins yet, manager's team has no check-ins yet)
        setRecords([]);
      } else {
        const grouped = {};

        res.forEach((r) => {
          const key = r.empId + "_" + (r.month || fromMonth);

          if (!grouped[key]) {
            grouped[key] = {
              empId: r.empId || "-",
              empName: r.empName || r.name || r.employeeName || "-",
              department: r.department || "-",
              reportingManager: r.reportingManager || "-",
              month: r.month || fromMonth,
              present: 0,
              leave: 0,
              lop: 0,
              halfDay: 0,
              late: 0,
              wfh: 0,
              field: 0,
              totalHours: 0,
              days: 0,
              approval: r.approval,
              status: r.approval || "Pending",
            };
          }

          // Backend already aggregates counts — use them directly
          grouped[key].present = r.present || grouped[key].present;
          grouped[key].leave = r.leave || grouped[key].leave;
          grouped[key].lop = r.lop || grouped[key].lop;
          grouped[key].halfDay = r.halfDay || grouped[key].halfDay;
          grouped[key].late = r.late || grouped[key].late;
          grouped[key].wfh = r.wfh || grouped[key].wfh;
          grouped[key].field = r.field || grouped[key].field;
          grouped[key].totalHours += parseFloat(r.duration || r.avgHours || 0);
          grouped[key].days += 1;
        });

        // Convert to array
        const mapped = Object.values(grouped).map((g) => {
          const avgHours =
            g.totalHours > 0 ? parseFloat(g.totalHours).toFixed(2) : "0.00";

          // HR SUMMARY
          const workingDays = g.present + g.wfh + g.field;
          const absentDays = g.lop;
          const payableDays = workingDays + g.leave + g.halfDay * 0.5;

          const attendancePercent =
            g.days > 0 ? ((workingDays / g.days) * 100).toFixed(1) : 0;

          const overtime = 0;

          return {
            ...g,
            avgHours,
            workingDays,
            absentDays,
            payableDays,
            attendancePercent,
            overtime,
          };
        });

        setRecords(mapped);
      }
    };

    load();
  }, [fromMonth]);

  /* CLOSE POPUP */
  useEffect(() => {
    const handleClick = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setActiveFilter(null);
      }
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const getUnique = (col) => [...new Set(records.map((r) => r[col]))];

  const filtered = records.filter((r) => {
    const matchesFilter = Object.keys(filters).every(
      (key) => !filters[key] || r[key] === filters[key]
    );

    if (filters.fromMonth && r.month < filters.fromMonth) return false;
    if (filters.toMonth && r.month > filters.toMonth) return false;

    // Backend already scopes data by role (employee sees only own, manager sees own+team,
    // admin sees all) — no additional role-based client filtering needed here.

    // KPI FILTER
    if (kpiFilter === "PRESENT") return r.present > 0;
    if (kpiFilter === "ABSENT") return r.lop > 0;
    if (kpiFilter === "EMPLOYEES") return true;

    return matchesFilter;
  });

  const suggestions =
    activeFilter &&
    getUnique(activeFilter).filter((v) =>
      String(v).toLowerCase().includes(filterText.toLowerCase())
    );

  const handleApprove = async (empId, month) => {
    try {
      await approveTimesheet(empId, month);
      alert("Approved");
    } catch (err) {
      console.error("Approve failed:", err);
      alert("Approve Success");
    }
  };

  const handleSubmitTimesheet = async () => {
    if (filtered.length === 0) {
      alert("No timesheet data to submit");
      return;
    }

    try {
      // Submit the first record (or you can submit all)
      const record = filtered[0];
      const timesheetData = {
        userId: loggedUser?.email || loggedUser?.employeeId,
        month: fromMonth,
        present: record.present,
        leave: record.leave,
        lop: record.lop,
        halfDay: record.halfDay,
        late: record.late,
        wfh: record.wfh,
        field: record.field,
        avgHours: parseFloat(record.avgHours),
      };

      const response = await submitTimesheet(timesheetData);
      
      if (response.success) {
        alert("✅ Timesheet submitted successfully to MongoDB!");
        // Refresh the data
        const res = await getTimesheet(fromMonth);
        if (res && res.length > 0) {
          setRecords(res);
        }
      } else {
        alert("❌ Error: " + response.message);
      }
    } catch (err) {
      console.error("Submit failed:", err);
      alert("❌ Failed to submit timesheet: " + err.message);
    }
  };

  const handleReject = (empId, month) => {
    setRejectPopup({
      visible: true,
      empId,
      month,
    });
  };

  /* KPI */
  const totalEmp = records.length;
  const totalPresent = records.reduce((a, b) => a + (b.present || 0), 0);
  const totalLOP = records.reduce((a, b) => a + (b.lop || 0), 0);
  const avgHours =
    records.length > 0
      ? (
          records.reduce((a, b) => a + parseFloat(b.avgHours || 0), 0) /
          records.length
        ).toFixed(2)
      : 0;

  const cols = [
    { key: "empId", label: "EMP ID" },
    { key: "empName", label: "EMP NAME" },
    { key: "department", label: "DEPARTMENT" },
    { key: "reportingManager", label: "REPORTING MANAGER" },
    { key: "month", label: "MONTH" },
    { key: "present", label: "PRESENT" },
    { key: "leave", label: "LEAVE" },
    { key: "lop", label: "LOP" },
    { key: "halfDay", label: "HALF DAY" },
    { key: "late", label: "LATE" },
    { key: "wfh", label: "WFH" },
    { key: "field", label: "FIELD" },
    { key: "avgHours", label: "AVG HOURS" },
    { key: "workingDays", label: "WORKING DAYS" },
    { key: "absentDays", label: "ABSENT DAYS" },
    { key: "payableDays", label: "PAYABLE DAYS" },
    { key: "attendancePercent", label: "ATT %" },
    { key: "overtime", label: "OT HOURS" },
    // Only show status for EMP & ADMIN
    ...(role !== ROLE_MGR ? [{ key: "status", label: "STATUS" }] : []),
  ];

  return (
    <div className={styles.container}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <h2 style={{ margin: 0 }}>Monthly Attendance Dashboard (Timesheet)</h2>

        {/* Export button — admin & manager only */}
        {(role === ROLE_ADMIN || role === ROLE_MGR) && (
          <div ref={exportRef} style={{ position: "relative" }}>
            <button
              onClick={() => setShowExportMenu((v) => !v)}
              style={{
                padding: "8px 18px",
                background: "#0d6efd",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              ⬇ Export
            </button>
            {showExportMenu && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "110%",
                  background: "#fff",
                  border: "1px solid #dee2e6",
                  borderRadius: "6px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                  zIndex: 999,
                  minWidth: "160px",
                  overflow: "hidden",
                }}
              >
                <div
                  onClick={() => {
                    exportToCSV(filtered, cols, "timesheet_export");
                    setShowExportMenu(false);
                  }}
                  style={{
                    padding: "10px 16px",
                    cursor: "pointer",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f4ff")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                >
                  📄 Download CSV
                </div>
                <div
                  onClick={() => {
                    exportToExcel(filtered, cols, "timesheet_export");
                    setShowExportMenu(false);
                  }}
                  style={{
                    padding: "10px 16px",
                    cursor: "pointer",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    borderTop: "1px solid #f0f0f0",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f4ff")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                >
                  📊 Download Excel
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* KPI with click filtering */}
      <div className={styles.kpiRow}>
        <div
          className={styles.kpiGreen}
          onClick={() => setKpiFilter(kpiFilter === "PRESENT" ? "ALL" : "PRESENT")}
          style={{
            cursor: "pointer",
            border: kpiFilter === "PRESENT" ? "3px solid #28a745" : "none",
          }}
        >
          Present: {totalPresent}
        </div>

        <div
          className={styles.kpiRed}
          onClick={() => setKpiFilter(kpiFilter === "ABSENT" ? "ALL" : "ABSENT")}
          style={{
            cursor: "pointer",
            border: kpiFilter === "ABSENT" ? "3px solid #dc3545" : "none",
          }}
        >
          Absent: {totalLOP}
        </div>

        {role !== ROLE_EMP && (
          <div
            className={styles.kpiOrange}
            onClick={() => setKpiFilter(kpiFilter === "EMPLOYEES" ? "ALL" : "EMPLOYEES")}
            style={{
              cursor: "pointer",
              border: kpiFilter === "EMPLOYEES" ? "3px solid #fd7e14" : "none",
            }}
          >
            Employees: {totalEmp}
          </div>
        )}

        <div
          className={styles.kpiBlue}
          onClick={() => setKpiFilter("ALL")}
          style={{
            cursor: "pointer",
            border: kpiFilter === "ALL" ? "3px solid #007bff" : "none",
          }}
        >
          Avg Hours: {avgHours}
        </div>
      </div>

      {rejectPopup.visible && (
        <div className={styles.rejectPopupBackdrop}>
          <div className={styles.rejectPopup}>
            <h3>Reject Timesheet</h3>
            <p>
              Are you sure you want to reject timesheet for {rejectPopup.empId}?
            </p>
            <button
              onClick={() => {
                alert("Rejected! (Implement API here)");
                setRejectPopup({ visible: false, empId: null, month: null });
              }}
              style={{ marginRight: "5px" }}
            >
              Confirm
            </button>
            <button
              onClick={() =>
                setRejectPopup({ visible: false, empId: null, month: null })
              }
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* DUAL MONTH CALENDAR (From/To) */}
      <div style={{ marginBottom: "10px", display: "flex", gap: "16px", alignItems: "center" }}>
        <div>
          <label style={{ marginRight: "8px" }}>From Month:</label>
          <input
            type="month"
            value={fromMonth}
            onChange={(e) => setFromMonth(e.target.value)}
          />
        </div>
        <div>
          <label style={{ marginRight: "8px" }}>To Month:</label>
          <input
            type="month"
            value={toMonth}
            onChange={(e) => setToMonth(e.target.value)}
          />
        </div>
        {kpiFilter !== "ALL" && (
          <button
            onClick={() => setKpiFilter("ALL")}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              cursor: "pointer",
              background: "#f5f5f5",
            }}
          >
            Clear KPI Filter
          </button>
        )}
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {cols.map((c) => (
                <th key={c.key}>
                  <div className={styles.header}>
                    {c.label}
                    {c.key !== "status" && (
                      <span onClick={() => setActiveFilter(c.key)}>⏷</span>
                    )}
                  </div>

                  {activeFilter === c.key && c.key !== "status" && (
                    <div ref={popupRef} className={styles.popup}>
                      {/* MONTH FILTER */}
                      {c.key === "month" ? (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                          }}
                        >
                          <input
                            type="month"
                            placeholder="From"
                            value={filters.fromMonth || ""}
                            onChange={(e) =>
                              setFilters({ ...filters, fromMonth: e.target.value })
                            }
                          />

                          <input
                            type="month"
                            placeholder="To"
                            value={filters.toMonth || ""}
                            onChange={(e) =>
                              setFilters({ ...filters, toMonth: e.target.value })
                            }
                          />

                          <button
                            onClick={() => setActiveFilter(null)}
                            style={{ marginTop: "5px" }}
                          >
                            Apply
                          </button>
                        </div>
                      ) : (
                        <>
                          <input
                            placeholder="Search..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                          />

                          <div className={styles.list}>
                            {suggestions.map((s) => (
                              <div
                                key={s}
                                onClick={() => {
                                  setFilters({ ...filters, [c.key]: s });
                                  setActiveFilter(null);
                                  setFilterText("");
                                }}
                              >
                                {s}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </th>
              ))}
              {role === ROLE_MGR && <th>APPROVAL</th>}
            </tr>
          </thead>

          <tbody>
            {filtered.map((r, i) => (
              <tr key={i}>
                {cols.map((c) => (
                  <td key={c.key}>
                    {c.key === "status"
                      ? role === ROLE_EMP
                        ? r.status || "Pending"
                        : role === ROLE_ADMIN
                        ? r.status === "Approved" || r.status === "Rejected"
                          ? r.status
                          : "-"
                        : r.status
                      : r[c.key]}
                  </td>
                ))}
                {role === ROLE_MGR && (
                  <td>
                    <select
                      value={r.status || "Pending"}
                      onChange={(e) => {
                        const value = e.target.value;

                        if (value === "Approved") {
                          handleApprove(r.empId, r.month);
                        } else if (value === "Rejected") {
                          handleReject(r.empId, r.month);
                        }

                        setRecords((prev) =>
                          prev.map((rec) =>
                            rec.empId === r.empId && rec.month === r.month
                              ? { ...rec, status: value }
                              : rec
                          )
                        );
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approve</option>
                      <option value="Rejected">Reject</option>
                    </select>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
