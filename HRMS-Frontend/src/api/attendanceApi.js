import api from "./axios";

/* ================= CHECK IN ================= */
export const checkIn = async (record) => {
  return api.post("/api/attendance/checkin", record);
};

/* ================= CHECK OUT ================= */
export const checkOut = async (record) => {
  return api.post("/api/attendance/checkout", record);
};

/* ================= GET MY ATTENDANCE ================= */
export const getMyAttendance = async (empId) => {
  const res = await api.get(`/api/attendance/my/${empId}`);
  return res.data;   // ✅ FIXED
};

/* ================= MANAGER ATTENDANCE ================= */
export const getManagerAttendance = async (email) => {
  const res = await api.get(`/api/attendance/manager?email=${email}`);
  return res.data;
};

/* ================= MANAGER APPROVAL ================= */
export const approveAttendance = async (empId, date) => {
  const res = await api.put("/api/attendance/approve", { empId, date });
  return res.data;   // ✅ FIXED
};

/* ================= MANAGER CUSTOM MARK ================= */
export const managerMarkAttendance = async (record) => {
  return api.post("/api/attendance/manager-mark", record)
    .then(res => res.data);
};

/* ================= GET ALL ================= */
export const getAllAttendance = async () => {
  const res = await api.get("/api/attendance/all");
  return res.data;
};