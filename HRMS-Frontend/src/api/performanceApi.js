import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/performance`;

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/** Fetch performance record for a single employee */
export const getPerformanceByEmployee = async (empId) => {
  const res = await axios.get(`${BASE_URL}/${empId}`, { headers: authHeaders() });
  return res.data;
};

/** Fetch all performance records (admin / manager) */
export const getAllPerformance = async () => {
  const res = await axios.get(BASE_URL, { headers: authHeaders() });
  return res.data;
};

/** Get manager's team members (uses User collection — reliable) */
export const getMyTeam = async () => {
  const res = await axios.get(`${BASE_URL}/my-team`, { headers: authHeaders() });
  return res.data;
};

/** Get the logged-in employee's correct employeeId */
export const getMyEmployeeId = async () => {
  const res = await axios.get(`${BASE_URL}/my-employee-id`, { headers: authHeaders() });
  return res.data;
};

/** Save / upsert a performance record */
export const savePerformance = async (data) => {
  const res = await axios.post(BASE_URL, data, { headers: authHeaders() });
  return res.data;
};

/** Seed sample performance data for testing */
export const seedPerformanceData = async () => {
  const res = await axios.post(`${BASE_URL}/seed`, {}, { headers: authHeaders() });
  return res.data;
};

/** Debug employee data */
export const debugEmployeeData = async () => {
  const res = await axios.get(`${BASE_URL}/debug`, { headers: authHeaders() });
  return res.data;
};
