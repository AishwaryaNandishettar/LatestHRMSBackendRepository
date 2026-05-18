import api from "./axios"; // ✅ use authenticated axios

const BASE_URL = "/api/tasks";

export const getTasks = () => api.get(BASE_URL);
export const getMyTasks = () => api.get(`${BASE_URL}/my`);
export const getAllTasksAdmin = () => api.get(`${BASE_URL}`);
export const createTaskApi = (task) => api.post(BASE_URL, task);

export const updateTaskApi = (id, data) =>
  api.put(`${BASE_URL}/${id}`, data);

export const acceptTaskApi = (id) =>
  api.put(`${BASE_URL}/${id}/accept`);

export const rejectTaskApi = (id, reason) =>
  api.put(`${BASE_URL}/${id}/reject`, { rejectReason: reason });

export const submitTaskApi = (id) =>
  api.put(`${BASE_URL}/${id}/submit`);

export const updateProgressApi = (id, progress) =>
  api.put(`${BASE_URL}/${id}/progress`, { progress });

export const approveTaskApi = (id) =>
  api.put(`${BASE_URL}/${id}/approve`);

export const rejectSubmissionApi = (id, reason) =>
  api.put(`${BASE_URL}/${id}/reject-submission`, { rejectReason: reason });

