import React, { useState, useMemo, useEffect , useRef} from "react";
import { useContext } from "react";
import { AuthContext } from "../Context/Authcontext";
import axios from "axios";
import * as XLSX from "xlsx";
import { useNavigate , useLocation} from "react-router-dom";
import { getAllEmployees, updateEmployee } from "../api/employeeApi";
import "./Employeedirectory.css";
import InviteEmployee from "../Components/InviteEmployee";
const sampleEmployees = [
  {
    id: "EMP001",
    name: "Raj Kumar",
    designation: "Software Developer",
    department: "IT",
    location: "Bangalore",
    email: "raj@example.com",
    manager: "Nilesh B",
    managerEmail: "nilesh@company.com",
    doj: "2020-05-10",
    dob: "1995-06-22",
    status: "Active",
    exitDate: "-",
    image: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: "EMP002",
    name: "Priya Sharma",
    designation: "HR Manager",
    department: "Human Resources",
    location: "Mumbai",
    email: "priya@example.com",
    manager: "Sujata M",
    managerEmail: "sujata@company.com",
    doj: "2019-08-25",
    dob: "1990-02-15",
    status: "Active",
    exitDate: "-",
    image: "https://i.pravatar.cc/150?img=2",
  },
  {
    id: "EMP003",
    name: "Amit Singh",
    designation: "UI/UX Designer",
    department: "Design",
    location: "Delhi",
    email: "amit@example.com",
    manager: "Raj K",
    managerEmail: "raj.k@company.com",
    doj: "2021-03-15",
    dob: "1997-11-03",
    status: "Resigned",
    exitDate: "2024-09-10",
    image: "https://i.pravatar.cc/150?img=3",
  },
  {
    id: "EMP004",
    name: "Riya Patel",
    designation: "Finance Analyst",
    department: "Finance",
    location: "Hyderabad",
    email: "riya@example.com",
    manager: "Shreya P",
    managerEmail: "shreya@company.com",
    doj: "2018-12-02",
    dob: "1996-09-12",
    status: "Serving Notice",
    exitDate: "2025-02-20",
    image: "https://i.pravatar.cc/150?img=4",
  },
];


function formatDateForCompare(d) {
  if (!d || d === "-") return null;
  const date = new Date(d);
  return isNaN(date.getTime()) ? null : date;
}

