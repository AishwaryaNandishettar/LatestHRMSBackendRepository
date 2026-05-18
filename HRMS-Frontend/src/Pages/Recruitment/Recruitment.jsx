import "./Recruitment.css";
import PipelineTable from "./PipelineTable";
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../Context/Authcontext";
import { createJob, getAllJobs, updateJobStatus, updateJob } from "../../api/recruitmentApi"; // adjust path
import { Eye } from "lucide-react";
import OfferLetterModal from "./OfferLetterModal";
import ReleaseOfferLetterModal from "./ReleaseOfferLetterModal"; // ✅ ADDED BACK: For releasing offer letters
import {
  Briefcase,
  Users,
  CheckCircle,
  Calendar
} from "lucide-react";
import { useNavigate } from "react-router-dom";


/* ===== Reusable Components ===== */

const StatCard = ({ title, value, variant, icon, onClick }) => {
  return (
    <button className={`stat-card ${variant}`} onClick={onClick}>
      <div className="stat-left">
        <div className="stat-value">{title}</div>
        <div className="stat-title">{value}</div>
      </div>

      <div className="stat-icon">
        {icon}
      </div>
    </button>
  );
};

const StatusBadge = ({ type, children }) => (
  <span className={`badge ${type}`}>{children}</span>
);

const FilterDropdown = ({ values, onSelect, onClose }) => {
  return (
    <div className="filter-dropdown">
      {values.map((v) => (
        <div
          key={v}
          className="filter-option"
          onClick={() => {
            onSelect(v);
            onClose();
          }}
        >
          {v}
        </div>
      ))}
    </div>
  );
};

