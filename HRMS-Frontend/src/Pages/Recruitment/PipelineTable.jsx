import React, { useRef, useEffect, useState } from "react";
import "./PipelineTable.css";
import { useNavigate, useLocation } from "react-router-dom";
import ReleaseOfferLetterModal from "./ReleaseOfferLetterModal"; // Import the modal

const stages = [
  { key: "Applied", label: "Received Applications", count: 500, class: "blue" },
  { key: "Shortlisted", label: "Shortlisted", count: 75, class: "yellow" },
  { key: "Interview Stage", label: "Interview Stage", count: 60, class: "orange" },
  { key: "Rejected", label: "Rejected", count: 95, class: "red" },
  { key: "Selected", label: "Selected", count: 25, class: "green" },
];

export default function PipelineTable() {
  const navigate = useNavigate();
  const location = useLocation();
  const defaultStage = location.state?.stage || "Applied";

 
  const PAGE_SIZE = 20;
  const [currentPage, setCurrentPage] = useState(1);
const jobs = location.state?.jobs || [];
const initialData = location.state?.jobs || [];

  const [activeStage, setActiveStage] = useState(defaultStage);
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [showExportOptions, setShowExportOptions] = useState(false);
  
  // ── OFFER LETTER STATE ──
  const [offerLetterCandidate, setOfferLetterCandidate] = useState(null);

  const visibleColumns = candidates.length > 0
    ? Object.keys(candidates[0]).filter(
        key =>
          !["stageClass", "avatar", "recruiterImg"].includes(key)
      )
    : [];


  const menuRef = useRef(null);

  useEffect(() => {
  if (initialData.length > 0) {
    const mapped = initialData.map(c => ({
      ...c,
      stageClass:
        c.status === "Applied" ? "applied" :
        c.status === "Shortlisted" ? "shortlisted" :
        c.status === "Interview Stage" ? "interview" :
        c.status === "Rejected" ? "rejected" :
        c.status === "Selected" ? "selected" : ""
    }));

    setCandidates(mapped);
  }
}, [initialData]);
  useEffect(() => {
    if (location.state?.stage) {
      setActiveStage(location.state.stage);
    }
  }, [location.state]);

useEffect(() => {
  if (jobs.length > 0) {
    const mapped = jobs.map(j => ({
      id: j._id || j.id,
      name: j.jobTitle,
      role: j.designation,
      exp: j.experience || "-",
      status: j.status,
      recruiter: j.department,
      stage: j.status,   // IMPORTANT mapping
      avatar: "",
      recruiterImg: "",
      stageClass:
        j.status === "Applied" ? "applied" :
        j.status === "Shortlisted" ? "shortlisted" :
        j.status === "Interview Stage" ? "interview" :
        j.status === "Rejected" ? "rejected" :
        j.status === "Selected" ? "selected" : ""
    }));

    setCandidates(mapped);
    setActiveStage(location.state?.stage || "Applied");
  }
}, [jobs]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(null); // close dropdown
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 🔎 Filtering logic
  const filteredCandidates = candidates
  .filter(c => {
    const searchText = search.toLowerCase();

    return (
      (c.name ?? "").toLowerCase().includes(searchText) ||
      (c.role ?? "").toLowerCase().includes(searchText) ||
      (c.exp ?? "").toString().toLowerCase().includes(searchText) ||
      (c.status ?? "").toLowerCase().includes(searchText) ||
      (c.recruiter ?? "").toLowerCase().includes(searchText)
    );
  });
  
  const totalPages = Math.ceil(filteredCandidates.length / PAGE_SIZE);

  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
   
  const getCount = (stage) =>
    candidates.filter(c => c.stage === stage).length;

  const exportFile = (type) => {
    setShowExportOptions(false);

    if (filteredCandidates.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = Object.keys(filteredCandidates[0]).filter(
      key => !["stageClass", "avatar", "recruiterImg"].includes(key)
    );

    const rows = filteredCandidates.map(obj =>
      headers.map(key => `"${String(obj[key] ?? "").replace(/"/g, '""')}"`)
    );

    let content;
      if (type === "txt") {

        const headers = Object.keys(filteredCandidates[0]).filter(
          key => !key.toLowerCase().includes("img") && key !== "avatar"
        );

        // Column width calculation
        const colWidths = {};
        headers.forEach(h => {
          const maxLen = Math.max(
            h.length,
            ...filteredCandidates.map(row => String(row[h] ?? "").length)
          );
          colWidths[h] = maxLen + 2; // padding
        });

        const pad = (str, len) => {
          str = String(str ?? "");
          return " " + str.padEnd(len - 1, " ");
        };

        // Table border line
        const border = "+" + headers.map(h => "-".repeat(colWidths[h] + 1)).join("+") + "+";

        // Header row
        const headerRow = "|" + headers.map(h => pad(h.toUpperCase(), colWidths[h])).join("|") + "|";

        // Data rows
        const dataRows = filteredCandidates.map(row =>
          "|" + headers.map(h => pad(row[h], colWidths[h])).join("|") + "|"
        );

        content = [border, headerRow, border, ...dataRows, border].join("\n");

      } else {
        // CSV / Excel format
        content = [
          headers.join(","),
          ...rows.map(r => r.join(","))
        ].join("\n");
      }

    let blob, filename;

    if (type === "csv") {
      blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
      filename = `${activeStage}_candidates.csv`;
    }

    if (type === "txt") {
      blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
      filename = `${activeStage}_candidates.txt`;
    }

    if (type === "excel") {
      blob = new Blob([content], { type: "application/vnd.ms-excel" });
      filename = `${activeStage}_candidates.xls`;
    }

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };


  return (
    <div className="pipeline-wrapper">

      {/* HEADER */}
      <div className="top-bar">
        <button className="back-btn" onClick={() => navigate("/Recruitment")}>
          ← Back
        </button>
        <h2>{stages.find(s => s.key === activeStage)?.label}</h2>
      </div>

      {/* STAGE CARDS */}
      <div className="stats-row">
        {stages.map((s) => (
          <button
            key={s.key}
            className={`stat ${s.class} ${activeStage === s.key ? "active-stat" : ""}`}
            onClick={() => {
              setActiveStage(s.key);
              setCurrentPage(1);
            }}
          >
            <span>{s.label}</span>
            <strong>
                {s.key === "Applied"
                  ? candidates.length
                  : getCount(s.key)}
            </strong>
          </button>
        ))}
      </div>

      {/* SEARCH */}
      <div className="table-controls">
        <input
          type="text"
          placeholder="Search candidates"
          value={search}
          onChange={(e) => {setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
        <button className="export-btn" onClick={() => setShowExportOptions(true)}>
          ⬇ Export
        </button>
      </div>

      {showExportOptions && (
        <div className="export-modal-overlay" onClick={() => setShowExportOptions(false)}>
          <div className="export-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Export Format</h3>
            <button onClick={() => exportFile("csv")}>CSV</button>
            <button onClick={() => exportFile("excel")}>Excel</button>
            <button onClick={() => exportFile("txt")}>Notepad (TXT)</button>
            <button className="cancel-btn" onClick={() => setShowExportOptions(false)}>Cancel</button>
          </div>
        </div>
      )}


      {/* TABLE */}
      <div className="table-container">
        <table className="recruitment-table">

          <thead>
            <tr>
              {visibleColumns.map(key => (
                <th key={key}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </th>
              ))}
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredCandidates.length === 0 && (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", padding: "20px" }}>
                  No candidates in this stage
                </td>
              </tr>
            )}

            {paginatedCandidates.map((c) => (
              <tr key={c.id}>
                {visibleColumns.map(key => (
                  <td key={key}>
                    {key === "name" ? (
                      <div className="candidate-cell">
                       <img
  src={c.avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(c.name || "User")}
  alt="profile"
  onError={(e) => {
    e.target.src =
      "https://ui-avatars.com/api/?name=" + encodeURIComponent(c.name || "User");
  }}
/>
                        {c.name}
                      </div>
                    ) : key === "recruiter" ? (
                      <div className="recruiter-cell">
                      
                        {c.recruiter}
                      </div>
                    ) : key === "stage" ? (
                    
                      <span className={`pipeline-badge ${c.stageClass}`}>{c.stage}</span>

                    ) : (
                      c[key]
                    )}
                  </td>
                ))}

                <td className="action-cell">
                  <button
                    className="action-btn"
                   onClick={(e) => {
  e.stopPropagation();
  setOpenMenu(prev => (prev === c.id ? null : c.id));
}}
                  >
                    ⋯
                  </button>

                  {openMenu === c.id && (
                   <div
  className="action-menu"
  ref={menuRef}
  onClick={(e) => e.stopPropagation()}
>
                      <div onClick={() =>
                        navigate(`/recruitment/candidate/${c.id}`, { state: { candidate: c } })
                      }>
                        View Profile
                      </div>
                      
                      {/* Show Release Offer Letter only for Selected candidates */}
                      {c.stage === 'Selected' && (
                        <div 
                          onClick={() => {
                            setOfferLetterCandidate(c);
                            setOpenMenu(null);
                          }}
                          style={{ 
                            color: '#16a34a', 
                            fontWeight: 600,
                            borderTop: '1px solid #e5e7eb',
                            paddingTop: '8px',
                            marginTop: '4px'
                          }}
                        >
                          📄 Release Offer Letter
                        </div>
                      )}
                      
                      <div>Move to Next Stage</div>
                      <div>Schedule Interview</div>
                      <div>Reject Candidate</div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Prev
          </button>

          <span>
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* ── RELEASE OFFER LETTER MODAL ── */}
      {offerLetterCandidate && (
        <ReleaseOfferLetterModal
          job={offerLetterCandidate}
          onClose={() => setOfferLetterCandidate(null)}
        />
      )}

    </div>
  );
}
