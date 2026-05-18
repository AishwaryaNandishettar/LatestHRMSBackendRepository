import { useEffect, useState, useContext, useRef } from "react";
import "./Attendance.css";
import { AttendanceContext } from "../Context/AttendanceContext";
import {
  getMyAttendance,
  getManagerAttendance,
  getAllAttendance,
  checkIn as apiCheckIn,
  checkOut as apiCheckOut,
} from "../api/attendanceApi";

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

export default function Attendance() {
  const today = new Date().toLocaleDateString("en-CA");
  const [selectedDate, setSelectedDate] = useState(today);

  const { refresh } = useContext(AttendanceContext);

  const [activeFilter, setActiveFilter] = useState(null);
  const [filterText, setFilterText] = useState("");
  const [filters, setFilters] = useState({});
  const popupRef = useRef();

  const [records, setRecords] = useState([]);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [empSearch, setEmpSearch] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportRef = useRef();

  const loggedUser = getLoggedUser();
  const role = loggedUser?.role?.toLowerCase();

  /* ================= FETCH RECORDS ================= */
  const fetchRecords = async () => {
    try {
      let response;

      if (role === "employee") {
        // Use userId (MongoDB _id) as the primary key for attendance lookup
        const userId =
          loggedUser.id ||
          loggedUser._id ||
          loggedUser.employeeId ||
          loggedUser.empId;
        response = await getMyAttendance(userId);
      } else if (role === "manager") {
        // Manager sees their own + their team's attendance
        const managerEmail = loggedUser.email;
        response = await getManagerAttendance(managerEmail);
      } else {
        // Admin sees all
        response = await getAllAttendance();
      }

      const rawData = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.content)
        ? response.content
        : [];

      // Map backend DTO fields to frontend display fields
      const data = rawData.map((r) => ({
        userId: r.userId || "-",
        empId: r.empId || r.employeeId || r.userId || "-",
        name: r.name || r.employeeName || r.fullName || "-",
        department: r.department || r.dept || "-",
        managerId: r.managerId || "-",
        managerEmail: r.managerEmail || r.managerId || "-",
        reportingManager:
          r.reportingManager || r.managerName || r.managerEmail || "-",
        tos: r.tos || "-",
        date: r.date || "-",
        checkIn: r.checkIn || "-",
        checkOut: r.checkOut || "-",
        locationIn: r.locationIn || "-",
        locationOut: r.locationOut || "-",
        late: r.late || "No",
        earlyLeave: r.earlyLeave || "-",
        status: r.status || "Pending Approval",
        attendanceType: r.attendanceType || r.type || "Office",
      }));

      setRecords(data);
    } catch (err) {
      console.error("Attendance fetch failed", err);
    }
  };

  /* ================= CLICK OUTSIDE HANDLERS ================= */
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

  useEffect(() => {
    fetchRecords();
  }, []);

  // Live auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRecords();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  /* ================= CHECK IN ================= */
  const handleCheckIn = async () => {
    const userId =
      loggedUser.id || loggedUser._id || loggedUser.employeeId || loggedUser.empId;

    // Check if already checked in for selected date
    const existingRecord = records.find(
      (r) =>
        r.date === selectedDate &&
        String(r.userId).trim().toLowerCase() ===
          String(userId).trim().toLowerCase()
    );

    if (existingRecord) {
      alert("Already checked in for selected date");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const time = new Date().toLocaleTimeString();
        const hour = new Date().getHours();

        try {
          await apiCheckIn({
            userId: String(userId).trim(),
            empId: loggedUser.employeeId || loggedUser.empId || "-",
            name: loggedUser.name || loggedUser.employeeName || "N/A",
            department: loggedUser.department || "General",
            date: selectedDate,
            checkIn: time,
            locationIn: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
            reportingManager:
              loggedUser.managerName || loggedUser.managerEmail || "-",
            managerId: loggedUser.managerId || "-",
            managerEmail: loggedUser.managerEmail || loggedUser.email || "-",
            tos: loggedUser.tos || "-",
            attendanceType: "Office",
            status: "Pending Approval",
            late: hour > 9 ? "Yes" : "No",
          });

          alert("Check-in successful");
          setTimeout(async () => {
            await fetchRecords();
          }, 500);

          if (refresh) refresh();
        } catch (err) {
          console.error("Check-in failed", err);
          alert("Check-in failed");
        }
      },
      () => {
        alert("Location access denied. Please allow location to check in.");
      }
    );
  };

  /* ================= CHECK OUT ================= */
  const handleCheckOut = async () => {
    const userId =
      loggedUser.id || loggedUser._id || loggedUser.employeeId || loggedUser.empId;

    const recordToUpdate = records.find(
      (r) =>
        r.date === selectedDate &&
        String(r.userId).trim().toLowerCase() ===
          String(userId).trim().toLowerCase()
    );

    if (!recordToUpdate) {
      alert("Check-in first before checking out");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const time = new Date().toLocaleTimeString();

        try {
          await apiCheckOut({
            userId: String(userId).trim(),
            name: recordToUpdate.name || loggedUser.name,
            date: recordToUpdate.date,
            checkOut: time,
            locationOut: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
            managerId: loggedUser.managerId || "-",
            managerEmail: loggedUser.managerEmail || loggedUser.email || "-",
          });

          alert("Check-out successful");
          fetchRecords();
          if (refresh) refresh();
        } catch (err) {
          console.error("Check-out failed", err);
          alert("Check-out failed");
        }
      },
      () => {
        alert("Location access denied. Please allow location to check out.");
      }
    );
  };

  /* ================= WORK FROM HOME ================= */
  const handleWorkFromHome = async () => {
    const userId =
      loggedUser.id || loggedUser._id || loggedUser.employeeId || loggedUser.empId;

    const existingRecord = records.find(
      (r) =>
        r.date === selectedDate &&
        String(r.userId).trim().toLowerCase() ===
          String(userId).trim().toLowerCase()
    );

    if (existingRecord) {
      alert("Already marked attendance for selected date");
      return;
    }

    const time = new Date().toLocaleTimeString();
    const hour = new Date().getHours();

    try {
      await apiCheckIn({
        userId: String(userId).trim(),
        empId: loggedUser.employeeId || loggedUser.empId || "-",
        name: loggedUser.name || loggedUser.employeeName || "N/A",
        department: loggedUser.department || "General",
        date: selectedDate,
        checkIn: time,
        locationIn: "WFH",
        reportingManager:
          loggedUser.managerName || loggedUser.managerEmail || "-",
        managerId: loggedUser.managerId || "-",
        managerEmail: loggedUser.managerEmail || loggedUser.email || "-",
        tos: loggedUser.tos || "-",
        attendanceType: "Work From Home",
        status: "Pending Approval",
        late: hour > 9 ? "Yes" : "No",
      });

      alert("Work From Home marked successfully");
      setTimeout(async () => {
        await fetchRecords();
      }, 500);

      if (refresh) refresh();
    } catch (err) {
      console.error("WFH mark failed", err);
      alert("Work From Home marking failed");
    }
  };

  /* ================= CALCULATE HOURS ================= */
  const calculateHours = (checkIn, checkOut) => {
    if (!checkIn || checkIn === "-") return "-";

    const parseTime = (timeStr) => {
      const now = new Date();
      return new Date(`${now.toDateString()} ${timeStr}`);
    };

    const start = parseTime(checkIn);
    const end =
      checkOut && checkOut !== "-" ? parseTime(checkOut) : new Date();

    const diff = end - start;
    if (diff < 0) return "-";

    const hrs = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hrs}h ${mins}m ${secs}s`;
  };

  /* ================= FILTER & SEARCH ================= */
  const searchFiltered =
    (role === "admin" || role === "manager") && empSearch.trim()
      ? records.filter(
          (r) =>
            String(r.name).toLowerCase().includes(empSearch.toLowerCase()) ||
            String(r.empId).toLowerCase().includes(empSearch.toLowerCase())
        )
      : records;

  const getUnique = (key) => [...new Set(searchFiltered.map((r) => r[key]))];

  const filteredRecordsFinal = searchFiltered
    .filter((r) =>
      Object.keys(filters).every((key) => r[key] === filters[key])
    )
    .filter((r) => {
      if (!fromDate && !toDate) return true;
      const recordDate = new Date(r.date);
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;
      if (from && recordDate < from) return false;
      if (to && recordDate > to) return false;
      return true;
    })
    // ✅ Sort by date descending — latest check-in at top, oldest at bottom
    .sort((a, b) => {
      const dateCompare = new Date(b.date) - new Date(a.date);
      if (dateCompare !== 0) return dateCompare;
      // Same date: sort by check-in time descending
      const timeA = a.checkIn && a.checkIn !== "-" ? a.checkIn : "00:00:00";
      const timeB = b.checkIn && b.checkIn !== "-" ? b.checkIn : "00:00:00";
      return timeB.localeCompare(timeA);
    });

  const suggestions =
    activeFilter &&
    getUnique(activeFilter).filter((v) =>
      String(v).toLowerCase().includes(filterText.toLowerCase())
    );

  /* ================= EXPORT ================= */
  const buildExportData = () => {
    const headers = [
      "EMP ID",
      "Login Date",
      "Emp Name",
      "DEPT",
      "REPORTING MANAGER",
      "CHECK IN",
      "CHECK OUT",
      "TOTAL HOURS",
      "IN LOCATION",
      "OUT LOCATION",
      "LATE",
      "EARLY",
      "STATUS",
      "TOS",
      "TYPE",
    ];

    const rows = filteredRecordsFinal.map((r) => [
      r.empId,
      r.date,
      r.name,
      r.department,
      r.reportingManager,
      r.checkIn,
      r.checkOut,
      calculateHours(r.checkIn, r.checkOut),
      r.locationIn,
      r.locationOut,
      r.late,
      r.earlyLeave,
      r.status,
      r.tos,
      r.attendanceType,
    ]);

    return { headers, rows };
  };

  const handleExportCSV = () => {
    const { headers, rows } = buildExportData();
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows]
        .map((e) =>
          e
            .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
            .join(",")
        )
        .join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "attendance_report.csv";
    link.click();
    setShowExportMenu(false);
  };

  const handleExportExcel = () => {
    const { headers, rows } = buildExportData();

    let tableHtml =
      "<table><tr>" +
      headers.map((h) => `<th>${h}</th>`).join("") +
      "</tr>";
    rows.forEach((row) => {
      tableHtml +=
        "<tr>" + row.map((v) => `<td>${v ?? ""}</td>`).join("") + "</tr>";
    });
    tableHtml += "</table>";

    const excelContent =
      "data:application/vnd.ms-excel;charset=utf-8," +
      encodeURIComponent(tableHtml);

    const link = document.createElement("a");
    link.href = excelContent;
    link.download = "attendance_report.xls";
    link.click();
    setShowExportMenu(false);
  };

  /* ================= TABLE COLUMNS ================= */
  const columns = [
    { key: "empId", label: "EMP ID" },
    { key: "date", label: "Login Date" },
    { key: "name", label: "Emp Name" },
    { key: "department", label: "DEPT" },
    ...(role === "admin" || role === "manager"
      ? [{ key: "reportingManager", label: "REPORTING MANAGER" }]
      : []),
    { key: "checkIn", label: "CHECK IN" },
    { key: "checkOut", label: "CHECK OUT" },
    { key: "total", label: "TOTAL HOURS" },
    { key: "locationIn", label: "IN LOCATION" },
    { key: "locationOut", label: "OUT LOCATION" },
    { key: "late", label: "LATE" },
    { key: "earlyLeave", label: "EARLY" },
    { key: "status", label: "STATUS" },
    { key: "tos", label: "TOS" },
    { key: "attendanceType", label: "TYPE" },
  ];

  /* ================= RENDER ================= */
  return (
    <div className="attendance-container">
      <h2>Attendance Management</h2>

      <div className="top-panel">
        <div className="date-section">
          <label>Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <p>
            User: {loggedUser.name} ({loggedUser.role})
          </p>
        </div>

        <div className="button-group">
          {role === "admin" && (
            <div style={{ position: "relative" }} ref={exportRef}>
              <button
                className="export"
                onClick={() => setShowExportMenu((prev) => !prev)}
              >
                Export ▾
              </button>
              {showExportMenu && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    background: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    zIndex: 999,
                    minWidth: "150px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    onClick={handleExportCSV}
                    style={{
                      padding: "10px 16px",
                      cursor: "pointer",
                      borderBottom: "1px solid #eee",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f5f5f5")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "#fff")
                    }
                  >
                    📄 Download CSV
                  </div>
                  <div
                    onClick={handleExportExcel}
                    style={{ padding: "10px 16px", cursor: "pointer" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f5f5f5")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "#fff")
                    }
                  >
                    📊 Download Excel
                  </div>
                </div>
              )}
            </div>
          )}

          <>
            <button className="checkin" onClick={handleCheckIn}>
              Check In
            </button>
            <button className="checkout" onClick={handleCheckOut}>
              Check Out
            </button>
            <button className="wfh" onClick={handleWorkFromHome}>
              Work From Home
            </button>
          </>
        </div>
      </div>

      {/* Date range + search filter (admin/manager) */}
      {(role === "admin" || role === "manager") && (
        <div
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
            margin: "10px 0",
            flexWrap: "wrap",
          }}
        >
          <div>
            <label>From: </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div>
            <label>To: </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Search by name or EMP ID..."
              value={empSearch}
              onChange={(e) => setEmpSearch(e.target.value)}
              style={{
                padding: "6px 10px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                minWidth: "220px",
              }}
            />
          </div>
          {(fromDate || toDate || empSearch || Object.keys(filters).length > 0) && (
            <button
              onClick={() => {
                setFromDate("");
                setToDate("");
                setEmpSearch("");
                setFilters({});
              }}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                cursor: "pointer",
                background: "#f5f5f5",
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>
                  <div className="header">
                    {col.label}
                    {col.key !== "total" && (
                      <span onClick={() => setActiveFilter(col.key)}>⏷</span>
                    )}
                  </div>

                  {activeFilter === col.key && (
                    <div ref={popupRef} className="popup">
                      <input
                        placeholder="Search..."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                      />
                      <div className="list">
                        {(suggestions || []).map((s) => (
                          <div
                            key={s}
                            onClick={() => {
                              setFilters({ ...filters, [col.key]: s });
                              setActiveFilter(null);
                              setFilterText("");
                            }}
                          >
                            {s}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredRecordsFinal.length > 0 ? (
              filteredRecordsFinal.map((r, index) => (
                <tr key={index}>
                  <td>{r.empId || "-"}</td>
                  <td>{r.date}</td>
                  <td>{r.name}</td>
                  <td>{r.department}</td>

                  {(role === "admin" || role === "manager") && (
                    <td>{r.reportingManager || "-"}</td>
                  )}

                  <td>{r.checkIn}</td>
                  <td>{r.checkOut && r.checkOut !== "-" ? r.checkOut : "-"}</td>
                  <td>{calculateHours(r.checkIn, r.checkOut)}</td>
                  <td>{r.locationIn}</td>
                  <td>{r.locationOut}</td>
                  <td>{r.late}</td>
                  <td>{r.earlyLeave}</td>
                  <td>{r.status}</td>
                  <td>{r.tos}</td>
                  <td>{r.attendanceType || "Office"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="15" style={{ textAlign: "center" }}>
                  No attendance records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