const JobTable = ({ jobs , setJobs}) => {
  const [search, setSearch] = useState("");
  
  const [openFilter, setOpenFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [viewJob, setViewJob] = useState(null);
  const [pipelineModal, setPipelineModal] = useState(null); // job being updated in pipeline
  const [pipelineForm, setPipelineForm] = useState({
    status: '', interviewLevel: '', selectionLevel: '',
    appliedDate: '', l1InterviewDate: '', l2InterviewDate: '', l3InterviewDate: '', l4InterviewDate: '',
    offerDate: '', onboardingDate: ''
  });

  // ── OFFER LETTER STATE ── ✅ ADDED BACK: For releasing offer letters in main table
  const [offerLetterJob, setOfferLetterJob] = useState(null);
 
const [showPostJob, setShowPostJob] = useState(false);
 
const [formData, setFormData] = useState({
  jobTitle: "",
  department: "",
  designation: "",
  ctc: "",
  applicants: "",
  status: "Open",
  postedDate: "",
  description: "",
  location: "",
  jobType: "",
  workMode: "",
  noticePeriod: ""
});


const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
};

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await createJob({
      ...formData,
      applicants: Number(formData.applicants)
    });

    // ✅ Update UI with saved data
     setJobs(prev => [...prev, res?.data || res]);

    setShowPostJob(false);

     setFormData({
      jobTitle: "",
      department: "",
      designation: "",
      ctc: "",
      applicants: "",
      status: "Open",
      postedDate: "",
      description: "",
      location: "",
      jobType: "",
      workMode: "",
      noticePeriod: ""
    });

  } catch (err) {
    console.error("Error saving job", err);
  }
};
 

  const uniqueTitles = [
    "All",
    ...Array.from(new Set(jobs.map(job => job.jobTitle)))
  ];

  const uniqueDates = [
    "All",
    ...Array.from(new Set(jobs.map(job => job.postedDate)))
  ];

  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      `${job.jobTitle} ${job.department} ${job.status} ${job.postedDate}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || job.status === statusFilter;

    const matchesDept =
      deptFilter === "All" || job.department === deptFilter;

    const matchesDate =
      dateFilter === "All" || job.postedDate === dateFilter;

    return matchesSearch && matchesStatus && matchesDept && matchesDate;
  });

  return (
    <div className="table-section" >
      {/* ===== Search & Filters ===== */}
      <div className="table-toolbar">

        {/* TOP ROW */}
        <div className="toolbar-top">
          <div className="search-box">
            <svg width="16" height="16" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" stroke="#64748b" strokeWidth="2" fill="none" />
              <line x1="16.65" y1="16.65" x2="22" y2="22" stroke="#64748b" strokeWidth="2" />
            </svg>
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

         <div className="sort">
            <button className="sort-btn"> ⇅ Recent ▾</button>
          </div>
        <button className="post-btn" onClick={() => setShowPostJob(true)}>
  + Post Job
</button>
        </div>

        
      </div>

      {/* ===== TABLE ===== */}
      <div className="table-wrapper">
        <table className="job-table">
          <thead>
            <tr>
              <th>Job ID</th>
              <th> 
                <div className="th-wrap">
                  <span
                    className="filter-icon"
                    onClick={() =>
                      setOpenFilter(openFilter === "title" ? null : "title")
                    }
                  >
                     Job Domain ⌵
                  </span>
                  {openFilter === "title" && (
                    <FilterDropdown
                      values={uniqueTitles}
                      onSelect={(v) => setSearch(v === "All" ? "" : v)}
                      onClose={() => setOpenFilter(null)}
                    />
                  )}
                </div>
              </th>

              <th>
                <div className="th-wrap">
                  <span
                    className="filter-icon"
                    onClick={() =>
                      setOpenFilter(openFilter === "department" ? null : "department")
                    }
                  >
                    Dept 
                  </span>

                  {openFilter === "department" && (
                    <FilterDropdown
                      values={["All", "IT", "Sales", "HR", "Marketing"]}
                      onSelect={setDeptFilter}
                      onClose={() => setOpenFilter(null)}
                    />
                  )}
                </div>
              </th>
               <th>HR Action</th>
              <th>Applicants</th>
             <th>Posted</th>
            <th>Designation</th>
              <th>CTC</th>
  <th>
                <div className="th-wrap">
                  <span
                    className="filter-icon"
                    onClick={() =>
                      setOpenFilter(openFilter === "status" ? null : "status")
                    }
                  >
                    Status ⌵
                  </span>

                  {openFilter === "status" && (
                    <FilterDropdown
                      values={[
                        "All",
                        "Open",
                        "Closed",
                        "Interview Stage",
                        "Reviewing Applications",
                      ]}
                      onSelect={setStatusFilter}
                      onClose={() => setOpenFilter(null)}
                    />
                  )}
                </div>
              </th>
              
<th>Job Description</th>
<th>Offer Letter</th> 
            </tr>
          </thead>


          <tbody>
            {filteredJobs.map((job, i) => {
              const badgeType =
                job.status === "Open" ? "open" :
                job.status === "Closed" ? "closed" :
                job.status.includes("Interview") ? "interview" :
                job.status.includes("Review") ? "review" :
                "open";

              return (
                <tr key={i}>
                 <td>
                    <span style={{
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      fontFamily: 'monospace',
                      whiteSpace: 'nowrap'
                    }}>
                      {job.jobId || `JOB-${String(i + 1).padStart(3, '0')}`}
                    </span>
                  </td>
                 <td>{job.jobTitle}</td>
                  <td>{job.department}</td>

                   {/* HR ACTION — PIPELINE DROPDOWN */}
<td>
  <select
    value={job.status}
    onChange={async (e) => {
      const newStatus = e.target.value;
      const jobId = job._id || job.id;

      // For Interview Stage or Selected — open pipeline modal for level/date input
      if (newStatus === 'Interview Stage' || newStatus === 'Selected') {
        setPipelineModal({ ...job, id: jobId });
        setPipelineForm({
          status: newStatus,
          interviewLevel: job.interviewLevel || '',
          selectionLevel: job.selectionLevel || '',
          appliedDate: job.appliedDate || '',
          l1InterviewDate: job.l1InterviewDate || '',
          l2InterviewDate: job.l2InterviewDate || '',
          l3InterviewDate: job.l3InterviewDate || '',
          l4InterviewDate: job.l4InterviewDate || '',
          offerDate: job.offerDate || '',
          onboardingDate: job.onboardingDate || ''
        });
        return; // don't save yet — wait for modal
      }

      // For other statuses — save directly
      setJobs(prev =>
        prev.map(j => (j._id || j.id) === jobId ? { ...j, status: newStatus } : j)
      );
      try {
        await updateJobStatus(jobId, newStatus);
      } catch (err) {
        console.error("Status update failed", err);
      }
    }}
  >
    <option value="Searching">Searching Profile</option>
    <option value="Open">Open</option>
    <option value="Closed">Closed</option>
    <option value="Interview Stage">Interview Stage</option>
    <option value="Shortlisted">Shortlisted</option>
    <option value="Rejected">Rejected</option>
    <option value="Selected">Selected</option>
  </select>
  {/* Show level badge below dropdown */}
  {job.status === 'Interview Stage' && job.interviewLevel && (
    <div style={{ marginTop: 4 }}>
      <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
        {job.interviewLevel === 'L1' ? 'L1 - Screening' : job.interviewLevel === 'L2' ? 'L2 - Technical' : job.interviewLevel === 'L3' ? 'L3 - Manager' : 'L4 - Executive'}
      </span>
    </div>
  )}
  {job.status === 'Selected' && job.selectionLevel && (
    <div style={{ marginTop: 4 }}>
      <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
        {job.selectionLevel}
      </span>
    </div>
  )}
</td>

                  <td>{job.applicants}</td>
                  
                   {/* Posted Date ✅ */}
      <td>{job.postedDate || "-"}</td>
                  <td>{job.designation || "-"}</td>
                <td>{job.ctc || "-"}</td>

                <td>{job.status}</td> 
                
{/* JOB DESCRIPTION */}
<td>
  <button
    className="icon-btn"
    onClick={() => setViewJob(job)}
    title="View Description"
  >
    <Eye size={18} />
  </button>
</td>

{/* ✅ ADDED BACK: Release Offer Letter button in main table */}
<td>
  {job.status === 'Selected' && (
    <button
      onClick={() => setOfferLetterJob(job)}
      style={{
        background: 'linear-gradient(135deg, #16a34a, #22c55e)',
        color: '#fff',
        padding: '8px 16px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'translateY(-2px)';
        e.target.style.boxShadow = '0 4px 12px rgba(22, 163, 74, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = '0 2px 8px rgba(22, 163, 74, 0.3)';
      }}
      title="Release Offer Letter"
    >
      📄 Release Offer Letter
    </button>
  )}
</td>

                </tr>
              );
            })}
          </tbody>

        </table>
         
        
        {/* ✅ ADDED BACK: Release Offer Letter Modal in main dashboard */}
        {offerLetterJob && (
          <ReleaseOfferLetterModal
            job={offerLetterJob}
            onClose={() => setOfferLetterJob(null)}
          />
        )}

        {viewJob && (
  <div className="modal" onClick={() => setViewJob(null)}>
    <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '560px', maxHeight: '85vh', overflowY: 'auto'}}>
      
      {/* Header */}
      <div style={{background: 'linear-gradient(135deg, #1e3a5f, #2563eb)', padding: '20px 24px', borderRadius: '8px 8px 0 0', margin: '-20px -20px 20px -20px'}}>
        <h2 style={{margin: 0, color: '#fff', fontSize: '18px'}}>{viewJob.jobTitle}</h2>
        <div style={{marginTop: 6}}>
          <span style={{background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontFamily: 'monospace', fontWeight: '600'}}>
            {viewJob.jobId || '-'}
          </span>
        </div>
      </div>

      {/* Quick Info Badges */}
      <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px'}}>
        {viewJob.location && (
          <span style={{display:'flex', alignItems:'center', gap:'4px', background:'#f0fdf4', color:'#166534', padding:'4px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:'600', border:'1px solid #bbf7d0'}}>
            📍 {viewJob.location}
          </span>
        )}
        {viewJob.jobType && (
          <span style={{display:'flex', alignItems:'center', gap:'4px', background:'#eff6ff', color:'#1d4ed8', padding:'4px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:'600', border:'1px solid #bfdbfe'}}>
            💼 {viewJob.jobType}
          </span>
        )}
        {viewJob.workMode && (
          <span style={{display:'flex', alignItems:'center', gap:'4px', background:'#fdf4ff', color:'#7e22ce', padding:'4px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:'600', border:'1px solid #e9d5ff'}}>
            🏠 {viewJob.workMode}
          </span>
        )}
        {viewJob.noticePeriod && (
          <span style={{display:'flex', alignItems:'center', gap:'4px', background:'#fff7ed', color:'#c2410c', padding:'4px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:'600', border:'1px solid #fed7aa'}}>
            ⏱️ {viewJob.noticePeriod}
          </span>
        )}
      </div>

      {/* Details Grid */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'16px'}}>
        <div style={{background:'#f8fafc', padding:'10px 14px', borderRadius:'8px', borderLeft:'3px solid #2563eb'}}>
          <div style={{fontSize:'11px', color:'#64748b', fontWeight:'600', textTransform:'uppercase', marginBottom:'4px'}}>Designation</div>
          <div style={{fontSize:'14px', fontWeight:'600', color:'#1f2937'}}>{viewJob.designation || '-'}</div>
        </div>
        <div style={{background:'#f8fafc', padding:'10px 14px', borderRadius:'8px', borderLeft:'3px solid #2563eb'}}>
          <div style={{fontSize:'11px', color:'#64748b', fontWeight:'600', textTransform:'uppercase', marginBottom:'4px'}}>Department</div>
          <div style={{fontSize:'14px', fontWeight:'600', color:'#1f2937'}}>{viewJob.department || '-'}</div>
        </div>
        <div style={{background:'#f8fafc', padding:'10px 14px', borderRadius:'8px', borderLeft:'3px solid #16a34a'}}>
          <div style={{fontSize:'11px', color:'#64748b', fontWeight:'600', textTransform:'uppercase', marginBottom:'4px'}}>CTC</div>
          <div style={{fontSize:'14px', fontWeight:'600', color:'#1f2937'}}>{viewJob.ctc || '-'}</div>
        </div>
        <div style={{background:'#f8fafc', padding:'10px 14px', borderRadius:'8px', borderLeft:'3px solid #16a34a'}}>
          <div style={{fontSize:'11px', color:'#64748b', fontWeight:'600', textTransform:'uppercase', marginBottom:'4px'}}>Experience</div>
          <div style={{fontSize:'14px', fontWeight:'600', color:'#1f2937'}}>{viewJob.experience || '-'}</div>
        </div>
      </div>

      {/* Job Description */}
      <div style={{background:'#f8fafc', padding:'14px', borderRadius:'8px', marginBottom:'16px'}}>
        <div style={{fontSize:'12px', color:'#64748b', fontWeight:'600', textTransform:'uppercase', marginBottom:'8px'}}>📋 Job Description</div>
        <p style={{margin:0, fontSize:'13px', color:'#374151', lineHeight:'1.6', whiteSpace:'pre-wrap'}}>
          {viewJob.description || 'No description available'}
        </p>
      </div>

      <button
        onClick={() => setViewJob(null)}
        style={{width:'100%', padding:'10px', background:'#2563eb', color:'#fff', border:'none', borderRadius:'8px', fontWeight:'600', cursor:'pointer', fontSize:'14px'}}
      >
        Close
      </button>
    </div>
  </div>
)}

{/* ── PIPELINE MODAL — Interview Stage / Selected ── */}
{pipelineModal && (
  <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}
    onClick={() => setPipelineModal(null)}>
    <div style={{ background:'#fff', borderRadius:12, padding:28, width:480, maxHeight:'85vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}
      onClick={e => e.stopPropagation()}>

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#1e3a5f,#2563eb)', padding:'16px 20px', borderRadius:'8px 8px 0 0', margin:'-28px -28px 20px -28px' }}>
        <h3 style={{ margin:0, color:'#fff', fontSize:16 }}>
          {pipelineForm.status === 'Interview Stage' ? '🎯 Interview Stage Details' : '✅ Selection Details'}
        </h3>
        <p style={{ margin:'4px 0 0', color:'rgba(255,255,255,0.8)', fontSize:12 }}>{pipelineModal.jobTitle} — {pipelineModal.department}</p>
      </div>

      {/* Interview Level (only for Interview Stage) */}
      {pipelineForm.status === 'Interview Stage' && (
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:13, fontWeight:600, color:'#374151', display:'block', marginBottom:6 }}>Interview Level *</label>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
           {['L1', 'L2', 'L3', 'L4'].map(level => (
              <button key={level}
                onClick={() => setPipelineForm(f => ({ ...f, interviewLevel: level }))}
                style={{
                  flex:'1 1 calc(50% - 5px)', padding:'10px', border:`2px solid ${pipelineForm.interviewLevel === level ? '#2563eb' : '#e2e8f0'}`,
                  borderRadius:8, background: pipelineForm.interviewLevel === level ? '#eff6ff' : '#fff',
                  color: pipelineForm.interviewLevel === level ? '#1d4ed8' : '#374151',
                  fontWeight:700, cursor:'pointer', fontSize:14
                }}>
                {level === 'L1' ? 'L1 - Screening' : level === 'L2' ? 'L2 - Technical' : level === 'L3' ? 'L3 - Manager' : 'L4 - Executive'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selection Level (only for Selected) */}
      {pipelineForm.status === 'Selected' && (
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:13, fontWeight:600, color:'#374151', display:'block', marginBottom:6 }}>Selection Level *</label>
          <div style={{ display:'flex', gap:10 }}>
           {['L1', 'L2'].map(level => (
              <button key={level}
                onClick={() => setPipelineForm(f => ({ ...f, selectionLevel: level }))}
                style={{
                  flex:1, padding:'10px', border:`2px solid ${pipelineForm.selectionLevel === level ? '#16a34a' : '#e2e8f0'}`,
                  borderRadius:8, background: pipelineForm.selectionLevel === level ? '#f0fdf4' : '#fff',
                  color: pipelineForm.selectionLevel === level ? '#166534' : '#374151',
                  fontWeight:700, cursor:'pointer', fontSize:14
                }}>
                {level}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Date Fields - Conditional Visibility Based on Selection */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
        
        {/* Applied Date - Always visible */}
        <div>
          <label style={{ fontSize:12, fontWeight:600, color:'#64748b', display:'block', marginBottom:4 }}>📅 Applied Date</label>
          <input type="date" style={{ width:'100%', padding:'8px', border:'1px solid #d1d5db', borderRadius:6, fontSize:13, boxSizing:'border-box' }}
            value={pipelineForm.appliedDate}
            onChange={e => setPipelineForm(f => ({ ...f, appliedDate: e.target.value }))} />
        </div>

        {/* L1 Interview Date - Show only when Interview Stage is selected AND interviewLevel includes L1 */}
        {pipelineForm.status === 'Interview Stage' && pipelineForm.interviewLevel === 'L1' && (
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'#64748b', display:'block', marginBottom:4 }}>🎯 L1 Interview Date</label>
            <input type="date" style={{ width:'100%', padding:'8px', border:'1px solid #d1d5db', borderRadius:6, fontSize:13, boxSizing:'border-box' }}
              value={pipelineForm.l1InterviewDate}
              onChange={e => setPipelineForm(f => ({ ...f, l1InterviewDate: e.target.value }))} />
          </div>
        )}

        {/* L2 Interview Date - Show only when Interview Stage is selected AND interviewLevel includes L2 */}
        {pipelineForm.status === 'Interview Stage' && pipelineForm.interviewLevel === 'L2' && (
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'#64748b', display:'block', marginBottom:4 }}>🎯 L2 Interview Date</label>
            <input type="date" style={{ width:'100%', padding:'8px', border:'1px solid #d1d5db', borderRadius:6, fontSize:13, boxSizing:'border-box' }}
              value={pipelineForm.l2InterviewDate}
              onChange={e => setPipelineForm(f => ({ ...f, l2InterviewDate: e.target.value }))} />
          </div>
        )}

        {/* L3 Interview Date - Show only when Interview Stage is selected AND interviewLevel includes L3 */}
        {pipelineForm.status === 'Interview Stage' && pipelineForm.interviewLevel === 'L3' && (
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'#64748b', display:'block', marginBottom:4 }}>🎯 L3 Interview Date</label>
            <input type="date" style={{ width:'100%', padding:'8px', border:'1px solid #d1d5db', borderRadius:6, fontSize:13, boxSizing:'border-box' }}
              value={pipelineForm.l3InterviewDate || ''}
              onChange={e => setPipelineForm(f => ({ ...f, l3InterviewDate: e.target.value }))} />
          </div>
        )}

        {/* L4 Interview Date - Show only when Interview Stage is selected AND interviewLevel includes L4 */}
        {pipelineForm.status === 'Interview Stage' && pipelineForm.interviewLevel === 'L4' && (
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'#64748b', display:'block', marginBottom:4 }}>🎯 L4 Interview Date</label>
            <input type="date" style={{ width:'100%', padding:'8px', border:'1px solid #d1d5db', borderRadius:6, fontSize:13, boxSizing:'border-box' }}
              value={pipelineForm.l4InterviewDate || ''}
              onChange={e => setPipelineForm(f => ({ ...f, l4InterviewDate: e.target.value }))} />
          </div>
        )}

        {/* Offer Stage Date - Show only when Selected status AND selectionLevel is L1 or L2 */}
        {pipelineForm.status === 'Selected' && (pipelineForm.selectionLevel === 'L1' || pipelineForm.selectionLevel === 'L2') && (
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'#64748b', display:'block', marginBottom:4 }}>📄 Offer Stage Date</label>
            <input type="date" style={{ width:'100%', padding:'8px', border:'1px solid #d1d5db', borderRadius:6, fontSize:13, boxSizing:'border-box' }}
              value={pipelineForm.offerDate}
              onChange={e => setPipelineForm(f => ({ ...f, offerDate: e.target.value }))} />
          </div>
        )}

        {/* Onboarding Date - Show only when Selected status AND selectionLevel is L1 or L2 */}
        {pipelineForm.status === 'Selected' && (pipelineForm.selectionLevel === 'L1' || pipelineForm.selectionLevel === 'L2') && (
          <div style={{ gridColumn:'1 / -1' }}>
            <label style={{ fontSize:12, fontWeight:600, color:'#64748b', display:'block', marginBottom:4 }}>🚀 Onboarding Date</label>
            <input type="date" style={{ width:'100%', padding:'8px', border:'1px solid #d1d5db', borderRadius:6, fontSize:13, boxSizing:'border-box' }}
              value={pipelineForm.onboardingDate}
              onChange={e => setPipelineForm(f => ({ ...f, onboardingDate: e.target.value }))} />
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display:'flex', gap:10 }}>
        <button onClick={() => setPipelineModal(null)}
          style={{ flex:1, padding:'10px', background:'#f1f5f9', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600, color:'#374151' }}>
          Cancel
        </button>
        
       <button
  onClick={async () => {

    // ✅ ADD THIS BLOCK HERE (VERY TOP)
    if (pipelineForm.status === 'Interview Stage' && !pipelineForm.interviewLevel) {
      alert("Please select Interview Level (L1 or L2)");
      return;
    }

    if (pipelineForm.status === 'Selected' && !pipelineForm.selectionLevel) {
      alert("Please select Selection Level");
      return;
    }

    // existing code continues
    const jobId = pipelineModal._id || pipelineModal.id;
    const updates = { ...pipelineForm };

    // Update UI immediately
    setJobs(prev => prev.map(j =>
      (j._id || j.id) === jobId ? { ...j, ...updates } : j
    ));

    try {
      await updateJob(jobId, updates);
    } catch (err) {
      console.error("Pipeline update failed", err);
    }

    setPipelineModal(null);
  }}
>
  ✓ Save Pipeline Details
</button>
      </div>
    </div>
  </div>
)}


{showPostJob && (
  <div className="modal-overlay">
    <div className="modal-content" style={{maxWidth: '520px', maxHeight: '85vh', overflowY: 'auto'}}>

      <h2>Post Job</h2>

     <form className="job-form" onSubmit={handleSubmit}>

     <input
  name="jobTitle"
  value={formData.jobTitle}
  onChange={handleChange}
  placeholder="Job Title *"
  required
/>

<input
  name="department"
  value={formData.department}
  onChange={handleChange}
  placeholder="Department *"
  required
/>

<input
  name="designation"
  value={formData.designation}
  onChange={handleChange}
  placeholder="Designation"
/>

<input
  name="ctc"
  value={formData.ctc}
  onChange={handleChange}
  placeholder="CTC (e.g. 6-8 LPA)"
/>

<input
  name="applicants"
  value={formData.applicants}
  onChange={handleChange}
  placeholder="No. of Openings"
/>

{/* Location */}
<input
  name="location"
  value={formData.location}
  onChange={handleChange}
  placeholder="📍 Location (e.g. Bangalore, Mumbai)"
/>

{/* Job Type */}
<select name="jobType" value={formData.jobType} onChange={handleChange}>
  <option value="">💼 Job Type</option>
  <option value="Full-time">Full-time</option>
  <option value="Part-time">Part-time</option>
  <option value="Contract">Contract</option>
  <option value="Temporary">Temporary</option>
  <option value="Internship">Internship</option>
  <option value="Freelance">Freelance</option>
</select>

{/* Work Mode */}
<select name="workMode" value={formData.workMode} onChange={handleChange}>
  <option value="">🏠 Work Mode</option>
  <option value="On-site">On-site</option>
  <option value="Remote">Remote (Work from Home)</option>
  <option value="Hybrid">Hybrid</option>
</select>

{/* Notice Period */}
<select name="noticePeriod" value={formData.noticePeriod} onChange={handleChange}>
  <option value="">⏱️ Notice Period</option>
  <option value="Immediate Joining">Immediate Joining</option>
  <option value="15 Days">15 Days</option>
  <option value="30 Days">30 Days</option>
  <option value="60 Days">60 Days</option>
  <option value="90 Days">90 Days</option>
</select>

<select name="status" value={formData.status} onChange={handleChange}>
  <option>Open</option>
  <option>Closed</option>
  <option>Interview Stage</option>
  <option>Reviewing Applications</option>
</select>

<input
  name="postedDate"
  value={formData.postedDate}
  onChange={handleChange}
  placeholder="Posted Date (e.g. 13/04/2026)"
/>

<textarea
  name="description"
  value={formData.description}
  onChange={handleChange}
  placeholder="Job Description — roles, responsibilities, requirements..."
  rows={4}
/>

        <div className="modal-actions">
          <button type="button" onClick={() => setShowPostJob(false)}>
            Cancel
          </button>

          <button type="submit">
            Save
          </button>
        </div>

      </form>
      
    </div>
  </div>
)}
      </div>

     
      {selectedCandidate && (
  <div className="modal-overlay">
    <div className="modal-content">

      <h2>Candidate Details</h2>

      <p><b>Name:</b> {selectedCandidate.name || "N/A"}</p>
      <p><b>Job Title:</b> {selectedCandidate.jobTitle || "N/A"}</p>
      <p><b>Department:</b> {selectedCandidate.department || "N/A"}</p>
      <p><b>Designation:</b> {selectedCandidate.designation || "N/A"}</p>
      <p><b>Status:</b> {selectedCandidate.status || "N/A"}</p>

      <hr />

      <p><b>Current Stage Meaning:</b></p>
      <p>
        {selectedCandidate.status === "Shortlisted" &&
          "Candidate has passed initial screening and is shortlisted for next round."}

        {selectedCandidate.status === "Interview Stage" &&
          "Candidate is scheduled or undergoing interview process."}

        {selectedCandidate.status === "Selected" &&
          "Candidate has been selected for offer."}

        {!selectedCandidate.status &&
          "Candidate is under review."}
      </p>

      <div className="modal-actions">
        <button onClick={() => setSelectedCandidate(null)}>
          Close
        </button>
      </div>

    </div>
  </div>
)}
    </div>
  );
};

const CandidatePipeline = ({
  appliedCount,
  shortlistedCount,
  interviewCount,
  rejectedCount,
  selectedCount,
  jobs
}) => {
  const navigate = useNavigate();
  return (
    <aside className="pipeline-card">
      <h3>Candidate Pipeline</h3>

      {/* Funnel */}
      <div className="funnel-wrapper">
        <button className="funnel-shape stage-1 blue" onClick={() => navigate("/recruitment/pipeline", { state: { stage: "Applied",jobs:jobs } })}>
          <span> Received Applications </span>
           <strong>{appliedCount}</strong>
        </button>

        <button className="funnel-shape stage-2 yellow" onClick={() => navigate("/recruitment/pipeline", { state: { stage: "Shortlisted",jobs: jobs.filter(j => j.status === "Shortlisted")} })}>
          <span> Shortlisted </span>
          <strong>{shortlistedCount}</strong>
        </button>

        <button className="funnel-shape stage-3 orange" onClick={() => navigate("/recruitment/pipeline", { state: { stage: "Interview Stage",jobs: jobs.filter(j => j.status === "Interview Stage")
 } })}>
          <span>Interview Stage </span>
          <strong>{interviewCount}</strong>
        </button>

        <button className="funnel-shape stage-4 red" onClick={() => navigate("/recruitment/pipeline", { state: { stage: "Rejected",jobs: jobs.filter(j => j.status === "Rejected") }})}>
          <span>Rejected </span>
          <strong>{rejectedCount}</strong>
        </button>

        <button className="funnel-shape stage-5 green" onClick={() => navigate("/recruitment/pipeline", { state: { stage: "Selected" ,jobs: jobs.filter(j => j.status === "Selected")
} })}>
          <span>Selected </span>
          <strong>{selectedCount}</strong>
        </button>

      </div>

      {/* Recent Candidates */}
<div className="recent">
  <h4>Recent Candidates</h4>

  {(Array.isArray(jobs) ? jobs : [])
    .slice(0, 5)
    .map((c, i) => (
      <div className="candidate" key={c._id || c.id || i}>
        <img
          src={
            c.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              c.name || c.jobTitle || "User"
            )}`
          }
          alt=""
        />

        <div>
          <strong>{c.name || c.jobTitle || "Unknown"}</strong>
          <span>{c.designation || c.department || "No Role"}</span>
        </div>

        <button
  className="action blue"
  onClick={() => setSelectedCandidate(c)}
