import api from "./axios";

export const getTimesheet = async (month) => {
  const res = await api.get(`/api/timesheet/monthly?month=${month}`);
  return res.data;
};

export const submitTimesheet = async (timesheetData) => {
  const res = await api.post(`/api/timesheet/submit`, timesheetData);
  return res.data;
};

export const approveTimesheet = async (empId, month) => {
  const res = await api.put(
    `/api/timesheet/approve?empId=${empId}&month=${month}`
  );
  return res.data;
};