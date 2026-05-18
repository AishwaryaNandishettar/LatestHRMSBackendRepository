// api/employeeApi.js
import api from "./axios";

// ✅ GET ALL EMPLOYEES
export const getAllEmployees = async () => {
  const response = await api.get("/api/employee/all");
  console.log("🔍 getAllEmployees API response:", response);
  return response.data;
};

// ✅ GET BIRTHDAYS (ONLY THIS ONE KEEP)
export const getBirthdays = async () => {
  const response = await api.get("/api/employee/birthdays/current-month");
  console.log("🔍 getBirthdays API response:", response);
  return response.data;
};


export const fetchEmployeesAsUsers = async () => {
  const response = await api.get("/api/employee/as-users");
  return response.data;
};

export const fetchAllParticipants = async () => {
  const response = await api.get("/api/employee/participants");
  return response.data;
};

export const searchParticipants = async (query) => {
  const response = await api.get("/api/employee/participants/search", {
    params: { query: query || "" }
  });
  return response.data;
};

export const fetchAllEmployees = async () => {
  const response = await api.get("/api/employee/all");
  return response.data;
};

// ✅ UPDATE EMPLOYEE
export const updateEmployee = async (employeeId, employeeData) => {
  const response = await api.put(`/api/employee/update/${employeeId}`, employeeData);
  console.log("🔍 updateEmployee API response:", response);
  return response.data;
};