export default function EmployeeDirectory() {

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const location = useLocation();
  // Filters
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [managerFilter, setManagerFilter] = useState("");
  const [managerEmailFilter, setManagerEmailFilter] = useState("");
  const [dojFrom, setDojFrom] = useState("");
  const [dojTo, setDojTo] = useState("");
  const [exitFrom, setExitFrom] = useState("");
  const [exitTo, setExitTo] = useState("");
  const [viewMode, setViewMode] = useState("all");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
const [otp, setOtp] = useState("");


const [employees, setEmployees] = useState([]);
const [activeFilter, setActiveFilter] = useState(null);
const [filterText, setFilterText] = useState("");
const [columnFilters, setColumnFilters] = useState({});
const popupRef = useRef();

// ── Update modal state (admin only) ──
const [showUpdateModal, setShowUpdateModal] = useState(false);
const [updateTarget, setUpdateTarget] = useState(null); // the employee being edited
const [updateForm, setUpdateForm] = useState({});
const [updateSaving, setUpdateSaving] = useState(false);

 // ✅ ADD HERE (IMPORTANT)
  const fieldMap = {
    employeename: "fullName",
  employeeId: "employeeId",
    employeedepartment: "department",
    employeedesignation: "designation",
    employeelocation: "location",
    employeeemail: "email",
    employeereporting: "manager",
    employeestatus: "status",
    employeeDOB: "dob",
    employeeDOJ: "doj",
    employeeexitdate: "exitDate",
  };


  useEffect(() => {
  fetchEmployees();
}, []);

useEffect(() => {
  fetchEmployees();
}, [location]);
useEffect(() => {
  const handleClick = (e) => {
    if (popupRef.current && !popupRef.current.contains(e.target)) {
      setActiveFilter(null);
    }
  };
  document.addEventListener("mousedown", handleClick);
  return () => document.removeEventListener("mousedown", handleClick);
}, []);

 const fetchEmployees = async () => {
  try {
    const employees = await getAllEmployees();
    console.log("Employees response:", employees);
    // Ensure response is an array
    if (Array.isArray(employees)) {
      setEmployees(employees);
    } else {
      console.error("Expected array, got:", typeof employees);
      setEmployees([]);
    }
  } catch (err) {
    console.error("Error fetching employees", err);
    setEmployees([]);
  }
};

const getUnique = (key) => {
  return [...new Set(employees.map((e) => e[key]).filter(Boolean))];
};

const suggestions =
  activeFilter &&
  getUnique(activeFilter).filter((v) =>
    String(v).toLowerCase().includes(filterText.toLowerCase())
  );

 // const employees = sampleEmployees;

const styles = {
  input: {
    padding: "8px",
    marginTop: "10px",
    width: "100%",
    borderRadius: "6px",
    border: "1px solid #ccc"
  }
};

 const sendInviteEmployee = async () => {
  try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/onboarding/invite`,
      {
        email: inviteEmail,
        fullName: "Test User",
        department: "IT",
        designation: "Developer",
      }
    );
    console.log("Invite response:", res);
    alert("Invite sent successfully");
    setInviteEmail("");
    setShowInvite(false);
  } catch (err) {
    console.error("FULL ERROR:", err);
    alert("Failed to send invite: " + (err.response?.data?.message || err.message));
  }
};
  // Derived options
  const departments = useMemo(
    () => Array.from(new Set(employees.map((e) => e.department))).sort(),
    [employees]
  );
  const locations = useMemo(
    () => Array.from(new Set(employees.map((e) => e.location))).sort(),
    [employees]
  );
  const managers = useMemo(
    () => Array.from(new Set(employees.map((e) => e.manager))).sort(),
    [employees]
  );
  const managerEmails = useMemo(
    () => Array.from(new Set(employees.map((e) => e.managerEmail))).sort(),
    [employees]
  );
  const statuses = useMemo(
    () => Array.from(new Set(employees.map((e) => e.status))).sort(),
    [employees]
  );

  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  const filteredEmployees = useMemo(() => {
      return employees.filter((emp) => {

    // ✅ ROLE BASED FILTER
if (user?.role === "manager") {
  if (emp.managerEmail !== user?.email) return false;
}

if (user?.role === "employee") {
  if (emp.email !== user?.email) return false;
}
    // COLUMN HEADER FILTERS (NEW - does not affect existing filters)
const matchesColumnFilters = Object.keys(columnFilters).every((key) => {
  if (!columnFilters[key]) return true;


    const actualField = fieldMap[key];   // 🔥 important mapping fix
 

const empValue = emp[actualField];

return String(empValue ?? "")
  .trim()
  .toLowerCase()
  .includes(String(columnFilters[key] ?? "").trim().toLowerCase());
});

if (!matchesColumnFilters) return false;
  
      const empDOB = formatDateForCompare(emp.dob);
      const empDOJ = formatDateForCompare(emp.doj);
      const empExit =
        emp.exitDate && emp.exitDate !== "-" ? formatDateForCompare(emp.exitDate) : null;

      const isBirthday =
        empDOB && empDOB.getMonth() + 1 === currentMonth && empDOB.getDate() === currentDay;
      const isAnniversary =
        empDOJ && empDOJ.getMonth() + 1 === currentMonth && empDOJ.getDate() === currentDay;

      if (viewMode === "birthday" && !isBirthday) return false;
      if (viewMode === "anniversary" && !isAnniversary) return false;
      if (viewMode === "resigned" && (emp.status || "").toUpperCase() === "ACTIVE") return false;

      const lowerSearch = search.trim().toLowerCase();
      if (lowerSearch) {
      const matches =
  (emp.fullName || "").toLowerCase().includes(lowerSearch) ||
  (emp.employeeId || "").toLowerCase().includes(lowerSearch) ||
  (emp.designation || "").toLowerCase().includes(lowerSearch) ||
  (emp.email || "").toLowerCase().includes(lowerSearch);
        if (!matches) return false;
      }

      if (departmentFilter && emp.department !== departmentFilter) return false;
      if (locationFilter && emp.location !== locationFilter) return false;
      if (statusFilter && (emp.status || "").toUpperCase() !== (statusFilter || "").toUpperCase()) return false;
      if (managerFilter && emp.manager !== managerFilter) return false;
      if (managerEmailFilter && emp.managerEmail !== managerEmailFilter) return false;

      if (dojFrom) {
        const from = formatDateForCompare(dojFrom);
        if (!empDOJ || empDOJ < from) return false;
      }
      if (dojTo) {
        const to = formatDateForCompare(dojTo);
        if (!empDOJ || empDOJ > new Date(new Date(to).setHours(23, 59, 59))) return false;
      }
      if (exitFrom) {
        const from = formatDateForCompare(exitFrom);
        if (!empExit || empExit < from) return false;
      }
      if (exitTo) {
        const to = formatDateForCompare(exitTo);
        if (!empExit || empExit > new Date(new Date(to).setHours(23, 59, 59))) return false;
      }

      return true;
    });
  }, [
    employees,
    search,
    departmentFilter,
    locationFilter,
    statusFilter,
    managerFilter,
    managerEmailFilter,
    dojFrom,
    dojTo,
    exitFrom,
    exitTo,
    viewMode,
    currentMonth,
    currentDay,
  ]);

  const clearAll = () => {
    setSearch("");
    setDepartmentFilter("");
    setLocationFilter("");
    setStatusFilter("");
    setManagerFilter("");
    setManagerEmailFilter("");
    setDojFrom("");
    setDojTo("");
    setExitFrom("");
    setExitTo("");
    setViewMode("all");
  };

  const exportExcel = () => {
    const tableData = filteredEmployees.map((emp) => ({
      ID: emp.id,
      Name: emp.name,
      Department: emp.department,
      Designation: emp.designation,
      Location: emp.location,
      Email: emp.email,
      Manager: emp.manager,
      ManagerEmail: emp.managerEmail,
      DOB: emp.dob,
      DOJ: emp.doj,
      ExitDate: emp.exitDate,
      Status: emp.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
    XLSX.writeFile(
      workbook,
      `Employee_Directory_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  const handleAddEmployee = () => {
    navigate("/onboarding"); // redirect to onboarding page
  };

  // ── Open update modal pre-filled with employee data ──
  const openUpdateModal = (emp) => {
    setUpdateTarget(emp);
    setUpdateForm({
      fullName:             emp.fullName             || "",
      department:           emp.department           || "",
      designation:          emp.designation          || "",
      email:                emp.email                || "",
      location:             emp.location             || "",
      manager:              emp.manager              || "",
      managerEmail:         emp.managerEmail         || "",
      dob:                  emp.dob                  || "",
      doj:                  emp.doj                  || "",
      exitDate:             emp.exitDate             || "",
      status:               emp.status               || "",
      bankAccountNumber:    emp.bankAccountNumber    || "",
      ifsc:                 emp.ifsc                 || "",
      uan:                  emp.uan                  || "",
      pfMemberId:           emp.pfMemberId           || "",
      pf:                   emp.pf                   || "",
      esic:                 emp.esic                 || "",
      designationChanged:   emp.designationChanged   || "",
      designationChangedDate: emp.designationChangedDate || "",
    });
    setShowUpdateModal(true);
  };

  const handleUpdateSave = async () => {
    if (!updateTarget) return;
    setUpdateSaving(true);
    try {
      await updateEmployee(updateTarget.employeeId, updateForm);
      alert("✅ Employee updated successfully!");
      setShowUpdateModal(false);
      fetchEmployees(); // refresh table
    } catch (err) {
      console.error("Update failed:", err);
      alert("❌ Failed to update: " + (err.response?.data || err.message));
    } finally {
      setUpdateSaving(false);
    }
  };


 

const getAvatarColor = (name) => {
  if (!name) return "cccccc"; // ✅ prevent crash

  const colors = ["1abc9c", "3498db", "9b59b6", "e67e22", "e74c3c", "2ecc71"];
  let hash = 0;

  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};
  return (
    <div className="directory-container">
      {/* Top Add Employee button */}
      <div className="header-actions" style={{ marginBottom: "10px" }}>
        <button className="add-btn-top" onClick={handleAddEmployee}>
          ➕ Add Employee
        </button>
         <button className="invite-btn-top" onClick={() => setShowInvite(true)}>
    📩 Invite Employee
  </button> 
      </div>

   {showInvite && (
  <div className="invite-modal-overlay">
    <div className="invite-modal">
      <h3>Invite Employee</h3>

      <input
        type="email"
        placeholder="Enter employee email "
        value={inviteEmail}
  onChange={(e) => setInviteEmail(e.target.value)}
      />

      <input
  
  type="text"
  placeholder="Enter Temporary Password "
  onChange={(e) => setOtp(e.target.value)}
/>

    <div className="invite-info">
  The employee will receive an email with a secure onboarding link.
  <br /><br />
  They need to click the link and set their password to access the HRMS portal.
</div>

      <div className="invite-actions">
        <button className="send-btn" onClick={sendInviteEmployee}>
  Send Invite
</button>
        <button className="cancel-btn" onClick={() => setShowInvite(false)}>
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
      {/* ── Update Employee Modal (admin only) ── */}
      {showUpdateModal && updateTarget && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(15,23,42,0.55)",
          backdropFilter: "blur(4px)",
          zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
          padding: "16px"
        }}>
          <div style={{
            background: "#fff",
            borderRadius: 16,
            width: "100%",
            maxWidth: 720,
            maxHeight: "92vh",
            overflowY: "auto",
            boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
            display: "flex",
            flexDirection: "column"
          }}>
            {/* Modal Header */}
            <div style={{
              background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
              borderRadius: "16px 16px 0 0",
              padding: "20px 28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: "50%",
                  background: "rgba(255,255,255,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20
                }}>✏️</div>
                <div>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 17 }}>
                    Update Employee
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 13 }}>
                    {updateTarget.fullName} &nbsp;·&nbsp; {updateTarget.employeeId}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowUpdateModal(false)}
                style={{
                  background: "rgba(255,255,255,0.15)", border: "none",
                  color: "#fff", width: 32, height: 32, borderRadius: "50%",
                  cursor: "pointer", fontSize: 18, display: "flex",
                  alignItems: "center", justifyContent: "center", lineHeight: 1
                }}
              >×</button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "24px 28px", overflowY: "auto" }}>

              {/* Section: Basic Info */}
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: "#2563eb",
                  textTransform: "uppercase", letterSpacing: 1,
                  borderBottom: "2px solid #e0eaff", paddingBottom: 6, marginBottom: 14
                }}>👤 Basic Information</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px" }}>
                  {[
                    { label: "Full Name",    key: "fullName",    icon: "👤" },
                    { label: "Department",   key: "department",  icon: "🏢" },
                    { label: "Designation",  key: "designation", icon: "💼" },
                    { label: "Email",        key: "email",       icon: "📧" },
                    { label: "Location",     key: "location",    icon: "📍" },
                    { label: "Reporting Manager", key: "manager", icon: "👔" },
                    { label: "Manager Email", key: "managerEmail", icon: "📨" },
                  ].map(({ label, key, icon }) => (
                    <div key={key}>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 5 }}>
                        {icon} {label}
                      </label>
                      <input
                        value={updateForm[key] || ""}
                        onChange={(e) => setUpdateForm({ ...updateForm, [key]: e.target.value })}
                        style={{
                          width: "100%", padding: "9px 12px", borderRadius: 8,
                          border: "1.5px solid #e2e8f0", fontSize: 13,
                          boxSizing: "border-box", outline: "none",
                          transition: "border-color 0.2s",
                          background: "#f8fafc"
                        }}
                        onFocus={e => e.target.style.borderColor = "#2563eb"}
                        onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                      />
                    </div>
                  ))}
                  {/* Status dropdown */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 5 }}>
                      🔘 Status
                    </label>
                    <select
                      value={updateForm.status || ""}
                      onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                      style={{
                        width: "100%", padding: "9px 12px", borderRadius: 8,
                        border: "1.5px solid #e2e8f0", fontSize: 13,
                        boxSizing: "border-box", background: "#f8fafc",
                        outline: "none", cursor: "pointer"
                      }}
                    >
                      <option value="">Select Status</option>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INVITED">INVITED</option>
                      <option value="SERVING NOTICE">SERVING NOTICE</option>
                      <option value="RESIGNED">RESIGNED</option>
                      <option value="DISABLED">DISABLED</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section: Dates */}
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: "#7c3aed",
                  textTransform: "uppercase", letterSpacing: 1,
                  borderBottom: "2px solid #ede9fe", paddingBottom: 6, marginBottom: 14
                }}>📅 Dates</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px 16px" }}>
                  {[
                    { label: "Date of Birth",   key: "dob" },
                    { label: "Date of Joining", key: "doj" },
                    { label: "Exit Date",        key: "exitDate" },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 5 }}>
                        {label}
                      </label>
                      <input
                        type="date"
                        value={updateForm[key] || ""}
                        onChange={(e) => setUpdateForm({ ...updateForm, [key]: e.target.value })}
                        style={{
                          width: "100%", padding: "9px 12px", borderRadius: 8,
                          border: "1.5px solid #e2e8f0", fontSize: 13,
                          boxSizing: "border-box", background: "#f8fafc", outline: "none"
                        }}
                        onFocus={e => e.target.style.borderColor = "#7c3aed"}
                        onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Section: Bank & Statutory */}
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: "#059669",
                  textTransform: "uppercase", letterSpacing: 1,
                  borderBottom: "2px solid #d1fae5", paddingBottom: 6, marginBottom: 14
                }}>🏦 Bank & Statutory Details</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px" }}>
                  {[
                    { label: "Bank Account Number", key: "bankAccountNumber" },
                    { label: "IFSC Code",           key: "ifsc" },
                    { label: "UAN",                 key: "uan" },
                    { label: "PF Member ID",        key: "pfMemberId" },
                    { label: "PF Number",           key: "pf" },
                    { label: "ESIC Number",         key: "esic" },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 5 }}>
                        {label}
                      </label>
                      <input
                        value={updateForm[key] || ""}
                        onChange={(e) => setUpdateForm({ ...updateForm, [key]: e.target.value })}
                        style={{
                          width: "100%", padding: "9px 12px", borderRadius: 8,
                          border: "1.5px solid #e2e8f0", fontSize: 13,
                          boxSizing: "border-box", background: "#f8fafc", outline: "none"
                        }}
                        onFocus={e => e.target.style.borderColor = "#059669"}
                        onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Section: Designation Change */}
              <div style={{ marginBottom: 8 }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: "#d97706",
                  textTransform: "uppercase", letterSpacing: 1,
                  borderBottom: "2px solid #fef3c7", paddingBottom: 6, marginBottom: 14
                }}>🔄 Designation Change</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px" }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 5 }}>
                      New Designation
                    </label>
                    <input
                      value={updateForm.designationChanged || ""}
                      onChange={(e) => setUpdateForm({ ...updateForm, designationChanged: e.target.value })}
                      style={{
                        width: "100%", padding: "9px 12px", borderRadius: 8,
                        border: "1.5px solid #e2e8f0", fontSize: 13,
                        boxSizing: "border-box", background: "#f8fafc", outline: "none"
                      }}
                      onFocus={e => e.target.style.borderColor = "#d97706"}
                      onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 5 }}>
                      Change Effective Date
                    </label>
                    <input
                      type="date"
                      value={updateForm.designationChangedDate || ""}
                      onChange={(e) => setUpdateForm({ ...updateForm, designationChangedDate: e.target.value })}
                      style={{
                        width: "100%", padding: "9px 12px", borderRadius: 8,
                        border: "1.5px solid #e2e8f0", fontSize: 13,
                        boxSizing: "border-box", background: "#f8fafc", outline: "none"
                      }}
                      onFocus={e => e.target.style.borderColor = "#d97706"}
                      onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: "16px 28px",
              borderTop: "1px solid #f1f5f9",
              display: "flex", gap: 10, justifyContent: "flex-end",
              flexShrink: 0, background: "#fafbfc",
              borderRadius: "0 0 16px 16px"
            }}>
              <button
                onClick={() => setShowUpdateModal(false)}
                style={{
                  padding: "10px 24px", borderRadius: 8,
                  border: "1.5px solid #e2e8f0",
                  background: "#fff", cursor: "pointer",
                  fontSize: 13, fontWeight: 600, color: "#64748b",
                  transition: "all 0.2s"
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSave}
                disabled={updateSaving}
                style={{
                  padding: "10px 28px", borderRadius: 8, border: "none",
                  background: updateSaving
                    ? "#93c5fd"
                    : "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
                  color: "#fff", cursor: updateSaving ? "not-allowed" : "pointer",
                  fontSize: 13, fontWeight: 700,
                  boxShadow: updateSaving ? "none" : "0 4px 12px rgba(37,99,235,0.35)",
                  transition: "all 0.2s",
                  display: "flex", alignItems: "center", gap: 8
                }}
              >
                {updateSaving ? "⏳ Saving..." : "💾 Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Header */}
      <div className="directory-header">
        <h2>Employee Directory</h2>

        <div className="header-actions">
          <div className="mode-buttons">
            <button
              className={viewMode === "all" ? "active-mode" : ""}
              onClick={() => setViewMode("all")}
            >
              📋 View All
            </button>
            <button
              className={viewMode === "birthday" ? "active-mode" : ""}
              onClick={() => setViewMode("birthday")}
            >
              🎂 Birthdays
            </button>
            <button
              className={viewMode === "anniversary" ? "active-mode" : ""}
              onClick={() => setViewMode("anniversary")}
            >
              🎉 Anniversary
            </button>
            <button
              className={viewMode === "resigned" ? "active-mode" : ""}
              onClick={() => setViewMode("resigned")}
            >
              🚪 Resigned
            </button>
          </div>

          <div className="action-buttons">
            <button className="clear-btn" onClick={clearAll}>
              Clear Filters
            </button>
            <button className="export-btn" onClick={exportExcel}>
              ⬇ Download
            </button>
          </div>
        </div>
      </div>

      {/* Employee Table */}
      <div className="table-wrapper">
        <div className="table-scroll">
  <table className="employee-table">
          <thead>
            <tr className="table-head">
             <th>
  <div className="th-header">
    Profile
   
  </div>

  {activeFilter === "profile" && (
    <div ref={popupRef} className="popup">
      <input
        placeholder="Search..."
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
      />

      <div className="list">
        {suggestions.map((s) => (
          <div
            key={s}
            onClick={() => {
              setColumnFilters({
                ...columnFilters,
                profile: s,
              });
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
              <th>
  <div className="th-header">
    Employee Name
    <span onClick={() => setActiveFilter("employeename")}>⏷</span>
  </div>

  {activeFilter === "employeename" && (
    <div ref={popupRef} className="popup">
      <input
        placeholder="Search..."
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
      />

      <div className="list">
        {suggestions.map((s) => (
          <div
            key={s}
            onClick={() => {
              setColumnFilters({
                ...columnFilters,
                employeename: s,
              });
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
             <th>
  <div className="th-header">
    Emp ID
    <span onClick={() => setActiveFilter("employeeId")}>⏷</span>
  </div>

  {activeFilter === "employeeId" && (
    <div ref={popupRef} className="popup">
      <input
        placeholder="Search..."
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
      />

      <div className="list">
        {suggestions.map((s) => (
          <div
            key={s}
            onClick={() => {
              setColumnFilters({
                ...columnFilters,
                employeeId: s,
              });
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
             <th>
  <div className="th-header">
    Department
    <span onClick={() => setActiveFilter("employeedepartment")}>⏷</span>
  </div>

  {activeFilter === "employeedepartment" && (
    <div ref={popupRef} className="popup">
      <input
        placeholder="Search..."
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
      />

      <div className="list">
        {suggestions.map((s) => (
          <div
            key={s}
            onClick={() => {
              setColumnFilters({
                ...columnFilters,
                employeedepartment: s,
              });
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
            <th>
  <div className="th-header">
    Designation
    <span onClick={() => setActiveFilter("employeedesignation")}>⏷</span>
  </div>

  {activeFilter === "employeedesignation" && (
    <div ref={popupRef} className="popup">
      <input
        placeholder="Search..."
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
      />

      <div className="list">
        {suggestions.map((s) => (
          <div
            key={s}
            onClick={() => {
              setColumnFilters({
                ...columnFilters,
                employeedesignation: s,
              });
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
           <th>
  <div className="th-header">
    Location
    <span onClick={() => setActiveFilter("employeelocation")}>⏷</span>
  </div>

  {activeFilter === "employeelocation" && (
    <div ref={popupRef} className="popup">
      <input
        placeholder="Search..."
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
      />

      <div className="list">
        {suggestions.map((s) => (
          <div
            key={s}
            onClick={() => {
              setColumnFilters({
                ...columnFilters,
                employeelocation: s,
              });
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
             <th>
  <div className="th-header">
    Employee Email
    <span onClick={() => setActiveFilter("employeeId")}>⏷</span>
  </div>

  {activeFilter === "employeeemail" && (
    <div ref={popupRef} className="popup">
      <input
        placeholder="Search..."
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
      />

      <div className="list">
        {suggestions.map((s) => (
          <div
            key={s}
            onClick={() => {
              setColumnFilters({
                ...columnFilters,
                employeeemail: s,
              });
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
            <th>
  <div className="th-header">
    Reporting Manager
    <span onClick={() => setActiveFilter("employeereportingmanager")}>⏷</span>
  </div>

  {activeFilter === "employeereportingmanager" && (
    <div ref={popupRef} className="popup">
      <input
        placeholder="Search..."
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
      />

      <div className="list">
        {suggestions.map((s) => (
          <div
            key={s}
            onClick={() => {
              setColumnFilters({
                ...columnFilters,
                employeereporting: s,
              });
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
             <th>
  <div className="th-header">
    Employee DOB
    <span onClick={() => setActiveFilter("employeeDOB")}>⏷</span>
  </div>

  {activeFilter === "employeeDOB" && (
    <div ref={popupRef} className="popup">
      <input
        placeholder="Search..."
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
      />

      <div className="list">
        {suggestions.map((s) => (
          <div
            key={s}
            onClick={() => {
              setColumnFilters({
                ...columnFilters,
                employeeDOB: s,
              });
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
             <th>
  <div className="th-header">
    Employee DOJ
    <span onClick={() => setActiveFilter("employeeDOJ")}>⏷</span>
  </div>

  {activeFilter === "employeeDOJ" && (
    <div ref={popupRef} className="popup">
      <input
        placeholder="Search..."
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
      />

      <div className="list">
        {suggestions.map((s) => (
          <div
            key={s}
            onClick={() => {
              setColumnFilters({
                ...columnFilters,
                employeeDOJ: s,
              });
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
            <th>
  <div className="th-header">
    Employee ExitDate
    <span onClick={() => setActiveFilter("employeeexitdate")}>⏷</span>
  </div>

  {activeFilter === "employeeexitdate" && (
    <div ref={popupRef} className="popup">
      <input
        placeholder="Search..."
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
      />

      <div className="list">
        {suggestions.map((s) => (
          <div
            key={s}
            onClick={() => {
              setColumnFilters({
                ...columnFilters,
                employeeexitdate: s,
              });
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
              <th>
  <div className="th-header">
    Status
    <span onClick={() => setActiveFilter("employeestatus")}>⏷</span>
  </div>

  {activeFilter === "employeestatus" && (
    <div ref={popupRef} className="popup">
      <input
        placeholder="Search..."
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
      />

      <div className="list">
        {suggestions.map((s) => (
          <div
            key={s}
            onClick={() => {
              setColumnFilters({
                ...columnFilters,
                employeestatus: s,
              });
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
              <th><div className="th-header">Bank Account No.</div></th>
              <th><div className="th-header">IFSC</div></th>
              <th><div className="th-header">UAN</div></th>
              <th><div className="th-header">PF Member ID</div></th>
              <th><div className="th-header">PF</div></th>
              <th><div className="th-header">ESIC</div></th>
              <th><div className="th-header">Designation Changed</div></th>
              <th><div className="th-header">Desig. Changed Date</div></th>
              {user?.role === "admin" && <th>Action</th>}
            </tr>

            {/* Filter row */}
            <tr className="filter-row">
              
             
             
              
            
         
             
             
            </tr>
          </thead>

          <tbody>
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan="12" className="no-data">
                  No employees found
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp, index) => (
                <tr key={`${emp.employeeId}-${emp.email}-${index}`}>
                  <td>
               <img
  src={
    emp.image && emp.image !== ""
      ? emp.image
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.fullName)}&background=${getAvatarColor(emp.fullName)}&color=fff`
  }
  alt={emp.fullName}
  className="profile-pic"
  style={{ cursor: user?.role === "admin" ? "pointer" : "default" }}
  onClick={() => {
    if (user?.role === "admin") {
     navigate("/employee-profile", {
  state: { employee: emp }
});
    }
  }}
/>
                  </td>
                  <td>{emp.fullName}</td> 
                  <td>{emp.employeeId}</td>
                  <td>{emp.department}</td>
                  <td>{emp.designation}</td>
                  <td>{emp.location}</td>
                  <td>{emp.email}</td>
                  <td>
                    {emp.manager}
                    <div className="mgr-email">{emp.managerEmail}</div>
                  </td>
                  <td>{emp.dob}</td>
                  <td>{emp.doj}</td>
                  <td>{emp.exitDate}</td>
                  <td>
                    <span
                      className={`status ${
                        (emp.status || "").toUpperCase() === "ACTIVE"
                          ? "active"
                          : (emp.status || "").toUpperCase() === "SERVING NOTICE"
                          ? "notice"
                          : "resigned"
                      }`}
                    >
                      {emp.status}
                    </span>
                  </td>
                  <td>{emp.bankAccountNumber || "-"}</td>
                  <td>{emp.ifsc || "-"}</td>
                  <td>{emp.uan || "-"}</td>
                  <td>{emp.pfMemberId || "-"}</td>
                  <td>{emp.pf || "-"}</td>
                  <td>{emp.esic || "-"}</td>
                  <td>{emp.designationChanged || "-"}</td>
                  <td>{emp.designationChangedDate || "-"}</td>
                  {user?.role === "admin" && (
                    <td>
                      <button
                        onClick={() => openUpdateModal(emp)}
                        style={{
                          padding: "6px 14px",
                          background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
                          color: "#fff",
                          border: "none",
                          borderRadius: 6,
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 14px rgba(37,99,235,0.5)"}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(37,99,235,0.3)"}
                      >
                        ✏️ Update
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
         </div>
        
        
      </div>
    </div>
  );
}
