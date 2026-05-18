// src/Pages/Onboarding.jsx

//import axios from "axios"; // add at top
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Onboarding.css";

import { submitOnboarding } from "../Services/api"; // adjust path
import InviteEmployee from "../Components/InviteEmployee";

export default function Onboarding() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  // PERSONAL
  const initialPersonal = {
    fullName: "",
    email: "",
    phone: "",
    address: "",
    dob: "",
    gender: "",
    bloodGroup: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
    secondaryEmergencyName: "",
    secondaryEmergencyPhone: "",
    secondaryEmergencyContactRelation: "",
    pan: "",
    aadhaar: "",
    education: "",
    bankAccountNumber: "",
    ifsc: "",
    uan: "",
    pfMemberId: "",
    esic: "",
  };

  const initialJob = {
    department: "",
    designation: "",
    joiningDate: "",
    employeeId: "",
    employmentType: "",
    workLocation: "",
    lastCTC: "",
    reasonForLeaving: "",
    reportingTo: "",
    currentEmployer: "",
    noticePeriod: "",
    appliedDept: "",
    pf: "",
    designationChanged: "",
    designationChangedDate: "",
  };

  // ✅ LOAD FROM LOCALSTORAGE OR USE INITIAL STATE
  const [personal, setPersonal] = useState(() => {
    const saved = localStorage.getItem("onboarding_personal");
    return saved ? JSON.parse(saved) : initialPersonal;
  });

  const [job, setJob] = useState(() => {
    const saved = localStorage.getItem("onboarding_job");
    return saved ? JSON.parse(saved) : initialJob;
  });

  const [experience, setExperience] = useState(() => {
    const saved = localStorage.getItem("onboarding_experience");
    return saved
      ? JSON.parse(saved)
      : [
          {
            company: "",
            designation: "",
            managerName: "",
            managerPhone: "",
            managerFeedback: "",
            teammateName: "",
            teammatePhone: "",
            teammateFeedback: "",
            startDate: "",
            endDate: "",
            hrName: "",
            hrPhone: "",
            hrEmail: "",
            hrFeedback: "",
          },
        ];
  });

  const [cibil, setCibil] = useState(() => {
    const saved = localStorage.getItem("onboarding_cibil");
    return saved ? JSON.parse(saved) : { score: "", remarks: "", reportFile: null };
  });

  const [police, setPolice] = useState(() => {
    const saved = localStorage.getItem("onboarding_police");
    return saved
      ? JSON.parse(saved)
      : {
          status: "Not Started",
          policeStation: "",
          verificationNumber: "",
          remarks: "",
          policeFile: null,
        };
  });

  const [residence, setResidence] = useState(() => {
    const saved = localStorage.getItem("onboarding_residence");
    return saved
      ? JSON.parse(saved)
      : {
          residenceAddress: "",
          residencePhoto: null,
          residencePhotoPreview: null,
          housemateName: "",
          housematePhone: "",
          visitedPersonName: "",
          visitedPersonPhone: "",
          verificationDate: "",
          verificationRemarks: "",
        };
  });

  const [references, setReferences] = useState(() => {
    const saved = localStorage.getItem("onboarding_references");
    return saved
      ? JSON.parse(saved)
      : [
          { name: "", relationship: "", phone: "", email: "" },
          { name: "", relationship: "", phone: "", email: "" },
        ];
  });

  const [docs, setDocs] = useState(() => {
    const saved = localStorage.getItem("onboarding_docs");
    return saved
      ? JSON.parse(saved)
      : {
          resume: null,
          offerLetter: null,
          experienceLetter: null,
          aadharFile: null,
          panFile: null,
          photo: null,
          passportFile: null,
          drivingLicense: null,
          paySlips: null,
          educationDocs: null,
          relievingLetter: null,
          previousExperience: null,
        };
  });

  // ✅ SAVE TO LOCALSTORAGE WHENEVER STATE CHANGES
  useEffect(() => {
    localStorage.setItem("onboarding_personal", JSON.stringify(personal));
  }, [personal]);

  useEffect(() => {
    localStorage.setItem("onboarding_job", JSON.stringify(job));
  }, [job]);

  useEffect(() => {
    localStorage.setItem("onboarding_experience", JSON.stringify(experience));
  }, [experience]);

  useEffect(() => {
    localStorage.setItem("onboarding_cibil", JSON.stringify(cibil));
  }, [cibil]);

  useEffect(() => {
    localStorage.setItem("onboarding_police", JSON.stringify(police));
  }, [police]);

  useEffect(() => {
    localStorage.setItem("onboarding_residence", JSON.stringify(residence));
  }, [residence]);

  useEffect(() => {
    localStorage.setItem("onboarding_references", JSON.stringify(references));
  }, [references]);

  useEffect(() => {
    localStorage.setItem("onboarding_docs", JSON.stringify(docs));
  }, [docs]);

  // ✅ CHECK TOKEN/LOGIN
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      navigate("/login");
    }
  }, [navigate]);

  console.log("Token:", token);

  const [openSection, setOpenSection] = useState("personal");

  const updatePersonal = (field, val) => setPersonal((p) => ({ ...p, [field]: val }));
  const updateJob = (field, val) => setJob((j) => ({ ...j, [field]: val }));
  const updateCibil = (field, val) => setCibil((c) => ({ ...c, [field]: val }));
  const updatePolice = (field, val) => setPolice((p) => ({ ...p, [field]: val }));
  const updateResidence = (field, val) => setResidence((r) => ({ ...r, [field]: val }));


  const addExperience = () =>
    setExperience((arr) => [
      ...arr,
      {
        company: "",
        designation: "",
        managerName: "",
        managerPhone: "",
        managerFeedback: "",
        teammateName: "",
        teammateFeedback: "",
        startDate: "",
        endDate: "",
        hrName: "",
        hrPhone: "",
        hrEmail: "",
      },
    ]);

  const updateExperience = (index, field, val) => {
    const copy = [...experience];
    copy[index][field] = val;
    setExperience(copy);
  };

  const removeExperience = (index) => {
    setExperience((arr) => arr.filter((_, i) => i !== index));
  };

  const updateReference = (index, field, val) => {
    const copy = [...references];
    copy[index][field] = val;
    setReferences(copy);
  };

  const handleDocFile = (key, file) => {
    setDocs((d) => ({ ...d, [key]: file || null }));
  };

  const handlePhoto = (file) => {
    if (!file) {
      setDocs((d) => ({ ...d, photo: null ,photoPreview: null}));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setDocs((d) => ({ ...d, photo:file,
                                                 photoPreview: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleResidencePhoto = (file) => {
    if (!file) {
      setResidence((r) => ({ ...r, residencePhoto: null, residencePhotoPreview: null }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      setResidence((r) => ({ ...r, residencePhoto: file, residencePhotoPreview: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleCibilReport = (file) => {
    setCibil((c) => ({ ...c, reportFile: file || null }));
  };

  const handlePoliceFile = (file) => {
    setPolice((p) => ({ ...p, policeFile: file || null }));
  };

  const validate = () => {
    if (!personal.fullName.trim()) {
      alert("Full name is required.");
      setOpenSection("personal");
      return false;
    }
    if (!job.employeeId.trim()) {
      alert("Employee ID is required.");
      setOpenSection("job");
      return false;
    }
    return true;
  };

  const clearForm = () => {
    setPersonal(initialPersonal);
    setJob(initialJob);
    setExperience([
      {
        company: "",
        designation: "",
        managerName: "",
        managerPhone: "",
        managerFeedback: "",
        teammateName: "",
        teammatePhone: "",
        teammateFeedback: "",
        startDate: "",
        endDate: "",
        hrName: "",
        hrPhone: "",
        hrEmail: "",
        hrFeedback: "",
      },
    ]);
    setCibil({ score: "", remarks: "", reportFile: null });
    setPolice({
      status: "Not Started",
      policeStation: "",
      verificationNumber: "",
      remarks: "",
      policeFile: null,
    });
    setResidence({
      residenceAddress: "",
      residencePhoto: null,
      residencePhotoPreview: null,
      housemateName: "",
      housematePhone: "",
      visitedPersonName: "",
      visitedPersonPhone: "",
      verificationDate: "",
      verificationRemarks: "",
    });
    setReferences([
      { name: "", relationship: "", phone: "", email: "" },
      { name: "", relationship: "", phone: "", email: "" },
    ]);
    setDocs({
      resume: null,
      offerLetter: null,
      experienceLetter: null,
      aadharFile: null,
      panFile: null,
      photo: null,
      passportFile: null,
      drivingLicense: null,
      paySlips: null,
      educationDocs: null,
      relievingLetter: null,
      previousExperience: null,
    });
    localStorage.removeItem("onboarding_personal");
    localStorage.removeItem("onboarding_job");
    localStorage.removeItem("onboarding_experience");
    localStorage.removeItem("onboarding_cibil");
    localStorage.removeItem("onboarding_police");
    localStorage.removeItem("onboarding_residence");
    localStorage.removeItem("onboarding_references");
    localStorage.removeItem("onboarding_docs");
    window.location.reload();
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validate()) return;
   console.log("Submitting token:", token);
  if (!token) {
  console.warn("No token, admin direct onboarding");

  // allow submission without token
}
 
  
  const payload = {
       token: token || null, // allow null 
    personal: {
       
     
        password: password, // ✅ ADD THIS

      fullName: personal.fullName,
      email: personal.email,
      phone: personal.phone,
      address: personal.address,
      dob: personal.dob,
      gender: personal.gender,
      bloodGroup: personal.bloodGroup,
      emergencyContactName: personal.emergencyContactName,
      emergencyContactPhone: personal.emergencyContactPhone,
      emergencyContactRelation: personal.emergencyContactRelation,
      secondaryEmergencyName: personal.secondaryEmergencyName,
      secondaryEmergencyPhone: personal.secondaryEmergencyPhone,
      secondaryEmergencyContactRelation: personal.secondaryEmergencyContactRelation,
      pan: personal.pan,
      aadhaar: personal.aadhaar,
      education: personal.education,
      bankAccountNumber: personal.bankAccountNumber,
      ifsc: personal.ifsc,
      uan: personal.uan,
      pfMemberId: personal.pfMemberId,
      esic: personal.esic,
    },

    job: {
      department: job.department,
      designation: job.designation,
      joiningDate: job.joiningDate,
      employeeId: job.employeeId,
      employmentType: job.employmentType,
      workLocation: job.workLocation,
      lastCTC: job.lastCTC,
      reasonForLeaving: job.reasonForLeaving,
      reportingTo: job.reportingTo,
      currentEmployer: job.currentEmployer,
      noticePeriod: job.noticePeriod,
      appliedDept: job.appliedDept,
      pf: job.pf,
      designationChanged: job.designationChanged,
      designationChangedDate: job.designationChangedDate,
    },

    experience: experience.map((ex) => ({ ...ex })),

    cibil: {
      score: cibil.score,
      remarks: cibil.remarks,
    },

    police: {
      status: police.status,
      policeStation: police.policeStation,
      verificationNumber: police.verificationNumber,
      remarks: police.remarks,
    },

    residence: {
      residenceAddress: residence.residenceAddress,
      housemateName: residence.housemateName,
      housematePhone: residence.housematePhone,
      visitedPersonName: residence.visitedPersonName,
      visitedPersonPhone: residence.visitedPersonPhone,
      verificationDate: residence.verificationDate,
      verificationRemarks: residence.verificationRemarks,
    },

    references: references,

    documents: {
      resume: docs.resume ? docs.resume.name : null,
      aadhar: docs.aadharFile ? docs.aadharFile.name : null,
      pan: docs.panFile ? docs.panFile.name : null,
    },

    submittedAt: new Date().toISOString(),
    bgvStatus: "PENDING",
  };

 try {
  // ✅ MongoDB save
 await submitOnboarding({
  ...payload, // keep everything

  // 🔥 ADD THIS FLAT STRUCTURE (IMPORTANT)
  fullName: personal.fullName,
  email: personal.email,
  phone: personal.phone,

  employeeId: job.employeeId,
  department: job.department,
  designation: job.designation,
  location: job.workLocation,

  manager: job.reportingTo,
  managerEmail: "",

  dob: personal.dob,
  doj: job.joiningDate,

  // Statutory / bank fields
  bankAccountNumber: personal.bankAccountNumber,
  ifsc: personal.ifsc,
  uan: personal.uan,
  pfMemberId: personal.pfMemberId,
  esic: personal.esic,
  pf: job.pf,
  designationChanged: job.designationChanged,
  designationChangedDate: job.designationChangedDate,

  status: "Active"
});
  localStorage.removeItem("onboarding_personal"); // ✅ ADD HERE

  // ✅ Local storage for table
  const existing = JSON.parse(localStorage.getItem("bgv_records")) || [];

  existing.push({
    _id: Date.now(),
    fullName: personal.fullName,
    email: personal.email,
    phone: personal.phone,
    employeeId: job.employeeId,
    department: job.department,
    designation: job.designation,
    joiningDate: job.joiningDate,

    experience: experience,

    cibilScore: cibil.score,
    cibilRemarks: cibil.remarks,

    policeStatus: police.status,
    policeVerificationNumber: police.verificationNumber,

    documents: {
      photo: docs.photo ? docs.photo.name : null,
      resume: docs.resume?.name,
      aadharFile: docs.aadharFile?.name,
      panFile: docs.panFile?.name,
    },

    submittedAt: new Date().toISOString(),
    bgvStatus: "Pending",
  });

  localStorage.setItem("bgv_records", JSON.stringify(existing));

  alert("Onboarding submitted successfully ✅");
  navigate("/BGV");

} catch (error) {
  console.error("FULL ERROR:", error.response || error);
}
 };
  const sectionHeader = (id, title, subtitle) => (
    <div
      className={`section-header ${openSection === id ? "open" : ""}`}
      onClick={() => setOpenSection((cur) => (cur === id ? "" : id))}
    >
      <div>
        <div className="section-title">{title}</div>
        {subtitle ? <div className="section-sub">{subtitle}</div> : null}
      </div>
      <div className="chev">{openSection === id ? "▾" : "▸"}</div>
    </div>
  );

  
  return (
    <div className="onboard-root">
       <button
  onClick={() => navigate("/employee-card")}
  style={{
    marginBottom: "10px",
    padding: "6px 12px",
    background: "#002c50",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  }}
>
  ← Back
</button>
      <h1>New Employee Onboarding</h1>
      <form className="onboard-form" onSubmit={handleSubmit}>
        {/* PERSONAL */}
        <section className="card">
          {sectionHeader("personal", "Personal Details", "Full name, contacts, emergency details")}
          {openSection === "personal" && (
            <div className="section-body">
           <div className="form-grid">

  <div className="form-group">
  <input
    placeholder=" "
    value={personal.fullName}
    onChange={(e) => updatePersonal("fullName", e.target.value)}
  />
  <label>Full Name *</label>
</div>

 <div className="form-group">
  <input
    placeholder=" "
    value={personal.email}
    onChange={(e) => updatePersonal("email", e.target.value)}
  />
  <label>Email</label>
</div>

  <div className="form-group">
    <label>Phone</label>
    <input
      value={personal.phone}
      onChange={(e) => updatePersonal("phone", e.target.value)}
    />
  </div>

  <div className="form-group">
    <label>Date of Birth</label>
    <input
      type="date"
      value={personal.dob}
      onChange={(e) => updatePersonal("dob", e.target.value)}
    />
  </div>

  <div className="form-group">
    <label>Gender</label>
    <select
      value={personal.gender}
      onChange={(e) => updatePersonal("gender", e.target.value)}
    >
      <option value="">Select</option>
      <option>Male</option>
      <option>Female</option>
      <option>Other</option>
    </select>
  </div>

 <div className="form-group">
  <label>Blood Group</label>
  <select
    value={personal.bloodGroup}
    onChange={(e) => updatePersonal("bloodGroup", e.target.value)}
  >
    <option value="">Select</option>
    <option>A+</option>
    <option>A-</option>
    <option>B+</option>
    <option>B-</option>
    <option>O+</option>
    <option>O-</option>
    <option>AB+</option>
    <option>AB-</option>
  </select>
</div>

  {/* FULL WIDTH ADDRESS */}
  <div className="form-group ">
    <label>Address</label>
    <textarea
      rows={3}
      value={personal.address}
      onChange={(e) => updatePersonal("address", e.target.value)}
    />
  </div>

  <div className="form-group">
    <label>PAN Number</label>
    <input
      value={personal.pan}
      onChange={(e) => updatePersonal("pan", e.target.value)}
    />
  </div>

  <div className="form-group">
    <label>Aadhaar Number</label>
    <input
      value={personal.aadhaar}
      onChange={(e) => updatePersonal("aadhaar", e.target.value)}
    />
  </div>

  <div className="form-group">
    <label>Highest Education</label>
    <input
      value={personal.education}
      onChange={(e) => updatePersonal("education", e.target.value)}
    />
  </div>

  <div className="form-group">
    <label>Emergency Contact Name</label>
    <input
      value={personal.emergencyContactName}
      onChange={(e) => updatePersonal("emergencyContactName", e.target.value)}
    />
  </div>

  <div className="form-group">
    <label>Emergency Contact Phone</label>
    <input
      value={personal.emergencyContactPhone}
      onChange={(e) => updatePersonal("emergencyContactPhone", e.target.value)}
    />
  </div>

  <div className="form-group">
    <label>Relationship</label>
    <input
      value={personal.emergencyContactRelation}
      onChange={(e) => updatePersonal("emergencyContactRelation", e.target.value)}
    />
  </div>

  <div className="form-group">
    <label>Secondary Emergency Name</label>
    <input
      value={personal.secondaryEmergencyName}
      onChange={(e) => updatePersonal("secondaryEmergencyName", e.target.value)}
    />
  </div>

  <div className="form-group">
    <label>Secondary Emergency Phone</label>
    <input
      value={personal.secondaryEmergencyPhone}
      onChange={(e) => updatePersonal("secondaryEmergencyPhone", e.target.value)}
    />
  </div>
   <div className="form-group">
    <label>Secondary Emergency Relationship</label>
    <input
      value={personal.secondaryEmergencyContactRelation}
      onChange={(e) => updatePersonal("secondaryEmergencyContactRelation", e.target.value)}
    />
  </div>

  {/* ── Bank & Statutory Details ── */}
  <div className="form-group" style={{ gridColumn: "1 / -1", fontWeight: 600, marginTop: 16, color: "#444", borderTop: "1px solid #ddd", paddingTop: 12 }}>
    Bank &amp; Statutory Details
  </div>

  <div className="form-group">
    <label>Bank Account Number</label>
    <input
      value={personal.bankAccountNumber}
      onChange={(e) => updatePersonal("bankAccountNumber", e.target.value)}
    />
  </div>

  <div className="form-group">
    <label>IFSC Code</label>
    <input
      value={personal.ifsc}
      onChange={(e) => updatePersonal("ifsc", e.target.value)}
    />
  </div>

  <div className="form-group">
    <label>UAN (Universal Account Number)</label>
    <input
      value={personal.uan}
      onChange={(e) => updatePersonal("uan", e.target.value)}
    />
  </div>

  <div className="form-group">
    <label>PF Member ID</label>
    <input
      value={personal.pfMemberId}
      onChange={(e) => updatePersonal("pfMemberId", e.target.value)}
    />
  </div>

  <div className="form-group">
    <label>ESIC Number</label>
    <input
      value={personal.esic}
      onChange={(e) => updatePersonal("esic", e.target.value)}
    />
  </div>

</div>
            </div>
          )}
        </section>

        {/* JOB */}
        <section className="card">
          {sectionHeader("job", "Job & Employment", "Department, designation, IDs and current employer")}
          {openSection === "job" && (
            <div className="section-body">
             <div className="form-grid">
                <div className="form-group">
  <input
    placeholder=" "
    value={job.department}
    onChange={(e) => updateJob("department", e.target.value)}
  />
  <label>Department</label>
</div>
                <div className="form-group">
  <input
    placeholder=" "
    value={job.designation}
    onChange={(e) => updateJob("designation", e.target.value)}
  />
  <label>Designation</label>
</div>
                <div className="form-group">
  <input
    placeholder=" "
    value={job.employeeId}
    onChange={(e) => updateJob("employeeId", e.target.value)}
  />
  <label>Employee ID *</label>
</div>
                <div className="form-group">
  <input
    type="date"
    placeholder=" "
    value={job.joiningDate}
    onChange={(e) => updateJob("joiningDate", e.target.value)}
  />
  <label>Joining Date</label>
</div>
               <div className="form-group">
  <select
    value={job.employmentType}
    onChange={(e) => updateJob("employmentType", e.target.value)}
  >
    <option value=""></option>
    <option>Full-Time</option>
    <option>Part-Time</option>
    <option>Contract</option>
    <option>Intern</option>
  </select>
  <label>Employment Type</label>
</div>
                <div className="form-group">
  <input
    placeholder=" "
    value={job.workLocation}
    onChange={(e) => updateJob("workLocation", e.target.value)}
  />
  <label>Work Location</label>
</div>
               
            
<div className="form-group">
  <input
    placeholder=" "
    value={job.reportingTo}
    onChange={(e) => updateJob("reportingTo", e.target.value)}
  />
  <label>Reporting Manager</label>
</div>
               <div className="form-group">
  <input
    placeholder=" "
    value={job.currentEmployer}
    onChange={(e) => updateJob("currentEmployer", e.target.value)}
  />
  <label>Current Employer</label>
</div>
               <div className="form-group">
  <input
    placeholder=" "
    value={job.noticePeriod}
    onChange={(e) => updateJob("noticePeriod", e.target.value)}
  />
  <label>Notice Period</label>
</div>

               <div className="form-group">
  <input
    placeholder=" "
    value={job.pf}
    onChange={(e) => updateJob("pf", e.target.value)}
  />
  <label>PF (Provident Fund Number)</label>
</div>

               <div className="form-group">
  <input
    placeholder=" "
    value={job.designationChanged}
    onChange={(e) => updateJob("designationChanged", e.target.value)}
  />
  <label>Designation Changed (New Designation)</label>
</div>

               <div className="form-group">
  <input
    type="date"
    placeholder=" "
    value={job.designationChangedDate}
    onChange={(e) => updateJob("designationChangedDate", e.target.value)}
  />
  <label>Designation Changed Date</label>
</div>
               
              </div>
            </div>
          )}
        </section>

        {/* EXPERIENCE */}
        <section className="card">
          {sectionHeader("experience", "Previous Experience", "Add past employment entries")}
          {openSection === "experience" && (
            <div className="section-body">
              {experience.map((exp, idx) => (
                <div className="exp-entry" key={idx}>
               <div className="form-grid">

  <div className="form-group">
    <input placeholder=" " value={exp.company} onChange={(e) => updateExperience(idx, "company", e.target.value)} />
    <label>Company</label>
  </div>

  <div className="form-group">
    <input placeholder=" " value={exp.designation} onChange={(e) => updateExperience(idx, "designation", e.target.value)} />
    <label>Designation</label>
  </div>

 <div className="form-group">
  <input
    placeholder=" "
    value={job.lastCTC}
    onChange={(e) => updateJob("lastCTC", e.target.value)}
  />
  <label>Last CTC</label>
</div>
    <div className="form-group ">
  <input
    placeholder=" "
    value={job.reasonForLeaving}
    onChange={(e) => updateJob("reasonForLeaving", e.target.value)}
  />
  <label>Reason for Leaving</label>
</div>
  <div className="form-group">
    <input placeholder=" " value={exp.managerName} onChange={(e) => updateExperience(idx, "managerName", e.target.value)} />
    <label>Manager Name</label>
  </div>

  <div className="form-group">
    <input placeholder=" " value={exp.managerPhone} onChange={(e) => updateExperience(idx, "managerPhone", e.target.value)} />
    <label>Manager Phone</label>
  </div>

  <div className="form-group full-width">
    <textarea placeholder=" " value={exp.managerFeedback} onChange={(e) => updateExperience(idx, "managerFeedback", e.target.value)} />
    <label>Manager Feedback</label>
  </div>

  <div className="form-group">
    <input placeholder=" " value={exp.teammateName} onChange={(e) => updateExperience(idx, "teammateName", e.target.value)} />
    <label>Teammate Name</label>
  </div>
 <div className="form-group">
    <input placeholder=" " value={exp.teammatePhone} onChange={(e) => updateExperience(idx, "teammatePhone", e.target.value)} />
    <label>Teammate Phone</label>
  </div>
  <div className="form-group full-width">
    <textarea placeholder=" " value={exp.teammateFeedback} onChange={(e) => updateExperience(idx, "teammateFeedback", e.target.value)} />
    <label>Teammate Feedback</label>
  </div>

  <div className="form-group">
    <input placeholder=" " value={exp.hrName} onChange={(e) => updateExperience(idx, "hrName", e.target.value)} />
    <label>HR Name</label>
  </div>

  <div className="form-group">
    <input placeholder=" " value={exp.hrPhone} onChange={(e) => updateExperience(idx, "hrPhone", e.target.value)} />
    <label>HR Phone</label>
  </div>

  <div className="form-group">
    <input placeholder=" " value={exp.hrEmail} onChange={(e) => updateExperience(idx, "hrEmail", e.target.value)} />
    <label>HR Email</label>
  </div>

 <div className="form-group ">
    <textarea placeholder=" " value={exp.hrFeedback} onChange={(e) => updateExperience(idx, "hrFeedback", e.target.value)} />
    <label>Hr Feedback</label>
  </div>
  <div className="form-group">
    <input type="date" placeholder=" " value={exp.startDate} onChange={(e) => updateExperience(idx, "startDate", e.target.value)} />
    <label>Joining Date</label>
  </div>

  <div className="form-group">
    <input type="date" placeholder=" " value={exp.endDate} onChange={(e) => updateExperience(idx, "endDate", e.target.value)} />
    <label>Exit Date</label>
  </div>

</div>

                  <div className="exp-actions">
                    <button type="button" className="secondary-btn" onClick={() => removeExperience(idx)}>Remove</button>
                  </div>
                </div>
              ))}

              <div style={{ marginTop: 8 }}>
                <button type="button" className="primary-btn" onClick={addExperience}>+ Add Experience</button>
              </div>
            </div>
          )}
        </section>

        {/* CIBIL & POLICE */}
        <section className="card">
          {sectionHeader("cibil", "CIBIL & Police Verification", "Enter credit score, police verification status")}
          {openSection === "cibil" && (
            <div className="section-body">
            <div className="form-grid">

  <div className="form-group">
    <input
      placeholder=" "
      value={cibil.score}
      onChange={(e) => updateCibil("score", e.target.value)}
    />
    <label>CIBIL Score</label>
  </div>
<div className="form-group">
  <input
    type="date"
    placeholder=" "
    value={cibil.generatedDate || ""}
    onChange={(e) => updateCibil("generatedDate", e.target.value)}
  />
  <label>CIBIL Generated Date</label>
</div>

  <div className="form-group ">
    <textarea
      placeholder=" "
      value={cibil.remarks}
      onChange={(e) => updateCibil("remarks", e.target.value)}
    />
    <label>CIBIL Remarks</label>
  </div>

 {/* 🔹 POLICE HEADER */}
<div
  style={{
    gridColumn: "1 / -1",
    fontWeight: "600",
    marginTop: "20px",
    marginBottom: "10px",
    paddingTop: "10px",
    borderTop: "1px solid #ddd",
    color: "#444"
  }}
>
  Police Verification
</div>

{/* Police Station */}
<div className="form-group">
  <input
    placeholder=" "
    value={police.policeStation}
    onChange={(e) => updatePolice("policeStation", e.target.value)}
  />
  <label>Police Station</label>
</div>

{/* Verification Number */}
<div className="form-group">
  <input
    placeholder=" "
    value={police.verificationNumber}
    onChange={(e) => updatePolice("verificationNumber", e.target.value)}
  />
  <label>Verification Number</label>
</div>

{/* Police Remarks */}
<div className="form-group ">
  <textarea
    placeholder=" "
    value={police.remarks}
    onChange={(e) => updatePolice("remarks", e.target.value)}
  />
  <label>Police Remarks</label>
</div>

<div className="file-input">
  <label>Police Document</label>
  <input
    type="file"
    onChange={(e) => handlePoliceFile(e.target.files[0])}
  />

  {police.policeFile && (
    <div className="file-name">{police.policeFile.name}</div>
  )}
</div>
  

 
    
   

  

</div>
            </div>
          )}
        </section>

        {/* RESIDENCE */}
        <section className="card">
          {sectionHeader("residence", "Residence Verification", "Address, photo, contacts")}
          {openSection === "residence" && (
            <div className="section-body">
            <div className="form-grid">

  <div className="form-group ">
    <textarea
      placeholder=" "
      value={residence.residenceAddress}
      onChange={(e) => updateResidence("residenceAddress", e.target.value)}
    />
    <label>Residence Address</label>
  </div>

  {/* FILE INPUT (no floating label) */}
  <div className="file-input">
    <label>Residence Photo</label>
    <input type="file" onChange={(e) => handleResidencePhoto(e.target.files[0])} />
    {residence.residencePhotoPreview && (
      <div className="residence-photo-preview">
        <img src={residence.residencePhotoPreview} alt="Residence" />
      </div>
    )}
  </div>

  <div className="form-group">
    <input
      placeholder=" "
      value={residence.housemateName}
      onChange={(e) => updateResidence("housemateName", e.target.value)}
    />
    <label>Residence Name</label>
  </div>

  <div className="form-group">
    <input
      placeholder=" "
      value={residence.housematePhone}
      onChange={(e) => updateResidence("housematePhone", e.target.value)}
    />
    <label>Residence Phone</label>
  </div>

  <div className="form-group">
    <input
      placeholder=" "
      value={residence.visitedPersonName}
      onChange={(e) => updateResidence("visitedPersonName", e.target.value)}
    />
    <label>Visited Person Name</label>
  </div>

  <div className="form-group">
    <input
      placeholder=" "
      value={residence.visitedPersonPhone}
      onChange={(e) => updateResidence("visitedPersonPhone", e.target.value)}
    />
    <label>Visited Person Phone</label>
  </div>

  <div className="form-group">
    <input
      type="date"
      placeholder=" "
      value={residence.verificationDate}
      onChange={(e) => updateResidence("verificationDate", e.target.value)}
    />
    <label>Visitor Verified Date</label>
  </div>

  <div className="form-group">
    <textarea
      placeholder=" "
      value={residence.verificationRemarks}
      onChange={(e) => updateResidence("verificationRemarks", e.target.value)}
    />
    <label>Verification Remarks</label>
  </div>

</div>
            </div>
          )}
        </section>

        {/* REFERENCES */}
        <section className="card">
          {sectionHeader("references", "References", "Provide two professional references")}
          {openSection === "references" && (
            <div className="section-body">
              {references.map((ref, idx) => (
                <div className="ref-entry" key={idx}>
                <div className="form-grid">

  <div className="form-group">
    <input
      placeholder=" "
      value={ref.name}
      onChange={(e) => updateReference(idx, "name", e.target.value)}
    />
    <label>Refered Name</label>
  </div>

  <div className="form-group">
  <select
    value={ref.relationship}
    onChange={(e) => updateReference(idx, "relationship", e.target.value)}
  >
    <option value=""></option>
    <option value="Family">Family</option>
    <option value="Friend">Friend</option>
    <option value="Relative">Relative</option>
    <option value="Cousin">Cousin</option>
    <option value="Job Portal">Job Portal</option>
    <option value="Other">Other</option>
  </select>
  <label>Relationship</label>
</div>

  <div className="form-group">
    <input
      placeholder=" "
      value={ref.phone}
      onChange={(e) => updateReference(idx, "phone", e.target.value)}
    />
    <label>Refered Contact</label>
  </div>

  <div className="form-group">
    <input
      placeholder=" "
      value={ref.email}
      onChange={(e) => updateReference(idx, "email", e.target.value)}
    />
    <label>Email</label>
  </div>

</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* DOCUMENTS */}
        <section className="card">
          {sectionHeader("documents", "Documents", "Upload required documents")}
          {openSection === "documents" && (
            <div className="section-body">
            <div className="form-grid">
               <div className="form-grid docs-grid">

  <div className="doc-card">
    <label>Resume</label>
    <input type="file" onChange={(e) => handleDocFile("resume", e.target.files[0])} />
    {docs.resume && <div className="file-name">{docs.resume.name}</div>}
  </div>

  <div className="doc-card">
    <label>Offer Letter</label>
    <input type="file" onChange={(e) => handleDocFile("offerLetter", e.target.files[0])} />
    {docs.offerLetter && <div className="file-name">{docs.offerLetter.name}</div>}
  </div>

  <div className="doc-card">
    <label>Experience Letter</label>
    <input type="file" onChange={(e) => handleDocFile("experienceLetter", e.target.files[0])} />
    {docs.experienceLetter && <div className="file-name">{docs.experienceLetter.name}</div>}
  </div>

  <div className="doc-card">
    <label>Aadhaar File</label>
    <input type="file" onChange={(e) => handleDocFile("aadharFile", e.target.files[0])} />
    {docs.aadharFile && <div className="file-name">{docs.aadharFile.name}</div>}
  </div>

  <div className="doc-card">
    <label>PAN File</label>
    <input type="file" onChange={(e) => handleDocFile("panFile", e.target.files[0])} />
    {docs.panFile && <div className="file-name">{docs.panFile.name}</div>}
  </div>

  <div className="doc-card photo-card">
    <label>Photo</label>
    <input type="file" onChange={(e) => handlePhoto(e.target.files[0])} />
   {docs.photoPreview && (
  <div className="photo-preview">
    <img src={docs.photoPreview} alt="Employee" />
  </div>
)}
{docs.photo && (
  <div className="file-name">{docs.photo.name}</div>
)}
    
  </div>
  <div className="doc-card">
  <label>Previous Pay Slips</label>
  <input
    type="file"
    onChange={(e) => handleDocFile("paySlips", e.target.files[0])}
  />
  {docs.paySlips && <div className="file-name">{docs.paySlips.name}</div>}
</div>

<div className="doc-card">
  <label>Education Documents</label>
  <input
    type="file"
    onChange={(e) => handleDocFile("educationDocs", e.target.files[0])}
  />
  {docs.educationDocs && <div className="file-name">{docs.educationDocs.name}</div>}
</div>

<div className="doc-card">
  <label>Previous Relieving Letter</label>
  <input
    type="file"
    onChange={(e) => handleDocFile("relievingLetter", e.target.files[0])}
  />
  {docs.relievingLetter && <div className="file-name">{docs.relievingLetter.name}</div>}
</div>

<div className="doc-card">
  <label>Previous Experience Proof</label>
  <input
    type="file"
    onChange={(e) => handleDocFile("previousExperience", e.target.files[0])}
  />
  {docs.previousExperience && <div className="file-name">{docs.previousExperience.name}</div>}
</div>

</div>
              </div>
            </div>
          )}
        </section>

        <div className="form-actions">
          <button type="submit" className="submit-btn">Submit</button>
          <button type="button" className="secondary-btn" onClick={clearForm}>Clear</button>
        </div>
      </form>
    </div>
  );
}