// api/resignationApi.js
import api from "./axios";

// ✅ SUBMIT RESIGNATION
export const submitResignation = async (resignationData) => {
  const response = await api.post("/api/resignation/submit", resignationData);
  return response.data;
};

// ✅ GET RESIGNATIONS BY EMPLOYEE
export const getResignationsByEmployee = async (empId) => {
  const response = await api.get(`/api/resignation/${empId}`);
  return response.data;
};

// ✅ UPDATE RESIGNATION STATUS
export const updateResignationStatus = async (id, status) => {
  const response = await api.put(`/api/resignation/status/${id}`, null, {
    params: { status }
  });
  return response.data;
};

// ✅ GET ALL RESIGNATIONS (FOR ADMIN/MANAGER)
export const getAllResignations = async () => {
  const response = await api.get("/api/resignation/all");
  return response.data;
};

// ✅ GET RESIGNATIONS FOR MANAGER APPROVAL (PENDING ONLY)
export const getResignationsForApproval = async (managerEmail) => {
  const response = await api.get("/api/resignation/pending-manager", {
    params: { managerEmail }
  });
  return response.data;
};

// ✅ GET ALL RESIGNATIONS FOR A MANAGER (ALL STATUSES - for tracking table)
export const getAllResignationsByManager = async (managerEmail) => {
  const response = await api.get("/api/resignation/by-manager", {
    params: { managerEmail }
  });
  return response.data;
};

// ✅ GET RESIGNATIONS FOR HR APPROVAL
export const getResignationsForHRApproval = async () => {
  const response = await api.get("/api/resignation/pending-hr");
  return response.data;
};

// ✅ APPROVE RESIGNATION (MANAGER OR HR)
export const approveResignation = async (id, approverName) => {
  const response = await api.post(`/api/resignation/approve/${id}`, null, {
    params: { approverName }
  });
  return response.data;
};

// ✅ REJECT RESIGNATION (MANAGER OR HR)
export const rejectResignation = async (id, rejectionReason) => {
  const response = await api.post(`/api/resignation/reject/${id}`, null, {
    params: { rejectionReason }
  });
  return response.data;
};
