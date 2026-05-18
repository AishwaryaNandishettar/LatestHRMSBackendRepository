import api from "./axios";
import axios from "axios";   // ✅ ADD THIS

const API = import.meta.env.VITE_API_BASE_URL;
export const getEmployeePayroll = (empCode) =>
  api.get(`/api/payroll/employee/${empCode}`);

export const createPayroll = (data) =>
  api.post("/api/payroll/create", data);

export const getPayrollData = () => {
  return api.get("/api/payroll");
};
// ✅ CREATE PAYROLL BATCH (MUST BE HERE)

export const createPayrollBatch = (data) => {
  return api.post("/api/payroll/batch", data);
};

export const processPayroll = (empId) => {
  return api.put(`/api/payroll/process/${empId}`);
};
export const processAllPayroll = () => {
  return api.put("/api/payroll/process-all");
};

// ==================== NEW: REAL-TIME SALARY CALCULATION APIs ====================

/**
 * Calculate salary for a single employee with real-time data
 * @param {Object} request - { employeeId, month, includeAttendance, includeLeave, includePerformance }
 * @returns {Promise} Salary calculation result
 */
export const calculateSalary = (request) => {
  return api.post("/api/payroll/calculate", request);
};

/**
 * Calculate salary for all employees
 * @param {string} month - Month in format "May-2026"
 * @returns {Promise} List of salary calculation results
 */
export const calculateAllSalaries = (month) => {
  return api.post(`/api/payroll/calculate-all?month=${month}`);
};

/**
 * Calculate and apply salary (save to database)
 * @param {Object} request - { employeeId, month, includeAttendance, includeLeave, includePerformance }
 * @returns {Promise} Updated payroll record
 */
export const calculateAndApplySalary = (request) => {
  return api.post("/api/payroll/calculate-and-apply", request);
};

/**
 * Preview salary calculation without saving
 * @param {Object} request - { employeeId, month, includeAttendance, includeLeave, includePerformance }
 * @returns {Promise} Salary calculation preview
 */
export const previewSalaryCalculation = (request) => {
  return api.post("/api/payroll/preview", request);
};