import { useState, useEffect, useContext } from "react";
import "./Helpdesk.css";
import api from "../api/axios";
import { AuthContext } from "../Context/Authcontext";

export default function Helpdesk() {
  const { user } = useContext(AuthContext);

  const role = (user?.role || "employee").toLowerCase();
  const isAdmin = role === "admin" || role === "hr";
  const userEmail = user?.email || "";
  const userName = user?.name || user?.employeeName || userEmail;

  const [tickets, setTickets] = useState([]);
  const [resolveModal, setResolveModal] = useState(null); // ticket being resolved

  const [form, setForm] = useState({
    issue: "System Error",
    customIssue: "",
    remarks: "",
    file: null
  });

  const [filter, setFilter] = useState({
    search: "",
    issue: "",
    status: "",
    raisedBy: "",
    fromDate: "",
    toDate: ""
  });

  /* ================= FETCH ================= */
  const fetchTickets = async () => {
    try {
      // Pass role and email as query params so backend can filter
      // For managers, backend should filter to show only their team's tickets
      const params = new URLSearchParams();
      params.append('role', role.toUpperCase());
      if (role === 'manager') {
        params.append('email', userEmail);
      }
      const res = await api.get(`/api/helpdesk?${params.toString()}`);
      setTickets(Array.isArray(res.data) ? res.data.reverse() : []);
    } catch (err) {
      console.error("Fetch Error:", err);
      setTickets([]);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [user]);

  /* ================= SUBMIT ================= */
  const submit = async (e) => {
    e.preventDefault();

    if (!form.remarks.trim()) {
      alert("Please enter a description for your ticket.");
      return;
    }

    try {
      const issueValue = form.issue === "Other" ? form.customIssue : form.issue;

      // If a file is attached, convert it to base64 so it can be stored and viewed later
      let attachmentName = "-";
      let attachmentData = null;

      if (form.file) {
        attachmentName = form.file.name;
        attachmentData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result); // base64 data URL
          reader.onerror = reject;
          reader.readAsDataURL(form.file);
        });
      }

      await api.post("/api/helpdesk", {
        issue: issueValue,
        remarks: form.remarks,
        raisedBy: userEmail,
        raisedByName: userName,
        raisedByRole: role.toUpperCase(),
        attachment: attachmentName,
        attachmentData: attachmentData, // base64 string
      });

      alert("✅ Ticket Created Successfully!");
      fetchTickets();
      setForm({ issue: "System Error", customIssue: "", remarks: "", file: null });

    } catch (err) {
      console.error("Submit error:", err);
      alert("❌ Failed to create ticket. Please try again.");
    }
  };

  /* ================= RESOLVE (Admin only) ================= */
  const resolveTicket = async (ticketId) => {
    try {
      await api.put(`/api/helpdesk/${ticketId}`, {
        status: "Resolved",
        resolvedBy: userEmail
      });
      alert("✅ Ticket Resolved!");
      setResolveModal(null);
      fetchTickets();
    } catch (err) {
      console.error("Resolve error:", err);
      alert("❌ Failed to resolve ticket.");
    }
  };

  const reopenTicket = async (ticketId) => {
    try {
      await api.put(`/api/helpdesk/${ticketId}`, {
        status: "Open",
        resolvedBy: "-"
      });
      fetchTickets();
    } catch (err) {
      console.error("Reopen error:", err);
    }
  };

  /* ================= KPI ================= */
  const total = tickets.length;
  const open = tickets.filter(t => t.status === "Open").length;
  const resolved = tickets.filter(t => t.status === "Resolved").length;

  /* ================= FILTER ================= */
  const filteredTickets = tickets.filter(t => {
    const matchSearch =
      filter.search === "" ||
      Object.values(t).some(val =>
        val?.toString().toLowerCase().includes(filter.search.toLowerCase())
      );
    const matchIssue = filter.issue ? t.issue === filter.issue : true;
    const matchStatus = filter.status ? t.status === filter.status : true;
    const matchUser = filter.raisedBy
      ? (t.raisedBy?.toLowerCase().includes(filter.raisedBy.toLowerCase()) ||
         t.raisedByName?.toLowerCase().includes(filter.raisedBy.toLowerCase()))
      : true;
    const matchDate =
      (!filter.fromDate || t.date >= filter.fromDate) &&
      (!filter.toDate || t.date <= filter.toDate);
    return matchSearch && matchIssue && matchStatus && matchUser && matchDate;
  });

  const clearFilters = () => {
    setFilter({ search: "", issue: "", status: "", raisedBy: "", fromDate: "", toDate: "" });
  };

  /* ================= ROLE BADGE ================= */
  const roleBadgeColor = {
    admin: "#7c3aed", hr: "#7c3aed",
    manager: "#2563eb",
    employee: "#16a34a"
  };

  return (
    <div className="hd-container">

      {/* KPI */}
      <div className="hd-kpi-row">
        <div className="hd-kpi total">
          <h3>{total}</h3>
          <span>Total Tickets</span>
        </div>
        <div className="hd-kpi open">
          <h3>{open}</h3>
          <span>Open</span>
        </div>
        <div className="hd-kpi resolved">
          <h3>{resolved}</h3>
          <span>Resolved</span>
        </div>
      </div>

      {/* RAISE TICKET FORM - available for ALL roles */}
      <div className="hd-card">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <h3 style={{ margin: 0 }}>Raise Ticket</h3>
          <span style={{
            background: roleBadgeColor[role] || "#6b7280",
            color: "#fff", fontSize: 11, fontWeight: 700,
            padding: "2px 10px", borderRadius: 20
          }}>
            {role.toUpperCase()}
          </span>
          <span style={{ fontSize: 12, color: "#64748b", marginLeft: "auto" }}>
            Raising as: <strong>{userName}</strong> ({userEmail})
          </span>
        </div>

        <form className="hd-form" onSubmit={submit}>
          <select
            value={form.issue}
            onChange={(e) => setForm({ ...form, issue: e.target.value })}
          >
            <option>Login Issue</option>
            <option>System Error</option>
            <option>HR Query</option>
            <option>Payroll Issue</option>
            <option>Complaint</option>
            <option>Leave Issue</option>
            <option>Attendance Issue</option>
            <option>Other</option>
          </select>

          {form.issue === "Other" && (
            <input
              placeholder="Enter custom issue..."
              value={form.customIssue}
              onChange={(e) => setForm({ ...form, customIssue: e.target.value })}
              required
            />
          )}

          <textarea
            placeholder="Describe your issue in detail..."
            value={form.remarks}
            onChange={(e) => setForm({ ...form, remarks: e.target.value })}
            required
          />

          <input
            type="file"
            onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
          />

          <button className="hd-btn" type="submit">Submit Ticket</button>
        </form>
      </div>

      {/* TICKET TRACKER TABLE */}
      <div className="hd-card">
        <div className="hd-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h3 style={{ margin: 0 }}>Ticket Tracker</h3>
            {isAdmin && (
              <span style={{ fontSize: 12, color: "#64748b" }}>
                (Showing all tickets — Admin View)
              </span>
            )}
            {!isAdmin && (
              <span style={{ fontSize: 12, color: "#64748b" }}>
                (Showing your tickets only)
              </span>
            )}
          </div>

          <div className="hd-filters">
            <input
              placeholder="Search..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            />

            {isAdmin && (
              <input
                placeholder="Raised By"
                value={filter.raisedBy}
                onChange={(e) => setFilter({ ...filter, raisedBy: e.target.value })}
              />
            )}

            <select
              value={filter.issue}
              onChange={(e) => setFilter({ ...filter, issue: e.target.value })}
            >
              <option value="">All Issues</option>
              <option>Login Issue</option>
              <option>System Error</option>
              <option>HR Query</option>
              <option>Payroll Issue</option>
              <option>Complaint</option>
              <option>Leave Issue</option>
              <option>Attendance Issue</option>
            </select>

            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            >
              <option value="">All Status</option>
              <option>Open</option>
              <option>Resolved</option>
            </select>

            <input
              type="date"
              value={filter.fromDate}
              onChange={(e) => setFilter({ ...filter, fromDate: e.target.value })}
            />

            <input
              type="date"
              value={filter.toDate}
              onChange={(e) => setFilter({ ...filter, toDate: e.target.value })}
            />

            <button onClick={clearFilters} className="hd-clear">Clear</button>
          </div>
        </div>

        <div className="hd-table-wrap">
          <table className="hd-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Issue Type</th>
                <th>Raised By</th>
                {isAdmin && <th>Role</th>}
                <th>Description</th>
                <th>Attachment</th>
                <th>Resolved By</th>
                <th>Status</th>
                <th>Created Date</th>
                <th>Resolved Date</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>

            <tbody>
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 11 : 9} className="hd-empty">
                    No tickets found
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t, i) => (
                  <tr key={i}>
                    <td style={{ fontFamily: "monospace", fontSize: 12, color: "#2563eb" }}>
                      {t.id?.slice(-8)?.toUpperCase() || `TKT-${i + 1}`}
                    </td>
                    <td>{t.issue}</td>
                    <td>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{t.raisedByName || t.raisedBy}</div>
                      {t.raisedByName && t.raisedBy !== t.raisedByName && (
                        <div style={{ fontSize: 11, color: "#64748b" }}>{t.raisedBy}</div>
                      )}
                    </td>
                    {isAdmin && (
                      <td>
                        <span style={{
                          background: roleBadgeColor[t.raisedByRole?.toLowerCase()] || "#6b7280",
                          color: "#fff", fontSize: 10, fontWeight: 700,
                          padding: "2px 6px", borderRadius: 10
                        }}>
                          {t.raisedByRole || "EMPLOYEE"}
                        </span>
                      </td>
                    )}
                    <td style={{ maxWidth: 200, fontSize: 12, color: "#374151" }}>
                      {t.remarks?.length > 60 ? t.remarks.slice(0, 60) + "..." : t.remarks}
                    </td>
                    <td>{t.attachment && t.attachment !== "-" ? (
                      <span
                        style={{ color: "#2563eb", fontSize: 12, cursor: "pointer", textDecoration: "underline" }}
                        onClick={() => {
                          // Use stored base64 data if available (new tickets)
                          const src = t.attachmentData || null;
                          const ext = (t.attachment || "").split(".").pop().toLowerCase();
                          const isImage = ["png","jpg","jpeg","gif","webp","bmp","svg"].includes(ext);

                          if (!src) {
                            // Old ticket — no base64 stored, show info message
                            alert(`Attachment: ${t.attachment}\n\nThis attachment was uploaded before the preview feature was added. New attachments will be viewable as images.`);
                            return;
                          }

                          // Open in a new window as a PDF-style viewer
                          const win = window.open("", "_blank", "width=960,height=720");
                          if (isImage) {
                            win.document.write(`<!DOCTYPE html><html><head>
                              <title>${t.attachment}</title>
                              <style>
                                *{margin:0;padding:0;box-sizing:border-box}
                                body{background:#1a1a2e;display:flex;flex-direction:column;align-items:center;min-height:100vh;font-family:Arial,sans-serif}
                                .toolbar{width:100%;background:#16213e;padding:12px 20px;display:flex;align-items:center;gap:12px;box-shadow:0 2px 8px rgba(0,0,0,0.4)}
                                .toolbar h3{color:#fff;font-size:14px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
                                .btn{background:#0f3460;color:#fff;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600}
                                .btn:hover{background:#e94560}
                                .img-wrap{flex:1;display:flex;align-items:center;justify-content:center;padding:20px;width:100%}
                                img{max-width:100%;max-height:calc(100vh - 80px);object-fit:contain;border-radius:4px;box-shadow:0 4px 20px rgba(0,0,0,0.5)}
                              </style></head>
                              <body>
                                <div class="toolbar">
                                  <h3>📎 ${t.attachment}</h3>
                                  <button class="btn" onclick="const a=document.createElement('a');a.href='${src}';a.download='${t.attachment}';a.click()">⬇ Download</button>
                                  <button class="btn" onclick="window.print()">🖨 Print</button>
                                  <button class="btn" onclick="window.close()">✕ Close</button>
                                </div>
                                <div class="img-wrap"><img src="${src}" alt="${t.attachment}"/></div>
                              </body></html>`);
                          } else {
                            // For PDFs and other files, embed or download
                            win.document.write(`<!DOCTYPE html><html><head>
                              <title>${t.attachment}</title>
                              <style>body{margin:0;font-family:Arial,sans-serif;background:#f4f6f9}
                              .toolbar{background:#16213e;padding:12px 20px;display:flex;align-items:center;gap:12px}
                              .toolbar h3{color:#fff;font-size:14px;flex:1}
                              .btn{background:#0f3460;color:#fff;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:13px}
                              embed{width:100%;height:calc(100vh - 60px)}</style></head>
                              <body>
                                <div class="toolbar">
                                  <h3>📎 ${t.attachment}</h3>
                                  <button class="btn" onclick="const a=document.createElement('a');a.href='${src}';a.download='${t.attachment}';a.click()">⬇ Download</button>
                                  <button class="btn" onclick="window.close()">✕ Close</button>
                                </div>
                                <embed src="${src}" type="application/pdf"/>
                              </body></html>`);
                          }
                          win.document.close();
                        }}
                        title={`View: ${t.attachment}`}
                      >
                        📎 {t.attachment}
                      </span>
                    ) : "-"}</td>
                    <td>{t.resolvedBy !== "-" ? t.resolvedBy : "-"}</td>
                    <td>
                      <span className={`hd-badge hd-${t.status}`}>
                        {t.status}
                      </span>
                    </td>
                    <td>{t.date}</td>
                    <td>{t.resolvedDate !== "-" ? t.resolvedDate : "-"}</td>
                    {isAdmin && (
                      <td>
                        {t.status === "Open" ? (
                          <button
                            onClick={() => setResolveModal(t)}
                            style={{
                              background: "#16a34a", color: "#fff",
                              border: "none", padding: "4px 10px",
                              borderRadius: 6, fontSize: 12, cursor: "pointer"
                            }}
                          >
                            ✓ Resolve
                          </button>
                        ) : (
                          <button
                            onClick={() => reopenTicket(t.id)}
                            style={{
                              background: "#f59e0b", color: "#fff",
                              border: "none", padding: "4px 10px",
                              borderRadius: 6, fontSize: 12, cursor: "pointer"
                            }}
                          >
                            ↩ Reopen
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RESOLVE MODAL */}
      {resolveModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div style={{
            background: "#fff", borderRadius: 12, padding: 28,
            width: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.2)"
          }}>
            <h3 style={{ margin: "0 0 16px", color: "#1f2937" }}>Resolve Ticket</h3>
            <div style={{ background: "#f8fafc", borderRadius: 8, padding: 14, marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>Issue</div>
              <div style={{ fontWeight: 600, color: "#1f2937" }}>{resolveModal.issue}</div>
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 8, marginBottom: 4 }}>Raised By</div>
              <div style={{ fontWeight: 600, color: "#1f2937" }}>
                {resolveModal.raisedByName || resolveModal.raisedBy}
              </div>
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 8, marginBottom: 4 }}>Description</div>
              <div style={{ fontSize: 13, color: "#374151" }}>{resolveModal.remarks}</div>
            </div>
            <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 16px" }}>
              Mark this ticket as resolved? You will be recorded as the resolver.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => setResolveModal(null)}
                style={{
                  background: "#f1f5f9", color: "#374151",
                  border: "none", padding: "8px 16px",
                  borderRadius: 8, cursor: "pointer", fontWeight: 600
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => resolveTicket(resolveModal.id)}
                style={{
                  background: "#16a34a", color: "#fff",
                  border: "none", padding: "8px 16px",
                  borderRadius: 8, cursor: "pointer", fontWeight: 600
                }}
              >
                ✓ Mark as Resolved
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
