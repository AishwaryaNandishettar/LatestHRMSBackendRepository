  // InsuranceClaim.jsx
  import React, { useState, useContext, useEffect , useRef} from "react";
  import { AuthContext } from "../Context/Authcontext";
  import "./InsurancClaim.css";
  import { createClaim, getClaims, updateClaimStatus, updateApprovedAmount } from "../api/insuranceApi";
  import jsPDF from "jspdf";



  const InsuranceClaim = () => {
    
    const { user } = useContext(AuthContext);
  console.log("LOGGED USER:", user);
  console.log("ROLE FROM BACKEND:", user?.role);
    
    useEffect(() => {
    fetchClaims();
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setActiveFilter(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);


  const ROLE_EMP = "employee";
  const ROLE_MGR = "manager";
  const ROLE_ADMIN = "admin";

  const fetchClaims = async () => {
    const data = await getClaims();
    console.log("API DATA:", data); // ✅ ADD THIS
  setClaims([...data]);
  };
  

    const [showForm, setShowForm] = useState(false);
    
  const [activeFilter, setActiveFilter] = useState(null);
 const [filterText, setFilterText] = useState({});
  const popupRef = useRef();

    const [claims, setClaims] = useState([]);
const getUnique = (key) => {
  console.log("FILTER KEY:", key);
  console.log("CLAIMS SAMPLE:", claims[0]);

  return [
    ...new Set(
      (claims || [])
         .map((c) => c?.[key] ?? c?.[key?.toLowerCase?.()])
        .filter((v) => v !== null && v !== undefined && v !== "")
    )
  ];
};

  const [role, setRole] = useState("");



  useEffect(() => {
    if (user?.role) {
      setRole((user.role || "").toLowerCase());
      // Pre-fill employee data for employees
      if ((user.role || "").toLowerCase() === "employee") {
        setFormData(prev => ({
          ...prev,
          employeeName: user?.email || "",
          employeeCode: user?.employeeCode || ""
        }));
      }
    }
  }, [user]);
  const suggestions =
    activeFilter &&
    getUnique(activeFilter).filter((v) =>
      String(v || "")
        .toLowerCase()
        .includes(filterText.toLowerCase())
    );
    const [fromMonth, setFromMonth] = useState("");
  const [toMonth, setToMonth] = useState("");

    const [formData, setFormData] = useState({
      employeeName: "",
      employeeCode: "",
      relationship: "",
      claimType: "",
    fromDate: "",
      toDate: "",
      admittedDays: "",
      hospitalName: "",
      doctorName: "",
      deliveryType: "",
      surgeryType: "",
      amount: "",
      description: "",
      documents: [],
      otherClaimReason: "",
  otherDetails: "",
    });

  const [filters, setFilters] = useState({});


  

    const onStatus = (msg) => {
    if (msg.startsWith("STATUS_UPDATED")) {
      fetchClaims();
    }

    if (msg.startsWith("AMOUNT_UPDATED")) {
      fetchClaims();
    }
  };
    const handleInput = (e) => {
    if (e.target.name === "documents") {
    setFormData({ ...formData, documents: Array.from(e.target.files) });
  }else {
        setFormData({ ...formData, [e.target.name]: e.target.value });
      }
    };

    const exportToCSV = () => {
    const header = [
      "ID,Name,EmpCode,Type,Date,Days,Amount,Approved,Status"
    ];

    const rows = filteredClaims.map(c =>
      [
        c.id,
        c.employeeName,
        c.employeeCode,
        c.claimType,
        c.fromDate,
        c.admittedDays,
        c.amount,
        c.approvedAmount,
        c.status
      ].join(",")
    );

    const csv = [...header, ...rows].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "insurance_claims.csv";
    a.click();
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    let y = 10;

    filteredClaims.forEach((c, i) => {
      doc.text(
        `${i + 1}. ${c.employeeName} - ₹${c.amount} - ${c.status}`,
        10,
        y
      );
      y += 10;
    });

    doc.save("claims.pdf");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.claimType === "Hospitalization" && !formData.hospitalName) {
      alert("Hospital Name is required");
      return;
    }
    if (formData.claimType === "Maternity" && !formData.deliveryType) {
      alert("Delivery Type is required");
      return;
    }
    if (formData.claimType === "Surgery" && !formData.surgeryType) {
      alert("Surgery Type is required");
      return;
    }
    if (formData.claimType === "Other" && !formData.otherClaimReason) {
    alert("Please enter claim reason");
    return;
  }

  try {


    const payload = {
      ...formData,
      admittedDays: Number(formData.admittedDays || 0),
      amount: Number(formData.amount || 0),
      department: user.department || "",
      companyId: user.companyId || "",
      status: "SUBMITTED",
    };

    const res = await createClaim(payload);

    setClaims((prev) => [...prev, res]);
    setShowForm(false);

  } catch (err) {
    console.error("SAVE ERROR:", err?.response?.data || err);
    alert(err?.response?.data?.message || "Error saving claim");
  }
  };
  const updateStatus = async (id, value) => {
    try {
      await updateClaimStatus(id, value);
      await fetchClaims(); // ensure refresh completes
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  const updateApprovedAmountHandler = async (id, value) => {
    await updateApprovedAmount(id, value);
    fetchClaims();
  };

    // ✅ TIMELINE LOGIC
    const getTimeline = (status) => {
      const stages = [
        "Submitted",
        "Manager Approved",
        "HR Approved",
        "Insurance Approved",
        "Settled",
      ];
      const currentIndex = stages.indexOf(status);

      return stages.map((stage, index) => ({
        stage,
        completed: index <= currentIndex,
      }));
    };


  const filteredClaims = claims.filter((claim) => {
    const status = (claim.status || "").toUpperCase();

    // 🔥 EMPLOYEE RESTRICTION (ADD THIS ONLY)
    if (role === ROLE_EMP) {
      if (claim.employeeName !== user?.email && claim.employeeEmail !== user?.email) {
        return false;
      }
    }

  if (role === ROLE_ADMIN) {
   const allowed = [
  "MANAGER_APPROVED",
  "REJECTED",
  "INSURANCE_APPROVED",
  "SETTLED"
];

   if (!allowed.includes(status)) {
  return false;
}
  }

    if (fromMonth && toMonth) {
      const claimMonth = claim.fromDate ? claim.fromDate.substring(0, 7) : "";

      if (claimMonth < fromMonth || claimMonth > toMonth) {
        return false;
      }
    }

    return Object.keys(filters).every((key) => {
      if (!filters[key]) return true;

      return String(claim[key] || "")
        .toLowerCase()
        .includes(filters[key].toLowerCase());
    });
  });
    return (
      <div className="insurance-container">
        <h2>Insurance Claim Management</h2>

        {/* ================= DASHBOARD ================= */}
        <div className="claim-dashboard">
          <div className="card total">
            <h4>Total Claims</h4>
            <p>{claims.length}</p>
          </div>

          <div className="card approved">
            <h4>Approved</h4>
            <p>{claims.filter(c => c.status === "Insurance Approved" || c.status === "Settled").length}</p>
          </div>

          <div className="card pending">
            <h4>Pending</h4>
            <p>{claims.filter(c =>
    ["Submitted", "Manager Approved"].includes(c.status)
  ).length}</p>
          </div>

          <div className="card rejected">
            <h4>Rejected</h4>
            <p>{claims.filter(c => c.status === "Rejected").length}</p>
          </div>

          <div className="card amount">
            <h4>Total Amount</h4>
            <p>₹{claims.reduce((acc, c) => acc + Number(c.amount || 0), 0)}</p>
          </div>
        </div>
      
  
  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
    <button onClick={exportToCSV} className="export-btn">
      Export CSV
    </button>
  </div>


  <div style={{ marginBottom: 10, fontWeight: "bold" }}>
    Logged in as {role?.toUpperCase()}
  </div>
        {/* FILTER */}
        {!showForm && (
    <div className="filter-section">
          <input
            type="text"
            placeholder="Employee Name"
            onChange={(e) => setFilters({ ...filters, employeeName: e.target.value })}
          />

          <input
            type="text"
            placeholder="Department"
            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
          />
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
    <label>From:</label>
    <input
      type="month"
      onChange={(e) => setFromMonth(e.target.value)}
    />

    <label>To:</label>
    <input
      type="month"
      onChange={(e) => setToMonth(e.target.value)}
    />
  </div>


      <select onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
    <option value="">Status</option>

  

    {role === ROLE_ADMIN && (
      <>
        <option value="Manager Approved">Pending</option>
        <option value="Insurance Approved">Approved</option>
        <option value="Rejected">Rejected</option>
      </>
    )}
  </select>

        {(role === ROLE_ADMIN || role === ROLE_EMP) && (
    <button className="new-claim-btn" onClick={() => setShowForm(!showForm)}>
      + New Claim
    </button>
  )}
        </div>
        )}

        {/* CLAIM FORM */}
        {(role === ROLE_ADMIN || role === ROLE_EMP) && showForm && (
          <div className="claim-form">
            <h3>Create New Claim</h3>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                
                <input name="employeeName" placeholder="Employee Name *" value={role === ROLE_EMP ? user?.email || "" : formData.employeeName} onChange={handleInput} required readOnly={role === ROLE_EMP} />
                <input name="employeeCode" placeholder="Employee Code *" value={role === ROLE_EMP ? user?.employeeCode || "" : formData.employeeCode} onChange={handleInput} required readOnly={role === ROLE_EMP} />
                  <select name="relationship" onChange={handleInput} required>
    <option value="">Relationship *</option>
    <option value="Father">Father</option>
    <option value="Mother">Mother</option>
    <option value="Wife">Wife</option>
    <option value="Husband">Husband</option>
    <option value="Brother">Brother</option>
    <option value="Other">Other</option>
  </select>
                <select name="claimType" onChange={handleInput} required>
                  <option value="">Select Claim Type</option>
                  <option value="Hospitalization">Hospitalization</option>
                  <option value="Maternity">Maternity</option>
                  <option value="Surgery">Surgery</option>
                  <option value="Medical">Medical</option>
                  <option value="Accident">Accident</option>
                  <option value="Other">Other</option>
                </select>
                
            <div className="date-range">
    <input
      type="date"
      name="fromDate"
      onChange={handleInput}
      required
    />

    <span className="date-separator">to</span>

    <input
      type="date"
      name="toDate"
      onChange={handleInput}
      required
    />
  </div>
  <input type="number" name="admittedDays" placeholder="No of Admitted Days" onChange={handleInput} />
                <input type="number" name="amount" placeholder="Claim Amount *" onChange={handleInput} required />
              </div>

              {/* Dynamic Fields */}
              {formData.claimType === "Hospitalization" && (
                <div className="form-grid">
                  <input name="hospitalName" placeholder="Hospital Name *" onChange={handleInput} required />
                  <input name="doctorName" placeholder="Doctor Name *" onChange={handleInput} required />
                </div>
              )}

              {formData.claimType === "Maternity" && (
                <div className="form-grid">
                  <select name="deliveryType" onChange={handleInput} required>
                    <option value="">Delivery Type *</option>
                    <option value="Normal">Normal</option>
                    <option value="C-Section">C-Section</option>
                  </select>
                  <input name="hospitalName" placeholder="Hospital Name *" onChange={handleInput} required />
                </div>
              )}

              {formData.claimType === "Surgery" && (
                <div className="form-grid">
                  <input name="surgeryType" placeholder="Surgery Type *" onChange={handleInput} required />
                  <input name="hospitalName" placeholder="Hospital Name *" onChange={handleInput} required />
                </div>
              )}

              {formData.claimType === "Medical" && (
                <div className="form-grid">
                  <input name="doctorName" placeholder="Doctor Name *" onChange={handleInput} required />
                </div>
              )}

              {formData.claimType === "Other" && (
    <div className="form-grid">
      <input
        name="otherClaimReason"
        placeholder="Enter Claim Reason *"
        onChange={handleInput}
        required
      />

      <input
        name="otherDetails"
        placeholder="Additional Details"
        onChange={handleInput}
      />
    </div>
  )}

              <textarea name="description" placeholder="Description" onChange={handleInput}></textarea>
              <input type="file" name="documents" multiple onChange={handleInput} />

  {formData.documents.length > 0 && (
    <ul>
      {formData.documents.map((file, index) => (
        <li key={index}>{file.name}</li>
      ))}
    </ul>
  )}
              <button type="submit" className="submit-btn">
                Submit Claim
              </button>

              <button
      type="button"
      className="cancel-btn"
      onClick={() => setShowForm(false)}
    >
      Close
    </button>
            </form>
          </div>
        )}

        {/* TABLE */}
        <table className="claim-table">
  <thead>
    <tr>
      {[
        { label: "Employee ID", key: "id" },
        { label: "Employee Name", key: "employeeName" },
          { label: "Department", key: "department" },   // ✅ ADD
    { label: "Reporting Manager", key: "managerName" }, // ✅ ADD
        { label: "Emp Code", key: "employeeCode" },
        { label: "Claim Type", key: "claimType" },
        { label: "Claim Raised Date", key: "fromDate" },
          { label: "Claim Settled Date", key: "claimSettledDate" }, // ✅ ADD
        { label: "Admitted Days", key: "admittedDays" },
        { label: "Claim Amount", key: "amount" },
        { label: "Approved Amount", key: "approvedAmount" },
        { label: "Status", key: "status" }
      ].map(col => (
        <th key={col.key} style={{ position: "relative" }}>
          <div
            onClick={() => {
  setActiveFilter(col.key);
  setFilterText("");
}}
            style={{ cursor: "pointer" }}
          >
            {col.label} ⏷
          </div>

      
          
          {activeFilter === col.key && (
    <div className="filter-popup" ref={popupRef}>
        {/* 🔥 SEARCH BOX */}
  <input
    type="text"
    placeholder="Search..."
    value={filterText}
    onChange={(e) => setFilterText(e.target.value)}
    style={{
      width: "90%",
      padding: "6px",
      margin: "6px",
      border: "1px solid #ccc",
      borderRadius: "4px"
    }}
  />
      {(filterText
  ? suggestions
  : getUnique(col.key)
).map((val, i) => (
        <div
          key={i}
          onClick={() => {
            setFilters({
              ...filters,
              [col.key]: val
            });
            setActiveFilter(null);
          }}
          style={{
            padding: "6px 10px",
            cursor: "pointer"
          }}
        >
          {val || "Empty"}
        </div>
      ))}
    </div>
  )}
        </th>
      ))}

  {role === ROLE_MGR && <th>Actions</th>}
    </tr>
  </thead>

          <tbody>
            {filteredClaims.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.employeeName}</td>
                <td>{c.department || "-"}</td>
  <td>{c.managerName || "-"}</td>
                <td>{c.employeeCode}</td>
                <td>{c.claimType}</td>
                <td>{c.fromDate || "-"}</td>
                <td>{c.claimSettledDate || "-"}</td>
                <td>{c.admittedDays}</td>
                <td>₹{c.amount}</td>

                <td>
                {(role === ROLE_MGR || role === ROLE_ADMIN) ? (
                  <input
    type="number"
    value={c.approvedAmount}
    onChange={(e) => updateApprovedAmount(c.id, e.target.value)}
    style={{ border: "none", background: "transparent", width: "80px", textAlign: "center" }}
  />
                  ) : c.approvedAmount}
                </td>
  <td className="status">
    {c.status}
  </td>

              

            {role === ROLE_MGR && (
    <td>
      {c.status === "SUBMITTED" || c.status === "Pending" ? (
        <select
          value=""
          onChange={(e) => {
            const value = e.target.value;

            if (value === "Manager Approved") {
              updateStatus(c.id, "Manager Approved");
            } else if (value === "Rejected") {
              updateStatus(c.id, "Rejected");
            }
          }}
        >
          <option value="">Action</option>
          <option value="Manager Approved">Approve</option>
          <option value="Rejected">Reject</option>
        </select>
      ) : (
        <span style={{ color: "green", fontWeight: "500" }}>
          Done
        </span>
      )}
    </td>
  )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  export default InsuranceClaim;