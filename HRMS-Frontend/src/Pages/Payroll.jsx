import { toast, ToastContainer } from "react-toastify";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { useState, useEffect } from "react";
import "./Payroll/Payroll.css";
import { PayrollContext } from "../Context/PayrollContext";
import { processPayroll } from "../api/payrollApi";
import { useNavigate , useLocation} from "react-router-dom";

import { useContext } from "react";
import { AuthContext } from "../Context/Authcontext";


/* COMPONENTS — UNCHANGED */
import PayrollHeader from "../Pages/Payroll/PayrollHeader";
import PayrollStats from "../Pages/Payroll/PayrollStats";
import PayrollToolbar from "../Pages/Payroll/PayrollToolbar";
import PayrollTable from "../Pages/Payroll/PayrollTable";
import PayrollProfileCard from "../Pages/Payroll/PayrollProfileCard";
import PayrollFooter from "../Pages/Payroll/PayrollFooter";
import ViewPayslipModal from "../Pages/Payroll/ViewPayslipModal";
import { getPayrollData } from "../api/payrollApi";
import { getAllEmployees } from "../api/employeeApi";
/* DATA */
import payslipData from "../Data/PaySlipData";  
import { processAllPayroll } from "../api/payrollApi";


const Payroll = () => {
  const { refreshKey } = useContext(PayrollContext);
  const { user } = useContext(AuthContext);
   const navigate = useNavigate();   // ✅ ADD HERE
   const location = useLocation();

  const [openPayslip, setOpenPayslip] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [activeEmployee, setActiveEmployee] = useState(null);
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [employees, setEmployees] = useState([]);
  const [fromMonth, setFromMonth] = useState("");
const [toMonth, setToMonth] = useState("");
const [sortType, setSortType] = useState("");
const [currentPage, setCurrentPage] = useState(1);
const rowsPerPage = 6;

const [prevData, setPrevData] = useState(null); // ✅ change [] → null

const fetchPayroll = async () => {
  try {
    const res = await getPayrollData();

    // ✅ run only after first load
    if (prevData) {
      res.data.forEach((item) => {
        const old = prevData.find(
          (p) => p.employeeId === item.employeeId
        );

        if (
          item.salaryStatus === "CREDITED" &&
          old?.salaryStatus !== "CREDITED"
        ) {
          toast.success(
            `${item.empName || item.fullName} salary credited successfully 🎉`
          );
        }
      });
    }

    setPrevData(res.data);
    setData(res.data);

  } catch (err) {
    console.error(err);
  }
};
useEffect(() => {
  fetchPayroll();
}, [location.state?.refresh]); // ✅ Refetch when returning from UpdatePayroll

useEffect(() => {
  console.log("PAYROLL DATA:", data);
}, [data]);
useEffect(() => {
  const saved = localStorage.getItem("selectedEmployee");
  if (saved) {
    setActiveEmployee(JSON.parse(saved));
  }
}, []);
useEffect(() => {
  getAllEmployees()
    .then(res => {
      console.log("🔥 EMPLOYEE API RESPONSE:", res);
      // getAllEmployees() returns response.data directly — already the array
      const empData = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setEmployees(empData);
      console.log("📊 EMPLOYEE DATA SET:", empData);
    })
    .catch(err => console.error("Employee fetch error", err));
}, [location.state?.refresh]); // ✅ Re-fetch employees on refresh

useEffect(() => {
  getPayrollData()
    .then(res => {
      const payroll = res.data;
      setData(payroll);

      const saved = localStorage.getItem("selectedEmployee");

      if (saved) {
        const parsed = JSON.parse(saved);

        const updated = payroll.find(
          p => String(p.employeeId) === String(parsed.employeeId)
        );

        if (updated) {
          setActiveEmployee(updated); // latest DB version
        } else {
          setActiveEmployee(null); // ✅ FIX HERE
        }
      } else {
        setActiveEmployee(null); // ✅ FIX HERE
      }
    })
    .catch(err => console.error(err));
}, [location.state?.refresh]);



 useEffect(() => {
  // ✅ If admin login → show admin's own record first
  if (user && data.length > 0 && !activeEmployee) {
    const adminRecord = data.find(
      (emp) =>
        String(emp.employeeId) ===
        String(user?.empId || user?.employeeId)
    );

    if (adminRecord) {
      setActiveEmployee(adminRecord);
    }
  }
}, [user, data]);

 
useEffect(() => {
  console.log("🔥 CURRENT USER:", user);
  console.log("📊 PAYROLL DATA:", data);
  console.log("📍 ENRICHED DATA:", enrichedData);
  console.log("📌 ROLE-BASED DATA:", roleBasedData);
}, [user, data]);

useEffect(() => {
  const timer = setTimeout(() => {
    setCurrentPage(1);
  }, 300);

  return () => clearTimeout(timer);
}, [search]);


useEffect(() => {
  setCurrentPage(1);
}, [search, fromMonth, toMonth, sortType]);
const enrichedData = data
  .filter(p => {
    // ✅ STATUS SHOULD BE ACTIVE (case-insensitive) - ONLY filter if status is explicitly INACTIVE
    const payStatus = (p.status || p.recordStatus || "").toUpperCase();
    
    const isInactive = payStatus === "INACTIVE";
    
    if (isInactive) {
      console.log(`❌ FILTERED OUT: ${p.empName || "unknown"} - Status: ${payStatus}`);
      return false;
    }
    
    return true;
  })
  .map(pay => {
    const emp = employees?.length
  ? employees.find(e =>
     String(e.employeeId || e.empId || e.code) === String(pay.employeeId || pay.empId)
    )
  : null;

    console.log(`✅ ENRICHING: ${pay.empName} (${pay.employeeId}) - Employee found: ${emp ? emp.fullName : 'NOT FOUND'}`);

    return {
      ...pay,
      // 🔥 FILL MISSING DATA FROM EMPLOYEE MASTER
     empName: pay.empName || emp?.fullName || emp?.name,
      department: pay.department || emp?.department,
      employee: emp
    };
  });

// ✅ ROLE BASED FILTER
let roleBasedData = enrichedData;

// 🔥 FILTER BY ROLE FIRST - check for employee role
console.log("🔥 CHECKING USER:");
console.log("  user object:", user);
console.log("  user?.role:", user?.role);
console.log("  user?.empId:", user?.empId);
console.log("  user?.employeeId:", user?.employeeId);
console.log("  user?.email:", user?.email);

// Only filter for EMPLOYEE role
if (user && user.role === "employee") { // ✅ Strict check only for "employee"
  console.log("🔥 EMPLOYEE LOGIN DETECTED - Filtering payroll");

  roleBasedData = enrichedData.filter(emp => {
    const empId = emp.employeeId || emp.empId || emp.empCode;
    const userId = user?.empId || user?.employeeId;
    
    const match = String(empId) === String(userId);
    
    console.log(`  Comparing: "${emp.empName}" (${empId}) vs User (${userId}) = ${match}`);
    
    return match;
  });
  
  console.log(`✅ FILTERED DATA FOR EMPLOYEE: ${roleBasedData.length} records`);
} else if (user && user.role === "manager") { // ✅ NEW: Filter for MANAGER role
  console.log("🔥 MANAGER LOGIN DETECTED - Filtering payroll for team members only");
  
  const managerEmail = user?.email;
  console.log(`  Manager email: ${managerEmail}`);
  
  roleBasedData = enrichedData.filter(emp => {
    const empManagerEmail = emp.employee?.managerEmail;
    
    const isTeamMember = empManagerEmail && String(empManagerEmail).toLowerCase() === String(managerEmail).toLowerCase();
    
    console.log(`  Checking: "${emp.empName}" - Manager: ${empManagerEmail} vs Current: ${managerEmail} = ${isTeamMember}`);
    
    return isTeamMember;
  });
  
  console.log(`✅ FILTERED DATA FOR MANAGER: ${roleBasedData.length} team members`);
} else {
  console.log("👤 ADMIN/OTHER LOGIN (role=" + user?.role + ") - showing ALL payroll records");
  console.log("   Total enriched records:", enrichedData.length);
}

const filteredData = roleBasedData.filter((emp) => {
  // ✅ Allow records even if employeeId is null — use empName as fallback identifier
  const searchText = search?.toLowerCase() || "";

  const matchesSearch =
    (
      emp.empName ||
      emp.fullName ||
      emp.employee?.fullName ||
      ""
    ).toLowerCase().includes(searchText) ||
    (emp.department || "").toLowerCase().includes(searchText);

  return matchesSearch;
});

let sortedData = [...filteredData];


// ✅ KPI CALCULATIONS (NO LOGIC CHANGE)

const totalEmployees = roleBasedData.length;

const totalPayroll = roleBasedData.reduce(
  (sum, emp) => sum + (emp.gross || emp.grossPay || emp.salary || 0),
  0
);

const totalDeductions = roleBasedData.reduce(
  (sum, emp) =>
    sum +
    ((emp.tax || 0) + (emp.pf || 0) + (emp.insurance || 0)),
  0
);

const totalNetPay = roleBasedData.reduce(
  (sum, emp) => sum + (emp.net || emp.netPay || 0),
  0
);

const indexOfLast = currentPage * rowsPerPage;
const indexOfFirst = indexOfLast - rowsPerPage;

const paginatedData = sortedData.slice(indexOfFirst, indexOfLast);
const totalPages = Math.ceil(roleBasedData.length / rowsPerPage);

if (sortType === "high") {
  sortedData.sort(
    (a, b) => (b.salary || b.grossPay || 0) - (a.salary || a.grossPay || 0)
  );
}

if (sortType === "low") {
  sortedData.sort(
    (a, b) => (a.salary || a.grossPay || 0) - (b.salary || b.grossPay || 0)
  );
}

sortedData.sort((a, b) => {
  return (b.updatedAt || 0) - (a.updatedAt || 0);
});

  const handleViewPayslip = (record) => {
    setSelectedPayslip(record);
    setOpenPayslip(true);
  };

const handleProfileView = (record) => {
  setActiveEmployee({ ...record });

  // ✅ ADD THIS
  localStorage.setItem("selectedEmployee", JSON.stringify(record));
};

const handleEditPayroll = (record) => {
   console.log("Edit clicked:", record);
  navigate("/update-payroll", {
    state: { employee: record }
  });
};
const handleDownloadPayslip = async () => {
  const element = document.getElementById("payslip");

  if (!element) {
    alert("Payslip not found");
    return;
  }

  const canvas = await html2canvas(element, { scale: 2 });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");

  const imgWidth = 210; // A4 width
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

  pdf.save("Payslip.pdf");
};

const handleProcessPayroll = async (record) => {
  try {
   const empId = record.employeeId || record.empId;
await processPayroll(empId);

    // wait + refresh again
    setTimeout(async () => {
      await fetchPayroll();
    }, 2500);

  } catch (err) {
    console.error(err);
  }
};

const handleProcessAll = async () => {
  try {
    await processAllPayroll();   // ✅ USE THIS

    await fetchPayroll();        // ✅ refresh UI

  } catch (err) {
    console.error("Batch process error", err);
  }
};
const handleProcessSingle = async (empId) => {
  try {
    await axios.put(`/api/payroll/process/${empId}`);

    await fetchPayroll();   // ✅ AUTO REFRESH

  } catch (err) {
    console.error(err);
  }
};
const handleStatusChange = async (record, newStatus) => {
  try {
    console.log("FULL RECORD:", record);

    if (newStatus === "PROCESSING") {
      const empId =
        record.employeeId ||
        record.empId ||
        record.employee?.employeeId;

      console.log("FINAL ID SENT:", empId);

      await processPayroll(empId);
    }

    await fetchPayroll();

  } catch (err) {
    console.error(err);
  }
};
const handleExport = () => {
  console.log("Export clicked", filteredData);

  // simple CSV export (basic)
  const csv = filteredData.map(emp =>
    `${emp.fullName},${emp.department},${emp.salary || emp.grossPay || 0}`
  );

  const blob = new Blob([["Name,Department,Salary", ...csv].join("\n")], {
    type: "text/csv",
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "payroll.csv";
  link.click();
};


  return (
    /* ⭐ PAGE CONTAINER — SAME AS PROFILE */
    <div className="page-wrapper">
        <ToastContainer position="top-right" autoClose={2000} />
      <div className="page-container">

        <PayrollHeader />
        
       <PayrollStats
  totalEmployees={totalEmployees}
  totalPayroll={totalPayroll}
  totalDeductions={totalDeductions}
  totalNetPay={totalNetPay}
/>

        <div className="payroll-content">
          {/* LEFT */}
          <div className="payroll-left">
            <PayrollToolbar
            
  search={search}
  setSearch={setSearch}
  fromMonth={fromMonth}
  setFromMonth={setFromMonth}
  toMonth={toMonth}
  setToMonth={setToMonth}
   sortType={sortType}
  setSortType={setSortType}
   onExport={handleExport}   // ✅ ADD THIS
  onUpdatePayroll={user?.role === "admin" || user?.role === "hr" ? () => navigate("/update-payroll") : undefined}
    onProcessAll={user?.role === "admin" || user?.role === "hr" ? handleProcessAll : undefined}
/>

            <PayrollTable
  data={paginatedData}
  onViewPayslip={handleViewPayslip}
  onProfileView={handleProfileView}
    onDownloadPayslip={handleDownloadPayslip}   // ✅ ADD THIS
 onEditPayroll={user?.role === "admin" || user?.role === "hr" ? handleEditPayroll : undefined}
onProcessPayroll={user?.role === "admin" || user?.role === "hr" ? handleProcessPayroll : undefined}
onProcessAll={user?.role === "admin" || user?.role === "hr" ? handleProcessAll : undefined}
onStatusChange={user?.role === "admin" || user?.role === "hr" ? handleStatusChange : undefined}
/>

            <PayrollFooter 
  currentPage={currentPage}
  setCurrentPage={setCurrentPage}
  totalPages={totalPages}
/>
          </div>

          {/* RIGHT */}
          <div className="payroll-right">
            <PayrollProfileCard employee={activeEmployee} />
          </div>
        </div>

      </div>

      {/* MODAL */}
      <ViewPayslipModal
        open={openPayslip}
        onClose={() => setOpenPayslip(false)}
        data={selectedPayslip}
      />
    </div>
  );
};

export default Payroll;
