import React, { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../Context/Authcontext";
import "./Reimbursement.css";
import {
  getReimbursements,
  createReimbursement,
  updateReimbursementStatus
} from "../api/reimbursementApi";

const ROLE_EMP = "employee";
const ROLE_MGR = "manager";
const ROLE_ADMIN = "admin";

const STATUS_PENDING = "Pending";
const STATUS_MGR_APPR = "Manager Approved";
const STATUS_APPROVED = "Approved";
const STATUS_REJECTED = "Rejected";


const Reimbursement = () => {

  const exportReimbursementCSV = () => {
  const header = ["ID,Name,EmpCode,Vehicle,Amount,Date,Status"];

  const rows = filteredData.map(r =>
    [
      r.id,
      r.empName,
      r.empCode,
      r.vehicleType,
      r.amount,
      r.incidentDate,
      r.status
    ].join(",")
  );

  const csv = [...header, ...rows].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "reimbursements.csv";
  a.click();
};

  const { user } = useContext(AuthContext) || {};
  const role = user?.role;

  const [requests, setRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
const [activeFilter, setActiveFilter] = useState(null);
const [filterText, setFilterText] = useState("");
const popupRef = useRef();
const getUnique = (key) => [
  ...new Set(requests.map((r) => r[key]))
];

const suggestions =
  activeFilter &&
  getUnique(activeFilter).filter((v) =>
    String(v || "")
      .toLowerCase()
      .includes(filterText.toLowerCase())
  );
 const [filters, setFilters] = useState({});

  
  const [form, setForm] = useState({
    empName: "",
    empCode: "",
     claimType: "",   // 👈 ADD THIS
      "location": "",
    "pincode": "",
    "state": "",
    "district": "",
    "checkIn": "",
    "checkOut": "",
    vehicleType: "",
    incidentDate: "",
    hospitalName: "",
    billNumber: "",
    settlementDate: "",
    travelFromDate: "",
    travelToDate: "",
    fromLocation: "",
    toLocation: "",
    policyNumber: "",
    amount: "",
    description: "",
    files: [],
    otherTitle: "",
  otherReference: "",
  submittedDate: "",
  accommodationType: "",
  receiptNumber: ""
  });

  // ================= FETCH =================
  useEffect(() => {
    loadData();
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
 

useEffect(() => {
  if (form.claimType === "ACCOMMODATION" || form.claimType === "MEDICAL" || form.claimType==="others") {
    setForm((prev) => ({
      ...prev,
      hospitalName: "",
    billNumber: "",
    medicalHospital: "",
    medicalBillNumber: "",
    incidentDate: "",
    settlementDate: "",
    travelFromDate: "",
    travelToDate: "",
    vehicleType: ""
    }));
  }
}, [form.claimType]);
 const loadData = async () => {
  const res = await getReimbursements({
    role: user?.role,
    empCode: user?.empCode
  });

  setRequests(res.data);
};

  // ================= CREATE =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
     const formData = new FormData();

// append normal fields
Object.keys(form).forEach((key) => {
  if (key !== "files") {
    formData.append(key, form[key]);
  }
});

// append multiple files
if (form.files && form.files.length > 0) {
  form.files.forEach((file) => {
    formData.append("files", file);
  });
}

formData.append("amount", Number(form.amount));
formData.append("status", STATUS_PENDING);
formData.append("submittedDate", new Date().toISOString());

await createReimbursement(formData);

      loadData();
      setShowForm(false);

    } catch (err) {
      console.error(err);
    }
  };

  // ================= STATUS =================
  const handleStatusChange = async (id, status) => {
    await updateReimbursementStatus(id, status);
    loadData();
  };

  // ================= FILTER =================
const filteredData = requests.filter((r) => {

  // EMPLOYEE → only own records
  if (role === ROLE_EMP) {
    if (user?.empCode !== r.empCode) return false;
  }

  // MANAGER → see all employees
  if (role === ROLE_MGR) {
    return true;
  }

  // ADMIN → see ALL records
  if (role === ROLE_ADMIN) {
    return true;
  }

  return Object.keys(filters).every((key) => {
    if (!filters[key]) return true;

    return String(r[key] || "")
      .toLowerCase()
      .includes(filters[key].toLowerCase());
  });
});


  // ================= KPI =================
  const total = requests.length;
  const approved = requests.filter(r => r.status === STATUS_APPROVED).length;
  const pending = requests.filter(r => r.status === STATUS_PENDING).length;
  const rejected = requests.filter(r => r.status === STATUS_REJECTED).length;
  const totalAmount = requests.reduce((a, r) => a + Number(r.amount || 0), 0);

  return (
    <div className="insurance-container">
      <h2>Reimbursement Management</h2>

      {/* ================= KPI CARDS ================= */}
      <div className="claim-dashboard">
        <div className="card total"><h4>Total</h4><p>{total}</p></div>
        <div className="card approved"><h4>Approved</h4><p>{approved}</p></div>
        <div className="card pending"><h4>Pending</h4><p>{pending}</p></div>
        <div className="card rejected"><h4>Rejected</h4><p>{rejected}</p></div>
        <div className="card amount"><h4>Total Amount</h4><p>₹{totalAmount}</p></div>
      </div>

      {/* ================= ROLE SWITCH ================= */}
 
      {/* ================= FILTER ================= */}
      {!showForm && (
        <div className="filter-section">
          <input placeholder="Employee Name" onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
          <input placeholder="Department" onChange={(e) => setFilters({ ...filters, department: e.target.value })} />

          <select onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">Status</option>
            <option value={STATUS_PENDING}>Pending</option>
            <option value={STATUS_MGR_APPR}>Manager Approved</option>
            <option value={STATUS_APPROVED}>Approved</option>
            <option value={STATUS_REJECTED}>Rejected</option>
          </select>

          <button className="search-btn">Search</button>

         <button className="export-btn" onClick={exportReimbursementCSV}>
  Export
</button>

          <button className="new-claim-btn" onClick={() => setShowForm(true)}>
            + New Claim
          </button>
        </div>
      )}

      {/* ================= FORM ================= */}
      {showForm && (
        <div className="claim-form">
          <h3>New Reimbursement</h3>

          <form onSubmit={handleSubmit}>
      
<div className="form-grid top-compact">

  <div className="form-field">
    <label>Employee Name</label>
    <input
      type="text"
      onChange={(e) => setForm({ ...form, empName: e.target.value })}
      required
    />
  </div>

  <div className="form-field">
    <label>Employee Code</label>
    <input
      type="text"
      onChange={(e) => setForm({ ...form, empCode: e.target.value })}
      required
    />
  </div>

  <div className="form-field">
    <label>Claim Type</label>
    <select
      value={form.claimType}
      onChange={(e) => setForm({ ...form, claimType: e.target.value })}
      required
    >
      <option value="">Select</option>
      <option value="TRAVEL">Travel</option>
      <option value="ACCOMMODATION">Accommodation</option>
      <option value="MEDICAL">Medical</option>
      <option value="OTHERS">Others</option>
    </select>
  </div>

</div>
            <div className="form-grid">
              

            

   {/* 👇 KEEP VEHICLE ONLY FOR TRAVEL */}
{form.claimType === "TRAVEL" && (
  <select
    onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
    required
  >
    <option value="">Select Travel Mode</option>
    <option>Bike</option>
    <option>Bus</option>
    <option>Flight</option>
    <option>Taxi</option>
  </select>
)}


              

 

    {/* LOCATION ONLY FOR TRAVEL (NOT MEDICAL) */}
{form.claimType === "TRAVEL" && (
  <>
    <input
      placeholder="From Location"
      onChange={(e) =>
        setForm({ ...form, fromLocation: e.target.value })
      }
    />

    <input
      placeholder="To Location"
      onChange={(e) =>
        setForm({ ...form, toLocation: e.target.value })
      }
    />
  </>
)}
           

 

             

              <input type="number" placeholder="Amount" onChange={(e) => setForm({ ...form, amount: e.target.value })} />

            </div>

            <textarea placeholder="Description" onChange={(e) => setForm({ ...form, description: e.target.value })} />

           <input
  type="file"
  multiple
  onChange={(e) =>
    setForm({ ...form, files: Array.from(e.target.files) })
  }
/>
{form.files && form.files.length > 0 && (
  <ul>
    {form.files.map((file, index) => (
      <li key={index}>{file.name}</li>
    ))}
  </ul>
)}

{form.claimType === "MEDICAL" && (
  <div className="form-grid">

    <input
      placeholder="Hospital Name"
      onChange={(e) =>
        setForm({ ...form, medicalHospital: e.target.value })
      }
    />
    
<input
  placeholder="Insurance Policy Number"
  required
  onChange={(e) =>
    setForm({ ...form, policyNumber: e.target.value })
  }
/>
    <input type="number" placeholder="Number of Days Hospitalized" />
  {/* ✅ Upload Payment Receipts */}
    <div className="form-field">
      <label>Upload Payment Receipts</label>
      <input
        type="file"
        multiple
        onChange={(e) =>
          setForm({ ...form, paymentReceipts: Array.from(e.target.files) })
        }
      />
    </div>
      {/* ✅ Upload Relevant Documents */}
    <div className="form-field">
      <label>Upload Relevant Documents</label>
      <input
        type="file"
        multiple
        onChange={(e) =>
          setForm({ ...form, medicalDocs: Array.from(e.target.files) })
        }
      />
    </div>
  </div>
)}
{form.claimType === "OTHERS" && (
  <div className="form-grid">
    <input
      placeholder="Claim Title"
      onChange={(e) =>
        setForm({ ...form, otherTitle: e.target.value })
      }
    />

    <input
      placeholder="Reference / Invoice No"
      onChange={(e) =>
        setForm({ ...form, otherReference: e.target.value })
      }
    />

    <textarea
      placeholder="Describe your claim"
      onChange={(e) =>
        setForm({ ...form, description: e.target.value })
      }
    />
  </div>
)}
           <div className="form-actions">

  <button type="submit" className="submit-btn">
    Submit
  </button>

  <button
    type="button"
    className="cancel-btn"
    onClick={() => setShowForm(false)}
  >
    Close
  </button>

</div>
          </form>
          {form.claimType === "TRAVEL" && (
  <div className="form-grid">
 <input
      placeholder="Hospital Name"
      value={form.hospitalName || ""}
      onChange={(e) =>
        setForm({ ...form, hospitalName: e.target.value })
      }
    />
    <input placeholder="Purpose of Travel"
      onChange={(e) => setForm({ ...form, description: e.target.value })}
    />

    <input type="number" placeholder="No of Days Travelled" />

   

  </div>
)}
{form.claimType === "ACCOMMODATION" && (
  
  <div className="form-grid">
    <select
  value={form.accommodationType}
  onChange={(e) =>
    setForm({ ...form, accommodationType: e.target.value })
  }
>
  <option value="">Select Accommodation Type</option>
  <option value="HOTEL">Hotel</option>
  <option value="ROOM">Room</option>
  <option value="PG">PG</option>
  <option value="OTHER">Other</option>
</select>
{form.accommodationType && (
  <input
    placeholder="Receipt Number"
    required
    onChange={(e) =>
      setForm({ ...form, receiptNumber: e.target.value })
    }
  />
)}

      {/* Accommodation Contact (NEW FIELD) */}
    <input
      placeholder="Accommodation Contact"
      onChange={(e) =>
        setForm({ ...form, accommodationContact: e.target.value })
      }
    />
     <input
      placeholder="Accommodation Location"
      onChange={(e) =>
        setForm({ ...form, accommodationLocation: e.target.value })
      }
    />
     <input
      placeholder="State"
      onChange={(e) =>
        setForm({ ...form, state: e.target.value })
      }
    />
      <input
      placeholder="District"
      onChange={(e) =>
        setForm({ ...form, district: e.target.value })
      }
    />
      <input
      placeholder="Pincode"
      onChange={(e) =>
        setForm({ ...form, pincode: e.target.value })
      }
    />

    
 
       <div className="date-field">
      <label>Check-in Date</label>
      <input
        type="date"
        onChange={(e) =>
          setForm({ ...form, travelFromDate: e.target.value })
        }
      />
    </div>

      <div className="date-field">
      <label>Check-out Date</label>
      <input
        type="date"
        onChange={(e) =>
          setForm({ ...form, travelToDate: e.target.value })
        }
      />
    </div>


    <input type="number" placeholder="No of Days Stayed" />
 </div>
)}

        </div>
        
      )}

     



      {/* ================= ALWAYS SHOW BUTTONS ================= */}


      {/* ================= TABLE ================= */}
      <table className="claim-table">
       <thead>
  <tr>
    {[
      { label: "Employee ID", key: "id" },
      { label: "Employee Name", key: "empName" },
      { label: "Claim Type", key: "claimType" },
     { label: "Submitted Date", key: "submittedDate" },
      { label: "Amount", key: "amount" },
      { label: "From Date", key: "travelFromDate" },
      { label: "To Date", key: "travelToDate" },
      { label: "From Location", key: "fromLocation" },
      { label: "To Location", key: "toLocation" },
      { label: "Manager", key: "managerName" },
      { label: "Attachment", key: "file" },
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
            <input
              type="text"
              placeholder="Search..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />

            <div className="filter-list">
              {suggestions.map((val, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setFilters({
                      ...filters,
                      [col.key]: val
                    });
                    setActiveFilter(null);
                  }}
                >
                  {val || "Empty"}
                </div>
              ))}
            </div>
          </div>
        )}
      </th>
    ))}

   {role === ROLE_MGR && <th>Action</th>}
  </tr>
