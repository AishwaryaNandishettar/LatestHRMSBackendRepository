import api from "./axios";

const BASE_URL = "/api/notifications";

// Get all notifications for the logged-in user
export const getNotifications = async () => {
  const res = await api.get(BASE_URL);
  return res.data;
};

// Mark notification as read
export const markAsRead = async (id) => {
  const res = await api.put(`${BASE_URL}/${id}/read`);
  return res.data;
};

// Create a new notification
export const createNotification = async (notification) => {
  const res = await api.post(BASE_URL, notification);
  return res.data;
};

// Delete a notification
export const deleteNotification = async (id) => {
  const res = await api.delete(`${BASE_URL}/${id}`);
  return res.data;
};

// Get unread count
export const getUnreadCount = async () => {
  const res = await api.get(`${BASE_URL}/unread/count`);
  return res.data;
};
