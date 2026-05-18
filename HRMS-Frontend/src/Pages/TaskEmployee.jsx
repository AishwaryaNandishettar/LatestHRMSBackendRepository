import React, { useEffect, useState, useContext } from "react";
import "./TaskEmployee.css";
import { TaskContext } from "../Context/TaskContext";
import { AuthContext } from "../Context/Authcontext";

const EmployeeTaskModule = () => {
  const { tasks, updateTask } = useContext(TaskContext);
  const { user } = useContext(AuthContext);

  const [popupTask, setPopupTask] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

 const myTasks = tasks.filter(
  (t) => t.assignee === user?.email
);

  // 🔔 REAL-TIME POPUP
  useEffect(() => {
    const newTask = myTasks.find((t) => t.status === "NEW");
    if (newTask) setPopupTask(newTask);
  }, [tasks]);

  return (
    
    <div className="emp-container">

        <div className="kpi-row">
  <div className="kpi">
    <h4>Total</h4>
    <p>{tasks.length}</p>
  </div>

  <div className="kpi">
    <h4>Pending</h4>
    <p>{tasks.filter(t => t.status === "NEW").length}</p>
  </div>

  <div className="kpi">
    <h4>In Progress</h4>
    <p>{tasks.filter(t => t.status === "IN_PROGRESS").length}</p>
  </div>

  <div className="kpi">
    <h4>Completed</h4>
    <p>{tasks.filter(t => t.status === "COMPLETED").length}</p>
  </div>
</div>
        
      <h2>My Tasks</h2>



      {/* POPUP */}
      {popupTask && (
        <div className="popup">
          <h3>New Task Assigned</h3>
          <p>{popupTask.title}</p>

          <button onClick={() => {
            updateTask(popupTask.id, { status: "ACCEPTED" }, "Accepted");
            setPopupTask(null);
          }}>
            Accept
          </button>

          <button className="danger" onClick={() => {
            updateTask(
              popupTask.id,
              { status: "REJECTED", reason: rejectReason },
              "Rejected"
            );
            setPopupTask(null);
          }}>
            Reject
          </button>

          <textarea
            placeholder="Reason"
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </div>
      )}

      {/* INBOX */}
      <div className="section">
        <h3>Pending</h3>
        {myTasks.filter(t => t.status === "NEW").map(t => (
          <div key={t.id} className="task-card">{t.title}</div>
        ))}
      </div>

      {/* ACTIVE */}
      <div className="section">
        <h3>Active Tasks</h3>

        {myTasks.filter(t =>
          t.status === "ACCEPTED" || t.status === "IN_PROGRESS"
        ).map(t => (
          <div key={t.id} className="task-card">

            <h4>{t.title}</h4>

            {t.status === "ACCEPTED" && (
              <button onClick={() =>
                updateTask(t.id, { status: "IN_PROGRESS" }, "Started")
              }>
                Start
              </button>
            )}

            {t.status === "IN_PROGRESS" && (
              <>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={t.progress}
                  onChange={(e) =>
                    updateTask(
                      t.id,
                      { progress: Number(e.target.value) },
                      "Progress Updated"
                    )
                  }
                />

                <textarea
                  placeholder="Remarks"
                  onChange={(e) =>
                    updateTask(t.id, { remarks: e.target.value }, "Remarks Added")
                  }
                />

                <button onClick={() =>
                  updateTask(t.id, { status: "COMPLETED" }, "Completed")
                }>
                  Submit
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeTaskModule;