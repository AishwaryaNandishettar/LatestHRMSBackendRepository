      import React, { useState, useContext , useEffect, } from 'react';
      import { useLocation } from "react-router-dom";
      import './Leave.css';
      import { AuthContext } from '../Context/Authcontext';
      import { applyLeave, getMyLeaves, getAllLeaves, updateLeaveStatus, getManagerLeaves } from "../api/leaveApi";
    
      

     

      const gmailOptions = [
        'mahesh.panchal@gmail.com',
        'priya.sharma@gmail.com',
        'anita.verma@gmail.com',
        'rohit.jain@gmail.com',
        'meena.kapoor@gmail.com',
        'rahul.patel@gmail.com'
      ];
      const getLeaveDays = (from, to) => {
        const start = new Date(from);
        const end = new Date(to);
        const diff = (end - start) / (1000 * 60 * 60 * 24);
        return diff + 1;
      };
      const defaultMonthlyLeaves = {
        'Earned Leave': 6,
        'Sick Leave': 2,
        'Loss of Pay': 0,
        
        'Half Day': 2,
        'Compensatory off': 1
      };

      const LeavePage = () => {

        const { user } = useContext(AuthContext);
         const location = useLocation();
         const [activeTab, setActiveTab] = useState("all");
            useEffect(() => {
  if (location.state?.focus === "pending") {
    // example: set active tab or filter
    setActiveTab("pending");   // or whatever you use
  }
}, [location.state]);
       
        console.log("USER 👉", user);
      console.log("EMP ID 👉", user?.empId);
      const [notifiedLeaves, setNotifiedLeaves] = useState(() => {
        return JSON.parse(localStorage.getItem("notifiedLeaves")) || [];
      });
        //const [role, setRole] = useState(user.role); // 'employee', 'manager', 'hr'
        const role = user?.role?.toLowerCase();
        const normalizedRole = role === 'admin' ? 'hr' : role;
        const roleOptionsMap = {
        employee: ['employee'],
        manager: ['manager'],
        hr: ['hr']
      };
        
        const isEmployee = normalizedRole === 'employee';
      const isManager = normalizedRole === 'manager';
      const isHR = normalizedRole === 'hr';
      const [showPolicy, setShowPolicy] = useState(false);
      const [activeFilter, setActiveFilter] = useState(null);
      const [filterText, setFilterText] = useState("");
        const [showForm, setShowForm] = useState(false);
        const [showEmpFilter, setShowEmpFilter] = useState(false);
        const [formData, setFormData] = useState({
          employeeName: '',  // Enterable now
          leaveType: '',
          fromDate: '',
          toDate: '',
          manager: '',
          cc: '',
          comments: '',
          file: null
        });
      const [policy, setPolicy] = useState({
          type: "",
          target: "all"
        });
        const [suggestions, setSuggestions] = useState([]);
        const [ccSuggestions, setCcSuggestions] = useState([]);
        const [leaves, setLeaves] = useState([]);
      const [filters, setFilters] = useState({
        employee: '',
        empId: '',
      department: '',
      manager: '',
        leaveType: '',
        status: '',
        fromDate: '',
        toDate: '',
        comments: ''   // ✅ ADD THIS ONLY
      });
        const [balances, setBalances] = useState(defaultMonthlyLeaves);

        const getUniqueValues = (key) => {
        return [...new Set(
          leaves.map(l => {
            if (key === "employeeName") return l.employeeName || l.name || l.userName;
            if (key === "from") return l.startDate || l.fromDate;
            if (key === "to") return l.endDate || l.toDate;
            if (key === "comments") return l.comments || l.reason;
            return l?.[key] ?? l?.[key?.toLowerCase?.()];
          })
        )];
      };

      const headersuggestions =
        activeFilter &&
        getUniqueValues(activeFilter).filter(v =>
          String(v || "")
            .toLowerCase()
            .includes(String(filterText || "").toLowerCase())
        );

        const showNotification = (title, message) => {
        if (!("Notification" in window)) {
          alert(message);
          return;
        }

        if (Notification.permission === "granted") {
          new Notification(title, { body: message });
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then(permission => {
            if (permission === "granted") {
              new Notification(title, { body: message });
            }
          });
        }
      };
      const fetchLeaves = async () => {
        try {
              console.log("FETCH CALLED 👉 EMP ID:", user?.empId);
          let res;
     if (isEmployee && user?.empId) {
  res = await getMyLeaves(user.empId);

} else if (isManager) {
  res = await getManagerLeaves(user.email);   // ✅ ONLY HIS TEAM

} else {
  res = await getAllLeaves();   // HR only
}
        console.log("ROLE 👉", normalizedRole);   // ✅ HERE
          console.log("API DATA 👉", res.data);     // ✅ HERE  
        const data = res?.data || [];
setLeaves(
  data.map(l => ({
    ...l,
    empId: l.empId || l.userId,
    department: l.department || l.dept || user?.department,
    reportingManager: l.reportingManager || l.manager || user?.reportingManager
  }))
);

        } catch (err) {
          
          console.error(err);
        }
      };

      useEffect(() => {
        if (user) {
          resetMonthlyLeaves();
          fetchLeaves();
        }
      }, [user]);

      useEffect(() => {
        if (isEmployee && leaves.length > 0) {
          const myLeaves = leaves.filter(
            l => String(l.userId) === String(user?.empId)
          );

          let updated = [...notifiedLeaves];

          myLeaves.forEach(l => {
            const status = cleanStatus(l.status);
            const id = l._id || l.id;

            if (!updated.includes(id)) {
              if (status === "approved") {
                showNotification("✅ Leave Approved", `Your ${l.leaveType} leave is approved`);
              }

              if (status === "rejected") {
                showNotification("❌ Leave Rejected", `Your ${l.leaveType} leave is rejected`);
              }

              updated.push(id);
            }
          });

          setNotifiedLeaves(updated);
          localStorage.setItem("notifiedLeaves", JSON.stringify(updated));
        }
      }, [leaves]);

      useEffect(() => {
        if (isEmployee && leaves.length > 0) {
          const myLeaves = leaves.filter(
        l => String(l.userId) === String(user?.empId)
      );

          const approvedLeaves = myLeaves.filter(
            l => l.status === "Approved"
          );

          if (approvedLeaves.length > 0) {
            alert("Your leave has been approved!");
          }
        }
      }, [leaves]);
      useEffect(() => {
          if (user?.name) {
            setFormData(prev => ({ ...prev, employeeName: user.name }));
          }
        }, [user]);
        const handleChange = (e) => {
          const { name, value, files } = e.target;
          setFormData(prev => ({ ...prev, [name]: files ? files[0] : value }));

          if (name === 'manager') {
            setSuggestions(gmailOptions.filter(e => e.toLowerCase().includes(value.toLowerCase())));
          }
          if (name === 'cc') {
            setCcSuggestions(gmailOptions.filter(e => e.toLowerCase().includes(value.toLowerCase())));
          }
        };

        const handleSelect = (field, value) => {
          setFormData(prev => ({ ...prev, [field]: value }));
          if (field === 'manager') setSuggestions([]);
          if (field === 'cc') setCcSuggestions([]);
        };

        const handleSubmit = async (e) => {
          e.preventDefault();
          
          try {

            if (!formData.comments || formData.comments.trim() === "") {
        alert("Comments are required to apply for leave");
        return;
      }
            const payload = {
              userId: String(user.empId),   // 🔥 FORCE STRING
              
              employeeName: formData.employeeName,
              leaveType: formData.leaveType,
              startDate: formData.fromDate,
              endDate: formData.toDate,
              reason: formData.comments,
              // ✅ ADD THESE 2 LINES ONLY
     // ✅ MAKE SURE THESE ARE NOT UNDEFINED
  department: user?.department || user?.dept,
  reportingManager: user?.reportingManager || user?.manager,
   // ✅ ADD THIS
 // ✅ ONLY THIS (REMOVE others)
  managerEmail: user?.managerEmail   // MUST BE CORRECT

            };

            await applyLeave(payload);

            await fetchLeaves();

          const days =
  formData.leaveType === "Half Day"
    ? 0.5
    : getLeaveDays(formData.fromDate, formData.toDate);

setBalances(prev => ({
  ...prev,
  [formData.leaveType]:
    (prev[formData.leaveType] || 0) - days
}));
            setFormData({
              employeeName: '',
              leaveType: '',
              fromDate: '',
              toDate: '',
              manager: '',
              cc: '',
              comments: '',
              file: null
            });

            setShowForm(false);

          } catch (err) {
            console.error(err);
          }
        };



        const handleCancel = () => {
          setFormData({ employeeName:'', leaveType: '', fromDate: '', toDate: '', manager: '', cc: '', comments: '', file: null });
          setSuggestions([]);
          setCcSuggestions([]);
          setShowForm(false);
        };

      const updateStatus = async (id, status) => {
        try {
          await updateLeaveStatus(id, status);

      setLeaves(prev =>
        prev.map(l =>
          (l._id === id || l.id === id)
            ? { ...l, status }
            : l
        )
      );                       // refresh data
        } catch (err) {
          console.error(err);
        }
      };

        const downloadCSV = () => {
          let csv = "Employee,Type,From,To,Status\n";

          filteredLeaves.forEach(l => {
            csv += `${l.employeeName},${l.leaveType},${l.startDate || l.fromDate},${l.endDate || l.toDate},${l.status}\n`;
          });

          const blob = new Blob([csv], { type: "text/csv" });
          const url = window.URL.createObjectURL(blob);

          const a = document.createElement("a");
          a.href = url;
          a.download = `${normalizedRole}_leave_report.csv`;
          a.click();
        };
        const handleGeneratePolicy = () => {
          console.log("Generated Policy:", policy);
          setShowPolicy(false);
        };

        const resetMonthlyLeaves = () => {
        const currentMonth = new Date().getMonth();
        const storedMonth = localStorage.getItem('leaveMonth');

        if (storedMonth !== String(currentMonth)) {
          setBalances(defaultMonthlyLeaves);
          localStorage.setItem('leaveMonth', currentMonth);
        }
      };

      const cleanStatus = (status) => (status || "").trim().toLowerCase();
        // Filter leaves based on role & filters
      const filteredLeaves = leaves.filter(l => {
        const empName = l?.employeeName || "";

        // role restriction
      let roleFilter = true;

if (isEmployee) {
  roleFilter = String(l.userId) === String(user?.empId);
}

if (isManager) {
  roleFilter =
    l.managerEmail &&
    l.managerEmail.toLowerCase() === user?.email?.toLowerCase();
}
         
         const status = cleanStatus(l.status);
          // ✅ ADD TAB FILTER
  const tabFilter =
    activeTab === "all" ||
    (activeTab === "pending" && status === "pending") ||
    (activeTab === "approved" && status === "approved") ||
    (activeTab === "rejected" && status === "rejected");

  return (
    roleFilter &&
    tabFilter &&
    (filters.leaveType === "" || l?.leaveType === filters.leaveType) &&
    (filters.status === "" || status === cleanStatus(filters.status)) &&
    (!filters.fromDate || new Date(l.startDate || l.fromDate) >= new Date(filters.fromDate)) &&
    (!filters.toDate || new Date(l.endDate || l.toDate) <= new Date(filters.toDate))
  );
        // employee name filter (ONLY extra filter, don't override roleFilter)
        if (filters.employee) {
          roleFilter =
            roleFilter &&
            empName.toLowerCase().includes(filters.employee.toLowerCase());
        }

        
      return (
        roleFilter &&

        (filters.leaveType === "" || l?.leaveType === filters.leaveType) &&

        (filters.status === "" ||
          cleanStatus(l?.status) === cleanStatus(filters.status)) &&

        (!filters.fromDate ||
          new Date(l.startDate || l.fromDate) >= new Date(filters.fromDate)) &&

        (!filters.toDate ||
          new Date(l.endDate || l.toDate) <= new Date(filters.toDate)) &&


          // 🔥 ADD HERE 👇
      (filters.empId === "" ||
        String(l.empId || l.userId || "")
          .toLowerCase()
          .includes(filters.empId.toLowerCase())) &&

      (filters.department === "" ||
        String(l.department || l.dept || "")
          .toLowerCase()
          .includes(filters.department.toLowerCase())) &&

      (filters.manager === "" ||
        String(l.manager || l.reportingManager || "")
          .toLowerCase()
          .includes(filters.manager.toLowerCase())) &&
        // ✅ ADD THIS HERE
        (filters.comments === "" ||
          (l.comments || l.reason || "")
            .toLowerCase()
            .includes(filters.comments.toLowerCase()))
      );
      });

        return (
          <div className="leave-page">
          <div className="leave-header">
        <h2>Leave Management</h2>


  
      
        {isHR && (
          <button
            className="policy-btn"
            onClick={() => setShowPolicy(true)}
          >
            Auto Generate Policy
          </button>
        )}

      
  {(isManager || isHR) && (
    <button
      onClick={downloadCSV}
      style={{
        backgroundColor: "#28a745",
        color: "#fff",
        padding: "8px 14px",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "bold",
        marginLeft: "10px"
      }}
    >
      Export Report
    </button>
  )}
      </div>
        {isHR && (
              <button onClick={() => setShowPolicy(true)}>Auto Generate Policy</button>
            )}

            {/* Role Switcher */}
            <div style={{ marginBottom: '15px' }}>
              <label>Simulate Role: </label>
            <select value={normalizedRole} disabled>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="hr">HR/Admin</option>
              </select>
            </div>

            {/* Leave Balances */}
            <div className="status-bar">
              {Object.keys(balances).map((type, idx) => (
                <div key={idx} className="status-box">
                  <h4>{type}</h4>
                  <strong>{balances[type]}</strong>
                </div>
              ))}
            </div>

            {/* Apply Leave Button */}
            {!showForm && (isEmployee || isHR) && (
              <button className="apply-btn fixed-btn" onClick={() => setShowForm(true)}>Apply Leave</button>
            )}

      {/* POLICY POPUP */}
            {showPolicy && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h3>Generate Leave Policy</h3>

                  <select onChange={e => setPolicy({...policy, type: e.target.value})}>
                    <option value="">Select Leave Type</option>
                    <option>Earned Leave</option>
                    <option>Sick Leave</option>
                    <option>Maternity Leave</option>
                    <option>Paternity Leave</option>
                    <option>Compensatory off</option>
                  </select>

                  <div>
                    <label><input type="radio" value="all" onChange={e=>setPolicy({...policy,target:e.target.value})}/> All Employees</label>
                    <label><input type="radio" value="dept" onChange={e=>setPolicy({...policy,target:e.target.value})}/> Department</label>
                    <label><input type="radio" value="emp" onChange={e=>setPolicy({...policy,target:e.target.value})}/> Employee</label>
                  </div>

                  <button onClick={handleGeneratePolicy}>Generate</button>
                  <button
        type="button"
        onClick={() => setShowPolicy(false)}
        className="cancel-btn"
      >
        Cancel
      </button>
                </div>
              </div>
            )}

            {/* Modal Form */}
            {showForm && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h3>Apply Leave</h3>
                  {/* FORM */}
        

                  <form onSubmit={handleSubmit}>
                    <div className="form-row">
                      <label>Employee Name</label>
                      <input type="text" name="employeeName" value={formData.employeeName} onChange={handleChange} placeholder="Enter your name" required />
                    </div>

                    <div className="form-row">
                      <label>Leave Type</label>
                      <select name="leaveType" value={formData.leaveType} onChange={handleChange} required>
                        <option value="">--Select--</option>
                        {Object.keys(defaultMonthlyLeaves).map(type => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </div>

                    <div className="form-row">
                      <label>From Date</label>
                      <input type="date" name="fromDate" value={formData.fromDate} onChange={handleChange} required />
                    </div>

                    <div className="form-row">
                      <label>To Date</label>
                      <input type="date" name="toDate" value={formData.toDate} onChange={handleChange} required />
                    </div>

                    <div className="form-row autocomplete">
                      <label>Manager</label>
                      <input type="email" name="manager" value={formData.manager} onChange={handleChange} placeholder="Type manager email..." autoComplete="off" />
                      {suggestions.length > 0 && <ul className="suggestions">{suggestions.map((e,i)=><li key={i} onClick={()=>handleSelect('manager',e)}>{e}</li>)}</ul>}
                    </div>

                    <div className="form-row autocomplete">
                      <label>CC</label>
                      <input type="email" name="cc" value={formData.cc} onChange={handleChange} placeholder="Type CC email..." autoComplete="off" />
                      {ccSuggestions.length > 0 && <ul className="suggestions">{ccSuggestions.map((e,i)=><li key={i} onClick={()=>handleSelect('cc',e)}>{e}</li>)}</ul>}
                    </div>

                    <div className="form-row">
                      <label>Comments</label>
      <textarea
        name="comments"
        value={formData.comments}
        onChange={handleChange}
        required
      ></textarea>
                    </div>

                    <div className="form-row">
                      <label>Attach Document</label>
                      <input type="file" name="file" onChange={handleChange} />
                    </div>

                    <div className="form-actions">
                      <button type="submit">Submit</button>
                      <button type="button" onClick={handleCancel}>Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            )}


            {/* Filters */}
            <div className="filter-bar">
              {(isManager || isHR) && <input placeholder="Employee" value={filters.employee} onChange={e => setFilters(prev => ({ ...prev, employee: e.target.value }))} />}
              <select value={filters.leaveType} onChange={e => setFilters(prev => ({ ...prev, leaveType: e.target.value }))}>
                <option value="">All Types</option>
                {Object.keys(defaultMonthlyLeaves).map(type => <option key={type} value={type}>{type}</option>)}
              </select>
              <select value={filters.status} onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}>
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>

              {/* ✅ ADD DATE FILTERS HERE */}
        <input
          type="date"
          value={filters.fromDate}
          onChange={e =>
            setFilters(prev => ({ ...prev, fromDate: e.target.value }))
          }
        />

        <input
          type="date"
          value={filters.toDate}
          onChange={e =>
            setFilters(prev => ({ ...prev, toDate: e.target.value }))
          }
        />
            </div>

            {/* Leave Table */}
            <div
    className="table-container"
    style={{
      maxHeight: "400px",
      overflowY: "auto",
      overflowX: "auto",
      position: "relative"   // ✅ ADD THIS
    }}
  >
             <div className="tabs">
  <button
    className={activeTab === "all" ? "tab active" : "tab"}
    onClick={() => setActiveTab("all")}
  >
    All
  </button>

  <button
    className={activeTab === "pending" ? "tab active" : "tab"}
    onClick={() => setActiveTab("pending")}
  >
    Pending
  </button>

  <button
    className={activeTab === "approved" ? "tab active" : "tab"}
    onClick={() => setActiveTab("approved")}
  >
    Approved
  </button>

  <button
    className={activeTab === "rejected" ? "tab active" : "tab"}
    onClick={() => setActiveTab("rejected")}
  >
    Rejected
  </button>
</div>
              <table className="leave-table">
              <thead>
        <tr>

          {/* EMPLOYEE */}
          <th>
          <div className="th-with-filter fa-filter-wrapper">
              Employee Name
              <button
                className="filter-icon-btn"
                onClick={() => setActiveFilter("employeeName")}
              >⏷</button>
            </div>

            {activeFilter === "employeeName" && (
              <div className="header-filter-popup fa-header-filter">
                    <div className="fa-dropdown-inner"></div>
              <input
        placeholder="Search..."
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setFilters(prev => ({ ...prev, employee: filterText }));
            setActiveFilter(null);
            setFilterText("");
          }
        }}
      />
              <div className="filter-list">
      {headersuggestions?.map((s, i) => (
        <div
          key={i}
          className="filter-item"
          onClick={() => {
            setFilters(prev => ({ ...prev, employee: s }));
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
        <div className="th-with-filter">
          Emp ID
          <button
            className="filter-icon-btn"
            onClick={() => setActiveFilter("empId")}
          >⏷</button>
        </div>

      {activeFilter === "empId" && (
      <div className="header-filter-popup">
        <input
          placeholder="Search..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setFilters(prev => ({ ...prev, empId: filterText }));
              setActiveFilter(null);
              setFilterText("");
            }
          }}
        />

        <div className="filter-list">
          {headersuggestions?.map((s, i) => (
            <div
              key={i}
              className="filter-item"
              onClick={() => {
                setFilters(prev => ({ ...prev, empId: s }));
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
        <div className="th-with-filter">
          Department
          <button
            className="filter-icon-btn"
            onClick={() => setActiveFilter("department")}
          >⏷</button>
        </div>

      {activeFilter === "department" && (
      <div className="header-filter-popup">
        <input
          placeholder="Search..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setFilters(prev => ({ ...prev, department: filterText }));
              setActiveFilter(null);
              setFilterText("");
            }
          }}
        />

        {/* ✅ ADD THIS EXACTLY HERE */}
        <div className="filter-list">
          {headersuggestions?.map((s, i) => (
            <div
              key={i}
              className="filter-item"
              onClick={() => {
                setFilters(prev => ({ ...prev, department: s }));
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
        <div className="th-with-filter">
          Reporting Manager
          <button
            className="filter-icon-btn"
            onClick={() => setActiveFilter("manager")}
          >⏷</button>
        </div>

        {activeFilter === "manager" && (
          <div className="header-filter-popup">
            <input
              placeholder="Search..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setFilters(prev => ({ ...prev, manager: filterText }));
                  setActiveFilter(null);
                  setFilterText("");
                }
              }}
            />
            
          </div>
        )}
      </th>

          {/* LEAVE TYPE */}
          <th>
            <div className="th-with-filter">
              Leave Type
              <button
                className="filter-icon-btn"
                onClick={() => setActiveFilter("leaveType")}
              >⏷</button>
            </div>

          {activeFilter === "leaveType" && (
      <div className="header-filter-popup">
        <input
          placeholder="Search..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setFilters(prev => ({ ...prev, leaveType: filterText }));
              setActiveFilter(null);
              setFilterText("");
            }
          }}
        />

        <div className="filter-list">
          {headersuggestions?.map((s, i) => (
            <div
              key={i}
              className="filter-item"
              onClick={() => {
                setFilters(prev => ({ ...prev, leaveType: s }));
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

          {/* FROM */}
          <th>
            <div className="th-with-filter">
              From
              <button onClick={() => setActiveFilter("from")} className="filter-icon-btn">⏷</button>
            </div>

    {activeFilter === "from" && (
      <div className="header-filter-popup">
        <input
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setFilters(prev => ({ ...prev, fromDate: filterText }));
              setActiveFilter(null);
              setFilterText("");
            }
          }}
        />

        <div className="filter-list">
          {headersuggestions?.map((s, i) => (
            <div
              key={i}
              className="filter-item"
              onClick={() => {
                setFilters(prev => ({ ...prev, fromDate: s }));
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

          {/* TO */}
          <th>
            <div className="th-with-filter">
              To
              <button onClick={() => setActiveFilter("to")} className="filter-icon-btn">⏷</button>
            </div>

    {activeFilter === "to" && (
      <div className="header-filter-popup">
        <input
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setFilters(prev => ({ ...prev, toDate: filterText }));
              setActiveFilter(null);
              setFilterText("");
            }
          }}
        />

        <div className="filter-list">
          {headersuggestions?.map((s, i) => (
            <div
              key={i}
              className="filter-item"
              onClick={() => {
                setFilters(prev => ({ ...prev, toDate: s }));
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

          {/* STATUS */}
          <th>
            <div className="th-with-filter">
              Status
              <button onClick={() => setActiveFilter("status")} className="filter-icon-btn">⏷</button>
            </div>

    {activeFilter === "status" && (
      <div className="header-filter-popup">
        <input
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setFilters(prev => ({ ...prev, status: filterText }));
              setActiveFilter(null);
              setFilterText("");
            }
          }}
        />

        <div className="filter-list">
          {headersuggestions?.map((s, i) => (
            <div
              key={i}
              className="filter-item"
              onClick={() => {
                setFilters(prev => ({ ...prev, status: s }));
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

          {/* COMMENTS */}
          <th>
            <div className="th-with-filter">
              Comments
              <button onClick={() => setActiveFilter("comments")} className="filter-icon-btn">⏷</button>
            </div>

            {activeFilter === "comments" && (
      <div className="header-filter-popup">
        <input
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setFilters(prev => ({ ...prev, comments: filterText }));
              setActiveFilter(null);
              setFilterText("");
            }
          }}
        />

        <div className="filter-list">
          {headersuggestions?.map((s, i) => (
            <div
              key={i}
              className="filter-item"
              onClick={() => {
                setFilters(prev => ({ ...prev, comments: s }));
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

        {isHR && <th>Actions</th>}

        </tr>
      </thead>

      <tbody>
        {filteredLeaves.map(l => (
          <tr key={l._id || l.id}>

            <td>
              {l.employeeName || l.name || l.userName || "N/A"}
            </td>

           <td>
  {l.empId || l.userId || user?.empId || "—"}
</td>

<td>
  {l.department || l.dept || user?.department || user?.dept || "—"}
</td>

<td>
  {l.reportingManager || l.manager || user?.reportingManager || user?.manager || "—"}
</td>

            <td>{l.leaveType}</td>

            <td>{l.startDate || l.fromDate}</td>

            <td>{l.endDate || l.toDate}</td>

            {/* STATUS COLUMN */}
            <td>
              {l.status}
            </td>

            {/* COMMENTS COLUMN */}
            <td className="comment-cell">
              {l.comments || l.reason || "—"}
            </td>

            {/* ACTIONS COLUMN */}
      {isHR && (
        <td>
          {cleanStatus(l.status) === "pending" && (
            <div className="action-buttons">
              <button
                onClick={() => updateStatus(l.id || l._id, "Approved")}
                className="approve-btn"
              >
                Approve
              </button>

              <button
                onClick={() => updateStatus(l.id || l._id, "Rejected")}
                className="reject-btn"
              >
                Reject
              </button>
            </div>
          )}
        </td>
      )}

          </tr>
        ))}
      </tbody>
              </table>
            </div>

          </div>
        );
      };

      export default LeavePage;
