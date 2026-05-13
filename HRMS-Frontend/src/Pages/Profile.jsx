    import { useState, useEffect } from "react";
    //import { getSkillsByEmployee, addSkill, updateManagerRating } from "../api/skillApi";
    import styles from "./Profile.module.css";
    import { fetchMyProfile } from "../api/profileApi";
    import { useContext } from "react";
    import { AuthContext } from "../Context/Authcontext";
    import { getAllEmployees } from "../api/employeeApi";
    import { updateJobDetails } from "../api/profileApi";
    import { submitResignation, getResignationsByEmployee, updateResignationStatus, getAllResignations, getResignationsForApproval, getAllResignationsByManager, getResignationsForHRApproval, approveResignation, rejectResignation } from "../api/resignationApi";

    export default function ProfileView() {
      const { user } = useContext(AuthContext);
      const [status, setStatus] = useState("Available");
      const [view, setView] = useState("overview");
      const [showIncrementLetter, setShowIncrementLetter] = useState(false);
      const [selectedEmployee, setSelectedEmployee] = useState(null);
      const [allEmployees, setAllEmployees] = useState([]);

      
      const [showEditModal, setShowEditModal] = useState(false);
      const [showJobModal, setShowJobModal] = useState(false);
      const [earlyRelease, setEarlyRelease] = useState(false);
const [calculatedLwd, setCalculatedLwd] = useState("");
      const [profileImage, setProfileImage] = useState(
  localStorage.getItem("profileImage") || ""
);
  const [jobEdit, setJobEdit] = useState(() => {
  const saved = localStorage.getItem("jobEdit");
  return saved
    ? JSON.parse(saved)
    : {
        designation: "",
        department: "",
        joiningDate: "",
        totalExp: "",
        currentExp: "",
        employmentType: "Full-Time",
        location: "Bangalore",
        manager: "",
        hr: "",
        pf: "",
        uan: "",
        esic: "",
        pfMemberId: "",
        designationChanged: "",
        designationChangedDate: "",
      };
});
      

      /* ================= EXIT MODULE STATE ================= */

      const [exitStage, setExitStage] = useState("form");
      // form → manager → hr → checklist → completed

      // ✅ NEW: State for managing resignations
      const [myResignations, setMyResignations] = useState([]);
      const [pendingManagerResignations, setPendingManagerResignations] = useState([]);
      const [allManagerResignations, setAllManagerResignations] = useState([]);
      const [pendingHRResignations, setPendingHRResignations] = useState([]);
      const [allResignations, setAllResignations] = useState([]);
      
      const [exitData, setExitData] = useState({
  reason: "",
  notice: "60 Days",
  lwd: "",
  manager: [],   // ✅ now array
  cc: [],        // ✅ now array
  remarks: ""
});
const [searchTo, setSearchTo] = useState("");
const [searchCc, setSearchCc] = useState("");
// ✅ Use allEmployees instead of hardcoded users
const users = [
  { id: 1, name: "Padmanabh", email: "Padmanabh@omoi.com" },
  { id: 2, name: "Shambuling", email: "Shambuling@omoi.com" },
  { id: 3, name: "Aishwarya", email: "Aishwarya@company.com" },
  { id: 4, name: "Mahesh", email: "mahesh@gmail.com" },
  { id: 5, name: "Adhviti", email: "adhviti@gmail.com" }
];
    const [skills, setSkills] = useState([]);
    const [profileData, setProfileData] = useState(null);
    
const Chip = ({ user, onRemove }) => (
  <span className={styles.chip}>
    {user.name}
    <button onClick={onRemove}>×</button>
  </span>
);



    const role = (localStorage.getItem("role") || "").toUpperCase(); 
    console.log("role:", role);

useEffect(() => {
  const loadEmployees = async () => {
    try {
      const response = await getAllEmployees();

      // ✅ FIX: Handle different response formats
      let employees = [];
      
      if (Array.isArray(response)) {
        employees = response;  // Direct array
      } else if (response?.data && Array.isArray(response.data)) {
        employees = response.data;  // response.data is array
      } else if (response?.data?.content && Array.isArray(response.data.content)) {
        employees = response.data.content;  // response.data.content is array
      } else if (response?.content && Array.isArray(response.content)) {
        employees = response.content;  // response.content is array
      }

      console.log("✅ EMPLOYEES FROM BACKEND:", employees);
      console.log("📊 Total employees:", employees.length);
      
      let filteredEmployees = [];

      const userEmpId = localStorage.getItem("empId");
      const role = (localStorage.getItem("role") || "").trim().toUpperCase();

      if (!employees || employees.length === 0) {
        console.warn("⚠️ No employees found");
        setAllEmployees([]);
        return;
      }

      if (role === "ADMIN") {
        filteredEmployees = employees;  // ✅ Admin sees ALL employees
        console.log("👤 ADMIN - showing all", filteredEmployees.length, "employees");
      } 
      else if (role === "MANAGER") {
        const userTeam =
          profileData?.teamMembers ||
          profileData?.team ||
          [];
        filteredEmployees = employees.filter(emp =>
          userTeam.includes(emp.employeeId) ||
          userTeam.includes(emp.id)
        );
        console.log("👥 MANAGER - showing", filteredEmployees.length, "team members");
      } 
      else {
        filteredEmployees = employees.filter(emp =>
          emp.employeeId === userEmpId
        );
        console.log("👤 EMPLOYEE - showing self");
      }

      console.log("📋 Filtered employees:", filteredEmployees);
      setAllEmployees(filteredEmployees);
    } catch (err) {
      console.error("❌ Employee fetch error:", err);
      setAllEmployees([]);
    }
  };

  loadEmployees();
}, [profileData]);

// ✅ ADD THIS: Load employees on component mount (don't wait for profileData)
useEffect(() => {
  const loadEmployeesOnMount = async () => {
    try {
      const response = await getAllEmployees();

      let employees = [];
      
      if (Array.isArray(response)) {
        employees = response;
      } else if (response?.data && Array.isArray(response.data)) {
        employees = response.data;
      } else if (response?.data?.content && Array.isArray(response.data.content)) {
        employees = response.data.content;
      } else if (response?.content && Array.isArray(response.content)) {
        employees = response.content;
      }

      const role = (localStorage.getItem("role") || "").trim().toUpperCase();

      if (role === "ADMIN" && employees.length > 0) {
        console.log("🚀 ADMIN - Loading all employees on mount:", employees.length);
        setAllEmployees(employees);
      }
    } catch (err) {
      console.error("❌ Error loading employees on mount:", err);
    }
  };

  loadEmployeesOnMount();
}, []);
    const empId = localStorage.getItem("empId");
    console.log("empId from localStorage:", empId);
      
      const [checklist, setChecklist] = useState({
        laptop: false,
        idCard: false,
        documents: false,
        knowledgeTransfer: false,
      });

      const [newSkill, setNewSkill] = useState({
      name: "",
      level: "Beginner",
      comments: ""
    });
      /* ✅ SAFE API CALL */
    useEffect(() => {
      setSkills([
        {
          id: 1,
          name: "React",
          level: "Advanced",
          employeeRating: 4,
          managerRating: 3,
        },
        {
          id: 2,
          name: "JavaScript",
          level: "Advanced",
          employeeRating: 5,
          managerRating: 4,
        },
        {
          id: 3,
          name: "Java",
          level: "Intermediate",
          employeeRating: 3,
          managerRating: 3,
        },
      ]);
    }, []);

              
        useEffect(() => {
  const load = async () => {
    const data = await fetchMyProfile();
    console.log("PROFILE API RESPONSE:", data);
    setProfileData(data);

    // ✅ ADD THIS LINE HERE
    if (data?.employeeId) {
      localStorage.setItem("empId", data.employeeId);
    }
  };

  load();
}, []);

useEffect(() => {
  if (!exitData.notice || exitData.notice === "Custom") return; // ✅ FIX

  const days = parseInt(exitData.notice);
  if (isNaN(days)) return; // extra safety

  const today = new Date();
  if (isNaN(today.getTime())) return; // ✅ FIX
  const lwd = new Date();

  lwd.setDate(today.getDate() + days);
 if (isNaN(lwd.getTime())) return; // ✅ FIX
  const formatted = lwd.toISOString().split("T")[0];

  setCalculatedLwd(formatted);

  if (!earlyRelease) {
    setExitData(prev => ({
      ...prev,
      lwd: formatted
    }));
  }

}, [exitData.notice, earlyRelease]);

// ✅ NEW: Load resignations based on role
useEffect(() => {
  const loadResignations = async () => {
    try {
      const userEmail = user?.email || localStorage.getItem("email") || "";
      const userRole = (localStorage.getItem("role") || "").trim().toUpperCase();
      const userEmpId = localStorage.getItem("empId");

      console.log("🔍 LOADING RESIGNATIONS:");
      console.log("  - User Email:", userEmail);
      console.log("  - User Role:", userRole);
      console.log("  - User Emp ID:", userEmpId);

      // Load employee's own resignations
      if (userEmpId) {
        const myRes = await getResignationsByEmployee(userEmpId);
        console.log("📋 My Resignations:", myRes);
        setMyResignations(Array.isArray(myRes) ? myRes : []);
      }

      // Load resignations for manager approval
      if (userRole === "MANAGER" && userEmail) {
        console.log("👥 MANAGER - Fetching resignations for:", userEmail);
        const managerRes = await getResignationsForApproval(userEmail);
        console.log("📋 Manager Resignations Response:", managerRes);
        console.log("📊 Number of pending resignations:", Array.isArray(managerRes) ? managerRes.length : 0);
        setPendingManagerResignations(Array.isArray(managerRes) ? managerRes : []);

        // Also load all resignations for tracking table
        const allMgrRes = await getAllResignationsByManager(userEmail);
        setAllManagerResignations(Array.isArray(allMgrRes) ? allMgrRes : []);
      }

      // Load resignations for HR approval
      if (userRole === "ADMIN") {
        const hrRes = await getResignationsForHRApproval();
        console.log("📋 HR Resignations:", hrRes);
        setPendingHRResignations(Array.isArray(hrRes) ? hrRes : []);
        
        // Also load all resignations for tracking table
        const allRes = await getAllResignations();
        console.log("📋 All Resignations:", allRes);
        setAllResignations(Array.isArray(allRes) ? allRes : []);
      }
    } catch (err) {
      console.error("❌ Error loading resignations:", err);
    }
  };

  loadResignations();
}, [user]);


      const employee = {
 name: (() => {
  // Get actual name based on logged-in user
  if (user?.email === "Aishwarya@company.com") return "Aishwarya";
  if (user?.email === "mahesh@gmail.com") return "Mahesh";
  if (user?.email === "padmanabh@omoi.com") return "Padmanabh";
  if (user?.email === "adhviti@gmail.com") return "Adhviti";
  
  return profileData?.name ||
    profileData?.empName ||
    profileData?.fullName ||
    user?.name ||
    "N/A";
})(),

 id:
  profileData?.employeeId ??
  user?.employeeId ??
  empId ??
  "N/A",

  phone: profileData?.phone || "N/A",
  email: user?.email || profileData?.email || "N/A",

  dob: profileData?.dob || "",
  fatherName: profileData?.fatherName || "",
  motherName: profileData?.motherName || "",

  bloodGroup: profileData?.bloodGroup || "",
  permanentAddress: profileData?.permanentAddress || "",
  currentAddress: profileData?.currentAddress || "",

  city: profileData?.city || "",
  taluk: profileData?.taluk || "",
  district: profileData?.district || "",
  state: profileData?.state || "",
  pincode: profileData?.pincode || "",

  department: profileData?.department || "N/A",
  designation: profileData?.designation || "N/A",
  joiningDate: profileData?.joiningDate || "N/A",
  totalExp: profileData?.totalExp || "N/A",
  currentExp: profileData?.currentExp || "N/A",
};

  useEffect(() => {
    const saved = localStorage.getItem("jobEdit");
    if (!saved && employee && profileData) {  // ✅ ONLY if no saved data
      setJobEdit({
        designation: employee.designation,
        department: employee.department,
        joiningDate: employee.joiningDate,
        totalExp: employee.totalExp,
        currentExp: employee.currentExp,
        employmentType: "Full-Time",
        location: "Bangalore",
        manager: profileData?.managerName || "",
        hr: profileData?.hrName || ""
      });
    }
  }, []); // ✅ only runs once

    const refreshProfile = async () => {
    const data = await fetchMyProfile();
    setProfileData(data);
  };

   const reporting = [
  {
    name: profileData?.reportingManager || "Padmanabh",
    role: "Reporting Manager"
  },
  {
    name: profileData?.reportingHead || "Shambuling",
    role: "Reporting Head"
  },
  {
    name: profileData?.hrName || "Vishnuvardhan",
    role: "HR Business Partner"
  }
];



    const downloadPDF = (emp) => {
    const content = `
      Increment Letter

      Employee: ${emp?.name || employee.name}
      Date: 01 January 2025

      Congratulations! Your salary has been revised.

      Regards,
      HR Team
    `;

    const blob = new Blob([content], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${emp?.name || employee.name}_Increment_Letter.pdf`;
    link.click();
  };

 const [personalEdit, setPersonalEdit] = useState(() => {
  const saved = localStorage.getItem("personalEdit");
  return saved
    ? JSON.parse(saved)
    : {
        ...employee,
        
        city: "",
        district: "",
        state: "",
        pincode: "",
         address: "", // ✅ ADD THIS
         bankAccountNumber: "",
         ifsc: "",
      };
});

const bgvRecords = JSON.parse(localStorage.getItem("bgv_records")) || [];

const currentBGV = bgvRecords.find(
  (b) => b.employeeId === employee.id || b.employeeId === employee.employeeId
);

console.log("BGV Records:", bgvRecords);
console.log("Current BGV:", currentBGV);

const documents = [
  { name: "Resume.pdf", url: "/documents/Resume.pdf" },
  { name: "Aadhaar.pdf", url: "/documents/Aadhaar.pdf" },
  { name: "Offer_Letter.pdf", url: "/documents/Offer_Letter.pdf" }
];

const getDesignation = () => {
  if (role === "ADMIN") return "HR Manager / CEO";
  if (role === "MANAGER") return "Engineering Manager";
  return "Software Developer";
};
      return (
        <div className={styles.profilePage}>
          <div className={styles.profileContainer}>
            
            {/* ================= LEFT PANEL ================= */}
            <div className={styles.profileLeft}>
              <div className={styles.profileCard}>
             <div className={styles.imageWrapper}>
  <img
    src={profileImage || "https://randomuser.me/api/portraits/men/32.jpg"}
    alt="profile"
    className={styles.profileImage}
  />

  {/* Hidden file input */}
  <input
    id="profileUpload"
    type="file"
    accept="image/*"
    style={{ display: "none" }}
    onChange={(e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        setProfileImage(reader.result);
        localStorage.setItem("profileImage", reader.result);
      };
      reader.readAsDataURL(file);
    }}
  />

  {/* Edit button */}
  <label htmlFor="profileUpload" className={styles.editImageBtn}>
    ✎ Edit
  </label>
</div>

                <h3>{employee.name}</h3>
                <p className={styles.role}>{getDesignation()}</p>

                <div className={styles.infoList}>
                  <p><strong>Employee ID</strong> {employee.id}</p>
                </div>

              

                <div className={styles.quickLinks}>
                  <p onClick={() => setView("overview")}>Overview</p>
                  <p onClick={() => setView("compensation")}>Compensation</p>
                  <p onClick={() => setView("exit")}>Resignation Letter</p>
                    <p onClick={() => setView("skills")}>Skill Matrix</p> {/* NEW */}
                </div>
              </div>
            </div>

            {/* ================= RIGHT PANEL ================= */}
            <div className={styles.profileRight}>
              
              {/* HEADER */}
              <div className={styles.profileHeader}>
                <div>
                 
                </div>

                <select
                  className={styles.statusSelectLarge}
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option>Available</option>
                  <option>Active</option>
                  <option>Offline</option>
                  <option>Do Not Disturb</option>
                </select>
              </div>

              {/* ================= OVERVIEW ================= */}
              {view === "overview" && (
                <div className={styles.profileGrid}>

                <div className={styles.profileSectionCard}>
    <div className={styles.sectionHeader}>
      <h3>Personal Information</h3>
     {role === "ADMIN" && (
  <button
    className={styles.editBtn}
    onClick={() => setShowEditModal(true)}
  >
    Edit
  </button>
)}
    </div>

    <div className={styles.infoGrid}>
      <p><strong>Name:</strong> {personalEdit.name}</p>
      <p><strong>DOB:</strong> {personalEdit.dob}</p>
      <p><strong>Email:</strong> {personalEdit.email}</p>
      <p><strong>Phone:</strong> {personalEdit.phone}</p>
      <p><strong>Father:</strong> {personalEdit.fatherName}</p>
      <p><strong>Mother:</strong> {personalEdit.motherName}</p>
      <p><strong>Blood Group:</strong> {personalEdit.bloodGroup}</p>
      

<p><strong>City:</strong> {personalEdit.city}</p>
<p><strong>District:</strong> {personalEdit.district}</p>
<p><strong>State:</strong> {personalEdit.state}</p>
<p><strong>Pincode:</strong> {personalEdit.pincode}</p>
 <p><strong>Address:</strong> {personalEdit.address}</p>
 <p><strong>Bank Account No.:</strong> {personalEdit.bankAccountNumber || "N/A"}</p>
 <p><strong>IFSC:</strong> {personalEdit.ifsc || "N/A"}</p>
    </div>
    {showEditModal && (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h3>Edit Personal Information</h3>

        <div className={styles.formGrid}>

          <input
            placeholder="Name"
            value={personalEdit.name}
            onChange={(e)=>setPersonalEdit({...personalEdit, name:e.target.value})}
          />

        
          <input
            placeholder="Email"
            value={personalEdit.email}
            onChange={(e)=>setPersonalEdit({...personalEdit, email:e.target.value})}
          />

          <input
            placeholder="Phone"
            value={personalEdit.phone}
            onChange={(e)=>setPersonalEdit({...personalEdit, phone:e.target.value})}
          />

          <input
            placeholder="Father Name"
            value={personalEdit.fatherName}
            onChange={(e)=>setPersonalEdit({...personalEdit, fatherName:e.target.value})}
          />

          <input
            placeholder="Mother Name"
            value={personalEdit.motherName}
            onChange={(e)=>setPersonalEdit({...personalEdit, motherName:e.target.value})}
          />

        <input
    placeholder="Blood Group"
    value={personalEdit.bloodGroup}
    onChange={(e)=>setPersonalEdit({...personalEdit, bloodGroup:e.target.value})}
  />
<div className={styles.addressBox}>
  <label className={styles.addressLabel}>📍 Address Details</label>

  {/* Address Line */}
  <textarea
    className={styles.addressTextarea}
    placeholder="House / Flat / Street / Area"
    value={personalEdit.address || ""}
    onChange={(e) =>
      setPersonalEdit({ ...personalEdit, address: e.target.value })
    }
  />

  {/* Row: Pincode + City */}
  <div className={styles.addressRow}>
    <input
      className={styles.input}
      placeholder="Pincode"
      value={personalEdit.pincode || ""}
      maxLength={6}
      onChange={async (e) => {
        const pin = e.target.value;

        setPersonalEdit({ ...personalEdit, pincode: pin });

        // ✅ Auto-fetch like Google Maps
        if (pin.length === 6) {
          try {
            const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
            const data = await res.json();

            if (data[0]?.Status === "Success") {
              const postOffice = data[0].PostOffice[0];

              setPersonalEdit(prev => ({
                ...prev,
                city: postOffice.District || "",
                district: postOffice.District || "",
                state: postOffice.State || ""
              }));
            }
          } catch (err) {
            console.error("Pincode fetch error:", err);
          }
        }
      }}
    />

    <input
      className={styles.input}
      placeholder="City"
      value={personalEdit.city || ""}
      onChange={(e) =>
        setPersonalEdit({ ...personalEdit, city: e.target.value })
      }
    />
  </div>

  {/* Row: District + State */}
  <div className={styles.addressRow}>
    <input
      className={styles.input}
      placeholder="District"
      value={personalEdit.district || ""}
      readOnly
    />

    <input
      className={styles.input}
      placeholder="State"
      value={personalEdit.state || ""}
      readOnly
    />
  </div>
</div>

  <input
    placeholder="Bank Account Number"
    value={personalEdit.bankAccountNumber || ""}
    onChange={(e) => setPersonalEdit({ ...personalEdit, bankAccountNumber: e.target.value })}
  />

  <input
    placeholder="IFSC Code"
    value={personalEdit.ifsc || ""}
    onChange={(e) => setPersonalEdit({ ...personalEdit, ifsc: e.target.value })}
  />


          
 


        </div>

        <div className={styles.modalActions}>
          <button
            className={styles.saveBtn}
            onClick={() => {
  localStorage.setItem("personalEdit", JSON.stringify(personalEdit)); // ✅ SAVE
  setShowEditModal(false);
}}
          >
            Save
          </button>

    <button
  className={styles.cancelBtn}
  onClick={() => {
    const saved = localStorage.getItem("personalEdit");

    if (saved) {
      setPersonalEdit(JSON.parse(saved)); // ✅ FIXED
    } else {
      setPersonalEdit(employee); // fallback
    }

    setShowEditModal(false);
  }}
>
  Cancel
</button>
        </div>
      </div>
    </div>
  )}
  {showJobModal && (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h3>Edit Job Details</h3>

        <div className={styles.formGrid}>

          <input
            placeholder="Designation"
            value={jobEdit.designation}
            onChange={(e)=>setJobEdit({...jobEdit, designation:e.target.value})}
          />

          <input
            placeholder="Department"
            value={jobEdit.department}
            onChange={(e)=>setJobEdit({...jobEdit, department:e.target.value})}
          />

          <input
            placeholder="PF (Provident Fund)"
            value={jobEdit.pf}
            onChange={(e)=>setJobEdit({...jobEdit, pf:e.target.value})}
          />

          <input
            placeholder="UAN (Universal Account Number)"
            value={jobEdit.uan}
            onChange={(e)=>setJobEdit({...jobEdit, uan:e.target.value})}
          />

          <input
            placeholder="ESIC (Employees' State Insurance)"
            value={jobEdit.esic}
            onChange={(e)=>setJobEdit({...jobEdit, esic:e.target.value})}
          />

          <input
            type="date"
            value={jobEdit.joiningDate}
            onChange={(e)=>setJobEdit({...jobEdit, joiningDate:e.target.value})}
          />

          <input
            placeholder="Total Experience"
            value={jobEdit.totalExp}
            onChange={(e)=>setJobEdit({...jobEdit, totalExp:e.target.value})}
          />

          <input
            placeholder="Current Experience"
            value={jobEdit.currentExp}
            onChange={(e)=>setJobEdit({...jobEdit, currentExp:e.target.value})}
          />

          <input
            placeholder="Employment Type"
            value={jobEdit.employmentType}
            onChange={(e)=>setJobEdit({...jobEdit, employmentType:e.target.value})}
          />

          <input
            placeholder="Work Location"
            value={jobEdit.location}
            onChange={(e)=>setJobEdit({...jobEdit, location:e.target.value})}
          />

          <input
            placeholder="Manager"
            value={jobEdit.manager}
            onChange={(e)=>setJobEdit({...jobEdit, manager:e.target.value})}
          />

          <input
            placeholder="HR Partner"
            value={jobEdit.hr}
            onChange={(e)=>setJobEdit({...jobEdit, hr:e.target.value})}
          />

        </div>

        <div className={styles.modalActions}>
         <button
  type="button"
  className={styles.saveBtn}
  onClick={async (e) => {
    e.preventDefault();
    console.log("🔥 SAVE CLICKED");   // ✅ ADD THIS

    try {
      console.log("Sending data:", jobEdit);  // ✅ ADD THIS

      const response = await updateJobDetails({
  designation:     jobEdit.designation,
  department:      jobEdit.department,
  joiningDate:     jobEdit.joiningDate,
  totalExp:        jobEdit.totalExp,
  currentExp:      jobEdit.currentExp,
  pf:              jobEdit.pf,
  uan:             jobEdit.uan,
  esic:            jobEdit.esic,
  employmentType:  jobEdit.employmentType,
  location:        jobEdit.location,
  managerName:     jobEdit.manager,   // map frontend key → backend field
  hrName:          jobEdit.hr,        // map frontend key → backend field
});

      console.log("API RESPONSE:", response); // ✅ ADD THIS

      setJobEdit({
        designation:    response?.designation    || jobEdit.designation,
        department:     response?.department     || jobEdit.department,
        joiningDate:    response?.joiningDate    || jobEdit.joiningDate,
        totalExp:       response?.totalExp       || jobEdit.totalExp,
        currentExp:     response?.currentExp     || jobEdit.currentExp,
        pf:             response?.pf             || jobEdit.pf,
        uan:            response?.uan            || jobEdit.uan,
        esic:           response?.esic           || jobEdit.esic,
        employmentType: response?.employmentType || jobEdit.employmentType,
        location:       response?.location       || jobEdit.location,
        manager:        response?.managerName    || jobEdit.manager,
        hr:             response?.hrName         || jobEdit.hr,
      });

      localStorage.setItem("jobEdit", JSON.stringify({
        designation:    response?.designation    || jobEdit.designation,
        department:     response?.department     || jobEdit.department,
        joiningDate:    response?.joiningDate    || jobEdit.joiningDate,
        totalExp:       response?.totalExp       || jobEdit.totalExp,
        currentExp:     response?.currentExp     || jobEdit.currentExp,
        pf:             response?.pf             || jobEdit.pf,
        uan:            response?.uan            || jobEdit.uan,
        esic:           response?.esic           || jobEdit.esic,
        employmentType: response?.employmentType || jobEdit.employmentType,
        location:       response?.location       || jobEdit.location,
        manager:        response?.managerName    || jobEdit.manager,
        hr:             response?.hrName         || jobEdit.hr,
      }));
      await refreshProfile();

      alert("Job details updated successfully ✅");
      setShowJobModal(false);

    } catch (err) {
      console.error("❌ Job update error:", err);
      alert(err.message || "Failed to update job details ❌");
    }
  }}
>
  Save
</button>

         <button
  className={styles.cancelBtn}
 onClick={() => {
  const saved = localStorage.getItem("jobEdit");

  if (saved) {
    setJobEdit(JSON.parse(saved));
  } else {
    // ✅ fallback to original profile data
    setJobEdit({
      designation: employee.designation,
      department: employee.department,
      joiningDate: employee.joiningDate,
      totalExp: employee.totalExp,
      currentExp: employee.currentExp,
      employmentType: "Full-Time",
      location: "Bangalore",
      manager: profileData?.managerName || "",
      hr: profileData?.hrName || "",
      pf: "",
      uan: "",
      esic: ""
    });
  }

  setShowJobModal(false);
}}
>
  Cancel
</button>
        </div>
      </div>
    </div>
  )}
  </div>

  <div className={styles.profileSectionCard}>
    <div className={styles.sectionHeader}>
      <h3>Job Details</h3>
    {role === "ADMIN" && (
  <button
    className={styles.editBtn}
    onClick={() => setShowEditModal(true)}
  >
    Edit
  </button>
)}
    </div>

    <div className={styles.infoGrid}>
      <p><strong>Designation:</strong> {jobEdit.designation}</p>
      <p><strong>Department:</strong> {jobEdit.department}</p>
      <p><strong>PF:</strong> {jobEdit.pf || "N/A"}</p>
      <p><strong>UAN:</strong> {jobEdit.uan || "N/A"}</p>
      <p><strong>ESIC:</strong> {jobEdit.esic || "N/A"}</p>
      <p><strong>PF Member ID:</strong> {jobEdit.pfMemberId || "N/A"}</p>
      <p><strong>Designation Changed:</strong> {jobEdit.designationChanged || "N/A"}</p>
      <p><strong>Designation Changed Date:</strong> {jobEdit.designationChangedDate || "N/A"}</p>
      <p><strong>Date of Joining:</strong> {jobEdit.joiningDate}</p>
      <p><strong>Total Experience:</strong> {jobEdit.totalExp}</p>
      <p><strong>Current Experience:</strong> {jobEdit.currentExp}</p>
      <p><strong>Employment Type:</strong> {jobEdit.employmentType}</p>
      <p><strong>Work Location:</strong> {jobEdit.location}</p>
      <p><strong>Manager:</strong> {jobEdit.manager}</p>
      <p><strong>HR Partner:</strong> {jobEdit.hr}</p>
    </div>

   
  </div>

                 <div className={styles.profileSectionCard}>
  <h3>Reporting Structure</h3>

  {reporting.map((r, i) => (
    <div key={i} className={styles.reportRow}>
      <div className={styles.avatar}></div>

      <div>
        <p className={styles.reportName}>{r.name}</p>
        <span>{r.role}</span>
      </div>
    </div>
  ))}
</div>

                  <div className={styles.profileSectionCard}>
                    <h3>Documents</h3>
                    {documents.map((doc, i) => (
  <div key={i} className={styles.docRow}>
    <div>
      <p className={styles.docName}>{doc.name}</p>
      <span className={styles.docDate}>Uploaded</span>
    </div>

    <button
  className={styles.downloadBtn}
  onClick={() => {
    const link = document.createElement("a");
    link.href = doc.url;
    link.download = doc.name;
    link.target = "_blank"; // ✅ open correctly
    link.click();
  }}
>
  Download
</button>
  </div>
))}
                  </div>

                </div>
              )}

              {/* ================= COMPENSATION ================= */}
              {view === "compensation" && (
                <div className={styles.profileSectionCard}>
                 
                    
                  
                 

                  <h4 style={{ marginTop: "20px" }}>
                    Previous Year Appraisal
                  </h4>

                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Year</th>
                        <th>Rating</th>
                        <th>Hike</th>
                        <th>Hike Value</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>2024</td>
                        <td>Exceeds Expectations</td>
                        <td>18%</td>
                        <td>₹90,000</td>
                        <td>Outstanding performance</td>
                      </tr>
                      <tr>
                        <td>2023</td>
                        <td>Meets Expectations</td>
                        <td>12%</td>
                        <td>₹60,000</td>
                        <td>Consistent performer</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Increment Letter */}
                  <h4 style={{ marginTop: "24px" }}>
                    Increment Letter
                  </h4>

                  <div className={styles.docRow}>
                    <div>
                      <p className={styles.docName}>Increment_Letter_2025.pdf</p>
                      <span className={styles.docDate}>Issued on: 01 Jan 2025</span>
                    </div>

<div>
  <button
    className={styles.downloadBtn}
    onClick={() => {
      setSelectedEmployee(employee);
      setShowIncrementLetter(true);
    }}
  >
    View
  </button>

  <button
    className={styles.downloadBtn}
    style={{ marginLeft: "8px" }}
    onClick={() => downloadPDF(employee)}
  >
    Download
  </button>
</div>
                   </div>
                 {showIncrementLetter && selectedEmployee && (
  <div className={styles.incrementPreview}>
    
    <div style={{ textAlign: "center", marginBottom: "20px" }}>
      <h2>💼 Salary Revision Letter</h2>
      <p style={{ color: "#888" }}>Human Resources Department</p>
      <hr />
    </div>

    <p><strong>Date:</strong> 01 January 2025</p>

    <p>
      Dear <strong>{selectedEmployee.name}</strong>,
    </p>

    <p>
      We are pleased to inform you that based on your performance,
      your compensation has been revised as follows:
    </p>

    <div style={{ marginTop: "15px", lineHeight: "1.8" }}>
      <p><strong>Employee ID:</strong> {selectedEmployee.employeeId || selectedEmployee.id}</p>
      <p><strong>Department:</strong> {selectedEmployee.department}</p>
      <p><strong>Designation:</strong> {selectedEmployee.designation}</p>

      <hr />

      <p><strong>Previous CTC:</strong> ₹{selectedEmployee.ctc || "N/A"}</p>
      <p><strong>Hike Percentage:</strong> {selectedEmployee.hikePercent || "0"}%</p>
      <p><strong>Hike Value:</strong> ₹{selectedEmployee.hikeValue || "0"}</p>

      <hr />

      <p>
        <strong>Revised CTC:</strong>{" "}
        ₹
        {selectedEmployee.ctc && selectedEmployee.hikeValue
          ? Number(selectedEmployee.ctc) + Number(selectedEmployee.hikeValue)
          : "N/A"}
      </p>
    </div>

    <p style={{ marginTop: "20px" }}>
      This revision reflects your contribution and performance in the organization.
    </p>

    <p>
      Regards,<br />
      <strong>Human Resources Team</strong>
    </p>

    <button
      className={styles.closePreviewBtn}
      onClick={() => {
        setShowIncrementLetter(false);
        setSelectedEmployee(null);
      }}
    >
      Close
    </button>
  </div>
)}

                  {role === "ADMIN" && (
    <>
      <h4 style={{ marginTop: "20px" }}>Employee Compensation Tracking</h4>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Emp ID</th>
            <th>Employee Name</th>
            <th>DOB</th>
            <th>DOJ</th>
            <th>Tenure</th>
              {/* NEW COLUMNS */}
          <th>CTC</th>
          <th>Hike Value</th>
          <th>Hike %</th>
          <th>Hike Year</th>
            <th>Designation</th>
            <th>Department</th>
            <th>Increment Letter</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
  {Array.isArray(allEmployees) &&
  allEmployees.map((emp, i) => (
      <tr key={i}>
       <td>{emp.employeeId || emp.id}</td>
       
      <td>{emp.empName || emp.name || emp.fullName || "N/A"}</td>
        <td>{emp.dob}</td>
        <td>{emp.joiningDate}</td>
        <td>{emp.tenure}</td>
       
         {/* NEW VALUES (adjust field names if backend differs) */}
              <td>{emp.ctc || "-"}</td>
              <td>{emp.hikeValue || "-"}</td>
              <td>{emp.hikePercent || "-"}</td>
              <td>{emp.hikeYear || "-"}</td>
        <td>{emp.designation}</td>
        <td>{emp.department}</td>

        <td>{emp.incrementLetter || "Available"}</td>

       <td>
  <div className={styles.actionGroup}>
    <button
      className={styles.viewBtn}
     onClick={() => {
  setSelectedEmployee(emp || {});
  setTimeout(() => {
    setShowIncrementLetter(true);
  }, 0);
}}
    >
      👁 View
    </button>

    <button
      className={styles.downloadBtn}
      onClick={() => downloadPDF(emp)}
    >
      ⬇ Download
    </button>
  </div>
</td>
      </tr>
    ))}
  </tbody>
      </table>
    </>
  )}
                </div>
              )}

              

              {/* ================= RESIGNATION LETTER ================= */}
              {view === "exit" && (
                <div className={styles.profileSectionCard}>
                  <h3>Resignation Letter</h3>

                  {/* ===== EMPLOYEE VIEW ===== */}
                  {role === "EMPLOYEE" && (
                    <>
                      {/* FORM - Only show if no resignation submitted */}
                      {myResignations.length === 0 ? (
                        <form className={styles.exitForm}>
                          <label>Reason for Resignation</label>
                          <textarea
                            className={styles.input}
                            required
                            value={exitData.reason}
                            onChange={(e) =>
                              setExitData({ ...exitData, reason: e.target.value })
                            }
                          />

                          <label>Remarks</label>
                          <textarea
                            className={styles.input}
                            placeholder="Additional comments"
                            value={exitData.remarks || ""}
                            onChange={(e) =>
                              setExitData({ ...exitData, remarks: e.target.value })
                            }
                          />

                          <label>TO (Reporting Manager)</label>
                          <div className={styles.gmailInputContainer}>
                            <div className={styles.gmailChips}>
                              {exitData.manager.map((u, idx) => (
                                <span key={idx} className={styles.gmailChip}>
                                  {u.name} &lt;{u.email}&gt;
                                  <button 
                                    type="button"
                                    onClick={() => {
                                      const updated = exitData.manager.filter((_, i) => i !== idx);
                                      setExitData({ ...exitData, manager: updated });
                                    }}
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                              <input
                                type="text"
                                className={styles.gmailInput}
                                placeholder={exitData.manager.length === 0 ? "Add recipients..." : ""}
                                value={searchTo}
                                onChange={(e) => setSearchTo(e.target.value)}
                                onFocus={() => setSearchTo("")}
                              />
                            </div>

                            {searchTo && searchTo.length >= 2 && (
                              <div className={styles.gmailSuggestions}>
                                {users
                                  .filter(u =>
                                    u.name.toLowerCase().includes(searchTo.toLowerCase()) ||
                                    u.email.toLowerCase().includes(searchTo.toLowerCase())
                                  )
                                  .filter(u => !exitData.manager.find(x => x.id === u.id))
                                  .slice(0, 5)
                                  .map(u => (
                                    <div
                                      key={u.id}
                                      className={styles.gmailSuggestionItem}
                                      onClick={() => {
                                        setExitData({
                                          ...exitData,
                                          manager: [...exitData.manager, u]
                                        });
                                        setSearchTo("");
                                      }}
                                    >
                                      <div className={styles.suggestionName}>{u.name}</div>
                                      <div className={styles.suggestionEmail}>{u.email}</div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>

                          <label>CC</label>
                          <div className={styles.gmailInputContainer}>
                            <div className={styles.gmailChips}>
                              {exitData.cc.map((u, idx) => (
                                <span key={idx} className={styles.gmailChip}>
                                  {u.name} &lt;{u.email}&gt;
                                  <button 
                                    type="button"
                                    onClick={() => {
                                      const updated = exitData.cc.filter((_, i) => i !== idx);
                                      setExitData({ ...exitData, cc: updated });
                                    }}
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                              <input
                                type="text"
                                className={styles.gmailInput}
                                placeholder={exitData.cc.length === 0 ? "Add CC recipients..." : ""}
                                value={searchCc}
                                onChange={(e) => setSearchCc(e.target.value)}
                                onFocus={() => setSearchCc("")}
                              />
                            </div>

                            {searchCc && searchCc.length >= 2 && (
                              <div className={styles.gmailSuggestions}>
                                {users
                                  .filter(u =>
                                    u.name.toLowerCase().includes(searchCc.toLowerCase()) ||
                                    u.email.toLowerCase().includes(searchCc.toLowerCase())
                                  )
                                  .filter(u => !exitData.cc.find(x => x.id === u.id))
                                  .slice(0, 5)
                                  .map(u => (
                                    <div
                                      key={u.id}
                                      className={styles.gmailSuggestionItem}
                                      onClick={() => {
                                        setExitData({
                                          ...exitData,
                                          cc: [...exitData.cc, u]
                                        });
                                        setSearchCc("");
                                      }}
                                    >
                                      <div className={styles.suggestionName}>{u.name}</div>
                                      <div className={styles.suggestionEmail}>{u.email}</div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>

                          <label>Notice Period</label>
                          <select
                            className={styles.input}
                            value={exitData.notice}
                            onChange={(e) =>
                              setExitData({ ...exitData, notice: e.target.value })
                            }
                          >
                            <option>30 Days</option>
                            <option>45 Days</option>
                            <option>60 Days</option>
                            <option>90 Days</option>
                          </select>

                          <label>
                            <input
                              type="checkbox"
                              checked={earlyRelease}
                              onChange={() => setEarlyRelease(!earlyRelease)}
                            />
                            Request Early Release
                          </label>

                          {earlyRelease && (
                            <>
                              <label>Select Early Release Date</label>
                              <input
                                type="date"
                                className={styles.input}
                                value={exitData.lwd}
                                onChange={(e) =>
                                  setExitData({ ...exitData, lwd: e.target.value })
                                }
                              />
                            </>
                          )}

                          <label>Last Working Day</label>
                          <input
                            type="date"
                            className={styles.input}
                            required
                            value={exitData.lwd}
                            onChange={(e) =>
                              setExitData({ ...exitData, lwd: e.target.value })
                            }
                          />

                          <div className={styles.noticeBox}>
                            ⚠️ Request will go to your manager for approval
                          </div>

                          <button
                            type="button"
                            className={styles.submitBtn}
                            onClick={async (e) => {
                              e.preventDefault();
                              try {
                                // ✅ FIX: Use manager's EMAIL instead of name
                                const resignationData = {
                                  empId: employee.id,
                                  empName: employee.name,
                                  department: employee.department,
                                  managerName: exitData.manager[0]?.email || profileData?.managerEmail || profileData?.managerName || "",
                                  reason: exitData.reason,
                                  remarks: exitData.remarks,
                                  resignationDate: new Date().toISOString().split('T')[0],
                                  lastWorkingDay: exitData.lwd,
                                  status: "PENDING_MANAGER"
                                };

                                console.log("📤 Submitting resignation with manager email:", resignationData.managerName);

                                const result = await submitResignation(resignationData);
                                alert("✅ Resignation submitted successfully!");
                                
                                // Reload resignations
                                const myRes = await getResignationsByEmployee(employee.id);
                                setMyResignations(Array.isArray(myRes) ? myRes : []);
                                
                                // Reset form
                                setExitData({
                                  reason: "",
                                  notice: "60 Days",
                                  lwd: "",
                                  manager: [],
                                  cc: [],
                                  remarks: ""
                                });
                              } catch (err) {
                                console.error("Resignation submission error:", err);
                                alert("❌ Failed to submit resignation");
                              }
                            }}
                          >
                            Submit Resignation
                          </button>
                        </form>
                      ) : (
                        <>
                          <div className={styles.exitStatusBox}>
                            <p><strong>Your Resignation Status:</strong></p>
                            {myResignations.map((res, idx) => (
                              <div key={idx} style={{ marginTop: "10px", padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}>
                                <p><strong>Submitted:</strong> {res.resignationDate}</p>
                                <p><strong>Last Working Day:</strong> {res.lastWorkingDay}</p>
                                <p><strong>Reason:</strong> {res.reason}</p>
                                <p><strong>Status:</strong> 
                                  <span style={{ 
                                    marginLeft: "10px",
                                    padding: "4px 8px",
                                    borderRadius: "4px",
                                    backgroundColor: res.status === "APPROVED" ? "#d4edda" : res.status === "REJECTED" ? "#f8d7da" : "#fff3cd",
                                    color: res.status === "APPROVED" ? "#155724" : res.status === "REJECTED" ? "#721c24" : "#856404"
                                  }}>
                                    {res.status}
                                  </span>
                                </p>
                                {res.rejectionReason && (
                                  <p><strong>Rejection Reason:</strong> {res.rejectionReason}</p>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Employee Resignation Tracking Table */}
                          <div style={{ marginTop: "30px" }}>
                            <h4>📋 My Resignation Tracking</h4>
                            <table className={styles.table}>
                              <thead>
                                <tr>
                                  <th>Submitted Date</th>
                                  <th>Reason</th>
                                  <th>Last Working Day</th>
                                  <th>Status</th>
                                  <th>Manager Approval</th>
                                  <th>HR Approval</th>
                                </tr>
                              </thead>
                              <tbody>
                                {myResignations.map((res, idx) => (
                                  <tr key={idx}>
                                    <td>{res.resignationDate}</td>
                                    <td>{res.reason}</td>
                                    <td>{res.lastWorkingDay}</td>
                                    <td>
                                      <span style={{
                                        padding: "4px 8px",
                                        borderRadius: "4px",
                                        backgroundColor: 
                                          res.status === "APPROVED" ? "#d4edda" : 
                                          res.status === "REJECTED" ? "#f8d7da" : 
                                          res.status === "PENDING_HR" ? "#cce5ff" : "#fff3cd",
                                        color: 
                                          res.status === "APPROVED" ? "#155724" : 
                                          res.status === "REJECTED" ? "#721c24" : 
                                          res.status === "PENDING_HR" ? "#004085" : "#856404"
                                      }}>
                                        {res.status}
                                      </span>
                                    </td>
                                    <td>{res.approvedByManager || "Pending"}</td>
                                    <td>{res.approvedByHR || "Pending"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {/* ===== MANAGER VIEW ===== */}
                  {role === "MANAGER" && (
                    <>
                      {/* ===== MANAGER OWN RESIGNATION FORM ===== */}
                      {myResignations.length === 0 ? (
                        <form className={styles.exitForm}>
                          <label>Reason for Resignation</label>
                          <textarea
                            className={styles.input}
                            required
                            value={exitData.reason}
                            onChange={(e) => setExitData({ ...exitData, reason: e.target.value })}
                          />

                          <label>Remarks</label>
                          <textarea
                            className={styles.input}
                            placeholder="Additional comments"
                            value={exitData.remarks || ""}
                            onChange={(e) => setExitData({ ...exitData, remarks: e.target.value })}
                          />

                          <label>TO (Reporting Head / Board)</label>
                          <div className={styles.gmailInputContainer}>
                            <div className={styles.gmailChips}>
                              {exitData.manager.map((u, idx) => (
                                <span key={idx} className={styles.gmailChip}>
                                  {u.name} &lt;{u.email}&gt;
                                  <button type="button" onClick={() => {
                                    const updated = exitData.manager.filter((_, i) => i !== idx);
                                    setExitData({ ...exitData, manager: updated });
                                  }}>×</button>
                                </span>
                              ))}
                              <input
                                type="text"
                                className={styles.gmailInput}
                                placeholder={exitData.manager.length === 0 ? "Add recipients..." : ""}
                                value={searchTo}
                                onChange={(e) => setSearchTo(e.target.value)}
                                onFocus={() => setSearchTo("")}
                              />
                            </div>
                            {searchTo && searchTo.length >= 2 && (
                              <div className={styles.gmailSuggestions}>
                                {users
                                  .filter(u =>
                                    u.name.toLowerCase().includes(searchTo.toLowerCase()) ||
                                    u.email.toLowerCase().includes(searchTo.toLowerCase())
                                  )
                                  .filter(u => !exitData.manager.find(x => x.id === u.id))
                                  .slice(0, 5)
                                  .map(u => (
                                    <div key={u.id} className={styles.gmailSuggestionItem}
                                      onClick={() => {
                                        setExitData({ ...exitData, manager: [...exitData.manager, u] });
                                        setSearchTo("");
                                      }}>
                                      <div className={styles.suggestionName}>{u.name}</div>
                                      <div className={styles.suggestionEmail}>{u.email}</div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>

                          <label>CC</label>
                          <div className={styles.gmailInputContainer}>
                            <div className={styles.gmailChips}>
                              {exitData.cc.map((u, idx) => (
                                <span key={idx} className={styles.gmailChip}>
                                  {u.name} &lt;{u.email}&gt;
                                  <button type="button" onClick={() => {
                                    const updated = exitData.cc.filter((_, i) => i !== idx);
                                    setExitData({ ...exitData, cc: updated });
                                  }}>×</button>
                                </span>
                              ))}
                              <input
                                type="text"
                                className={styles.gmailInput}
                                placeholder={exitData.cc.length === 0 ? "Add CC recipients..." : ""}
                                value={searchCc}
                                onChange={(e) => setSearchCc(e.target.value)}
                                onFocus={() => setSearchCc("")}
                              />
                            </div>
                            {searchCc && searchCc.length >= 2 && (
                              <div className={styles.gmailSuggestions}>
                                {users
                                  .filter(u =>
                                    u.name.toLowerCase().includes(searchCc.toLowerCase()) ||
                                    u.email.toLowerCase().includes(searchCc.toLowerCase())
                                  )
                                  .filter(u => !exitData.cc.find(x => x.id === u.id))
                                  .slice(0, 5)
                                  .map(u => (
                                    <div key={u.id} className={styles.gmailSuggestionItem}
                                      onClick={() => {
                                        setExitData({ ...exitData, cc: [...exitData.cc, u] });
                                        setSearchCc("");
                                      }}>
                                      <div className={styles.suggestionName}>{u.name}</div>
                                      <div className={styles.suggestionEmail}>{u.email}</div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>

                          <label>Notice Period</label>
                          <select
                            className={styles.input}
                            value={exitData.notice}
                            onChange={(e) => setExitData({ ...exitData, notice: e.target.value })}
                          >
                            <option>30 Days</option>
                            <option>45 Days</option>
                            <option>60 Days</option>
                            <option>90 Days</option>
                          </select>

                          <label>
                            <input
                              type="checkbox"
                              checked={earlyRelease}
                              onChange={() => setEarlyRelease(!earlyRelease)}
                            />
                            Request Early Release
                          </label>

                          {earlyRelease && (
                            <>
                              <label>Select Early Release Date</label>
                              <input
                                type="date"
                                className={styles.input}
                                value={exitData.lwd}
                                onChange={(e) => setExitData({ ...exitData, lwd: e.target.value })}
                              />
                            </>
                          )}

                          <label>Last Working Day</label>
                          <input
                            type="date"
                            className={styles.input}
                            required
                            value={exitData.lwd}
                            onChange={(e) => setExitData({ ...exitData, lwd: e.target.value })}
                          />

                          <div className={styles.noticeBox}>
                            ⚠️ Request will go to the board / reporting authority for approval
                          </div>

                          <button
                            type="button"
                            className={styles.submitBtn}
                            onClick={async (e) => {
                              e.preventDefault();
                              try {
                                const resignationData = {
                                  empId: employee.id,
                                  empName: employee.name,
                                  department: employee.department,
                                  managerName: exitData.manager[0]?.email || profileData?.managerEmail || profileData?.managerName || "",
                                  reason: exitData.reason,
                                  remarks: exitData.remarks,
                                  resignationDate: new Date().toISOString().split('T')[0],
                                  lastWorkingDay: exitData.lwd,
                                  status: "PENDING_MANAGER"
                                };
                                await submitResignation(resignationData);
                                alert("✅ Resignation submitted successfully!");
                                const myRes = await getResignationsByEmployee(employee.id);
                                setMyResignations(Array.isArray(myRes) ? myRes : []);
                                setExitData({ reason: "", notice: "60 Days", lwd: "", manager: [], cc: [], remarks: "" });
                              } catch (err) {
                                console.error("Resignation submission error:", err);
                                alert("❌ Failed to submit resignation");
                              }
                            }}
                          >
                            Submit Resignation
                          </button>
                        </form>
                      ) : (
                        <>
                          <div className={styles.exitStatusBox}>
                            <p><strong>Your Resignation Status:</strong></p>
                            {myResignations.map((res, idx) => (
                              <div key={idx} style={{ marginTop: "10px", padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}>
                                <p><strong>Submitted:</strong> {res.resignationDate}</p>
                                <p><strong>Last Working Day:</strong> {res.lastWorkingDay}</p>
                                <p><strong>Reason:</strong> {res.reason}</p>
                                <p><strong>Status:</strong>
                                  <span style={{
                                    marginLeft: "10px", padding: "4px 8px", borderRadius: "4px",
                                    backgroundColor: res.status === "APPROVED" ? "#d4edda" : res.status === "REJECTED" ? "#f8d7da" : "#fff3cd",
                                    color: res.status === "APPROVED" ? "#155724" : res.status === "REJECTED" ? "#721c24" : "#856404"
                                  }}>
                                    {res.status}
                                  </span>
                                </p>
                              </div>
                            ))}
                          </div>

                          {/* Manager's Own Resignation Tracking Table */}
                          <div style={{ marginTop: "20px" }}>
                            <h4>📋 My Resignation Tracking</h4>
                            <table className={styles.table}>
                              <thead>
                                <tr>
                                  <th>Submitted Date</th>
                                  <th>Reason</th>
                                  <th>Last Working Day</th>
                                  <th>Status</th>
                                  <th>Manager Approval</th>
                                  <th>HR Approval</th>
                                </tr>
                              </thead>
                              <tbody>
                                {myResignations.map((res, idx) => (
                                  <tr key={idx}>
                                    <td>{res.resignationDate}</td>
                                    <td>{res.reason}</td>
                                    <td>{res.lastWorkingDay}</td>
                                    <td>
                                      <span style={{
                                        padding: "4px 8px", borderRadius: "4px",
                                        backgroundColor:
                                          res.status === "APPROVED" ? "#d4edda" :
                                          res.status === "REJECTED" ? "#f8d7da" :
                                          res.status === "PENDING_HR" ? "#cce5ff" : "#fff3cd",
                                        color:
                                          res.status === "APPROVED" ? "#155724" :
                                          res.status === "REJECTED" ? "#721c24" :
                                          res.status === "PENDING_HR" ? "#004085" : "#856404"
                                      }}>
                                        {res.status}
                                      </span>
                                    </td>
                                    <td>{res.approvedByManager || "Pending"}</td>
                                    <td>{res.approvedByHR || "Pending"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </>
                      )}

                      <hr style={{ margin: "24px 0", borderColor: "#e0e0e0" }} />

                      {/* PENDING APPROVALS */}
                      <h4>Pending Resignations for Approval</h4>
                      {pendingManagerResignations.length === 0 ? (
                        <p style={{ color: "#666" }}>No pending resignations</p>
                      ) : (
                        <table className={styles.table}>
                          <thead>
                            <tr>
                              <th>Emp ID</th>
                              <th>Employee Name</th>
                              <th>Department</th>
                              <th>Reason</th>
                              <th>Last Working Day</th>
                              <th>Submitted Date</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pendingManagerResignations.map((res, idx) => (
                              <tr key={idx}>
                                <td>{res.empId}</td>
                                <td>{res.empName}</td>
                                <td>{res.department}</td>
                                <td>{res.reason}</td>
                                <td>{res.lastWorkingDay}</td>
                                <td>{res.resignationDate}</td>
                                <td>
                                  <button
                                    className={styles.approveBtn}
                                    onClick={async () => {
                                      try {
                                        const userEmail = user?.email || localStorage.getItem("email") || "";
                                        await approveResignation(res.id, userEmail);
                                        alert("✅ Resignation approved! Forwarded to HR.");

                                        // Reload both pending and tracking
                                        const managerRes = await getResignationsForApproval(userEmail);
                                        setPendingManagerResignations(Array.isArray(managerRes) ? managerRes : []);
                                        const allMgrRes = await getAllResignationsByManager(userEmail);
                                        setAllManagerResignations(Array.isArray(allMgrRes) ? allMgrRes : []);
                                      } catch (err) {
                                        console.error("Approval error:", err);
                                        alert("❌ Failed to approve resignation");
                                      }
                                    }}
                                    style={{ marginRight: "5px" }}
                                  >
                                    ✓ Approve
                                  </button>
                                  <button
                                    className={styles.rejectBtn}
                                    onClick={async () => {
                                      const reason = prompt("Enter rejection reason:");
                                      if (!reason) return;

                                      try {
                                        const userEmail = user?.email || localStorage.getItem("email") || "";
                                        await rejectResignation(res.id, reason);
                                        alert("✅ Resignation rejected!");

                                        // Reload both pending and tracking
                                        const managerRes = await getResignationsForApproval(userEmail);
                                        setPendingManagerResignations(Array.isArray(managerRes) ? managerRes : []);
                                        const allMgrRes = await getAllResignationsByManager(userEmail);
                                        setAllManagerResignations(Array.isArray(allMgrRes) ? allMgrRes : []);
                                      } catch (err) {
                                        console.error("Rejection error:", err);
                                        alert("❌ Failed to reject resignation");
                                      }
                                    }}
                                  >
                                    ✗ Reject
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}

                      {/* RESIGNATION TRACKING TABLE */}
                      <div style={{ marginTop: "30px" }}>
                        <h4>Resignation Tracking</h4>
                        {allManagerResignations.length === 0 ? (
                          <p style={{ color: "#666" }}>No resignations to track</p>
                        ) : (
                          <table className={styles.table}>
                            <thead>
                              <tr>
                                <th>Emp ID</th>
                                <th>Name</th>
                                <th>Dept</th>
                                <th>Reason</th>
                                <th>Submitted Date</th>
                                <th>Last Working Day</th>
                                <th>Status</th>
                                <th>Approved By Manager</th>
                                <th>Approved By HR</th>
                              </tr>
                            </thead>
                            <tbody>
                              {allManagerResignations.map((res, idx) => (
                                <tr key={idx}>
                                  <td>{res.empId}</td>
                                  <td>{res.empName}</td>
                                  <td>{res.department}</td>
                                  <td>{res.reason}</td>
                                  <td>{res.resignationDate}</td>
                                  <td>{res.lastWorkingDay}</td>
                                  <td>
                                    <span style={{
                                      padding: "4px 8px",
                                      borderRadius: "4px",
                                      backgroundColor:
                                        res.status === "APPROVED" ? "#d4edda" :
                                        res.status === "REJECTED" ? "#f8d7da" :
                                        res.status === "PENDING_HR" ? "#cce5ff" : "#fff3cd",
                                      color:
                                        res.status === "APPROVED" ? "#155724" :
                                        res.status === "REJECTED" ? "#721c24" :
                                        res.status === "PENDING_HR" ? "#004085" : "#856404"
                                    }}>
                                      {res.status}
                                    </span>
                                  </td>
                                  <td>{res.approvedByManager || "-"}</td>
                                  <td>{res.approvedByHR || "-"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </>
                  )}

                  {/* ===== ADMIN VIEW ===== */}
                  {role === "ADMIN" && (
                    <>
                      {/* ===== ADMIN OWN RESIGNATION FORM ===== */}
                      {myResignations.length === 0 ? (
                        <form className={styles.exitForm}>
                          <label>Reason for Resignation</label>
                          <textarea
                            className={styles.input}
                            required
                            value={exitData.reason}
                            onChange={(e) => setExitData({ ...exitData, reason: e.target.value })}
                          />

                          <label>Remarks</label>
                          <textarea
                            className={styles.input}
                            placeholder="Additional comments"
                            value={exitData.remarks || ""}
                            onChange={(e) => setExitData({ ...exitData, remarks: e.target.value })}
                          />

                          <label>TO (Reporting Head / Board)</label>
                          <div className={styles.gmailInputContainer}>
                            <div className={styles.gmailChips}>
                              {exitData.manager.map((u, idx) => (
                                <span key={idx} className={styles.gmailChip}>
                                  {u.name} &lt;{u.email}&gt;
                                  <button type="button" onClick={() => {
                                    const updated = exitData.manager.filter((_, i) => i !== idx);
                                    setExitData({ ...exitData, manager: updated });
                                  }}>×</button>
                                </span>
                              ))}
                              <input
                                type="text"
                                className={styles.gmailInput}
                                placeholder={exitData.manager.length === 0 ? "Add recipients..." : ""}
                                value={searchTo}
                                onChange={(e) => setSearchTo(e.target.value)}
                                onFocus={() => setSearchTo("")}
                              />
                            </div>
                            {searchTo && searchTo.length >= 2 && (
                              <div className={styles.gmailSuggestions}>
                                {users
                                  .filter(u =>
                                    u.name.toLowerCase().includes(searchTo.toLowerCase()) ||
                                    u.email.toLowerCase().includes(searchTo.toLowerCase())
                                  )
                                  .filter(u => !exitData.manager.find(x => x.id === u.id))
                                  .slice(0, 5)
                                  .map(u => (
                                    <div key={u.id} className={styles.gmailSuggestionItem}
                                      onClick={() => {
                                        setExitData({ ...exitData, manager: [...exitData.manager, u] });
                                        setSearchTo("");
                                      }}>
                                      <div className={styles.suggestionName}>{u.name}</div>
                                      <div className={styles.suggestionEmail}>{u.email}</div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>

                          <label>CC</label>
                          <div className={styles.gmailInputContainer}>
                            <div className={styles.gmailChips}>
                              {exitData.cc.map((u, idx) => (
                                <span key={idx} className={styles.gmailChip}>
                                  {u.name} &lt;{u.email}&gt;
                                  <button type="button" onClick={() => {
                                    const updated = exitData.cc.filter((_, i) => i !== idx);
                                    setExitData({ ...exitData, cc: updated });
                                  }}>×</button>
                                </span>
                              ))}
                              <input
                                type="text"
                                className={styles.gmailInput}
                                placeholder={exitData.cc.length === 0 ? "Add CC recipients..." : ""}
                                value={searchCc}
                                onChange={(e) => setSearchCc(e.target.value)}
                                onFocus={() => setSearchCc("")}
                              />
                            </div>
                            {searchCc && searchCc.length >= 2 && (
                              <div className={styles.gmailSuggestions}>
                                {users
                                  .filter(u =>
                                    u.name.toLowerCase().includes(searchCc.toLowerCase()) ||
                                    u.email.toLowerCase().includes(searchCc.toLowerCase())
                                  )
                                  .filter(u => !exitData.cc.find(x => x.id === u.id))
                                  .slice(0, 5)
                                  .map(u => (
                                    <div key={u.id} className={styles.gmailSuggestionItem}
                                      onClick={() => {
                                        setExitData({ ...exitData, cc: [...exitData.cc, u] });
                                        setSearchCc("");
                                      }}>
                                      <div className={styles.suggestionName}>{u.name}</div>
                                      <div className={styles.suggestionEmail}>{u.email}</div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>

                          <label>Notice Period</label>
                          <select
                            className={styles.input}
                            value={exitData.notice}
                            onChange={(e) => setExitData({ ...exitData, notice: e.target.value })}
                          >
                            <option>30 Days</option>
                            <option>45 Days</option>
                            <option>60 Days</option>
                            <option>90 Days</option>
                          </select>

                          <label>
                            <input
                              type="checkbox"
                              checked={earlyRelease}
                              onChange={() => setEarlyRelease(!earlyRelease)}
                            />
                            Request Early Release
                          </label>

                          {earlyRelease && (
                            <>
                              <label>Select Early Release Date</label>
                              <input
                                type="date"
                                className={styles.input}
                                value={exitData.lwd}
                                onChange={(e) => setExitData({ ...exitData, lwd: e.target.value })}
                              />
                            </>
                          )}

                          <label>Last Working Day</label>
                          <input
                            type="date"
                            className={styles.input}
                            required
                            value={exitData.lwd}
                            onChange={(e) => setExitData({ ...exitData, lwd: e.target.value })}
                          />

                          <div className={styles.noticeBox}>
                            ⚠️ Request will go to the board / reporting authority for approval
                          </div>

                          <button
                            type="button"
                            className={styles.submitBtn}
                            onClick={async (e) => {
                              e.preventDefault();
                              try {
                                const resignationData = {
                                  empId: employee.id,
                                  empName: employee.name,
                                  department: employee.department,
                                  managerName: exitData.manager[0]?.email || profileData?.managerEmail || profileData?.managerName || "",
                                  reason: exitData.reason,
                                  remarks: exitData.remarks,
                                  resignationDate: new Date().toISOString().split('T')[0],
                                  lastWorkingDay: exitData.lwd,
                                  status: "PENDING_MANAGER"
                                };
                                await submitResignation(resignationData);
                                alert("✅ Resignation submitted successfully!");
                                const myRes = await getResignationsByEmployee(employee.id);
                                setMyResignations(Array.isArray(myRes) ? myRes : []);
                                setExitData({ reason: "", notice: "60 Days", lwd: "", manager: [], cc: [], remarks: "" });
                              } catch (err) {
                                console.error("Resignation submission error:", err);
                                alert("❌ Failed to submit resignation");
                              }
                            }}
                          >
                            Submit Resignation
                          </button>
                        </form>
                      ) : (
                        <>
                          <div className={styles.exitStatusBox}>
                            <p><strong>Your Resignation Status:</strong></p>
                            {myResignations.map((res, idx) => (
                              <div key={idx} style={{ marginTop: "10px", padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}>
                                <p><strong>Submitted:</strong> {res.resignationDate}</p>
                                <p><strong>Last Working Day:</strong> {res.lastWorkingDay}</p>
                                <p><strong>Reason:</strong> {res.reason}</p>
                                <p><strong>Status:</strong>
                                  <span style={{
                                    marginLeft: "10px", padding: "4px 8px", borderRadius: "4px",
                                    backgroundColor: res.status === "APPROVED" ? "#d4edda" : res.status === "REJECTED" ? "#f8d7da" : "#fff3cd",
                                    color: res.status === "APPROVED" ? "#155724" : res.status === "REJECTED" ? "#721c24" : "#856404"
                                  }}>
                                    {res.status}
                                  </span>
                                </p>
                              </div>
                            ))}
                          </div>

                          {/* Admin's Own Resignation Tracking Table */}
                          <div style={{ marginTop: "20px" }}>
                            <h4>📋 My Resignation Tracking</h4>
                            <table className={styles.table}>
                              <thead>
                                <tr>
                                  <th>Submitted Date</th>
                                  <th>Reason</th>
                                  <th>Last Working Day</th>
                                  <th>Status</th>
                                  <th>Manager Approval</th>
                                  <th>HR Approval</th>
                                </tr>
                              </thead>
                              <tbody>
                                {myResignations.map((res, idx) => (
                                  <tr key={idx}>
                                    <td>{res.resignationDate}</td>
                                    <td>{res.reason}</td>
                                    <td>{res.lastWorkingDay}</td>
                                    <td>
                                      <span style={{
                                        padding: "4px 8px", borderRadius: "4px",
                                        backgroundColor:
                                          res.status === "APPROVED" ? "#d4edda" :
                                          res.status === "REJECTED" ? "#f8d7da" :
                                          res.status === "PENDING_HR" ? "#cce5ff" : "#fff3cd",
                                        color:
                                          res.status === "APPROVED" ? "#155724" :
                                          res.status === "REJECTED" ? "#721c24" :
                                          res.status === "PENDING_HR" ? "#004085" : "#856404"
                                      }}>
                                        {res.status}
                                      </span>
                                    </td>
                                    <td>{res.approvedByManager || "Pending"}</td>
                                    <td>{res.approvedByHR || "Pending"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </>
                      )}

                      <hr style={{ margin: "24px 0", borderColor: "#e0e0e0" }} />

                      <h4>Pending HR Approvals</h4>
                      {pendingHRResignations.length === 0 ? (
                        <p style={{ color: "#666" }}>No pending HR approvals</p>
                      ) : (
                        <table className={styles.table}>
                          <thead>
                            <tr>
                              <th>Emp ID</th>
                              <th>Employee Name</th>
                              <th>Department</th>
                              <th>Manager Approved</th>
                              <th>Reason</th>
                              <th>Last Working Day</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pendingHRResignations.map((res, idx) => (
                              <tr key={idx}>
                                <td>{res.empId}</td>
                                <td>{res.empName}</td>
                                <td>{res.department}</td>
                                <td>{res.approvedByManager || "-"}</td>
                                <td>{res.reason}</td>
                                <td>{res.lastWorkingDay}</td>
                                <td>
                                  <button
                                    className={styles.approveBtn}
                                    onClick={async () => {
                                      try {
                                        const userEmail = user?.email || localStorage.getItem("email") || "";
                                        await approveResignation(res.id, userEmail);
                                        alert("✅ Resignation approved!");
                                        
                                        // Reload resignations
                                        const hrRes = await getResignationsForHRApproval();
                                        setPendingHRResignations(Array.isArray(hrRes) ? hrRes : []);
                                        
                                        const allRes = await getAllResignations();
                                        setAllResignations(Array.isArray(allRes) ? allRes : []);
                                      } catch (err) {
                                        console.error("Approval error:", err);
                                        alert("❌ Failed to approve resignation");
                                      }
                                    }}
                                    style={{ marginRight: "5px" }}
                                  >
                                    ✓ Approve
                                  </button>
                                  <button
                                    className={styles.rejectBtn}
                                    onClick={async () => {
                                      const reason = prompt("Enter rejection reason:");
                                      if (!reason) return;
                                      
                                      try {
                                        await rejectResignation(res.id, reason);
                                        alert("✅ Resignation rejected!");
                                        
                                        // Reload resignations
                                        const hrRes = await getResignationsForHRApproval();
                                        setPendingHRResignations(Array.isArray(hrRes) ? hrRes : []);
                                        
                                        const allRes = await getAllResignations();
                                        setAllResignations(Array.isArray(allRes) ? allRes : []);
                                      } catch (err) {
                                        console.error("Rejection error:", err);
                                        alert("❌ Failed to reject resignation");
                                      }
                                    }}
                                  >
                                    ✗ Reject
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}

                      {/* ===== RESIGNATION TRACKING TABLE (ADMIN ONLY) ===== */}
                      <div style={{ marginTop: "30px" }}>
                        <h4>All Resignations Tracking</h4>
                        <table className={styles.table}>
                          <thead>
                            <tr>
                              <th>Emp ID</th>
                              <th>Name</th>
                              <th>Dept</th>
                              <th>Manager</th>
                              <th>Reason</th>
                              <th>Submitted Date</th>
                              <th>Last Working Day</th>
                              <th>Status</th>
                              <th>Manager Approved By</th>
                              <th>HR Approved By</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allResignations.map((res, idx) => (
                              <tr key={idx}>
                                <td>{res.empId}</td>
                                <td>{res.empName}</td>
                                <td>{res.department}</td>
                                <td>{res.managerName}</td>
                                <td>{res.reason}</td>
                                <td>{res.resignationDate}</td>
                                <td>{res.lastWorkingDay}</td>
                                <td>
                                  <span style={{
                                    padding: "4px 8px",
                                    borderRadius: "4px",
                                    backgroundColor: res.status === "APPROVED" ? "#d4edda" : res.status === "REJECTED" ? "#f8d7da" : "#fff3cd",
                                    color: res.status === "APPROVED" ? "#155724" : res.status === "REJECTED" ? "#721c24" : "#856404"
                                  }}>
                                    {res.status}
                                  </span>
                                </td>
                                <td>{res.approvedByManager || "-"}</td>
                                <td>{res.approvedByHR || "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {/* CHECKLIST */}
                  {exitStage === "checklist" && (
                    <div>
                      <h4>Exit Clearance Checklist</h4>

                      <div className={styles.exitForm}>
                        <label>
                          <input
                            type="checkbox"
                            checked={checklist.laptop}
                            onChange={() =>
                              setChecklist({
                                ...checklist,
                                laptop: !checklist.laptop,
                              })
                            }
                          />
                          Laptop Returned
                        </label>

                        <label>
                          <input
                            type="checkbox"
                            checked={checklist.idCard}
                            onChange={() =>
                              setChecklist({
                                ...checklist,
                                idCard: !checklist.idCard,
                              })
                            }
                          />
                          ID Card Returned
                        </label>

                        <label>
                          <input
                            type="checkbox"
                            checked={checklist.documents}
                            onChange={() =>
                              setChecklist({
                                ...checklist,
                                documents: !checklist.documents,
                              })
                            }
                          />
                          Documents Submitted
                        </label>

                        <label>
                          <input
                            type="checkbox"
                            checked={checklist.knowledgeTransfer}
                            onChange={() =>
                              setChecklist({
                                ...checklist,
                                knowledgeTransfer: !checklist.knowledgeTransfer,
                              })
                            }
                          />
                          Knowledge Transfer Completed
                        </label>

                        <button
                          className={styles.submitBtn}
                          onClick={() => setExitStage("completed")}
                        >
                          Submit Clearance
                        </button>
                      </div>
                    </div>
                  )}

                  {/* COMPLETED */}
                  {exitStage === "completed" && (
                    <div className={styles.exitStatusBox}>
                      <p><strong>Status:</strong> Exit Completed</p>
                      <p>Full & Final Settlement in progress.</p>

                      <button className={styles.downloadBtn}>
                        Download Relieving Letter
                      </button>

                      <button
                        className={styles.downloadBtn}
                        style={{ marginLeft: "8px" }}
                      >
                        Download Experience Letter
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ================= SKILL MATRIX ================= */}
              {view === "skills" && (
                <div className={styles.profileSectionCard}>
                  <div className={styles.skillsHeader}>
                    <h3>🎯 Skill Matrix</h3>
                  </div>

                  {/* Add New Skill Form - Available for all roles */}
                  <div style={{ marginBottom: "20px" }}>
                    <h4>Add New Skill</h4>

                    <div className={styles.skillForm}>
                      <input
                        type="text"
                        placeholder="Skill Name (e.g., Java, React, Python)"
                        className={styles.input}
                        value={newSkill.name}
                        onChange={(e) =>
                          setNewSkill({ ...newSkill, name: e.target.value })
                        }
                      />

                      <select
                        className={styles.input}
                        value={newSkill.level}
                        onChange={(e) =>
                          setNewSkill({ ...newSkill, level: e.target.value })
                        }
                      >
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                        <option>Expert</option>
                      </select>

                     

                      <button
                        className={styles.submitBtn}
                        onClick={() => {
                          if (!newSkill.name) {
                            alert("Enter skill name");
                            return;
                          }

                          const newEntry = {
                            id: Date.now(),
                            name: newSkill.name,
                            level: newSkill.level,
                            comments: newSkill.comments || "",
                            employeeRating: 0,
                            managerRating: 0
                          };

                          const updatedSkills = [...skills, newEntry];
                          setSkills(updatedSkills);
                          localStorage.setItem("skills_" + employee.id, JSON.stringify(updatedSkills));

                          setNewSkill({
                            name: "",
                            level: "Beginner",
                            comments: ""
                          });
                        }}
                      >
                        Add Skill
                      </button>
                    </div>
                  </div>

                  {/* Skills Table */}
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Skill</th>
                        <th>Level</th>
                        <th>Comments</th>
                        <th>Employee Rating</th>
                        {(role === "MANAGER" || role === "ADMIN") && <th>Manager Rating</th>}
                      </tr>
                    </thead>

                    <tbody>
                      {(skills || []).map((skill, index) => (
                        <tr key={skill.id || index}>
                          <td>{skill.name}</td>

                          {/* LEVEL */}
                          <td>
                            <select
                              value={skill.level || "Beginner"}
                              onChange={(e) => {
                                const updated = [...skills];
                                updated[index].level = e.target.value;
                                setSkills(updated);
                                localStorage.setItem("skills_" + employee.id, JSON.stringify(updated));
                              }}
                            >
                              <option>Beginner</option>
                              <option>Intermediate</option>
                              <option>Advanced</option>
                              <option>Expert</option>
                            </select>
                          </td>

                          {/* COMMENTS */}
                          <td>
                            <textarea
                              value={skill.comments || ""}
                              placeholder="Add comments about expertise..."
                              className={styles.commentInput}
                              onChange={(e) => {
                                const updated = [...skills];
                                updated[index].comments = e.target.value;
                                setSkills(updated);
                                localStorage.setItem("skills_" + employee.id, JSON.stringify(updated));
                              }}
                            />
                          </td>

                          {/* EMPLOYEE RATING */}
                          <td>
                            {[1,2,3,4,5].map((star) => (
                              <span
                                key={star}
                                style={{
                                  color: star <= (skill.employeeRating || 0) ? "gold" : "#ccc",
                                  cursor: "pointer",
                                  fontSize: "18px"
                                }}
                                onClick={() => {
                                  const updated = [...skills];
                                  updated[index].employeeRating = star;
                                  setSkills(updated);
                                  localStorage.setItem("skills_" + employee.id, JSON.stringify(updated));
                                }}
                              >
                                ★
                              </span>
                            ))}
                          </td>

                          {/* MANAGER RATING */}
                          {(role === "MANAGER" || role === "ADMIN") && (
                            <td>
                              {[1,2,3,4,5].map((star) => (
                                <span
                                  key={star}
                                  style={{
                                    color: star <= (skill.managerRating || 0) ? "green" : "#ccc",
                                    cursor: "pointer",
                                    fontSize: "18px"
                                  }}
                                  onClick={() => {
                                    const updated = [...skills];
                                    updated[index].managerRating = star;
                                    setSkills(updated);
                                    localStorage.setItem("skills_" + employee.id, JSON.stringify(updated));
                                  }}
                                >
                                  ★
                                </span>
                              ))}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Skills Tracking Table for Managers and Admins */}
                  {(role === "MANAGER" || role === "ADMIN") && (
                    <div style={{ marginTop: "30px" }}>
                      <h4>📊 Team Skills Tracking</h4>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>Emp ID</th>
                            <th>Employee Name</th>
                            <th>Skills</th>
                            <th>Skill Level</th>
                            <th>Employee Rating</th>
                            <th>Manager Rating</th>
                            <th>Comments</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            // Get skills for team members based on role
                            const teamMembers = role === "ADMIN" ? allEmployees : 
                              allEmployees.filter(emp => 
                                // For managers, filter team members (you can customize this logic)
                                emp.department === employee.department && emp.id !== employee.id
                              );

                            const teamSkills = [];
                            teamMembers.forEach(emp => {
                              const empSkills = JSON.parse(localStorage.getItem("skills_" + emp.id) || "[]");
                              empSkills.forEach(skill => {
                                teamSkills.push({
                                  empId: emp.employeeId || emp.id,
                                  empName: emp.fullName || emp.name,
                                  ...skill
                                });
                              });
                            });

                            return teamSkills.length > 0 ? teamSkills.map((skill, index) => (
                              <tr key={index}>
                                <td>{skill.empId}</td>
                                <td>{skill.empName}</td>
                                <td>{skill.name}</td>
                                <td>{skill.level}</td>
                                <td>
                                  {[1,2,3,4,5].map((star) => (
                                    <span
                                      key={star}
                                      style={{
                                        color: star <= (skill.employeeRating || 0) ? "gold" : "#ccc",
                                        fontSize: "16px"
                                      }}
                                    >
                                      ★
                                    </span>
                                  ))}
                                </td>
                                <td>
                                  {[1,2,3,4,5].map((star) => (
                                    <span
                                      key={star}
                                      style={{
                                        color: star <= (skill.managerRating || 0) ? "green" : "#ccc",
                                        fontSize: "16px"
                                      }}
                                    >
                                      ★
                                    </span>
                                  ))}
                                </td>
                                <td>{skill.comments || "-"}</td>
                              </tr>
                            )) : (
                              <tr>
                                <td colSpan="7" style={{ textAlign: "center", color: "#666" }}>
                                  No team skills data available
                                </td>
                              </tr>
                            );
                          })()}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
        

      );
    }