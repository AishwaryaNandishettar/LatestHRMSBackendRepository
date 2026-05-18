import { useState, useEffect, useContext, useRef } from "react";
import "./TaskProfessional.css";
import { AuthContext } from "../Context/Authcontext";
import { TaskContext } from "../Context/TaskContext";
import {
  createTaskApi, updateTaskApi,
  acceptTaskApi, rejectTaskApi,
  submitTaskApi, updateProgressApi,
  approveTaskApi, rejectSubmissionApi,
} from "../api/taskApi";
import { getAllEmployees } from "../api/employeeApi";
import {
  FaPlus, FaTimes, FaCheck, FaEye, FaUndo,
  FaFlag, FaUser, FaCalendarAlt, FaClock, FaDownload,
} from "react-icons/fa";

/* ── status helpers ── */
const STATUS_COLOR = {
  ASSIGNED:   "#f59e0b",
  ACCEPTED:   "#3b82f6",
  IN_PROGRESS:"#8b5cf6",
  SUBMITTED:  "#ec4899",
  COMPLETED:  "#10b981",
  REJECTED:   "#ef4444",
};
const PRIORITY_COLOR = { HIGH: "#ef4444", MEDIUM: "#f59e0b", LOW: "#10b981" };

const Badge = ({ text, color }) => (
  <span style={{
    background: color, color: "#fff", fontSize: 11,
    padding: "2px 8px", borderRadius: 20, fontWeight: 600,
  }}>{text}</span>
);

const ProgressBar = ({ value }) => (
  <div style={{ background: "#e5e7eb", borderRadius: 8, height: 8, width: "100%", overflow: "hidden" }}>
    <div style={{
      width: `${value}%`, height: "100%",
      background: value === 100 ? "#10b981" : "#3b82f6",
      transition: "width 0.3s",
    }} />
  </div>
);

