import api from "./axios";

const BASE_URL = "/api/leave";

// Apply Leave
export const applyLeave = (data) => {
  return api.post(`${BASE_URL}/apply`, data);
};

// Get My Leaves
export const getMyLeaves = (userId) => {
  console.log("🔍 getMyLeaves called with userId:", userId);
  const response = api.get(`${BASE_URL}/my/${userId}`);
  console.log("🔍 getMyLeaves API response:", response);
  return response;
};

// Get All Leaves (used earlier)
export const getLeaves = () => {
  console.log("🔍 getLeaves called");
  const response = api.get(`${BASE_URL}/all`);
  console.log("🔍 getLeaves API response:", response);
  return response;
};

export const getManagerLeaves = (email) => {
  return api.get(`/api/leave/manager-leaves?managerEmail=${email}`);
};

// Get All Leaves (duplicate but keeping as you used it)
export const getAllLeaves = () => {
  return api.get(`${BASE_URL}/all`);
};

// Update Leave Status
export const updateLeaveStatus = (id, status) =>
  api.put(`/api/leave/${id}/status?status=${status}`);