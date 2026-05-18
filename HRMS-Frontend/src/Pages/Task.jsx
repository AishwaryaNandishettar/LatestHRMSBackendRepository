import { useState, useEffect, useContext } from "react";
import "./Task.css";
import { TaskContext } from "../Context/TaskContext";
import { AuthContext } from "../Context/Authcontext";
import { getAllEmployees } from "../api/employeeApi";
import {
  acceptTaskApi, rejectTaskApi,
  submitTaskApi, updateProgressApi,
  approveTaskApi, rejectSubmissionApi,
} from "../api/taskApi";

/* ── status badge colours ── */
const STATUS_STYLE = {
  ASSIGNED:    { bg: "#e0f2fe", color: "#0284c7" },
  ACCEPTED:    { bg: "#dbeafe", color: "#1d4ed8" },
  IN_PROGRESS: { bg: "#fef3c7", color: "#d97706" },
  SUBMITTED:   { bg: "#fce7f3", color: "#be185d" },
  COMPLETED:   { bg: "#dcfce7", color: "#16a34a" },
  REJECTED:    { bg: "#fee2e2", color: "#dc2626" },
};

const PRIORITY_COLOR = { HIGH: "#ef4444", MEDIUM: "#f59e0b", LOW: "#22c55e" };

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLE[status] || { bg: "#f1f5f9", color: "#64748b" };
  return (
    <span style={{
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 700,
      padding: "3px 10px", borderRadius: 20,
    }}>
      {status}
    </span>
  );
};

