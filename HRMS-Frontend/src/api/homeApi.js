import api from "./axios"; // ✅ Use configured axios instance

export const getHomeData = async (email) => {
  const res = await api.get(`/api/home?email=${email}`);
  return res.data;
};

export const fetchHomeData = async (email) => {
  const res = await api.get(`/api/home/me?email=${email}`);
  return res.data;
};

export const getEventById = async (id) => {
  const res = await api.get(`/api/events/${id}`);
  return res.data;
};
