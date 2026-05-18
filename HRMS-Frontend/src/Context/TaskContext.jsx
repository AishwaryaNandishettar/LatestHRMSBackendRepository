import React, { createContext, useState, useCallback } from "react";
import { useContext } from "react";
import { AuthContext } from "./Authcontext";
import { getTasks, createTaskApi, updateTaskApi,getMyTasks, getAllTasksAdmin  } from "../api/taskApi";

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  // ── Fetch all tasks from backend ──
 const fetchTasks = async () => {
  try {
    if (!user) return;

    let res;

    if (user.role?.toLowerCase() === "employee") {
      res = await getMyTasks();   // employee API
    } else {
      res = await getAllTasksAdmin(); // admin/manager API
    }

    console.log("📦 TASK DATA:", res.data);

    setTasks(Array.isArray(res.data) ? res.data : []);
  } catch (err) {
    console.error("❌ TaskContext: fetch error", err);
  }
};

  // ── Create task (manager/admin) ──
  const addTask = async (taskData) => {
    try {
      const res = await createTaskApi(taskData);
      setTasks((prev) => [res.data, ...prev]);
      return res.data;
    } catch (err) {
      console.error("TaskContext: create error", err);
      throw err;
    }
  };

  // ── Update task (any field) ──
  const updateTask = async (id, updates) => {
    try {
      const res = await updateTaskApi(id, updates);
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...res.data } : t))
      );
      return res.data;
    } catch (err) {
      console.error("TaskContext: update error", err);
      throw err;
    }
  };

  return (
    <TaskContext.Provider value={{ tasks, loading, fetchTasks, addTask, updateTask, setTasks }}>
      {children}
    </TaskContext.Provider>
  );
};