export default function TaskModule() {
  const { user } = useContext(AuthContext);
  const { tasks, fetchTasks, addTask, updateTask } = useContext(TaskContext);

  const role = (user?.role || "employee").toLowerCase();
  const isAdmin    = role === "admin";
  const isManager  = role === "manager";
  const isEmployee = role === "employee";
  const canManage  = isAdmin || isManager;
  const userEmail  = user?.email || "";

  /* ── state ── */
  const [employees, setEmployees]   = useState([]);
  const [selected, setSelected]     = useState(null);
  const [loading, setLoading]       = useState(true);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [form, setForm] = useState({
    title: "", assignee: "", priority: "MEDIUM", dueDate: "", description: "",
  });

  /* ── load tasks on mount ── */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchTasks();
      setLoading(false);
    };
    load();
  }, []);

  /* ── load employees for assignee dropdown ── */
  useEffect(() => {
    if (!canManage) return;
    getAllEmployees()
      .then((res) => {
        // getAllEmployees() returns response.data directly — already the array
        const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
        const allEmps = Array.isArray(list) ? list : [];

        if (isManager) {
          // Manager can only assign tasks to their own team members
          const managerEmail = userEmail;
          const teamEmps = allEmps.filter(
            e => (e.managerEmail || "").toLowerCase() === managerEmail.toLowerCase()
          );
          setEmployees(teamEmps.length > 0 ? teamEmps : allEmps);
        } else {
          setEmployees(allEmps);
        }
      })
      .catch(() => {});
  }, [canManage, userEmail]);

  /* ── keep selected in sync after refresh ── */
  useEffect(() => {
    if (selected) {
      const updated = tasks.find((t) => t.id === selected.id);
      if (updated) setSelected(updated);
    }
  }, [tasks]);

  /* ── role-filtered task list ── */
  // For employees: filter client-side to only their tasks
  // For managers: backend already returns only their team's tasks (via getTasksByManager),
  //               so trust the backend response directly — no client-side re-filtering needed
  // For admins: backend returns all tasks
  const myTasks = isEmployee
    ? tasks.filter((t) => t.assignee === userEmail)
    : tasks; // manager and admin: backend already scoped correctly

  /* ── KPIs ── */
  const kpi = {
    total:      myTasks.length,
    pending:    myTasks.filter((t) => t.status === "NEW").length,
    inProgress: myTasks.filter((t) => t.status === "IN_PROGRESS" || t.status === "ACCEPTED").length,
    completed:  myTasks.filter((t) => t.status === "COMPLETED").length,
  };

  /* ── create task ── */
  const handleCreate = async () => {
    if (!form.title.trim() || !form.assignee.trim()) {
      alert("Task title and assignee are required.");
      return;
    }
    try {
      await addTask({
        title: form.title,
        description: form.description,
        assignee: form.assignee,
        priority: form.priority,
        dueDate: form.dueDate || null,
        status: "ASSIGNED",
        progress: 0,
        history: [],
      });
      setForm({ title: "", assignee: "", priority: "MEDIUM", dueDate: "", description: "" });
      await fetchTasks();
    } catch {
      alert("Failed to create task. Please try again.");
    }
  };

  /* ── employee actions ── */
  const handleAccept = async (id) => {
    try { await acceptTaskApi(id); await fetchTasks(); }
    catch { alert("Failed to accept task."); }
  };

  const handleReject = async (id) => {
    try {
      await rejectTaskApi(id, rejectReason);
      setShowRejectBox(false); setRejectReason("");
      await fetchTasks();
    } catch { alert("Failed to reject task."); }
  };

  const handleProgress = async (id, progress) => {
    try {
      await updateProgressApi(id, progress);
      updateTask(id, { progress });
    } catch { /* silent */ }
  };

  const handleSubmit = async (id) => {
    try { await submitTaskApi(id); await fetchTasks(); }
    catch { alert("Failed to submit task."); }
  };

  /* ── manager/admin actions ── */
  const handleApprove = async (id) => {
    try { await approveTaskApi(id); await fetchTasks(); }
    catch { alert("Failed to approve."); }
  };

  const handleRejectSubmission = async (id) => {
    try {
      await rejectSubmissionApi(id, rejectReason);
      setShowRejectBox(false); setRejectReason("");
      await fetchTasks();
    } catch { alert("Failed to reject submission."); }
  };

  /* ── delete task (admin only) ── */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await updateTask(id, { status: "DELETED" });
      setSelected(null);
      await fetchTasks();
    } catch { alert("Failed to delete task."); }
  };

  /* ── render ── */
  return (
    <div className="task-container">
      <h2>Task Management</h2>

      {/* ── KPI ROW ── */}
      <div className="kpi-row">
        <div className="kpi total">
          <h4>Total</h4>
          <p>{kpi.total}</p>
        </div>
        <div className="kpi pending">
          <h4>Pending</h4>
          <p>{kpi.pending}</p>
        </div>
        <div className="kpi progress">
          <h4>In Progress</h4>
          <p>{kpi.inProgress}</p>
        </div>
        <div className="kpi completed">
          <h4>Completed</h4>
          <p>{kpi.completed}</p>
        </div>
      </div>

      {/* ── TRACKING TABLE (admin/manager only) ── */}
      {canManage && (
        <div className="tracking-table-container">
          <h3>Task Tracking Overview</h3>
          <div className="tracking-table-scroll">
            <table className="tracking-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Assigned To</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", color: "#94a3b8", padding: "20px" }}>
                      Loading tasks...
                    </td>
                  </tr>
                ) : myTasks.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", color: "#94a3b8", padding: "20px" }}>
                      No tasks assigned yet
                    </td>
                  </tr>
                ) : (
                  myTasks.map((task) => (
                    <tr key={task.id}>
                      <td>
                        <div className="task-title-cell">
                          <strong>{task.title}</strong>
                          {task.description && (
                            <span className="task-desc-preview">{task.description}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="assignee-cell">
                          <span className="assignee-email">{task.assignee}</span>
                        </div>
                      </td>
                      <td>
                        <span
                          className="priority-badge"
                          style={{
                            background: PRIORITY_COLOR[task.priority] || "#94a3b8",
                            color: "#fff",
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontSize: "11px",
                            fontWeight: "700",
                          }}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td>
                        <span className="due-date-cell">
                          {task.dueDate
                            ? new Date(task.dueDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "—"}
                        </span>
                      </td>
                      <td>
                        <div className="progress-cell">
                          <div className="mini-progress-bar">
                            <div
                              className="mini-progress-fill"
                              style={{ width: `${task.progress || 0}%` }}
                            />
                          </div>
                          <span className="progress-text">{task.progress || 0}%</span>
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={task.status} />
                      </td>
                      <td>
                        <button
                          className="view-btn"
                          onClick={() => {
                            setSelected(task);
                            setShowRejectBox(false);
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── CREATE FORM (manager / admin only) ── */}
      {canManage && (
        <div className="form-box">
          <h3>Create Task</h3>

          <input
            className="task-input"
            placeholder="Task Title *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <input
            className="task-input"
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          {/* Assignee — dropdown if employees loaded, else free text */}
          {employees.length > 0 ? (
            <select
              className="task-input"
              value={form.assignee}
              onChange={(e) => setForm({ ...form, assignee: e.target.value })}
            >
              <option value="">-- Assign To (employee) *</option>
              {employees.map((emp) => (
                <option
                  key={emp.id || emp.email}
                  value={emp.email || emp.workEmail || ""}
                >
                  {emp.fullName} ({emp.email || emp.workEmail})
                </option>
              ))}
            </select>
          ) : (
            <input
              className="task-input"
              placeholder="Assign To (employee email) *"
              value={form.assignee}
              onChange={(e) => setForm({ ...form, assignee: e.target.value })}
            />
          )}

          <select
            className="task-input"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
          >
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <input
            type="date"
            className="task-input"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />

          <button className="assign-btn" onClick={handleCreate}>
            Assign Task
          </button>
        </div>
      )}

      {/* ── MAIN LAYOUT: list + detail ── */}
      <div className="layout">

        {/* LEFT — task list */}
        <div className="task-list">
          <h3>Tasks</h3>

          {loading && <p className="task-empty">Loading…</p>}
          {!loading && myTasks.length === 0 && (
            <p className="task-empty">No tasks yet.</p>
          )}

          {myTasks.map((t) => (
            <div
              key={t.id}
              className={`task-item ${selected?.id === t.id ? "active" : ""}`}
              onClick={() => { setSelected(t); setShowRejectBox(false); }}
            >
              <div className="task-item-top">
                <h4>{t.title}</h4>
                {isAdmin && (
                  <button
                    className="delete-btn"
                    title="Delete"
                    onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }}
                  >
                    🗑
                  </button>
                )}
              </div>
              <p className="task-item-sub">
                {canManage ? `→ ${t.assignee}` : `by ${t.assignedBy || "Manager"}`}
              </p>
              <StatusBadge status={t.status} />
            </div>
          ))}
        </div>

        {/* RIGHT — task detail */}
        {selected ? (
          <div className="task-detail">
            <h2>{selected.title}</h2>

            {selected.description && (
              <p style={{ color: "#64748b", marginBottom: 12 }}>{selected.description}</p>
            )}

            <div className="detail-grid">
              <div>
                <span className="detail-label">Assigned To</span>
                <span className="detail-value">{selected.assignee || "—"}</span>
              </div>
              <div>
                <span className="detail-label">Assigned By</span>
                <span className="detail-value">{selected.assignedBy || "—"}</span>
              </div>
              <div>
                <span className="detail-label">Priority</span>
                <span
                  className="detail-value"
                  style={{ color: PRIORITY_COLOR[selected.priority] || "#374151", fontWeight: 700 }}
                >
                  {selected.priority || "—"}
                </span>
              </div>
              <div>
                <span className="detail-label">Due Date</span>
                <span className="detail-value">
                  {selected.dueDate
                    ? new Date(selected.dueDate).toLocaleDateString()
                    : "—"}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ margin: "14px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                <span>Progress</span>
                <span>{selected.progress || 0}%</span>
              </div>
              <div className="progress-bar">
                <div style={{ width: `${selected.progress || 0}%` }} />
              </div>
            </div>

            {/* ── EMPLOYEE ACTIONS ── */}
            {isEmployee && selected.assignee === userEmail && (
              <div className="action-section">
                {/* Accept / Reject when ASSIGNED */}
                {selected.status === "ASSIGNED" && (
                  <div className="action-row">
                    <button className="btn-success" onClick={() => handleAccept(selected.id)}>
                      ✓ Accept
                    </button>
                    <button className="btn-danger" onClick={() => setShowRejectBox(true)}>
                      ✗ Reject
                    </button>
                  </div>
                )}

                {/* Progress slider when ACCEPTED or IN_PROGRESS */}
                {(selected.status === "ACCEPTED" || selected.status === "IN_PROGRESS") && (
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>
                      Update Progress
                    </label>
                    <input
                      type="range" min="0" max="100"
                      value={selected.progress || 0}
                      onChange={(e) => handleProgress(selected.id, parseInt(e.target.value))}
                      style={{ width: "100%", accentColor: "#2563eb" }}
                    />
                    <button
                      className="btn-primary"
                      style={{ marginTop: 8 }}
                      onClick={() => handleSubmit(selected.id)}
                    >
                      Submit for Approval
                    </button>
                  </div>
                )}

                {/* Reject reason box */}
                {showRejectBox && (
                  <div className="reject-box">
                    <textarea
                      placeholder="Reason for rejection (optional)"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={2}
                    />
                    <div className="action-row">
                      <button className="btn-danger" onClick={() => handleReject(selected.id)}>
                        Confirm Reject
                      </button>
                      <button className="btn-secondary" onClick={() => setShowRejectBox(false)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── MANAGER / ADMIN ACTIONS ── */}
            {canManage && selected.status === "SUBMITTED" && (
              <div className="action-section">
                <p style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>
                  Employee submitted this task for approval.
                </p>
                <div className="action-row">
                  <button className="btn-success" onClick={() => handleApprove(selected.id)}>
                    ✓ Approve
                  </button>
                  <button className="btn-danger" onClick={() => setShowRejectBox(true)}>
                    ↩ Send Back
                  </button>
                </div>
                {showRejectBox && (
                  <div className="reject-box">
                    <textarea
                      placeholder="Reason for sending back"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={2}
                    />
                    <div className="action-row">
                      <button className="btn-danger" onClick={() => handleRejectSubmission(selected.id)}>
                        Confirm
                      </button>
                      <button className="btn-secondary" onClick={() => setShowRejectBox(false)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── TRACKING HISTORY ── */}
            <div className="timeline">
              <h3>Tracking</h3>
              {(!selected.history || selected.history.length === 0) ? (
                <p style={{ fontSize: 13, color: "#94a3b8" }}>No history yet.</p>
              ) : (
                selected.history.map((h, i) => (
                  <div key={i} className="timeline-item">
                    <div className="timeline-dot" />
                    <span>{h}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="task-detail task-detail-empty">
            <p>Select a task to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