>
  {c.status === "Interview Stage"
    ? "Interview"
    : c.status === "Selected"
    ? "Offer"
    : c.status === "Shortlisted"
    ? "Screen"
    : "Review"}
</button>
      </div>
    ))}
</div>
    </aside>
  );
};

/* ===== Hiring Analytics Block ===== */

const HiringAnalytics = ({
  jobs = [],
  appliedCount = 0,
  shortlistedCount = 0,
  interviewCount = 0,
  rejectedCount = 0,
  selectedCount = 0
}) => {
  const total = appliedCount || 1; // avoid divide by 0

// Candidate % (Pipeline based)
const appliedPct = Math.round((appliedCount / total) * 100);
const interviewPct = Math.round((interviewCount / total) * 100);
const hiredPct = Math.round((selectedCount / total) * 100);

// Department split (from table data)
const deptMap = {};

jobs.forEach(j => {
  if (!j.department) return;
  deptMap[j.department] = (deptMap[j.department] || 0) + 1;
});

const deptEntries = Object.entries(deptMap);
  return (
    <section className="hiring-analytics">
      {/* LEFT CARD */}
      <div className="analytics-card">
        <h3>Hiring Analytics</h3>

        <div className="analytics-row">
          {/* Candidates Overview */}
          <div className="donut-block">
            <h4>Candidates Overview</h4>

            <div className="donut">
              <div className="donut-center">
                <strong>{appliedPct}%</strong>
              </div>
            </div>

            <div className="legend">
             <span className="dot blue" /> Applied ({appliedPct}%)
<span className="dot orange" /> Interviewing ({interviewPct}%)
<span className="dot green" /> Hired ({hiredPct}%)
            </div>
          </div>

          {/* Hires by Department */}
          <div className="donut-block">
            <h4>Hires by Department</h4>

            <div className="donut small">
              <div className="donut-center">
             <strong>{deptEntries.length}/{jobs.length}</strong>
<small>
  {jobs.length
    ? Math.round((deptEntries.length / jobs.length) * 100)
    : 0}%
</small>
              </div>
            </div>

            <div className="legend">
              <span className="dot blue" /> IT
              <span className="dot orange" /> Sales
              <span className="dot lightblue" /> Marketing
              <span className="dot green" /> HR
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT CARD */}
      <div className="analytics-card side">
        <h3>Hiring Analytics</h3>

        <div className="side-row">
          <div>
            <h4>Candidates Overview</h4>
            <ul>
             <li><span className="dot blue" /> Applied <b>{appliedPct}%</b></li>
             <li><span className="dot orange" /> Interviewing <b>{interviewPct}%</b></li>
<li><span className="dot green" /> Hired <b>{hiredPct}%</b></li>
            </ul>
          </div>

          <div>
            <h4>Hires by Department</h4>
            <ul>
             {deptEntries.map(([dept, count], i) => (
  <li key={i}>
    <span className="dot blue" /> {dept} <b>{count}/{jobs.length}</b>
  </li>
))}
              <li><span className="dot orange" /> Sales <b>4/8</b></li>
              <li><span className="dot lightblue" /> Marketing <b>2/8</b></li>
              <li><span className="dot green" /> HR <b>1/8</b></li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ===== Main Dashboard ===== */

export default function RecruitmentDashboard() {
  const navigate = useNavigate();
const { user } = useContext(AuthContext);

if (user?.role === "EMP") {
  return null; // ❌ hides entire page for employee
}
  const [jobs, setJobs] = useState([]);
  useEffect(() => {
  const fetchJobs = async () => {
    try {
      const res = await getAllJobs();
      setJobs(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Failed to load jobs", err);
      setJobs([]);
    }
  };

  fetchJobs();
}, []);
  // 👇 ADD HERE (THIS IS THE RIGHT PLACE)
  const appliedCount = jobs.length;

  const shortlistedCount = jobs.filter(
    j => j.status === "Shortlisted"
  ).length;

  const interviewCount = jobs.filter(
    j => j.status === "Interview Stage"
  ).length;
   const rejectedCount = jobs.filter(
    j => j.status === "Rejected"
  ).length;

  const selectedCount = jobs.filter(
    j => j.status === "Selected"
  ).length;
const openJobs = jobs.filter(j => j.status === "Open");
const newApplicants = jobs.filter(j => (j.applicants ?? 0) > 0);
const filledJobsCount = jobs.filter(j =>
  ["Selected", "Shortlisted"].includes(j.status)
).length;
const interviewJobs = jobs.filter(j => j.status === "Interview Stage");
  return (
    <div className="dashboard">
      <header className="header">
        <div>
          <h1>Recruitment Dashboard</h1>
          <p>Track and manage job openings, candidate pipelines, and hiring progress.</p>
        </div>
      </header>

    <section className="stats">
      <StatCard
  title="Open Positions"
  value={openJobs.length}   // ✅ dynamic count
  variant="blue"
  icon={<Briefcase className="stat-svg" />}
  onClick={() =>
    navigate('/recruitment/ats/open-positions', {
      state: { jobs: openJobs }   // ✅ PASS DATA
    })
  }
/>

      <StatCard
  title="New Applicants"
  value={newApplicants.length}
  variant="red"
  onClick={() =>
    navigate('/recruitment/ats/new-applications', {
      state: { jobs: newApplicants }
    })
  }
/>

<StatCard
  title="Positions Filled"
  value={filledJobsCount}
  variant="green"
  onClick={() =>
    navigate('/recruitment/ats/positions-filled', {
      state: {
  jobs: jobs.filter(j =>
    ["Selected", "Shortlisted"].includes(j.status)
  ),
  title: "Positions Filled (Selected + Shortlisted)"
}

    })
  }
/>

<StatCard
  title="Interview Scheduled"
  value={interviewJobs.length}
  variant="light"
  onClick={() =>
    navigate('/recruitment/ats/interview-scheduled', {
      state: { stage: "Interview Stage" }
    })
  }
/>
    </section>


      <section className="content">
      <JobTable jobs={jobs} setJobs={setJobs} />
      <CandidatePipeline
  appliedCount={appliedCount}
  shortlistedCount={shortlistedCount}
  interviewCount={interviewCount}
  rejectedCount={rejectedCount}
  selectedCount={selectedCount}
  jobs={jobs}

/>
        <HiringAnalytics
  jobs={jobs}
  appliedCount={appliedCount}
  shortlistedCount={shortlistedCount}
  interviewCount={interviewCount}
  rejectedCount={rejectedCount}
  selectedCount={selectedCount}
/>
      </section>
    </div>
  );
}