</thead>

        <tbody>
          {filteredData.map(r => (
            <tr key={r.id}>
              <td>{r.id}</td>
              
              <td>{r.empName}</td>
                 <td>{r.claimType}</td>
                {/* ✅ NEW FIELD */}
<td>{r.claimsettleDate || "-"}</td>

              <td>₹{r.amount}</td>
                {/* ✅ FROM DATE */}
      <td>
        {r.claimType === "TRAVEL"
          ? r.travelFromDate
          : r.claimType === "ACCOMMODATION"
          ? r.checkIn
          : "-"}
      </td>

      {/* ✅ TO DATE */}
      <td>
        {r.claimType === "TRAVEL"
          ? r.travelToDate
          : r.claimType === "ACCOMMODATION"
          ? r.checkOut
          : "-"}
      </td>
       {/* ✅ FROM LOCATION */}
      <td>
        {r.claimType === "TRAVEL"
          ? r.fromLocation
          : r.claimType === "ACCOMMODATION"
          ? r.accommodationLocation
          : "-"}
      </td>

      {/* ✅ TO LOCATION */}
      <td>
        {r.claimType === "TRAVEL"
          ? r.toLocation
          : "-"}
      </td>
        {/* ✅ MANAGER NAME */}
      <td>{r.managerName || "-"}</td>

      {/* ✅ ATTACHMENT */}
    <td>
  {r.files && r.files.length > 0 ? (
    r.files.map((file, i) => (
      <div key={i}>
        <a href={file} target="_blank" rel="noreferrer">
          View File {i + 1}
        </a>
      </div>
    ))
  ) : (
    "-"
  )}
</td>
              <td>{r.status}</td>

              {role === ROLE_MGR && (
                <td>
                  <select onChange={(e) => handleStatusChange(r.id, e.target.value)}>
                    <option value={STATUS_PENDING}>Pending</option>
                    <option value={STATUS_MGR_APPR}>Manager Approved</option>
                    <option value={STATUS_APPROVED}>Approved</option>
                    <option value={STATUS_REJECTED}>Rejected</option>
                  </select>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Reimbursement;