export default function TaskProfessional() {
  const { user } = useContext(AuthContext);
  const { tasks, fetchTasks, setTasks } = useContext(TaskContext);

  const role = (user?.role || "employee").toLowerCase();
  const isAdmin   = role === "admin";
  const isManager = role === "manager";
  const isEmployee = role === "employee";
  const canManage = isAdmin || isManager;

  const userEmail = user?.email || "";

  /* ── state ── */
  const [loading, setLoading]         = useState(true);
  const [employees, setEmployees]     = useState([]);
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCreate, setShowCreate]   = useState(false);
  const [showDetail, setShowDetail]   = useState(false);
  const [rejectInput, setRejectInput] = useState("");
  const [rejectingId, setRejectingId] = useState(null);

  const [form, setForm] = useState({
    title: "", description: "", priority: "MEDIUM",
    assignee: "", assigneeId: "", assigneeName: "", dueDate: "",
  });

  /* ── column header filters ── */
  const [colFilters, setColFilters] = useState({
    task: "", assignee: "", empName: "", empId: "", priority: "All", assignedDate: "", dueDate: "", status: "All",
  });
  const [openColFilter, setOpenColFilter] = useState(null);
  const filterRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setOpenColFilter(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── export functions ── */
  const [showExportMenu, setShowExportMenu] = useState(false);

  const exportCSV = () => {
    const headers = ["Task", "Description", "Assigned To", "Emp ID", "Assigned By", "Priority", "Assigned Date", "Due Date", "Progress", "Status"];
    const rows = filtered.map(t => [
      `"${t.title || ''}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.assignee || '',
      t.assigneeId || '',
      t.assignedBy || '',
      t.priority || '',
      t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '',
      t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '',
      `${t.progress || 0}%`,
      t.status || '',
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tasks_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const exportExcel = () => {
    // Build HTML table for Excel
    const headers = ["Task", "Description", "Assigned To", "Emp ID", "Assigned By", "Priority", "Assigned Date", "Due Date", "Progress", "Status"];
    const rows = filtered.map(t => [
      t.title || '',
      t.description || '',
      t.assignee || '',
      t.assigneeId || '',
      t.assignedBy || '',
      t.priority || '',
      t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '',
      t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '',
      `${t.progress || 0}%`,
      t.status || '',
    ]);

    let html = `<table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>`;
    rows.forEach(r => {
      html += `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`;
    });
    html += '</tbody></table>';

    const blob = new Blob([`<html><body>${html}</body></html>`], {
      type: "application/vnd.ms-excel;charset=utf-8;"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tasks_report_${new Date().toISOString().split('T')[0]}.xls`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  /* ── load ── */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchTasks();
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    getAllEmployees()
      .then((res) => {
        // getAllEmployees() returns response.data directly — already the array
        const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
        const allEmps = Array.isArray(list) ? list : [];

        if (isManager) {
          // Manager can only assign tasks to their own team members
          const teamEmps = allEmps.filter(
            e => (e.managerEmail || "").toLowerCase() === userEmail.toLowerCase()
          );
          setEmployees(teamEmps.length > 0 ? teamEmps : allEmps);
        } else {
          setEmployees(allEmps);
        }
      })
      .catch(() => {});
  }, [isManager, userEmail]);

  /* ── role-based task list ── */
  // For employees: filter client-side to only their tasks
  // For managers: backend already returns only their team's tasks (via getTasksByManager),
  //               so trust the backend response directly — no client-side re-filtering needed
  // For admins: backend returns all tasks
  const myTasks = isEmployee
    ? tasks.filter((t) => t.assignee === userEmail)
    : tasks; // manager and admin: backend already scoped correctly

  /* ── filters ── */
  const filtered = myTasks.filter((t) => {
    const matchSearch =
      !search ||
      t.title?.toLowerCase().includes(search.toLowerCase()) ||
      t.assignee?.toLowerCase().includes(search.toLowerCase());
    const matchStatus   = statusFilter === "All"   || t.status === statusFilter;
    const matchPriority = priorityFilter === "All" || t.priority === priorityFilter;
    
    // Column filters
    const matchColTask = !colFilters.task || t.title?.toLowerCase().includes(colFilters.task.toLowerCase());
    const matchColAssignee = !colFilters.assignee || t.assignee?.toLowerCase().includes(colFilters.assignee.toLowerCase());
    const matchColEmpName = !colFilters.empName || t.assigneeName?.toLowerCase().includes(colFilters.empName.toLowerCase()) || t.assignee?.toLowerCase().includes(colFilters.empName.toLowerCase());
    const matchColEmpId = !colFilters.empId || t.assigneeId?.toLowerCase().includes(colFilters.empId.toLowerCase());
    const matchColPriority = colFilters.priority === "All" || t.priority === colFilters.priority;
    const matchColStatus = colFilters.status === "All" || t.status === colFilters.status;
    
    return matchSearch && matchStatus && matchPriority && matchColTask && matchColAssignee && matchColEmpName && matchColEmpId && matchColPriority && matchColStatus;
  });

  /* ── KPIs ── */
  const kpi = {
    total:      myTasks.length,
    assigned:   myTasks.filter((t) => t.status === "ASSIGNED").length,
    inProgress: myTasks.filter((t) => t.status === "IN_PROGRESS" || t.status === "ACCEPTED").length,
    submitted:  myTasks.filter((t) => t.status === "SUBMITTED").length,
    completed:  myTasks.filter((t) => t.status === "COMPLETED").length,
    rejected:   myTasks.filter((t) => t.status === "REJECTED").length,
  };

  /* ── actions ── */
  const refresh = async () => { await fetchTasks(); };

  const handleCreate = async () => {
    if (!form.title || !form.assignee) {
      alert("Task title and assignee are required.");
      return;
    }
    try {
      await createTaskApi({
        title: form.title,
        description: form.description,
        priority: form.priority,
        assignee: form.assignee,
        assigneeId: form.assigneeId,
        assigneeName: form.assigneeName,
        dueDate: form.dueDate || null,
        status: "ASSIGNED",
        progress: 0,
        history: [],
      });
      setForm({ title: "", description: "", priority: "MEDIUM", assignee: "", assigneeId: "", assigneeName: "", dueDate: "" });
      setShowCreate(false);
      await refresh();
    } catch { alert("Failed to create task."); }
  };

  const handleAccept = async (id) => {
    try { await acceptTaskApi(id); await refresh(); }
    catch { alert("Failed to accept task."); }
  };

  const handleReject = async (id) => {
    try {
      await rejectTaskApi(id, rejectInput);
      setRejectingId(null); setRejectInput("");
      await refresh();
    } catch { alert("Failed to reject task."); }
  };

  const handleProgress = async (id, progress) => {
    try {
      await updateProgressApi(id, progress);
      setTasks((prev) => prev.map((t) => t.id === id ? { ...t, progress } : t));
    } catch { /* silent */ }
  };

  const handleSubmit = async (id) => {
    try { await submitTaskApi(id); await refresh(); }
    catch { alert("Failed to submit task."); }
  };

  const handleApprove = async (id) => {
    try { await approveTaskApi(id); await refresh(); }
    catch { alert("Failed to approve task."); }
  };

  const handleRejectSubmission = async (id) => {
    try {
      await rejectSubmissionApi(id, rejectInput);
      setRejectingId(null); setRejectInput("");
      await refresh();
    } catch { alert("Failed to reject submission."); }
  };

  const daysLeft = (due) => {
    if (!due) return null;
    const d = Math.ceil((new Date(due) - new Date()) / 86400000);
    return d;
  };

  /* ── render ── */
  return (
    <div className="tp-container">

      {/* HEADER */}
      <div className="tp-header">
        <div>
          <h2 className="tp-title">Task Management</h2>
          <span className="tp-role-badge">{role.toUpperCase()}</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* Export button — all roles */}
          <div style={{ position: 'relative' }} ref={filterRef}>
            <button
              className="tp-btn"
              style={{ background: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => setShowExportMenu(v => !v)}
            >
              <FaDownload /> Export
            </button>
            {showExportMenu && (
              <div style={{
                position: 'absolute', top: '110%', right: 0, background: '#fff',
                border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                zIndex: 100, minWidth: 160, overflow: 'hidden',
              }}>
                <button
                  onClick={exportCSV}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: '#374151', textAlign: 'left' }}
                  onMouseEnter={e => e.target.style.background = '#f1f5f9'}
                  onMouseLeave={e => e.target.style.background = 'none'}
                >
                  📄 Download CSV
                </button>
                <button
                  onClick={exportExcel}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: '#374151', textAlign: 'left', borderTop: '1px solid #f1f5f9' }}
                  onMouseEnter={e => e.target.style.background = '#f1f5f9'}
                  onMouseLeave={e => e.target.style.background = 'none'}
                >
                  📊 Download Excel
                </button>
              </div>
            )}
          </div>
          {canManage && (
            <button className="tp-btn tp-btn-primary" onClick={() => setShowCreate(true)}>
              <FaPlus /> Create Task
            </button>
          )}
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="tp-kpi-row">
        <div className="tp-kpi tp-kpi-blue">
          <div className="tp-kpi-label">Total</div>
          <div className="tp-kpi-value">{kpi.total}</div>
        </div>
        <div className="tp-kpi tp-kpi-orange">
          <div className="tp-kpi-label">Assigned</div>
          <div className="tp-kpi-value">{kpi.assigned}</div>
        </div>
        <div className="tp-kpi tp-kpi-purple">
          <div className="tp-kpi-label">In Progress</div>
          <div className="tp-kpi-value">{kpi.inProgress}</div>
        </div>
        <div className="tp-kpi tp-kpi-pink">
          <div className="tp-kpi-label">Submitted</div>
          <div className="tp-kpi-value">{kpi.submitted}</div>
        </div>
        <div className="tp-kpi tp-kpi-green">
          <div className="tp-kpi-label">Completed</div>
          <div className="tp-kpi-value">{kpi.completed}</div>
        </div>
        <div className="tp-kpi tp-kpi-red">
          <div className="tp-kpi-label">Rejected</div>
          <div className="tp-kpi-value">{kpi.rejected}</div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="tp-toolbar">
        <input
          className="tp-search"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="tp-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All Status</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="COMPLETED">Completed</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <select className="tp-select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="All">All Priority</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="tp-table-wrap">
        {loading ? (
          <div className="tp-empty">Loading tasks...</div>
        ) : filtered.length === 0 ? (
          <div className="tp-empty">No tasks found.</div>
        ) : (
          <table className="tp-table">
            <thead>
              <tr>
                {/* ── EMP ID column — FIRST ── */}
                <th style={{ position: 'relative', minWidth: 120 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Emp ID</span>
                    <span
                      style={{ cursor: 'pointer', opacity: 0.8, fontSize: 11 }}
                      onClick={() => setOpenColFilter(openColFilter === 'empId' ? null : 'empId')}
                    >▼</span>
                  </div>
                  {openColFilter === 'empId' && (
                    <div className="tp-col-filter-popup">
                      <input
                        autoFocus
                        className="tp-col-filter-input"
                        placeholder="Filter Emp ID..."
                        value={colFilters.empId || ''}
                        onChange={e => setColFilters(f => ({ ...f, empId: e.target.value }))}
                        onClick={e => e.stopPropagation()}
                      />
                      <button className="tp-col-filter-clear" onClick={() => { setColFilters(f => ({ ...f, empId: '' })); setOpenColFilter(null); }}>Clear</button>
                    </div>
                  )}
                </th>

                {/* ── TASK column with filter ── */}
                <th style={{ position: 'relative', minWidth: 180 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Task</span>
                    <span
                      style={{ cursor: 'pointer', opacity: 0.8, fontSize: 11 }}
                      onClick={() => setOpenColFilter(openColFilter === 'task' ? null : 'task')}
                    >▼</span>
                  </div>
                  {openColFilter === 'task' && (
                    <div className="tp-col-filter-popup">
                      <input
                        autoFocus
                        className="tp-col-filter-input"
                        placeholder="Filter task..."
                        value={colFilters.task}
                        onChange={e => setColFilters(f => ({ ...f, task: e.target.value }))}
                        onClick={e => e.stopPropagation()}
                      />
                      <button className="tp-col-filter-clear" onClick={() => { setColFilters(f => ({ ...f, task: '' })); setOpenColFilter(null); }}>Clear</button>
                    </div>
                  )}
                </th>

                {/* ── ASSIGNED TO/BY column with filter ── */}
                <th style={{ position: 'relative', minWidth: 160 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{canManage ? "Assigned To" : "Assigned By"}</span>
                    <span
                      style={{ cursor: 'pointer', opacity: 0.8, fontSize: 11 }}
                      onClick={() => setOpenColFilter(openColFilter === 'assignee' ? null : 'assignee')}
                    >▼</span>
                  </div>
                  {openColFilter === 'assignee' && (
                    <div className="tp-col-filter-popup">
                      <input
                        autoFocus
                        className="tp-col-filter-input"
                        placeholder="Filter email..."
                        value={colFilters.assignee}
                        onChange={e => setColFilters(f => ({ ...f, assignee: e.target.value }))}
                        onClick={e => e.stopPropagation()}
                      />
                      <button className="tp-col-filter-clear" onClick={() => { setColFilters(f => ({ ...f, assignee: '' })); setOpenColFilter(null); }}>Clear</button>
                    </div>
                  )}
                </th>

                {/* ── PRIORITY column with filter ── */}
                <th style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Priority</span>
                    <span
                      style={{ cursor: 'pointer', opacity: 0.8, fontSize: 11 }}
                      onClick={() => setOpenColFilter(openColFilter === 'priority' ? null : 'priority')}
                    >▼</span>
                  </div>
                  {openColFilter === 'priority' && (
                    <div className="tp-col-filter-popup">
                      {['All', 'HIGH', 'MEDIUM', 'LOW'].map(v => (
                        <div
                          key={v}
                          className={`tp-col-filter-option ${colFilters.priority === v ? 'active' : ''}`}
                          onClick={() => { setColFilters(f => ({ ...f, priority: v })); setOpenColFilter(null); }}
                        >{v}</div>
                      ))}
                    </div>
                  )}
                </th>

                {/* ── ASSIGNED DATE (new) ── */}
                <th style={{ minWidth: 120 }}>Assigned Date</th>

                {/* ── DUE DATE ── */}
                <th style={{ minWidth: 120 }}>Due Date</th>

                {/* ── PROGRESS ── */}
                <th style={{ minWidth: 120 }}>Progress</th>

                {/* ── STATUS column with filter ── */}
                <th style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Status</span>
                    <span
                      style={{ cursor: 'pointer', opacity: 0.8, fontSize: 11 }}
                      onClick={() => setOpenColFilter(openColFilter === 'status' ? null : 'status')}
                    >▼</span>
                  </div>
                  {openColFilter === 'status' && (
                    <div className="tp-col-filter-popup">
                      {['All', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED', 'REJECTED'].map(v => (
                        <div
                          key={v}
                          className={`tp-col-filter-option ${colFilters.status === v ? 'active' : ''}`}
                          onClick={() => { setColFilters(f => ({ ...f, status: v })); setOpenColFilter(null); }}
                        >{v}</div>
                      ))}
                    </div>
                  )}
                </th>

                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((task) => {
                const days = daysLeft(task.dueDate);
                const overdue = days !== null && days < 0 && task.status !== "COMPLETED";
                return (
                  <tr key={task.id} className={overdue ? "tp-overdue" : ""}>
                    {/* ── EMP ID cell — FIRST ── */}
                    <td>
                      {(() => {
                        // Use stored assigneeId first, then look up from employees list by email
                        const empId = task.assigneeId ||
                          employees.find(e => (e.email || e.workEmail) === task.assignee)?.employeeId ||
                          employees.find(e => (e.email || e.workEmail) === task.assignee)?.empId ||
                          null;
                        return empId ? (
                          <span style={{
                            background: '#eff6ff', color: '#1d4ed8',
                            padding: '2px 8px', borderRadius: '4px',
                            fontSize: '12px', fontWeight: '600',
                            fontFamily: 'monospace', whiteSpace: 'nowrap'
                          }}>
                            {empId}
                          </span>
                        ) : <span style={{ color: '#94a3b8', fontSize: 12 }}>—</span>;
                      })()}
                    </td>

                    <td>
                      <div className="tp-task-name">{task.title}</div>
                      {task.description && (
                        <div className="tp-task-desc">{task.description.slice(0, 60)}{task.description.length > 60 ? "…" : ""}</div>
                      )}
                      {overdue && <span className="tp-overdue-badge">OVERDUE</span>}
                    </td>
                    <td className="tp-assignee">
                      <FaUser style={{ marginRight: 4, color: "#94a3b8" }} />
                      {canManage ? task.assignee : task.assignedBy || "—"}
                    </td>
                    <td>
                      <Badge text={task.priority || "—"} color={PRIORITY_COLOR[task.priority] || "#6b7280"} />
                    </td>

                    {/* ── ASSIGNED DATE (new column) ── */}
                    <td>
                      {task.createdAt ? (
                        <span style={{ fontSize: 12, color: '#374151' }}>
                          {new Date(task.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      ) : "—"}
                    </td>

                    <td>
                      {task.dueDate ? (
                        <span style={{ color: overdue ? "#ef4444" : "#374151", fontSize: 13 }}>
                          {new Date(task.dueDate).toLocaleDateString()}
                          {days !== null && (
                            <div style={{ fontSize: 11, color: overdue ? "#ef4444" : "#6b7280" }}>
                              {overdue ? `${Math.abs(days)}d overdue` : `${days}d left`}
                            </div>
                          )}
                        </span>
                      ) : "—"}
                    </td>
                    <td style={{ minWidth: 120 }}>
                      {isEmployee && task.assignee === userEmail &&
                       (task.status === "ACCEPTED" || task.status === "IN_PROGRESS") ? (
                        <div>
                          <input
                            type="range" min="0" max="100"
                            value={task.progress || 0}
                            onChange={(e) => handleProgress(task.id, parseInt(e.target.value))}
                            className="tp-slider"
                          />
                          <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{task.progress || 0}%</div>
                          <ProgressBar value={task.progress || 0} />
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 3 }}>{task.progress || 0}%</div>
                          <ProgressBar value={task.progress || 0} />
                        </div>
                      )}
                    </td>
                    <td>
                      <Badge text={task.status} color={STATUS_COLOR[task.status] || "#6b7280"} />
                    </td>
                    <td>
                      <div className="tp-actions">
                        <button className="tp-btn-icon tp-btn-info" title="View"
                          onClick={() => { setSelectedTask(task); setShowDetail(true); }}>
                          <FaEye />
                        </button>
                        {isEmployee && task.assignee === userEmail && task.status === "ASSIGNED" && (
                          <>
                            <button className="tp-btn-icon tp-btn-success" title="Accept"
                              onClick={() => handleAccept(task.id)}>
                              <FaCheck />
                            </button>
                            <button className="tp-btn-icon tp-btn-danger" title="Reject"
                              onClick={() => setRejectingId(task.id)}>
                              <FaTimes />
                            </button>
                          </>
                        )}
                        {isEmployee && task.assignee === userEmail &&
                         (task.status === "IN_PROGRESS" || task.status === "ACCEPTED") && (
                          <button className="tp-btn-sm tp-btn-primary" title="Submit for approval"
                            onClick={() => handleSubmit(task.id)}>
                            Submit
                          </button>
                        )}
                        {canManage && task.status === "SUBMITTED" && (
                          <>
                            <button className="tp-btn-icon tp-btn-success" title="Approve"
                              onClick={() => handleApprove(task.id)}>
                              <FaCheck />
                            </button>
                            <button className="tp-btn-icon tp-btn-danger" title="Send back"
                              onClick={() => setRejectingId(task.id)}>
                              <FaUndo />
                            </button>
                          </>
                        )}
                      </div>
                      {rejectingId === task.id && (
                        <div className="tp-reject-box">
                          <input
                            className="tp-reject-input"
                            placeholder="Reason (optional)"
                            value={rejectInput}
                            onChange={(e) => setRejectInput(e.target.value)}
                          />
                          <button className="tp-btn-sm tp-btn-danger"
                            onClick={() => canManage ? handleRejectSubmission(task.id) : handleReject(task.id)}>
                            Confirm
                          </button>
                          <button className="tp-btn-sm tp-btn-secondary"
                            onClick={() => { setRejectingId(null); setRejectInput(""); }}>
                            Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── CREATE TASK MODAL ── */}
      {showCreate && (
        <div className="tp-overlay" onClick={() => setShowCreate(false)}>
          <div className="tp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tp-modal-header">
              <h3>Create New Task</h3>
              <button className="tp-close" onClick={() => setShowCreate(false)}><FaTimes /></button>
            </div>
            <div className="tp-modal-body">
              <div className="tp-form-group">
                <label>Task Title *</label>
                <input className="tp-input" placeholder="Enter task title"
                  value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="tp-form-group">
                <label>Description</label>
                <textarea className="tp-textarea" rows={3} placeholder="Task description"
                  value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="tp-form-row">
                <div className="tp-form-group">
                  <label>Priority *</label>
                  <select className="tp-input" value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
                <div className="tp-form-group">
                  <label>Due Date</label>
                  <input type="date" className="tp-input" value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
                </div>
              </div>
              <div className="tp-form-group">
                <label>Assign To (email) *</label>
                {employees.length > 0 ? (
                  <select className="tp-input" value={form.assignee}
                    onChange={(e) => {
                      const selected = employees.find(emp => (emp.email || emp.workEmail) === e.target.value);
                      setForm({
                        ...form,
                        assignee: e.target.value,
                        assigneeId: selected?.employeeId || selected?.empId || '',
                        assigneeName: selected?.fullName || '',
                      });
                    }}>
                    <option value="">-- Select Employee --</option>
                    {employees.map((emp) => (
                      <option key={emp.id || emp.email} value={emp.email || emp.workEmail}>
                        {emp.fullName} ({emp.employeeId || emp.empId || emp.email || emp.workEmail})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input className="tp-input" placeholder="employee@company.com"
                    value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })} />
                )}
              </div>
            </div>
            <div className="tp-modal-footer">
              <button className="tp-btn tp-btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="tp-btn tp-btn-primary" onClick={handleCreate}>Create Task</button>
            </div>
          </div>
        </div>
      )}

      {/* ── DETAIL MODAL ── */}
      {showDetail && selectedTask && (
        <div className="tp-overlay" onClick={() => setShowDetail(false)}>
          <div className="tp-modal tp-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="tp-modal-header">
              <h3>{selectedTask.title}</h3>
              <button className="tp-close" onClick={() => setShowDetail(false)}><FaTimes /></button>
            </div>
            <div className="tp-modal-body">
              <div className="tp-detail-grid">
                <div className="tp-detail-item">
                  <label>Status</label>
                  <Badge text={selectedTask.status} color={STATUS_COLOR[selectedTask.status] || "#6b7280"} />
                </div>
                <div className="tp-detail-item">
                  <label>Priority</label>
                  <Badge text={selectedTask.priority} color={PRIORITY_COLOR[selectedTask.priority] || "#6b7280"} />
                </div>
                <div className="tp-detail-item">
                  <label>Assigned To</label>
                  <span>{selectedTask.assignee || "—"}</span>
                </div>
                <div className="tp-detail-item">
                  <label>Emp ID</label>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1d4ed8' }}>
                    {selectedTask.assigneeId || "—"}
                  </span>
                </div>
                <div className="tp-detail-item">
                  <label>Assigned By</label>
                  <span>{selectedTask.assignedBy || "—"}</span>
                </div>
                <div className="tp-detail-item">
                  <label>Assigned Date</label>
                  <span>{selectedTask.createdAt ? new Date(selectedTask.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : "—"}</span>
                </div>
                <div className="tp-detail-item">
                  <label>Due Date</label>
                  <span>{selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : "—"}</span>
                </div>
                <div className="tp-detail-item">
                  <label>Progress</label>
                  <span>{selectedTask.progress || 0}%</span>
                </div>
              </div>

              {selectedTask.description && (
                <div className="tp-detail-section">
                  <h4>Description</h4>
                  <p>{selectedTask.description}</p>
                </div>
              )}

              {selectedTask.remarks && (
                <div className="tp-detail-section">
                  <h4>Remarks</h4>
                  <p>{selectedTask.remarks}</p>
                </div>
              )}

              {selectedTask.rejectReason && (
                <div className="tp-detail-section tp-detail-warn">
                  <h4>Rejection Reason</h4>
                  <p>{selectedTask.rejectReason}</p>
                </div>
              )}

              {selectedTask.history && selectedTask.history.length > 0 && (
                <div className="tp-detail-section">
                  <h4>History</h4>
                  <div className="tp-timeline">
                    {selectedTask.history.map((h, i) => (
                      <div key={i} className="tp-timeline-item">
                        <div className="tp-timeline-dot" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
